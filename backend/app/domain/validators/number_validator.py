import csv
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any


class ExportVerificationError(Exception):
    """Raised when exported data fails final validation."""


def normalize_export_value(value: str) -> str:
    """Strip Excel text-forcing prefix added during CSV export."""
    if value.startswith("\t"):
        return value[1:]
    return value


def is_valid_national_number(number: str, *, length: int, valid_prefixes: list[str]) -> bool:
    if not number or not isinstance(number, str):
        return False
    if not number.isdigit() or len(number) != length:
        return False
    return any(number.startswith(prefix) for prefix in valid_prefixes)


def is_valid_export_value(
    value: str,
    *,
    length: int,
    dial_code: str,
    valid_prefixes: list[str],
    include_country_code: bool,
) -> bool:
    if value is None:
        return False
    normalized = normalize_export_value(str(value).strip())
    if not normalized:
        return False

    if include_country_code:
        if not normalized.startswith(dial_code):
            return False
        national = normalized[len(dial_code) :]
    else:
        national = normalized

    return is_valid_national_number(
        national,
        length=length,
        valid_prefixes=valid_prefixes,
    )


def verify_csv_export(
    path: Path,
    *,
    expected_count: int,
    include_serial: bool,
    length: int,
    dial_code: str,
    valid_prefixes: list[str],
    include_country_code: bool,
) -> dict[str, Any]:
    seen: set[str] = set()
    row_count = 0

    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.reader(handle)
        header = next(reader, None)
        if header is None:
            raise ExportVerificationError("Export file is empty")

        for row in reader:
            if not row or all(not cell.strip() for cell in row):
                raise ExportVerificationError(f"Empty row at line {row_count + 2}")

            if include_serial:
                if len(row) < 2:
                    raise ExportVerificationError(
                        f"Row {row_count + 2} is missing the number column"
                    )
                value = row[1]
            else:
                value = row[0]

            normalized = normalize_export_value(value.strip())
            if not is_valid_export_value(
                normalized,
                length=length,
                dial_code=dial_code,
                valid_prefixes=valid_prefixes,
                include_country_code=include_country_code,
            ):
                raise ExportVerificationError(
                    f"Invalid number at row {row_count + 2}: {value!r}"
                )

            if normalized in seen:
                raise ExportVerificationError(
                    f"Duplicate number at row {row_count + 2}: {normalized!r}"
                )

            seen.add(normalized)
            row_count += 1

    if row_count != expected_count:
        raise ExportVerificationError(
            f"Expected {expected_count:,} rows but found {row_count:,}"
        )

    return {"row_count": row_count, "unique_count": len(seen)}


def verify_xlsx_export(
    path: Path,
    *,
    expected_count: int,
    include_serial: bool,
    length: int,
    dial_code: str,
    valid_prefixes: list[str],
    include_country_code: bool,
) -> dict[str, Any]:
    seen: set[str] = set()
    row_count = 0
    ns = {"main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
    value_col = 1 if include_serial else 0

    with zipfile.ZipFile(path) as archive:
        with archive.open("xl/worksheets/sheet1.xml") as sheet:
            for _event, elem in ET.iterparse(sheet, events=("end",)):
                if elem.tag != f"{{{ns['main']}}}row":
                    continue

                row_index = int(elem.get("r", "0"))
                if row_index <= 1:
                    elem.clear()
                    continue

                cells: dict[int, str] = {}
                for cell in elem.findall("main:c", ns):
                    ref = cell.get("r", "")
                    col = _xlsx_column_index(ref)
                    inline = cell.find("main:is/main:t", ns)
                    value_node = cell.find("main:v", ns)
                    if inline is not None and inline.text is not None:
                        cells[col] = inline.text
                    elif value_node is not None and value_node.text is not None:
                        cells[col] = value_node.text

                if not cells:
                    raise ExportVerificationError(f"Empty row at Excel row {row_index}")

                value = cells.get(value_col, "").strip()
                normalized = normalize_export_value(value)
                if not is_valid_export_value(
                    normalized,
                    length=length,
                    dial_code=dial_code,
                    valid_prefixes=valid_prefixes,
                    include_country_code=include_country_code,
                ):
                    raise ExportVerificationError(
                        f"Invalid number at Excel row {row_index}: {value!r}"
                    )

                if normalized in seen:
                    raise ExportVerificationError(
                        f"Duplicate number at Excel row {row_index}: {normalized!r}"
                    )

                seen.add(normalized)
                row_count += 1
                elem.clear()

    if row_count != expected_count:
        raise ExportVerificationError(
            f"Expected {expected_count:,} rows but found {row_count:,}"
        )

    return {"row_count": row_count, "unique_count": len(seen)}


def _xlsx_column_index(cell_ref: str) -> int:
    letters = "".join(ch for ch in cell_ref if ch.isalpha())
    index = 0
    for char in letters:
        index = index * 26 + (ord(char.upper()) - ord("A") + 1)
    return index - 1
