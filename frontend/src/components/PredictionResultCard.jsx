import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Eye, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  Info, 
  Layers,
  ChevronRight,
  RefreshCw,
  BarChart3,
  Leaf
} from 'lucide-react';

export default function PredictionResultCard({ result, originalImagePreview, onReset }) {
  const [activeTab, setActiveTab] = useState('treatment'); // 'treatment' | 'symptoms' | 'prevention'

  if (!result) return null;

  const {
    disease = 'Unknown',
    plant = 'Crop',
    scientific_name,
    confidence = 0,
    severity = 'Normal',
    status = 'Diseased',
    symptoms = [],
    treatment = {},
    cultural_treatment = [],
    chemical_treatment = [],
    prevention = [],
    top_predictions = [],
    disclaimer
  } = result;

  const isHealthy = status === 'Healthy' || disease.toLowerCase().includes('healthy');

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'healthy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'severe':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const culturalList = treatment?.cultural || cultural_treatment || [];
  const chemicalList = treatment?.chemical || chemical_treatment || [];

  return (
    <div className="glass-card rounded-3xl p-6 sm:p-8 border border-emerald-900/15 shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Top Header Grid: Diagnostic Summary & Confidence Gauge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200/80">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {plant} Crop
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge(severity)}`}>
              Severity: {severity}
            </span>
            {isHealthy ? (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600 text-white flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Specimen
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-600 text-white flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Pathology Detected
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {disease}
          </h2>
          {scientific_name && scientific_name !== 'N/A' && (
            <p className="text-xs text-slate-500 italic mt-0.5">Scientific Name / Pathogen: {scientific_name}</p>
          )}
        </div>

        {/* Confidence Percentage Meter */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${confidence < 60 ? 'text-amber-500' : 'text-emerald-600'} transition-all duration-1000 ease-out`}
                strokeDasharray={`${Math.min(100, Math.max(0, confidence))}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-bold text-slate-800">
              {confidence.toFixed(1)}%
            </span>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Prediction Confidence</div>
            <div className={`text-sm font-semibold ${confidence < 60 ? 'text-amber-600' : 'text-emerald-700'}`}>
              {confidence >= 90 ? 'Very High Confidence' : confidence >= 70 ? 'High Confidence' : 'Moderate Confidence'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Specimen Preview & Top 3 Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
        {/* Specimen Preview */}
        {originalImagePreview && (
          <div className="md:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col items-center justify-center">
            <div className="w-full aspect-square max-h-60 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-sm">
              <img
                src={originalImagePreview}
                alt="Analyzed Leaf Specimen"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[11px] font-medium text-white flex items-center gap-1">
                <Leaf className="w-3 h-3 text-emerald-400" /> Input Leaf
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 font-medium text-center">
              Evaluated with EfficientNetB0 (224×224)
            </p>
          </div>
        )}

        {/* Top 3 Predictions Distribution */}
        <div className={`${originalImagePreview ? 'md:col-span-7' : 'md:col-span-12'} bg-slate-50/70 rounded-2xl p-5 border border-slate-200/80 flex flex-col justify-center`}>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Top-3 Model Predictions
            </h3>
          </div>
          <div className="space-y-3">
            {top_predictions.map((pred, idx) => {
              const isFirst = idx === 0;
              const barColor = isFirst 
                ? (pred.status === 'Healthy' ? 'bg-emerald-500' : 'bg-emerald-600') 
                : 'bg-slate-400';
              return (
                <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${isFirst ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                        {idx + 1}
                      </span>
                      {pred.plant}: {pred.disease}
                    </span>
                    <span className="font-bold text-slate-900">{pred.confidence.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${Math.max(2, pred.confidence)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Structured Agronomic Advice Tabs */}
      <div className="mt-8">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('treatment')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === 'treatment'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Management & Treatment
          </button>
          <button
            onClick={() => setActiveTab('symptoms')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === 'symptoms'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Diagnostic Symptoms ({symptoms.length})
          </button>
          <button
            onClick={() => setActiveTab('prevention')}
            className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all relative ${
              activeTab === 'prevention'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Prevention Hygiene ({prevention.length})
          </button>
        </div>

        <div className="mt-5">
          {/* Treatment Tab */}
          {activeTab === 'treatment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Cultural Practices */}
              <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200/60">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 mb-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" /> Cultural & Mechanical Controls
                </h4>
                {culturalList.length > 0 ? (
                  <ul className="space-y-2.5">
                    {culturalList.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No cultural intervention needed for healthy specimens.</p>
                )}
              </div>

              {/* Chemical / Bio Treatments */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-3">
                  <Stethoscope className="w-4 h-4 text-teal-700" /> Chemical & Bio Treatment Options
                </h4>
                {chemicalList.length > 0 ? (
                  <ul className="space-y-2.5">
                    {chemicalList.map((item, idx) => (
                      <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5"></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500">No chemical treatments necessary.</p>
                )}
              </div>
            </div>
          )}

          {/* Symptoms Tab */}
          {activeTab === 'symptoms' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Pathology Characteristics
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {symptoms.map((sym, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2 shadow-2xs">
                    <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{sym}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prevention Tab */}
          {activeTab === 'prevention' && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                Long-Term Crop Protection Protocols
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prevention.map((prev, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{prev}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advisory Disclaimer */}
      {disclaimer && (
        <div className="mt-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>{disclaimer}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="mt-6 pt-4 border-t border-slate-200/80 flex justify-end">
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Another Leaf Image</span>
        </button>
      </div>

    </div>
  );
}
