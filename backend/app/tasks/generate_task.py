import math
from datetime import datetime, timezone

from app.config import get_settings
from app.database import get_sync_db
from app.domain.formats.csv_writer import CsvWriter
from app.domain.formats.pdf_writer import PdfWriter
from app.domain.formats.xlsx_writer import XlsxWriter
from app.domain.generators.batch_collector import BatchCollector
from app.domain.generators.dummy_generator import generate_dummy_value
from app.domain.generators.registry import get_generator
from app.domain.validators.number_validator import (
    ExportVerificationError,
    verify_csv_export,
    verify_xlsx_export,
)
from app.repositories.jobs_repo import JobsRepository
from app.tasks.celery_app import celery_app


def enqueue_generate_task(job_id: str) -> str:
    result = celery_app.send_task(
        "app.tasks.generate_task.generate_numbers",
        args=[job_id],
        queue="generation",
    )
    return result.id


@celery_app.task(name="app.tasks.generate_task.generate_numbers", bind=True)
def generate_numbers(self, job_id: str) -> None:
    run_generate_job(job_id)


def run_generate_job(job_id: str) -> None:
    settings = get_settings()
    db = get_sync_db()
    jobs_repo = JobsRepository(db)
    job = jobs_repo.find_by_id_sync(job_id)

    if not job or job["status"] != "queued":
        return

    jobs_repo.update_status_sync(
        job_id,
        "processing",
        started_at=datetime.now(timezone.utc),
    )

    export_format = job["export_format"]
    export_options = job["export_options"]
    quantity = job["quantity"]
    mode = job["generation_mode"]
    chunk_size = settings.chunk_size
    total_chunks = math.ceil(quantity / chunk_size)

    job_dir = settings.exports_dir / job_id
    job_dir.mkdir(parents=True, exist_ok=True)
    temp_path = job_dir / f"output.tmp.{export_format}"
    final_path = job_dir / f"output.{export_format}"

    generator = get_generator(job["country_code"])
    include_country_code = export_options.get("include_country_code", False)
    include_serial = export_options.get("include_serial", False)
    formatter = lambda n: generator.format_number(n, include_country_code)  # noqa: E731
    collector = BatchCollector(generator, mode)

    raw_columns = export_options.get("columns") or [
        {"header": export_options["column_name"], "static_value": ""}
    ]
    raw_extra = export_options.get("extra_fields") or []
    columns = list(raw_columns)
    dynamic_extra_indices: list[int] = []
    for ef in raw_extra:
        label = (ef.get("label") or ef.get("key") or "").strip()
        value = (ef.get("value") or "").strip()
        if not label and not value and not ef.get("generate_different"):
            continue
        columns.append({
            "header": label or "field",
            "static_value": value or "",
        })
        if ef.get("generate_different"):
            dynamic_extra_indices.append(len(columns) - 1)

    writer = None
    try:
        if export_format == "csv":
            writer = CsvWriter(
                temp_path=temp_path,
                final_path=final_path,
                column_name=export_options["column_name"],
                columns=columns,
                include_serial=include_serial,
                formatter=formatter,
            )
        elif export_format == "pdf":
            writer = PdfWriter(
                temp_path=temp_path,
                final_path=final_path,
                column_name=export_options["column_name"],
                columns=columns,
                include_serial=include_serial,
                formatter=formatter,
            )
        else:
            writer = XlsxWriter(
                temp_path=temp_path,
                final_path=final_path,
                column_name=export_options["column_name"],
                columns=columns,
                include_serial=include_serial,
                formatter=formatter,
            )

        generated = 0
        serial = 1
        start_time = datetime.now(timezone.utc)
        progress_interval = max(1, total_chunks // 20)

        for chunk_index in range(total_chunks):
            if jobs_repo.is_cancelled_sync(job_id):
                writer.cleanup()
                if temp_path.exists():
                    temp_path.unlink()
                return

            remaining = quantity - generated
            batch_size = min(chunk_size, remaining)
            batch = collector.collect(batch_size)
            if len(batch) != batch_size:
                raise RuntimeError(
                    f"Batch collector returned {len(batch):,} numbers, expected {batch_size:,}"
                )

            batch_extra_values = []
            for i in range(len(batch)):
                row_values = []
                for ef in raw_extra:
                    if ef.get("generate_different"):
                        row_values.append(
                            generate_dummy_value(ef.get("label", ""), serial + i)
                        )
                    else:
                        row_values.append(ef.get("value", ""))
                batch_extra_values.append(row_values)

            serial = writer.write_rows(batch, serial, batch_extra_values)
            generated += len(batch)

            if (
                chunk_index % progress_interval == 0
                or chunk_index == total_chunks - 1
            ):
                percent = (generated / quantity) * 100
                elapsed = (datetime.now(timezone.utc) - start_time).total_seconds()
                eta = None
                if generated > 0 and percent < 100:
                    rate = generated / max(elapsed, 1)
                    eta = int((quantity - generated) / rate)
                jobs_repo.update_progress_sync(
                    job_id,
                    generated,
                    percent,
                    chunk_index + 1,
                    total_chunks,
                    eta,
                )

        if generated != quantity:
            raise RuntimeError(
                f"Generated {generated:,} numbers but expected {quantity:,}"
            )
        if collector.collected_count != quantity:
            raise RuntimeError(
                f"Collector tracked {collector.collected_count:,} unique numbers, "
                f"expected {quantity:,}"
            )

        file_meta = writer.finalize()
        if file_meta.get("row_count") != quantity:
            raise RuntimeError(
                f"Writer recorded {file_meta.get('row_count')} rows, expected {quantity:,}"
            )

        verification_kwargs = {
            "expected_count": quantity,
            "include_serial": include_serial,
            "length": generator.length,
            "dial_code": generator.dial_code,
            "valid_prefixes": generator.valid_prefixes,
            "include_country_code": include_country_code,
        }
        if export_format == "csv":
            verify_csv_export(final_path, **verification_kwargs)
        elif export_format == "xlsx":
            verify_xlsx_export(final_path, **verification_kwargs)

        jobs_repo.mark_completed_sync(job_id, export_format, file_meta)

    except (ExportVerificationError, Exception) as exc:
        if writer:
            writer.cleanup()
        if temp_path.exists():
            temp_path.unlink()
        if final_path.exists():
            final_path.unlink()
        jobs_repo.mark_failed_sync(job_id, str(exc))
        raise
