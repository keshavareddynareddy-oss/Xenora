import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildCellSpecimen(materials: AnatomyMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'cell_specimen_subject';

  // 1. PLASMA MEMBRANE (Cutaway sphere showing cytoplasmic interior)
  const membraneGroup = new THREE.Group();
  membraneGroup.userData = {
    structureId: 'cell_membrane',
    category: 'cellular',
    subject: 'cell',
    name: 'Plasma Membrane & Fluid Mosaic',
  };
  // 3/4 cutaway sphere
  const memGeo = new THREE.SphereGeometry(1.6, 32, 24, 0, Math.PI * 1.55);
  const memMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
  });
  const memMesh = new THREE.Mesh(memGeo, memMat);
  membraneGroup.add(memMesh);

  // Cytoplasm base jelly
  const cytoGeo = new THREE.SphereGeometry(1.55, 24, 18, 0, Math.PI * 1.55);
  const cytoMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.8,
    metalness: 0.0,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
  });
  const cytoMesh = new THREE.Mesh(cytoGeo, cytoMat);
  membraneGroup.add(cytoMesh);
  root.add(membraneGroup);

  // 2. NUCLEUS & NUCLEOLUS
  const nucleusGroup = new THREE.Group();
  nucleusGroup.userData = {
    structureId: 'cell_nucleus',
    category: 'cellular',
    subject: 'cell',
    name: 'Nucleus & Chromatin Vault',
  };
  // Nuclear envelope
  const nucGeo = new THREE.SphereGeometry(0.55, 24, 20);
  const nucMesh = new THREE.Mesh(nucGeo, materials.nerve);
  nucleusGroup.add(nucMesh);

  // Inner dense nucleolus
  const nucleolusGeo = new THREE.SphereGeometry(0.22, 16, 14);
  const nucleolusMesh = new THREE.Mesh(nucleolusGeo, materials.heart);
  nucleolusMesh.position.set(0.08, 0.08, 0.12);
  nucleusGroup.add(nucleolusMesh);

  // Nuclear pores (small dots on envelope)
  for (let p = 0; p < 18; p++) {
    const phi = Math.acos(-1 + (2 * p) / 18);
    const theta = Math.sqrt(18 * Math.PI) * phi;
    const poreGeo = new THREE.SphereGeometry(0.035, 6, 6);
    const poreMesh = new THREE.Mesh(poreGeo, materials.cartilage);
    poreMesh.position.set(
      0.54 * Math.cos(theta) * Math.sin(phi),
      0.54 * Math.sin(theta) * Math.sin(phi),
      0.54 * Math.cos(phi)
    );
    nucleusGroup.add(poreMesh);
  }
  root.add(nucleusGroup);

  // 3. MITOCHONDRIA (Organelles with cristae)
  const mitoGroup = new THREE.Group();
  mitoGroup.userData = {
    structureId: 'cell_mitochondria',
    category: 'cellular',
    subject: 'cell',
    name: 'Mitochondria (Powerhouse & Cristae)',
  };
  const mitoPositions = [
    { pos: [0.75, 0.55, 0.45], rot: [0.4, 0.8, 0.2] },
    { pos: [-0.85, -0.45, 0.35], rot: [-0.3, 0.5, 0.7] },
    { pos: [0.35, -0.85, 0.55], rot: [0.6, -0.4, 0.5] },
  ];
  mitoPositions.forEach((m) => {
    const mitoPill = new THREE.Group();
    // Outer membrane capsule
    const capsuleGeo = new THREE.CapsuleGeometry(0.14, 0.32, 12, 16);
    const capsuleMesh = new THREE.Mesh(capsuleGeo, materials.stomach);
    mitoPill.add(capsuleMesh);

    // Inner cristae ridges
    for (let c = 0; c < 4; c++) {
      const cristaGeo = new THREE.TorusGeometry(0.1, 0.018, 6, 12);
      const cristaMesh = new THREE.Mesh(cristaGeo, materials.artery);
      cristaMesh.position.set(0, -0.12 + c * 0.08, 0);
      mitoPill.add(cristaMesh);
    }
    mitoPill.position.set(m.pos[0], m.pos[1], m.pos[2]);
    mitoPill.rotation.set(m.rot[0], m.rot[1], m.rot[2]);
    mitoGroup.add(mitoPill);
  });
  root.add(mitoGroup);

  // 4. ENDOPLASMIC RETICULUM (Rough & Smooth folds)
  const erGroup = new THREE.Group();
  erGroup.userData = {
    structureId: 'cell_er',
    category: 'cellular',
    subject: 'cell',
    name: 'Endoplasmic Reticulum (Rough & Smooth)',
  };
  for (let s = 0; s < 5; s++) {
    const erSheetGeo = new THREE.TorusGeometry(0.7 + s * 0.12, 0.035, 8, 20, Math.PI * 0.8);
    erSheetGeo.rotateX(Math.PI / 3 + s * 0.1);
    const erSheet = new THREE.Mesh(erSheetGeo, materials.airway);
    erSheet.position.set(-0.25, 0.15, -0.1);
    erGroup.add(erSheet);
  }
  root.add(erGroup);

  // 5. GOLGI APPARATUS & VESICLES
  const golgiGroup = new THREE.Group();
  golgiGroup.userData = {
    structureId: 'cell_golgi',
    category: 'cellular',
    subject: 'cell',
    name: 'Golgi Apparatus (Packaging & Shipping)',
  };
  for (let g = 0; g < 5; g++) {
    const cisternGeo = new THREE.TorusGeometry(0.35 + g * 0.04, 0.04, 8, 16, Math.PI * 0.65);
    cisternGeo.rotateZ(Math.PI / 4);
    const cisternMesh = new THREE.Mesh(cisternGeo, materials.muscle);
    cisternMesh.position.set(0.65, -0.45 + g * 0.07, 0.2);
    golgiGroup.add(cisternMesh);
  }
  // Secretory transport vesicles
  for (let v = 0; v < 8; v++) {
    const vGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const vMesh = new THREE.Mesh(vGeo, materials.cartilage);
    vMesh.position.set(
      0.85 + Math.random() * 0.2,
      -0.5 + Math.random() * 0.35,
      0.25 + Math.random() * 0.2
    );
    golgiGroup.add(vMesh);
  }
  root.add(golgiGroup);

  return root;
}
