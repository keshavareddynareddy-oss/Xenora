import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildPlantSpecimen(materials: AnatomyMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'plant_specimen_subject';

  const plantGreenMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.45,
    metalness: 0.05,
  });
  const cuticleMat = new THREE.MeshStandardMaterial({
    color: 0xa3e635,
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.65,
  });
  const spongyMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.6,
    metalness: 0.05,
  });
  const guardCellMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.35,
    metalness: 0.1,
  });

  // 1. UPPER CUTICLE & EPIDERMIS
  const cuticleGroup = new THREE.Group();
  cuticleGroup.userData = {
    structureId: 'plant_cuticle',
    category: 'botanical',
    subject: 'plant',
    name: 'Waxy Cuticle & Upper Epidermis',
  };
  const cuticleSlab = new THREE.BoxGeometry(2.4, 0.08, 1.8);
  const cuticleMesh = new THREE.Mesh(cuticleSlab, cuticleMat);
  cuticleMesh.position.set(0, 0.85, 0);
  cuticleGroup.add(cuticleMesh);

  // Upper epidermis cells
  const epiSlab = new THREE.BoxGeometry(2.4, 0.14, 1.8);
  const epiMesh = new THREE.Mesh(epiSlab, materials.cartilage);
  epiMesh.position.set(0, 0.74, 0);
  cuticleGroup.add(epiMesh);
  root.add(cuticleGroup);

  // 2. PALISADE MESOPHYLL (Columnar cells packed with chloroplasts)
  const palisadeGroup = new THREE.Group();
  palisadeGroup.userData = {
    structureId: 'plant_palisade',
    category: 'botanical',
    subject: 'plant',
    name: 'Palisade Mesophyll (Chloroplast Engine)',
  };
  // Grid of vertical columnar cells
  for (let x = -1.0; x <= 1.0; x += 0.28) {
    for (let z = -0.7; z <= 0.7; z += 0.28) {
      const colGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.55, 10);
      const colMesh = new THREE.Mesh(colGeo, plantGreenMat);
      colMesh.position.set(x, 0.38, z);
      palisadeGroup.add(colMesh);

      // Chloroplast beads inside
      for (let c = 0; c < 3; c++) {
        const cpGeo = new THREE.SphereGeometry(0.035, 6, 6);
        const cpMesh = new THREE.Mesh(cpGeo, materials.gallbladder);
        cpMesh.position.set(x + 0.04, 0.25 + c * 0.12, z + 0.04);
        palisadeGroup.add(cpMesh);
      }
    }
  }
  root.add(palisadeGroup);

  // 3. SPONGY MESOPHYLL & AIR LACUNAE
  const spongyGroup = new THREE.Group();
  spongyGroup.userData = {
    structureId: 'plant_spongy',
    category: 'botanical',
    subject: 'plant',
    name: 'Spongy Mesophyll & Aerating Lacunae',
  };
  // Loosely arranged spheres with air gaps
  for (let x = -1.0; x <= 1.0; x += 0.34) {
    for (let z = -0.7; z <= 0.7; z += 0.34) {
      if (Math.abs(x) < 0.25 && Math.abs(z) < 0.35) continue; // Leave center for vascular bundle
      const sGeo = new THREE.SphereGeometry(0.12, 10, 8);
      sGeo.scale(1.1, 0.9, 1.05);
      const sMesh = new THREE.Mesh(sGeo, spongyMat);
      sMesh.position.set(
        x + (Math.random() - 0.5) * 0.08,
        -0.12 + (Math.random() - 0.5) * 0.08,
        z + (Math.random() - 0.5) * 0.08
      );
      spongyGroup.add(sMesh);
    }
  }
  root.add(spongyGroup);

  // 4. VASCULAR BUNDLE (Xylem & Phloem midrib vein)
  const vascularGroup = new THREE.Group();
  vascularGroup.userData = {
    structureId: 'plant_vascular',
    category: 'botanical',
    subject: 'plant',
    name: 'Vascular Bundle (Xylem & Phloem Veins)',
  };
  // Bundle Sheath ring
  const sheathGeo = new THREE.CylinderGeometry(0.38, 0.38, 1.8, 16);
  sheathGeo.rotateX(Math.PI / 2);
  const sheathMat = new THREE.MeshStandardMaterial({
    color: 0x84cc16,
    roughness: 0.6,
    transparent: true,
    opacity: 0.5,
  });
  const sheathMesh = new THREE.Mesh(sheathGeo, sheathMat);
  sheathMesh.position.set(0, -0.05, 0);
  vascularGroup.add(sheathMesh);

  // Xylem vessels (blue water-conducting tubes on upper side)
  for (const sign of [-1, 1]) {
    const xGeo = new THREE.CylinderGeometry(0.085, 0.085, 1.75, 12);
    xGeo.rotateX(Math.PI / 2);
    const xMesh = new THREE.Mesh(xGeo, materials.vein);
    xMesh.position.set(sign * 0.12, 0.08, 0);
    vascularGroup.add(xMesh);
  }

  // Phloem sieve tubes (amber sucrose-conducting tubes on lower side)
  for (const sign of [-1, 1]) {
    const pGeo = new THREE.CylinderGeometry(0.065, 0.065, 1.75, 10);
    pGeo.rotateX(Math.PI / 2);
    const pMesh = new THREE.Mesh(pGeo, materials.pancreas);
    pMesh.position.set(sign * 0.1, -0.18, 0);
    vascularGroup.add(pMesh);
  }
  root.add(vascularGroup);

  // 5. LOWER EPIDERMIS & STOMATA GUARD CELLS
  const stomataGroup = new THREE.Group();
  stomataGroup.userData = {
    structureId: 'plant_stomata',
    category: 'botanical',
    subject: 'plant',
    name: 'Stomata & Guard Cell Osmoregulators',
  };
  // Lower epidermis slab
  const lowerEpiGeo = new THREE.BoxGeometry(2.4, 0.12, 1.8);
  const lowerEpiMesh = new THREE.Mesh(lowerEpiGeo, materials.cartilage);
  lowerEpiMesh.position.set(0, -0.48, 0);
  stomataGroup.add(lowerEpiMesh);

  // Stomatal pores with paired kidney-shaped guard cells
  const stomataLocations = [
    [-0.6, -0.55, 0.4],
    [0.6, -0.55, 0.4],
    [-0.5, -0.55, -0.4],
    [0.5, -0.55, -0.4],
  ];
  stomataLocations.forEach((loc) => {
    // Paired kidney guard cells
    for (const sign of [-1, 1]) {
      const gGeo = new THREE.TorusGeometry(0.07, 0.025, 8, 12, Math.PI * 0.95);
      gGeo.rotateX(Math.PI / 2);
      gGeo.rotateZ(sign * Math.PI * 0.5);
      const gMesh = new THREE.Mesh(gGeo, guardCellMat);
      gMesh.position.set(loc[0] + sign * 0.02, loc[1], loc[2]);
      stomataGroup.add(gMesh);
    }
  });
  root.add(stomataGroup);

  return root;
}
