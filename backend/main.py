import os
import io
import time
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
from PIL import Image
import numpy as np
import firebase_admin
from firebase_admin import auth, credentials
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# ==========================================
# LAYER 3 & 5 SECURITY: API Backend
# ==========================================

# 1. Rate Limiting
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="SilkSphere Secure API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# 2. CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Firebase Auth (optional — only if serviceAccountKey.json exists)
cred_path = os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json")
if os.path.exists(cred_path):
    cred = credentials.Certificate(cred_path)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)

# 4. Load AI Model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "silkworm_disease_model.keras")
model = None
if os.path.exists(MODEL_PATH):
    print("Loading AI model...")
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    print("Model loaded successfully.")
else:
    print(f"Warning: Model not found at {MODEL_PATH}")


class PredictionResponse(BaseModel):
    class_name: str
    confidence: float
    timestamp: float


@app.get("/")
def health_check():
    return {"status": "Secure API is running", "model_loaded": model is not None}


@app.get("/debug")
def debug_predict():
    """Returns raw model output on test inputs to diagnose threshold."""
    if model is None:
        return {"error": "model not loaded"}
    results = {}
    for name, arr_raw in [
        ("all_zeros", np.zeros((224, 224, 3), dtype=np.float32)),
        ("all_128",   np.full((224, 224, 3), 128, dtype=np.float32)),
        ("random",    np.random.randint(0, 255, (224, 224, 3)).astype(np.float32)),
    ]:
        arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr_raw)
        arr = np.expand_dims(arr, axis=0)
        raw = float(model.predict(arr, verbose=0)[0][0])
        results[name] = {"raw": round(raw, 6), "label": "Grasserie" if raw > 0.5 else "Healthy"}
    return results


@app.post("/predict", response_model=PredictionResponse)
@limiter.limit("30/minute")
def predict_disease(
    request: Request,
    file: UploadFile = File(...),
):
    if model is None:
        raise HTTPException(status_code=500, detail="Model is not loaded.")

    allowed_extensions = ["jpg", "jpeg", "png"]
    ext = file.filename.split(".")[-1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG and PNG allowed.")

    try:
        contents = file.file.read()

        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

        image = Image.open(io.BytesIO(contents))
        if image.mode != "RGB":
            image = image.convert("RGB")

        image = image.resize((224, 224))

        # MobileNetV2 preprocessing: scale pixels to [-1, 1]
        img_array = tf.keras.applications.mobilenet_v2.preprocess_input(
            np.array(image, dtype=np.float32)
        )
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array, verbose=0)[0][0]

        # sigmoid output: 1 = Grasserie (infected), 0 = Healthy
        class_name = "Grasserie" if prediction > 0.5 else "Healthy"
        confidence = float(prediction) if prediction > 0.5 else float(1.0 - prediction)

        return PredictionResponse(
            class_name=class_name,
            confidence=confidence,
            timestamp=time.time()
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {e}")
