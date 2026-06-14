import hashlib
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from openpyxl import Workbook

from app.config import get_settings


class XlsxWriter:
    def __init__(
        self,
        *,
        temp_path: Path,
        final_path: Path,
        column_name: str,
        include_serial: bool,
        formatter,
        max_rows: int | None = None,
    ) -> None:
        settings = get_settings()
        self._max_rows = max_rows or settings.xlsx_max_rows
        self._temp_path = temp_path
        self._final_path = final_path
        self._formatter = formatter
        self._include_serial = include_serial
        self._column_name = column_name
        self._workbook = Workbook(write_only=True)
        self._sheet = self._workbook.create_sheet("numbers")
        header = []
        if include_serial:
            header.append("S.No")
        header.append(column_name)
        self._sheet.append(header)
        self._serial = 1
        self._row_count = 1

    def write_rows(self, rows: list[str], start_serial: int) -> int:
        self._serial = start_serial
        for number in rows:
            if self._row_count >= self._max_rows:
                raise ValueError(f"XLSX row limit exceeded ({self._max_rows})")
            row = []
            if self._include_serial:
                row.append(self._serial)
                self._serial += 1
            row.append(self._formatter(number))
            self._sheet.append(row)
            self._row_count += 1
        return self._serial

    def finalize(self) -> dict[str, Any]:
        self._workbook.save(self._temp_path)
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
        }

    def cleanup(self) -> None:
        if self._temp_path.exists():
            self._temp_path.unlink()
