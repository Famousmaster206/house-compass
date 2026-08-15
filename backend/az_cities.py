"""Arizona city slug -> representative zip code, for RentCast lookups.

One zip per city is a simplification (real cities span many zip codes with
varying rents) — picked as a broadly representative/central zip for each
city. TODO: consider averaging across multiple zips per city for a more
robust estimate.
"""

CITY_ZIP_CODES: dict[str, str] = {
    "phoenix": "85003",
    "tucson": "85701",
    "mesa": "85201",
    "chandler": "85224",
    "scottsdale": "85251",
    "tempe": "85281",
    "glendale": "85301",
    "flagstaff": "86001",
}


def get_zip_for_city(slug: str) -> str | None:
    return CITY_ZIP_CODES.get(slug)
