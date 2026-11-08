import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export interface TransistorAnimationRefs {
  depletionZone: THREE.Mesh;
  electronParticles: THREE.Points;
  gateVoltageField: THREE.Mesh;
}

export function buildTransistorModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  animRefs: TransistorAnimationRefs;
} {
  const transGroup = new THREE.Group();
  transGroup.name = 'subject_bjt_mosfet_transistor';

  // 1. P-type Silicon Substrate Body (Base bulk wafer)
  const substrateGeo = new THREE.BoxGeometry(4.2, 1.4, 2.8);
  const substrate = new THREE.Mesh(substrateGeo, materials.siliconDie);
  substrate.position.set(0, -0.7, 0);
  substrate.userData = {
    structureId: 'transistor_substrate',
    name: 'P-Type Silicon Substrate Wafer',
    topic: 'bjt_mosfet_transistor',
  };
  transGroup.add(substrate);

  // 2. Heavily Doped N+ Source Region (Left)
  const sourceWellGeo = new THREE.BoxGeometry(1.1, 0.6, 2.4);
  const sourceWell = new THREE.Mesh(sourceWellGeo, materials.brass);
  sourceWell.position.set(-1.4, 0.2, 0);
  sourceWell.userData = {
    structureId: 'transistor_source',
    name: 'N+ Source Region & Electrode Contact',
    topic: 'bjt_mosfet_transistor',
  };
  transGroup.add(sourceWell);

  // 3. Heavily Doped N+ Drain Region (Right)
  const drainWell = new THREE.Mesh(sourceWellGeo, materials.brass);
  drainWell.position.set(1.4, 0.2, 0);
  drainWell.userData = {
    structureId: 'transistor_drain',
    name: 'N+ Drain Region & Electrode Contact',
    topic: 'bjt_mosfet_transistor',
  };
  transGroup.add(drainWell);

  // 4. Gate Dielectric Oxide Layer (Thin SiO2 insulator in center)
  const oxideGeo = new THREE.BoxGeometry(1.4, 0.12, 2.4);
  const oxide = new THREE.Mesh(oxideGeo, materials.glassLens);
  oxide.position.set(0, 0.2, 0);
  oxide.userData = {
    structureId: 'transistor_gate_oxide',
    name: 'Silicon Dioxide (SiO2) Gate Dielectric Layer',
    topic: 'bjt_mosfet_transistor',
  };
  transGroup.add(oxide);

  // 5. Polysilicon / Metal Gate Terminal (Top electrode)
  const gateGeo = new THREE.BoxGeometry(1.4, 0.45, 2.4);
  const gate = new THREE.Mesh(gateGeo, materials.chrome);
  gate.position.set(0, 0.5, 0);
  gate.userData = {
    structureId: 'transistor_gate_electrode',
    name: 'Polysilicon / Metal Gate Terminal (V_GS Control)',
    topic: 'bjt_mosfet_transistor',
  };
  transGroup.add(gate);

  // Metallic Terminal Pins (Source, Gate, Drain)
  const pinGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16);

  const sourcePin = new THREE.Mesh(pinGeo, materials.chrome);
  sourcePin.position.set(-1.4, 1.2, 0);
  transGroup.add(sourcePin);

  const gatePin = new THREE.Mesh(pinGeo, materials.chrome);
  gatePin.position.set(0, 1.4, 0);
  transGroup.add(gatePin);

  const drainPin = new THREE.Mesh(pinGeo, materials.chrome);
  drainPin.position.set(1.4, 1.2, 0);
  transGroup.add(drainPin);

  // 6. Inversion Channel & Depletion Boundary Layer
  const depletionGeo = new THREE.BoxGeometry(1.4, 0.35, 2.4);
  const depletionZone = new THREE.Mesh(depletionGeo, materials.trussTension);
  depletionZone.position.set(0, -0.05, 0);
  depletionZone.userData = {
    structureId: 'transistor_inversion_channel',
    name: 'N-Channel Inversion Layer & Depletion Boundary',
    topic: 'bjt_mosfet_transistor',
  };
  transGroup.add(depletionZone);

  // Electric Field Fringe Volume under Gate
  const fieldGeo = new THREE.BoxGeometry(1.5, 0.7, 2.5);
  const fieldMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.25,
    wireframe: true,
  });
  const gateVoltageField = new THREE.Mesh(fieldGeo, fieldMat);
  gateVoltageField.position.set(0, 0.2, 0);
  transGroup.add(gateVoltageField);

  // 7. Drifting Conduction Electrons (Particles flowing from Source to Drain)
  const electronCount = 80;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(electronCount * 3);

  for (let i = 0; i < electronCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 2.8;
    particlePositions[i * 3 + 1] = -0.1 + (Math.random() - 0.5) * 0.25;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.1,
    transparent: true,
    opacity: 0.9,
  });

  const electronParticles = new THREE.Points(particleGeo, particleMat);
  electronParticles.userData = {
    structureId: 'transistor_charge_carriers',
    name: 'Conduction Band Electrons (Carrier Drift Current)',
    topic: 'bjt_mosfet_transistor',
  };
  transGroup.add(electronParticles);

  return {
    group: transGroup,
    animRefs: {
      depletionZone,
      electronParticles,
      gateVoltageField,
    },
  };
}
