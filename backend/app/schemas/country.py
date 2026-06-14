from pydantic import BaseModel, Field


class MobileRulesResponse(BaseModel):
    length: int
    valid_prefixes: list[str]


class ExportOptionsResponse(BaseModel):
    column_name: str
    include_country_code: bool
    include_serial: bool


class CountryResponse(BaseModel):
    code: str
    name: str
    dial_code: str
    iso_alpha2: str
    mobile_rules: MobileRulesResponse
    default_export: ExportOptionsResponse
    display_order: int
