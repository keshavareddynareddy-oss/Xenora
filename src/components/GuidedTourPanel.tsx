import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Play, Award, CheckCircle, BookOpen, Compass } from 'lucide-react';
import { GUIDED_TOURS } from '../anatomy/tours';
import { GuidedTour, TourStep } from '../types/learning';

interface GuidedTourPanelProps {
  onStepChange: (step: TourStep) => void;
  onExitTour: () => void;
}

export const GuidedTourPanel: React.FC<GuidedTourPanelProps> = ({
  onStepChange,
  onExitTour,
}) => {
  const [activeTour, setActiveTour] = useState<GuidedTour | null>(GUIDED_TOURS[0]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const startTour = (tour: GuidedTour) => {
    setActiveTour(tour);
    setCurrentStepIndex(0);
    if (tour.steps.length > 0) {
      onStepChange(tour.steps[0]);
    }
  };

  const handleNext = () => {
    if (!activeTour) return;
    if (currentStepIndex < activeTour.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      onStepChange(activeTour.steps[nextIdx]);
    }
  };

  const handlePrev = () => {
    if (!activeTour) return;
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      onStepChange(activeTour.steps[prevIdx]);
    }
  };

  const currentStep = activeTour ? activeTour.steps[currentStepIndex] : null;

  return (
    <aside className="fixed top-20 left-4 sm:left-6 bottom-24 w-80 sm:w-96 z-30 flex flex-col bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-100">
              Guided 3D Learning Tours
            </h3>
            <p className="text-[11px] text-slate-400">Step-by-step interactive pathways</p>
          </div>
        </div>

        <button
          onClick={onExitTour}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Exit Tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tour Selection Bar */}
      <div className="p-2 bg-slate-950/40 border-b border-slate-800 flex gap-1 overflow-x-auto text-[11px] scrollbar-none">
        {GUIDED_TOURS.map((tour) => (
          <button
            key={tour.id}
            onClick={() => startTour(tour)}
            className={`px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
              activeTour?.id === tour.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {tour.title.split(' ')[0]} {tour.title.split(' ')[1]}
          </button>
        ))}
      </div>

      {/* Main Tour Step View */}
      {currentStep && activeTour && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Progress Indicator */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-400">
              <span className="font-medium truncate max-w-[200px]">{activeTour.title}</span>
              <span className="font-mono text-cyan-400 shrink-0">
                Step {currentStepIndex + 1} of {activeTour.steps.length}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 transition-all duration-300"
                style={{
                  width: `${((currentStepIndex + 1) / activeTour.steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Current Step Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{currentStep.category}</span>
            </div>
            <h4 className="font-display font-semibold text-sm text-slate-100">
              {currentStep.title}
            </h4>
            <p className="text-slate-300 leading-relaxed text-xs">
              {currentStep.description}
            </p>
          </div>

          {/* Technical Note */}
          {currentStep.clinicalNote && (
            <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                <BookOpen className="w-3 h-3" />
                <span>Technical & Practical Note</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                {currentStep.clinicalNote}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Navigation Footer */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!activeTour || currentStepIndex === activeTour.steps.length - 1}
          className="flex-1 py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 disabled:hover:bg-cyan-600 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-md transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
