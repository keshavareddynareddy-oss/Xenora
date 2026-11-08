import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildNervousModel(materials: AnatomyMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'nervous_system';

  // 1. BRAIN (Cerebrum hemispheres)
  const brainGroup = new THREE.Group();
  brainGroup.userData = { structureId: 'brain', category: 'nervous', name: 'Brain (Cerebrum & Cortex)' };

  for (const sign of [-1, 1]) {
    // Hemispheric ovate mass
    const hemiGeo = new THREE.SphereGeometry(0.32, 24, 20);
    hemiGeo.scale(0.85, 0.95, 1.25);
    const hemiMesh = new THREE.Mesh(hemiGeo, materials.nerve);
    hemiMesh.position.set(sign * 0.17, 4.45, -0.02);
    brainGroup.add(hemiMesh);

    // Frontal lobe prominence
    const frontalGeo = new THREE.SphereGeometry(0.18, 16, 14);
    frontalGeo.scale(0.9, 0.9, 1.1);
    const frontalMesh = new THREE.Mesh(frontalGeo, materials.nerve);
    frontalMesh.position.set(sign * 0.16, 4.48, 0.22);
    brainGroup.add(frontalMesh);

    // Temporal lobe inferolateral bulges
    const tempGeo = new THREE.SphereGeometry(0.15, 14, 12);
    tempGeo.scale(0.8, 0.8, 1.3);
    const tempMesh = new THREE.Mesh(tempGeo, materials.nerve);
    tempMesh.position.set(sign * 0.26, 4.28, 0.05);
    brainGroup.add(tempMesh);
  }
  root.add(brainGroup);

  // 2. CEREBELLUM
  const cerebellumGroup = new THREE.Group();
  cerebellumGroup.userData = { structureId: 'cerebellum', category: 'nervous', name: 'Cerebellum' };

  for (const sign of [-1, 1]) {
    const cbHemiGeo = new THREE.SphereGeometry(0.16, 16, 14);
    cbHemiGeo.scale(1.1, 0.85, 0.95);
    const cbHemi = new THREE.Mesh(cbHemiGeo, materials.nerve);
    cbHemi.position.set(sign * 0.14, 4.12, -0.26);
    cerebellumGroup.add(cbHemi);
  }
  // Vermis (midline bridge)
  const vermisGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.16, 12);
  const vermis = new THREE.Mesh(vermisGeo, materials.nerve);
  vermis.position.set(0, 4.12, -0.24);
  cerebellumGroup.add(vermis);

  root.add(cerebellumGroup);

  // 3. BRAINSTEM
  const brainstemGroup = new THREE.Group();
  brainstemGroup.userData = { structureId: 'brainstem', category: 'nervous', name: 'Brainstem (Midbrain, Pons, Medulla)' };

  // Midbrain
  const midbrainGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.12, 12);
  const midbrain = new THREE.Mesh(midbrainGeo, materials.nerve);
  midbrain.position.set(0, 4.02, -0.06);
  brainstemGroup.add(midbrain);

  // Pons (anterior bulbous prominence)
  const ponsGeo = new THREE.SphereGeometry(0.11, 14, 12);
  ponsGeo.scale(1.0, 0.8, 1.2);
  const pons = new THREE.Mesh(ponsGeo, materials.nerve);
  pons.position.set(0, 3.88, -0.03);
  brainstemGroup.add(pons);

  // Medulla Oblongata
  const medullaGeo = new THREE.CylinderGeometry(0.065, 0.05, 0.18, 12);
  const medulla = new THREE.Mesh(medullaGeo, materials.nerve);
  medulla.position.set(0, 3.72, -0.08);
  brainstemGroup.add(medulla);

  root.add(brainstemGroup);

  // 4. SPINAL CORD & TRACTS
  const spinalCordGroup = new THREE.Group();
  spinalCordGroup.userData = { structureId: 'spinal_cord', category: 'nervous', name: 'Spinal Cord & Major Tracts' };

  // Longitudinal spinal cord cylinder descending through canal
  const cordCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.65, -0.08),
    new THREE.Vector3(0, 3.0, -0.02),
    new THREE.Vector3(0, 2.2, -0.12),
    new THREE.Vector3(0, 1.4, -0.04),
    new THREE.Vector3(0, 0.9, -0.08),
  ]);
  const cordGeo = new THREE.TubeGeometry(cordCurve, 32, 0.045, 12, false);
  const cordMesh = new THREE.Mesh(cordGeo, materials.nerve);
  spinalCordGroup.add(cordMesh);

  // Bilateral segmental spinal nerve roots (31 pairs represented by key segments)
  for (let s = 0; s < 18; s++) {
    const sy = 3.5 - s * 0.14;
    for (const sign of [-1, 1]) {
      const rootCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(sign * 0.03, sy, -0.08),
        new THREE.Vector3(sign * 0.18, sy - 0.04, -0.05),
        new THREE.Vector3(sign * 0.38, sy - 0.08, 0.02),
      ]);
      const rootGeo = new THREE.TubeGeometry(rootCurve, 8, 0.014, 6, false);
      const rootMesh = new THREE.Mesh(rootGeo, materials.nerveRoot);
      spinalCordGroup.add(rootMesh);
    }
  }
  root.add(spinalCordGroup);

  // 5. SCIATIC NERVE (Emerges from lumbosacral plexus down posterior lower extremity)
  const sciaticGroup = new THREE.Group();
  sciaticGroup.userData = { structureId: 'sciatic_nerve', category: 'nervous', name: 'Sciatic Nerve & Peripheral Branches' };

  for (const sign of [-1, 1]) {
    const sciaticCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sign * 0.18, 0.6, -0.08),
      new THREE.Vector3(sign * 0.35, 0.25, -0.15),
      new THREE.Vector3(sign * 0.42, -0.4, -0.14),
      new THREE.Vector3(sign * 0.44, -1.2, -0.12),
      new THREE.Vector3(sign * 0.46, -1.9, -0.1),
    ]);
    const sciaticGeo = new THREE.TubeGeometry(sciaticCurve, 20, 0.024, 8, false);
    const sciaticMesh = new THREE.Mesh(sciaticGeo, materials.nerve);
    sciaticGroup.add(sciaticMesh);

    // Bifurcation into tibial and common fibular nerves
    const tibialCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sign * 0.46, -1.9, -0.1),
      new THREE.Vector3(sign * 0.44, -2.6, -0.08),
    ]);
    const tibialGeo = new THREE.TubeGeometry(tibialCurve, 8, 0.016, 6, false);
    const tibialMesh = new THREE.Mesh(tibialGeo, materials.nerveRoot);
    sciaticGroup.add(tibialMesh);
  }
  root.add(sciaticGroup);

  return root;
}
