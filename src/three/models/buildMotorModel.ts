import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export interface MotorAnimationRefs {
  rotorGroup: THREE.Group;
  shaft: THREE.Mesh;
  magneticFieldLines: THREE.LineSegments;
}

export function buildMotorModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  animRefs: MotorAnimationRefs;
} {
  const motorGroup = new THREE.Group();
  motorGroup.name = 'subject_ac_induction_motor';

  // 1. Stator Casing & Cooling Ribs (Cutaway to reveal rotor)
  const casingGroup = new THREE.Group();
  const casingGeo = new THREE.CylinderGeometry(2.0, 2.0, 3.6, 32, 1, true, 0, Math.PI * 1.5);
  const casing = new THREE.Mesh(casingGeo, materials.castIron);
  casing.rotation.x = Math.PI / 2;
  casingGroup.add(casing);

  // Outer Cooling Fins
  for (let i = 0; i < 9; i++) {
    const finGeo = new THREE.BoxGeometry(0.15, 0.45, 3.4);
    const fin = new THREE.Mesh(finGeo, materials.castIron);
    const angle = (i * Math.PI * 1.5) / 8;
    fin.position.set(Math.cos(angle) * 2.1, Math.sin(angle) * 2.1, 0);
    fin.rotation.z = angle;
    casingGroup.add(fin);
  }

  // Motor terminal junction box on top
  const junctionGeo = new THREE.BoxGeometry(0.8, 0.6, 0.8);
  const junctionBox = new THREE.Mesh(junctionGeo, materials.aluminum);
  junctionBox.position.set(0, 2.3, 0);
  casingGroup.add(junctionBox);

  // Stator Mounting Feet
  const foot1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 3.2), materials.castIron);
  foot1.position.set(-1.6, -2.1, 0);
  casingGroup.add(foot1);

  const foot2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 3.2), materials.castIron);
  foot2.position.set(1.6, -2.1, 0);
  casingGroup.add(foot2);

  casingGroup.userData = {
    structureId: 'motor_stator_casing',
    name: 'Cast Iron Stator Frame & Cooling Ribs',
    topic: 'ac_induction_motor',
  };
  motorGroup.add(casingGroup);

  // 2. Laminated Stator Core & 3-Phase Copper Windings
  const coreGroup = new THREE.Group();
  const coreGeo = new THREE.CylinderGeometry(1.85, 1.85, 2.8, 32, 1, true);
  const coreMesh = new THREE.Mesh(coreGeo, materials.steel);
  coreMesh.rotation.x = Math.PI / 2;
  coreGroup.add(coreMesh);

  // 12 Stator Copper Windings (Slots around circumference)
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI * 2) / 12;
    const coilGeo = new THREE.BoxGeometry(0.25, 0.35, 3.1);
    const coil = new THREE.Mesh(coilGeo, materials.copperCoil);
    coil.position.set(Math.cos(angle) * 1.55, Math.sin(angle) * 1.55, 0);
    coil.rotation.z = angle;
    coreGroup.add(coil);

    // End-turn loops
    const endLoopGeo = new THREE.TorusGeometry(0.2, 0.08, 8, 16, Math.PI);
    const endLoop1 = new THREE.Mesh(endLoopGeo, materials.copperCoil);
    endLoop1.position.set(Math.cos(angle) * 1.55, Math.sin(angle) * 1.55, 1.55);
    endLoop1.rotation.y = angle;
    coreGroup.add(endLoop1);

    const endLoop2 = new THREE.Mesh(endLoopGeo, materials.copperCoil);
    endLoop2.position.set(Math.cos(angle) * 1.55, Math.sin(angle) * 1.55, -1.55);
    endLoop2.rotation.y = angle;
    coreGroup.add(endLoop2);
  }

  coreGroup.userData = {
    structureId: 'motor_stator_windings',
    name: '3-Phase Distributed Stator Windings & Laminated Core',
    topic: 'ac_induction_motor',
  };
  motorGroup.add(coreGroup);

  // 3. Squirrel Cage Rotor & Drive Shaft (Rotates)
  const rotorGroup = new THREE.Group();

  // Laminated Silicon Steel Rotor Core
  const rotorCoreGeo = new THREE.CylinderGeometry(1.25, 1.25, 2.4, 24);
  const rotorCore = new THREE.Mesh(rotorCoreGeo, materials.castIron);
  rotorCore.rotation.x = Math.PI / 2;
  rotorGroup.add(rotorCore);

  // Conducting Aluminum/Copper Rotor Bars (Skewed to reduce cogging torque)
  const barCount = 18;
  for (let i = 0; i < barCount; i++) {
    const angle = (i * Math.PI * 2) / barCount;
    const barGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.5, 8);
    const bar = new THREE.Mesh(barGeo, materials.brass);
    bar.position.set(Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0);
    bar.rotation.x = Math.PI / 2 + 0.12; // Skew angle
    rotorGroup.add(bar);
  }

  // End Rings (Short-circuiting the bars at both ends)
  const ringGeo = new THREE.TorusGeometry(1.18, 0.12, 12, 24);
  const frontRing = new THREE.Mesh(ringGeo, materials.brass);
  frontRing.position.z = 1.25;
  rotorGroup.add(frontRing);

  const backRing = new THREE.Mesh(ringGeo, materials.brass);
  backRing.position.z = -1.25;
  rotorGroup.add(backRing);

  // Output Drive Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 4.8, 24);
  const shaft = new THREE.Mesh(shaftGeo, materials.chrome);
  shaft.rotation.x = Math.PI / 2;
  rotorGroup.add(shaft);

  // Cooling fan attached to rear shaft
  const fanGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.25, 16);
  const fan = new THREE.Mesh(fanGeo, materials.steel);
  fan.rotation.x = Math.PI / 2;
  fan.position.z = -2.0;
  rotorGroup.add(fan);

  rotorGroup.userData = {
    structureId: 'motor_squirrel_cage_rotor',
    name: 'Squirrel Cage Induction Rotor & Conducting Bars',
    topic: 'ac_induction_motor',
  };
  motorGroup.add(rotorGroup);

  // 4. Rotating Stator Magnetic Field Visualization (Dynamic lines)
  const lineCount = 36;
  const linePositions = new Float32Array(lineCount * 6);
  for (let i = 0; i < lineCount; i++) {
    const a = (i * Math.PI * 2) / lineCount;
    const r1 = 1.35;
    const r2 = 1.75;
    const z = (Math.random() - 0.5) * 2.0;
    linePositions[i * 6] = Math.cos(a) * r1;
    linePositions[i * 6 + 1] = Math.sin(a) * r1;
    linePositions[i * 6 + 2] = z;
    linePositions[i * 6 + 3] = Math.cos(a + 0.3) * r2;
    linePositions[i * 6 + 4] = Math.sin(a + 0.3) * r2;
    linePositions[i * 6 + 5] = z;
  }

  const fieldGeo = new THREE.BufferGeometry();
  fieldGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const fieldMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6,
  });
  const magneticFieldLines = new THREE.LineSegments(fieldGeo, fieldMat);
  magneticFieldLines.userData = {
    structureId: 'motor_magnetic_field',
    name: 'Rotating Magnetic Stator Field Vector Lines',
    topic: 'ac_induction_motor',
  };
  motorGroup.add(magneticFieldLines);

  return {
    group: motorGroup,
    animRefs: {
      rotorGroup,
      shaft,
      magneticFieldLines,
    },
  };
}
