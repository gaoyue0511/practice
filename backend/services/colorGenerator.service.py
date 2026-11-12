import numpy as np
import pandas as pd
import mysql.connector
from tensorflow.keras.models import load_model
from sklearn.preprocessing import LabelEncoder
import json
import os
import sys
import warnings
warnings.filterwarnings('ignore')

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "gy030511",
    "database": "color_platform"
}
TABLE_NAME = "train"
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'color_wgangp_final.h5')
MODEL_PATH = os.path.abspath(MODEL_PATH)

model_cache = None
label_encoder_cache = None
styles_cache = None

def rgb2hex(rgb):
    rgb = np.clip(rgb, 0, 1)
    return f'#{int(rgb[0]*255):02X}{int(rgb[1]*255):02X}{int(rgb[2]*255):02X}'

def load_styles_from_db():
    conn = mysql.connector.connect(**DB_CONFIG)
    df = pd.read_sql(f"SELECT DISTINCT style_name FROM {TABLE_NAME}", conn)
    conn.close()
    return df['style_name'].tolist()

def load_styles_from_npy():
    styles_path = os.path.join(os.path.dirname(__file__), 'styles.npy')
    return np.load(styles_path, allow_pickle=True).tolist()

def get_model():
    global model_cache, label_encoder_cache, styles_cache
    if model_cache is None:
        model_cache = load_model(MODEL_PATH, compile=False)
        styles_cache = load_styles_from_npy()
        label_encoder_cache = LabelEncoder()
        label_encoder_cache.fit(styles_cache)
        print("READY", flush=True)
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

if __name__ == "__main__":
    import time
    model, label_encoder, styles = get_model()
    sys.stdout.write(f"LOADED|{len(styles)}\n")
    sys.stdout.flush()

    while True:
        try:
            line = sys.stdin.readline()
            if not line:
                break

            line = line.strip()
            parts = line.split('|')
            cmd = parts[0]

            if cmd == "GEN":
                style = parts[1]
                count = int(parts[2]) if len(parts) > 2 else 4
                req_id = parts[3] if len(parts) > 3 else "0"
                colors = generate_colors(style, count)
                sys.stdout.write(f"RES|{req_id}|{json.dumps(colors, ensure_ascii=False)}\n")
                sys.stdout.flush()

            elif cmd == "GEN_BATCH":
                style = parts[1]
                count = int(parts[2]) if len(parts) > 2 else 4
                batch_size = int(parts[3]) if len(parts) > 3 else 20
                req_id = parts[4] if len(parts) > 4 else "0"
                colors_batch = generate_colors_batch(style, count, batch_size)
                sys.stdout.write(f"RES|{req_id}|{json.dumps(colors_batch, ensure_ascii=False)}\n")
                sys.stdout.flush()

            elif cmd == "STYLES":
                req_id = parts[1] if len(parts) > 1 else "0"
                sys.stdout.write(f"RES|{req_id}|{json.dumps(styles, ensure_ascii=False)}\n")
                sys.stdout.flush()

            elif cmd == "PING":
                sys.stdout.write("PONG\n")
                sys.stdout.flush()

        except Exception as e:
            sys.stdout.write(f"ERR|{str(e)}\n")
            sys.stdout.flush()