"""RentCast API client — server-side only.

The RentCast API key must never be sent to the browser. Keep it here, read
from the environment (RENTCAST_API_KEY), and only ever call RentCast from
this backend process. The frontend calls our own /api/rentcast/* routes,
which proxy to RentCast and strip out anything key-related.

Responses are cached in memory per zip code for CACHE_TTL_SECONDS to avoid
re-billing RentCast on every page load — RentCast bills per API call. This
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


def get_market_statistics(zip_code: str) -> dict[str, Any]:
    """Fetches rental market statistics for a zip code, using a 24h in-memory cache."""
    cached = _cache.get(zip_code)
    if cached is not None:
        cached_at, data = cached
        if time.time() - cached_at < CACHE_TTL_SECONDS:
            return data

    api_key = _get_api_key()
    try:
        response = requests.get(
            f"{RENTCAST_BASE_URL}/markets",
            params={"zipCode": zip_code, "dataType": "Rental"},
            headers={"X-Api-Key": api_key, "Accept": "application/json"},
            timeout=10,
        )
    except requests.RequestException as exc:
        raise RentCastError(f"RentCast request failed: {exc}") from exc

    if not response.ok:
        raise RentCastError(
            f"RentCast returned {response.status_code}: {response.text[:200]}",
            status=response.status_code,
        )

    data = response.json()
    _cache[zip_code] = (time.time(), data)
    return data


def clear_cache() -> None:
    _cache.clear()
