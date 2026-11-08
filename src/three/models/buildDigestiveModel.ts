import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildDigestiveModel(materials: AnatomyMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'digestive_system';

  // 1. STOMACH (Curved J-shape in left upper quadrant)
  const stomachGroup = new THREE.Group();
  stomachGroup.userData = { structureId: 'stomach', category: 'digestive', name: 'Stomach & Gastric Rugae' };

  // Fundus (superior rounded dome)
  const fundusGeo = new THREE.SphereGeometry(0.18, 16, 14);
  fundusGeo.scale(1.2, 0.9, 1.0);
  const fundusMesh = new THREE.Mesh(fundusGeo, materials.stomach);
  fundusMesh.position.set(0.18, 1.95, 0.16);
  stomachGroup.add(fundusMesh);

  // Body of Stomach (curving downwards)
  const bodyGeo = new THREE.CylinderGeometry(0.19, 0.14, 0.45, 16);
  bodyGeo.scale(1.15, 1.0, 0.9);
  const bodyMesh = new THREE.Mesh(bodyGeo, materials.stomach);
  bodyMesh.position.set(0.16, 1.72, 0.2);
  bodyMesh.rotation.z = 0.25;
  bodyMesh.rotation.x = -0.15;
  stomachGroup.add(bodyMesh);

  // Pylorus & Antrum (narrowing horizontally towards duodenum)
  const pylorusCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.12, 1.52, 0.2),
    new THREE.Vector3(0.02, 1.54, 0.22),
    new THREE.Vector3(-0.08, 1.62, 0.2),
  ]);
  const pylorusGeo = new THREE.TubeGeometry(pylorusCurve, 10, 0.07, 10, false);
  const pylorusMesh = new THREE.Mesh(pylorusGeo, materials.stomach);
  stomachGroup.add(pylorusMesh);

  root.add(stomachGroup);

  // 2. LIVER & GALLBLADDER
  const liverGroup = new THREE.Group();
  liverGroup.userData = { structureId: 'liver', category: 'digestive', name: 'Liver & Gallbladder' };

  // Massive Right Lobe (wedge-shaped)
  const rLobeGeo = new THREE.SphereGeometry(0.36, 20, 16);
  rLobeGeo.scale(1.3, 0.9, 0.85);
  const rLobeMesh = new THREE.Mesh(rLobeGeo, materials.liver);
  rLobeMesh.position.set(-0.32, 1.95, 0.18);
  rLobeMesh.rotation.z = -0.15;
  rLobeMesh.rotation.y = -0.2;
  liverGroup.add(rLobeMesh);

  // Left Lobe (flattened wedge crossing midline)
  const lLobeGeo = new THREE.ConeGeometry(0.24, 0.42, 16);
  lLobeGeo.scale(1.2, 0.7, 0.6);
  lLobeGeo.rotateZ(Math.PI / 2.3);
  const lLobeMesh = new THREE.Mesh(lLobeGeo, materials.liver);
  lLobeMesh.position.set(-0.06, 2.05, 0.2);
  liverGroup.add(lLobeMesh);

  // Gallbladder (pear-shaped sac nestled under liver visceral surface)
  const gbGeo = new THREE.SphereGeometry(0.075, 12, 10);
  gbGeo.scale(0.8, 1.5, 0.9);
  const gbMesh = new THREE.Mesh(gbGeo, materials.gallbladder);
  gbMesh.position.set(-0.25, 1.72, 0.26);
  gbMesh.rotation.x = 0.3;
  liverGroup.add(gbMesh);

  root.add(liverGroup);

  // 3. PANCREAS (Retroperitoneal behind stomach, head in duodenal C-loop)
  const pancreasGroup = new THREE.Group();
  pancreasGroup.userData = { structureId: 'pancreas', category: 'digestive', name: 'Pancreas & Ductal System' };

  // Head of pancreas
  const pHeadGeo = new THREE.SphereGeometry(0.11, 14, 12);
  pHeadGeo.scale(1.1, 1.2, 0.7);
  const pHead = new THREE.Mesh(pHeadGeo, materials.pancreas);
  pHead.position.set(-0.06, 1.62, 0.12);
  pancreasGroup.add(pHead);

  // Body and Tail extending to the left towards spleen
  const pBodyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.05, 1.65, 0.12),
    new THREE.Vector3(0.12, 1.7, 0.1),
    new THREE.Vector3(0.28, 1.76, 0.06),
  ]);
  const pBodyGeo = new THREE.TubeGeometry(pBodyCurve, 12, 0.05, 8, false);
  const pBody = new THREE.Mesh(pBodyGeo, materials.pancreas);
  pancreasGroup.add(pBody);

  root.add(pancreasGroup);

  // 4. SMALL INTESTINE (Duodenum, Jejunum, Ileum coils)
  const smallIntestineGroup = new THREE.Group();
  smallIntestineGroup.userData = {
    structureId: 'small_intestine',
    category: 'digestive',
    name: 'Small Intestine (Duodenum, Jejunum, Ileum)',
  };

  // Coiled loops arranged inside abdominal center
  const loopsCount = 14;
  for (let i = 0; i < loopsCount; i++) {
    const angle = (i / loopsCount) * Math.PI * 4;
    const r = 0.12 + (i / loopsCount) * 0.16;
    const x = Math.cos(angle) * r;
    const z = 0.24 + Math.sin(angle) * 0.08;
    const y = 1.35 - (i / loopsCount) * 0.45;

    const loopGeo = new THREE.TorusGeometry(0.075, 0.038, 8, 12);
    loopGeo.rotateX(Math.PI / 3);
    loopGeo.rotateY((i * Math.PI) / 4);
    const loopMesh = new THREE.Mesh(loopGeo, materials.smallIntestine);
    loopMesh.position.set(x, y, z);
    smallIntestineGroup.add(loopMesh);
  }

  root.add(smallIntestineGroup);

  // 5. LARGE INTESTINE (Colon & Rectum framing abdominal perimeter)
  const colonGroup = new THREE.Group();
  colonGroup.userData = { structureId: 'colon', category: 'digestive', name: 'Large Intestine (Colon & Rectum)' };

  // Colon framing path: Cecum (RLQ) -> Ascending -> Hepatic flexure -> Transverse -> Splenic flexure -> Descending -> Sigmoid
  const colonCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.35, 0.85, 0.24), // Cecum & Appendix
    new THREE.Vector3(-0.36, 1.25, 0.22), // Ascending colon
    new THREE.Vector3(-0.34, 1.62, 0.2), // Hepatic flexure
    new THREE.Vector3(0.0, 1.68, 0.28), // Transverse colon
    new THREE.Vector3(0.35, 1.65, 0.18), // Splenic flexure
    new THREE.Vector3(0.36, 1.25, 0.2), // Descending colon
    new THREE.Vector3(0.32, 0.85, 0.22), // Iliac crest transition
    new THREE.Vector3(0.15, 0.65, 0.15), // Sigmoid loop
    new THREE.Vector3(0.0, 0.5, 0.08), // Rectum
  ]);

  const colonGeo = new THREE.TubeGeometry(colonCurve, 36, 0.068, 10, false);
  const colonMesh = new THREE.Mesh(colonGeo, materials.colon);
  colonGroup.add(colonMesh);

  // Haustral sacculations (rings along the colon tube)
  const colonPoints = colonCurve.getPoints(24);
  colonPoints.forEach((pt, idx) => {
    if (idx % 2 === 0) {
      const ringGeo = new THREE.TorusGeometry(0.072, 0.012, 6, 12);
      const ringMesh = new THREE.Mesh(ringGeo, materials.colon);
      ringMesh.position.copy(pt);
      colonGroup.add(ringMesh);
    }
  });

  root.add(colonGroup);

  return root;
}
