import hashlib
import os
from collections.abc import Callable
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import xlsxwriter

from app.config import get_settings


class XlsxWriter:
    def __init__(
        self,
        *,
        temp_path: Path,
        final_path: Path,
        column_name: str,
        columns: list[dict[str, str]] | None = None,
        include_serial: bool,
        formatter: Callable[[str], str],
        max_rows: int | None = None,
    ) -> None:
        settings = get_settings()
        self._max_rows = max_rows or settings.xlsx_max_rows
        self._temp_path = temp_path
        self._final_path = final_path
        self._formatter = formatter
        self._include_serial = include_serial
        self._columns = columns or [{"header": column_name, "static_value": ""}]
        self._workbook = xlsxwriter.Workbook(
            str(temp_path),
            {"constant_memory": True, "strings_to_numbers": False},
        )
        self._sheet = self._workbook.add_worksheet("numbers")
        self._text_format = self._workbook.add_format({"num_format": "@"})
        col_cursor = 0
        if include_serial:
            self._sheet.write(0, 0, "S.No")
            col_cursor = 1
        for col in self._columns:
            self._sheet.write(0, col_cursor, col["header"])
            col_cursor += 1
        self._next_row = 1
        self._serial = 1
        self._row_count = 1
        self._data_row_count = 0
        self._closed = False

    def write_rows(self, rows: list[str], start_serial: int) -> int:
        if not rows:
            return start_serial

        if self._row_count + len(rows) > self._max_rows:
            raise ValueError(f"XLSX row limit exceeded ({self._max_rows})")

        formatted = []
        for number in rows:
            value = self._formatter(number)
            if not value:
                raise ValueError("Formatter returned an empty phone number")
            formatted.append(value)

        row_start = self._next_row
        count = len(rows)

        for index, number_value in enumerate(formatted):
            row = row_start + index
            col_cursor = 0
            if self._include_serial:
                self._sheet.write_number(row, 0, start_serial + index)
                col_cursor = 1
            for col_index, col in enumerate(self._columns):
                if col_index == 0:
                    self._sheet.write_string(row, col_cursor, number_value, self._text_format)
                else:
                    val = col.get("static_value", "") or ""
                    self._sheet.write_string(row, col_cursor, val, self._text_format)
                col_cursor += 1

        self._next_row += count
        self._row_count += count
        self._data_row_count += count
        self._serial = start_serial + count
        return self._serial

    def finalize(self) -> dict[str, Any]:
        self._workbook.close()
        self._closed = True
        os.replace(self._temp_path, self._final_path)
        sha256 = hashlib.sha256()
        with self._final_path.open("rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                sha256.update(chunk)
        stat = self._final_path.stat()
        return {
            "path": str(self._final_path),
            "size_bytes": stat.st_size,
            "sha256": sha256.hexdigest(),
            "created_at": datetime.now(timezone.utc),
            "row_count": self._data_row_count,
        }

    def cleanup(self) -> None:
        if not self._closed:
            try:
                self._workbook.close()
            except Exception:
                pass
            self._closed = True
        if self._temp_path.exists():
            self._temp_path.unlink()
