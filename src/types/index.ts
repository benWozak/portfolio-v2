export type ProjectStatus = 'In Progress' | 'Prototype' | 'Professional';
export type ProjectType = 'web' | 'native';

export interface Project {
  id: number;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description: string;
  media: string;
  staticImage: string;
  liveUrl: string | null;
  githubUrl: string;
  content: {
    concept: string;
    solution: string;
  };
}
