import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export interface NeuralNetAnimationRefs {
  synapsePulses: THREE.Points;
  nodeMeshes: THREE.Mesh[];
}

export function buildNeuralNetModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  animRefs: NeuralNetAnimationRefs;
} {
  const nnGroup = new THREE.Group();
  nnGroup.name = 'subject_neural_network_3d';

  // Layers configuration: [Input (4), Hidden1 (5), Hidden2 (5), Output (2)]
  const layerCounts = [4, 5, 5, 2];
  const layerXPositions = [-3.0, -1.0, 1.0, 3.0];
  const layerNames = [
    'Input Feature Layer (x1..x4)',
    'Hidden Dense Layer 1 (ReLU)',
    'Hidden Dense Layer 2 (ReLU)',
    'Output Softmax Probabilities',
  ];
  const structureIds = [
    'nn_input_layer',
    'nn_hidden_layer_1',
    'nn_hidden_layer_2',
    'nn_output_layer',
  ];

  const nodePositions: THREE.Vector3[][] = [];
  const allNodeMeshes: THREE.Mesh[] = [];

  // 1. Create Nodes per Layer
  layerCounts.forEach((count, lIdx) => {
    const lx = layerXPositions[lIdx];
    const layerNodes: THREE.Vector3[] = [];
    const layerGroup = new THREE.Group();

    for (let n = 0; n < count; n++) {
      const ny = (n - (count - 1) / 2) * 1.05;
      const nz = 0;
      const pos = new THREE.Vector3(lx, ny, nz);
      layerNodes.push(pos);

      // Node Sphere
      const isInput = lIdx === 0;
      const isOutput = lIdx === layerCounts.length - 1;
      const nodeGeo = new THREE.SphereGeometry(0.24, 24, 24);
      const nodeMesh = new THREE.Mesh(
        nodeGeo,
        isOutput ? materials.brass : isInput ? materials.highlight : materials.neuralNodeActive
      );
      nodeMesh.position.copy(pos);
      layerGroup.add(nodeMesh);
      allNodeMeshes.push(nodeMesh);

      // Orbital Halo Ring
      const haloGeo = new THREE.TorusGeometry(0.32, 0.02, 8, 24);
      const halo = new THREE.Mesh(haloGeo, materials.synapseAxon);
      halo.position.copy(pos);
      halo.rotation.y = Math.PI / 4;
      layerGroup.add(halo);
    }

    layerGroup.userData = {
      structureId: structureIds[lIdx],
      name: layerNames[lIdx],
      topic: 'neural_network_3d',
    };
    nnGroup.add(layerGroup);
    nodePositions.push(layerNodes);
  });

  // 2. Synaptic Weight Connections (Lines connecting adjacent layers)
  const synapseGroup = new THREE.Group();
  const pulseTrajectoryPoints: THREE.Vector3[] = [];

  for (let l = 0; l < layerCounts.length - 1; l++) {
    const currentLayer = nodePositions[l];
    const nextLayer = nodePositions[l + 1];

    currentLayer.forEach((fromPos) => {
      nextLayer.forEach((toPos) => {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([fromPos, toPos]);
        const line = new THREE.Line(lineGeo, materials.synapseAxon);
        synapseGroup.add(line);

        // Sample intermediate points for animation
        for (let s = 1; s <= 3; s++) {
          pulseTrajectoryPoints.push(new THREE.Vector3().lerpVectors(fromPos, toPos, s / 4));
        }
      });
    });
  }

  synapseGroup.userData = {
    structureId: 'nn_synaptic_weights',
    name: 'Learnable Synaptic Weights & Biases (W_ij)',
    topic: 'neural_network_3d',
  };
  nnGroup.add(synapseGroup);

  // 3. Dynamic Signal Forward-Pass Pulses (Glowing particles)
  const pulseCount = 120;
  const pulseGeo = new THREE.BufferGeometry();
  const pulseCoords = new Float32Array(pulseCount * 3);

  for (let p = 0; p < pulseCount; p++) {
    const pt = pulseTrajectoryPoints[p % pulseTrajectoryPoints.length] || new THREE.Vector3();
    pulseCoords[p * 3] = pt.x + (Math.random() - 0.5) * 0.1;
    pulseCoords[p * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.1;
    pulseCoords[p * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.1;
  }

  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulseCoords, 3));
  const pulseMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.12,
    transparent: true,
    opacity: 0.95,
  });

  const synapsePulses = new THREE.Points(pulseGeo, pulseMat);
  synapsePulses.userData = {
    structureId: 'nn_activation_propagation',
    name: 'Feed-Forward Tensor Activation Signals (a = σ(z))',
    topic: 'neural_network_3d',
  };
  nnGroup.add(synapsePulses);

  return {
    group: nnGroup,
    animRefs: {
      synapsePulses,
      nodeMeshes: allNodeMeshes,
    },
  };
}
