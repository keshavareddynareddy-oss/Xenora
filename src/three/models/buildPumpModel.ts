import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export interface PumpAnimationRefs {
  impellerGroup: THREE.Group;
  shaft: THREE.Mesh;
  fluidParticles: THREE.Points;
}

export function buildPumpModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  animRefs: PumpAnimationRefs;
} {
  const pumpGroup = new THREE.Group();
  pumpGroup.name = 'subject_centrifugal_pump';

  // 1. Spiral Volute Casing (Semi-cutaway)
  const voluteGroup = new THREE.Group();

  // Spiral shell using torus & extrusion
  const voluteGeo = new THREE.TorusGeometry(1.6, 0.75, 24, 48, Math.PI * 1.65);
  const voluteMesh = new THREE.Mesh(voluteGeo, materials.castIron);
  voluteMesh.position.set(0, 0, 0);
  voluteGroup.add(voluteMesh);

  // Tangential Discharge Nozzle (Flange pointing upward)
  const nozzleGeo = new THREE.CylinderGeometry(0.55, 0.65, 1.8, 24);
  const nozzle = new THREE.Mesh(nozzleGeo, materials.castIron);
  nozzle.position.set(1.6, 1.4, 0);
  voluteGroup.add(nozzle);

  const dischargeFlangeGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.15, 24);
  const dischargeFlange = new THREE.Mesh(dischargeFlangeGeo, materials.steel);
  dischargeFlange.position.set(1.6, 2.3, 0);
  voluteGroup.add(dischargeFlange);

  // Axial Suction Inlet (Front nozzle)
  const suctionGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.4, 24);
  const suction = new THREE.Mesh(suctionGeo, materials.castIron);
  suction.rotation.x = Math.PI / 2;
  suction.position.set(0, 0, 1.2);
  voluteGroup.add(suction);

  const suctionFlangeGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.15, 24);
  const suctionFlange = new THREE.Mesh(suctionFlangeGeo, materials.steel);
  suctionFlange.rotation.x = Math.PI / 2;
  suctionFlange.position.set(0, 0, 1.9);
  voluteGroup.add(suctionFlange);

  // Casing base mounting foot
  const footGeo = new THREE.BoxGeometry(2.2, 0.4, 2.0);
  const foot = new THREE.Mesh(footGeo, materials.castIron);
  foot.position.set(0, -2.0, -0.2);
  voluteGroup.add(foot);

  voluteGroup.userData = {
    structureId: 'pump_volute_casing',
    name: 'Spiral Volute Casing & Diffuser',
    topic: 'centrifugal_pump',
  };
  pumpGroup.add(voluteGroup);

  // 2. Rotating Impeller with Backward-Curved Vanes
  const impellerGroup = new THREE.Group();

  // Shroud disc (Back plate)
  const shroudGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
  const shroud = new THREE.Mesh(shroudGeo, materials.brass);
  shroud.rotation.x = Math.PI / 2;
  shroud.position.z = -0.25;
  impellerGroup.add(shroud);

  // Central Impeller Eye & Hub
  const hubGeo = new THREE.CylinderGeometry(0.4, 0.55, 0.6, 24);
  const hub = new THREE.Mesh(hubGeo, materials.brass);
  hub.rotation.x = Math.PI / 2;
  impellerGroup.add(hub);

  // 6 Backward-curved vanes
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI * 2) / 6;
    const curvePoints = [];
    for (let t = 0; t <= 1; t += 0.2) {
      const r = 0.45 + t * 0.95;
      const theta = angle - t * 0.85; // curved backward
      curvePoints.push(new THREE.Vector3(Math.cos(theta) * r, Math.sin(theta) * r, 0));
    }
    const vaneCurve = new THREE.CatmullRomCurve3(curvePoints);
    const vaneGeo = new THREE.TubeGeometry(vaneCurve, 16, 0.08, 8, false);
    const vaneMesh = new THREE.Mesh(vaneGeo, materials.brass);
    impellerGroup.add(vaneMesh);
  }

  // Drive Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.5, 24);
  const shaft = new THREE.Mesh(shaftGeo, materials.chrome);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = -1.5;
  impellerGroup.add(shaft);

  impellerGroup.userData = {
    structureId: 'pump_impeller',
    name: 'Centrifugal Impeller & Backward-Curved Vanes',
    topic: 'centrifugal_pump',
  };
  pumpGroup.add(impellerGroup);

  // Mechanical Seal & Bearing Housing
  const bearingGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.2, 24);
  const bearingHousing = new THREE.Mesh(bearingGeo, materials.castIron);
  bearingHousing.rotation.x = Math.PI / 2;
  bearingHousing.position.z = -1.2;
  bearingHousing.userData = {
    structureId: 'pump_bearing_housing',
    name: 'Mechanical Seal & Bearing Assembly',
    topic: 'centrifugal_pump',
  };
  pumpGroup.add(bearingHousing);

  // 3. Fluid Stream Particle System (Animated spiral discharge)
  const particleCount = 200;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 4;
    const r = 0.3 + (i / particleCount) * 1.4;
    particlePositions[i * 3] = Math.cos(angle) * r;
    particlePositions[i * 3 + 1] = Math.sin(angle) * r;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.08,
    transparent: true,
    opacity: 0.85,
  });

  const fluidParticles = new THREE.Points(particleGeo, particleMat);
  fluidParticles.userData = {
    structureId: 'pump_fluid_stream',
    name: 'Pressurized Hydrodynamic Fluid Flow',
    topic: 'centrifugal_pump',
  };
  pumpGroup.add(fluidParticles);

  return {
    group: pumpGroup,
    animRefs: {
      impellerGroup,
      shaft,
      fluidParticles,
    },
  };
}
