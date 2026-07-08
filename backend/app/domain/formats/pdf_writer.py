import hashlib
import os
from collections.abc import Callable
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fpdf import FPDF


class PdfWriter:
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
        self._pdf = FPDF()
        self._pdf.set_auto_page_break(auto=True, margin=20)
        self._add_page()
        self._serial = 1

    def _add_page(self) -> None:
        self._pdf.add_page()
        self._pdf.set_font("Courier", size=8)
        self._write_header()

    def _write_header(self) -> None:
        headers = []
        if self._include_serial:
            headers.append("S.No")
        for col in self._columns:
            headers.append(col["header"])
        col_widths = self._compute_col_widths(headers)
        for i, h in enumerate(headers):
            self._pdf.cell(col_widths[i], 8, h, border=1, align="C")
        self._pdf.ln()

    def _compute_col_widths(self, headers: list[str]) -> list[int]:
        page_w = self._pdf.w - 2 * self._pdf.l_margin
        n = len(headers)
        min_w = 15
        label_w = [max(min_w, len(h) * 4 + 4) for h in headers]
        total = sum(label_w)
        if total > page_w:
            scale = page_w / total
            return [max(int(w * scale), min_w) for w in label_w]
        return label_w

    def _format_cell_value(self, number: str) -> str:
        value = self._formatter(number)
        if not value:
            raise ValueError("Formatter returned an empty phone number")
        return value

    def write_rows(self, rows: list[str], start_serial: int) -> int:
        if not rows:
            return start_serial

        self._serial = start_serial
        formatted = [self._format_cell_value(number) for number in rows]
        headers = []
        if self._include_serial:
            headers.append("S.No")
        for col in self._columns:
            headers.append(col["header"])
        col_widths = self._compute_col_widths(headers)

        for index, number_value in enumerate(formatted):
            if self._pdf.get_y() > self._pdf.h - 30:
                self._add_page()

            row_data = []
            if self._include_serial:
                row_data.append(str(start_serial + index))
            for col_index, col in enumerate(self._columns):
                if col_index == 0:
                    row_data.append(number_value)
                else:
                    row_data.append(col.get("static_value", "") or "")

            max_lines = 1
            cell_texts = []
            for i, text in enumerate(row_data):
                w = col_widths[i]
                lines = self._pdf.multi_cell(w, 6, text, split_only=True)
                if len(lines) > max_lines:
                    max_lines = len(lines)
                cell_texts.append((w, text))

            row_h = max_lines * 6
            x_start = self._pdf.get_x()
            y_start = self._pdf.get_y()

            for i, (w, text) in enumerate(cell_texts):
                self._pdf.set_xy(x_start + sum(col_widths[:i]), y_start)
                self._pdf.multi_cell(w, 6, text, border=1)

            self._pdf.set_y(max(self._pdf.get_y(), y_start + row_h))

        self._serial = start_serial + len(rows)
        self._row_count += len(rows)
        return self._serial

    def finalize(self) -> dict[str, Any]:
        self._pdf.output(str(self._temp_path))
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
        if self._temp_path.exists():
            self._temp_path.unlink()
