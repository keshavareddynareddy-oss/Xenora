import React, { useState } from 'react';
import {
  Compass,
  Video,
  Sparkles,
  ArrowRight,
  Hand,
  Layers,
  Activity,
  PlayCircle,
  HelpCircle,
  Search,
  CheckCircle2,
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
  BookOpen,
} from 'lucide-react';
import { DisciplineId, TopicId } from '../types/discipline';
import { DISCIPLINES, TOPICS } from '../data/curriculumData';
import { TrackingStatus } from '../types/gestures';

interface DashboardViewProps {
  onStartExploration: (topicId?: TopicId) => void;
  onOpenWorkingPrinciple: (topicId?: TopicId) => void;
  onOpenTour: (topicId?: TopicId) => void;
  onOpenQuiz: (topicId?: TopicId) => void;
  onOpenAi: () => void;
  trackingStatus: TrackingStatus;
  onRequestCamera: () => void;
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

export const DashboardView: React.FC<DashboardViewProps> = ({
  onStartExploration,
  onOpenWorkingPrinciple,
  onOpenTour,
  onOpenQuiz,
  onOpenAi,
  trackingStatus,
  onRequestCamera,
}) => {
  const [activeDisciplineFilter, setActiveDisciplineFilter] = useState<DisciplineId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTopics = TOPICS.filter((topic) => {
    const matchesDiscipline = activeDisciplineFilter === 'all' || topic.disciplineId === activeDisciplineFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDiscipline && matchesSearch;
  });

  return (
    <div className="fixed inset-0 top-16 z-20 overflow-y-auto bg-slate-950/95 text-slate-100 p-4 sm:p-8 md:p-10 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Multi-Disciplinary 3D Engineering & Science Virtual Laboratory</span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Touchless 3D Exploration & Simulation
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
              Interact with real-time 3D models of <strong>Mechanical Engines</strong>, <strong>Electric Machines</strong>,{' '}
              <strong>Semiconductors</strong>, <strong>Civil Trusses</strong>, <strong>Deep Neural Networks</strong>, and{' '}
              <strong>Human Anatomy</strong> using genuine webcam hand gestures and AI tutoring.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onStartExploration('four_stroke_engine')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-950"
              >
                <span>Launch Engine 3D Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onOpenWorkingPrinciple('four_stroke_engine')}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm flex items-center gap-2 transition-colors"
              >
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <span>Working Principles</span>
              </button>

              <button
                onClick={onOpenAi}
                className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs sm:text-sm flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Ask AI Tutor</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Discipline Navigation Filter */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Discipline Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveDisciplineFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeDisciplineFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All Subjects ({TOPICS.length})
              </button>

              {DISCIPLINES.map((d) => {
                const DIcon = ICON_MAP[d.iconName] || Cog;
                const isSelected = activeDisciplineFilter === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setActiveDisciplineFilter(d.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <DIcon className="w-3.5 h-3.5" style={{ color: d.color }} />
                    <span>{d.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 font-mono text-slate-300">
                      {d.topicCount}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search models, machines, organs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTopics.map((topic) => {
              const TIcon = ICON_MAP[topic.iconName] || Cog;
              const disc = DISCIPLINES.find((d) => d.id === topic.disciplineId);

              return (
                <div
                  key={topic.id}
                  className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner shrink-0"
                        style={{
                          backgroundColor: `${topic.color}15`,
                          borderColor: `${topic.color}35`,
                          color: topic.color,
                        }}
                      >
                        <TIcon className="w-5 h-5" />
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-cyan-300 border border-slate-700/60">
                          {topic.badge}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {disc?.shortName}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {topic.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {topic.subtitle}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {topic.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                      <span>{topic.componentCount} Components</span>
                      <span>·</span>
                      <span className="text-cyan-400 font-semibold">{topic.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-800/80">
                    <button
                      onClick={() => onStartExploration(topic.id)}
                      className="flex-1 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Explore 3D</span>
                    </button>

                    {topic.hasWorkingPrinciple && (
                      <button
                        onClick={() => onOpenWorkingPrinciple(topic.id)}
                        className="px-2.5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Simulate Working Principle"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Principle</span>
                      </button>
                    )}

                    <button
                      onClick={() => onOpenQuiz(topic.id)}
                      className="px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                      title="Test Knowledge with Quiz"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gesture Controls Cheat-Sheet */}
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <Hand className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Webcam Hand Gesture Controls</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status:</span>
              <span
                className={`text-xs font-mono font-semibold ${
                  trackingStatus === 'tracking' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {trackingStatus === 'tracking' ? 'Webcam Tracking Active' : 'Manual Mouse Fallback Active'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-cyan-400">Open Palm</div>
              <div className="text-slate-400 text-[11px]">Move hand to rotate 3D models (360° yaw/pitch)</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-cyan-400">Pinch Index</div>
              <div className="text-slate-400 text-[11px]">Pinch thumb & index to smoothly zoom in</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-cyan-400">Spread Fingers</div>
              <div className="text-slate-400 text-[11px]">Expand all five fingers outwards to zoom out</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-cyan-400">Point Index</div>
              <div className="text-slate-400 text-[11px]">Direct index finger to raycast & select components</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-cyan-400">Closed Fist</div>
              <div className="text-slate-400 text-[11px]">Clench fist to pause rotation & lock viewpoint</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <div className="font-semibold text-cyan-400">Mouse Fallback</div>
              <div className="text-slate-400 text-[11px]">Click & drag to orbit, scroll wheel to zoom</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
