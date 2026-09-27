"""
Inference module for PlantGuard AI.
Performs leaf validation, exact EfficientNet preprocessing, and multi-class prediction.
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, Any, List, Optional, Union
from PIL import Image
import numpy as np
import tensorflow as tf

from .config import Config, default_config

_CACHED_MODEL = None
_CACHED_CLASSES = None
_CACHED_DISEASES = None


def get_inference_resources(config: Config = default_config):
    """Loads and caches the model and metadata dictionaries in memory."""
    global _CACHED_MODEL, _CACHED_CLASSES, _CACHED_DISEASES

    if _CACHED_MODEL is None:
        if not config.model_save_path.exists():
            raise FileNotFoundError(f"Model not found at {config.model_save_path}")
        _CACHED_MODEL = tf.keras.models.load_model(config.model_save_path)

    if _CACHED_CLASSES is None:
        with open(config.class_names_path, "r") as f:
            _CACHED_CLASSES = json.load(f)

    if _CACHED_DISEASES is None:
        if config.disease_info_path.exists():
            with open(config.disease_info_path, "r") as f:
                _CACHED_DISEASES = json.load(f)
        else:
            _CACHED_DISEASES = {}

    return _CACHED_MODEL, _CACHED_CLASSES, _CACHED_DISEASES


def preprocess_image(image_input: Union[str, Path, Image.Image, bytes], target_size=(224, 224)) -> np.ndarray:
    """
    Standardized preprocessing pipeline identical to training:
      1. Load as RGB PIL Image
      2. Bilinear resize to 224x224
      3. Convert to float array [0, 255]
      4. Apply tf.keras.applications.efficientnet.preprocess_input
      5. Add batch dimension -> (1, 224, 224, 3)
    """
    if isinstance(image_input, (str, Path)):
        img = Image.open(image_input).convert("RGB")
    elif isinstance(image_input, bytes):
        import io
        img = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, Image.Image):
        img = image_input.convert("RGB")
    else:
        raise ValueError(f"Unsupported image input type: {type(image_input)}")

    img = img.resize(target_size, Image.Resampling.BILINEAR)
    arr = np.array(img, dtype=np.float32)
    # Apply EfficientNet preprocessing
    arr = tf.keras.applications.efficientnet.preprocess_input(arr)
    batch_arr = np.expand_dims(arr, axis=0)
    return batch_arr


def parse_class_label(raw_class: str) -> Dict[str, str]:
    """Parses raw directory string into clean plant and disease names."""
    parts = raw_class.split("___")
    plant = parts[0].replace("_", " ").strip()
    if len(parts) > 1:
        disease = parts[1].replace("_", " ").strip()
    else:
        disease = "Healthy" if "healthy" in raw_class.lower() else "Unknown"

    is_healthy = "healthy" in disease.lower() or "healthy" in plant.lower()
    status = "Healthy" if is_healthy else "Diseased"

    return {
        "plant": plant,
        "disease": "Healthy" if is_healthy else disease,
        "status": status,
        "raw_class": raw_class
    }


def predict_leaf(
    image_input: Union[str, Path, Image.Image, bytes],
    top_k: int = 3,
    config: Config = default_config
) -> Dict[str, Any]:
    """
    Performs inference on a single leaf image.
    Returns:
      - plant (e.g. Tomato)
      - disease (e.g. Early Blight)
      - confidence (float percentage, e.g. 96.4)
      - status (Healthy / Diseased)
      - top_predictions (list of top K candidates)
      - disease_details (symptoms, cultural & chemical treatment, prevention)
    """
    model, class_names, diseases_db = get_inference_resources(config)
    preprocessed_img = preprocess_image(image_input, target_size=config.image_size)

    raw_preds = model.predict(preprocessed_img, verbose=0)[0]

    # Sort indices descending
    top_indices = np.argsort(raw_preds)[::-1][:top_k]

    top_predictions = []
    for idx in top_indices:
        cls_key = class_names[idx]
        prob = float(raw_preds[idx])
        parsed = parse_class_label(cls_key)
        top_predictions.append({
            "class_id": cls_key,
            "plant": parsed["plant"],
            "disease": parsed["disease"],
            "status": parsed["status"],
            "confidence": round(prob * 100, 2),
            "probability": round(prob, 4)
        })

    primary = top_predictions[0]
    matched_info = diseases_db.get(primary["class_id"], {})

    return {
        "plant": primary["plant"],
        "disease": primary["disease"],
        "confidence": primary["confidence"],
        "status": primary["status"],
        "raw_class": primary["class_id"],
        "scientific_name": matched_info.get("scientific_name", "N/A"),
        "severity": matched_info.get("severity", "Normal"),
        "symptoms": matched_info.get("symptoms", []),
        "treatment": matched_info.get("treatment", {
            "cultural": matched_info.get("cultural_treatment", []),
            "chemical": matched_info.get("chemical_treatment", [])
        }),
        "prevention": matched_info.get("prevention", []),
        "top_predictions": top_predictions
    }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m ml.predict <path_to_image>")
        sys.exit(1)

    img_path = sys.argv[1]
    result = predict_leaf(img_path)
    print(json.dumps(result, indent=2))
