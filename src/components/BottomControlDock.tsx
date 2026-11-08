import React, { useState } from 'react';
import {
  Layers,
  Camera,
  RotateCw,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ChevronUp,
  Bone,
  Flame,
  Zap,
  Heart,
  Wind,
  Apple,
  Focus,
  Play,
  Pause,
  Gauge,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { AnatomyCategory, AnatomyLayerState, CameraPreset, EducationalComponent } from '../types/discipline';
import { AppMode } from '../types/learning';
import { SUBJECT_CAMERA_PRESETS, ANATOMICAL_STRUCTURES } from '../anatomy/data';
import { WORKING_PRINCIPLES_DATA } from '../data/curriculumData';

interface BottomControlDockProps {
  currentMode: AppMode;
  activeSubject: string;
  layers: AnatomyLayerState;
  onToggleLayer: (category: AnatomyCategory) => void;
  onSoloLayer: (category: AnatomyCategory) => void;
  onSelectAllLayers: (enable: boolean) => void;
  onApplyCameraPreset: (preset: CameraPreset) => void;
  onSelectStructure: (structureId: string) => void;
  onManualRotate: (direction: 'left' | 'right' | 'up' | 'down') => void;
  onManualZoom: (delta: number) => void;
  onResetCamera: () => void;
  isIsolated: boolean;
  hasSelection: boolean;
  onToggleIsolation: () => void;
  isSimulationPlaying: boolean;
  onToggleSimulationPlay: () => void;
  simulationSpeed: number;
  onChangeSimulationSpeed: (speed: number) => void;
}

const LAYER_CONFIGS: { id: AnatomyCategory; label: string; icon: any; color: string }[] = [
  { id: 'skeletal', label: 'Skeletal', icon: Bone, color: 'text-slate-200' },
  { id: 'muscular', label: 'Muscular', icon: Flame, color: 'text-rose-400' },
  { id: 'nervous', label: 'Nervous', icon: Zap, color: 'text-purple-400' },
  { id: 'circulatory', label: 'Circulatory', icon: Heart, color: 'text-red-400' },
  { id: 'respiratory', label: 'Respiratory', icon: Wind, color: 'text-cyan-400' },
  { id: 'digestive', label: 'Digestive', icon: Apple, color: 'text-amber-400' },
];

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  currentMode,
  activeSubject,
  layers,
  onToggleLayer,
  onSoloLayer,
  onSelectAllLayers,
  onApplyCameraPreset,
  onSelectStructure,
  onManualRotate,
  onManualZoom,
  onResetCamera,
  isIsolated,
  hasSelection,
  onToggleIsolation,
  isSimulationPlaying,
  onToggleSimulationPlay,
  simulationSpeed,
  onChangeSimulationSpeed,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'components' | 'presets' | 'simulation' | 'layers' | 'controls'>('components');

  const presets = SUBJECT_CAMERA_PRESETS[activeSubject] || [];
  const subjectComponents = ANATOMICAL_STRUCTURES.filter(
    (s: any) => s.topic === activeSubject || s.subject === activeSubject || (activeSubject === 'human' && (!s.topic || s.topic === 'human'))
  );

  const wpData = (WORKING_PRINCIPLES_DATA as Record<string, any>)[activeSubject];

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 w-[95vw] max-w-4xl ${
        isCollapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse / Expand Tab Bar */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="px-4 py-1 rounded-t-lg bg-slate-900/95 border-t border-x border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white flex items-center gap-1.5 backdrop-blur-md shadow-md transition-colors"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Hide Controls</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-2xl space-y-2.5">
        {/* Dock Header & Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 flex-wrap gap-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('components')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'components'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Components ({subjectComponents.length})
            </button>

            {wpData && (
              <button
                onClick={() => setActiveTab('simulation')}
                className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                  activeTab === 'simulation'
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Simulation</span>
              </button>
            )}

            {activeSubject === 'human' && (
              <button
                onClick={() => setActiveTab('layers')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'layers'
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Organ Layers
              </button>
            )}

            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'presets'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Camera Presets
            </button>

            <button
              onClick={() => setActiveTab('controls')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'controls'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Manual Controls
            </button>
          </div>

          {/* Isolation button if item selected */}
          {hasSelection && (
            <button
              onClick={onToggleIsolation}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isIsolated
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Focus className="w-3.5 h-3.5" />
              <span>{isIsolated ? 'Show All' : 'Isolate Component'}</span>
            </button>
          )}
        </div>

        {/* Tab 1: Quick Component Selectors */}
        {activeTab === 'components' && (
          <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-thin">
            {subjectComponents.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectStructure(item.id)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/80 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.accentColor || item.color }}
                />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{item.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 2: Simulation & Working Principle Telemetry */}
        {activeTab === 'simulation' && wpData && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleSimulationPlay}
                  className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    isSimulationPlaying
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {isSimulationPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isSimulationPlaying ? 'Pause Simulation' : 'Run Simulation'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Speed:</span>
                  <input
                    type="range"
                    min="0.2"
                    max="2.5"
                    step="0.1"
                    value={simulationSpeed}
                    onChange={(e) => onChangeSimulationSpeed(parseFloat(e.target.value))}
                    className="w-24 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-cyan-400">{simulationSpeed.toFixed(1)}x</span>
                </div>
              </div>

              {/* Live Telemetry Badges */}
              <div className="flex items-center gap-2 overflow-x-auto">
                {wpData.defaultTelemetry.map((t: any, idx: number) => (
                  <div key={idx} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono flex items-center gap-1.5 shrink-0">
                    <span className="text-slate-400">{t.label}:</span>
                    <span className="text-emerald-300 font-bold">{t.value} {t.unit || ''}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cycle Phases */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {wpData.phases.map((phase: any, pIdx: number) => (
                <div key={pIdx} className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 text-[11px]">
                  <div className="font-semibold text-cyan-300">{phase.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{phase.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Organ Layers (When in Human subject) */}
        {activeTab === 'layers' && activeSubject === 'human' && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {LAYER_CONFIGS.map(({ id, label, icon: Icon, color }) => {
                const isActive = layers[id];
                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between p-1.5 rounded-xl border transition-colors ${
                      isActive
                        ? 'bg-slate-800/80 border-slate-700 text-slate-100'
                        : 'bg-slate-950/50 border-slate-800/50 text-slate-500'
                    }`}
                  >
                    <button
                      onClick={() => onToggleLayer(id)}
                      className="flex items-center gap-2 text-xs font-medium flex-1 text-left px-1"
                    >
                      <Icon className={`w-3.5 h-3.5 ${color}`} />
                      <span className="truncate">{label}</span>
                    </button>
                    <button
                      onClick={() => onSoloLayer(id)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                      title={`Solo ${label} system`}
                    >
                      Solo
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800/60 text-xs">
              <button
                onClick={() => onSelectAllLayers(true)}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                Enable All Layers
              </button>
              <span className="text-slate-600">·</span>
              <button
                onClick={() => onSelectAllLayers(false)}
                className="text-slate-400 hover:underline text-[11px]"
              >
                Hide All Layers
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Camera Presets */}
        {activeTab === 'presets' && (
          <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onApplyCameraPreset(preset)}
                className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tab 5: Manual Controls Fallback */}
        {activeTab === 'controls' && (
          <div className="flex items-center justify-between gap-4 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Orbit:</span>
              <button
                onClick={() => onManualRotate('left')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Rotate Left"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onManualRotate('right')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Rotate Right"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Zoom:</span>
              <button
                onClick={() => onManualZoom(0.85)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onManualZoom(1.15)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onResetCamera}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-medium"
            >
              Reset View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
