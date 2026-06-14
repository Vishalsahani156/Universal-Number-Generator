from app.domain.generators.batch_collector import BatchCollector
from app.domain.generators.registry import get_generator


def test_india_random_numbers_are_ten_digits(india_generator):
    numbers, _ = india_generator.generate_batch(100, 0, "random")
    assert len(numbers) == 100
    for number in numbers:
        assert len(number) == 10
        assert number.isdigit()
        assert number[0] in {"6", "7", "8", "9"}


def test_india_format_with_country_code(india_generator):
    numbers, _ = india_generator.generate_batch(1, 0, "random")
    formatted = india_generator.format_number(numbers[0], True)
    assert formatted.startswith("+91")
    assert len(formatted) == 13


def test_india_format_without_country_code(india_generator):
    numbers, _ = india_generator.generate_batch(1, 0, "random")
    formatted = india_generator.format_number(numbers[0], False)
    assert len(formatted) == 10
    assert formatted.isdigit()


def test_invalid_number_rejected_by_format(india_generator):
    try:
        india_generator.format_number("8", False)
    except ValueError as exc:
        assert "8" in str(exc)
    else:
        raise AssertionError("Expected ValueError for single-digit number")


def test_uae_numbers_are_nine_digits(uae_generator):
    numbers, _ = uae_generator.generate_batch(50, 0, "random")
    assert len(numbers) == 50
    for number in numbers:
        assert len(number) == 9
        assert any(number.startswith(prefix) for prefix in uae_generator.valid_prefixes)


def test_sequential_batch_advances_offset(india_generator):
    first, next_offset = india_generator.generate_batch(10, 0, "sequential")
    second, _ = india_generator.generate_batch(10, next_offset, "sequential")

    assert len(first) == 10
    assert len(second) == 10
    assert first != second
    assert len(set(first + second)) == 20


def test_random_quantity_validation(india_generator):
    assert india_generator.validate(1_000, "random") is None
    assert india_generator.validate(india_generator.available_unique_count() + 1, "random")


def test_batch_collector_produces_exact_quantity_without_duplicates(india_generator):
    collector = BatchCollector(india_generator, "random")
    numbers = collector.collect(500)
    assert len(numbers) == 500
    assert len(set(numbers)) == 500
    assert collector.collected_count == 500


def test_batch_collector_sequential_exact_quantity(india_generator):
    collector = BatchCollector(india_generator, "sequential")
    numbers = collector.collect(250)
    assert len(numbers) == 250
    assert len(set(numbers)) == 250
