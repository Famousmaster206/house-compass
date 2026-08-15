from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import json
import os
import google.generativeai as genai

from rentcast import get_market_statistics, is_configured as rentcast_is_configured, RentCastError
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
    prompt = f"""Based on the following housing affordability calculation for someone living in {city_name}, provide a personalized AI-powered financial overview and insights. Be conversational, encouraging, and practical.

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

Please provide:
1. A brief overall assessment of their financial position in {city_name}
2. Key insights about their expense distribution (what stands out?)
3. Specific, actionable recommendations for optimizing their budget
4. Potential areas of concern or opportunities
5. Encouragement and context about their affordability level

Keep the tone friendly, practical, and empowering. Focus on actionable insights they can use."""

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
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
