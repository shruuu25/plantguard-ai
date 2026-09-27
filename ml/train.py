"""
Transfer Learning Training Pipeline for PlantGuard AI.
Uses EfficientNetB0 backbone with two-stage training (feature extraction & fine-tuning).
"""

import os
import sys
import json
import argparse
from pathlib import Path
from typing import Optional

import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from tensorflow.keras.applications import EfficientNetB0

from .config import Config, default_config
from .data_prep import get_datasets, get_augmentation_layer


def build_model(num_classes: int, config: Optional[Config] = None) -> tf.keras.Model:
    """
    Constructs the transfer learning architecture:
      Input (224x224x3)
      -> Data Augmentation (train-only)
      -> EfficientNetB0 (include_top=False, weights='imagenet')
      -> GlobalAveragePooling2D
      -> BatchNormalization
      -> Dropout(0.3)
      -> Dense(256, activation='relu')
      -> Dropout(0.2)
      -> Dense(num_classes, activation='softmax')
    """
    cfg = config or default_config

    inputs = layers.Input(shape=cfg.input_shape, name="input_leaf")
    aug = get_augmentation_layer()
    x = aug(inputs)

    base_model = EfficientNetB0(
        include_top=False,
        weights="imagenet",
        input_tensor=x
    )
    base_model.trainable = False

    x = layers.GlobalAveragePooling2D(name="global_avg_pool")(base_model.output)
    x = layers.BatchNormalization(name="batch_norm")(x)
    x = layers.Dropout(cfg.dropout_rate, name="head_dropout_1")(x)
    x = layers.Dense(cfg.dense_units, activation="relu", name="dense_features")(x)
    x = layers.Dropout(cfg.dense_dropout_rate, name="head_dropout_2")(x)
    outputs = layers.Dense(num_classes, activation="softmax", dtype="float32", name="disease_prediction")(x)

    model = models.Model(inputs=inputs, outputs=outputs, name="PlantGuard_EfficientNetB0")
    return model


def unfreeze_top_layers(model: tf.keras.Model, num_layers: int = 30):
    """
    Unfreezes top N convolutional layers of the EfficientNet backbone for fine-tuning.
    Keeps BatchNormalization layers frozen for statistical stability.
    """
    base_model = None
    for layer in model.layers:
        if "efficientnet" in layer.name.lower():
            base_model = layer
            break

    if base_model is not None:
        base_model.trainable = True
        total_layers = len(base_model.layers)
        freeze_until = max(0, total_layers - num_layers)
        for layer in base_model.layers[:freeze_until]:
            layer.trainable = False
        for layer in base_model.layers[freeze_until:]:
            if isinstance(layer, layers.BatchNormalization):
                layer.trainable = False
            else:
                layer.trainable = True
        print(f"[*] Fine-tuning: Unfroze top {num_layers} layers of EfficientNetB0 ({total_layers} total).")
    else:
        for layer in model.layers[-num_layers:]:
            if not isinstance(layer, layers.BatchNormalization):
                layer.trainable = True
        print(f"[*] Fine-tuning: Unfroze top {num_layers} layers.")


def train(config: Config = default_config, quick: bool = False):
    print("=" * 70)
    print("PLANTGUARD AI — EFFICIENTNETB0 TRAINING PIPELINE")
    print("=" * 70)

    config.models_dir.mkdir(parents=True, exist_ok=True)
    config.results_dir.mkdir(parents=True, exist_ok=True)

    max_samples = 50 if quick else None
    train_ds, val_ds, test_ds, classes, counts = get_datasets(
        config=config,
        max_train_samples=max_samples,
        max_val_samples=max_samples,
        max_test_samples=max_samples
    )

    num_classes = counts["num_classes"]
    print(f"[*] Dataset Statistics:")
    print(f"    - Classes:         {num_classes}")
    print(f"    - Train Samples:   {counts['train_samples']:,}")
    print(f"    - Val Samples:     {counts['val_samples']:,}")
    print(f"    - Test Samples:    {counts['test_samples']:,}")

    # Save class names mapping
    with open(config.class_names_path, "w") as f:
        json.dump(classes, f, indent=2)
    print(f"[*] Saved class mappings to {config.class_names_path}")

    # Build model
    print("[*] Building EfficientNetB0 architecture...")
    model = build_model(num_classes=num_classes, config=config)

    # Compile Stage 1
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=config.initial_learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )
    model.summary()

    # Callbacks
    csv_log_path = config.results_dir / "training_log.csv"
    callbacks_list = [
        callbacks.EarlyStopping(
            monitor="val_loss",
            patience=config.early_stopping_patience,
            restore_best_weights=True,
            verbose=1
        ),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.2,
            patience=config.reduce_lr_patience,
            min_lr=1e-6,
            verbose=1
        ),
        callbacks.ModelCheckpoint(
            filepath=str(config.model_save_path),
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1
        ),
        callbacks.CSVLogger(str(csv_log_path))
    ]

    epochs_s1 = 2 if quick else config.epochs_stage1
    print(f"\n[*] STAGE 1: Training feature extraction head ({epochs_s1} epochs)...")
    history_stage1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_s1,
        callbacks=callbacks_list
    )

    # Stage 2: Fine-Tuning
    epochs_s2 = 2 if quick else config.epochs_stage2
    print(f"\n[*] STAGE 2: Fine-tuning top backbone layers ({epochs_s2} epochs)...")
    unfreeze_top_layers(model, num_layers=30)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=config.fine_tune_learning_rate),
        loss="categorical_crossentropy",
        metrics=["accuracy"]
    )

    history_stage2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs_s1 + epochs_s2,
        initial_epoch=len(history_stage1.history["loss"]),
        callbacks=callbacks_list
    )

    # Save final model
    model.save(config.model_save_path)
    print(f"\n[✓] Training complete. Saved model to: {config.model_save_path}")
    return model


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train PlantGuard AI Model")
    parser.add_argument("--quick", action="store_true", help="Run quick sanity check on small subset")
    args = parser.parse_args()

    train(quick=args.quick)
