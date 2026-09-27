"""
Evaluation pipeline for PlantGuard AI.
Computes real test accuracy, precision, recall, F1-score, generates confusion matrix,
classification report, and sample prediction visualizations on the held-out test set.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Optional, Dict, Any

import numpy as np
import tensorflow as tf
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_fscore_support, accuracy_score

from .config import Config, default_config
from .data_prep import get_datasets


def format_class_label(raw_name: str) -> str:
    """Converts raw folder names like 'Tomato___Early_blight' into 'Tomato: Early blight'."""
    parts = raw_name.split("___")
    plant = parts[0].replace("_", " ").strip()
    disease = parts[1].replace("_", " ").strip() if len(parts) > 1 else "Unknown"
    return f"{plant} - {disease}"


def evaluate_model(config: Config = default_config, max_test_samples: Optional[int] = None) -> Dict[str, Any]:
    print("=" * 70)
    print("PLANTGUARD AI — MODEL EVALUATION ON REAL TEST SET")
    print("=" * 70)

    if not config.model_save_path.exists():
        raise FileNotFoundError(f"Model file not found at {config.model_save_path}. Train model first.")

    config.results_dir.mkdir(parents=True, exist_ok=True)

    print(f"[*] Loading trained model from: {config.model_save_path}")
    model = tf.keras.models.load_model(config.model_save_path)

    # Load classes
    with open(config.class_names_path, "r") as f:
        class_names = json.load(f)

    # Prepare datasets (only test set needed)
    print(f"[*] Loading held-out test split from {config.get_dataset_root()}...")
    _, _, test_ds, _, counts = get_datasets(
        config=config,
        max_test_samples=max_test_samples
    )
    print(f"    - Total test samples: {counts['test_samples']:,}")
    print(f"    - Total classes:      {counts['num_classes']}")

    y_true_list = []
    y_pred_probs_list = []

    print("[*] Running inference across test dataset batches...")
    batch_idx = 0
    for images, labels in test_ds:
        preds = model.predict(images, verbose=0)
        y_pred_probs_list.append(preds)
        y_true_batch = np.argmax(labels.numpy(), axis=1)
        y_true_list.append(y_true_batch)
        batch_idx += 1
        if batch_idx % 20 == 0:
            print(f"    - Processed {batch_idx * config.batch_size} samples...")

    y_true = np.concatenate(y_true_list, axis=0)
    y_pred_probs = np.concatenate(y_pred_probs_list, axis=0)
    y_pred = np.argmax(y_pred_probs, axis=1)

    # Compute Metrics
    acc = float(accuracy_score(y_true, y_pred))
    p_macro, r_macro, f1_macro, _ = precision_recall_fscore_support(y_true, y_pred, average="macro", zero_division=0)
    p_weighted, r_weighted, f1_weighted, _ = precision_recall_fscore_support(y_true, y_pred, average="weighted", zero_division=0)

    metrics = {
        "accuracy": round(acc, 4),
        "accuracy_percentage": round(acc * 100, 2),
        "precision_macro": round(float(p_macro), 4),
        "precision_weighted": round(float(p_weighted), 4),
        "recall_macro": round(float(r_macro), 4),
        "recall_weighted": round(float(r_weighted), 4),
        "f1_macro": round(float(f1_macro), 4),
        "f1_weighted": round(float(f1_weighted), 4),
        "total_test_samples": int(len(y_true)),
        "num_classes": int(len(class_names)),
        "model_architecture": "EfficientNetB0 (Transfer Learning)",
        "input_resolution": "224x224x3"
    }

    # Save metrics JSON
    with open(config.metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[✓] Saved metrics summary to: {config.metrics_path}")

    # Generate and save Classification Report
    readable_class_labels = [format_class_label(c) for c in class_names]
    report_text = classification_report(
        y_true,
        y_pred,
        target_names=readable_class_labels,
        digits=4,
        zero_division=0
    )
    with open(config.classification_report_path, "w") as f:
        f.write("PLANTGUARD AI — CLASSIFICATION REPORT\n")
        f.write(f"Model: EfficientNetB0 Transfer Learning\n")
        f.write(f"Test Samples: {len(y_true)}\n")
        f.write(f"Overall Accuracy: {acc * 100:.2f}%\n\n")
        f.write(report_text)
    print(f"[✓] Saved classification report to: {config.classification_report_path}")

    # Generate Confusion Matrix Visualization
    print("[*] Generating confusion matrix heatmap...")
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(18, 16))
    short_labels = [c.split("___")[-1][:15] for c in class_names]
    sns.heatmap(
        cm,
        annot=False,
        cmap="YlGnBu",
        xticklabels=short_labels,
        yticklabels=short_labels
    )
    plt.title(f"PlantGuard AI — Confusion Matrix ({len(y_true)} Real Test Samples, Accuracy: {acc*100:.2f}%)", fontsize=14, pad=15)
    plt.xlabel("Predicted Class", fontsize=12)
    plt.ylabel("Ground Truth Class", fontsize=12)
    plt.xticks(rotation=90, fontsize=8)
    plt.yticks(fontsize=8)
    plt.tight_layout()
    plt.savefig(config.confusion_matrix_path, dpi=200)
    plt.close()
    print(f"[✓] Saved confusion matrix to: {config.confusion_matrix_path}")

    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY:")
    print(f"  * Test Samples:        {metrics['total_test_samples']}")
    print(f"  * Accuracy:            {metrics['accuracy_percentage']}%")
    print(f"  * Macro Precision:     {metrics['precision_macro'] * 100:.2f}%")
    print(f"  * Macro Recall:        {metrics['recall_macro'] * 100:.2f}%")
    print(f"  * Macro F1-Score:      {metrics['f1_macro'] * 100:.2f}%")
    print(f"  * Weighted F1-Score:   {metrics['f1_weighted'] * 100:.2f}%")
    print("=" * 60 + "\n")

    return metrics


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate PlantGuard AI model")
    parser.add_argument("--samples_per_class", type=int, default=None, help="Max test samples per class (default: full test set)")
    args = parser.parse_args()

    evaluate_model(max_test_samples=args.samples_per_class)
