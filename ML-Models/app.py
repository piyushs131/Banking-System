from flask import Flask, request, jsonify
import pandas as pd
import joblib
from flask_cors import CORS

def extract_features(df):
    x = df['x'].values
    y = df['y'].values
    t = df['time_ms'].values

    dx = pd.Series(x).diff().fillna(0)
    dy = pd.Series(y).diff().fillna(0)
    dt = pd.Series(t).diff().fillna(1)

    velocity = ((dx ** 2 + dy ** 2) ** 0.5) / dt
    acceleration = velocity.diff().fillna(0) / dt

    features = {
        'mean_velocity': velocity.mean(),
        'std_velocity': velocity.std(),
        'mean_acceleration': acceleration.mean(),
        'std_acceleration': acceleration.std(),
        'total_duration': df['time_ms'].iloc[-1] if len(df) > 1 else 0,
        'num_points': len(df)
    }
    return pd.DataFrame([features])

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])

# Load Isolation Forest model
model = joblib.load('isolation_forest.pkl')
fraudModel = joblib.load("RandomForestFraudModel2.pkl")


@app.route('/analyze-mouse', methods=['POST'])
def analyze_mouse():
    try:
        movements = request.get_json()

        if not movements or not isinstance(movements, list):
            return jsonify({'error': 'Invalid or empty movement data'}), 400

        df = pd.DataFrame(movements)
        if not {'x', 'y', 'time_ms'}.issubset(df.columns):
            return jsonify({'error': 'Missing required fields'}), 400

        features = extract_features(df)

        # Predict anomaly
        anomaly_score = model.decision_function(features)[0]
        is_anomaly = int(model.predict(features)[0] == -1)

        return jsonify({
            'anomaly_score': float(anomaly_score),
            'is_anomaly': bool(is_anomaly)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route("/predict-fraud", methods=["POST"])
def predict_fraud():
    data = request.get_json()
    print(data)
    input_features = pd.DataFrame([{
        'type': data['type'],
        'amount': data['amount'],
        'oldbalanceOrg': data['oldbalanceOrig'],
        'newbalanceOrig': data['newbalanceOrig'],
        'oldbalanceDest': data['oldbalanceDest'],
        'newbalanceDest': data['newbalanceDest']
    }])

    probability = fraudModel.predict(input_features)[0] # Probability of fraud
    result = "FRAUD" if probability > 0.95 else "NOT FRAUD"

    print(f"Prediction: {result}, Probability: {probability}")
    return jsonify({"prediction": result, "probability": float(probability)})

if __name__ == '__main__':
    app.run(port=5001,debug=True)