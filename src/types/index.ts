export type ProjectStatus = 'In Progress' | 'Prototype' | 'Complete';
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
    problem: string;
    solution: string;
  };
}
