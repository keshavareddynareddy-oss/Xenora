import * as THREE from 'three';
import { AnatomyMaterials } from '../materials';

export function buildMicrocontrollerModel(materials: AnatomyMaterials): THREE.Group {
  const pcbGroup = new THREE.Group();
  pcbGroup.name = 'subject_microcontroller_pcb';

  // 1. Multi-layer FR-4 Printed Circuit Board Substrate
  const boardGeo = new THREE.BoxGeometry(4.8, 0.16, 4.2);
  const board = new THREE.Mesh(boardGeo, materials.pcbSubstrate);
  board.userData = {
    structureId: 'pcb_fr4_substrate',
    name: 'Multi-Layer FR-4 PCB Board Substrate',
    topic: 'microcontroller_pcb',
  };
  pcbGroup.add(board);

  // Mounting Holes in 4 corners
  const holeCorners = [
    [-2.1, 1.8],
    [2.1, 1.8],
    [-2.1, -1.8],
    [2.1, -1.8],
  ];
  holeCorners.forEach(([hx, hz]) => {
    const padGeo = new THREE.RingGeometry(0.12, 0.28, 16);
    const pad = new THREE.Mesh(padGeo, materials.pcbTraces);
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(hx, 0.09, hz);
    pcbGroup.add(pad);
  });

  // 2. Central Microcontroller SoC (QFP / QFN Package with cutaway silicon die)
  const chipGroup = new THREE.Group();
  const chipPackageGeo = new THREE.BoxGeometry(1.8, 0.25, 1.8);
  const chipPackage = new THREE.Mesh(chipPackageGeo, materials.castIron);
  chipGroup.add(chipPackage);

  // Silicon Die exposed inside package
  const dieGeo = new THREE.BoxGeometry(0.8, 0.08, 0.8);
  const die = new THREE.Mesh(dieGeo, materials.siliconDie);
  die.position.y = 0.14;
  chipGroup.add(die);

  // Gold Wire Bonds radiating from die to leadframe
  for (let w = 0; w < 16; w++) {
    const angle = (w * Math.PI * 2) / 16;
    const wirePoints = [
      new THREE.Vector3(Math.cos(angle) * 0.35, 0.15, Math.sin(angle) * 0.35),
      new THREE.Vector3(Math.cos(angle) * 0.6, 0.2, Math.sin(angle) * 0.6),
      new THREE.Vector3(Math.cos(angle) * 0.8, 0.12, Math.sin(angle) * 0.8),
    ];
    const wireCurve = new THREE.CatmullRomCurve3(wirePoints);
    const wireGeo = new THREE.TubeGeometry(wireCurve, 8, 0.015, 6, false);
    const wire = new THREE.Mesh(wireGeo, materials.pcbTraces);
    chipGroup.add(wire);
  }

  // QFP Perimeter Gull-Wing Lead Pins (6 pins per side = 24 pins)
  const sides = [
    { dir: 'north', pos: [0, 0, -1.0], rot: 0 },
    { dir: 'south', pos: [0, 0, 1.0], rot: 0 },
    { dir: 'east', pos: [1.0, 0, 0], rot: Math.PI / 2 },
    { dir: 'west', pos: [-1.0, 0, 0], rot: Math.PI / 2 },
  ];
  sides.forEach(({ pos, rot }) => {
    for (let p = -2.5; p <= 2.5; p += 1) {
      const pinGeo = new THREE.BoxGeometry(0.08, 0.08, 0.3);
      const pin = new THREE.Mesh(pinGeo, materials.chrome);
      if (rot === 0) {
        pin.position.set(pos[0] + p * 0.25, 0.05, pos[2]);
      } else {
        pin.position.set(pos[0], 0.05, pos[2] + p * 0.25);
        pin.rotation.y = Math.PI / 2;
      }
      chipGroup.add(pin);
    }
  });

  chipGroup.position.set(0, 0.2, 0);
  chipGroup.userData = {
    structureId: 'pcb_mcu_soc',
    name: '32-Bit ARM Cortex SoC & Silicon Die',
    topic: 'microcontroller_pcb',
  };
  pcbGroup.add(chipGroup);

  // 3. Quartz Crystal Oscillator (Precision Clock Source)
  const crystalGroup = new THREE.Group();
  const crystalCanGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.7, 16);
  const crystalCan = new THREE.Mesh(crystalCanGeo, materials.aluminum);
  crystalCan.rotation.z = Math.PI / 2;
  crystalGroup.add(crystalCan);
  crystalGroup.position.set(-1.4, 0.2, 0.8);
  crystalGroup.userData = {
    structureId: 'pcb_crystal_oscillator',
    name: '16 MHz Quartz Crystal Oscillator (System Clock)',
    topic: 'microcontroller_pcb',
  };
  pcbGroup.add(crystalGroup);

  // 4. SMT Decoupling Ceramic Capacitors & Voltage Regulator
  const powerGroup = new THREE.Group();
  for (let c = 0; c < 4; c++) {
    const capGeo = new THREE.BoxGeometry(0.18, 0.12, 0.3);
    const cap = new THREE.Mesh(capGeo, materials.bone);
    cap.position.set(0.6 + c * 0.35, 0.14, 0.8);
    powerGroup.add(cap);
  }

  // Linear Low-Dropout (LDO) Regulator (SOT-223)
  const ldoGeo = new THREE.BoxGeometry(0.5, 0.2, 0.4);
  const ldo = new THREE.Mesh(ldoGeo, materials.castIron);
  ldo.position.set(-1.4, 0.18, -1.0);
  powerGroup.add(ldo);

  powerGroup.userData = {
    structureId: 'pcb_power_regulator',
    name: '3.3V LDO Voltage Regulator & Decoupling Caps',
    topic: 'microcontroller_pcb',
  };
  pcbGroup.add(powerGroup);

  // 5. Dual In-line Header GPIO Pins (Rows on top and bottom)
  const gpioGroup = new THREE.Group();
  [-1.6, 1.6].forEach((gz) => {
    for (let p = -6; p <= 6; p++) {
      const pinGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
      const pin = new THREE.Mesh(pinGeo, materials.pcbTraces);
      pin.position.set(p * 0.28, 0.45, gz);
      gpioGroup.add(pin);
    }
  });
  gpioGroup.userData = {
    structureId: 'pcb_gpio_headers',
    name: 'General Purpose Input/Output (GPIO) Headers',
    topic: 'microcontroller_pcb',
  };
  pcbGroup.add(gpioGroup);

  // 6. High-Frequency Copper Signal Traces (Routing tracks)
  const traceGroup = new THREE.Group();
  for (let t = 0; t < 12; t++) {
    const tracePoints = [
      new THREE.Vector3(-0.6 + t * 0.12, 0.09, 0.8),
      new THREE.Vector3(-0.8 + t * 0.14, 0.09, 1.2),
      new THREE.Vector3(-0.8 + t * 0.14, 0.09, 1.55),
    ];
    const traceCurve = new THREE.CatmullRomCurve3(tracePoints);
    const traceGeo = new THREE.TubeGeometry(traceCurve, 6, 0.018, 4, false);
    const traceMesh = new THREE.Mesh(traceGeo, materials.pcbTraces);
    traceGroup.add(traceMesh);
  }
  traceGroup.userData = {
    structureId: 'pcb_bus_traces',
    name: 'Impedance-Matched Copper Bus Traces',
    topic: 'microcontroller_pcb',
  };
  pcbGroup.add(traceGroup);

  return pcbGroup;
}
