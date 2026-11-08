import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildConcreteModel(materials: AnatomyMaterials): THREE.Group {
  const colGroup = new THREE.Group();
  colGroup.name = 'subject_reinforced_concrete';

  const colHeight = 4.2;
  const colWidth = 1.4;

  // 1. Translucent Concrete Matrix (Cutaway outer structural envelope)
  const concreteGeo = new THREE.BoxGeometry(colWidth, colHeight, colWidth);
  const concreteMesh = new THREE.Mesh(concreteGeo, materials.concreteMatrix);
  concreteMesh.position.y = 0.5;
  concreteMesh.userData = {
    structureId: 'rc_concrete_matrix',
    name: 'Cast-in-Place Concrete Matrix & Aggregate',
    topic: 'reinforced_concrete',
  };
  colGroup.add(concreteMesh);

  // 2. Foundation Footing Pad (Base spread footing)
  const footingGeo = new THREE.BoxGeometry(3.4, 0.8, 3.4);
  const footing = new THREE.Mesh(footingGeo, materials.concreteMatrix);
  footing.position.y = -colHeight / 2 - 0.2;
  footing.userData = {
    structureId: 'rc_footing_pad',
    name: 'Reinforced Spread Footing & Foundation Pad',
    topic: 'reinforced_concrete',
  };
  colGroup.add(footing);

  // 3. Longitudinal Deformed Steel Rebars (8 vertical high-strength bars)
  const rebarGroup = new THREE.Group();
  const barRadius = 0.055;
  const offsets = [
    [-0.45, -0.45],
    [0, -0.45],
    [0.45, -0.45],
    [-0.45, 0.45],
    [0, 0.45],
    [0.45, 0.45],
    [-0.45, 0],
    [0.45, 0],
  ];

  offsets.forEach(([rx, rz]) => {
    // Vertical bar extending into footing with 90 deg hook
    const barGeo = new THREE.CylinderGeometry(barRadius, barRadius, colHeight + 0.6, 12);
    const bar = new THREE.Mesh(barGeo, materials.rebarSteel);
    bar.position.set(rx, 0.3, rz);
    rebarGroup.add(bar);

    // Footing starter dowel bend
    const hookGeo = new THREE.CylinderGeometry(barRadius, barRadius, 0.6, 12);
    const hook = new THREE.Mesh(hookGeo, materials.rebarSteel);
    hook.rotation.z = Math.PI / 2;
    hook.position.set(rx > 0 ? rx + 0.25 : rx - 0.25, -colHeight / 2 - 0.1, rz);
    rebarGroup.add(hook);
  });

  rebarGroup.userData = {
    structureId: 'rc_longitudinal_rebar',
    name: 'Longitudinal High-Yield Rebar Cage (Grade 60)',
    topic: 'reinforced_concrete',
  };
  colGroup.add(rebarGroup);

  // 4. Transverse Lateral Ties & Spiral Stirrups (Shear reinforcement)
  const stirrupGroup = new THREE.Group();
  const stirrupCount = 14;
  for (let s = 0; s < stirrupCount; s++) {
    const sy = -colHeight / 2 + 0.4 + s * (colHeight / stirrupCount);

    // Rectangular hoop tie
    const hoopPoints = [
      new THREE.Vector3(-0.48, sy, -0.48),
      new THREE.Vector3(0.48, sy, -0.48),
      new THREE.Vector3(0.48, sy, 0.48),
      new THREE.Vector3(-0.48, sy, 0.48),
      new THREE.Vector3(-0.48, sy, -0.48),
    ];
    const hoopGeo = new THREE.BufferGeometry().setFromPoints(hoopPoints);
    const hoopLine = new THREE.Line(hoopGeo, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 }));
    stirrupGroup.add(hoopLine);

    // 135-degree seismic seismic hook detail at corner
    const hookPoints = [
      new THREE.Vector3(-0.48, sy, -0.48),
      new THREE.Vector3(-0.35, sy, -0.35),
    ];
    const hookLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(hookPoints),
      new THREE.LineBasicMaterial({ color: 0x38bdf8 })
    );
    stirrupGroup.add(hookLine);
  }

  stirrupGroup.userData = {
    structureId: 'rc_shear_stirrups',
    name: 'Transverse Lateral Ties & Seismic Shear Stirrups',
    topic: 'reinforced_concrete',
  };
  colGroup.add(stirrupGroup);

  // 5. Compressive Stress Lines & Concrete Cover Layer
  const coverGroup = new THREE.Group();
  const coverBorderGeo = new THREE.BoxGeometry(colWidth + 0.05, 0.1, colWidth + 0.05);
  const coverBorder = new THREE.Mesh(coverBorderGeo, materials.steel);
  coverBorder.position.y = colHeight / 2 + 0.5;
  coverGroup.add(coverBorder);

  coverGroup.userData = {
    structureId: 'rc_concrete_cover',
    name: 'Protective Concrete Cover (40mm Corrosion Barrier)',
    topic: 'reinforced_concrete',
  };
  colGroup.add(coverGroup);

  return colGroup;
}
