import React, { useRef, useEffect, useState } from 'react';
import {
  Camera,
  CameraOff,
  Sliders,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Hand,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { HandTrackingResult, TrackingStatus, GestureControlSettings } from '../types/gestures';
import { globalHandTracker } from '../gestures/tracker';

interface GestureWebcamOverlayProps {
  trackingResult: HandTrackingResult;
  trackingStatus: TrackingStatus;
  statusMessage?: string;
  settings: GestureControlSettings;
  onUpdateSettings: (settings: Partial<GestureControlSettings>) => void;
  onRequestCamera: () => void;
}

const GESTURE_LABELS: Record<string, { label: string; action: string; color: string }> = {
  open_palm: { label: 'Open Palm', action: 'Move to Rotate 3D Model', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-800' },
  closed_fist: { label: 'Closed Fist', action: 'Paused / Interaction Locked', color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
  pointing: { label: 'Pointing Finger', action: 'Direct Target Raycast / Inspect', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
  pinch: { label: 'Pinch Fingers', action: 'Zoom In Closer', color: 'text-sky-400 bg-sky-950/60 border-sky-800' },
  spread_fingers: { label: 'Spread Fingers', action: 'Zoom Out Wider', color: 'text-indigo-400 bg-indigo-950/60 border-indigo-800' },
  thumbs_up: { label: 'Thumbs Up', action: 'Reset Camera View', color: 'text-teal-400 bg-teal-950/60 border-teal-800' },
  none: { label: 'Searching Hand', action: 'Show hand in camera frame', color: 'text-slate-400 bg-slate-900 border-slate-800' },
};

export const GestureWebcamOverlay: React.FC<GestureWebcamOverlayProps> = ({
  trackingResult,
  trackingStatus,
  statusMessage,
  settings,
  onUpdateSettings,
  onRequestCamera,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (videoRef.current && canvasRef.current) {
      globalHandTracker.setCanvas(canvasRef.current);
    }
  }, []);

  const gestureInfo = GESTURE_LABELS[trackingResult.gesture] || GESTURE_LABELS.none;

  return (
    <div
      className={`fixed top-20 right-6 z-30 transition-all duration-300 ${
        isCollapsed ? 'w-auto' : 'w-72 sm:w-80'
      }`}
    >
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="px-3.5 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                trackingStatus === 'tracking'
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : trackingStatus === 'requesting'
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
            />
            <span className="text-xs font-semibold text-slate-200 tracking-wide">
              {trackingStatus === 'tracking' ? 'Vision Sensor Online' : 'Camera Feed'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowGuide(!showGuide)}
              title="Gesture Controls Guide"
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              title="Calibration & Sensitivity"
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Camera PIP' : 'Minimize Camera PIP'}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Body */}
        {!isCollapsed && (
          <div className="p-3 space-y-3">
            {/* Video Viewport Container */}
            <div className="relative aspect-[4/3] bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80">
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />

              {/* Status overlay if not tracking */}
              {trackingStatus !== 'tracking' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-950/80 backdrop-blur-xs">
                  {trackingStatus === 'requesting' ? (
                    <div className="space-y-2">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-slate-300 font-medium">Starting MediaPipe AI...</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <CameraOff className="w-7 h-7 text-slate-500 mx-auto" />
                      <div>
                        <p className="text-xs font-medium text-slate-300">Webcam Not Active</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {statusMessage || 'Enable webcam for touchless gesture interaction.'}
                        </p>
                      </div>
                      <button
                        onClick={onRequestCamera}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
                      >
                        Grant Access
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Live pointer target reticle indicator on video */}
              {trackingResult.gesture === 'pointing' && trackingResult.screenPointer && (
                <div
                  className="absolute w-4 h-4 rounded-full border-2 border-emerald-400 pointer-events-none -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(1 - trackingResult.screenPointer.x) * 100}%`,
                    top: `${trackingResult.screenPointer.y * 100}%`,
                  }}
                />
              )}
            </div>

            {/* Gesture Badge & Recognition Details */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Recognized Gesture</span>
                {trackingResult.handPresent && (
                  <span className="font-mono text-cyan-400">
                    {(trackingResult.confidence * 100).toFixed(0)}% Conf
                  </span>
                )}
              </div>

              <div
                className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center justify-between font-medium ${gestureInfo.color}`}
              >
                <div className="flex items-center gap-2">
                  <Hand className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-semibold">{gestureInfo.label}</span>
                </div>
                <span className="text-[10px] opacity-85 truncate max-w-[130px]">
                  {gestureInfo.action}
                </span>
              </div>
            </div>

            {/* Settings Calibration Drawer */}
            {showSettings && (
              <div className="pt-2 border-t border-slate-800 space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Sensitivity</span>
                    <span className="font-mono">{settings.sensitivity.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={settings.sensitivity}
                    onChange={(e) => onUpdateSettings({ sensitivity: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Movement Smoothing</span>
                    <span className="font-mono">{(settings.smoothing * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={settings.smoothing}
                    onChange={(e) => onUpdateSettings({ smoothing: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-400">Invert Horizontal</span>
                  <input
                    type="checkbox"
                    checked={settings.invertX}
                    onChange={(e) => onUpdateSettings({ invertX: e.target.checked })}
                    className="accent-cyan-400"
                  />
                </div>
              </div>
            )}

            {/* Gesture Quick Guide Card */}
            {showGuide && (
              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-[11px] text-slate-300">
                <div className="font-semibold text-slate-100 mb-1">Gesture Commands:</div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-cyan-400 font-semibold">Open Palm:</span> Move to rotate
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-amber-400 font-semibold">Closed Fist:</span> Lock/Pause
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-emerald-400 font-semibold">Point Index:</span> Raycast select
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-sky-400 font-semibold">Pinch Fingers:</span> Zoom In
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-indigo-400 font-semibold">Spread Fingers:</span> Zoom Out
                  </div>
                  <div className="bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <span className="text-teal-400 font-semibold">Thumbs Up:</span> Reset view
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
