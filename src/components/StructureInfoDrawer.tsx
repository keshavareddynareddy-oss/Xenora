import React from 'react';
import { X, Sparkles, Focus, ChevronRight, Activity, MapPin, BookOpen, AlertCircle, Wrench, ShieldAlert } from 'lucide-react';
import { EducationalComponent } from '../types/discipline';

interface StructureInfoDrawerProps {
  structure: EducationalComponent | null;
  onClose: () => void;
  onSelectRelated: (structureId: string) => void;
  onAskAi: (structure: EducationalComponent) => void;
  isIsolated: boolean;
  onToggleIsolation: () => void;
}

export const StructureInfoDrawer: React.FC<StructureInfoDrawerProps> = ({
  structure,
  onClose,
  onSelectRelated,
  onAskAi,
  isIsolated,
  onToggleIsolation,
}) => {
  if (!structure) return null;

  const technicalSubtitle = structure.technicalName || (structure as any).latinName;
  const bulletItems = structure.specifications || (structure as any).characteristics || [];
  const notesText = structure.engineeringNotes || (structure as any).clinicalRelevance;

  return (
    <aside className="fixed top-20 left-4 sm:left-6 bottom-24 w-80 sm:w-96 z-30 flex flex-col bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
            <span style={{ color: structure.accentColor || '#38bdf8' }}>{structure.system}</span>
            <span className="text-slate-700">·</span>
            <span>{structure.discipline || structure.category}</span>
          </div>
          <h2 className="font-display text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-snug">
            {structure.name}
          </h2>
          {technicalSubtitle && (
            <p className="text-xs text-slate-400 italic mt-0.5">{technicalSubtitle}</p>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Main Function */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Primary Function</span>
          </div>
          <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
            {structure.functionDesc}
          </p>
        </div>

        {/* Working Mechanism if present */}
        {structure.workingMechanism && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
              <Wrench className="w-3.5 h-3.5 text-emerald-400" />
              <span>Operating Mechanism</span>
            </div>
            <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
              {structure.workingMechanism}
            </p>
          </div>
        )}

        {/* Location / Placement */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>Physical Placement</span>
          </div>
          <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
            {structure.location}
          </p>
        </div>

        {/* Specifications / Characteristics */}
        {bulletItems.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-teal-400" />
              <span>Technical Specifications</span>
            </div>
            <ul className="space-y-1.5 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
              {bulletItems.map((item: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300 leading-normal">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Engineering / Clinical Notes */}
        {notesText && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Engineering & Diagnostics Notes</span>
            </div>
            <p className="text-slate-300 leading-relaxed bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/40 text-amber-200/90">
              {notesText}
            </p>
          </div>
        )}

        {/* Related Components */}
        {structure.relatedComponents && structure.relatedComponents.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Connected Subsystems
            </div>
            <div className="flex flex-wrap gap-1.5">
              {structure.relatedComponents.map((relId) => (
                <button
                  key={relId}
                  onClick={() => onSelectRelated(relId)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px] flex items-center gap-1"
                >
                  <span className="capitalize">{relId.replace(/_/g, ' ')}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
        <button
          onClick={onToggleIsolation}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            isIsolated
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          }`}
        >
          <Focus className="w-3.5 h-3.5" />
          <span>{isIsolated ? 'Restore Context' : 'Isolate Part'}</span>
        </button>

        <button
          onClick={() => onAskAi(structure)}
          className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI Tutor</span>
        </button>
      </div>
    </aside>
  );
};
