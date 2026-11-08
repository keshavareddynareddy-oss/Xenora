import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandLandmark, HandTrackingResult, TrackingStatus } from '../types/gestures';
import { classifyHandGesture, LandmarkSmoother } from './classifier';

export const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8], // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16], // Ring
  [13, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [0, 17], // Palm base
];

export class HandTrackerService {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private handLandmarker: HandLandmarker | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private isRunning = false;
  private status: TrackingStatus = 'idle';
  private statusListeners: ((status: TrackingStatus, message?: string) => void)[] = [];
  private resultListeners: ((result: HandTrackingResult) => void)[] = [];
  private smoother = new LandmarkSmoother(0.5);
  private lastVideoTime = -1;

  onStatusChange(cb: (status: TrackingStatus, message?: string) => void) {
    this.statusListeners.push(cb);
    cb(this.status);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== cb);
    };
  }

  onResult(cb: (result: HandTrackingResult) => void) {
    this.resultListeners.push(cb);
    return () => {
      this.resultListeners = this.resultListeners.filter((l) => l !== cb);
    };
  }

  setSmoothing(val: number) {
    this.smoother.setSmoothing(val);
  }

  private setStatus(status: TrackingStatus, message?: string) {
    this.status = status;
    this.statusListeners.forEach((l) => l(status, message));
  }

  async initialize(videoEl: HTMLVideoElement, canvasEl?: HTMLCanvasElement): Promise<boolean> {
    this.video = videoEl;
    if (canvasEl) this.canvas = canvasEl;

    try {
      this.setStatus('requesting', 'Loading MediaPipe hand recognition models...');

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      try {
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch (gpuError) {
        console.warn('GPU delegate fallback to CPU:', gpuError);
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      this.setStatus('requesting', 'Requesting camera access...');
      return await this.startCamera();
    } catch (err: any) {
      console.error('Hand tracker initialization error:', err);
      this.setStatus('error', err?.message || 'Failed to initialize hand tracker');
      return false;
    }
  }

  async startCamera(): Promise<boolean> {
    if (!this.video) return false;

    try {
      if (this.stream) {
        this.stopCamera();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      this.stream = stream;
      this.video.srcObject = stream;
      this.video.playsInline = true;
      this.video.muted = true;

      await new Promise<void>((resolve) => {
        if (!this.video) return resolve();
        this.video.onloadedmetadata = () => {
          this.video?.play().then(() => resolve());
        };
      });

      this.isRunning = true;
      this.setStatus('tracking', 'Camera active. Real-time tracking online.');
      this.startDetectionLoop();
      return true;
    } catch (err: any) {
      console.error('Webcam permission error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.setStatus('denied', 'Camera permission denied. Manual controls enabled.');
      } else {
        this.setStatus('error', 'Webcam unavailable or busy. Using manual controls.');
      }
      return false;
    }
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  private startDetectionLoop() {
    const loop = (timestamp: number) => {
      if (!this.isRunning) return;

      if (this.video && this.video.readyState >= 2 && this.handLandmarker) {
        if (this.video.currentTime !== this.lastVideoTime) {
          this.lastVideoTime = this.video.currentTime;

          try {
            const results = this.handLandmarker.detectForVideo(this.video, timestamp);
            if (results && results.landmarks && results.landmarks.length > 0) {
              const rawLandmarks: HandLandmark[] = results.landmarks[0].map((lm) => ({
                x: lm.x,
                y: lm.y,
                z: lm.z ?? 0,
              }));

              const smoothed = this.smoother.smooth(rawLandmarks);
              const gestureResult = classifyHandGesture(smoothed);

              // Draw skeleton overlay on canvas if available
              if (this.canvas) {
                this.drawLandmarks(smoothed, gestureResult.gesture);
              }

              this.resultListeners.forEach((l) => l(gestureResult));
            } else {
              this.smoother.reset();
              if (this.canvas) {
                this.clearCanvas();
              }
              const emptyResult: HandTrackingResult = {
                landmarks: null,
                gesture: 'none',
                confidence: 0,
                handPresent: false,
                handCenter: { x: 0.5, y: 0.5 },
                pinchDistance: 1,
                spreadDistance: 0,
                rawGestureDetails: 'Looking for hand...',
              };
              this.resultListeners.forEach((l) => l(emptyResult));
            }
          } catch (e) {
            // Frame skip / sync error handled gracefully
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private drawLandmarks(landmarks: HandLandmark[], gesture: string) {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const width = this.canvas.width;
    const height = this.canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Style for medical biometric HUD
    const isInteracting = gesture !== 'closed_fist' && gesture !== 'none';
    const boneColor = isInteracting ? 'rgba(56, 189, 248, 0.75)' : 'rgba(148, 163, 184, 0.5)';
    const jointColor = gesture === 'pinch' ? '#f59e0b' : gesture === 'pointing' ? '#10b981' : '#06b6d4';

    // Draw skeletal bones
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = boneColor;

    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const p1 = landmarks[startIdx];
      const p2 = landmarks[endIdx];
      if (!p1 || !p2) continue;

      ctx.beginPath();
      // Mirror x for natural webcam mirror
      ctx.moveTo((1 - p1.x) * width, p1.y * height);
      ctx.lineTo((1 - p2.x) * width, p2.y * height);
      ctx.stroke();
    }

    // Draw joint nodes
    for (let i = 0; i < landmarks.length; i++) {
      const p = landmarks[i];
      const x = (1 - p.x) * width;
      const y = p.y * height;
      const isFingertip = [4, 8, 12, 16, 20].includes(i);

      ctx.beginPath();
      ctx.arc(x, y, isFingertip ? 4.5 : 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = isFingertip ? jointColor : '#e2e8f0';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();
    }

    // If pointing, draw reticle crosshair around index fingertip (8)
    if (gesture === 'pointing') {
      const p = landmarks[8];
      const x = (1 - p.x) * width;
      const y = p.y * height;

      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x - 16, y);
      ctx.lineTo(x + 16, y);
      ctx.moveTo(x, y - 16);
      ctx.lineTo(x, y + 16);
      ctx.stroke();
    }
  }

  private clearCanvas() {
    if (!this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.video) {
      this.video.srcObject = null;
    }
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.setStatus('idle', 'Camera stopped');
  }

  destroy() {
    this.stopCamera();
    this.statusListeners = [];
    this.resultListeners = [];
    if (this.handLandmarker) {
      this.handLandmarker.close();
      this.handLandmarker = null;
    }
  }
}

export const globalHandTracker = new HandTrackerService();
