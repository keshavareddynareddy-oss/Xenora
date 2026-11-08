import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { AnatomyCategory, AnatomyLayerState, AnatomySubject, CameraPreset } from '../types/anatomy';
import { SUBJECT_CAMERA_PRESETS } from '../anatomy/data';
import { createAnatomyMaterials, AnatomyMaterials } from './materials';

// Biological Specimens
import { buildSkeletalModel } from './models/buildSkeletalModel';
import { buildMuscularModel } from './models/buildMuscularModel';
import { buildNervousModel } from './models/buildNervousModel';
import { buildCirculatoryModel } from './models/buildCirculatoryModel';
import { buildRespiratoryModel } from './models/buildRespiratoryModel';
import { buildDigestiveModel } from './models/buildDigestiveModel';
import { buildHeartSpecimen } from './models/buildHeartSpecimen';
import { buildBrainSpecimen } from './models/buildBrainSpecimen';
import { buildCanineSpecimen } from './models/buildCanineSpecimen';
import { buildCellSpecimen } from './models/buildCellSpecimen';
import { buildPlantSpecimen } from './models/buildPlantSpecimen';

// Engineering & Computer Science Models
import { buildEngineModel, EngineAnimationRefs } from './models/buildEngineModel';
import { buildGearboxModel, GearboxAnimationRefs } from './models/buildGearboxModel';
import { buildPumpModel, PumpAnimationRefs } from './models/buildPumpModel';
import { buildMotorModel, MotorAnimationRefs } from './models/buildMotorModel';
import { buildTransformerModel, TransformerAnimationRefs } from './models/buildTransformerModel';
import { buildTransistorModel, TransistorAnimationRefs } from './models/buildTransistorModel';
import { buildMicrocontrollerModel } from './models/buildMicrocontrollerModel';
import { buildTrussBridgeModel, TrussBridgeAnimationRefs } from './models/buildTrussBridgeModel';
import { buildConcreteModel } from './models/buildConcreteModel';
import { buildNeuralNetModel, NeuralNetAnimationRefs } from './models/buildNeuralNetModel';
import { buildTreeModel, TreeAnimationRefs } from './models/buildTreeModel';

export class AnatomySceneManager {
  private container: HTMLDivElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private materials: AnatomyMaterials;

  // Active Subject / Topic
  private activeSubject: AnatomySubject = 'human';
  private subjectRoots: Record<string, THREE.Group> = {};

  // Human Layer groups
  private systemGroups: Record<AnatomyCategory, THREE.Group> = {} as any;
  private allSelectableMeshes: THREE.Object3D[] = [];
  private originalMaterialsMap = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();

  // Animation References
  private heartMesh: THREE.Group | null = null;
  private isolatedHeartMesh: THREE.Group | null = null;
  private lungsMesh: THREE.Group | null = null;

  private engineAnim: EngineAnimationRefs | null = null;
  private gearboxAnim: GearboxAnimationRefs | null = null;
  private pumpAnim: PumpAnimationRefs | null = null;
  private motorAnim: MotorAnimationRefs | null = null;
  private transformerAnim: TransformerAnimationRefs | null = null;
  private transistorAnim: TransistorAnimationRefs | null = null;
  private trussAnim: TrussBridgeAnimationRefs | null = null;
  private neuralAnim: NeuralNetAnimationRefs | null = null;
  private treeAnim: TreeAnimationRefs | null = null;

  // Working Principle Mode Animation state
  private isSimulationPlaying = true;
  private simulationSpeed = 1.0;
  private simulationTime = 0;

  // Camera & Rotation states with smooth kinematics
  private targetCameraPos = new THREE.Vector3(0, 1.2, 7.8);
  private currentCameraPos = new THREE.Vector3(0, 1.2, 7.8);
  private targetLookAt = new THREE.Vector3(0, 1.0, 0);
  private currentLookAt = new THREE.Vector3(0, 1.0, 0);

  // Model rotation (yaw, pitch)
  private modelYaw = 0;
  private targetModelYaw = 0;
  private modelPitch = 0;
  private targetModelPitch = 0;
  private modelRootGroup = new THREE.Group();

  // Selection & Hover
  private selectedStructureId: string | null = null;
  private hoveredStructureId: string | null = null;
  private isIsolated = false;

  // Raycaster
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Animation frame & Clock
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();
  private isSoftwareGl = false;

  // Callback listeners
  private onSelectCallback?: (structureId: string | null) => void;
  private onHoverCallback?: (structureId: string | null) => void;

  constructor(container: HTMLDivElement) {
    this.container = container;

    // Detect software WebGL guard
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    this.container.appendChild(this.renderer.domElement);

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.copy(this.currentCameraPos);
    this.camera.lookAt(this.currentLookAt);

    // Studio Environment Reflection
    try {
      const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
      this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.warn('RoomEnvironment fallback:', e);
    }

    // Materials
    this.materials = createAnatomyMaterials();

    // Scene Lighting Rig
    this.setupLighting();

    // Grounding Grid & Radial Contact Shadow
    this.setupGrounding();

    // Build Models across all Disciplines
    this.buildModels();

    // Resize Observer
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);

    // Start render loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private setupLighting() {
    // 1. Warm Directional Key Light with soft shadows
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 1.8);
    keyLight.position.set(4, 6, 5);
    if (!this.isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    // 2. Cool Cyan Rim Light
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    rimLight.position.set(-4, 3, -4);
    this.scene.add(rimLight);

    // 3. Soft Frontal Fill
    const fillLight = new THREE.DirectionalLight(0x94a3b8, 0.8);
    fillLight.position.set(0, 0, 5);
    this.scene.add(fillLight);

    // 4. Cool sky / warm floor hemisphere fill
    const hemiLight = new THREE.HemisphereLight(0x0f172a, 0x020617, 0.9);
    this.scene.add(hemiLight);
  }

  private setupGrounding() {
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.75,
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -3.8;
    this.scene.add(shadowPlane);

    const gridHelper = new THREE.GridHelper(8, 24, 0x0ea5e9, 0x1e293b);
    gridHelper.position.y = -3.79;
    this.scene.add(gridHelper);
  }

  private buildModels() {
    this.modelRootGroup.name = 'all_disciplines_root';

    // ── 1. BIOMEDICAL: HUMAN FULL BODY ─────────────────────
    const humanGroup = new THREE.Group();
    humanGroup.name = 'subject_human';

    const skeletal = buildSkeletalModel(this.materials);
    this.systemGroups.skeletal = skeletal;
    humanGroup.add(skeletal);

    const muscular = buildMuscularModel(this.materials);
    this.systemGroups.muscular = muscular;
    humanGroup.add(muscular);

    const nervous = buildNervousModel(this.materials);
    this.systemGroups.nervous = nervous;
    humanGroup.add(nervous);

    const circResult = buildCirculatoryModel(this.materials);
    this.systemGroups.circulatory = circResult.group;
    this.heartMesh = circResult.heartMesh;
    humanGroup.add(circResult.group);

    const respResult = buildRespiratoryModel(this.materials);
    this.systemGroups.respiratory = respResult.group;
    this.lungsMesh = respResult.lungsGroup;
    humanGroup.add(respResult.group);

    const digestive = buildDigestiveModel(this.materials);
    this.systemGroups.digestive = digestive;
    humanGroup.add(digestive);

    this.subjectRoots.human = humanGroup;
    this.modelRootGroup.add(humanGroup);

    // ── 2. BIOMEDICAL: HEART SPECIMEN ──────────────────────
    const heartSpec = buildHeartSpecimen(this.materials);
    this.subjectRoots.heart = heartSpec.group;
    this.isolatedHeartMesh = heartSpec.heartRoot;
    heartSpec.group.visible = false;
    this.modelRootGroup.add(heartSpec.group);

    // ── 3. BIOMEDICAL: BRAIN & CNS ─────────────────────────
    const brainSpec = buildBrainSpecimen(this.materials);
    this.subjectRoots.brain = brainSpec;
    brainSpec.visible = false;
    this.modelRootGroup.add(brainSpec);

    // ── 4. BIOMEDICAL: CANINE VETERINARY ───────────────────
    const canineSpec = buildCanineSpecimen(this.materials);
    this.subjectRoots.canine = canineSpec;
    canineSpec.visible = false;
    this.modelRootGroup.add(canineSpec);

    // ── 5. BIOMEDICAL: CELLULAR BIOLOGY ────────────────────
    const cellSpec = buildCellSpecimen(this.materials);
    this.subjectRoots.cell = cellSpec;
    cellSpec.visible = false;
    this.modelRootGroup.add(cellSpec);

    // ── 6. BIOMEDICAL: BOTANICAL PLANT TISSUE ──────────────
    const plantSpec = buildPlantSpecimen(this.materials);
    this.subjectRoots.plant = plantSpec;
    plantSpec.visible = false;
    this.modelRootGroup.add(plantSpec);

    // ── 7. MECHANICAL: FOUR-STROKE IC ENGINE ───────────────
    const engineRes = buildEngineModel(this.materials);
    this.subjectRoots.four_stroke_engine = engineRes.group;
    this.engineAnim = engineRes.animRefs;
    engineRes.group.visible = false;
    this.modelRootGroup.add(engineRes.group);

    // ── 8. MECHANICAL: PLANETARY GEARBOX ───────────────────
    const gearRes = buildGearboxModel(this.materials);
    this.subjectRoots.planetary_gearbox = gearRes.group;
    this.gearboxAnim = gearRes.animRefs;
    gearRes.group.visible = false;
    this.modelRootGroup.add(gearRes.group);

    // ── 9. MECHANICAL: CENTRIFUGAL PUMP ────────────────────
    const pumpRes = buildPumpModel(this.materials);
    this.subjectRoots.centrifugal_pump = pumpRes.group;
    this.pumpAnim = pumpRes.animRefs;
    pumpRes.group.visible = false;
    this.modelRootGroup.add(pumpRes.group);

    // ── 10. ELECTRICAL: AC INDUCTION MOTOR ─────────────────
    const motorRes = buildMotorModel(this.materials);
    this.subjectRoots.ac_induction_motor = motorRes.group;
    this.motorAnim = motorRes.animRefs;
    motorRes.group.visible = false;
    this.modelRootGroup.add(motorRes.group);

    // ── 11. ELECTRICAL: POWER TRANSFORMER ──────────────────
    const transRes = buildTransformerModel(this.materials);
    this.subjectRoots.power_transformer = transRes.group;
    this.transformerAnim = transRes.animRefs;
    transRes.group.visible = false;
    this.modelRootGroup.add(transRes.group);

    // ── 12. ELECTRONICS: BJT/MOSFET TRANSISTOR ─────────────
    const semiRes = buildTransistorModel(this.materials);
    this.subjectRoots.bjt_mosfet_transistor = semiRes.group;
    this.transistorAnim = semiRes.animRefs;
    semiRes.group.visible = false;
    this.modelRootGroup.add(semiRes.group);

    // ── 13. ELECTRONICS: MICROCONTROLLER PCB ───────────────
    const pcbGroup = buildMicrocontrollerModel(this.materials);
    this.subjectRoots.microcontroller_pcb = pcbGroup;
    pcbGroup.visible = false;
    this.modelRootGroup.add(pcbGroup);

    // ── 14. CIVIL: TRUSS BRIDGE ────────────────────────────
    const bridgeRes = buildTrussBridgeModel(this.materials);
    this.subjectRoots.truss_bridge = bridgeRes.group;
    this.trussAnim = bridgeRes.animRefs;
    bridgeRes.group.visible = false;
    this.modelRootGroup.add(bridgeRes.group);

    // ── 15. CIVIL: REINFORCED CONCRETE ─────────────────────
    const rcGroup = buildConcreteModel(this.materials);
    this.subjectRoots.reinforced_concrete = rcGroup;
    rcGroup.visible = false;
    this.modelRootGroup.add(rcGroup);

    // ── 16. COMPUTER SCIENCE: 3D NEURAL NETWORK ────────────
    const nnRes = buildNeuralNetModel(this.materials);
    this.subjectRoots.neural_network_3d = nnRes.group;
    this.neuralAnim = nnRes.animRefs;
    nnRes.group.visible = false;
    this.modelRootGroup.add(nnRes.group);

    // ── 17. COMPUTER SCIENCE: BINARY SEARCH TREE ───────────
    const treeRes = buildTreeModel(this.materials);
    this.subjectRoots.binary_search_tree = treeRes.group;
    this.treeAnim = treeRes.animRefs;
    treeRes.group.visible = false;
    this.modelRootGroup.add(treeRes.group);

    this.scene.add(this.modelRootGroup);

    // Initial indexing
    this.reindexSelectableMeshes();
  }

  setSubject(subject: AnatomySubject) {
    this.activeSubject = subject;

    Object.keys(this.subjectRoots).forEach((s) => {
      if (this.subjectRoots[s]) {
        this.subjectRoots[s].visible = s === subject;
      }
    });

    this.reindexSelectableMeshes();
    this.selectedStructureId = null;
    this.hoveredStructureId = null;
    this.isIsolated = false;
    this.refreshHighlightAndIsolation();

    // Apply default camera preset for this subject
    const presets = SUBJECT_CAMERA_PRESETS[subject];
    if (presets && presets.length > 0) {
      this.applyCameraPreset(presets[0]);
    }
  }

  getActiveSubject(): AnatomySubject {
    return this.activeSubject;
  }

  setWorkingPrinciplePlay(isPlaying: boolean) {
    this.isSimulationPlaying = isPlaying;
  }

  setWorkingPrincipleSpeed(speed: number) {
    this.simulationSpeed = Math.max(0.1, Math.min(3.0, speed));
  }

  private reindexSelectableMeshes() {
    this.allSelectableMeshes = [];
    const activeRoot = this.subjectRoots[this.activeSubject];
    if (!activeRoot) return;

    activeRoot.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (!this.originalMaterialsMap.has(obj)) {
          this.originalMaterialsMap.set(obj, obj.material);
        }
        let current: THREE.Object3D | null = obj;
        while (current && current !== activeRoot) {
          if (current.userData && current.userData.structureId) {
            obj.userData.structureId = current.userData.structureId;
            obj.userData.category = current.userData.category;
            obj.userData.name = current.userData.name;
            obj.userData.topic = current.userData.topic;
            break;
          }
          current = current.parent;
        }
        if (obj.userData.structureId) {
          this.allSelectableMeshes.push(obj);
        }
      }
    });
  }

  // Set layer visibility (applies to human subject)
  setLayers(layers: AnatomyLayerState) {
    (Object.keys(layers) as AnatomyCategory[]).forEach((cat) => {
      const group = this.systemGroups[cat];
      if (group) {
        group.visible = layers[cat];
      }
    });
    this.refreshHighlightAndIsolation();
  }

  // Set selected structure
  setSelectedStructure(structureId: string | null, isolate = false) {
    this.selectedStructureId = structureId;
    this.isIsolated = isolate;
    this.refreshHighlightAndIsolation();
    if (this.onSelectCallback) this.onSelectCallback(structureId);
  }

  setIsolation(isolate: boolean) {
    this.isIsolated = isolate;
    this.refreshHighlightAndIsolation();
  }

  setHoveredStructure(structureId: string | null) {
    if (this.hoveredStructureId === structureId) return;
    this.hoveredStructureId = structureId;
    this.refreshHighlightAndIsolation();
    if (this.onHoverCallback) this.onHoverCallback(structureId);
  }

  private refreshHighlightAndIsolation() {
    this.allSelectableMeshes.forEach((mesh) => {
      if (!(mesh instanceof THREE.Mesh)) return;
      const originalMat = this.originalMaterialsMap.get(mesh);
      if (!originalMat) return;

      const structId = mesh.userData.structureId;
      const isSelected = structId === this.selectedStructureId;
      const isHovered = structId === this.hoveredStructureId;

      if (isSelected) {
        mesh.material = this.materials.highlight;
        mesh.visible = true;
      } else if (isHovered) {
        mesh.material = this.materials.highlight;
        mesh.visible = true;
      } else if (this.isIsolated && this.selectedStructureId) {
        mesh.material = this.materials.dimmed;
        mesh.visible = true;
      } else {
        mesh.material = originalMat;
      }
    });
  }

  // Gesture-driven or manual model rotation
  rotateModelDelta(deltaYaw: number, deltaPitch: number) {
    this.targetModelYaw += deltaYaw;
    this.targetModelPitch = Math.max(-0.75, Math.min(0.75, this.targetModelPitch + deltaPitch));
  }

  // Gesture-driven or manual zoom
  zoomDelta(factor: number) {
    const dir = new THREE.Vector3().subVectors(this.targetCameraPos, this.targetLookAt);
    const currentDist = dir.length();
    const newDist = Math.max(1.5, Math.min(12.0, currentDist * factor));
    dir.normalize().multiplyScalar(newDist);
    this.targetCameraPos.copy(this.targetLookAt).add(dir);
  }

  // Camera preset navigation
  applyCameraPreset(preset: CameraPreset) {
    this.targetLookAt.set(...preset.target);
    this.targetCameraPos.set(...preset.position);
    this.targetModelYaw = 0;
    this.targetModelPitch = 0;
  }

  resetCamera() {
    const presets = SUBJECT_CAMERA_PRESETS[this.activeSubject];
    if (presets && presets.length > 0) {
      this.applyCameraPreset(presets[0]);
    } else {
      this.targetLookAt.set(0, 1.0, 0);
      this.targetCameraPos.set(0, 1.2, 7.8);
      this.targetModelYaw = 0;
      this.targetModelPitch = 0;
    }
  }

  // Raycasting from screen normalized coordinates (0..1)
  raycastFromNormalized(x: number, y: number): string | null {
    this.mouse.x = x * 2 - 1;
    this.mouse.y = -(y * 2 - 1);

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const visibleMeshes = this.allSelectableMeshes.filter((m) => {
      let cur: THREE.Object3D | null = m;
      while (cur) {
        if (!cur.visible) return false;
        cur = cur.parent;
      }
      return true;
    });

    const intersects = this.raycaster.intersectObjects(visibleMeshes, false);
    if (intersects.length > 0) {
      const hit = intersects[0].object;
      return hit.userData.structureId || null;
    }
    return null;
  }

  onSelect(cb: (structureId: string | null) => void) {
    this.onSelectCallback = cb;
  }

  onHover(cb: (structureId: string | null) => void) {
    this.onHoverCallback = cb;
  }

  private handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    if (this.isSimulationPlaying) {
      this.simulationTime += delta * this.simulationSpeed;
    }
    const simTime = this.simulationTime;

    // 1. Smooth exponential damping for camera position & lookAt
    this.currentCameraPos.lerp(this.targetCameraPos, Math.min(1, delta * 5.0));
    this.currentLookAt.lerp(this.targetLookAt, Math.min(1, delta * 5.0));
    this.camera.position.copy(this.currentCameraPos);
    this.camera.lookAt(this.currentLookAt);

    // 2. Smooth model rotation (yaw and pitch)
    this.modelYaw = THREE.MathUtils.damp(this.modelYaw, this.targetModelYaw, 8, delta);
    this.modelPitch = THREE.MathUtils.damp(this.modelPitch, this.targetModelPitch, 8, delta);
    this.modelRootGroup.rotation.y = this.modelYaw;
    this.modelRootGroup.rotation.x = this.modelPitch;

    // ── ANIMATION DISPATCH PER TOPIC ───────────────────────

    // 1. Four-Stroke IC Engine Cycle
    if (this.activeSubject === 'four_stroke_engine' && this.engineAnim) {
      const crankAngle = (simTime * 5.0) % (Math.PI * 4); // 720 deg (4-stroke cycle)
      this.engineAnim.crankshaft.rotation.z = -crankAngle;
      this.engineAnim.flywheel.rotation.z = -crankAngle;

      // Slider-crank kinematics
      const R = 0.7; // crankpin radius
      const L = 2.5; // connecting rod length
      const pinY = -1.5 + Math.sin(crankAngle) * R;
      const pinX = Math.cos(crankAngle) * R;

      // Piston height: y = -1.5 + R*sin(theta) + sqrt(L^2 - (R*cos(theta))^2)
      const pistonY = pinY + Math.sqrt(Math.max(0.1, L * L - pinX * pinX));
      this.engineAnim.pistonGroup.position.y = pistonY;

      // Connecting rod orientation
      this.engineAnim.connectingRod.position.set(pinX, pinY, 0);
      const rodAngle = Math.atan2(0 - pinX, pistonY - pinY);
      this.engineAnim.connectingRod.rotation.z = rodAngle;

      // Valve timings (Intake opens 0..pi, Exhaust opens 3pi..4pi)
      const isIntake = crankAngle >= 0 && crankAngle < Math.PI;
      const isExhaust = crankAngle >= Math.PI * 3 && crankAngle < Math.PI * 4;
      const isPowerSpark = crankAngle >= Math.PI * 2 && crankAngle < Math.PI * 2.3;

      this.engineAnim.intakeValve.position.y = isIntake ? 2.6 : 2.8;
      this.engineAnim.exhaustValve.position.y = isExhaust ? 2.6 : 2.8;
      this.engineAnim.combustionGlow.visible = isPowerSpark;
      if (isPowerSpark) {
        this.engineAnim.combustionGlow.position.y = pistonY + 0.6;
      }
    }

    // 2. Epicyclic Planetary Gearbox
    if (this.activeSubject === 'planetary_gearbox' && this.gearboxAnim) {
      const sunSpeed = simTime * 3.5;
      const carrierSpeed = sunSpeed / 4.25;

      this.gearboxAnim.sunGear.rotation.z = -sunSpeed;
      this.gearboxAnim.planetCarrier.rotation.z = -carrierSpeed;

      // Planet gears rotate on their own pins relative to carrier
      this.gearboxAnim.planetGears.forEach((pg) => {
        pg.rotation.z = sunSpeed * 1.5;
      });
    }

    // 3. Centrifugal Pump
    if (this.activeSubject === 'centrifugal_pump' && this.pumpAnim) {
      const pumpRot = simTime * 6.0;
      this.pumpAnim.impellerGroup.rotation.z = -pumpRot;

      // Flow particle drift
      const positions = this.pumpAnim.fluidParticles.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        let r = Math.hypot(positions[i * 3], positions[i * 3 + 1]);
        let angle = Math.atan2(positions[i * 3 + 1], positions[i * 3]) - delta * 4.0;
        r += delta * 1.2;
        if (r > 1.8) r = 0.3;
        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 1] = Math.sin(angle) * r;
      }
      this.pumpAnim.fluidParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. AC Induction Motor
    if (this.activeSubject === 'ac_induction_motor' && this.motorAnim) {
      const syncSpeed = simTime * 5.0; // Stator field
      const rotorSpeed = simTime * 4.8; // Rotor (with 4% slip)

      this.motorAnim.rotorGroup.rotation.z = -rotorSpeed;
      this.motorAnim.magneticFieldLines.rotation.z = -syncSpeed;
    }

    // 5. Power Transformer
    if (this.activeSubject === 'power_transformer' && this.transformerAnim) {
      const fluxPulse = 0.5 + Math.sin(simTime * 6.0) * 0.45;
      (this.transformerAnim.fluxRing.material as THREE.LineBasicMaterial).opacity = fluxPulse;
    }

    // 6. MOSFET Transistor
    if (this.activeSubject === 'bjt_mosfet_transistor' && this.transistorAnim) {
      // Electron particles drift from Source (-X) to Drain (+X)
      const positions = this.transistorAnim.electronParticles.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += delta * 1.8 * this.simulationSpeed;
        if (positions[i * 3] > 1.4) {
          positions[i * 3] = -1.4;
        }
      }
      this.transistorAnim.electronParticles.geometry.attributes.position.needsUpdate = true;

      // Gate field pulse
      const fieldGlow = 0.2 + Math.sin(simTime * 4.0) * 0.15;
      (this.transistorAnim.gateVoltageField.material as THREE.MeshBasicMaterial).opacity = fieldGlow;
    }

    // 7. Warren Truss Bridge
    if (this.activeSubject === 'truss_bridge' && this.trussAnim) {
      const arrowShift = Math.sin(simTime * 2.5) * 0.15;
      this.trussAnim.loadArrows.position.y = arrowShift;
    }

    // 8. 3D Neural Network
    if (this.activeSubject === 'neural_network_3d' && this.neuralAnim) {
      const positions = this.neuralAnim.synapsePulses.geometry.attributes.position.array as Float32Array;
      const count = positions.length / 3;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += delta * 2.2 * this.simulationSpeed;
        if (positions[i * 3] > 3.0) {
          positions[i * 3] = -3.0;
        }
      }
      this.neuralAnim.synapsePulses.geometry.attributes.position.needsUpdate = true;
    }

    // 9. Binary Search Tree
    if (this.activeSubject === 'binary_search_tree' && this.treeAnim) {
      // Traversal step cycle: Root (50) -> Left (25) -> Leaf (37)
      const cycle = Math.floor(simTime * 1.2) % 3;
      const targets = [
        [0, 2.4, 0],
        [-1.8, 1.2, 0],
        [-0.9, -0.2, 0],
      ];
      const t = targets[cycle];
      this.treeAnim.searchPointer.position.lerp(new THREE.Vector3(t[0], t[1], t[2]), Math.min(1, delta * 8));
    }

    // 10. Heart rhythmic pulsation
    if (this.activeSubject === 'heart' && this.isolatedHeartMesh) {
      const heartPulse = 1.0 + Math.sin(simTime * 6.8) * 0.055;
      this.isolatedHeartMesh.scale.set(heartPulse, heartPulse * 1.05, heartPulse);
    } else if (this.activeSubject === 'human' && this.heartMesh && this.systemGroups.circulatory?.visible) {
      const heartPulse = 1.0 + Math.sin(simTime * 6.8) * 0.045;
      this.heartMesh.scale.set(heartPulse, heartPulse * 1.05, heartPulse);
    }

    // 11. Lungs respiratory expansion
    if (this.activeSubject === 'human' && this.lungsMesh && this.systemGroups.respiratory?.visible) {
      const lungExpansion = 1.0 + Math.sin(simTime * 1.8) * 0.035;
      this.lungsMesh.scale.set(lungExpansion * 1.03, lungExpansion, lungExpansion * 1.02);
    }

    // Render frame
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);

    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });

    this.renderer.dispose();
    if (this.container && this.renderer.domElement) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
