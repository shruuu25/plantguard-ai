"""
Configuration settings for PlantGuard AI Machine Learning Pipeline.
"""

import os
from pathlib import Path
from dataclasses import dataclass
from typing import Tuple, List

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# Set local cache and configuration dirs to prevent sandbox errors
os.environ.setdefault("KERAS_HOME", str(PROJECT_ROOT / ".keras"))
os.environ.setdefault("MPLCONFIGDIR", str(PROJECT_ROOT / "results" / ".matplotlib"))


@dataclass
class Config:
    # Directory paths
    project_root: Path = PROJECT_ROOT
    ml_dir: Path = PROJECT_ROOT / "ml"
    models_dir: Path = PROJECT_ROOT / "models"
    results_dir: Path = PROJECT_ROOT / "results"
    dataset_dir: Path = PROJECT_ROOT / "dataset"
    backend_dir: Path = PROJECT_ROOT / "backend"

    # Dataset paths
    raw_data_dir: Path = PROJECT_ROOT / "dataset" / "raw" / "PlantVillage"
    default_system_dataset: Path = Path(os.path.expanduser("~/Downloads/PlantVillageReal/PlantVillage"))
    disease_info_path: Path = PROJECT_ROOT / "backend" / "diseases.json"

    # Model artifact paths
    model_save_path: Path = PROJECT_ROOT / "models" / "plant_disease_model.keras"
    class_names_path: Path = PROJECT_ROOT / "models" / "class_names.json"

    # Evaluation results paths
    metrics_path: Path = PROJECT_ROOT / "results" / "metrics.json"
    confusion_matrix_path: Path = PROJECT_ROOT / "results" / "confusion_matrix.png"
    classification_report_path: Path = PROJECT_ROOT / "results" / "classification_report.txt"
    training_history_path: Path = PROJECT_ROOT / "results" / "training_history.png"

    # Model image specifications
    image_size: Tuple[int, int] = (224, 224)
    num_channels: int = 3
    input_shape: Tuple[int, int, int] = (224, 224, 3)

    # Architecture hyperparameters
    backbone: str = "EfficientNetB0"
    dense_units: int = 256
    dropout_rate: float = 0.3
    dense_dropout_rate: float = 0.2

    # Training hyperparameters
    batch_size: int = 32
    initial_learning_rate: float = 1e-4
    fine_tune_learning_rate: float = 1e-5
    epochs_stage1: int = 5
    epochs_stage2: int = 5
    early_stopping_patience: int = 3
    reduce_lr_patience: int = 2
    random_seed: int = 42

    def get_dataset_root(self) -> Path:
        """Finds the active real dataset path."""
        candidates = [
            self.raw_data_dir,
            self.default_system_dataset,
            Path(os.path.expanduser("~/Downloads/PlantVillage")),
            Path(os.path.expanduser("~/Documents/PlantVillage")),
        ]
        for p in candidates:
            if p.exists() and (p / "train").exists():
                return p.resolve()
            if p.exists() and len(list(p.glob("*/*"))) > 100:
                return p.resolve()
        raise FileNotFoundError(
            f"PlantVillage dataset not found. Checked: {[str(c) for c in candidates]}"
        )


default_config = Config()
