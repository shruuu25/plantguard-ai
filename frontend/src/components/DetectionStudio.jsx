import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  FileCheck,
  ScanLine
} from 'lucide-react';
import { SAMPLE_IMAGES, dataURLtoFile } from './SampleImages';
import PredictionResultCard from './PredictionResultCard';
import { predictDisease } from '../services/api';

export default function DetectionStudio({ onHistoryAdd }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (file) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image (JPG, PNG, or WebP).');
      return;
    }

    // Validate size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit.');
      return;
    }

    setErrorMessage(null);
    setPredictionResult(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Load a curated sample image
  const handleSelectSample = (sample) => {
    setErrorMessage(null);
    setPredictionResult(null);
    setImagePreview(sample.dataUri);
    const file = dataURLtoFile(sample.dataUri, sample.filename);
    setSelectedFile(file);
  };

  // Clear image selection
  const handleReset = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setPredictionResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Run AI analysis
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select or upload a leaf image first.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await predictDisease(selectedFile);
      setPredictionResult(result);
      if (onHistoryAdd) {
        onHistoryAdd({
          id: Date.now(),
          disease: result.disease,
          plant: result.plant,
          confidence: result.confidence,
          timestamp: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
          imagePreview: imagePreview
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to complete leaf diagnostics. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Leaf Diagnostics Studio
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Upload a high-resolution photo of an infected or healthy leaf to initiate 
          EfficientNetB0 classification and Grad-CAM interpretability.
        </p>
      </div>

      {/* Main Upload Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-900/10 shadow-lg mb-8">
        
        {/* Upload Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !imagePreview && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer overflow-hidden ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/50'
              : imagePreview
              ? 'border-emerald-300/80 bg-emerald-50/20 cursor-default'
              : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50 hover:bg-emerald-50/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {imagePreview ? (
            <div className="relative max-w-sm mx-auto flex flex-col items-center">
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 aspect-square max-h-72 w-full flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Selected Leaf Preview"
                  className="w-full h-full object-contain"
                />

                {/* Scanning Animation overlay during loading */}
                {isLoading && (
                  <div className="absolute inset-0 bg-emerald-900/30 backdrop-blur-[2px] flex flex-col items-center justify-center">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent absolute animate-scan shadow-lg shadow-emerald-400"></div>
                    <div className="bg-emerald-950/90 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg border border-emerald-500/40">
                      <ScanLine className="w-4 h-4 animate-pulse text-emerald-400" />
                      <span>Extracting Feature Maps...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Strip below preview */}
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold border border-slate-200 hover:border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Image</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  disabled={isLoading}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  Replace Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-4 shadow-inner">
                <UploadCloud className="w-8 h-8 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Drag and drop your leaf image here
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Supports JPG, PNG, and WebP up to 10MB. Or click to browse files from your device.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs">
                <ImageIcon className="w-4 h-4" />
                <span>Browse Files</span>
              </div>
            </div>
          )}
        </div>

        {/* Error Alert Display */}
        {errorMessage && (
          <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800">
              <span className="font-bold">Error:</span> {errorMessage}
            </div>
          </div>
        )}

        {/* Analyze Button */}
        {imagePreview && !predictionResult && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Diagnosing Pathologies & Grad-CAM...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Leaf Specimen</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>

      {/* 1-Click Sample Testing Showcase */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick-Test Curated Samples (1-Click Diagnostics)
          </h3>
          <span className="text-[11px] text-slate-400">Click any card to auto-load</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_IMAGES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className="glass-panel p-3 rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 cursor-pointer transition-all group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 mb-2 border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform">
                <img
                  src={sample.dataUri}
                  alt={sample.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-emerald-800">
                {sample.title}
              </span>
              <span className={`text-[10px] mt-0.5 px-2 py-0.5 rounded-full font-semibold ${
                sample.tag === 'Healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {sample.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Prediction Output Card */}
      {predictionResult && (
        <PredictionResultCard
          result={predictionResult}
          originalImagePreview={imagePreview}
          onReset={handleReset}
        />
      )}

    </div>
  );
}
