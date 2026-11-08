import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildMuscularModel(materials: AnatomyMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'muscular_system';

  // 1. PECTORALIS MAJOR (Bilateral fan plates)
  const pectoralisGroup = new THREE.Group();
  pectoralisGroup.userData = { structureId: 'pectoralis', category: 'muscular', name: 'Pectoralis Major' };

  for (const sign of [-1, 1]) {
    const pecShape = new THREE.Shape();
    pecShape.moveTo(0, 0);
    pecShape.quadraticCurveTo(sign * 0.45, 0.25, sign * 0.78, 0.1);
    pecShape.quadraticCurveTo(sign * 0.65, -0.3, sign * 0.1, -0.35);
    pecShape.closePath();

    const pecGeo = new THREE.ExtrudeGeometry(pecShape, {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.04,
      bevelThickness: 0.04,
    });
    pecGeo.scale(1, 1, 0.7);
    const pecMesh = new THREE.Mesh(pecGeo, materials.muscle);
    pecMesh.position.set(sign * 0.08, 3.0, 0.46);
    pecMesh.rotation.x = -0.15;
    pectoralisGroup.add(pecMesh);
  }
  root.add(pectoralisGroup);

  // 2. DELTOID (Shoulder caps)
  const deltoidGroup = new THREE.Group();
  deltoidGroup.userData = { structureId: 'deltoid', category: 'muscular', name: 'Deltoid Muscle' };

  for (const sign of [-1, 1]) {
    const deltGeo = new THREE.SphereGeometry(0.24, 16, 16);
    deltGeo.scale(1.1, 1.6, 1.0);
    const deltMesh = new THREE.Mesh(deltGeo, materials.muscle);
    deltMesh.position.set(sign * 1.05, 3.2, 0.08);
    deltMesh.rotation.z = -sign * 0.2;
    deltoidGroup.add(deltMesh);
  }
  root.add(deltoidGroup);

  // 3. BICEPS BRACHII
  const bicepsGroup = new THREE.Group();
  bicepsGroup.userData = { structureId: 'biceps', category: 'muscular', name: 'Biceps Brachii' };

  for (const sign of [-1, 1]) {
    const bicepGeo = new THREE.CylinderGeometry(0.08, 0.065, 0.55, 12);
    bicepGeo.scale(0.85, 1.0, 1.25);
    const bicepMesh = new THREE.Mesh(bicepGeo, materials.muscle);
    bicepMesh.position.set(sign * 1.15, 2.7, 0.14);
    bicepMesh.rotation.z = -sign * 0.14;
    bicepsGroup.add(bicepMesh);
  }
  root.add(bicepsGroup);

  // 4. RECTUS ABDOMINIS ("Six-pack" abdominal muscular wall)
  const absGroup = new THREE.Group();
  absGroup.userData = { structureId: 'rectus_abdominis', category: 'muscular', name: 'Rectus Abdominis' };

  // Paired vertical columns with 4 segmental packs each
  for (const sign of [-1, 1]) {
    for (let row = 0; row < 4; row++) {
      const y = 2.4 - row * 0.28;
      const abGeo = new THREE.BoxGeometry(0.19, 0.22, 0.07);
      const abMesh = new THREE.Mesh(abGeo, materials.muscle);
      abMesh.position.set(sign * 0.12, y, 0.44 - row * 0.02);
      absGroup.add(abMesh);
    }
  }
  root.add(absGroup);

  // 5. QUADRICEPS FEMORIS (Anterior thigh)
  const quadsGroup = new THREE.Group();
  quadsGroup.userData = { structureId: 'quadriceps', category: 'muscular', name: 'Quadriceps Femoris' };

  for (const sign of [-1, 1]) {
    // Rectus femoris central belly
    const rfGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.95, 14);
    rfGeo.scale(0.9, 1.0, 1.25);
    const rfMesh = new THREE.Mesh(rfGeo, materials.muscle);
    rfMesh.position.set(sign * 0.55, -0.45, 0.15);
    rfMesh.rotation.z = sign * 0.08;
    quadsGroup.add(rfMesh);

    // Vastus lateralis (lateral bulk)
    const vlGeo = new THREE.CylinderGeometry(0.1, 0.07, 0.85, 12);
    const vlMesh = new THREE.Mesh(vlGeo, materials.muscle);
    vlMesh.position.set(sign * 0.72, -0.5, 0.08);
    vlMesh.rotation.z = sign * 0.12;
    quadsGroup.add(vlMesh);

    // Vastus medialis (teardrop)
    const vmGeo = new THREE.SphereGeometry(0.11, 12, 12);
    vmGeo.scale(0.85, 1.4, 0.9);
    const vmMesh = new THREE.Mesh(vmGeo, materials.muscle);
    vmMesh.position.set(sign * 0.42, -0.95, 0.12);
    quadsGroup.add(vmMesh);
  }
  root.add(quadsGroup);

  // 6. GASTROCNEMIUS (Calf complex)
  const calfGroup = new THREE.Group();
  calfGroup.userData = { structureId: 'gastrocnemius', category: 'muscular', name: 'Gastrocnemius & Calf Complex' };

  for (const sign of [-1, 1]) {
    // Medial head
    const medGeo = new THREE.SphereGeometry(0.095, 12, 12);
    medGeo.scale(0.9, 1.8, 1.1);
    const medMesh = new THREE.Mesh(medGeo, materials.muscle);
    medMesh.position.set(sign * 0.44, -1.95, -0.12);
    calfGroup.add(medMesh);

    // Lateral head
    const latGeo = new THREE.SphereGeometry(0.09, 12, 12);
    latGeo.scale(0.85, 1.7, 1.05);
    const latMesh = new THREE.Mesh(latGeo, materials.muscle);
    latMesh.position.set(sign * 0.58, -1.98, -0.12);
    calfGroup.add(latMesh);

    // Calcaneal (Achilles) tendon
    const achillesGeo = new THREE.CylinderGeometry(0.035, 0.04, 0.65, 8);
    const achillesMesh = new THREE.Mesh(achillesGeo, materials.cartilage);
    achillesMesh.position.set(sign * 0.48, -2.6, -0.09);
    calfGroup.add(achillesMesh);
  }
  root.add(calfGroup);

  return root;
}
