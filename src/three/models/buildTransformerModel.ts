import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export interface TransformerAnimationRefs {
  primaryCoil: THREE.Mesh;
  secondaryCoil: THREE.Mesh;
  fluxRing: THREE.LineSegments;
}

export function buildTransformerModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  animRefs: TransformerAnimationRefs;
} {
  const transGroup = new THREE.Group();
  transGroup.name = 'subject_power_transformer';

  // 1. Laminated Silicon Steel Magnetic Core (Rectangular closed loop)
  const coreGroup = new THREE.Group();

  // Left limb (Primary side)
  const leftLimbGeo = new THREE.BoxGeometry(0.6, 3.2, 0.6);
  const leftLimb = new THREE.Mesh(leftLimbGeo, materials.steel);
  leftLimb.position.set(-1.4, 0, 0);
  coreGroup.add(leftLimb);

  // Right limb (Secondary side)
  const rightLimb = new THREE.Mesh(leftLimbGeo, materials.steel);
  rightLimb.position.set(1.4, 0, 0);
  coreGroup.add(rightLimb);

  // Top yoke (Closing the magnetic circuit)
  const topYokeGeo = new THREE.BoxGeometry(3.4, 0.6, 0.6);
  const topYoke = new THREE.Mesh(topYokeGeo, materials.steel);
  topYoke.position.set(0, 1.6, 0);
  coreGroup.add(topYoke);

  // Bottom yoke
  const botYoke = new THREE.Mesh(topYokeGeo, materials.steel);
  botYoke.position.set(0, -1.6, 0);
  coreGroup.add(botYoke);

  coreGroup.userData = {
    structureId: 'transformer_laminated_core',
    name: 'Cold-Rolled Grain-Oriented (CRGO) Laminated Core',
    topic: 'power_transformer',
  };
  transGroup.add(coreGroup);

  // 2. High-Voltage Primary Winding (Left Limb)
  const priCoilGeo = new THREE.CylinderGeometry(0.75, 0.75, 2.2, 32);
  const primaryCoil = new THREE.Mesh(priCoilGeo, materials.copperCoil);
  primaryCoil.position.set(-1.4, 0, 0);
  primaryCoil.userData = {
    structureId: 'transformer_primary_winding',
    name: 'High-Voltage Primary Winding (High Turns Ratio)',
    topic: 'power_transformer',
  };
  transGroup.add(primaryCoil);

  // 3. Low-Voltage Secondary Winding (Right Limb)
  const secCoilGeo = new THREE.CylinderGeometry(0.85, 0.85, 2.2, 32);
  const secondaryCoil = new THREE.Mesh(secCoilGeo, materials.brass); // Golden copper/brass
  secondaryCoil.position.set(1.4, 0, 0);
  secondaryCoil.userData = {
    structureId: 'transformer_secondary_winding',
    name: 'Low-Voltage Heavy-Gauge Secondary Winding',
    topic: 'power_transformer',
  };
  transGroup.add(secondaryCoil);

  // 4. Porcelain High-Voltage Bushings (Top insulators with shed petticoats)
  const bushingGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const bGroup = new THREE.Group();
    const stemGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 16);
    const stem = new THREE.Mesh(stemGeo, materials.bone);
    bGroup.add(stem);

    // Conical sheds
    for (let s = 0; s < 4; s++) {
      const shedGeo = new THREE.ConeGeometry(0.24, 0.15, 16);
      const shed = new THREE.Mesh(shedGeo, materials.bone);
      shed.position.y = -0.3 + s * 0.25;
      bGroup.add(shed);
    }

    // Terminal lug
    const lugGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const lug = new THREE.Mesh(lugGeo, materials.brass);
    lug.position.y = 0.8;
    bGroup.add(lug);

    bGroup.position.set(-1.2 + i * 1.2, 2.7, 0.6);
    bushingGroup.add(bGroup);
  }

  bushingGroup.userData = {
    structureId: 'transformer_bushings',
    name: 'High-Voltage Porcelain Insulating Bushings',
    topic: 'power_transformer',
  };
  transGroup.add(bushingGroup);

  // 5. Oil Tank, Cooling Radiator Fins & Conservator
  const tankGroup = new THREE.Group();

  // Oil Conservator tank on top
  const conservatorGeo = new THREE.CylinderGeometry(0.4, 0.4, 2.4, 16);
  const conservator = new THREE.Mesh(conservatorGeo, materials.castIron);
  conservator.rotation.z = Math.PI / 2;
  conservator.position.set(0, 3.2, -1.0);
  tankGroup.add(conservator);

  // External Radiator Cooling Fins on Sides
  for (let r = 0; r < 5; r++) {
    const radGeo = new THREE.BoxGeometry(0.1, 2.6, 1.4);
    const radLeft = new THREE.Mesh(radGeo, materials.castIron);
    radLeft.position.set(-2.4, 0, -0.6 + r * 0.3);
    tankGroup.add(radLeft);

    const radRight = new THREE.Mesh(radGeo, materials.castIron);
    radRight.position.set(2.4, 0, -0.6 + r * 0.3);
    tankGroup.add(radRight);
  }

  tankGroup.userData = {
    structureId: 'transformer_cooling_tank',
    name: 'Dielectric Mineral Oil Tank & Cooling Radiators',
    topic: 'power_transformer',
  };
  transGroup.add(tankGroup);

  // 6. Magnetic Flux Path Visualization (Animated pulsating loop)
  const fluxPoints = [
    new THREE.Vector3(-1.4, -1.6, 0),
    new THREE.Vector3(1.4, -1.6, 0),
    new THREE.Vector3(1.4, 1.6, 0),
    new THREE.Vector3(-1.4, 1.6, 0),
    new THREE.Vector3(-1.4, -1.6, 0),
  ];
  const fluxGeo = new THREE.BufferGeometry().setFromPoints(fluxPoints);
  const fluxMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    linewidth: 2,
    transparent: true,
    opacity: 0.8,
  });
  const fluxRing = new THREE.LineSegments(fluxGeo, fluxMat);
  fluxRing.userData = {
    structureId: 'transformer_magnetic_flux',
    name: 'Alternating Mutual Magnetic Flux Circuit (Φ)',
    topic: 'power_transformer',
  };
  transGroup.add(fluxRing);

  return {
    group: transGroup,
    animRefs: {
      primaryCoil,
      secondaryCoil,
      fluxRing,
    },
  };
}
