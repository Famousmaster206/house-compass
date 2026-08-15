from flask import Flask, request, jsonify
from flask_cors import CORS
import json

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

if __name__ == '__main__':
    # Runs on port 5000 by default
    app.run(debug=True, port=5000)