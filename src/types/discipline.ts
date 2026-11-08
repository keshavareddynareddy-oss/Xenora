export type DisciplineId =
  | 'mechanical'
  | 'electrical'
  | 'electronics'
  | 'civil'
  | 'computer_science'
  | 'biomedical';

export type TopicId =
  // Mechanical
  | 'four_stroke_engine'
  | 'planetary_gearbox'
  | 'centrifugal_pump'
  // Electrical
  | 'ac_induction_motor'
  | 'power_transformer'
  // Electronics
  | 'bjt_mosfet_transistor'
  | 'microcontroller_pcb'
  // Civil
  | 'truss_bridge'
  | 'reinforced_concrete'
  // Computer Science
  | 'neural_network_3d'
  | 'binary_search_tree'
  // Biomedical (Preserved Subjects)
  | 'human'
  | 'heart'
  | 'brain'
  | 'canine'
  | 'cell'
  | 'plant';

export interface DisciplineDescriptor {
  id: DisciplineId;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  iconName: string;
  color: string;
  accent: string;
  topicCount: number;
}

export interface CameraPreset {
  id: string;
  label: string;
  target: [number, number, number];
  position: [number, number, number];
}

export interface TopicDescriptor {
  id: TopicId;
  disciplineId: DisciplineId;
  name: string;
  subtitle: string;
  badge: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  iconName: string;
  color: string;
  accentColor: string;
  componentCount: number;
  hasWorkingPrinciple: boolean;
  workingPrincipleTitle?: string;
  workingPrincipleSummary?: string;
  cameraPresets: CameraPreset[];
}

export interface EducationalComponent {
  id: string;
  name: string;
  technicalName?: string;
  latinName?: string;
  discipline?: DisciplineId;
  topic?: TopicId;
  subject?: TopicId;
  category: string;
  system: string;
  location: string;
  functionDesc: string;
  workingMechanism?: string;
  specifications?: string[];
  characteristics?: string[];
  relatedComponents?: string[];
  relatedStructures?: string[];
  engineeringNotes?: string;
  clinicalRelevance?: string;
  cameraTarget: [number, number, number];
  cameraDistance: number;
  color: string;
  accentColor: string;
}

// Backwards-compatible alias for existing anatomy structures
export type AnatomicalStructure = EducationalComponent;
export type AnatomySubject = TopicId;
export type AnatomyCategory = string;
export type AnatomyLayerState = Record<string, boolean>;
export type SubjectDescriptor = TopicDescriptor;
