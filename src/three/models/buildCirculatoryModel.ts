import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildCirculatoryModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  heartMesh: THREE.Group;
} {
  const root = new THREE.Group();
  root.name = 'circulatory_system';

  // 1. HEART (Muscular 4-chamber organ in middle mediastinum)
  const heartGroup = new THREE.Group();
  heartGroup.name = 'heart_organ';
  heartGroup.userData = { structureId: 'heart', category: 'circulatory', name: 'Heart & Coronary Vasculature' };

  // Main ventricular cone (Apex pointing inferiorly, anteriorly, and to the left)
  const ventGeo = new THREE.ConeGeometry(0.24, 0.42, 16);
  ventGeo.scale(1.1, 1.0, 0.85);
  const ventMesh = new THREE.Mesh(ventGeo, materials.heart);
  ventMesh.rotation.z = Math.PI; // point apex downwards
  ventMesh.position.set(0, -0.06, 0);
  heartGroup.add(ventMesh);

  // Left & Right Atria superior base
  const atriaGeo = new THREE.SphereGeometry(0.22, 16, 14);
  atriaGeo.scale(1.2, 0.85, 0.9);
  const atriaMesh = new THREE.Mesh(atriaGeo, materials.heart);
  atriaMesh.position.set(0, 0.12, -0.04);
  heartGroup.add(atriaMesh);

  // Coronary Artery Sulcus branch (Left anterior descending artery - LAD)
  const ladCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.14, 0.18),
    new THREE.Vector3(0.04, 0.0, 0.19),
    new THREE.Vector3(0.08, -0.16, 0.14),
    new THREE.Vector3(0.06, -0.24, 0.08),
  ]);
  const ladGeo = new THREE.TubeGeometry(ladCurve, 12, 0.016, 6, false);
  const ladMesh = new THREE.Mesh(ladGeo, materials.artery);
  heartGroup.add(ladMesh);

  // Position heart in middle mediastinum with 40-degree physiological left tilt
  heartGroup.position.set(0.08, 2.72, 0.22);
  heartGroup.rotation.z = -0.35;
  heartGroup.rotation.y = 0.2;
  root.add(heartGroup);

  // 2. SYSTEMIC AORTA & MAJOR ARTERIES
  const aortaGroup = new THREE.Group();
  aortaGroup.userData = { structureId: 'aorta', category: 'circulatory', name: 'Systemic Aorta & Major Arteries' };

  // Aorta curve: ascending from left ventricle, arching over pulmonary trunk, descending along spine
  const aortaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.08, 2.85, 0.22), // aortic root
    new THREE.Vector3(0.05, 3.12, 0.24), // ascending aorta
    new THREE.Vector3(0.0, 3.22, 0.15), // aortic arch summit
    new THREE.Vector3(-0.06, 3.08, 0.05), // descending arch
    new THREE.Vector3(-0.05, 2.4, 0.02), // thoracic aorta
    new THREE.Vector3(-0.04, 1.7, 0.02), // celiac/superior mesenteric level
    new THREE.Vector3(-0.02, 1.0, 0.0), // abdominal aorta bifurcation at L4
  ]);
  const aortaGeo = new THREE.TubeGeometry(aortaCurve, 32, 0.052, 10, false);
  const aortaMesh = new THREE.Mesh(aortaGeo, materials.artery);
  aortaGroup.add(aortaMesh);

  // Three Supra-Aortic Branches (Brachiocephalic, Left Common Carotid, Left Subclavian)
  const archBranches = [
    { x: 0.04, y: 3.2, z: 0.18, target: [0.22, 3.65, 0.12] }, // Brachiocephalic
    { x: 0.0, y: 3.22, z: 0.15, target: [-0.04, 3.68, 0.12] }, // L Carotid
    { x: -0.04, y: 3.18, z: 0.1, target: [-0.22, 3.55, 0.08] }, // L Subclavian
  ];

  archBranches.forEach((b) => {
    const branchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(b.x, b.y, b.z),
      new THREE.Vector3(b.target[0], b.target[1], b.target[2]),
    ]);
    const branchGeo = new THREE.TubeGeometry(branchCurve, 8, 0.024, 6, false);
    const branchMesh = new THREE.Mesh(branchGeo, materials.artery);
    aortaGroup.add(branchMesh);
  });

  // Common Iliac and Femoral Arteries bifurcation
  for (const sign of [-1, 1]) {
    const iliacCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 1.0, 0.0),
      new THREE.Vector3(sign * 0.2, 0.65, 0.05),
      new THREE.Vector3(sign * 0.38, 0.25, 0.08),
      new THREE.Vector3(sign * 0.44, -0.4, 0.12),
      new THREE.Vector3(sign * 0.42, -1.2, 0.08),
    ]);
    const iliacGeo = new THREE.TubeGeometry(iliacCurve, 20, 0.032, 8, false);
    const iliacMesh = new THREE.Mesh(iliacGeo, materials.artery);
    aortaGroup.add(iliacMesh);
  }

  root.add(aortaGroup);

  // 3. PULMONARY VESSELS & VENA CAVA
  const pulmonaryGroup = new THREE.Group();
  pulmonaryGroup.userData = { structureId: 'pulmonary_vessels', category: 'circulatory', name: 'Pulmonary Arteries & Veins' };

  // Main Pulmonary Trunk (arises from RV, branches left and right under aortic arch)
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 2.82, 0.28),
    new THREE.Vector3(-0.02, 3.02, 0.24),
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 8, 0.045, 8, false);
  const trunkMesh = new THREE.Mesh(trunkGeo, materials.vein); // blue deoxygenated blood
  pulmonaryGroup.add(trunkMesh);

  // Left & Right pulmonary artery branches
  for (const sign of [-1, 1]) {
    const paCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 3.02, 0.24),
      new THREE.Vector3(sign * 0.35, 2.98, 0.1),
    ]);
    const paGeo = new THREE.TubeGeometry(paCurve, 8, 0.034, 6, false);
    const paMesh = new THREE.Mesh(paGeo, materials.vein);
    pulmonaryGroup.add(paMesh);
  }

  // Superior & Inferior Vena Cava
  const svcCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.2, 3.4, 0.12),
    new THREE.Vector3(0.18, 2.85, 0.16),
  ]);
  const svcGeo = new THREE.TubeGeometry(svcCurve, 8, 0.045, 8, false);
  const svcMesh = new THREE.Mesh(svcGeo, materials.vein);
  pulmonaryGroup.add(svcMesh);

  const ivcCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.14, 2.65, 0.14),
    new THREE.Vector3(0.08, 1.8, 0.06),
    new THREE.Vector3(0.06, 1.0, 0.02),
  ]);
  const ivcGeo = new THREE.TubeGeometry(ivcCurve, 14, 0.045, 8, false);
  const ivcMesh = new THREE.Mesh(ivcGeo, materials.vein);
  pulmonaryGroup.add(ivcMesh);

  root.add(pulmonaryGroup);

  return { group: root, heartMesh: heartGroup };
}
