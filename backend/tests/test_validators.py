import tempfile
from pathlib import Path

import pytest

from app.domain.formats.xlsx_writer import XlsxWriter
from app.domain.generators.registry import get_generator
from app.domain.validators.number_validator import (
    ExportVerificationError,
    is_valid_export_value,
    is_valid_national_number,
    normalize_export_value,
    verify_xlsx_export,
)


def test_normalize_export_value_strips_tab_prefix():
    assert normalize_export_value("\t+919876543210") == "+919876543210"


def test_india_national_number_validation():
    assert is_valid_national_number("9876543210", length=10, valid_prefixes=["6", "7", "8", "9"])
    assert not is_valid_national_number("8", length=10, valid_prefixes=["6", "7", "8", "9"])
    assert not is_valid_national_number("", length=10, valid_prefixes=["6", "7", "8", "9"])


def test_export_value_validation_with_country_code():
    assert is_valid_export_value(
        "+919876543210",
        length=10,
        dial_code="+91",
        valid_prefixes=["6", "7", "8", "9"],
        include_country_code=True,
    )
    assert not is_valid_export_value(
        "8",
        length=10,
        dial_code="+91",
        valid_prefixes=["6", "7", "8", "9"],
        include_country_code=True,
    )


def test_xlsx_export_verification_passes_for_valid_file():
    generator = get_generator("IN")
    quantity = 20
    numbers, _ = generator.generate_batch(quantity, 0, "random")
    formatter = lambda n: generator.format_number(n, False)

    with tempfile.TemporaryDirectory() as tmp:
        temp = Path(tmp) / "out.tmp.xlsx"
        final = Path(tmp) / "out.xlsx"
        writer = XlsxWriter(
            temp_path=temp,
            final_path=final,
            column_name="Number",
            include_serial=True,
            formatter=formatter,
        )
        writer.write_rows(numbers, 1)
        writer.finalize()

        result = verify_xlsx_export(
            final,
            expected_count=quantity,
            include_serial=True,
            length=generator.length,
            dial_code=generator.dial_code,
            valid_prefixes=generator.valid_prefixes,
            include_country_code=False,
        )
        assert result["row_count"] == quantity


def test_xlsx_export_verification_detects_duplicate():
    generator = get_generator("IN")

    with tempfile.TemporaryDirectory() as tmp:
        temp = Path(tmp) / "out.tmp.xlsx"
        final = Path(tmp) / "out.xlsx"
        writer = XlsxWriter(
            temp_path=temp,
            final_path=final,
            column_name="Number",
            include_serial=False,
            formatter=lambda n: n,
        )
        writer.write_rows(["9876543210", "9876543210"], 1)
        writer.finalize()

        with pytest.raises(ExportVerificationError, match="Duplicate"):
            verify_xlsx_export(
                final,
                expected_count=2,
                include_serial=False,
                length=generator.length,
                dial_code=generator.dial_code,
                valid_prefixes=generator.valid_prefixes,
                include_country_code=False,
            )
