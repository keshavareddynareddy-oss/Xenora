import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export interface TreeAnimationRefs {
  searchPointer: THREE.Mesh;
}

interface TreeNodeDef {
  id: string;
  val: number;
  label: string;
  x: number;
  y: number;
  z: number;
  isRoot?: boolean;
  parentId?: string;
  structureId: string;
  name: string;
}

export function buildTreeModel(materials: AnatomyMaterials): {
  group: THREE.Group;
  animRefs: TreeAnimationRefs;
} {
  const treeGroup = new THREE.Group();
  treeGroup.name = 'subject_binary_search_tree';

  // 3-Level Balanced BST
  //              [50]
  //        [25]        [75]
  //     [12]  [37]  [62]  [88]
  const nodes: TreeNodeDef[] = [
    { id: 'n50', val: 50, label: 'Root (50)', x: 0, y: 1.8, z: 0, isRoot: true, structureId: 'bst_root_node', name: 'BST Root Node [50]' },
    { id: 'n25', val: 25, label: 'L-Child (25)', x: -1.8, y: 0.6, z: 0, parentId: 'n50', structureId: 'bst_left_subtree', name: 'Left Subtree Root [25] (Keys < 50)' },
    { id: 'n75', val: 75, label: 'R-Child (75)', x: 1.8, y: 0.6, z: 0, parentId: 'n50', structureId: 'bst_right_subtree', name: 'Right Subtree Root [75] (Keys > 50)' },
    { id: 'n12', val: 12, label: 'Leaf (12)', x: -2.7, y: -0.8, z: 0, parentId: 'n25', structureId: 'bst_left_subtree', name: 'Leaf Node [12] (Min Key)' },
    { id: 'n37', val: 37, label: 'Leaf (37)', x: -0.9, y: -0.8, z: 0, parentId: 'n25', structureId: 'bst_left_subtree', name: 'Inner Left Node [37]' },
    { id: 'n62', val: 62, label: 'Leaf (62)', x: 0.9, y: -0.8, z: 0, parentId: 'n75', structureId: 'bst_right_subtree', name: 'Inner Right Node [62]' },
    { id: 'n88', val: 88, label: 'Leaf (88)', x: 2.7, y: -0.8, z: 0, parentId: 'n75', structureId: 'bst_right_subtree', name: 'Leaf Node [88] (Max Key)' },
  ];

  const nodeMap = new Map<string, TreeNodeDef>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  // 1. Draw Branch Connections
  const branchGroup = new THREE.Group();
  nodes.forEach((n) => {
    if (n.parentId) {
      const p = nodeMap.get(n.parentId)!;
      const points = [new THREE.Vector3(p.x, p.y, p.z), new THREE.Vector3(n.x, n.y, n.z)];
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 12, 0.05, 8, false);
      const tube = new THREE.Mesh(tubeGeo, materials.steel);
      branchGroup.add(tube);
    }
  });
  branchGroup.userData = {
    structureId: 'bst_branch_pointers',
    name: 'Recursive Pointer Edges (Left & Right Links)',
    topic: 'binary_search_tree',
  };
  treeGroup.add(branchGroup);

  // 2. Draw Nodes
  nodes.forEach((n) => {
    const nodeSubGroup = new THREE.Group();
    const nodeGeo = new THREE.SphereGeometry(0.38, 24, 24);
    const nodeMesh = new THREE.Mesh(
      nodeGeo,
      n.isRoot ? materials.brass : n.val < 50 ? materials.trussTension : materials.trussCompression
    );
    nodeMesh.position.set(n.x, n.y, n.z);
    nodeSubGroup.add(nodeMesh);

    // Encircling Valency Ring
    const ringGeo = new THREE.TorusGeometry(0.48, 0.025, 8, 24);
    const ring = new THREE.Mesh(ringGeo, materials.chrome);
    ring.position.set(n.x, n.y, n.z);
    nodeSubGroup.add(ring);

    nodeSubGroup.userData = {
      structureId: n.structureId,
      name: n.name,
      topic: 'binary_search_tree',
    };
    treeGroup.add(nodeSubGroup);
  });

  // 3. Animated Search Traversal Marker (Glowing cursor tracing search for key 37)
  const pointerGeo = new THREE.ConeGeometry(0.2, 0.5, 16);
  const pointerMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: 0xeab308,
    emissiveIntensity: 1.0,
  });
  const searchPointer = new THREE.Mesh(pointerGeo, pointerMat);
  searchPointer.rotation.x = Math.PI;
  searchPointer.position.set(0, 2.5, 0);
  searchPointer.userData = {
    structureId: 'bst_search_traversal',
    name: 'Binary Search Traversal Cursor O(log n)',
    topic: 'binary_search_tree',
  };
  treeGroup.add(searchPointer);

  return {
    group: treeGroup,
    animRefs: {
      searchPointer,
    },
  };
}
