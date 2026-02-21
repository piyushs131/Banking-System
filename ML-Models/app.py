import warnings
warnings.filterwarnings('ignore', message='Trying to unpickle')

from flask import Flask, request, jsonify
import pandas as pd
import joblib
import os
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
# Allow localhost on any port (Vite uses 5173, 5174, 5178, etc.)
_allowed = [f"http://localhost:{p}" for p in range(5173, 5181)] + [f"http://127.0.0.1:{p}" for p in range(5173, 5181)]
CORS(app, origins=_allowed)

# Load models with error handling
try:
    model = joblib.load(os.path.join(os.path.dirname(__file__), 'isolation_forest.pkl'))
    fraudModel = joblib.load(os.path.join(os.path.dirname(__file__), "RandomForestFraudModel2.pkl"))
except Exception as e:
    print(f"Warning: Could not load models: {e}")
    model = None
    fraudModel = None


@app.route('/analyze-mouse', methods=['POST'])
def analyze_mouse():
    try:
        movements = request.get_json()

        if not movements or not isinstance(movements, list):
            return jsonify({'error': 'Invalid or empty movement data'}), 400

        df = pd.DataFrame(movements)
        if not {'x', 'y', 'time_ms'}.issubset(df.columns):
            return jsonify({'error': 'Missing required fields'}), 400

        if model is None:
            return jsonify({'anomaly_score': 0.0, 'is_anomaly': False})

        features = extract_features(df)
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
    try:
        data = request.get_json()
        if not data:
            return jsonify({"prediction": "NOT FRAUD", "probability": 0.0}), 200
        if fraudModel is None:
            return jsonify({"prediction": "NOT FRAUD", "probability": 0.0}), 200

        input_features = pd.DataFrame([{
            'type': data.get('type', 4),
            'amount': float(data.get('amount', 0)),
            'oldbalanceOrg': float(data.get('oldbalanceOrig', data.get('oldbalanceOrg', 0))),
            'newbalanceOrig': float(data.get('newbalanceOrig', data.get('newbalanceOrg', 0))),
            'oldbalanceDest': float(data.get('oldbalanceDest', 0)),
            'newbalanceDest': float(data.get('newbalanceDest', 0))
        }])

        if hasattr(fraudModel, 'predict_proba'):
            proba = fraudModel.predict_proba(input_features)[0]
            probability = float(proba[1]) if len(proba) > 1 else float(proba[0])
        else:
            probability = float(fraudModel.predict(input_features)[0])
        result = "FRAUD" if probability >= 0.5 else "NOT FRAUD"
        return jsonify({"prediction": result, "probability": probability})
    except Exception as e:
        print(f"predict-fraud error: {e}")
        return jsonify({"prediction": "NOT FRAUD", "probability": 0.0}), 200

if __name__ == '__main__':
    app.run(port=5001,debug=True)