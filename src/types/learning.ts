export interface TourStep {
  id: string;
  stepNumber: number;
  title: string;
  structureId: string;
  category: string;
  description: string;
  clinicalNote: string;
}

export interface GuidedTour {
  id: string;
  title: string;
  system: string;
  description: string;
  steps: TourStep[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  targetStructureId: string;
  category: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export type AppMode = 'dashboard' | 'explorer' | 'tour' | 'working_principle' | 'quiz';

export interface WorkingPrincipleState {
  isPlaying: boolean;
  speed: number; // 0.2 to 3.0
  activePhaseIndex: number;
  phaseName: string;
  phaseDescription: string;
  telemetry: { label: string; value: string; unit?: string }[];
}
