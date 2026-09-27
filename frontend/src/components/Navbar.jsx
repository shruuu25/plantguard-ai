import React from 'react';
import { Sprout, Activity, Database, BookOpen, Github, WifiOff } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, health }) {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-emerald-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                PlantGuard <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold tracking-wider">AI</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Agricultural AI & Deep Learning Diagnostics</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === 'home'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveTab('detect')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'detect'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              Analyze Leaf
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Database className="w-4 h-4" />
              Model Benchmark
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-white text-emerald-800 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              38 Diseases
            </button>
          </nav>

          {/* Right Status & GitHub */}
          <div className="flex items-center space-x-3">
            {health?.status === 'healthy' ? (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>API Online (38 Classes)</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <WifiOff className="w-3.5 h-3.5" />
                <span>Checking API...</span>
              </div>
            )}

            <a
              href="https://github.com/shruuu25/plantguard-ai"
              target="_blank"
              rel="noreferrer"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}
