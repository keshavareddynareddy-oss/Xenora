import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildBrainSpecimen(materials: AnatomyMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'brain_specimen_subject';

  // 1. FRONTAL LOBE (Bilateral anterior cerebral poles)
  const frontalGroup = new THREE.Group();
  frontalGroup.userData = {
    structureId: 'frontal_lobe',
    category: 'nervous',
    subject: 'brain',
    name: 'Frontal Lobe & Prefrontal Cortex',
  };
  for (const sign of [-1, 1]) {
    const geo = new THREE.SphereGeometry(0.55, 24, 20);
    geo.scale(0.85, 0.95, 1.15);
    const mesh = new THREE.Mesh(geo, materials.nerve);
    mesh.position.set(sign * 0.42, 0.22, 0.45);
    frontalGroup.add(mesh);

    // Convoluted gyri bumps on frontal surface
    for (let g = 0; g < 4; g++) {
      const gGeo = new THREE.TorusGeometry(0.18, 0.045, 8, 14);
      gGeo.rotateX(Math.PI / 4 + g * 0.2);
      const gMesh = new THREE.Mesh(gGeo, materials.nerveRoot);
      gMesh.position.set(sign * 0.45, 0.25 + g * 0.08, 0.55 - g * 0.1);
      frontalGroup.add(gMesh);
    }
  }
  root.add(frontalGroup);

  // 2. PARIETAL LOBE
  const parietalGroup = new THREE.Group();
  parietalGroup.userData = {
    structureId: 'parietal_lobe',
    category: 'nervous',
    subject: 'brain',
    name: 'Parietal Lobe (Somatosensory)',
  };
  for (const sign of [-1, 1]) {
    const geo = new THREE.SphereGeometry(0.52, 24, 20);
    geo.scale(0.9, 1.0, 1.0);
    const mesh = new THREE.Mesh(geo, materials.nerve);
    mesh.position.set(sign * 0.44, 0.45, -0.15);
    parietalGroup.add(mesh);
  }
  root.add(parietalGroup);

  // 3. TEMPORAL LOBE
  const temporalGroup = new THREE.Group();
  temporalGroup.userData = {
    structureId: 'temporal_lobe',
    category: 'nervous',
    subject: 'brain',
    name: 'Temporal Lobe & Hippocampus',
  };
  for (const sign of [-1, 1]) {
    const geo = new THREE.SphereGeometry(0.42, 20, 16);
    geo.scale(0.85, 0.8, 1.25);
    const mesh = new THREE.Mesh(geo, materials.nerve);
    mesh.position.set(sign * 0.68, -0.12, 0.18);
    mesh.rotation.y = sign * 0.15;
    temporalGroup.add(mesh);
  }
  root.add(temporalGroup);

  // 4. OCCIPITAL LOBE
  const occipitalGroup = new THREE.Group();
  occipitalGroup.userData = {
    structureId: 'occipital_lobe',
    category: 'nervous',
    subject: 'brain',
    name: 'Occipital Lobe & Calcarine Cortex',
  };
  for (const sign of [-1, 1]) {
    const geo = new THREE.SphereGeometry(0.44, 20, 16);
    geo.scale(0.85, 0.9, 0.95);
    const mesh = new THREE.Mesh(geo, materials.nerve);
    mesh.position.set(sign * 0.38, 0.15, -0.72);
    occipitalGroup.add(mesh);
  }
  root.add(occipitalGroup);

  // 5. CEREBELLUM
  const cerebellumGroup = new THREE.Group();
  cerebellumGroup.userData = {
    structureId: 'cerebellum_subject',
    category: 'nervous',
    subject: 'brain',
    name: 'Cerebellum & Foliated Cortex',
  };
  for (const sign of [-1, 1]) {
    const geo = new THREE.SphereGeometry(0.38, 20, 16);
    geo.scale(1.15, 0.8, 0.9);
    const mesh = new THREE.Mesh(geo, materials.nerveRoot);
    mesh.position.set(sign * 0.36, -0.38, -0.58);
    cerebellumGroup.add(mesh);
  }
  // Vermis midline
  const vermisGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.42, 12);
  const vermis = new THREE.Mesh(vermisGeo, materials.nerveRoot);
  vermis.position.set(0, -0.38, -0.55);
  cerebellumGroup.add(vermis);
  root.add(cerebellumGroup);

  // 6. BRAINSTEM (Midbrain, Pons, Medulla)
  const brainstemGroup = new THREE.Group();
  brainstemGroup.userData = {
    structureId: 'brainstem_subject',
    category: 'nervous',
    subject: 'brain',
    name: 'Brainstem & Cranial Nerve Nuclei',
  };
  // Midbrain
  const midGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.25, 14);
  const midMesh = new THREE.Mesh(midGeo, materials.nerve);
  midMesh.position.set(0, -0.15, -0.12);
  brainstemGroup.add(midMesh);

  // Pons bulge
  const ponsGeo = new THREE.SphereGeometry(0.24, 16, 14);
  ponsGeo.scale(1.0, 0.85, 1.25);
  const ponsMesh = new THREE.Mesh(ponsGeo, materials.nerve);
  ponsMesh.position.set(0, -0.4, 0.02);
  brainstemGroup.add(ponsMesh);

  // Medulla Oblongata
  const medGeo = new THREE.CylinderGeometry(0.14, 0.11, 0.45, 14);
  const medMesh = new THREE.Mesh(medGeo, materials.nerve);
  medMesh.position.set(0, -0.75, -0.05);
  brainstemGroup.add(medMesh);

  // Basilar Artery & Circle of Willis ring
  const basilarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.85, 0.1),
    new THREE.Vector3(0, -0.42, 0.16),
    new THREE.Vector3(0, -0.22, 0.08),
  ]);
  const basilarGeo = new THREE.TubeGeometry(basilarCurve, 12, 0.025, 8, false);
  const basilarMesh = new THREE.Mesh(basilarGeo, materials.artery);
  brainstemGroup.add(basilarMesh);

  root.add(brainstemGroup);

  return root;
}
