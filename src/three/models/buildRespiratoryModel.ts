import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildRespiratoryModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  lungsGroup: THREE.Group;
} {
  const root = new THREE.Group();
  root.name = 'respiratory_system';

  // 1. LUNGS (Right trilobed, Left bilobed with cardiac notch)
  const lungsGroup = new THREE.Group();
  lungsGroup.name = 'lungs_organ';
  lungsGroup.userData = { structureId: 'lungs', category: 'respiratory', name: 'Lungs & Lobar Parenchyma' };

  // Right Lung (3 lobes: superior, middle, inferior)
  const rightLungRoot = new THREE.Group();
  // Superior lobe
  const rSupGeo = new THREE.SphereGeometry(0.24, 16, 14);
  rSupGeo.scale(1.15, 1.4, 1.1);
  const rSup = new THREE.Mesh(rSupGeo, materials.lung);
  rSup.position.set(-0.38, 2.95, 0.08);
  rightLungRoot.add(rSup);

  // Middle lobe
  const rMidGeo = new THREE.SphereGeometry(0.22, 16, 14);
  rMidGeo.scale(1.2, 0.9, 1.05);
  const rMid = new THREE.Mesh(rMidGeo, materials.lung);
  rMid.position.set(-0.4, 2.65, 0.14);
  rightLungRoot.add(rMid);

  // Inferior lobe
  const rInfGeo = new THREE.SphereGeometry(0.26, 16, 14);
  rInfGeo.scale(1.2, 1.3, 1.15);
  const rInf = new THREE.Mesh(rInfGeo, materials.lung);
  rInf.position.set(-0.38, 2.35, 0.04);
  rightLungRoot.add(rInf);
  lungsGroup.add(rightLungRoot);

  // Left Lung (2 lobes with cardiac notch indentation)
  const leftLungRoot = new THREE.Group();
  // Superior lobe with lingula
  const lSupGeo = new THREE.SphereGeometry(0.24, 16, 14);
  lSupGeo.scale(1.05, 1.45, 1.05);
  const lSup = new THREE.Mesh(lSupGeo, materials.lung);
  lSup.position.set(0.42, 2.95, 0.08);
  leftLungRoot.add(lSup);

  // Inferior lobe (carved out medially for heart apex)
  const lInfGeo = new THREE.SphereGeometry(0.25, 16, 14);
  lInfGeo.scale(1.1, 1.25, 1.1);
  const lInf = new THREE.Mesh(lInfGeo, materials.lung);
  lInf.position.set(0.44, 2.38, 0.02);
  leftLungRoot.add(lInf);
  lungsGroup.add(leftLungRoot);

  root.add(lungsGroup);

  // 2. TRACHEA & BRONCHIAL TREE
  const tracheaGroup = new THREE.Group();
  tracheaGroup.userData = { structureId: 'trachea', category: 'respiratory', name: 'Trachea & Bronchial Tree' };

  // Trachea Tube
  const tracheaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.75, 0.12),
    new THREE.Vector3(0, 3.4, 0.14),
    new THREE.Vector3(0, 3.05, 0.1),
  ]);
  const tracheaGeo = new THREE.TubeGeometry(tracheaCurve, 16, 0.048, 12, false);
  const tracheaMesh = new THREE.Mesh(tracheaGeo, materials.airway);
  tracheaGroup.add(tracheaMesh);

  // Cartilage rings on trachea (12 stacked rings)
  for (let ring = 0; ring < 10; ring++) {
    const y = 3.7 - ring * 0.065;
    const ringGeo = new THREE.TorusGeometry(0.052, 0.009, 8, 16);
    ringGeo.rotateX(Math.PI / 2);
    const ringMesh = new THREE.Mesh(ringGeo, materials.cartilage);
    ringMesh.position.set(0, y, 0.12);
    tracheaGroup.add(ringMesh);
  }

  // Bifurcation into primary bronchi at Carina
  // Right bronchus: shorter, wider, more vertical
  const rightBronchusCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.05, 0.1),
    new THREE.Vector3(-0.18, 2.92, 0.08),
    new THREE.Vector3(-0.32, 2.8, 0.06),
  ]);
  const rightBronchusGeo = new THREE.TubeGeometry(rightBronchusCurve, 10, 0.034, 8, false);
  const rightBronchus = new THREE.Mesh(rightBronchusGeo, materials.airway);
  tracheaGroup.add(rightBronchus);

  // Left bronchus: longer, narrower, more horizontal
  const leftBronchusCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 3.05, 0.1),
    new THREE.Vector3(0.2, 2.94, 0.08),
    new THREE.Vector3(0.36, 2.85, 0.06),
  ]);
  const leftBronchusGeo = new THREE.TubeGeometry(leftBronchusCurve, 10, 0.028, 8, false);
  const leftBronchus = new THREE.Mesh(leftBronchusGeo, materials.airway);
  tracheaGroup.add(leftBronchus);

  root.add(tracheaGroup);

  // 3. THORACIC DIAPHRAGM
  const diaphragmGroup = new THREE.Group();
  diaphragmGroup.userData = { structureId: 'diaphragm', category: 'respiratory', name: 'Thoracic Diaphragm' };

  // Dome shape with central tendon depression
  const domeGeo = new THREE.SphereGeometry(0.72, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.38);
  domeGeo.scale(1.15, 0.55, 0.95);
  const domeMesh = new THREE.Mesh(domeGeo, materials.diaphragm);
  domeMesh.position.set(0, 2.15, 0.05);
  diaphragmGroup.add(domeMesh);

  root.add(diaphragmGroup);

  return { group: root, lungsGroup };
}
