"""
Automated unit & integration tests for PlantGuard AI Backend API.
Uses FastAPI TestClient to test all endpoints, input validation, and real model inference.
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify health endpoint returns status healthy and model is loaded."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert data["classes_supported"] == 38
    assert "EfficientNetB0" in data["architecture"]


def test_diseases_catalog():
    """Verify diseases catalog returns all 38 supported plant diseases and healthy classes."""
    response = client.get("/diseases")
    assert response.status_code == 200
    data = response.json()
    assert "diseases" in data
    assert data["total"] == 38
    assert len(data["diseases"]) == 38


def test_disease_detail_valid():
    """Verify getting details for a valid disease ID."""
    response = client.get("/diseases/Tomato___Early_blight")
    assert response.status_code == 200
    data = response.json()
    assert "Tomato" in data["plant"]
    assert "Early" in data["disease_name"]
    assert "symptoms" in data
    assert len(data["symptoms"]) > 0


def test_disease_detail_not_found():
    """Verify 404 for an invalid disease ID."""
    response = client.get("/diseases/Non_Existent_Crop___Alien_Virus")
    assert response.status_code == 404


def test_samples_endpoint():
    """Verify list of sample images is returned."""
    response = client.get("/samples")
    assert response.status_code == 200
    data = response.json()
    assert "samples" in data
    assert data["total"] > 0


def test_predict_real_image():
    """Verify inference on a real leaf image."""
    sample_path = PROJECT_ROOT / "dataset" / "samples" / "Tomato_Early_Blight.jpg"
    assert sample_path.exists(), f"Sample image missing at {sample_path}"

    with open(sample_path, "rb") as f:
        file_bytes = f.read()

    response = client.post(
        "/predict",
        files={"file": ("Tomato_Early_Blight.jpg", file_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()

    # Validate output schema
    assert "plant" in data
    assert "disease" in data
    assert "confidence" in data
    assert "status" in data
    assert "top_predictions" in data

    assert data["plant"] == "Tomato"
    assert data["status"] == "Diseased"
    assert data["confidence"] > 50.0
    assert len(data["top_predictions"]) == 3


def test_predict_healthy_image():
    """Verify inference correctly classifies a healthy crop leaf."""
    sample_path = PROJECT_ROOT / "dataset" / "samples" / "Tomato_Healthy.jpg"
    assert sample_path.exists()

    with open(sample_path, "rb") as f:
        file_bytes = f.read()

    response = client.post(
        "/predict",
        files={"file": ("Tomato_Healthy.jpg", file_bytes, "image/jpeg")}
    )
    assert response.status_code == 200
    data = response.json()

    assert data["plant"] == "Tomato"
    assert data["status"] == "Healthy"
    assert data["confidence"] > 50.0


def test_predict_invalid_mime():
    """Verify rejection of non-image file formats."""
    text_content = b"This is not an image file"
    response = client.post(
        "/predict",
        files={"file": ("test.txt", text_content, "text/plain")}
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]


def test_predict_empty_file():
    """Verify rejection of empty files."""
    response = client.post(
        "/predict",
        files={"file": ("empty.jpg", b"", "image/jpeg")}
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()
