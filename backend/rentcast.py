"""RentCast API client (server-side only).

The RentCast API key must never be sent to the browser. Keep it here, read
from the environment (RENTCAST_API_KEY), and only ever call RentCast from
this backend process. The frontend calls our own /api/rentcast/* routes,
which proxy to RentCast and strip out anything key-related.

Responses are cached in memory per zip code for CACHE_TTL_SECONDS to avoid
re-billing RentCast on every page load. RentCast bills per API call; this
cache is process-local and resets on server restart/redeploy; that's an
acceptable tradeoff for an MVP with a small, fixed set of Arizona cities.
"""

import os
import time
from typing import Any

import requests

RENTCAST_BASE_URL = "https://api.rentcast.io/v1"
CACHE_TTL_SECONDS = 24 * 60 * 60  # 24 hours

_cache: dict[str, tuple[float, dict[str, Any]]] = {}


class RentCastError(Exception):
    def __init__(self, message: str, status: int | None = None):
        super().__init__(message)
        self.status = status


def _get_api_key() -> str:
    # Support the pre-existing (typo'd) env var name alongside the corrected
    # one, so this works immediately without requiring the key to be renamed.
    key = os.environ.get("RENTCAST_API_KEY") or os.environ.get("NEXt_PUBLIC_RENTCAST_API_KEY")
    if not key:
        raise RentCastError("RENTCAST_API_KEY is not configured on the backend.")
    return key


def is_configured() -> bool:
    try:
        _get_api_key()
        return True
    except RentCastError:
        return False


def _get(path: str, params: dict[str, Any], cache_key: str) -> dict[str, Any]:
    """Shared GET-with-cache helper. Raises RentCastError on any failure."""
    cached = _cache.get(cache_key)
    if cached is not None:
        cached_at, data = cached
        if time.time() - cached_at < CACHE_TTL_SECONDS:
            return data

    api_key = _get_api_key()
    try:
        response = requests.get(
            f"{RENTCAST_BASE_URL}{path}",
            params=params,
            headers={"X-Api-Key": api_key, "Accept": "application/json"},
            timeout=15,
        )
    except requests.RequestException as exc:
        raise RentCastError(f"RentCast request failed: {exc}") from exc

    if not response.ok:
        raise RentCastError(
            f"RentCast returned {response.status_code}: {response.text[:200]}",
            status=response.status_code,
        )

    data = response.json()
    _cache[cache_key] = (time.time(), data)
    return data


def get_market_statistics(zip_code: str) -> dict[str, Any]:
    """Fetches rental market statistics for a zip code, using a 24h in-memory cache."""
    return _get("/markets", {"zipCode": zip_code, "dataType": "Rental"}, f"markets:{zip_code}")


def get_value_estimate(address: str) -> dict[str, Any]:
    """Fetches the RentCast AVM sale-value estimate for a specific street address.

    GET /v1/avm/value?address=... -> { price, priceRangeLow, priceRangeHigh,
    subjectProperty, comparables }
    """
    return _get("/avm/value", {"address": address}, f"avm-value:{address}")


def get_rent_estimate(address: str) -> dict[str, Any]:
    """Fetches the RentCast AVM long-term rent estimate for a specific street address.

    GET /v1/avm/rent/long-term?address=... -> { rent, rentRangeLow, rentRangeHigh,
    subjectProperty, comparables }
    """
    return _get("/avm/rent/long-term", {"address": address}, f"avm-rent:{address}")


def search_sale_listings(
    city: str | None = None,
    state: str | None = None,
    zip_code: str | None = None,
    limit: int = 50,
) -> list[dict[str, Any]]:
    """Searches active for-sale listings by city/state or zip code.

    GET /v1/listings/sale?city=&state=&zipCode=&status=Active&limit= -> list of
    listing objects (id, formattedAddress, price, bedrooms, bathrooms,
    squareFootage, propertyType, status, daysOnMarket, ...).
    """
    params: dict[str, Any] = {"status": "Active", "limit": min(max(limit, 1), 500)}
    if city:
        params["city"] = city
    if state:
        params["state"] = state
    if zip_code:
        params["zipCode"] = zip_code

    cache_key = f"listings:{city}:{state}:{zip_code}:{limit}"
    data = _get("/listings/sale", params, cache_key)
    # RentCast returns a bare JSON array for this endpoint.
    return data if isinstance(data, list) else data.get("listings", [])


def clear_cache() -> None:
    _cache.clear()
