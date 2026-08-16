from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json
import os
import google.generativeai as genai

from rentcast import (
    get_market_statistics,
    get_rent_estimate,
    get_value_estimate,
    is_configured as rentcast_is_configured,
    RentCastError,
    search_sale_listings,
)
from az_cities import CITY_ZIP_CODES, get_zip_for_city

load_dotenv()  # loads ../.env.local (and .env in backend/) if present

app = Flask(__name__)
CORS(app) # CRITICAL: Allows your React app to talk to Flask

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

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

    The RentCast API key stays on this server; the frontend only ever
    calls this route. Falls back to a clear error status (not a crash) if the
    key isn't configured or RentCast is unreachable, so the frontend can fall
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


def _extract_subject_property(subject):
    """Trims a RentCast subjectProperty object down to the fields the frontend uses."""
    if not subject:
        return None
    return {
        "formattedAddress": subject.get("formattedAddress"),
        "city": subject.get("city"),
        "state": subject.get("state"),
        "zipCode": subject.get("zipCode"),
        "propertyType": subject.get("propertyType"),
        "bedrooms": subject.get("bedrooms"),
        "bathrooms": subject.get("bathrooms"),
        "squareFootage": subject.get("squareFootage"),
        "yearBuilt": subject.get("yearBuilt"),
        "lastSaleDate": subject.get("lastSaleDate"),
        "lastSalePrice": subject.get("lastSalePrice"),
    }


@app.route('/api/rentcast/address-estimate', methods=['GET'])
def rentcast_address_estimate():
    """Combined sale-value + rent estimate for one specific street address.

    Query params: address (required) - "Street, City, State, Zip"

    Powers the "plug in a target address" option on the calculator, as an
    alternative to the manual per-category entry — both stay available.
    """
    address = request.args.get('address', '').strip()
    if not address:
        return jsonify({"error": "Missing required query parameter: address"}), 400

    result = {"address": address, "source": "rentcast"}
    errors = {}

    try:
        value = get_value_estimate(address)
        result["saleValue"] = {
            "price": value.get("price"),
            "priceRangeLow": value.get("priceRangeLow"),
            "priceRangeHigh": value.get("priceRangeHigh"),
        }
        result["subjectProperty"] = _extract_subject_property(value.get("subjectProperty"))
    except RentCastError as exc:
        errors["saleValue"] = str(exc)

    try:
        rent = get_rent_estimate(address)
        result["rentEstimate"] = {
            "rent": rent.get("rent"),
            "rentRangeLow": rent.get("rentRangeLow"),
            "rentRangeHigh": rent.get("rentRangeHigh"),
        }
        if result.get("subjectProperty") is None:
            result["subjectProperty"] = _extract_subject_property(rent.get("subjectProperty"))
    except RentCastError as exc:
        errors["rentEstimate"] = str(exc)

    if errors:
        result["errors"] = errors
    if "saleValue" not in result and "rentEstimate" not in result:
        # Both calls failed outright — surface as an error response, not a silent empty 200.
        return jsonify({"error": "RentCast could not estimate this address.", "details": errors}), 502

    return jsonify(result)


def _score_listing(listing, target_budget, preferred_beds):
    """Simple scoring heuristic for 'find a good house' — not ML, just a
    transparent weighted distance from the user's stated budget/bedroom
    preference, favoring listings closer to what they asked for and with
    fewer days on market (fresher listings)."""
    price = listing.get("price") or 0
    beds = listing.get("bedrooms") or 0
    days_on_market = listing.get("daysOnMarket") if listing.get("daysOnMarket") is not None else 30

    score = 0.0
    if target_budget:
        # Penalize distance from budget; being under budget is fine, over is worse.
        diff = price - target_budget
        score -= (diff / target_budget) * 100 if diff > 0 else (abs(diff) / target_budget) * 20
    if preferred_beds:
        score -= abs(beds - preferred_beds) * 15
    score -= min(days_on_market, 90) * 0.2  # fresher listings score slightly higher

    return score


@app.route('/api/rentcast/listings/search', methods=['GET'])
def rentcast_listings_search():
    """Searches active for-sale listings and ranks them against simple
    user-stated preferences (budget, bedroom count) — this is a transparent
    heuristic filter/sort, not a machine-learned recommendation engine.

    Query params:
      city (optional), state (optional, defaults to AZ), zipCode (optional)
      maxBudget (optional, number)
      bedrooms (optional, number) - preferred bedroom count
      limit (optional, default 50, max 500)
    """
    city = request.args.get('city')
    state = request.args.get('state', 'AZ')
    zip_code = request.args.get('zipCode')
    limit = int(request.args.get('limit', 50))
    max_budget = request.args.get('maxBudget', type=float)
    preferred_beds = request.args.get('bedrooms', type=float)

    if not city and not zip_code:
        return jsonify({"error": "Provide at least a city or zipCode to search."}), 400

    try:
        listings = search_sale_listings(city=city, state=state, zip_code=zip_code, limit=limit)
    except RentCastError as exc:
        status = exc.status if exc.status and exc.status < 500 else 502
        return jsonify({"error": str(exc)}), status

    if max_budget:
        listings = [item for item in listings if not item.get("price") or item.get("price") <= max_budget * 1.1]

    ranked = sorted(listings, key=lambda item: _score_listing(item, max_budget, preferred_beds), reverse=True)

    trimmed = [
        {
            "id": item.get("id"),
            "formattedAddress": item.get("formattedAddress"),
            "city": item.get("city"),
            "state": item.get("state"),
            "zipCode": item.get("zipCode"),
            "price": item.get("price"),
            "bedrooms": item.get("bedrooms"),
            "bathrooms": item.get("bathrooms"),
            "squareFootage": item.get("squareFootage"),
            "propertyType": item.get("propertyType"),
            "daysOnMarket": item.get("daysOnMarket"),
            "listedDate": item.get("listedDate"),
        }
        for item in ranked
    ]

    return jsonify({"listings": trimmed, "count": len(trimmed), "source": "rentcast"})

@app.route('/api/ai-overview', methods=['POST'])
def generate_ai_overview():
    """Generate an AI-powered overview of the user's housing affordability based on their calculation results."""
    if not GEMINI_API_KEY:
        return jsonify({"error": "Gemini API key not configured"}), 500
    
    data = request.json
    
    # Extract calculation data
    city_name = data.get('cityName', 'your city')
    monthly_income = data.get('monthlyIncome', 0)
    expenses = data.get('expenses', {})
    leftover = data.get('leftover', 0)
    affordability_rating = data.get('affordabilityRating', 'unknown')
    household_size = data.get('householdSize', 1)
    roommates = data.get('roommates', 0)
    has_car = data.get('hasCar', False)
    bedrooms = data.get('bedrooms', 1)
    
    # Build the prompt
    prompt = f"""You're looking at a housing affordability calculation for someone living in {city_name}. Write a short, plain-spoken financial overview based on it. No greetings, no "Hello there," no exclamation points, no headers or markdown formatting, just direct paragraphs.

USER'S FINANCIAL SITUATION:
- Monthly Net Income: ${monthly_income:,}
- Monthly Expenses: ${expenses.get('total', 0):,}
- Estimated Monthly Leftover: ${leftover:,}
- Affordability Rating: {affordability_rating}

EXPENSE BREAKDOWN:
- Housing: ${expenses.get('housing', 0):,}
- Utilities: ${expenses.get('utilities', 0):,}
- Transportation: ${expenses.get('transportation', 0):,}
- Groceries: ${expenses.get('groceries', 0):,}
- Dining Out: ${expenses.get('dining', 0):,}
- Lifestyle/Entertainment: ${expenses.get('lifestyle', 0):,}

HOUSEHOLD DETAILS:
- Household Size: {household_size} person(s)
- Roommates: {roommates}
- Housing: {bedrooms} bedroom(s)
- Transportation: {"Has a car" if has_car else "No car (public transit/rideshare)"}

Cover, in 3-4 short paragraphs:
1. Where they actually stand financially in {city_name}
2. What their expense breakdown reveals (the real standout, not a generic list)
3. One or two specific things they could change, with a rough sense of what it would save
4. Anything worth flagging as a risk or a strength

Write like a knowledgeable friend giving them a straight answer, not a customer service bot."""

    try:
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
        response = model.generate_content(prompt)

        return jsonify({
            "overview": response.text,
            "success": True
        })
    except Exception as e:
        return jsonify({
            "error": f"Failed to generate overview: {str(e)}",
            "success": False
        }), 500


@app.route('/api/ai-property-overview', methods=['POST'])
def generate_ai_property_overview():
    """Generate an AI overview of a specific for-sale property listing.

    Request body:
    {
        "address": string, "price": number, "bedrooms": number,
        "bathrooms": number, "squareFootage": number, "propertyType": string,
        "daysOnMarket": number, "monthlyIncome": number (optional),
        "estimatedMonthlyPayment": number (optional)
    }
    """
    if not GEMINI_API_KEY:
        return jsonify({"error": "Gemini API key not configured"}), 500

    data = request.json or {}

    address = data.get('address', 'this property')
    price = data.get('price', 0)
    bedrooms = data.get('bedrooms', 0)
    bathrooms = data.get('bathrooms', 0)
    square_footage = data.get('squareFootage', 0)
    property_type = data.get('propertyType', 'home')
    days_on_market = data.get('daysOnMarket')
    monthly_income = data.get('monthlyIncome')
    estimated_monthly_payment = data.get('estimatedMonthlyPayment')

    prompt = f"""Here's a real for-sale listing in Arizona. Write a short, straight-talking read on it for someone considering it. No greetings, no exclamation points, no headers or markdown, just direct paragraphs.

PROPERTY:
- Address: {address}
- Price: ${price:,}
- Type: {property_type}
- Bedrooms: {bedrooms}, Bathrooms: {bathrooms}
- Square footage: {square_footage:,} sq ft
- Days on market: {days_on_market if days_on_market is not None else "unknown"}
{f"- Buyer's monthly income: ${monthly_income:,}" if monthly_income else ""}
{f"- Estimated monthly payment: ${estimated_monthly_payment:,}" if estimated_monthly_payment else ""}

In 3-4 short paragraphs, cover:
1. Whether the price makes sense for the size, and what the days-on-market number suggests (fresh listing vs. sat around, possible negotiating room)
2. What actually stands out here, good or bad
3. One or two specific things worth checking before making an offer
4. If income/payment numbers were given, whether this looks affordable for them

Stick to what's given here. Don't invent details, and don't give exact financial or legal advice."""

    try:
        model = genai.GenerativeModel('gemini-3.1-flash-lite')
        response = model.generate_content(prompt)

        return jsonify({
            "overview": response.text,
            "success": True
        })
    except Exception as e:
        return jsonify({
            "error": f"Failed to generate property overview: {str(e)}",
            "success": False
        }), 500


@app.route('/api/calculate-net-spending', methods=['POST'])
def calculate_net_spending():
    """
    Calculate net spending: Total Spending - (Housing Cost + External Costs)
    
    Supports both rent and house purchase cost calculations.
    Time period can be monthly or yearly.
    
    Request body:
    {
        "totalSpending": number,  # Total monthly or yearly spending
        "housingType": "rent" | "purchase",  # Type of housing cost
        "housingCost": number,  # Monthly rent or house price
        "externalCosts": number,  # Additional external costs (monthly/yearly)
        "timePeriod": "monthly" | "yearly"  # Optional, defaults to "monthly"
    }
    """
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['totalSpending', 'housingType', 'housingCost', 'externalCosts']
        if not all(field in data for field in required_fields):
            return jsonify({
                "error": "Missing required fields. Required: totalSpending, housingType, housingCost, externalCosts",
                "success": False
            }), 400
        
        total_spending = float(data.get('totalSpending', 0))
        housing_type = data.get('housingType', '').lower()
        housing_cost = float(data.get('housingCost', 0))
        external_costs = float(data.get('externalCosts', 0))
        time_period = data.get('timePeriod', 'monthly').lower()
        
        # Validate housing type
        if housing_type not in ['rent', 'purchase']:
            return jsonify({
                "error": "housingType must be either 'rent' or 'purchase'",
                "success": False
            }), 400
        
        # Validate time period
        if time_period not in ['monthly', 'yearly']:
            return jsonify({
                "error": "timePeriod must be either 'monthly' or 'yearly'",
                "success": False
            }), 400
        
        # Calculate net spending
        # Formula: Total Spending - (Housing Cost + External Costs)
        net_spending = total_spending - (housing_cost + external_costs)
        
        # Prepare response with breakdown
        response = {
            "success": True,
            "calculation": {
                "timePeriod": time_period,
                "housingType": housing_type,
                "totalSpending": round(total_spending, 2),
                "housingCost": round(housing_cost, 2),
                "externalCosts": round(external_costs, 2),
                "totalDeductions": round(housing_cost + external_costs, 2),
                "netSpending": round(net_spending, 2),
                "spendingRatio": {
                    "housingPercentage": round((housing_cost / total_spending * 100) if total_spending > 0 else 0, 2),
                    "externalPercentage": round((external_costs / total_spending * 100) if total_spending > 0 else 0, 2),
                    "netPercentage": round((net_spending / total_spending * 100) if total_spending > 0 else 0, 2)
                }
            }
        }
        
        return jsonify(response)
    
    except ValueError as e:
        return jsonify({
            "error": f"Invalid numeric value: {str(e)}",
            "success": False
        }), 400
    except Exception as e:
        return jsonify({
            "error": f"Calculation failed: {str(e)}",
            "success": False
        }), 500

if __name__ == '__main__':
    # Runs on port 5000 by default
    app.run(debug=True, port=5000)
