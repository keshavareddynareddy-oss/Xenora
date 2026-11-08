import * as THREE from 'three';

export interface AnatomyMaterials {
  // Biological materials
  bone: THREE.MeshStandardMaterial;
  cartilage: THREE.MeshStandardMaterial;
  muscle: THREE.MeshStandardMaterial;
  nerve: THREE.MeshStandardMaterial;
  nerveRoot: THREE.MeshStandardMaterial;
  artery: THREE.MeshStandardMaterial;
  vein: THREE.MeshStandardMaterial;
  heart: THREE.MeshStandardMaterial;
  lung: THREE.MeshStandardMaterial;
  airway: THREE.MeshStandardMaterial;
  stomach: THREE.MeshStandardMaterial;
  liver: THREE.MeshStandardMaterial;
  gallbladder: THREE.MeshStandardMaterial;
  pancreas: THREE.MeshStandardMaterial;
  smallIntestine: THREE.MeshStandardMaterial;
  colon: THREE.MeshStandardMaterial;
  diaphragm: THREE.MeshStandardMaterial;
  highlight: THREE.MeshStandardMaterial;
  dimmed: THREE.MeshStandardMaterial;

  // Engineering & Physical materials
  steel: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  castIron: THREE.MeshStandardMaterial;
  brass: THREE.MeshStandardMaterial;
  copperCoil: THREE.MeshStandardMaterial;
  aluminum: THREE.MeshStandardMaterial;
  siliconDie: THREE.MeshStandardMaterial;
  pcbSubstrate: THREE.MeshStandardMaterial;
  pcbTraces: THREE.MeshStandardMaterial;
  concreteMatrix: THREE.MeshStandardMaterial;
  rebarSteel: THREE.MeshStandardMaterial;
  trussCompression: THREE.MeshStandardMaterial;
  trussTension: THREE.MeshStandardMaterial;
  fluidFlow: THREE.MeshStandardMaterial;
  neuralNodeActive: THREE.MeshStandardMaterial;
  neuralNodeInactive: THREE.MeshStandardMaterial;
  synapseAxon: THREE.MeshStandardMaterial;
  combustionFire: THREE.MeshStandardMaterial;
  glassLens: THREE.MeshPhysicalMaterial;
}

export function createAnatomyMaterials(): AnatomyMaterials {
  return {
    bone: new THREE.MeshStandardMaterial({
      color: 0xedebe4,
      roughness: 0.55,
      metalness: 0.05,
    }),
    cartilage: new THREE.MeshStandardMaterial({
      color: 0xc4d8e2,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    }),
    muscle: new THREE.MeshStandardMaterial({
      color: 0xc93b48,
      roughness: 0.6,
      metalness: 0.08,
    }),
    nerve: new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x581c87,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.2,
    }),
    nerveRoot: new THREE.MeshStandardMaterial({
      color: 0xd8b4fe,
      roughness: 0.4,
      metalness: 0.1,
    }),
    artery: new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.28,
      metalness: 0.15,
    }),
    vein: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.3,
      metalness: 0.15,
    }),
    heart: new THREE.MeshStandardMaterial({
      color: 0xb91c1c,
      roughness: 0.35,
      metalness: 0.12,
    }),
    lung: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.65,
      metalness: 0.05,
      transparent: true,
      opacity: 0.88,
    }),
    airway: new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      roughness: 0.4,
      metalness: 0.1,
    }),
    stomach: new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.45,
      metalness: 0.08,
    }),
    liver: new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.4,
      metalness: 0.1,
    }),
    gallbladder: new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.3,
      metalness: 0.15,
    }),
    pancreas: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.5,
      metalness: 0.05,
    }),
    smallIntestine: new THREE.MeshStandardMaterial({
      color: 0xea580c,
      roughness: 0.45,
      metalness: 0.08,
    }),
    colon: new THREE.MeshStandardMaterial({
      color: 0xc2410c,
      roughness: 0.5,
      metalness: 0.08,
    }),
    diaphragm: new THREE.MeshStandardMaterial({
      color: 0x0d9488,
      roughness: 0.5,
      metalness: 0.05,
      transparent: true,
      opacity: 0.75,
    }),
    highlight: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
      roughness: 0.2,
      metalness: 0.4,
    }),
    dimmed: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
      metalness: 0.0,
      transparent: true,
      opacity: 0.15,
      depthWrite: false,
    }),

    // Engineering & Physical Materials
    steel: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.85,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.1,
      metalness: 0.95,
    }),
    castIron: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.6,
    }),
    brass: new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.35,
      metalness: 0.8,
    }),
    copperCoil: new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.25,
      metalness: 0.88,
    }),
    aluminum: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.4,
      metalness: 0.75,
    }),
    siliconDie: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.15,
      metalness: 0.9,
    }),
    pcbSubstrate: new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Dark Forest Green PCB
      roughness: 0.6,
      metalness: 0.1,
    }),
    pcbTraces: new THREE.MeshStandardMaterial({
      color: 0xfbbf24, // Gold / Copper Traces
      roughness: 0.2,
      metalness: 0.9,
    }),
    concreteMatrix: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.45,
    }),
    rebarSteel: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4,
      metalness: 0.8,
    }),
    trussCompression: new THREE.MeshStandardMaterial({
      color: 0xf43f5e, // Rose / Red for compression
      roughness: 0.35,
      metalness: 0.7,
    }),
    trussTension: new THREE.MeshStandardMaterial({
      color: 0x06b6d4, // Cyan / Blue for tension
      roughness: 0.35,
      metalness: 0.7,
    }),
    fluidFlow: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.75,
    }),
    neuralNodeActive: new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.4,
    }),
    neuralNodeInactive: new THREE.MeshStandardMaterial({
      color: 0x475569,
      emissive: 0x1e293b,
      emissiveIntensity: 0.2,
      roughness: 0.5,
      metalness: 0.3,
    }),
    synapseAxon: new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x4f46e5,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.65,
      roughness: 0.3,
      metalness: 0.1,
    }),
    combustionFire: new THREE.MeshStandardMaterial({
      color: 0xf97316,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.85,
    }),
    glassLens: new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.9,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
    }),
  };
}
