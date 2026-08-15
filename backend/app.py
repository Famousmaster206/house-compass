from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json

from rentcast import get_market_statistics, is_configured as rentcast_is_configured, RentCastError
from az_cities import CITY_ZIP_CODES, get_zip_for_city

load_dotenv()  # loads ../.env.local (and .env in backend/) if present

app = Flask(__name__)
CORS(app) # CRITICAL: Allows your React app to talk to Flask

# Load mock data into memory
with open('mock_data.json', 'r') as f:
    properties = json.load(f)

@app.route('/api/ping', methods=['GET'])
def ping():
    return jsonify({"status": "Backend is running!"})

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    user_preferences = request.json

    # TODO: Import your algorithm from engine.py here
    # Example: scored_properties = score_houses(properties, user_preferences)

    # For now, just return all properties so frontend can test
    return jsonify(properties)


def _extract_rent_by_bedrooms(rentcast_payload):
    """Pulls a simple {bedrooms: averageRent} map out of a RentCast /markets response."""
    rental_data = rentcast_payload.get("rentalData") or {}
    by_bedrooms = rental_data.get("dataByBedrooms") or []
    result = {}
    for entry in by_bedrooms:
        bedrooms = entry.get("bedrooms")
        avg_rent = entry.get("averageRent")
        if bedrooms is not None and avg_rent is not None:
            result[str(bedrooms)] = avg_rent
    return {
        "averageRent": rental_data.get("averageRent"),
        "medianRent": rental_data.get("medianRent"),
        "rentByBedrooms": result,
        "lastUpdatedDate": rental_data.get("lastUpdatedDate"),
    }


@app.route('/api/rentcast/city/<slug>', methods=['GET'])
def rentcast_city(slug):
    """Live rent data for one Arizona city, proxied through RentCast.

    The RentCast API key never leaves this server — the frontend only ever
    calls this route. Falls back to a clear 503 (not a crash) if the key
    isn't configured or RentCast is unreachable, so the frontend can fall
    back to its own static sample data.
    """
    zip_code = get_zip_for_city(slug)
    if zip_code is None:
        return jsonify({"error": f"Unknown city slug: {slug}"}), 404

    try:
        raw = get_market_statistics(zip_code)
    except RentCastError as exc:
        status = exc.status if exc.status and exc.status < 500 else 502
        return jsonify({"error": str(exc)}), status

    return jsonify({
        "citySlug": slug,
        "zipCode": zip_code,
        "source": "rentcast",
        **_extract_rent_by_bedrooms(raw),
    })


@app.route('/api/rentcast/cities', methods=['GET'])
def rentcast_all_cities():
    """Live rent data for every known Arizona city in one call."""
    results = {}
    errors = {}
    for slug in CITY_ZIP_CODES:
        try:
            raw = get_market_statistics(CITY_ZIP_CODES[slug])
            results[slug] = _extract_rent_by_bedrooms(raw)
        except RentCastError as exc:
            errors[slug] = str(exc)

    return jsonify({"cities": results, "errors": errors})


@app.route('/api/rentcast/status', methods=['GET'])
def rentcast_status():
    return jsonify({"configured": rentcast_is_configured()})


if __name__ == '__main__':
    # Runs on port 5000 by default
    app.run(debug=True, port=5000)
