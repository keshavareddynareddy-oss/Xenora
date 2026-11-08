import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildHeartSpecimen(materials: AnatomyMaterials): {
  group: THREE.Group;
  heartRoot: THREE.Group;
} {
  const root = new THREE.Group();
  root.name = 'heart_specimen_subject';

  const heartRoot = new THREE.Group();
  heartRoot.name = 'heart_pulsing_root';

  // 1. LEFT VENTRICLE
  const lvGroup = new THREE.Group();
  lvGroup.userData = {
    structureId: 'left_ventricle',
    category: 'organ',
    subject: 'heart',
    name: 'Left Ventricle (Myocardium)',
  };
  const lvGeo = new THREE.ConeGeometry(0.75, 1.45, 24);
  lvGeo.scale(1.05, 1.0, 0.9);
  lvGeo.rotateZ(Math.PI); // Point apex down
  const lvMesh = new THREE.Mesh(lvGeo, materials.heart);
  lvMesh.position.set(-0.2, -0.4, 0);
  lvGroup.add(lvMesh);
  heartRoot.add(lvGroup);

  // 2. RIGHT VENTRICLE
  const rvGroup = new THREE.Group();
  rvGroup.userData = {
    structureId: 'right_ventricle',
    category: 'organ',
    subject: 'heart',
    name: 'Right Ventricle',
  };
  const rvGeo = new THREE.ConeGeometry(0.65, 1.25, 20);
  rvGeo.scale(1.15, 1.0, 0.75);
  rvGeo.rotateZ(Math.PI);
  const rvMesh = new THREE.Mesh(rvGeo, materials.muscle);
  rvMesh.position.set(0.35, -0.28, 0.22);
  rvGroup.add(rvMesh);
  heartRoot.add(rvGroup);

  // 3. LEFT ATRIUM
  const laGroup = new THREE.Group();
  laGroup.userData = {
    structureId: 'left_atrium',
    category: 'organ',
    subject: 'heart',
    name: 'Left Atrium & Auricle',
  };
  const laGeo = new THREE.SphereGeometry(0.55, 20, 16);
  laGeo.scale(1.1, 0.9, 0.95);
  const laMesh = new THREE.Mesh(laGeo, materials.heart);
  laMesh.position.set(-0.25, 0.5, -0.25);
  laGroup.add(laMesh);

  // 4 Pulmonary Veins (entering LA)
  const pvPositions = [
    [-0.55, 0.65, -0.3],
    [-0.55, 0.35, -0.3],
    [0.05, 0.65, -0.3],
    [0.05, 0.35, -0.3],
  ];
  pvPositions.forEach((pos) => {
    const pvGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.3, 10);
    pvGeo.rotateZ(Math.PI / 2);
    const pvMesh = new THREE.Mesh(pvGeo, materials.vein);
    pvMesh.position.set(pos[0], pos[1], pos[2]);
    laGroup.add(pvMesh);
  });
  heartRoot.add(laGroup);

  // 4. RIGHT ATRIUM
  const raGroup = new THREE.Group();
  raGroup.userData = {
    structureId: 'right_atrium',
    category: 'organ',
    subject: 'heart',
    name: 'Right Atrium & Caval Inflow',
  };
  const raGeo = new THREE.SphereGeometry(0.55, 20, 16);
  raGeo.scale(1.0, 1.15, 0.95);
  const raMesh = new THREE.Mesh(raGeo, materials.vein);
  raMesh.position.set(0.55, 0.35, 0.05);
  raGroup.add(raMesh);

  // Superior Vena Cava
  const svcGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12);
  const svcMesh = new THREE.Mesh(svcGeo, materials.vein);
  svcMesh.position.set(0.65, 0.95, -0.05);
  raGroup.add(svcMesh);

  // Inferior Vena Cava
  const ivcGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.5, 12);
  const ivcMesh = new THREE.Mesh(ivcGeo, materials.vein);
  ivcMesh.position.set(0.55, -0.35, -0.15);
  raGroup.add(ivcMesh);
  heartRoot.add(raGroup);

  // 5. AORTIC ARCH & OUTFLOW
  const aortaGroup = new THREE.Group();
  aortaGroup.userData = {
    structureId: 'aorta_arch',
    category: 'organ',
    subject: 'heart',
    name: 'Aortic Arch & Ascending Root',
  };
  const aortaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.05, 0.45, 0.05), // Aortic root
    new THREE.Vector3(-0.02, 0.95, 0.08), // Ascending
    new THREE.Vector3(-0.15, 1.35, -0.05), // Summit
    new THREE.Vector3(-0.35, 1.15, -0.25), // Descending
    new THREE.Vector3(-0.4, 0.3, -0.35),
  ]);
  const aortaGeo = new THREE.TubeGeometry(aortaCurve, 24, 0.18, 14, false);
  const aortaMesh = new THREE.Mesh(aortaGeo, materials.artery);
  aortaGroup.add(aortaMesh);

  // Supra-aortic Branches (Brachiocephalic, Carotid, Subclavian)
  const branches = [
    { start: [-0.06, 1.25, 0.04], end: [0.15, 1.75, 0.0] },
    { start: [-0.15, 1.35, -0.02], end: [-0.15, 1.82, -0.02] },
    { start: [-0.25, 1.3, -0.1], end: [-0.4, 1.72, -0.1] },
  ];
  branches.forEach((b) => {
    const c = new THREE.CatmullRomCurve3([
      new THREE.Vector3(b.start[0], b.start[1], b.start[2]),
      new THREE.Vector3(b.end[0], b.end[1], b.end[2]),
    ]);
    const g = new THREE.TubeGeometry(c, 8, 0.065, 8, false);
    const m = new THREE.Mesh(g, materials.artery);
    aortaGroup.add(m);
  });
  heartRoot.add(aortaGroup);

  // 6. PULMONARY TRUNK
  const ptGroup = new THREE.Group();
  ptGroup.userData = {
    structureId: 'pulmonary_trunk',
    category: 'organ',
    subject: 'heart',
    name: 'Pulmonary Trunk & Outflow',
  };
  const ptCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.18, 0.35, 0.22),
    new THREE.Vector3(0.08, 0.85, 0.18),
    new THREE.Vector3(-0.02, 1.05, 0.05),
  ]);
  const ptGeo = new THREE.TubeGeometry(ptCurve, 16, 0.15, 12, false);
  const ptMesh = new THREE.Mesh(ptGeo, materials.vein);
  ptGroup.add(ptMesh);

  // Left & Right pulmonary branch arteries
  for (const sign of [-1, 1]) {
    const pbaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.02, 1.05, 0.05),
      new THREE.Vector3(sign * 0.55, 0.98, -0.2),
    ]);
    const pbaGeo = new THREE.TubeGeometry(pbaCurve, 10, 0.09, 8, false);
    const pbaMesh = new THREE.Mesh(pbaGeo, materials.vein);
    ptGroup.add(pbaMesh);
  }
  heartRoot.add(ptGroup);

  // 7. CORONARY ARTERIES (LAD and RCA sulcal branches)
  const coronaryGroup = new THREE.Group();
  coronaryGroup.userData = {
    structureId: 'coronary_arteries',
    category: 'organ',
    subject: 'heart',
    name: 'Coronary Arterial Circulation',
  };
  // LAD along anterior interventricular sulcus
  const ladCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.05, 0.5, 0.32),
    new THREE.Vector3(0.02, 0.1, 0.38),
    new THREE.Vector3(-0.08, -0.35, 0.28),
    new THREE.Vector3(-0.16, -0.85, 0.12),
  ]);
  const ladGeo = new THREE.TubeGeometry(ladCurve, 16, 0.038, 8, false);
  const ladMesh = new THREE.Mesh(ladGeo, materials.artery);
  coronaryGroup.add(ladMesh);

  // Diagonal branch
  const diagCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.02, 0.1, 0.38),
    new THREE.Vector3(-0.25, -0.15, 0.3),
  ]);
  const diagGeo = new THREE.TubeGeometry(diagCurve, 8, 0.025, 6, false);
  const diagMesh = new THREE.Mesh(diagGeo, materials.artery);
  coronaryGroup.add(diagMesh);

  // Right coronary artery (RCA) in right atrioventricular groove
  const rcaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.2, 0.42, 0.28),
    new THREE.Vector3(0.48, 0.15, 0.22),
    new THREE.Vector3(0.55, -0.2, 0.08),
  ]);
  const rcaGeo = new THREE.TubeGeometry(rcaCurve, 12, 0.035, 8, false);
  const rcaMesh = new THREE.Mesh(rcaGeo, materials.artery);
  coronaryGroup.add(rcaMesh);

  heartRoot.add(coronaryGroup);

  root.add(heartRoot);
  return { group: root, heartRoot };
}
