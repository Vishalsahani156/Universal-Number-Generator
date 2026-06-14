import random
from typing import Any, Protocol


class CountryGenerator(Protocol):
    def validate(self, quantity: int, mode: str) -> str | None: ...
    def generate_batch(
        self, batch_size: int, offset: int, mode: str
    ) -> tuple[list[str], int]: ...
    def format_number(self, number: str, include_country_code: bool) -> str: ...
    def is_valid_national_number(self, number: str) -> bool: ...


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
        else:
            available = self.available_unique_count()
            if quantity > available:
                return f"Random generation supports at most {available:,} unique numbers"
        return None

    @property
    def length(self) -> int:
        return self._length

    @property
    def dial_code(self) -> str:
        return self._dial_code

    @property
    def valid_prefixes(self) -> list[str]:
        return list(self._prefixes)

    def available_unique_count(self) -> int:
        total = 0
        for prefix in self._prefixes:
            remaining = self._length - len(prefix)
            total += 10**remaining
        return total

    def generate_batch(
        self, batch_size: int, offset: int, mode: str
    ) -> tuple[list[str], int]:
        if batch_size <= 0:
            return [], offset
        if mode == "sequential":
            return self._sequential_batch(batch_size, offset)
        return self._random_batch(batch_size), 0

    def is_valid_national_number(self, number: str) -> bool:
        return (
            isinstance(number, str)
            and number.isdigit()
            and len(number) == self._length
            and self._has_valid_prefix(number)
        )

    def format_number(self, number: str, include_country_code: bool) -> str:
        if not self.is_valid_national_number(number):
            raise ValueError(
                f"Generated number must be {self._length} digits with a valid prefix, "
                f"got {number!r}"
            )
        if include_country_code:
            return f"{self._dial_code}{number}"
        return number

    def _sequential_batch(self, batch_size: int, offset: int) -> tuple[list[str], int]:
        numbers: list[str] = []
        current = self._seq_start + offset
        while len(numbers) < batch_size and current <= self._seq_end:
            num = str(current).zfill(self._length)
            if self._has_valid_prefix(num):
                numbers.append(num)
            current += 1
        next_offset = current - self._seq_start
        return numbers, next_offset

    def _random_batch(self, batch_size: int) -> list[str]:
        prefixes = self._prefixes
        length = self._length
        numbers: list[str] = []
        append = numbers.append
        for _ in range(batch_size):
            prefix = random.choice(prefixes)
            remaining = length - len(prefix)
            if remaining <= 0:
                raise ValueError(
                    f"Invalid country config: prefix {prefix!r} is longer than length {length}"
                )
            suffix = f"{random.randrange(10**remaining):0{remaining}d}"
            number = f"{prefix}{suffix}"
            if not self.is_valid_national_number(number):
                raise RuntimeError(f"Random generator produced invalid number: {number!r}")
            append(number)
        return numbers

    def _has_valid_prefix(self, number: str) -> bool:
        return any(number.startswith(prefix) for prefix in self._prefixes)
