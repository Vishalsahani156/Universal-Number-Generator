import csv
import tempfile
from pathlib import Path

from app.domain.formats.csv_writer import CsvWriter
from app.domain.generators.registry import get_generator
from app.domain.validators.number_validator import verify_csv_export


def test_csv_writer_quotes_all_phone_values():
    generator = get_generator("IN")
    numbers, _ = generator.generate_batch(5, 0, "random")
    formatter = lambda n: generator.format_number(n, True)

    with tempfile.TemporaryDirectory() as tmp:
        temp = Path(tmp) / "out.tmp.csv"
        final = Path(tmp) / "out.csv"
        writer = CsvWriter(
            temp_path=temp,
            final_path=final,
            column_name="Number",
            include_serial=True,
            formatter=formatter,
        )
        writer.write_rows(numbers, 1)
        meta = writer.finalize()

        raw = final.read_text(encoding="utf-8-sig")
        assert meta["row_count"] == 5
        for line in raw.splitlines()[1:]:
            assert '","+91' in line or line.endswith('"\r') or line.endswith('"')

        reader = csv.reader(raw.splitlines())
        next(reader)
        for row in reader:
            assert row[1].startswith("\t+91")
            assert len(row[1]) == 14


def test_csv_export_verification_passes_for_valid_file():
    generator = get_generator("IN")
    quantity = 25
    numbers, _ = generator.generate_batch(quantity, 0, "random")
    formatter = lambda n: generator.format_number(n, True)

    with tempfile.TemporaryDirectory() as tmp:
        temp = Path(tmp) / "out.tmp.csv"
        final = Path(tmp) / "out.csv"
        writer = CsvWriter(
            temp_path=temp,
            final_path=final,
            column_name="Number",
            include_serial=True,
            formatter=formatter,
        )
        writer.write_rows(numbers, 1)
        writer.finalize()

        result = verify_csv_export(
            final,
            expected_count=quantity,
            include_serial=True,
            length=generator.length,
            dial_code=generator.dial_code,
            valid_prefixes=generator.valid_prefixes,
            include_country_code=True,
        )
        assert result["row_count"] == quantity
        assert result["unique_count"] == quantity


def test_csv_export_verification_rejects_single_digit_values():
    generator = get_generator("IN")

    with tempfile.TemporaryDirectory() as tmp:
        final = Path(tmp) / "bad.csv"
        final.write_text('"S.No","Number"\n1,"\t8"\n', encoding="utf-8-sig")

        try:
            verify_csv_export(
                final,
                expected_count=1,
                include_serial=True,
                length=generator.length,
                dial_code=generator.dial_code,
                valid_prefixes=generator.valid_prefixes,
                include_country_code=True,
            )
        except Exception as exc:
            assert "Invalid number" in str(exc)
        else:
            raise AssertionError("Expected invalid number verification failure")
