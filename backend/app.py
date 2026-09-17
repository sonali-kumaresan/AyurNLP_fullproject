from pathlib import Path
import pickle

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"

with (BASE_DIR / "model.pkl").open("rb") as model_file:
    model = pickle.load(model_file)

with (BASE_DIR / "vectorizer.pkl").open("rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)


def preprocess_text(text):
    return text.lower().strip()


app = Flask(__name__, static_folder=str(FRONTEND_DIR), static_url_path="")
CORS(app)


@app.get("/")
def index():
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/predict")
def predict():
    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    complaint = payload.get("complaint")
    if not isinstance(complaint, str):
        return jsonify({"error": "The complaint field must be a string."}), 400

    cleaned_complaint = preprocess_text(complaint)
    if not cleaned_complaint:
        return jsonify({"error": "Complaint cannot be empty."}), 400

    complaint_features = vectorizer.transform([cleaned_complaint])
    prediction = model.predict(complaint_features)[0]
    probabilities = model.predict_proba(complaint_features)[0]
    confidence = float(max(probabilities))

    return jsonify({"category": str(prediction), "confidence": confidence})


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
