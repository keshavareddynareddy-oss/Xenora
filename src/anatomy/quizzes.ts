import { QuizQuestion } from '../types/learning';

export const DEFAULT_QUIZZES: QuizQuestion[] = [
  // Mechanical Engineering
  {
    id: 'quiz_mech_1',
    question: 'In a four-stroke internal combustion engine, during which stroke are both the intake and exhaust valves kept completely closed while pressure peaks?',
    targetStructureId: 'engine_piston',
    category: 'mechanical',
    options: ['Compression & Power Strokes', 'Intake & Exhaust Strokes', 'Only Intake Stroke', 'Only Exhaust Stroke'],
    correctAnswer: 'Compression & Power Strokes',
    explanation: 'Both poppet valves remain tightly seated during the compression stroke to trap and compress the air-fuel mixture, and during the power stroke to contain the expanding high-pressure combustion gas.',
  },
  {
    id: 'quiz_mech_2',
    question: 'In an epicyclic planetary gearbox with a stationary ring gear and driven sun gear, how is the overall gear reduction ratio determined?',
    targetStructureId: 'gear_carrier',
    category: 'mechanical',
    options: ['i = 1 + (Z_ring / Z_sun)', 'i = Z_sun / Z_planet', 'i = (Z_ring - Z_sun) / 2', 'i = Z_planet / Z_ring'],
    correctAnswer: 'i = 1 + (Z_ring / Z_sun)',
    explanation: 'Using Willis formula for planetary trains with fixed ring gear (w_ring = 0), the ratio between sun input and carrier output is i = 1 + (Z_ring / Z_sun), providing high torque density in a compact footprint.',
  },
  {
    id: 'quiz_mech_3',
    question: 'Why are centrifugal pump impeller vanes typically curved backwards (discharge blade angle beta2 < 90°)?',
    targetStructureId: 'pump_impeller',
    category: 'mechanical',
    options: [
      'To provide a stable, self-regulating head-capacity (H-Q) curve with non-overloading power characteristics',
      'To maximize theoretical discharge head at zero flow',
      'To create forward fluid acceleration vectors',
      'To eliminate the need for an external volute casing',
    ],
    correctAnswer: 'To provide a stable, self-regulating head-capacity (H-Q) curve with non-overloading power characteristics',
    explanation: 'Backward-curved vanes yield a steadily drooping head curve as flow increases, ensuring stable hydraulic operation and preventing motor burnout at high flow rates.',
  },

  // Electrical Engineering
  {
    id: 'quiz_elec_1',
    question: 'What creates the rotating magnetic field (RMF) in a three-phase AC induction motor stator?',
    targetStructureId: 'motor_stator_windings',
    category: 'electrical',
    options: [
      'Three phase currents displaced 120° in time flowing through stator coils displaced 120° in space',
      'A permanent neodymium magnet mounted inside the stator bore',
      'Direct current fed through commutator slip rings',
      'Mechanical rotation of the outer cast iron motor casing',
    ],
    correctAnswer: 'Three phase currents displaced 120° in time flowing through stator coils displaced 120° in space',
    explanation: 'By Ferraris and Tesla principles, three sinusoidal currents 120° out of phase flowing through coils spaced 120° apart produce a constant-magnitude net magnetic field vector spinning at synchronous speed Ns = 120f / p.',
  },
  {
    id: 'quiz_elec_2',
    question: 'Why are transformer cores manufactured using thin Cold-Rolled Grain-Oriented (CRGO) laminated sheets rather than solid steel?',
    targetStructureId: 'transformer_laminated_core',
    category: 'electrical',
    options: [
      'To interrupt circulating eddy current loops and minimize core I²R heat losses',
      'To increase the mechanical weight of the transformer frame',
      'To reduce primary winding insulation voltage requirements',
      'To eliminate high-voltage lightning surges',
    ],
    correctAnswer: 'To interrupt circulating eddy current loops and minimize core I²R heat losses',
    explanation: 'Alternating magnetic flux induces eddy currents in conductive ferromagnetic steel. Laminating the core and insulating each sheet restricts eddy current loops, slashing eddy current losses proportional to lamination thickness squared (t²).',
  },

  // Electronics Engineering
  {
    id: 'quiz_semi_1',
    question: 'In an N-channel enhancement MOSFET, what physical phenomenon occurs when the gate-to-source voltage exceeds threshold (V_GS > V_th)?',
    targetStructureId: 'transistor_inversion_channel',
    category: 'electronics',
    options: [
      'An inverted conductive N-type channel of minority electrons forms beneath the gate oxide, connecting Source and Drain',
      'The dielectric gate oxide layer permanently breaks down into a short circuit',
      'Positive holes flood the drain terminal to produce p-n conduction',
      'Carrier recombination completely halts all electron flow',
    ],
    correctAnswer: 'An inverted conductive N-type channel of minority electrons forms beneath the gate oxide, connecting Source and Drain',
    explanation: 'Positive gate voltage repels majority holes and attracts minority electrons to the Si/SiO2 interface. When surface electron concentration exceeds background hole concentration, an inversion layer forms, allowing current to conduct between Source and Drain.',
  },

  // Civil Engineering
  {
    id: 'quiz_civil_1',
    question: 'Under vertical traffic gravity loads on a simply supported Warren truss bridge, what type of axial stress dominates the top chord and bottom chord respectively?',
    targetStructureId: 'truss_top_chord',
    category: 'civil',
    options: [
      'Top chord is in compression (Euler buckling risk); bottom chord is in tension',
      'Top chord is in tension; bottom chord is in compression',
      'Both top and bottom chords experience pure transverse shear stress',
      'Neither chord carries axial force; only diagonals support gravity loads',
    ],
    correctAnswer: 'Top chord is in compression (Euler buckling risk); bottom chord is in tension',
    explanation: 'Global positive bending moments cause compression along the upper fiber (top chord) and tension along the lower fiber (bottom chord). Top chords must be sized to prevent buckling, while bottom chords resist tensile yielding.',
  },

  // Computer Science
  {
    id: 'quiz_cs_1',
    question: 'In a balanced Binary Search Tree (BST) containing N keys, what is the worst-case search time complexity to locate a target key?',
    targetStructureId: 'bst_root_node',
    category: 'computer_science',
    options: ['O(log N)', 'O(N²)', 'O(1)', 'O(N log N)'],
    correctAnswer: 'O(log N)',
    explanation: 'Because each key comparison eliminates either the entire left subtree or right subtree, the search space halves at every step, yielding logarithmic O(log N) time complexity in balanced trees.',
  },

  // Biomedical & Human Anatomy
  {
    id: 'quiz_bio_1',
    question: 'Which anatomical chamber of the human heart has the thickest muscular myocardium to generate systemic arterial blood pressure?',
    targetStructureId: 'left_ventricle',
    category: 'organ',
    options: ['Left Ventricle', 'Right Ventricle', 'Right Atrium', 'Left Atrium'],
    correctAnswer: 'Left Ventricle',
    explanation: 'The left ventricle has a myocardium 3 to 4 times thicker than the right ventricle because it must overcome systemic vascular resistance (~120 mmHg) to perfuse the entire body, compared to low pulmonary resistance (~25 mmHg).',
  },
];
