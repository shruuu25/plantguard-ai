"""
Data preparation, dataset discovery, and tf.data pipelines for PlantGuard AI.
Handles the 38-class PlantVillage dataset, deterministic splitting, and augmentation.
"""

import os
import json
import random
from pathlib import Path
from typing import List, Tuple, Dict, Optional
import tensorflow as tf
from tensorflow.keras import layers
from .config import Config, default_config

VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".JPG", ".JPEG", ".PNG"}


def get_augmentation_layer() -> tf.keras.Sequential:
    """
    Keras Sequential data augmentation pipeline.
    Active only during model training, inactive during inference/evaluation.
    """
    return tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical", name="aug_random_flip"),
        layers.RandomRotation(0.15, fill_mode="nearest", name="aug_random_rotation"),
        layers.RandomZoom(0.1, fill_mode="nearest", name="aug_random_zoom"),
        layers.RandomContrast(0.1, name="aug_random_contrast"),
    ], name="data_augmentation")


def discover_classes(dataset_root: Path) -> List[str]:
    """
    Discovers all 38 class directories from the dataset.
    """
    train_dir = dataset_root / "train" if (dataset_root / "train").exists() else dataset_root
    classes = sorted([
        d.name for d in train_dir.iterdir()
        if d.is_dir() and not d.name.startswith(".")
    ])
    if not classes:
        raise ValueError(f"No class directories found in {train_dir}")
    return classes


def get_image_paths_and_labels(
    dataset_root: Path,
    classes: List[str],
    split: str = "train",
    max_samples_per_class: Optional[int] = None,
    seed: int = 42
) -> Tuple[List[str], List[int]]:
    """
    Gathers image paths and zero-indexed integer labels.
    Uses 'train' directory for training split.
    Splits the 'val' directory deterministically 50/50 into validation and test splits
    to ensure zero data leakage and proper evaluation.
    """
    class_to_idx = {name: idx for idx, name in enumerate(classes)}
    paths: List[str] = []
    labels: List[int] = []

    rng = random.Random(seed)

    split_dir_name = "val" if split in ("val", "test") else "train"
    base_split_dir = dataset_root / split_dir_name
    if not base_split_dir.exists():
        base_split_dir = dataset_root

    for cls_name in classes:
        cls_dir = base_split_dir / cls_name
        if not cls_dir.exists():
            continue

        images = sorted([
            str(p) for p in cls_dir.iterdir()
            if p.suffix in VALID_IMAGE_EXTENSIONS and not p.name.startswith(".")
        ])
        rng.shuffle(images)

        if split == "val":
            # First 50% of the validation directory
            selected = images[: len(images) // 2]
        elif split == "test":
            # Second 50% of the validation directory as held-out test set
            selected = images[len(images) // 2 :]
        else:
            # Training split
            selected = images

        if max_samples_per_class is not None and len(selected) > max_samples_per_class:
            selected = selected[:max_samples_per_class]

        paths.extend(selected)
        labels.extend([class_to_idx[cls_name]] * len(selected))

    return paths, labels


def create_tf_dataset(
    paths: List[str],
    labels: List[int],
    num_classes: int,
    image_size: Tuple[int, int] = (224, 224),
    batch_size: int = 32,
    is_training: bool = False,
    shuffle_buffer: int = 2000
) -> tf.data.Dataset:
    """
    Builds a high-performance tf.data pipeline.
    """
    def parse_image_and_label(path_tensor, label_tensor):
        img_bytes = tf.io.read_file(path_tensor)
        img = tf.image.decode_image(img_bytes, channels=3, expand_animations=False)
        img = tf.image.resize(img, image_size, method="bilinear")
        img.set_shape([image_size[0], image_size[1], 3])
        # EfficientNet expects pixel values in [0, 255] float range
        img = tf.keras.applications.efficientnet.preprocess_input(img)
        one_hot = tf.one_hot(label_tensor, depth=num_classes)
        return img, one_hot

    path_ds = tf.data.Dataset.from_tensor_slices(paths)
    label_ds = tf.data.Dataset.from_tensor_slices(labels)
    ds = tf.data.Dataset.zip((path_ds, label_ds))

    if is_training:
        ds = ds.shuffle(buffer_size=min(len(paths), shuffle_buffer), reshuffle_each_iteration=True)

    ds = ds.map(parse_image_and_label, num_parallel_calls=tf.data.AUTOTUNE)
    ds = ds.batch(batch_size)
    ds = ds.prefetch(buffer_size=tf.data.AUTOTUNE)
    return ds


def get_datasets(
    config: Optional[Config] = None,
    max_train_samples: Optional[int] = None,
    max_val_samples: Optional[int] = None,
    max_test_samples: Optional[int] = None
) -> Tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset, List[str], Dict[str, int]]:
    """
    Prepares train, validation, and test datasets.
    """
    cfg = config or default_config
    dataset_root = cfg.get_dataset_root()
    classes = discover_classes(dataset_root)
    num_classes = len(classes)

    train_paths, train_labels = get_image_paths_and_labels(
        dataset_root, classes, split="train", max_samples_per_class=max_train_samples, seed=cfg.random_seed
    )
    val_paths, val_labels = get_image_paths_and_labels(
        dataset_root, classes, split="val", max_samples_per_class=max_val_samples, seed=cfg.random_seed
    )
    test_paths, test_labels = get_image_paths_and_labels(
        dataset_root, classes, split="test", max_samples_per_class=max_test_samples, seed=cfg.random_seed
    )

    counts = {
        "num_classes": num_classes,
        "train_samples": len(train_paths),
        "val_samples": len(val_paths),
        "test_samples": len(test_paths),
        "total_samples": len(train_paths) + len(val_paths) + len(test_paths)
    }

    train_ds = create_tf_dataset(
        train_paths, train_labels, num_classes, cfg.image_size, cfg.batch_size, is_training=True
    )
    val_ds = create_tf_dataset(
        val_paths, val_labels, num_classes, cfg.image_size, cfg.batch_size, is_training=False
    )
    test_ds = create_tf_dataset(
        test_paths, test_labels, num_classes, cfg.image_size, cfg.batch_size, is_training=False
    )

    return train_ds, val_ds, test_ds, classes, counts


if __name__ == "__main__":
    cfg = Config()
    root = cfg.get_dataset_root()
    print(f"Dataset root: {root}")
    classes = discover_classes(root)
    print(f"Found {len(classes)} classes:")
    for i, c in enumerate(classes):
        print(f"  {i+1:2d}. {c}")
