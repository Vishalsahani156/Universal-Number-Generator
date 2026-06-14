from app.domain.generators.base import GenericCountryGenerator


class BatchCollector:
    """Collect validated, unique national numbers in fixed-size batches."""

    def __init__(self, generator: GenericCountryGenerator, mode: str) -> None:
        self._generator = generator
        self._mode = mode
        self._seen: set[str] = set()
        self._seq_offset = 0

    @property
    def collected_count(self) -> int:
        return len(self._seen)

    def collect(self, count: int) -> list[str]:
        if count <= 0:
            return []

        if self._mode == "sequential":
            return self._collect_sequential(count)
        return self._collect_random(count)

    def _collect_sequential(self, count: int) -> list[str]:
        numbers, next_offset = self._generator.generate_batch(
            count,
            self._seq_offset,
            "sequential",
        )
        self._seq_offset = next_offset

        if len(numbers) != count:
            raise RuntimeError(
                f"Sequential generator returned {len(numbers):,} numbers, expected {count:,}"
            )

        validated = self._validate_and_track(numbers)
        if len(validated) != count:
            raise RuntimeError("Sequential batch contained invalid or duplicate numbers")
        return validated

    def _collect_random(self, count: int) -> list[str]:
        result: list[str] = []
        attempts = 0
        max_attempts = max(count * 50, 1_000)

        while len(result) < count:
            if attempts >= max_attempts:
                raise RuntimeError(
                    f"Unable to collect {count:,} unique numbers after {attempts} attempts"
                )

            need = count - len(result)
            candidates, _ = self._generator.generate_batch(need, 0, "random")
            for number in candidates:
                if number in self._seen:
                    continue
                if not self._generator.is_valid_national_number(number):
                    continue
                self._seen.add(number)
                result.append(number)
                if len(result) >= count:
                    break

            attempts += 1

        return result

    def _validate_and_track(self, numbers: list[str]) -> list[str]:
        validated: list[str] = []
        for number in numbers:
            if not self._generator.is_valid_national_number(number):
                raise RuntimeError(f"Invalid generated number: {number!r}")
            if number in self._seen:
                raise RuntimeError(f"Duplicate generated number: {number!r}")
            self._seen.add(number)
            validated.append(number)
        return validated
