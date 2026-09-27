import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import DetectionStudio from './components/DetectionStudio';
import ModelDashboard from './components/ModelDashboard';
import DiseaseCatalog from './components/DiseaseCatalog';
import { getHealthStatus } from './services/api';
import { Sprout, ShieldCheck, Heart, AlertTriangle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'detect' | 'dashboard' | 'catalog'
  const [health, setHealth] = useState(null);
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('plantguard_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Check health on mount and every 30s
  useEffect(() => {
    async function checkSystemHealth() {
      const h = await getHealthStatus();
      setHealth(h);
    }
    checkSystemHealth();
    const timer = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(timer);
  }, []);

  // Sync history to localStorage
  const handleAddHistory = (item) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 50);
      try {
        localStorage.setItem('plantguard_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('plantguard_history');
    } catch (e) {
      console.warn('LocalStorage clear failed:', e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F8FAF9]">
      
      {/* Top Navigation */}
      <div>
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          health={health} 
        />

        {/* Dynamic Main Body Content */}
        <main>
          {activeTab === 'home' && (
            <div>
              <HeroSection 
                onStartAnalyze={() => setActiveTab('detect')}
                onViewCatalog={() => setActiveTab('catalog')}
              />
              <DetectionStudio onHistoryAdd={handleAddHistory} />
            </div>
          )}

          {activeTab === 'detect' && (
            <DetectionStudio onHistoryAdd={handleAddHistory} />
          )}

          {activeTab === 'dashboard' && (
            <ModelDashboard 
              history={history} 
              onClearHistory={handleClearHistory} 
            />
          )}

          {activeTab === 'catalog' && (
            <DiseaseCatalog />
          )}
        </main>
      </div>

      {/* Global Professional Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200/80 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200/60">
            {/* Column 1: Brand & Overview */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Sprout className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  PlantGuard AI
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                A production-grade AI agricultural system designed for leaf pathology classification across 38 PlantVillage categories. Incorporates DCGAN minority synthesis, EfficientNetB0 transfer learning, and Grad-CAM visual interpretability.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium text-slate-600">
                <span className="px-2.5 py-1 rounded-md bg-slate-100">FastAPI</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100">TensorFlow 2.21</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100">React 18</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100">Tailwind CSS</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100">Grad-CAM</span>
              </div>
            </div>

            {/* Column 2: Navigation Shortcuts */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                System Navigation
              </h4>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><button onClick={() => setActiveTab('home')} className="hover:text-emerald-700 transition-colors">Home Landing</button></li>
                <li><button onClick={() => setActiveTab('detect')} className="hover:text-emerald-700 transition-colors">Leaf Diagnostics Studio</button></li>
                <li><button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-700 transition-colors">Evaluation & Model Dashboard</button></li>
                <li><button onClick={() => setActiveTab('catalog')} className="hover:text-emerald-700 transition-colors">38 PlantVillage Catalog</button></li>
              </ul>
            </div>

            {/* Column 3: Agricultural Disclaimer */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Agronomic Safety
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                PlantGuard AI is an automated decision-support diagnostic system. Always cross-reference with certified agricultural extension agents before deploying synthetic agrochemicals or broad-spectrum fungicides.
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <div>
              © 2026 PlantGuard AI • B.Tech CSE-AIML Portfolio Capstone Project.
            </div>
            <div className="flex items-center gap-4">
              <span>PlantVillage Dataset (54k+ Images)</span>
              <span>•</span>
              <span>Zero-Leakage DCGAN</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
