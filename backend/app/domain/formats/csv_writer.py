import csv
import hashlib
import os
from pathlib import Path
from typing import Any, Callable, Protocol


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
        include_serial: bool,
        formatter: Callable[[str], str],
    ) -> None:
        self._temp_path = temp_path
        self._final_path = final_path
        self._formatter = formatter
        self._include_serial = include_serial
        self._file = temp_path.open(
            "w",
            newline="",
            encoding="utf-8",
            buffering=1024 * 1024,
        )
        self._writer = csv.writer(self._file)
        header = []
        if include_serial:
            header.append("S.No")
        header.append(column_name)
        self._writer.writerow(header)
        self._serial = 1

    def write_rows(self, rows: list[str], start_serial: int) -> int:
        if not rows:
            return start_serial

        self._serial = start_serial
        formatted = [self._formatter(number) for number in rows]

        if self._include_serial:
            data = [
                [start_serial + index, value]
                for index, value in enumerate(formatted)
            ]
            self._serial = start_serial + len(rows)
            self._writer.writerows(data)
        else:
            self._writer.writerows([[value] for value in formatted])

        return self._serial

    def finalize(self) -> dict[str, Any]:
        self._file.close()
        os.replace(self._temp_path, self._final_path)
        sha256 = hashlib.sha256()
        with self._final_path.open("rb") as f:
            for chunk in iter(lambda: f.read(1024 * 1024), b""):
                sha256.update(chunk)
        stat = self._final_path.stat()
        from datetime import datetime, timezone

        return {
            "path": str(self._final_path),
            "size_bytes": stat.st_size,
            "sha256": sha256.hexdigest(),
            "created_at": datetime.now(timezone.utc),
        }

    def cleanup(self) -> None:
        if not self._file.closed:
            self._file.close()
        if self._temp_path.exists():
            self._temp_path.unlink()
