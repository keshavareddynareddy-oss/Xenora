import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export interface GearboxAnimationRefs {
  sunGear: THREE.Group;
  planetCarrier: THREE.Group;
  planetGears: THREE.Group[];
  ringGear: THREE.Group;
  inputShaft: THREE.Mesh;
  outputShaft: THREE.Mesh;
}

function createSpurGearGeometry(radius: number, thickness: number, numTeeth: number): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / numTeeth;
  const toothDepth = radius * 0.18;

  for (let i = 0; i < numTeeth; i++) {
    const angle = i * step;
    const a1 = angle;
    const a2 = angle + step * 0.35;
    const a3 = angle + step * 0.5;
    const a4 = angle + step * 0.85;

    const rBase = radius - toothDepth;
    const rTip = radius + toothDepth * 0.5;

    const x1 = Math.cos(a1) * rBase;
    const y1 = Math.sin(a1) * rBase;
    const x2 = Math.cos(a2) * rTip;
    const y2 = Math.sin(a2) * rTip;
    const x3 = Math.cos(a3) * rTip;
    const y3 = Math.sin(a3) * rTip;
    const x4 = Math.cos(a4) * rBase;
    const y4 = Math.sin(a4) * rBase;

    if (i === 0) {
      shape.moveTo(x1, y1);
    } else {
      shape.lineTo(x1, y1);
    }
    shape.lineTo(x2, y2);
    shape.lineTo(x3, y3);
    shape.lineTo(x4, y4);
  }
  shape.closePath();

  // Center borehole
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, radius * 0.35, 0, Math.PI * 2, true);
  shape.holes.push(holePath);

  const extrudeSettings = {
    steps: 1,
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.04,
    bevelSegments: 2,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

export function buildGearboxModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  animRefs: GearboxAnimationRefs;
} {
  const gearboxGroup = new THREE.Group();
  gearboxGroup.name = 'subject_planetary_gearbox';

  // 1. Central Sun Gear (Driven by Input Shaft)
  const sunRadius = 0.8;
  const sunThickness = 0.6;
  const sunTeeth = 16;
  const sunGeo = createSpurGearGeometry(sunRadius, sunThickness, sunTeeth);

  const sunGroup = new THREE.Group();
  const sunMesh = new THREE.Mesh(sunGeo, materials.brass);
  sunGroup.add(sunMesh);

  const inputShaftGeo = new THREE.CylinderGeometry(0.25, 0.25, 2.2, 24);
  const inputShaft = new THREE.Mesh(inputShaftGeo, materials.steel);
  inputShaft.rotation.x = Math.PI / 2;
  inputShaft.position.z = -1.0;
  sunGroup.add(inputShaft);

  sunGroup.userData = {
    structureId: 'gear_sun',
    name: 'Central Sun Gear (Input)',
    topic: 'planetary_gearbox',
  };
  gearboxGroup.add(sunGroup);

  // 2. Planet Carrier & 3 Planet Gears (120 deg apart)
  const planetCarrier = new THREE.Group();
  const planetGears: THREE.Group[] = [];
  const planetRadius = 0.7;
  const planetThickness = 0.58;
  const planetTeeth = 14;
  const orbitRadius = 1.6;

  // Triangular / circular carrier plate
  const carrierPlateGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.15, 32);
  const carrierFront = new THREE.Mesh(carrierPlateGeo, materials.aluminum);
  carrierFront.rotation.x = Math.PI / 2;
  carrierFront.position.z = 0.45;
  planetCarrier.add(carrierFront);

  const carrierBack = new THREE.Mesh(carrierPlateGeo, materials.aluminum);
  carrierBack.rotation.x = Math.PI / 2;
  carrierBack.position.z = -0.45;
  planetCarrier.add(carrierBack);

  // Output shaft attached to carrier
  const outputShaftGeo = new THREE.CylinderGeometry(0.3, 0.3, 2.4, 24);
  const outputShaft = new THREE.Mesh(outputShaftGeo, materials.steel);
  outputShaft.rotation.x = Math.PI / 2;
  outputShaft.position.z = 1.3;
  planetCarrier.add(outputShaft);

  for (let i = 0; i < 3; i++) {
    const angle = (i * Math.PI * 2) / 3;
    const px = Math.cos(angle) * orbitRadius;
    const py = Math.sin(angle) * orbitRadius;

    const pGeo = createSpurGearGeometry(planetRadius, planetThickness, planetTeeth);
    const pMesh = new THREE.Mesh(pGeo, materials.steel);

    // Planet pin linking front/back carrier
    const pinGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16);
    const pin = new THREE.Mesh(pinGeo, materials.chrome);
    pin.rotation.x = Math.PI / 2;

    const pGroup = new THREE.Group();
    pGroup.position.set(px, py, 0);
    pGroup.add(pMesh);
    pGroup.add(pin);

    pGroup.userData = {
      structureId: `gear_planet_${i + 1}`,
      name: `Planet Gear #${i + 1}`,
      topic: 'planetary_gearbox',
    };

    planetCarrier.add(pGroup);
    planetGears.push(pGroup);
  }

  planetCarrier.userData = {
    structureId: 'gear_carrier',
    name: 'Planet Carrier & Output Shaft',
    topic: 'planetary_gearbox',
  };
  gearboxGroup.add(planetCarrier);

  // 3. Outer Ring Gear / Annulus (Casing with Internal Teeth Cutaway)
  const ringGroup = new THREE.Group();
  const ringGeo = new THREE.CylinderGeometry(2.8, 2.8, 1.1, 48, 1, true, 0, Math.PI * 1.6);
  const ringMesh = new THREE.Mesh(ringGeo, materials.castIron);
  ringMesh.rotation.x = Math.PI / 2;
  ringGroup.add(ringMesh);

  // Flange mounts
  const flangeGeo = new THREE.RingGeometry(2.7, 3.2, 32);
  const flange = new THREE.Mesh(flangeGeo, materials.steel);
  flange.position.z = -0.55;
  ringGroup.add(flange);

  ringGroup.userData = {
    structureId: 'gear_ring_annulus',
    name: 'Outer Ring Gear (Annulus) & Housing',
    topic: 'planetary_gearbox',
  };
  gearboxGroup.add(ringGroup);

  return {
    group: gearboxGroup,
    animRefs: {
      sunGear: sunGroup,
      planetCarrier,
      planetGears,
      ringGear: ringGroup,
      inputShaft,
      outputShaft,
    },
  };
}
