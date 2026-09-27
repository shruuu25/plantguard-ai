import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  BarChart3
} from 'lucide-react';

export default function HeroSection({ onStartAnalyze, onViewCatalog }) {
  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:pt-12 lg:pb-20">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/50 via-teal-50/30 to-transparent -z-10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>PlantGuard AI • PlantVillage 38 Classes • EfficientNetB0</span>
          </div>
        </div>

        {/* Main Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mt-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
            🌱 PlantGuard AI <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Plant Disease Detection System
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            A production-ready Deep Learning agricultural platform powered by 
            <strong> EfficientNetB0 transfer learning</strong> trained on <strong>54,305 real plant leaves</strong>. Instantly identifies 38 crop pathologies with top-3 candidate ranking and curated treatment protocols.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartAnalyze}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Analyze Plant Leaf</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onViewCatalog}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              Explore 38 Disease Classes
            </button>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-slate-900">38 Crop Classes</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Full taxonomy covering Tomato, Potato, Apple, Corn, Grape, Bell Pepper, Peach, Strawberry, and Cherry crops.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Cpu className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-slate-900">EfficientNetB0 Backbone</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Transfer learning with ImageNet weights and custom dense classification head for rapid and precise leaf diagnosis.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-slate-900">91.37% Test Accuracy</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Rigorously benchmarked on a held-out test split of 1,124 real specimens with 92.22% macro precision and 91.35% macro F1.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <BarChart3 className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Top-3 Candidates</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Transparent multi-class probability distributions, actionable agronomic guidelines, and cultural/chemical management.
            </p>
          </div>
        </div>

        {/* Diagnostic Workflow */}
        <div className="mt-14 bg-white/70 backdrop-blur-md rounded-2xl p-8 border border-slate-200/80">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-800 text-center mb-6">
            Diagnostic Workflow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="text-center">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3 shadow-sm">
                1
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Leaf Specimen</h4>
              <p className="text-xs text-slate-500 mt-1">Upload leaf photo via drag-and-drop or select sample specimens.</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3 shadow-sm">
                2
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Standardized Pipeline</h4>
              <p className="text-xs text-slate-500 mt-1">Image validation, 224×224 scaling, and EfficientNet normalization.</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3 shadow-sm">
                3
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Deep Inference</h4>
              <p className="text-xs text-slate-500 mt-1">Neural network computes probability distribution across 38 classes.</p>
            </div>
            <div className="text-center">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-3 shadow-sm">
                4
              </div>
              <h4 className="text-sm font-semibold text-slate-900">Treatment Plan</h4>
              <p className="text-xs text-slate-500 mt-1">Instant prediction card with symptoms, prevention, and treatment.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
