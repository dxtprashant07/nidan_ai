import os
import base64
import numpy as np
import cv2
import tensorflow as tf

# ── Custom objects needed to load .keras models ──────────────────────────────

def dice_coefficient(y_true, y_pred):
    smooth = 1e-6
    y_true = tf.cast(y_true, tf.float32)
    y_pred = tf.cast(y_pred, tf.float32)
    y_true_f = tf.keras.backend.flatten(y_true)
    y_pred_f = tf.keras.backend.flatten(y_pred)
    intersection = tf.reduce_sum(y_true_f * y_pred_f)
    return (2.0 * intersection + smooth) / (
        tf.reduce_sum(y_true_f) + tf.reduce_sum(y_pred_f) + smooth
    )

def iou_score(y_true, y_pred):
    smooth = 1e-6
    y_true = tf.cast(y_true, tf.float32)
    y_pred = tf.cast(y_pred, tf.float32)
    y_true_f = tf.keras.backend.flatten(y_true)
    y_pred_f = tf.keras.backend.flatten(y_pred)
    intersection = tf.reduce_sum(y_true_f * y_pred_f)
    union = tf.reduce_sum(y_true_f) + tf.reduce_sum(y_pred_f) - intersection
    return (intersection + smooth) / (union + smooth)

def dice_loss(y_true, y_pred):
    return 1.0 - dice_coefficient(y_true, y_pred)

def bce_dice_loss(y_true, y_pred):
    y_true = tf.cast(y_true, tf.float32)
    y_pred = tf.cast(y_pred, tf.float32)
    return tf.keras.losses.binary_crossentropy(y_true, y_pred) + dice_loss(y_true, y_pred)

CUSTOM_OBJECTS = {
    "dice_coefficient": dice_coefficient,
    "iou_score": iou_score,
    "dice_loss": dice_loss,
    "bce_dice_loss": bce_dice_loss,
}

# ── Model registry ────────────────────────────────────────────────────────────

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

MODEL_REGISTRY = {
    "retinal_vessel_best": {
        "name": "Retinal Vessel — Best Checkpoint",
        "path": os.path.join(ROOT, "best_retina_vessel_segmentation_model.keras"),
        "description": "Highest validation Dice score checkpoint saved during training",
        "overlay_color_rgb": (255, 50, 50),
    },
    "retinal_vessel_final": {
        "name": "Retinal Vessel — Final Model",
        "path": os.path.join(ROOT, "retina_vessel_segmentation_final_latest.keras"),
        "description": "Final epoch model after full training run",
        "overlay_color_rgb": (255, 140, 0),
    },
    "brain_tumor": {
        "name": "Brain Tumor Segmentation",
        "path": os.path.join(ROOT, "new_best_brain_tumor_model.keras"),
        "description": "Detects and segments tumors in brain MRI scans",
        "overlay_color_rgb": (50, 255, 120),
    },
}

_cache: dict = {}


def get_available_models():
    return [
        {"id": mid, "name": cfg["name"], "description": cfg["description"]}
        for mid, cfg in MODEL_REGISTRY.items()
        if os.path.exists(cfg["path"])
    ]


def _load(model_id: str):
    if model_id in _cache:
        return _cache[model_id]
    cfg = MODEL_REGISTRY.get(model_id)
    if cfg is None:
        raise ValueError(f"Unknown model: {model_id}")
    if not os.path.exists(cfg["path"]):
        raise FileNotFoundError(f"Model file not found: {cfg['path']}")
    model = tf.keras.models.load_model(cfg["path"], custom_objects=CUSTOM_OBJECTS)
    _cache[model_id] = model
    return model


# ── Image helpers ─────────────────────────────────────────────────────────────

def _to_b64(img_rgb: np.ndarray) -> str:
    """Encode an HxWx3 uint8 RGB array as a base64 PNG string."""
    success, buf = cv2.imencode(".png", cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR))
    if not success:
        raise RuntimeError("cv2.imencode failed")
    return base64.b64encode(buf).decode()


def _gray_to_rgb(gray: np.ndarray) -> np.ndarray:
    return cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)


# ── Inference ─────────────────────────────────────────────────────────────────

def run_inference(model_id: str, image_bytes: bytes) -> dict:
    cfg = MODEL_REGISTRY[model_id]
    model = _load(model_id)

    # Decode to grayscale
    arr = np.frombuffer(image_bytes, np.uint8)
    gray = cv2.imdecode(arr, cv2.IMREAD_GRAYSCALE)
    if gray is None:
        raise ValueError("Could not decode image — unsupported format?")

    # Resize & normalise
    gray256 = cv2.resize(gray, (256, 256))
    inp = gray256.astype(np.float32) / 255.0
    inp = inp[np.newaxis, ..., np.newaxis]          # (1,256,256,1)

    # Predict
    prob_map = model.predict(inp, verbose=0)[0, :, :, 0]  # (256,256) float

    # Binary mask
    binary = (prob_map > 0.5).astype(np.uint8)

    # Metrics
    seg_px = int(np.sum(binary))
    total_px = 256 * 256
    coverage = round(seg_px / total_px * 100, 2)
    confidence = (
        round(float(np.mean(prob_map[binary == 1])) * 100, 1) if seg_px > 0 else 0.0
    )
    n_labels, _ = cv2.connectedComponents(binary)
    regions = max(0, n_labels - 1)

    # ── Build output images ──
    orig_rgb = _gray_to_rgb(gray256)

    # Probability heatmap
    heatmap_u8 = (prob_map * 255).astype(np.uint8)
    heatmap_bgr = cv2.applyColorMap(heatmap_u8, cv2.COLORMAP_HOT)
    heatmap_rgb = cv2.cvtColor(heatmap_bgr, cv2.COLOR_BGR2RGB)

    # Coloured overlay
    overlay = orig_rgb.copy()
    color_layer = np.zeros_like(orig_rgb)
    r, g, b = cfg["overlay_color_rgb"]
    color_layer[binary == 1] = [r, g, b]
    overlay = cv2.addWeighted(overlay, 0.65, color_layer, 0.35, 0)

    # Draw contour on overlay for clarity
    contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cv2.drawContours(overlay, contours, -1, (r, g, b), 2)

    return {
        "original_image": _to_b64(orig_rgb),
        "mask_image": _to_b64(heatmap_rgb),
        "overlay_image": _to_b64(overlay),
        "model_used": model_id,
        "model_name": cfg["name"],
        "metrics": {
            "coverage_percent": coverage,
            "detected_regions": regions,
            "mean_confidence": confidence,
            "segmented_pixels": seg_px,
        },
    }
