import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildCanineSpecimen(materials: AnatomyMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'canine_specimen_subject';

  // 1. CANINE SKULL & SNOUT
  const skullGroup = new THREE.Group();
  skullGroup.userData = {
    structureId: 'canine_skull',
    category: 'veterinary',
    subject: 'canine',
    name: 'Canine Skull & Carnassial Teeth',
  };

  // Cranial neurocranium vault
  const craniumGeo = new THREE.SphereGeometry(0.38, 20, 16);
  craniumGeo.scale(0.9, 0.95, 1.15);
  const craniumMesh = new THREE.Mesh(craniumGeo, materials.bone);
  craniumMesh.position.set(1.4, 0.85, 0);
  skullGroup.add(craniumMesh);

  // Elongated canine muzzle / snout
  const snoutGeo = new THREE.ConeGeometry(0.24, 0.65, 16);
  snoutGeo.scale(0.85, 1.0, 0.65);
  snoutGeo.rotateZ(-Math.PI / 2);
  const snoutMesh = new THREE.Mesh(snoutGeo, materials.bone);
  snoutMesh.position.set(1.85, 0.78, 0);
  skullGroup.add(snoutMesh);

  // Zygomatic arches
  for (const sign of [-1, 1]) {
    const archGeo = new THREE.TorusGeometry(0.16, 0.025, 8, 16);
    archGeo.rotateX(Math.PI / 2);
    const archMesh = new THREE.Mesh(archGeo, materials.bone);
    archMesh.position.set(1.45, 0.78, sign * 0.28);
    skullGroup.add(archMesh);
  }
  root.add(skullGroup);

  // 2. HORIZONTAL CANINE SPINE & TAIL
  const spineGroup = new THREE.Group();
  spineGroup.userData = {
    structureId: 'canine_spine',
    category: 'veterinary',
    subject: 'canine',
    name: 'Canine Spine & Tail Vertebrae',
  };

  // Horizontal canine spine path (Neck curve -> Thoracic with anticlinal T11 -> Lumbar -> Sacrum -> Caudal Tail)
  const canineSpinePoints: THREE.Vector3[] = [];
  const vertCount = 28;
  for (let i = 0; i < vertCount; i++) {
    const t = i / (vertCount - 1);
    // X goes from +1.2 (cervical) to -1.4 (pelvis) to -2.3 (tail tip)
    const x = 1.2 - t * 3.4;
    let y = 0.65;
    let z = 0;

    if (t < 0.25) {
      // Cervical arch
      y = 0.65 + Math.sin((t / 0.25) * Math.PI) * 0.15;
    } else if (t < 0.65) {
      // Thoracic-lumbar horizontal backline
      y = 0.68;
    } else if (t < 0.8) {
      // Sacral slope
      y = 0.62;
    } else {
      // Curved wagging tail
      y = 0.6 - (t - 0.8) * 1.5;
      z = Math.sin((t - 0.8) * 8) * 0.18;
    }

    canineSpinePoints.push(new THREE.Vector3(x, y, z));

    // Vertebra bone segment
    const vertGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.09, 12);
    vertGeo.rotateZ(Math.PI / 2);
    const vertMesh = new THREE.Mesh(vertGeo, materials.bone);
    vertMesh.position.set(x, y, z);
    spineGroup.add(vertMesh);

    // Dorsal spinous process
    if (t < 0.75) {
      const spGeo = new THREE.BoxGeometry(0.03, 0.08, 0.025);
      const spMesh = new THREE.Mesh(spGeo, materials.bone);
      spMesh.position.set(x, y + 0.07, z);
      spineGroup.add(spMesh);
    }
  }
  root.add(spineGroup);

  // 3. CANINE DEEP RIB CAGE
  const ribcageGroup = new THREE.Group();
  ribcageGroup.userData = {
    structureId: 'canine_ribcage',
    category: 'veterinary',
    subject: 'canine',
    name: 'Canine Deep Thoracic Cage',
  };
  // 13 Paired laterally compressed deep ribs
  for (let r = 0; r < 11; r++) {
    const rx = 0.85 - r * 0.12;
    const height = 0.45 + Math.sin((r / 10) * Math.PI) * 0.18;
    const width = 0.24 + Math.sin((r / 10) * Math.PI) * 0.1;

    for (const sign of [-1, 1]) {
      const curve = new THREE.EllipseCurve(0, 0, width, height, 0, Math.PI, false, 0);
      const pts = curve.getPoints(16).map((p) => new THREE.Vector3(0, -p.y, sign * p.x));
      const tubeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 14, 0.018, 6, false);
      const ribMesh = new THREE.Mesh(tubeGeo, materials.bone);
      ribMesh.position.set(rx, 0.66, 0);
      ribcageGroup.add(ribMesh);
    }
  }
  root.add(ribcageGroup);

  // 4. CANINE PELVIS
  const pelvisGroup = new THREE.Group();
  pelvisGroup.userData = {
    structureId: 'canine_pelvis',
    category: 'veterinary',
    subject: 'canine',
    name: 'Canine Pelvis & Hip Joint',
  };
  for (const sign of [-1, 1]) {
    const iliumGeo = new THREE.BoxGeometry(0.55, 0.18, 0.12);
    const iliumMesh = new THREE.Mesh(iliumGeo, materials.bone);
    iliumMesh.position.set(-1.15, 0.55, sign * 0.18);
    iliumMesh.rotation.y = sign * 0.15;
    pelvisGroup.add(iliumMesh);
  }
  root.add(pelvisGroup);

  // 5. DIGITIGRADE LIMBS (Forelimbs & Hindlimbs)
  const limbsGroup = new THREE.Group();
  limbsGroup.userData = {
    structureId: 'canine_limbs',
    category: 'veterinary',
    subject: 'canine',
    name: 'Canine Digitigrade Limbs',
  };

  for (const sign of [-1, 1]) {
    // FORELIMBS: Scapula plate -> Humerus -> Radius/Ulna -> Paw
    const scapulaGeo = new THREE.BoxGeometry(0.18, 0.38, 0.05);
    const scapula = new THREE.Mesh(scapulaGeo, materials.bone);
    scapula.position.set(0.72, 0.45, sign * 0.32);
    scapula.rotation.z = -0.4;
    limbsGroup.add(scapula);

    const humerusGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.55, 10);
    const humerus = new THREE.Mesh(humerusGeo, materials.bone);
    humerus.position.set(0.62, 0.15, sign * 0.3);
    humerus.rotation.z = 0.35;
    limbsGroup.add(humerus);

    const radiusGeo = new THREE.CylinderGeometry(0.032, 0.028, 0.65, 10);
    const radius = new THREE.Mesh(radiusGeo, materials.bone);
    radius.position.set(0.72, -0.4, sign * 0.28);
    limbsGroup.add(radius);

    // Front paw pad
    const fPawGeo = new THREE.SphereGeometry(0.065, 12, 10);
    fPawGeo.scale(1.2, 0.6, 1.0);
    const fPaw = new THREE.Mesh(fPawGeo, materials.muscle);
    fPaw.position.set(0.74, -0.72, sign * 0.28);
    limbsGroup.add(fPaw);

    // HINDLIMBS: Femur -> Stifle Knee -> Tibia -> Hock Tarsus -> Paw
    const femurGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.62, 10);
    const femur = new THREE.Mesh(femurGeo, materials.bone);
    femur.position.set(-1.08, 0.25, sign * 0.26);
    femur.rotation.z = -0.35;
    limbsGroup.add(femur);

    const tibiaGeo = new THREE.CylinderGeometry(0.038, 0.032, 0.65, 10);
    const tibia = new THREE.Mesh(tibiaGeo, materials.bone);
    tibia.position.set(-1.22, -0.28, sign * 0.24);
    tibia.rotation.z = 0.25;
    limbsGroup.add(tibia);

    // Rear paw pad
    const rPawGeo = new THREE.SphereGeometry(0.065, 12, 10);
    rPawGeo.scale(1.2, 0.6, 1.0);
    const rPaw = new THREE.Mesh(rPawGeo, materials.muscle);
    rPaw.position.set(-1.18, -0.72, sign * 0.24);
    limbsGroup.add(rPaw);
  }
  root.add(limbsGroup);

  return root;
}
