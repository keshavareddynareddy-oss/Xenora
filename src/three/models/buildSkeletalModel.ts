import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildSkeletalModel(materials: AnatomyMaterials): THREE.Group {
  const root = new THREE.Group();
  root.name = 'skeletal_system';

  // 1. CRANIUM & JAW
  const craniumGroup = new THREE.Group();
  craniumGroup.userData = { structureId: 'cranium', category: 'skeletal', name: 'Cranium & Facial Skeleton' };

  // Calvaria / Cranial Vault (neurocranium)
  const vaultGeo = new THREE.SphereGeometry(0.55, 32, 24);
  vaultGeo.scale(0.85, 1.05, 1.0);
  const vaultMesh = new THREE.Mesh(vaultGeo, materials.bone);
  vaultMesh.position.set(0, 4.45, 0);
  craniumGroup.add(vaultMesh);

  // Facial Skeleton / Maxillary & Orbits
  const faceGeo = new THREE.CylinderGeometry(0.35, 0.3, 0.45, 16);
  faceGeo.scale(0.8, 1, 0.8);
  const faceMesh = new THREE.Mesh(faceGeo, materials.bone);
  faceMesh.position.set(0, 4.05, 0.22);
  craniumGroup.add(faceMesh);

  // Orbits (left & right eye sockets)
  for (const sign of [-1, 1]) {
    const orbitRingGeo = new THREE.TorusGeometry(0.08, 0.02, 12, 24);
    const orbitRing = new THREE.Mesh(orbitRingGeo, materials.bone);
    orbitRing.position.set(sign * 0.18, 4.18, 0.44);
    craniumGroup.add(orbitRing);
  }

  // Mandible (jaw bone)
  const mandibleShape = new THREE.Shape();
  mandibleShape.moveTo(-0.25, 0);
  mandibleShape.quadraticCurveTo(0, -0.22, 0.25, 0);
  mandibleShape.lineTo(0.2, 0.15);
  mandibleShape.quadraticCurveTo(0, -0.08, -0.2, 0.15);
  mandibleShape.closePath();

  const mandibleExtrude = new THREE.ExtrudeGeometry(mandibleShape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  });
  mandibleExtrude.rotateX(Math.PI / 2);
  const mandibleMesh = new THREE.Mesh(mandibleExtrude, materials.bone);
  mandibleMesh.position.set(0, 3.82, 0.18);
  craniumGroup.add(mandibleMesh);

  root.add(craniumGroup);

  // 2. VERTEBRAL COLUMN & SPINE
  const spineGroup = new THREE.Group();
  spineGroup.userData = { structureId: 'spine', category: 'skeletal', name: 'Vertebral Column & Spine' };

  // Generate 24 articulated vertebrae along natural spinal curvature
  const vertebraCount = 24;
  for (let i = 0; i < vertebraCount; i++) {
    const t = i / (vertebraCount - 1);
    // Y extends from 3.7 (cervical) down to 0.8 (lumbar/sacrum)
    const y = 3.7 - t * 2.8;

    // Natural cervical/thoracic/lumbar S-curve
    let z = 0;
    if (t < 0.25) {
      // Cervical lordosis (curves forward slightly)
      z = 0.04 * Math.sin((t / 0.25) * Math.PI);
    } else if (t < 0.75) {
      // Thoracic kyphosis (curves backward)
      z = -0.09 * Math.sin(((t - 0.25) / 0.5) * Math.PI);
    } else {
      // Lumbar lordosis (curves forward)
      z = 0.06 * Math.sin(((t - 0.75) / 0.25) * Math.PI);
    }

    const radius = 0.1 + t * 0.07;
    const height = 0.07;
    const vertGeo = new THREE.CylinderGeometry(radius, radius, height, 16);
    const vertMesh = new THREE.Mesh(vertGeo, materials.bone);
    vertMesh.position.set(0, y, z);
    spineGroup.add(vertMesh);

    // Spinous process (posterior spine protrusion)
    const spinousGeo = new THREE.BoxGeometry(0.04, 0.04, 0.12);
    const spinousMesh = new THREE.Mesh(spinousGeo, materials.bone);
    spinousMesh.position.set(0, y, z - radius - 0.05);
    spinousMesh.rotation.x = 0.2;
    spineGroup.add(spinousMesh);

    // Intervertebral disc (cartilage)
    if (i < vertebraCount - 1) {
      const discGeo = new THREE.CylinderGeometry(radius * 0.95, radius * 0.95, 0.025, 16);
      const discMesh = new THREE.Mesh(discGeo, materials.cartilage);
      discMesh.position.set(0, y - height * 0.6, z);
      spineGroup.add(discMesh);
    }
  }

  // Sacrum & Coccyx wedge
  const sacrumGeo = new THREE.ConeGeometry(0.25, 0.45, 12);
  sacrumGeo.rotateX(Math.PI);
  sacrumGeo.scale(1.1, 1, 0.6);
  const sacrumMesh = new THREE.Mesh(sacrumGeo, materials.bone);
  sacrumMesh.position.set(0, 0.7, -0.05);
  spineGroup.add(sacrumMesh);

  root.add(spineGroup);

  // 3. THORACIC CAGE & STERNUM
  const ribcageGroup = new THREE.Group();
  ribcageGroup.userData = { structureId: 'ribcage', category: 'skeletal', name: 'Thoracic Cage & Sternum' };

  // Sternum (breastbone)
  const manubriumGeo = new THREE.BoxGeometry(0.24, 0.16, 0.06);
  const manubrium = new THREE.Mesh(manubriumGeo, materials.bone);
  manubrium.position.set(0, 3.25, 0.48);
  ribcageGroup.add(manubrium);

  const sternumBodyGeo = new THREE.BoxGeometry(0.18, 0.48, 0.05);
  const sternumBody = new THREE.Mesh(sternumBodyGeo, materials.bone);
  sternumBody.position.set(0, 2.9, 0.46);
  ribcageGroup.add(sternumBody);

  const xiphoidGeo = new THREE.ConeGeometry(0.06, 0.12, 4);
  xiphoidGeo.rotateZ(Math.PI);
  const xiphoid = new THREE.Mesh(xiphoidGeo, materials.cartilage);
  xiphoid.position.set(0, 2.6, 0.44);
  ribcageGroup.add(xiphoid);

  // 12 Paired Ribs
  for (let r = 0; r < 10; r++) {
    const ry = 3.3 - r * 0.09;
    const width = 0.55 + Math.sin((r / 9) * Math.PI) * 0.28;
    const depth = 0.45 + Math.sin((r / 9) * Math.PI) * 0.18;

    for (const sign of [-1, 1]) {
      const curve = new THREE.EllipseCurve(
        0, 0,
        width * 0.9, depth,
        0, Math.PI,
        false,
        0
      );
      const points = curve.getPoints(24);
      // Map 2D ellipse to 3D arc tilted downward laterally
      const rib3DPoints = points.map((p, idx) => {
        const lateralDrop = Math.sin((idx / 24) * Math.PI) * 0.08;
        return new THREE.Vector3(sign * p.x, -lateralDrop, p.y - depth * 0.5);
      });

      const tubeGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rib3DPoints), 20, 0.022, 8, false);
      const ribMesh = new THREE.Mesh(tubeGeo, materials.bone);
      ribMesh.position.set(0, ry, 0.05);
      ribcageGroup.add(ribMesh);
    }
  }

  // Clavicles (collar bones)
  for (const sign of [-1, 1]) {
    const clavicleCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sign * 0.1, 3.38, 0.44),
      new THREE.Vector3(sign * 0.5, 3.42, 0.35),
      new THREE.Vector3(sign * 0.9, 3.35, 0.15),
    ]);
    const clavicleGeo = new THREE.TubeGeometry(clavicleCurve, 16, 0.032, 8, false);
    const clavicleMesh = new THREE.Mesh(clavicleGeo, materials.bone);
    ribcageGroup.add(clavicleMesh);
  }

  root.add(ribcageGroup);

  // 4. PELVIS
  const pelvisGroup = new THREE.Group();
  pelvisGroup.userData = { structureId: 'pelvis', category: 'skeletal', name: 'Pelvic Girdle & Sacrum' };

  for (const sign of [-1, 1]) {
    // Iliac wing crest
    const iliumShape = new THREE.Shape();
    iliumShape.moveTo(0, 0);
    iliumShape.quadraticCurveTo(0.3, 0.4, 0.5, 0.3);
    iliumShape.quadraticCurveTo(0.4, -0.1, 0.1, -0.3);
    iliumShape.closePath();

    const iliumGeo = new THREE.ExtrudeGeometry(iliumShape, {
      depth: 0.18,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    iliumGeo.rotateY(sign * 0.3);
    const iliumMesh = new THREE.Mesh(iliumGeo, materials.bone);
    iliumMesh.position.set(sign * 0.28, 0.55, -0.05);
    pelvisGroup.add(iliumMesh);

    // Pubic & Ischial ring
    const pubicTorus = new THREE.TorusGeometry(0.18, 0.045, 12, 16);
    pubicTorus.rotateX(Math.PI / 3);
    const pubicMesh = new THREE.Mesh(pubicTorus, materials.bone);
    pubicMesh.position.set(sign * 0.26, 0.3, 0.15);
    pelvisGroup.add(pubicMesh);
  }

  root.add(pelvisGroup);

  // 5. HUMERUS, RADIUS, ULNA (Bilateral Upper Limbs)
  const humerusGroup = new THREE.Group();
  humerusGroup.userData = { structureId: 'humerus', category: 'skeletal', name: 'Humerus & Upper Limb Bones' };

  for (const sign of [-1, 1]) {
    // Humeral Head (glenohumeral joint)
    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    const headMesh = new THREE.Mesh(headGeo, materials.bone);
    headMesh.position.set(sign * 1.0, 3.28, 0.08);
    humerusGroup.add(headMesh);

    // Humeral Shaft
    const humerusShaftGeo = new THREE.CylinderGeometry(0.045, 0.04, 0.85, 12);
    const humerusMesh = new THREE.Mesh(humerusShaftGeo, materials.bone);
    humerusMesh.position.set(sign * 1.1, 2.8, 0.05);
    humerusMesh.rotation.z = -sign * 0.12;
    humerusGroup.add(humerusMesh);

    // Elbow Condyles
    const condyleGeo = new THREE.BoxGeometry(0.14, 0.08, 0.08);
    const condyleMesh = new THREE.Mesh(condyleGeo, materials.bone);
    condyleMesh.position.set(sign * 1.18, 2.34, 0.02);
    humerusGroup.add(condyleMesh);

    // Forearm: Radius & Ulna
    const radiusShaftGeo = new THREE.CylinderGeometry(0.032, 0.028, 0.75, 10);
    const radiusMesh = new THREE.Mesh(radiusShaftGeo, materials.bone);
    radiusMesh.position.set(sign * 1.25, 1.9, 0.04);
    radiusMesh.rotation.z = -sign * 0.08;
    humerusGroup.add(radiusMesh);

    const ulnaShaftGeo = new THREE.CylinderGeometry(0.035, 0.025, 0.78, 10);
    const ulnaMesh = new THREE.Mesh(ulnaShaftGeo, materials.bone);
    ulnaMesh.position.set(sign * 1.18, 1.88, -0.02);
    ulnaMesh.rotation.z = -sign * 0.08;
    humerusGroup.add(ulnaMesh);
  }

  root.add(humerusGroup);

  // 6. FEMUR, PATELLA, TIBIA, FIBULA (Bilateral Lower Limbs)
  const femurGroup = new THREE.Group();
  femurGroup.userData = { structureId: 'femur', category: 'skeletal', name: 'Femur & Lower Extremity Bones' };

  for (const sign of [-1, 1]) {
    // Femoral Head (fits in acetabulum)
    const fHeadGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const fHeadMesh = new THREE.Mesh(fHeadGeo, materials.bone);
    fHeadMesh.position.set(sign * 0.42, 0.35, 0.05);
    femurGroup.add(fHeadMesh);

    // Femoral Neck (125 degree angle)
    const neckCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(sign * 0.42, 0.35, 0.05),
      new THREE.Vector3(sign * 0.62, 0.28, 0.02),
    ]);
    const neckGeo = new THREE.TubeGeometry(neckCurve, 8, 0.055, 10, false);
    const neckMesh = new THREE.Mesh(neckGeo, materials.bone);
    femurGroup.add(neckMesh);

    // Greater Trochanter
    const trochGeo = new THREE.BoxGeometry(0.12, 0.14, 0.12);
    const trochMesh = new THREE.Mesh(trochGeo, materials.bone);
    trochMesh.position.set(sign * 0.65, 0.25, 0.0);
    femurGroup.add(trochMesh);

    // Femoral Shaft (slight physiological valgus angle)
    const fShaftGeo = new THREE.CylinderGeometry(0.065, 0.058, 1.45, 16);
    const fShaftMesh = new THREE.Mesh(fShaftGeo, materials.bone);
    fShaftMesh.position.set(sign * 0.55, -0.55, 0.05);
    fShaftMesh.rotation.z = sign * 0.08;
    femurGroup.add(fShaftMesh);

    // Distal Femoral Condyles & Knee
    const condyleGeo = new THREE.BoxGeometry(0.24, 0.14, 0.18);
    const condyleMesh = new THREE.Mesh(condyleGeo, materials.bone);
    condyleMesh.position.set(sign * 0.48, -1.3, 0.05);
    femurGroup.add(condyleMesh);

    // Patella (kneecap)
    const patellaGeo = new THREE.SphereGeometry(0.08, 16, 12);
    patellaGeo.scale(1.0, 1.2, 0.5);
    const patellaMesh = new THREE.Mesh(patellaGeo, materials.bone);
    patellaMesh.position.set(sign * 0.48, -1.3, 0.18);
    femurGroup.add(patellaMesh);

    // Tibia (shin bone)
    const tibiaGeo = new THREE.CylinderGeometry(0.075, 0.05, 1.4, 14);
    const tibiaMesh = new THREE.Mesh(tibiaGeo, materials.bone);
    tibiaMesh.position.set(sign * 0.48, -2.1, 0.05);
    femurGroup.add(tibiaMesh);

    // Fibula (lateral slender stabilizer)
    const fibulaGeo = new THREE.CylinderGeometry(0.025, 0.022, 1.35, 10);
    const fibulaMesh = new THREE.Mesh(fibulaGeo, materials.bone);
    fibulaMesh.position.set(sign * 0.62, -2.1, 0.0);
    femurGroup.add(fibulaMesh);
  }

  root.add(femurGroup);

  return root;
}
