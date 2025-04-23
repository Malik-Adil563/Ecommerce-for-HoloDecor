from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from joblib import load

app = Flask(__name__)
model = load("C:\\Users\\HP\\OneDrive\\Documents\\MERN\\E-Commerce for HoloDecor\\backend\\wall_detector_model.joblib")

def extract_features_from_bytes(image_bytes):
    np_arr = np.frombuffer(base64.b64decode(image_bytes), np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    img = cv2.resize(img, (100, 100))
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hist = cv2.calcHist([hsv], [0, 1, 2], None, [8, 8, 8],
                        [0, 180, 0, 256, 0, 256])
    hist = cv2.normalize(hist, hist).flatten()
    return hist

@app.route('/detect-wall', methods=['POST'])
def detect_wall():
    try:
        img_data = request.json['image']
        features = extract_features_from_bytes(img_data)
        prediction = model.predict([features])[0]
        return jsonify({'wallDetected': bool(prediction)})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)