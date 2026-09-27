# 🌱 PlantGuard AI — Plant Disease Detection System

[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-2.21-FF6F00.svg?style=flat&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **PlantGuard AI** is a production-grade Agricultural Machine Learning platform that diagnoses plant foliage pathology from leaf photos in real time. Leveraging **EfficientNetB0 Transfer Learning** trained on **54,305 real PlantVillage images**, the system predicts plant species, disease diagnosis, confidence metrics, and delivers comprehensive treatment protocols across **38 botanical classes**.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
- [Dataset Specifications](#-dataset-specifications)
- [Supported 38 Classes](#-supported-38-classes)
- [Evaluation Results & Real Metrics](#-evaluation-results--real-metrics)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Running Locally](#-running-locally)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Docker Deployment](#-docker-deployment)
- [Cloud Deployment Guide](#-cloud-deployment-guide)
- [Future Improvements](#-future-improvements)

---

## 🌿 Overview

Foliage diseases threaten food security, reduce agricultural yield, and inflict significant economic losses on farmers worldwide. **PlantGuard AI** bridges the gap between deep learning research and practical agronomy by providing:
1. **Instant Disease Diagnosis**: Identifies whether a crop leaf is healthy or affected by bacterial, fungal, or viral pathogens.
2. **Top-3 Candidate Ranking**: Exposes multi-class probability distributions to prevent misdiagnosis.
3. **Agronomic Prescription**: Curated symptoms, cultural/mechanical controls, targeted chemical and bio-fungicides, and preventive sanitation measures.

---

## ✨ Key Features

- **Real PlantVillage Dataset**: Trained on 54,305 genuine agricultural photographs across 38 classes (no procedurally generated fake images).
- **EfficientNetB0 Backbone**: Compound-scaled convolutional architecture achieving **91.37% test accuracy** with high inference throughput.
- **Top-3 Candidate Ranking**: Returns sorted confidence distributions for transparent diagnostic assessment.
- **Agricultural Advisory Engine**: Structured management guidance covering cultural practices, chemical/biological remedies, and preventive measures.
- **Modern Responsive Web UI**: Built with React 18, Vite, and Tailwind CSS featuring drag-and-drop file upload, live previews, and sample test galleries.
- **High-Performance FastAPI Backend**: RESTful API with automated MIME validation, asynchronous file streaming, and health telemetry.
- **Production Containerization**: Multi-stage Dockerfile and docker-compose.yml for unified local orchestration.

---

## 🏛 System Architecture

```
User (Browser) 
  --> React 18 + Vite UI (Drag-and-Drop / Sample Selection)
  --> POST /predict (Multipart Form-Data)
  --> FastAPI Backend Server
  --> Image Preprocessing (224x224 Bilinear Resize, EfficientNet Preprocessing)
  --> EfficientNetB0 Deep Learning Model (Softmax across 38 classes)
  --> Agronomic Knowledge Base (Symptoms, Prevention, Treatments)
  --> Diagnostic Response Payload (Confidence, Severity, Top-3 Predictions)
  --> Interactive Result Card with Probability Gauges
```

---

## 🧠 Machine Learning Pipeline

### 1. Preprocessing & Data Augmentation
- Input images are resized to (224, 224, 3) using bilinear interpolation.
- Normalization via tf.keras.applications.efficientnet.preprocess_input.
- On-the-fly training augmentation:
  - Random horizontal and vertical flips (RandomFlip)
  - Random rotations (+/- 15%) (RandomRotation)
  - Random zoom (+/- 10%) (RandomZoom)
  - Random contrast adjustments (RandomContrast)

### 2. Transfer Learning Architecture
- **Backbone**: EfficientNetB0 pre-trained on ImageNet (weights frozen during Stage 1).
- **Global Pooling**: GlobalAveragePooling2D to extract spatial feature maps.
- **Regularization**: BatchNormalization and Dropout(0.3).
- **Feature Layer**: Fully-connected Dense(256, activation='relu').
- **Classification Head**: Dropout(0.2) followed by Dense(38, activation='softmax').

### 3. Two-Stage Training Schedule
- **Stage 1 (Feature Extraction)**: Backbone frozen, Adam optimizer (lr = 1e-4), categorical cross-entropy loss.
- **Stage 2 (Backbone Fine-Tuning)**: Top 30 convolutional layers unfrozen (with batch norm layers kept frozen), Adam optimizer with lower learning rate (lr = 1e-5).
- **Callbacks**: EarlyStopping (patience=3), ReduceLROnPlateau (factor=0.2, patience=2), and ModelCheckpoint.

---

## 📊 Dataset Specifications

The model is trained and evaluated on the official **PlantVillage** dataset:
- **Total Images**: 54,305 real photographs
- **Training Set**: 43,444 images
- **Validation Set**: 5,430 images
- **Held-Out Test Set**: 5,431 images (evaluated on 1,124 representative test samples)
- **Crops Represented**: 14 distinct agricultural species:
  - Apple, Blueberry, Cherry, Corn (Maize), Grape, Orange, Peach, Pepper (Bell), Potato, Raspberry, Soybean, Squash, Strawberry, Tomato.

---

## 🏷 Supported 38 Classes

| # | Crop | Pathology / Class Name | Status |
|---|---|---|---|
| 1 | Apple | Apple Scab (Venturia inaequalis) | Diseased |
| 2 | Apple | Black Rot (Botryosphaeria obtusa) | Diseased |
| 3 | Apple | Cedar Apple Rust (Gymnosporangium juniperi-virginianae) | Diseased |
| 4 | Apple | Healthy Foliage | Healthy |
| 5 | Blueberry | Healthy Foliage | Healthy |
| 6 | Cherry | Powdery Mildew (Podosphaera clandestina) | Diseased |
| 7 | Cherry | Healthy Foliage | Healthy |
| 8 | Corn | Cercospora Leaf Spot / Gray Leaf Spot | Diseased |
| 9 | Corn | Common Rust (Puccinia sorghi) | Diseased |
| 10 | Corn | Northern Leaf Blight (Exserohilum turcicum) | Diseased |
| 11 | Corn | Healthy Foliage | Healthy |
| 12 | Grape | Black Rot (Guignardia bidwellii) | Diseased |
| 13 | Grape | Esca (Black Measles) | Diseased |
| 14 | Grape | Leaf Blight (Isariopsis clavispora) | Diseased |
| 15 | Grape | Healthy Foliage | Healthy |
| 16 | Orange | Citrus Greening (Huanglongbing) | Diseased |
| 17 | Peach | Bacterial Spot (Xanthomonas campestris) | Diseased |
| 18 | Peach | Healthy Foliage | Healthy |
| 19 | Pepper | Bacterial Spot (Xanthomonas euvesicatoria) | Diseased |
| 20 | Pepper | Healthy Foliage | Healthy |
| 21 | Potato | Early Blight (Alternaria solani) | Diseased |
| 22 | Potato | Late Blight (Phytophthora infestans) | Diseased |
| 23 | Potato | Healthy Foliage | Healthy |
| 24 | Raspberry | Healthy Foliage | Healthy |
| 25 | Soybean | Healthy Foliage | Healthy |
| 26 | Squash | Powdery Mildew (Podosphaera xanthii) | Diseased |
| 27 | Strawberry | Leaf Scorch (Diplocarpon earlianum) | Diseased |
| 28 | Strawberry | Healthy Foliage | Healthy |
| 29 | Tomato | Bacterial Spot (Xanthomonas vesicatoria) | Diseased |
| 30 | Tomato | Early Blight (Alternaria solani) | Diseased |
| 31 | Tomato | Late Blight (Phytophthora infestans) | Diseased |
| 32 | Tomato | Leaf Mold (Passalora fulva) | Diseased |
| 33 | Tomato | Septoria Leaf Spot (Septoria lycopersici) | Diseased |
| 34 | Tomato | Spider Mites (Tetranychus urticae) | Diseased |
| 35 | Tomato | Target Spot (Corynespora cassiicola) | Diseased |
| 36 | Tomato | Tomato Yellow Leaf Curl Virus | Diseased |
| 37 | Tomato | Tomato Mosaic Virus | Diseased |
| 38 | Tomato | Healthy Foliage | Healthy |

---

## 📈 Evaluation Results & Real Metrics

The model was rigorously benchmarked on a held-out test split of **1,124 real test samples** across all 38 classes:

| Metric | Score | Description |
|---|---|---|
| **Overall Accuracy** | **91.37%** | Proportion of correctly identified plant diseases |
| **Macro Precision** | **92.22%** | Unweighted mean precision across all 38 classes |
| **Macro Recall** | **91.41%** | Unweighted mean recall across all 38 classes |
| **Macro F1-Score** | **91.35%** | Harmonic mean of macro precision and recall |
| **Weighted F1-Score** | **91.42%** | Class-frequency weighted harmonic mean |
| **Test Set Volume** | **1,124** | Real unseen held-out leaf images |

All evaluation outputs are saved locally in the results/ directory:
- results/metrics.json
- results/classification_report.txt
- results/confusion_matrix.png
- results/training_history.png

---

## 💻 Tech Stack

- **Machine Learning**: TensorFlow 2.21, Keras 3.15, Scikit-Learn 1.9, NumPy 2.2, Pillow 12.3
- **Visualization**: Matplotlib 3.11, Seaborn 0.13
- **Backend API**: FastAPI 0.141, Uvicorn 0.53, Pydantic v2, Python-Multipart
- **Frontend**: React 18, Vite 5.2, Tailwind CSS 3.4, Lucide React Icons
- **DevOps & Containers**: Docker, Docker Compose, Git / GitHub

---

## 📁 Project Structure

```
plantguard-ai/
│
├── frontend/                     # React + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/           # UI Components (Upload, Results, Catalog, Dashboard)
│   │   ├── services/             # Axios/Fetch API client
│   │   ├── App.jsx               # Main React Application
│   │   ├── index.css             # Tailwind Design System
│   │   └── main.jsx              # React Entry Point
│   ├── public/                   # Static assets & sample images
│   ├── package.json              # Frontend dependencies
│   ├── vite.config.js            # Vite configuration
│   └── tailwind.config.js        # Tailwind Theme Configuration
│
├── backend/                      # FastAPI REST Backend
│   ├── main.py                   # FastAPI Application & Endpoints
│   ├── diseases.json             # 38-class encyclopedic database
│   └── test_api.py               # Pytest suite with 9 unit/integration tests
│
├── ml/                           # Machine Learning Pipeline
│   ├── config.py                 # Hyperparameters & path configurations
│   ├── data_prep.py              # Real dataset discovery, split & tf.data
│   ├── train.py                  # Two-stage EfficientNetB0 transfer learning
│   ├── evaluate.py               # Comprehensive evaluation & metrics generator
│   └── predict.py                # Standalone inference & preprocessing module
│
├── models/
│   ├── plant_disease_model.keras # 32.8 MB trained EfficientNetB0 weights
│   └── class_names.json          # 38 class mapping JSON
│
├── dataset/
│   ├── samples/                  # Real test leaf images for quick evaluation
│   └── disease_info.json         # Agronomic metadata backup
│
├── results/                      # Real evaluation reports & plots
│   ├── metrics.json              # Exact numerical evaluation summary
│   ├── classification_report.txt # Per-class precision, recall, f1-score
│   ├── confusion_matrix.png      # 38x38 confusion matrix heatmap
│   └── training_history.png      # Training loss & accuracy curves
│
├── notebooks/
│   └── PlantGuard_Exploration.ipynb  # Interactive Jupyter notebook
│
├── requirements.txt              # Backend & ML Python dependencies
├── .gitignore                    # Git ignore file
├── Dockerfile                    # Containerization for production deployment
├── docker-compose.yml            # Multi-service local orchestration
├── render.yaml                   # Render deployment configuration
└── README.md                     # Comprehensive project documentation
```

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/shruuu25/plantguard-ai.git
cd plantguard-ai
```

### 2. Python Environment Setup
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cd ..
```

---

## ⚡ Running Locally

### Start the Backend Server
```bash
# From project root:
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at:
- Swagger UI: http://localhost:8000/docs
- Redoc: http://localhost:8000/redoc

### Start the Frontend Application
```bash
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🧪 Testing

### Automated Backend Tests
Run the automated pytest suite covering health checks, disease catalog retrieval, image validation, and real model inference:
```bash
pytest backend/test_api.py -v
```
Output:
```
backend/test_api.py::test_health_endpoint PASSED                         [ 11%]
backend/test_api.py::test_diseases_catalog PASSED                        [ 22%]
backend/test_api.py::test_disease_detail_valid PASSED                    [ 33%]
backend/test_api.py::test_disease_detail_not_found PASSED                [ 44%]
backend/test_api.py::test_samples_endpoint PASSED                        [ 55%]
backend/test_api.py::test_predict_real_image PASSED                      [ 66%]
backend/test_api.py::test_predict_healthy_image PASSED                   [ 77%]
backend/test_api.py::test_predict_invalid_mime PASSED                    [ 88%]
backend/test_api.py::test_predict_empty_file PASSED                      [100%]
============================== 9 passed in 27.07s ==============================
```

### Standalone ML Prediction CLI
Test model inference directly from the command line:
```bash
python -m ml.predict dataset/samples/Tomato_Early_Blight.jpg
```

---

## 📡 API Documentation

### Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Service health status, model readiness, and class count |
| GET | `/stats` | Verified evaluation benchmark metrics and model specs |
| GET | `/diseases` | Comprehensive encyclopedia of all 38 classes |
| GET | `/diseases/{id}` | Detailed agronomic profile for a specific class ID |
| GET | `/samples` | Bundled real specimen images for quick testing |
| POST | `/predict` | Leaf image diagnostic inference with Top-3 predictions |

---

## 🐳 Docker Deployment

Run both backend and frontend containers using Docker Compose:
```bash
# Build and run containers
docker-compose up --build
```
Access points:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## ☁️ Cloud Deployment Guide

### Frontend Deployment (Vercel)
1. Fork or push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the `plantguard-ai` repository.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, set:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://plantguard-ai-backend.onrender.com`).
6. Click **Deploy**.

### Backend Deployment (Render)
1. Log in to [Render](https://render.com/) and click **New Web Service**.
2. Connect your GitHub repository `shruuu25/plantguard-ai`.
3. Choose **Docker** environment (or Python environment using `render.yaml`).
4. Set port to `8000`.
5. Click **Create Web Service**.

---

## 🔮 Future Improvements

- **Mobile App Integration**: React Native / Flutter client for offline field inspections using TensorFlow Lite (.tflite).
- **Severity Segmentation**: U-Net architecture for pixel-level lesion percentage quantification.
- **Multilingual Support**: Translation of agronomic advisories into Hindi, Spanish, Swahili, and regional languages for global farming accessibility.

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.
