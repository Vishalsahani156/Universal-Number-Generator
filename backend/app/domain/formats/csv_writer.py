import csv
import hashlib
import os
from collections.abc import Callable
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Protocol


class FileWriter(Protocol):
    def write_rows(self, rows: list[str], start_serial: int) -> int: ...
    def finalize(self) -> dict[str, Any]: ...
    def cleanup(self) -> None: ...


class CsvWriter:
    def __init__(
        self,
        *,
        temp_path: Path,
        final_path: Path,
        column_name: str,
        columns: list[dict[str, str]] | None = None,
        include_serial: bool,
        formatter: Callable[[str], str],
    ) -> None:
        self._temp_path = temp_path
        self._final_path = final_path
        self._formatter = formatter
        self._include_serial = include_serial
        self._columns = columns or [{"header": column_name, "static_value": ""}]
        self._row_count = 0
        self._file = temp_path.open(
            "w",
            newline="",
            encoding="utf-8-sig",
            buffering=1024 * 1024,
        )
        self._writer = csv.writer(
            self._file,
            quoting=csv.QUOTE_ALL,
            lineterminator="\n",
        )
        header = []
        if include_serial:
            header.append("S.No")
        for col in self._columns:
            header.append(col["header"])
        self._writer.writerow(header)
        self._serial = 1

    def _format_cell_value(self, number: str) -> str:
        value = self._formatter(number)
        if not value:
            raise ValueError("Formatter returned an empty phone number")
        # Leading tab prevents spreadsheet apps from coercing values to numbers.
        return f"\t{value}"

    def write_rows(self, rows: list[str], start_serial: int) -> int:
        if not rows:
            return start_serial

        self._serial = start_serial
        formatted = [self._format_cell_value(number) for number in rows]

        data = []
        for index, number_value in enumerate(formatted):
            row = []
            if self._include_serial:
                row.append(start_serial + index)
            for col_index, col in enumerate(self._columns):
                if col_index == 0:
                    row.append(number_value)
                else:
                    row.append(col.get("static_value", "") or "")
            data.append(row)
        self._serial = start_serial + len(rows)
        self._writer.writerows(data)

        self._row_count += len(rows)
        return self._serial

    def finalize(self) -> dict[str, Any]:
        self._file.close()
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
            "row_count": self._row_count,
        }

    def cleanup(self) -> None:
        if not self._file.closed:
            self._file.close()
        if self._temp_path.exists():
            self._temp_path.unlink()
