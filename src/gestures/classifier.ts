import { GestureType, HandLandmark, HandTrackingResult } from '../types/gestures';

// Utility: Euclidean distance in 2D/3D
function dist3D(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function dist2D(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Exponential Moving Average filter to smooth landmarks and camera movements
 */
export class LandmarkSmoother {
  private smoothedLandmarks: HandLandmark[] | null = null;
  private prevCenter: { x: number; y: number } | null = null;
  private alpha: number;

  constructor(alpha = 0.45) {
    this.alpha = alpha;
  }

  setSmoothing(smoothing: number) {
    // smoothing 0.1 (low smooth, fast) to 0.9 (heavy smooth, slow)
    // alpha = 1 - smoothing
    this.alpha = Math.max(0.1, Math.min(0.9, 1 - smoothing));
  }

  smooth(raw: HandLandmark[]): HandLandmark[] {
    if (!this.smoothedLandmarks || this.smoothedLandmarks.length !== raw.length) {
      this.smoothedLandmarks = raw.map((pt) => ({ ...pt }));
      return this.smoothedLandmarks;
    }

    const a = this.alpha;
    for (let i = 0; i < raw.length; i++) {
      this.smoothedLandmarks[i].x = this.smoothedLandmarks[i].x * (1 - a) + raw[i].x * a;
      this.smoothedLandmarks[i].y = this.smoothedLandmarks[i].y * (1 - a) + raw[i].y * a;
      this.smoothedLandmarks[i].z = (this.smoothedLandmarks[i].z || 0) * (1 - a) + (raw[i].z || 0) * a;
    }

    return this.smoothedLandmarks;
  }

  getDelta(center: { x: number; y: number }): { dx: number; dy: number } {
    if (!this.prevCenter) {
      this.prevCenter = { ...center };
      return { dx: 0, dy: 0 };
    }
    const dx = center.x - this.prevCenter.x;
    const dy = center.y - this.prevCenter.y;
    this.prevCenter = { ...center };
    return { dx, dy };
  }

  reset() {
    this.smoothedLandmarks = null;
    this.prevCenter = null;
  }
}

/**
 * Classifies gesture based on 21 MediaPipe hand landmarks:
 * 0: Wrist
 * 1-4: Thumb (CMC, MCP, IP, Tip)
 * 5-8: Index (MCP, PIP, DIP, Tip)
 * 9-12: Middle (MCP, PIP, DIP, Tip)
 * 13-16: Ring (MCP, PIP, DIP, Tip)
 * 17-20: Pinky (MCP, PIP, DIP, Tip)
 */
export function classifyHandGesture(landmarks: HandLandmark[]): HandTrackingResult {
  if (!landmarks || landmarks.length < 21) {
    return {
      landmarks: null,
      gesture: 'none',
      confidence: 0,
      handPresent: false,
      handCenter: { x: 0.5, y: 0.5 },
      pinchDistance: 1,
      spreadDistance: 0,
      rawGestureDetails: 'No hand detected',
    };
  }

  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const thumbIp = landmarks[3];
  const thumbMcp = landmarks[2];

  const indexMcp = landmarks[5];
  const indexPip = landmarks[6];
  const indexTip = landmarks[8];

  const middleMcp = landmarks[9];
  const middlePip = landmarks[10];
  const middleTip = landmarks[12];

  const ringMcp = landmarks[13];
  const ringPip = landmarks[14];
  const ringTip = landmarks[16];

  const pinkyMcp = landmarks[17];
  const pinkyPip = landmarks[18];
  const pinkyTip = landmarks[20];

  // Palm size scale (distance from wrist to middle MCP)
  const palmScale = Math.max(0.01, dist2D(wrist, middleMcp));

  // Hand center approximation (centroid of wrist, indexMcp, pinkyMcp)
  const handCenter = {
    x: (wrist.x + indexMcp.x + pinkyMcp.x) / 3,
    y: (wrist.y + indexMcp.y + pinkyMcp.y) / 3,
  };

  // Determine if fingers are extended relative to their MCP joints and wrist
  // In video coordinates, y goes downwards (0 top, 1 bottom)
  // When finger is pointing up, tip.y < pip.y < mcp.y
  // Distance from wrist to tip vs wrist to pip:
  const isThumbExtended = dist2D(thumbTip, wrist) > dist2D(thumbMcp, wrist) * 1.15;
  const isIndexExtended = dist2D(indexTip, wrist) > dist2D(indexPip, wrist) * 1.15;
  const isMiddleExtended = dist2D(middleTip, wrist) > dist2D(middlePip, wrist) * 1.15;
  const isRingExtended = dist2D(ringTip, wrist) > dist2D(ringPip, wrist) * 1.15;
  const isPinkyExtended = dist2D(pinkyTip, wrist) > dist2D(pinkyPip, wrist) * 1.15;

  // Normalized pinch distance between thumb tip and index tip
  const rawPinchDist = dist3D(thumbTip, indexTip);
  const pinchDistance = rawPinchDist / palmScale; // normalized to palm scale

  // Spread distance between index and pinky tips
  const rawSpreadDist = dist2D(indexTip, pinkyTip);
  const spreadDistance = rawSpreadDist / palmScale;

  let gesture: GestureType = 'none';
  let confidence = 0.85;
  let rawDetails = '';

  const extendedCount =
    (isThumbExtended ? 1 : 0) +
    (isIndexExtended ? 1 : 0) +
    (isMiddleExtended ? 1 : 0) +
    (isRingExtended ? 1 : 0) +
    (isPinkyExtended ? 1 : 0);

  // 1. Pinch Detection: Thumb tip and Index tip touching/close
  if (pinchDistance < 0.35) {
    gesture = 'pinch';
    confidence = Math.max(0.7, 1 - pinchDistance / 0.35);
    rawDetails = `Pinch (Dist: ${(pinchDistance * 100).toFixed(0)}%)`;
  }
  // 2. Pointing Detection: Only index extended, middle/ring/pinky curled
  else if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    gesture = 'pointing';
    confidence = 0.92;
    rawDetails = 'Pointing with Index Finger';
  }
  // 3. Closed Fist: All 4 main fingers curled tightly towards palm
  else if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
    gesture = 'closed_fist';
    confidence = 0.95;
    rawDetails = 'Closed Fist (Pause/Lock)';
  }
  // 4. Spread Fingers vs Open Palm
  else if (extendedCount >= 4) {
    if (spreadDistance > 1.35 || pinchDistance > 1.1) {
      gesture = 'spread_fingers';
      confidence = 0.88;
      rawDetails = `Fingers Spread Wide (${extendedCount} fingers)`;
    } else {
      gesture = 'open_palm';
      confidence = 0.9;
      rawDetails = `Open Palm Active (${extendedCount} fingers)`;
    }
  }
  // 5. Thumbs Up
  else if (isThumbExtended && !isIndexExtended && !isMiddleExtended && thumbTip.y < thumbMcp.y - 0.05) {
    gesture = 'thumbs_up';
    confidence = 0.85;
    rawDetails = 'Thumbs Up';
  } else {
    // Default to open palm or partial
    gesture = extendedCount >= 3 ? 'open_palm' : 'none';
    confidence = 0.7;
    rawDetails = `Tracking (${extendedCount} fingers extended)`;
  }

  // Pointer position on screen for raycasting when pointing or open palm
  // Flip x because webcam is mirrored
  const screenPointer = {
    x: 1 - indexTip.x,
    y: indexTip.y,
  };

  return {
    landmarks,
    gesture,
    confidence,
    handPresent: true,
    handCenter: {
      x: 1 - handCenter.x, // mirror X
      y: handCenter.y,
    },
    pinchDistance,
    spreadDistance,
    screenPointer,
    rawGestureDetails: rawDetails,
  };
}
