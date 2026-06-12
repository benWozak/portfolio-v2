export type ProjectStatus = 'In Progress' | 'Prototype' | 'Professional';
export type ProjectType = 'web' | 'native';

export interface TechStack {
  frontend: string[];
  backend: string[];
  other: string[];
}

export interface ProjectMedia {
  staticImage: string;
  alt?: string;
  video?: string;
  blurDataURL?: string
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  overview: string;
  challenge: string;
  solution: string;
  techStack: TechStack;
  keyTakeaways: string;
  /** Optional Lexical rich-text "full write-up" (SerializedEditorState) */
  content?: unknown;
  liveUrl: string | null;
  githubUrl: string | null;
  media: ProjectMedia;
  order?: number;
  featured?: boolean;
}

// Re-export YakPDF types
export * from './yakpdf';
