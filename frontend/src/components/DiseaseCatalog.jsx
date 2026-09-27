import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  BookOpen, 
  ShieldCheck, 
  Stethoscope, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { getDiseasesCatalog } from '../services/api';

export default function DiseaseCatalog() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const data = await getDiseasesCatalog();
        setDiseases(data);
      } catch (e) {
        console.error('Failed to load catalog:', e);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Extract unique plants
  const uniquePlants = ['All', ...new Set(diseases.map(d => d.plant))].sort();
  const severities = ['All', 'Healthy', 'Moderate', 'Severe'];

  // Filtered list
  const filtered = diseases.filter(item => {
    const matchesSearch = 
      item.disease.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.plant.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.scientific_name && item.scientific_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlant = selectedPlant === 'All' || item.plant === selectedPlant;
    const matchesSeverity = selectedSeverity === 'All' || item.severity?.toLowerCase() === selectedSeverity.toLowerCase();

    return matchesSearch && matchesPlant && matchesSeverity;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getSeverityBadge = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'healthy':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'moderate':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'severe':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Plant Pathology Directory
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Knowledge base encompassing clinical symptoms, etiology, cultural methods, and chemical treatment guidelines across all 38 PlantVillage crop classes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl border border-slate-200/80 mb-8 flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by crop, disease name, or scientific pathogen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Plant Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedPlant}
            onChange={(e) => setSelectedPlant(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium cursor-pointer"
          >
            {uniquePlants.map(p => (
              <option key={p} value={p}>{p === 'All' ? 'All Crops' : p}</option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium cursor-pointer"
          >
            {severities.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Severities' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Directory Count */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs font-semibold text-slate-500">
          Showing {filtered.length} of {diseases.length} pathologies
        </span>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-sm text-slate-500">Loading disease knowledge base...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl">
          <p className="text-sm font-semibold text-slate-700">No pathologies match your search criteria.</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search bar or crop dropdown filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const culturalList = item.cultural_treatment || item.treatment?.cultural || [];
            const chemicalList = item.chemical_treatment || item.treatment?.chemical || [];

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl border border-slate-200/80 p-5 hover:border-emerald-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          {item.plant}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getSeverityBadge(item.severity)}`}>
                          {item.severity}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {item.disease}
                      </h3>
                      {item.scientific_name && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">{item.scientific_name}</p>
                      )}
                    </div>
                  </div>

                  {/* Quick Symptoms Preview */}
                  <div className="mt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Key Clinical Indicators:
                    </span>
                    <ul className="space-y-1">
                      {item.symptoms.slice(0, 2).map((sym, sIdx) => (
                        <li key={sIdx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Expanded Pathology Protocols */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
                      {/* All Symptoms */}
                      {item.symptoms.length > 2 && (
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Additional Symptoms:
                          </span>
                          <ul className="space-y-1">
                            {item.symptoms.slice(2).map((sym, sIdx) => (
                              <li key={sIdx} className="text-xs text-slate-600 flex items-start gap-1.5 leading-relaxed">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0 mt-1.5"></span>
                                <span>{sym}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Cultural Controls */}
                      <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200/50">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1 mb-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Cultural & Mechanical Practices:
                        </span>
                        <ul className="space-y-1">
                          {culturalList.map((c, cIdx) => (
                            <li key={cIdx} className="text-xs text-slate-700 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-600 shrink-0 mt-1.5"></span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Chemical Recommendations */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1 mb-1">
                          <Stethoscope className="w-3.5 h-3.5 text-teal-700" /> Chemical & Biocontrol Treatments:
                        </span>
                        <ul className="space-y-1">
                          {chemicalList.map((c, cIdx) => (
                            <li key={cIdx} className="text-xs text-slate-700 flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-teal-600 shrink-0 mt-1.5"></span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Prevention */}
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Hygiene & Prevention:
                        </span>
                        <ul className="space-y-1">
                          {item.prevention.map((p, pIdx) => (
                            <li key={pIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Expand / Collapse Button */}
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-between w-full cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Protocols' : 'View Full Pathology & Treatment'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
