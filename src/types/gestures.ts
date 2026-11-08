export type GestureType =
  | 'open_palm'
  | 'closed_fist'
  | 'pointing'
  | 'pinch'
  | 'spread_fingers'
  | 'thumbs_up'
  | 'none';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface HandTrackingResult {
  landmarks: HandLandmark[] | null;
  gesture: GestureType;
  confidence: number;
  handPresent: boolean;
  handCenter: { x: number; y: number };
  pinchDistance: number;
  spreadDistance: number;
  screenPointer?: { x: number; y: number }; // normalized 0..1 for pointing raycast
  rawGestureDetails: string;
}

export interface GestureControlSettings {
  sensitivity: number; // 0.5 to 2.5
  smoothing: number; // 0.1 to 0.9 (alpha filter)
  invertX: boolean;
  invertY: boolean;
  enableGestures: boolean;
}

export type TrackingStatus = 'idle' | 'requesting' | 'tracking' | 'error' | 'denied';
