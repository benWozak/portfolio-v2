export type ProjectStatus = 'In Progress' | 'Prototype' | 'Professional';
export type ProjectType = 'web' | 'native';

export interface TechStack {
  frontend: string[];
  backend: string[];
  other: string[];
}

export interface ProjectMedia {
  staticImage: string;
  video?: string;
}

export interface Project {
  id: number;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  overview: string;
  challenge: string;
  solution: string;
  techStack: TechStack;
  keyTakeaways: string;
  liveUrl: string | null;
  githubUrl: string | null;
  media: ProjectMedia;
  order?: number;
  featured?: boolean;
}
