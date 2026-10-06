import React, { useState } from 'react';
import { CapstoneProject } from '../types';
import { Copy, Check, Terminal, Code2, Cpu, CheckCircle2, Play, BookOpen, Layers } from 'lucide-react';
import { Capstone1StreamSimulator } from './simulators/Capstone1StreamSimulator';
import { Capstone2ConcurrencySimulator } from './simulators/Capstone2ConcurrencySimulator';
import { Capstone3IngestionSimulator } from './simulators/Capstone3IngestionSimulator';
import { Capstone4EmbeddedSimulator } from './simulators/Capstone4EmbeddedSimulator';

interface CapstoneDetailProps {
  project: CapstoneProject;
}

export const CapstoneDetail: React.FC<CapstoneDetailProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'assignments' | 'code' | 'simulator'>('simulator');
  const [selectedLanguageKey, setSelectedLanguageKey] = useState<string>(Object.keys(project.codeBlueprints)[0] || '');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAscii, setCopiedAscii] = useState(false);

  const activeBlueprint = project.codeBlueprints[selectedLanguageKey] || Object.values(project.codeBlueprints)[0];

  const handleCopyCode = () => {
    if (activeBlueprint?.code) {
      navigator.clipboard.writeText(activeBlueprint.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyAscii = () => {
    navigator.clipboard.writeText(project.architectureDiagramAscii);
    setCopiedAscii(true);
    setTimeout(() => setCopiedAscii(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Project Banner Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {project.badge}
            </span>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-0.5 rounded border border-cyan-800/40">
              Inspiration: {project.inspiration}
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-800/50 px-2.5 py-0.5 rounded">
              {project.systemLayer}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {project.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
            {project.subtitle}
          </p>

          <div className="pt-2">
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300">
              <strong className="text-amber-400">Core Engineering Challenge: </strong>
              {project.coreChallenge}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mt-6 -mb-6 -mx-6 sm:-mx-8 px-6 sm:px-8 bg-slate-950/60 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'simulator', label: 'Interactive Live Lab Simulator', icon: Play },
            { id: 'assignments', label: 'Student Technical Assignments', icon: BookOpen },
            { id: 'architecture', label: 'Architecture Topology & Diagram', icon: Layers },
            { id: 'code', label: 'Multi-Language Code Blueprints', icon: Code2 },
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-3.5 px-4 flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'border-amber-500 text-amber-400 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Interactive Live Lab Simulator */}
      {activeTab === 'simulator' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {project.id === 'capstone-1' && <Capstone1StreamSimulator />}
          {project.id === 'capstone-2' && <Capstone2ConcurrencySimulator />}
          {project.id === 'capstone-3' && <Capstone3IngestionSimulator />}
          {project.id === 'capstone-4' && <Capstone4EmbeddedSimulator />}
        </div>
      )}

      {/* Tab 2: Technical Assignments */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-5">
            {project.assignments.map((assignment, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-xs">
                      {idx + 1}
                    </span>
                    <h3 className="text-base font-bold text-white">{assignment.title}</h3>
                  </div>
                  <span className="px-3 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400">
                    Target Stack: {assignment.languages}
                  </span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed font-sans">
                  {assignment.challenge}
                </p>

                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-400 mb-2 uppercase tracking-wider">
                    Technical Specifications & Acceptance Criteria:
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300 font-sans">
                    {assignment.requirements.map((req, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Architecture Topology & ASCII Diagram */}
      {activeTab === 'architecture' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  System Architecture Diagram (ASCII Specification)
                </h3>
                <p className="text-xs text-slate-400">Verbatim system data flow and network protocol topology</p>
              </div>
              <button
                onClick={handleCopyAscii}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition"
              >
                {copiedAscii ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedAscii ? 'Copied' : 'Copy Diagram'}
              </button>
            </div>

            <pre className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-cyan-300 font-mono text-xs sm:text-sm overflow-x-auto leading-tight shadow-inner">
              {project.architectureDiagramAscii}
            </pre>
          </div>

          {/* Key Architectural Takeaways */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Key Architectural Invariants & Takeaways
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              {project.keyTakeaways.map((point, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Tab 4: Multi-Language Code Blueprints */}
      {activeTab === 'code' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            {/* Header / Language switcher */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-mono mr-1">Language:</span>
                {Object.keys(project.codeBlueprints).map(langKey => (
                  <button
                    key={langKey}
                    onClick={() => setSelectedLanguageKey(langKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold capitalize transition ${
                      selectedLanguageKey === langKey
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {langKey}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  {activeBlueprint?.filename}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied' : 'Copy Blueprint'}
                </button>
              </div>
            </div>

            {/* Explanation */}
            {activeBlueprint?.explanation && (
              <div className="px-5 py-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-300">
                <strong className="text-amber-400">Blueprint Purpose: </strong>
                {activeBlueprint.explanation}
              </div>
            )}

            {/* Code Content */}
            <pre className="p-5 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto leading-relaxed max-h-[550px] shadow-inner">
              <code>{activeBlueprint?.code}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
