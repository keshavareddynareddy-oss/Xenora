import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export interface EngineAnimationRefs {
  pistonGroup: THREE.Group;
  connectingRod: THREE.Group;
  crankshaft: THREE.Group;
  intakeValve: THREE.Mesh;
  exhaustValve: THREE.Mesh;
  sparkGroup: THREE.Group;
  flywheel: THREE.Mesh;
  combustionGlow: THREE.Mesh;
}

export function buildEngineModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  animRefs: EngineAnimationRefs;
} {
  const engineGroup = new THREE.Group();
  engineGroup.name = 'subject_four_stroke_engine';

  // 1. Engine Cylinder Block (Cutaway to reveal interior)
  const blockGeo = new THREE.CylinderGeometry(1.5, 1.5, 3.8, 32, 1, true, 0, Math.PI * 1.45);
  const blockMesh = new THREE.Mesh(blockGeo, materials.castIron);
  blockMesh.position.y = 1.0;
  blockMesh.userData = {
    structureId: 'engine_cylinder_block',
    name: 'Engine Cylinder Block & Liner',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(blockMesh);

  // Outer Cooling Fins on Block
  for (let i = 0; i < 7; i++) {
    const finGeo = new THREE.RingGeometry(1.5, 1.85, 32, 1, 0, Math.PI * 1.45);
    const finMesh = new THREE.Mesh(finGeo, materials.steel);
    finMesh.rotation.x = -Math.PI / 2;
    finMesh.position.y = 0.2 + i * 0.45;
    finMesh.userData = {
      structureId: 'engine_cylinder_block',
      name: 'Engine Cooling Fins',
      topic: 'four_stroke_engine',
    };
    engineGroup.add(finMesh);
  }

  // 2. Cylinder Head & Combustion Chamber (Top)
  const headGeo = new THREE.CylinderGeometry(1.6, 1.55, 0.8, 32);
  const headMesh = new THREE.Mesh(headGeo, materials.aluminum);
  headMesh.position.y = 3.2;
  headMesh.userData = {
    structureId: 'engine_cylinder_head',
    name: 'Cylinder Head & Valvetrain Chamber',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(headMesh);

  // 3. Crankcase Base (Bottom)
  const crankcaseGeo = new THREE.BoxGeometry(3.2, 1.8, 2.6);
  const crankcaseMesh = new THREE.Mesh(crankcaseGeo, materials.castIron);
  crankcaseMesh.position.y = -1.6;
  crankcaseMesh.userData = {
    structureId: 'engine_crankcase',
    name: 'Engine Crankcase & Oil Sump',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(crankcaseMesh);

  // 4. Crankshaft (Rotates around Z-axis at y = -1.5)
  const crankGroup = new THREE.Group();
  crankGroup.position.set(0, -1.5, 0);

  // Main journals
  const mainShaftGeo = new THREE.CylinderGeometry(0.25, 0.25, 3.0, 16);
  const mainShaft = new THREE.Mesh(mainShaftGeo, materials.steel);
  mainShaft.rotation.x = Math.PI / 2;
  crankGroup.add(mainShaft);

  // Crank webs (counterweights)
  const webGeo = new THREE.BoxGeometry(0.7, 1.4, 0.25);
  const web1 = new THREE.Mesh(webGeo, materials.castIron);
  web1.position.set(0, -0.4, -0.4);
  crankGroup.add(web1);

  const web2 = new THREE.Mesh(webGeo, materials.castIron);
  web2.position.set(0, -0.4, 0.4);
  crankGroup.add(web2);

  // Crankpin (offset by 0.7 units from center)
  const pinGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 16);
  const crankPin = new THREE.Mesh(pinGeo, materials.chrome);
  crankPin.rotation.x = Math.PI / 2;
  crankPin.position.set(0, 0.7, 0);
  crankGroup.add(crankPin);

  crankGroup.userData = {
    structureId: 'engine_crankshaft',
    name: 'Forged Crankshaft & Counterweights',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(crankGroup);

  // Heavy Flywheel on rear end
  const flyGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.35, 32);
  const flywheel = new THREE.Mesh(flyGeo, materials.castIron);
  flywheel.rotation.x = Math.PI / 2;
  flywheel.position.set(0, -1.5, 1.6);
  flywheel.userData = {
    structureId: 'engine_flywheel',
    name: 'Engine Flywheel & Ring Gear',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(flywheel);

  // 5. Piston Assembly
  const pistonGroup = new THREE.Group();
  const pistonCrownGeo = new THREE.CylinderGeometry(1.4, 1.4, 1.2, 32);
  const pistonCrown = new THREE.Mesh(pistonCrownGeo, materials.aluminum);
  pistonGroup.add(pistonCrown);

  // Piston Compression & Oil Rings
  for (let r = 0; r < 3; r++) {
    const ringGeo = new THREE.TorusGeometry(1.41, 0.03, 8, 32);
    const ring = new THREE.Mesh(ringGeo, materials.steel);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.25 - r * 0.2;
    pistonGroup.add(ring);
  }

  // Gudgeon / Wrist Pin
  const wristPinGeo = new THREE.CylinderGeometry(0.18, 0.18, 2.2, 16);
  const wristPin = new THREE.Mesh(wristPinGeo, materials.chrome);
  wristPin.rotation.x = Math.PI / 2;
  wristPin.position.y = -0.15;
  pistonGroup.add(wristPin);

  pistonGroup.position.y = 1.6;
  pistonGroup.userData = {
    structureId: 'engine_piston',
    name: 'Aluminum Alloy Piston & Rings',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(pistonGroup);

  // 6. Connecting Rod (Links crankpin to piston wrist pin)
  const rodGroup = new THREE.Group();
  const rodShankGeo = new THREE.CylinderGeometry(0.16, 0.22, 2.5, 12);
  const rodShank = new THREE.Mesh(rodShankGeo, materials.steel);
  rodShank.position.y = 1.25;
  rodGroup.add(rodShank);

  const bigEndGeo = new THREE.TorusGeometry(0.28, 0.12, 12, 24);
  const bigEnd = new THREE.Mesh(bigEndGeo, materials.steel);
  bigEnd.rotation.x = Math.PI / 2;
  rodGroup.add(bigEnd);

  const smallEndGeo = new THREE.TorusGeometry(0.22, 0.1, 12, 24);
  const smallEnd = new THREE.Mesh(smallEndGeo, materials.steel);
  smallEnd.rotation.x = Math.PI / 2;
  smallEnd.position.y = 2.5;
  rodGroup.add(smallEnd);

  rodGroup.userData = {
    structureId: 'engine_connecting_rod',
    name: 'H-Beam Connecting Rod & Bearings',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(rodGroup);

  // 7. Intake & Exhaust Valves
  const valveGeo = new THREE.CylinderGeometry(0.4, 0.08, 1.2, 16);

  const intakeValve = new THREE.Mesh(valveGeo, materials.chrome);
  intakeValve.position.set(-0.6, 2.8, 0);
  intakeValve.userData = {
    structureId: 'engine_intake_valve',
    name: 'Poppet Intake Valve',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(intakeValve);

  const exhaustValve = new THREE.Mesh(valveGeo, materials.brass);
  exhaustValve.position.set(0.6, 2.8, 0);
  exhaustValve.userData = {
    structureId: 'engine_exhaust_valve',
    name: 'High-Temperature Exhaust Valve',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(exhaustValve);

  // 8. Spark Plug & Combustion Chamber Glow
  const sparkGroup = new THREE.Group();
  const plugBodyGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 16);
  const plugBody = new THREE.Mesh(plugBodyGeo, materials.bone); // Ceramic white insulator
  sparkGroup.add(plugBody);

  const plugThreadGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.35, 16);
  const plugThread = new THREE.Mesh(plugThreadGeo, materials.brass);
  plugThread.position.y = -0.3;
  sparkGroup.add(plugThread);

  const sparkTipGeo = new THREE.SphereGeometry(0.08, 8, 8);
  const sparkTip = new THREE.Mesh(sparkTipGeo, materials.combustionFire);
  sparkTip.position.y = -0.52;
  sparkGroup.add(sparkTip);

  sparkGroup.position.set(0, 3.4, 0);
  sparkGroup.userData = {
    structureId: 'engine_spark_plug',
    name: 'Spark Plug & Electrode Gap',
    topic: 'four_stroke_engine',
  };
  engineGroup.add(sparkGroup);

  // Combustion Flame Glow Volume (visible during power stroke)
  const flameGeo = new THREE.SphereGeometry(1.2, 16, 16);
  flameGeo.scale(1, 0.6, 1);
  const combustionGlow = new THREE.Mesh(flameGeo, materials.combustionFire);
  combustionGlow.position.set(0, 2.4, 0);
  combustionGlow.visible = false;
  engineGroup.add(combustionGlow);

  return {
    group: engineGroup,
    animRefs: {
      pistonGroup,
      connectingRod: rodGroup,
      crankshaft: crankGroup,
      intakeValve,
      exhaustValve,
      sparkGroup,
      flywheel,
      combustionGlow,
    },
  };
}
