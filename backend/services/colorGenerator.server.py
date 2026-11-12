import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder
import json
import os
import warnings
from flask import Flask, request, jsonify
import sys

warnings.filterwarnings('ignore')
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'color_wgangp_final.h5')
MODEL_PATH = os.path.abspath(MODEL_PATH)
STYLES_PATH = os.path.join(os.path.dirname(__file__), 'styles.npy')

model_cache = None
label_encoder_cache = None
styles_cache = None

def rgb2hex(rgb):
    rgb = np.clip(rgb, 0, 1)
    return f'#{int(rgb[0]*255):02X}{int(rgb[1]*255):02X}{int(rgb[2]*255):02X}'

def load_styles_from_npy():
    return np.load(STYLES_PATH, allow_pickle=True).tolist()

def get_model():
    global model_cache, label_encoder_cache, styles_cache
    if model_cache is None:
        print(f"Loading model from: {MODEL_PATH}", flush=True)
        print(f"Loading styles from: {STYLES_PATH}", flush=True)
        
        model_cache = load_model(MODEL_PATH, compile=False)
        styles_cache = load_styles_from_npy()
        
        print(f"Styles loaded: {len(styles_cache)} styles", flush=True)
        print(f"First 5 styles: {styles_cache[:5]}", flush=True)
        print(f"Style '暗黑高级' exists: {'暗黑高级' in styles_cache}", flush=True)
        
        label_encoder_cache = LabelEncoder()
        label_encoder_cache.fit(styles_cache)
        print("Model loaded successfully", flush=True)
    return model_cache, label_encoder_cache, styles_cache

def generate_colors(style_name, color_count=4):
    model, label_encoder, styles = get_model()

    if style_name not in styles:
        if styles:
            style_name = styles[0]
        else:
            return ['#808080'] * color_count

    style_idx = label_encoder.transform([style_name])[0]
    style_vec = np.zeros((1, len(styles)), dtype=np.float32)
    style_vec[0, style_idx] = 1.0

    noise = np.random.randn(1, 128).astype(np.float32)
    pred = model.predict([noise, style_vec], verbose=0)[0]

    colors = []
    for i in range(0, 15, 3):
        colors.append(rgb2hex(pred[i:i+3]))

    while len(colors) < color_count:
        colors.append(colors[-1])

    return colors[:color_count]

def generate_colors_batch(style_name, color_count=4, batch_size=20):
    model, label_encoder, styles = get_model()

    if style_name not in styles:
        if styles:
            style_name = styles[0]
        else:
            return [['#808080'] * color_count for _ in range(batch_size)]

    style_idx = label_encoder.transform([style_name])[0]
    noise_batch = np.random.randn(batch_size, 128).astype(np.float32)
    style_vec = np.zeros((batch_size, len(styles)), dtype=np.float32)
    style_vec[:, style_idx] = 1.0

    preds = model.predict([noise_batch, style_vec], verbose=0)
    
    result = []
    for pred in preds:
        colors = []
        for i in range(0, 15, 3):
            colors.append(rgb2hex(pred[i:i+3]))
        while len(colors) < color_count:
            colors.append(colors[-1])
        result.append(colors[:color_count])
    
    return result

@app.route('/generate', methods=['POST'])
def api_generate():
    try:
        data = request.get_json()
        style = data.get('style', '')
        color_count = data.get('colorCount', 4)
        batch_size = data.get('batchSize', 20)
        
        print(f"收到请求: style={style}, colorCount={color_count}, batchSize={batch_size}", flush=True)
        
        if not style:
            return jsonify({'code': 400, 'message': '缺少风格参数'}), 400
        
        print(f"风格是否在列表中: {style in styles_cache}", flush=True)
        if style in styles_cache:
            style_idx = label_encoder_cache.transform([style])[0]
            print(f"风格索引: {style_idx}", flush=True)
        
        colors_batch = generate_colors_batch(style, color_count, batch_size)
        print(f"生成的配色示例: {colors_batch[0]}", flush=True)
        
        return jsonify({'code': 200, 'message': 'success', 'data': colors_batch})
    except Exception as e:
        print(f"错误: {str(e)}", flush=True)
        return jsonify({'code': 500, 'message': str(e)}), 500

@app.route('/styles', methods=['GET'])
def api_styles():
    try:
        get_model()
        return jsonify({'code': 200, 'message': 'success', 'data': styles_cache})
    except Exception as e:
        return jsonify({'code': 500, 'message': str(e)}), 500

if __name__ == "__main__":
    print("Loading model...")
    get_model()
    print("Python color generator server started on http://localhost:5000")
    app.run(host='localhost', port=5000, debug=False)