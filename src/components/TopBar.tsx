import React, { useState } from 'react';
import {
  Video,
  RotateCcw,
  Sparkles,
  ChevronDown,
  Layers,
  PlayCircle,
  HelpCircle,
  Compass,
  Activity,
  Zap,
  Cpu,
  Building,
  Binary,
  Flame,
  Cog,
  Waves,
  Power,
  ToggleRight,
  Network,
  Heart,
  Brain,
  Dog,
  Leaf,
  User,
  LayoutGrid,
} from 'lucide-react';
import { AppMode } from '../types/learning';
import { TrackingStatus } from '../types/gestures';
import { TopicId, DisciplineId } from '../types/discipline';
import { DISCIPLINES, TOPICS } from '../data/curriculumData';

interface TopBarProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  activeSubject: TopicId;
  onSelectSubject: (subject: TopicId) => void;
  trackingStatus: TrackingStatus;
  isGesturesEnabled: boolean;
  onToggleGestures: () => void;
  onRequestCamera: () => void;
  onResetCamera: () => void;
  onOpenAiAssistant: () => void;
}

const ICON_MAP: Record<string, any> = {
  Cog,
  Zap,
  Cpu,
  Building,
  Binary,
  Activity,
  Flame,
  Waves,
  Power,
  ToggleRight,
  Layers,
  Network,
  User,
  Heart,
  Brain,
  Dog,
  Sparkles,
  Leaf,
};

export const TopBar: React.FC<TopBarProps> = ({
  currentMode,
  onSelectMode,
  activeSubject,
  onSelectSubject,
  trackingStatus,
  isGesturesEnabled,
  onToggleGestures,
  onRequestCamera,
  onResetCamera,
  onOpenAiAssistant,
}) => {
  const [showTopicMenu, setShowTopicMenu] = useState(false);
  const [selectedDisciplineTab, setSelectedDisciplineTab] = useState<DisciplineId>('mechanical');

  const currentTopic = TOPICS.find((t) => t.id === activeSubject) || TOPICS[0];
  const CurrentIcon = ICON_MAP[currentTopic.iconName] || Cog;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between gap-3 sm:gap-6">
      {/* Brand & Multi-Disciplinary Topic Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelectMode('dashboard')}
          className="text-left group flex items-center gap-2.5 focus:outline-none"
          title="Return to Laboratory Dashboard"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold group-hover:border-cyan-400 transition-colors">
            <span className="font-display text-sm tracking-wider">GL</span>
          </div>
          <div className="hidden sm:block">
            <span className="font-display font-semibold text-base text-slate-100 tracking-tight leading-none block">
              GestureLab 3D
            </span>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider block mt-0.5">
              VIRTUAL ENGINEERING & SCIENCE LAB
            </span>
          </div>
        </button>

        {/* Topic Dropdown Menu */}
        <div className="relative">
          <button
            onClick={() => setShowTopicMenu(!showTopicMenu)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-colors"
          >
            <CurrentIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium max-w-[140px] sm:max-w-[200px] truncate">
              {currentTopic.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showTopicMenu && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-2 animate-in fade-in zoom-in-95 duration-100 max-h-[80vh] flex flex-col">
              <div className="px-2 pt-1 pb-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>Select Academic Discipline & Topic</span>
                <span className="text-cyan-400">17 Interactive 3D Models</span>
              </div>

              {/* Discipline Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
                {DISCIPLINES.map((d) => {
                  const DIcon = ICON_MAP[d.iconName] || Cog;
                  const isSel = selectedDisciplineTab === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDisciplineTab(d.id)}
                      className={`px-2 py-1 rounded text-[11px] whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                        isSel
                          ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}
                    >
                      <DIcon className="w-3 h-3" />
                      <span>{d.shortName}</span>
                    </button>
                  );
                })}
              </div>

              {/* Topics in selected discipline */}
              <div className="overflow-y-auto space-y-1 pr-1 flex-1 max-h-72">
                {TOPICS.filter((t) => t.disciplineId === selectedDisciplineTab).map((t) => {
                  const TIcon = ICON_MAP[t.iconName] || Cog;
                  const isCurrent = activeSubject === t.id;

                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectSubject(t.id);
                        setShowTopicMenu(false);
                        if (currentMode === 'dashboard') onSelectMode('explorer');
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2.5 text-xs transition-colors ${
                        isCurrent
                          ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${t.color}15`,
                          borderColor: `${t.color}35`,
                          color: t.color,
                        }}
                      >
                        <TIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate flex-1">
                        <div className="font-medium text-slate-200 truncate">{t.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{t.subtitle}</div>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-300 shrink-0">
                        {t.difficulty}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 2: Learning Modes Switcher */}
      <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl">
        <button
          onClick={() => onSelectMode('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentMode === 'dashboard'
              ? 'bg-slate-800 text-slate-100 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => onSelectMode('explorer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentMode === 'explorer'
              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Explore 3D</span>
        </button>

        <button
          onClick={() => onSelectMode('working_principle')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentMode === 'working_principle'
              ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>Working Principle</span>
        </button>

        <button
          onClick={() => onSelectMode('tour')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentMode === 'tour'
              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>Guided Tour</span>
        </button>

        <button
          onClick={() => onSelectMode('quiz')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            currentMode === 'quiz'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Quiz</span>
        </button>
      </nav>

      {/* Zone 3: Gesture Status, Camera Reset, and AI Assistant */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time Tracking Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div
            className={`w-2 h-2 rounded-full ${
              trackingStatus === 'tracking'
                ? 'bg-emerald-400 animate-pulse'
                : trackingStatus === 'denied'
                ? 'bg-rose-400'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] font-mono text-slate-300 hidden md:inline">
            {trackingStatus === 'tracking'
              ? 'HAND TRACKING ACTIVE'
              : trackingStatus === 'requesting'
              ? 'INITIALIZING CAMERA...'
              : 'MANUAL CONTROLS'}
          </span>
          <button
            onClick={trackingStatus === 'tracking' ? onToggleGestures : onRequestCamera}
            className="text-[10px] font-mono text-cyan-400 hover:underline uppercase ml-1"
          >
            {trackingStatus === 'tracking' ? (isGesturesEnabled ? 'Pause' : 'Resume') : 'Start'}
          </button>
        </div>

        {/* Reset Camera button */}
        <button
          onClick={onResetCamera}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
          title="Reset Camera View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Gemini AI Assistant Button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-semibold shadow-sm transition-all hover:scale-105"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Ask AI Assistant</span>
          <span className="sm:hidden">AI</span>
        </button>
      </div>
    </header>
  );
};
