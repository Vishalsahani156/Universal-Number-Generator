import random
from typing import Any, Protocol


class CountryGenerator(Protocol):
    def validate(self, quantity: int, mode: str) -> str | None: ...
    def generate_batch(self, batch_size: int, offset: int, mode: str) -> list[str]: ...
    def format_number(self, number: str, include_country_code: bool) -> str: ...


class GenericCountryGenerator:
    def __init__(self, country: dict[str, Any]) -> None:
        self._country = country
        self._rules = country["mobile_rules"]
        self._length = self._rules["length"]
        self._prefixes: list[str] = self._rules["valid_prefixes"]
        self._seq_start = int(self._rules["sequential_start"])
        self._seq_end = int(self._rules["sequential_end"])
        self._dial_code = country["dial_code"]

    def validate(self, quantity: int, mode: str) -> str | None:
        if mode == "sequential":
            available = self._seq_end - self._seq_start + 1
            if quantity > available:
                return f"Sequential range supports at most {available:,} numbers"
        return None

    def generate_batch(self, batch_size: int, offset: int, mode: str) -> list[str]:
        if mode == "sequential":
            return self._sequential_batch(batch_size, offset)
        return self._random_batch(batch_size)

    def format_number(self, number: str, include_country_code: bool) -> str:
        if include_country_code:
            return f"{self._dial_code}{number}"
        return number

    def _sequential_batch(self, batch_size: int, offset: int) -> list[str]:
        numbers: list[str] = []
        current = self._seq_start + offset
        end = min(current + batch_size, self._seq_end + 1)
        for value in range(current, end):
            num = str(value).zfill(self._length)
            if self._has_valid_prefix(num):
                numbers.append(num)
        return numbers

    def _random_batch(self, batch_size: int) -> list[str]:
        prefixes = self._prefixes
        length = self._length
        numbers: list[str] = []
        append = numbers.append
        for _ in range(batch_size):
            prefix = random.choice(prefixes)
            remaining = length - len(prefix)
            suffix = f"{random.randrange(10**remaining):0{remaining}d}"
            append(f"{prefix}{suffix}")
        return numbers

    def _has_valid_prefix(self, number: str) -> bool:
        return any(number.startswith(p) for p in self._prefixes)
