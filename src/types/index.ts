export type ProjectStatus = 'In Progress' | 'Prototype' | 'Complete';

export interface Project {
  id: number;
  name: string;
  type: string;
  status: ProjectStatus;
  description: string;
  media: string;
  liveUrl: string;
  githubUrl: string;
  content: {
    problem: string;
    solution: string;
  };
}
