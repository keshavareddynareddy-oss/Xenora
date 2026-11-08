/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnatomySceneManager } from './three/SceneManager';
import { ANATOMICAL_STRUCTURES, SUBJECT_CAMERA_PRESETS, SUBJECT_DESCRIPTORS } from './anatomy/data';
import {
  EducationalComponent,
  AnatomyCategory,
  AnatomyLayerState,
  TopicId,
  CameraPreset,
} from './types/discipline';
import { AppMode, TourStep } from './types/learning';
import { HandTrackingResult, TrackingStatus, GestureControlSettings } from './types/gestures';
import { globalHandTracker } from './gestures/tracker';
import { TopBar } from './components/TopBar';
import { BottomControlDock } from './components/BottomControlDock';
import { StructureInfoDrawer } from './components/StructureInfoDrawer';
import { GestureWebcamOverlay } from './components/GestureWebcamOverlay';
import { AiAssistantModal } from './components/AiAssistantModal';
import { GuidedTourPanel } from './components/GuidedTourPanel';
import { QuizModal } from './components/QuizModal';
import { DashboardView } from './components/DashboardView';
import { TOPICS_MAP } from './data/curriculumData';

const INITIAL_LAYERS: AnatomyLayerState = {
  skeletal: true,
  muscular: true,
  nervous: true,
  circulatory: true,
  respiratory: true,
  digestive: true,
};

const INITIAL_SETTINGS: GestureControlSettings = {
  sensitivity: 1.2,
  smoothing: 0.4,
  invertX: false,
  invertY: false,
  enableGestures: true,
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<AnatomySceneManager | null>(null);

  // Core App States
  const [mode, setMode] = useState<AppMode>('explorer');
  const [activeSubject, setActiveSubject] = useState<TopicId>('four_stroke_engine');
  const [layers, setLayers] = useState<AnatomyLayerState>(INITIAL_LAYERS);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [isIsolated, setIsIsolated] = useState(false);

  // Simulation Controls for Working Principle Mode
  const [isSimulationPlaying, setIsSimulationPlaying] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1.0);

  // Gestures & Camera States
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [trackingResult, setTrackingResult] = useState<HandTrackingResult>({
    landmarks: null,
    gesture: 'none',
    confidence: 0,
    handPresent: false,
    handCenter: { x: 0.5, y: 0.5 },
    pinchDistance: 1,
    spreadDistance: 0,
    rawGestureDetails: 'Waiting for camera initialization...',
  });
  const [gestureSettings, setGestureSettings] = useState<GestureControlSettings>(INITIAL_SETTINGS);

  // Modals
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  // Manual mouse interaction refs
  const isPointerDownRef = useRef(false);
  const prevPointerPosRef = useRef({ x: 0, y: 0 });
  const prevHandCenterRef = useRef<{ x: number; y: number } | null>(null);
  const pointingDwellTimerRef = useRef<number | null>(null);
  const lastHoveredStructureRef = useRef<string | null>(null);

  // Active discipline determination
  const currentTopicDef = TOPICS_MAP.get(activeSubject);
  const activeDiscipline = currentTopicDef?.disciplineId || 'mechanical';

  // 1. Initialize Three.js Scene Manager
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const manager = new AnatomySceneManager(canvasMountRef.current);
    sceneManagerRef.current = manager;

    // Load initial subject
    manager.setSubject('four_stroke_engine');

    manager.onSelect((id) => {
      setSelectedStructureId(id);
    });

    return () => {
      manager.dispose();
      sceneManagerRef.current = null;
    };
  }, []);

  // Sync simulation playback state with scene manager
  useEffect(() => {
    if (sceneManagerRef.current) {
      sceneManagerRef.current.setWorkingPrinciplePlay(isSimulationPlaying);
      sceneManagerRef.current.setWorkingPrincipleSpeed(simulationSpeed);
    }
  }, [isSimulationPlaying, simulationSpeed]);

  // 2. Initialize MediaPipe Hand Tracker
  const handleRequestCamera = useCallback(async () => {
    const videoEl = document.querySelector('video');
    const canvasEl = document.querySelector('canvas');
    if (videoEl) {
      await globalHandTracker.initialize(videoEl, canvasEl || undefined);
    }
  }, []);

  useEffect(() => {
    const unsubStatus = globalHandTracker.onStatusChange((status, msg) => {
      setTrackingStatus(status);
      if (msg) setStatusMessage(msg);
    });

    const unsubResult = globalHandTracker.onResult((result) => {
      setTrackingResult(result);
    });

    handleRequestCamera();

    return () => {
      unsubStatus();
      unsubResult();
      globalHandTracker.destroy();
    };
  }, [handleRequestCamera]);

  // 3. Map Real-time Hand Gestures to 3D Scene Controls
  useEffect(() => {
    if (!gestureSettings.enableGestures || !sceneManagerRef.current) return;
    if (!trackingResult.handPresent || !trackingResult.landmarks) {
      prevHandCenterRef.current = null;
      return;
    }

    const { gesture, handCenter, screenPointer } = trackingResult;
    const manager = sceneManagerRef.current;
    const sens = gestureSettings.sensitivity;

    // A. Open Palm -> Horizontal / Vertical Rotation
    if (gesture === 'open_palm') {
      if (prevHandCenterRef.current) {
        let dx = (handCenter.x - prevHandCenterRef.current.x) * sens;
        let dy = (handCenter.y - prevHandCenterRef.current.y) * sens;

        if (gestureSettings.invertX) dx = -dx;
        if (gestureSettings.invertY) dy = -dy;

        // Apply smooth delta rotation to the 3D model
        manager.rotateModelDelta(dx * 2.8, dy * 2.0);
      }
      prevHandCenterRef.current = { ...handCenter };
    } else {
      prevHandCenterRef.current = null;
    }

    // B. Pinch Thumb & Index -> Zoom In
    if (gesture === 'pinch') {
      manager.zoomDelta(0.975);
    }

    // C. Spread Fingers -> Zoom Out
    if (gesture === 'spread_fingers') {
      manager.zoomDelta(1.025);
    }

    // D. Closed Fist -> Pause Interaction / Freeze View
    if (gesture === 'closed_fist') {
      prevHandCenterRef.current = null;
    }

    // E. Pointing with Index Finger -> Raycasting & Component Selection
    if (gesture === 'pointing' && screenPointer) {
      const hitStructureId = manager.raycastFromNormalized(screenPointer.x, screenPointer.y);

      if (hitStructureId) {
        if (lastHoveredStructureRef.current !== hitStructureId) {
          lastHoveredStructureRef.current = hitStructureId;
          manager.setHoveredStructure(hitStructureId);

          if (pointingDwellTimerRef.current) {
            window.clearTimeout(pointingDwellTimerRef.current);
          }

          pointingDwellTimerRef.current = window.setTimeout(() => {
            setSelectedStructureId(hitStructureId);
            manager.setSelectedStructure(hitStructureId, isIsolated);
          }, 350);
        }
      } else {
        if (lastHoveredStructureRef.current) {
          lastHoveredStructureRef.current = null;
          manager.setHoveredStructure(null);
          if (pointingDwellTimerRef.current) {
            window.clearTimeout(pointingDwellTimerRef.current);
            pointingDwellTimerRef.current = null;
          }
        }
      }
    } else {
      if (lastHoveredStructureRef.current) {
        lastHoveredStructureRef.current = null;
        manager.setHoveredStructure(null);
      }
    }
  }, [trackingResult, gestureSettings, isIsolated]);

  // 4. Mouse / Touch Fallback Controls
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = true;
    prevPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !sceneManagerRef.current) return;
    const dx = (e.clientX - prevPointerPosRef.current.x) * 0.006;
    const dy = (e.clientY - prevPointerPosRef.current.y) * 0.005;

    sceneManagerRef.current.rotateModelDelta(dx, dy);
    prevPointerPosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!sceneManagerRef.current) return;
    const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
    sceneManagerRef.current.zoomDelta(zoomFactor);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sceneManagerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;

    const hitId = sceneManagerRef.current.raycastFromNormalized(nx, ny);
    setSelectedStructureId(hitId);
    sceneManagerRef.current.setSelectedStructure(hitId, isIsolated);
  };

  // Switch Active Subject / Topic
  const handleSelectSubject = (subject: TopicId) => {
    setActiveSubject(subject);
    setSelectedStructureId(null);
    setIsIsolated(false);
    sceneManagerRef.current?.setSubject(subject);
  };

  // Layer Toggles (for Human Gross Anatomy)
  const handleToggleLayer = (category: AnatomyCategory) => {
    const updated = { ...layers, [category]: !layers[category] };
    setLayers(updated);
    sceneManagerRef.current?.setLayers(updated);
  };

  const handleSoloLayer = (category: AnatomyCategory) => {
    const updated: AnatomyLayerState = {
      skeletal: false,
      muscular: false,
      nervous: false,
      circulatory: false,
      respiratory: false,
      digestive: false,
      [category]: true,
    };
    setLayers(updated);
    sceneManagerRef.current?.setLayers(updated);
  };

  const handleSelectAllLayers = (enable: boolean) => {
    const updated: AnatomyLayerState = {
      skeletal: enable,
      muscular: enable,
      nervous: enable,
      circulatory: enable,
      respiratory: enable,
      digestive: enable,
    };
    setLayers(updated);
    sceneManagerRef.current?.setLayers(updated);
  };

  // Camera Presets
  const handleApplyPreset = (preset: CameraPreset) => {
    sceneManagerRef.current?.applyCameraPreset(preset);
  };

  const handleResetCamera = () => {
    sceneManagerRef.current?.resetCamera();
  };

  const handleManualRotate = (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!sceneManagerRef.current) return;
    const step = 0.35;
    if (direction === 'left') sceneManagerRef.current.rotateModelDelta(step, 0);
    if (direction === 'right') sceneManagerRef.current.rotateModelDelta(-step, 0);
    if (direction === 'up') sceneManagerRef.current.rotateModelDelta(0, -step * 0.7);
    if (direction === 'down') sceneManagerRef.current.rotateModelDelta(0, step * 0.7);
  };

  const handleManualZoom = (delta: number) => {
    sceneManagerRef.current?.zoomDelta(delta);
  };

  const handleToggleIsolation = () => {
    const nextIso = !isIsolated;
    setIsIsolated(nextIso);
    sceneManagerRef.current?.setIsolation(nextIso);
  };

  const handleSelectStructureById = (id: string) => {
    setSelectedStructureId(id);
    sceneManagerRef.current?.setSelectedStructure(id, isIsolated);

    const found = ANATOMICAL_STRUCTURES.find((s) => s.id === id);
    if (found) {
      sceneManagerRef.current?.applyCameraPreset({
        id: found.id,
        label: found.name,
        target: found.cameraTarget,
        position: [found.cameraTarget[0], found.cameraTarget[1], found.cameraDistance],
      });
    }
  };

  const handleTourStepChange = (step: TourStep) => {
    handleSelectStructureById(step.structureId);
  };

  const currentSelectedStructure = selectedStructureId
    ? ANATOMICAL_STRUCTURES.find((s) => s.id === selectedStructureId) || null
    : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Viewport Container */}
      <div
        ref={canvasMountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      />

      {/* Top Bar Navigation with Subject & Mode Switchers */}
      <TopBar
        currentMode={mode}
        onSelectMode={(m) => setMode(m)}
        activeSubject={activeSubject}
        onSelectSubject={handleSelectSubject}
        trackingStatus={trackingStatus}
        isGesturesEnabled={gestureSettings.enableGestures}
        onToggleGestures={() =>
          setGestureSettings((s) => ({ ...s, enableGestures: !s.enableGestures }))
        }
        onRequestCamera={handleRequestCamera}
        onResetCamera={handleResetCamera}
        onOpenAiAssistant={() => setIsAiOpen(true)}
      />

      {/* Real-time Hand Tracking PIP Webcam Overlay */}
      <GestureWebcamOverlay
        trackingResult={trackingResult}
        trackingStatus={trackingStatus}
        statusMessage={statusMessage}
        settings={gestureSettings}
        onUpdateSettings={(newVals) => setGestureSettings((prev) => ({ ...prev, ...newVals }))}
        onRequestCamera={handleRequestCamera}
      />

      {/* Ergonomic Collapsible Bottom Control Dock with Simulation Telemetry */}
      {mode !== 'dashboard' && (
        <BottomControlDock
          currentMode={mode}
          activeSubject={activeSubject}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          onSoloLayer={handleSoloLayer}
          onSelectAllLayers={handleSelectAllLayers}
          onApplyCameraPreset={handleApplyPreset}
          onSelectStructure={handleSelectStructureById}
          onManualRotate={handleManualRotate}
          onManualZoom={handleManualZoom}
          onResetCamera={handleResetCamera}
          isIsolated={isIsolated}
          hasSelection={!!selectedStructureId}
          onToggleIsolation={handleToggleIsolation}
          isSimulationPlaying={isSimulationPlaying}
          onToggleSimulationPlay={() => setIsSimulationPlaying((p) => !p)}
          simulationSpeed={simulationSpeed}
          onChangeSimulationSpeed={setSimulationSpeed}
        />
      )}

      {/* Sliding Structure & Component Details Drawer */}
      {mode !== 'dashboard' && currentSelectedStructure && (
        <StructureInfoDrawer
          structure={currentSelectedStructure}
          onClose={() => {
            setSelectedStructureId(null);
            sceneManagerRef.current?.setSelectedStructure(null, false);
            setIsIsolated(false);
          }}
          onSelectRelated={handleSelectStructureById}
          onAskAi={() => setIsAiOpen(true)}
          isIsolated={isIsolated}
          onToggleIsolation={handleToggleIsolation}
        />
      )}

      {/* Guided Tour Panel */}
      {mode === 'tour' && (
        <GuidedTourPanel
          onStepChange={handleTourStepChange}
          onExitTour={() => setMode('explorer')}
        />
      )}

      {/* Dashboard View Overlay */}
      {mode === 'dashboard' && (
        <DashboardView
          onStartExploration={(topicId) => {
            if (topicId) {
              handleSelectSubject(topicId);
            }
            setMode('explorer');
          }}
          onOpenWorkingPrinciple={(topicId) => {
            if (topicId) {
              handleSelectSubject(topicId);
            }
            setMode('working_principle');
          }}
          onOpenTour={(topicId) => {
            if (topicId) {
              handleSelectSubject(topicId);
            }
            setMode('tour');
          }}
          onOpenQuiz={(topicId) => {
            if (topicId) {
              handleSelectSubject(topicId);
            }
            setMode('quiz');
          }}
          onOpenAi={() => setIsAiOpen(true)}
          trackingStatus={trackingStatus}
          onRequestCamera={handleRequestCamera}
        />
      )}

      {/* AI Assistant Modal (Gemini 3.8 Flash) */}
      <AiAssistantModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        selectedStructure={currentSelectedStructure}
        activeTopic={activeSubject}
        activeDiscipline={activeDiscipline}
      />

      {/* Interactive Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen || mode === 'quiz'}
        onClose={() => {
          setIsQuizOpen(false);
          if (mode === 'quiz') setMode('explorer');
        }}
        onSelectStructure={handleSelectStructureById}
        activeTopic={activeSubject}
        activeDiscipline={activeDiscipline}
      />
    </div>
  );
}
