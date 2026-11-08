import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export interface TrussBridgeAnimationRefs {
  loadArrows: THREE.Group;
}

export function buildTrussBridgeModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  animRefs: TrussBridgeAnimationRefs;
} {
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = 'subject_truss_bridge';

  const bridgeSpan = 7.2;
  const trussHeight = 1.6;
  const numPanels = 6;
  const panelWidth = bridgeSpan / numPanels; // 1.2
  const bridgeWidth = 1.8;

  // 1. Roadway Deck (Asphalt / Concrete Deck)
  const deckGeo = new THREE.BoxGeometry(bridgeSpan + 0.8, 0.2, bridgeWidth + 0.4);
  const deck = new THREE.Mesh(deckGeo, materials.castIron);
  deck.position.set(0, 0, 0);
  deck.userData = {
    structureId: 'truss_roadway_deck',
    name: 'Reinforced Roadway Deck & Traffic Lanes',
    topic: 'truss_bridge',
  };
  bridgeGroup.add(deck);

  // Deck Centerline Lane Markings
  for (let m = -2.5; m <= 2.5; m += 1.0) {
    const markGeo = new THREE.PlaneGeometry(0.5, 0.08);
    const mark = new THREE.Mesh(markGeo, materials.bone);
    mark.rotation.x = -Math.PI / 2;
    mark.position.set(m, 0.11, 0);
    bridgeGroup.add(mark);
  }

  // 2. Bottom Chords (Under Tension - Cyan/Blue)
  const botChordGroup = new THREE.Group();
  [-bridgeWidth / 2, bridgeWidth / 2].forEach((zPos) => {
    const chordGeo = new THREE.CylinderGeometry(0.08, 0.08, bridgeSpan, 12);
    const chord = new THREE.Mesh(chordGeo, materials.trussTension);
    chord.rotation.z = Math.PI / 2;
    chord.position.set(0, 0.1, zPos);
    botChordGroup.add(chord);
  });
  botChordGroup.userData = {
    structureId: 'truss_bottom_chord',
    name: 'Bottom Tension Chords (Tensile Stress)',
    topic: 'truss_bridge',
  };
  bridgeGroup.add(botChordGroup);

  // 3. Top Chords (Under Compression - Rose/Red)
  const topChordGroup = new THREE.Group();
  const topSpan = bridgeSpan - panelWidth * 2;
  [-bridgeWidth / 2, bridgeWidth / 2].forEach((zPos) => {
    const chordGeo = new THREE.CylinderGeometry(0.1, 0.1, topSpan, 12);
    const chord = new THREE.Mesh(chordGeo, materials.trussCompression);
    chord.rotation.z = Math.PI / 2;
    chord.position.set(0, trussHeight, zPos);
    topChordGroup.add(chord);
  });
  topChordGroup.userData = {
    structureId: 'truss_top_chord',
    name: 'Top Compression Chords (Compressive Stress)',
    topic: 'truss_bridge',
  };
  bridgeGroup.add(topChordGroup);

  // 4. Web Members (Diagonals & Verticals with Gusset Plate Connections)
  const webGroup = new THREE.Group();

  [-bridgeWidth / 2, bridgeWidth / 2].forEach((zPos) => {
    // End diagonal compression posts
    const endDiagLength = Math.hypot(panelWidth, trussHeight);
    const endDiagAngle = Math.atan2(trussHeight, panelWidth);

    // Left inclined post
    const end1Geo = new THREE.CylinderGeometry(0.09, 0.09, endDiagLength, 12);
    const end1 = new THREE.Mesh(end1Geo, materials.trussCompression);
    end1.position.set(-bridgeSpan / 2 + panelWidth / 2, trussHeight / 2, zPos);
    end1.rotation.z = -endDiagAngle + Math.PI / 2;
    webGroup.add(end1);

    // Right inclined post
    const end2 = new THREE.Mesh(end1Geo, materials.trussCompression);
    end2.position.set(bridgeSpan / 2 - panelWidth / 2, trussHeight / 2, zPos);
    end2.rotation.z = endDiagAngle - Math.PI / 2;
    webGroup.add(end2);

    // Interior Warren / Pratt diagonals and verticals
    for (let p = 1; p < numPanels - 1; p++) {
      const x = -bridgeSpan / 2 + p * panelWidth;

      // Vertical Strut
      const vertGeo = new THREE.CylinderGeometry(0.06, 0.06, trussHeight, 12);
      const vert = new THREE.Mesh(vertGeo, materials.steel);
      vert.position.set(x, trussHeight / 2, zPos);
      webGroup.add(vert);

      // Alternating Diagonals
      const diagGeo = new THREE.CylinderGeometry(0.065, 0.065, endDiagLength, 12);
      const isCompression = p % 2 === 0;
      const diag = new THREE.Mesh(
        diagGeo,
        isCompression ? materials.trussCompression : materials.trussTension
      );
      diag.position.set(x + panelWidth / 2, trussHeight / 2, zPos);
      diag.rotation.z = (p % 2 === 0 ? 1 : -1) * (endDiagAngle - Math.PI / 2);
      webGroup.add(diag);
    }
  });

  // Transverse Top Sway Bracing
  for (let p = 1; p < numPanels - 1; p++) {
    const x = -bridgeSpan / 2 + p * panelWidth;
    const swayGeo = new THREE.CylinderGeometry(0.05, 0.05, bridgeWidth, 8);
    const sway = new THREE.Mesh(swayGeo, materials.steel);
    sway.rotation.x = Math.PI / 2;
    sway.position.set(x, trussHeight, 0);
    webGroup.add(sway);
  }

  webGroup.userData = {
    structureId: 'truss_web_members',
    name: 'Diagonal & Vertical Web Trusses & Gussets',
    topic: 'truss_bridge',
  };
  bridgeGroup.add(webGroup);

  // 5. Abutment Piers & Foundation Bearings (Ground Supports)
  const pierGroup = new THREE.Group();
  [-bridgeSpan / 2 - 0.2, bridgeSpan / 2 + 0.2].forEach((xPos) => {
    const pierGeo = new THREE.BoxGeometry(0.8, 1.8, bridgeWidth + 0.8);
    const pier = new THREE.Mesh(pierGeo, materials.concreteMatrix);
    pier.position.set(xPos, -0.9, 0);
    pierGroup.add(pier);

    // Elastomeric Bearing Pad
    const padGeo = new THREE.BoxGeometry(0.6, 0.15, bridgeWidth + 0.4);
    const pad = new THREE.Mesh(padGeo, materials.steel);
    pad.position.set(xPos, -0.05, 0);
    pierGroup.add(pad);
  });
  pierGroup.userData = {
    structureId: 'truss_pier_foundations',
    name: 'Concrete Abutment Piers & Elastomeric Bearings',
    topic: 'truss_bridge',
  };
  bridgeGroup.add(pierGroup);

  // 6. Dynamic Vehicle Load Vectors (Moving Force Arrows)
  const loadArrows = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const arrowHelper = new THREE.ArrowHelper(
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(-1.2 + i * 1.2, 1.2, 0),
      0.9,
      0xfacc15,
      0.3,
      0.15
    );
    loadArrows.add(arrowHelper);
  }
  loadArrows.userData = {
    structureId: 'truss_dynamic_load',
    name: 'Traffic Live Load Distribution Vectors (W_LL)',
    topic: 'truss_bridge',
  };
  bridgeGroup.add(loadArrows);

  return {
    group: bridgeGroup,
    animRefs: {
      loadArrows,
    },
  };
}
