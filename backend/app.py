from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO  # For YOLOv8; use torch.hub for YOLOv5
from PIL import Image
import numpy as np
import io

app = Flask(__name__)
CORS(app)  # Allow requests from your React frontend

# Load your YOLO model (adjust path as needed)
model = YOLO('best.pt')  # Replace with your trained model path

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.route('/api/predict', methods=['POST'])
def predict():

    if request.method == 'OPTIONS':
        # Preflight request
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
        return response

    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Convert file to PIL Image
    try:
        image = Image.open(file.stream).convert('RGB')
    except Exception as e:
        return jsonify({'error': f'Invalid image file: {str(e)}'}), 400

    # Run YOLO prediction
    results = model(image, imgsz=640)
    class_names = model.names
    # Parse results as needed
    predictions = []
    for r in results:
        for box in r.boxes:
            predictions.append({
                'class': int(box.cls[0]),
                'class_name': class_names[int(box.cls[0])],
                'confidence': float(box.conf[0]),
                'box': [float(x) for x in box.xyxy[0]]
            })
    return jsonify({'predictions': predictions})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)