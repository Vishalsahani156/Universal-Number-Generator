import pytest

from app.domain.generators.registry import get_generator


@pytest.fixture
def india_generator():
    return get_generator("IN")


@pytest.fixture
def uae_generator():
    return get_generator("AE")
