import { Project } from '@/types';

// Workaround for build failure fetching from local json.
const fallbackProjects: Project[] = [
  {
    "id": 1,
    "name": "OurRecipes",
    "type": "web",
    "status": "Prototype",
    "description": "A Simple tool to parse the recipe from websites without all the extra stuff.",
    "media": "/projects/OurRecipes.mov",
    "liveUrl": "https://recipes-v2-alpha.vercel.app/",
    "githubUrl": "https://github.com/benWozak/recipes-v2",
    "content": {
      "problem": "The problem Project solves...",
      "solution": "How Project One solves the problem..."
    }
  },
  {
    "id": 2,
    "name": "Resume Builder",
    "type": "web",
    "status": "Prototype",
    "description": "A tool I used to create my resume using LateX",
    "media": "/projects/ResumeBuilder.mov",
    "liveUrl": "https://resume-template-viewer.vercel.app/",
    "githubUrl": "https://github.com/benWozak/resume-template-viewer",
    "content": {
      "problem": "The problem Project solves...",
      "solution": "How Project solves the problem..."
    }
  },
  {
    "id": 3,
    "name": "Tedana App",
    "type": "native",
    "status": "Prototype",
    "description": "A brief description of Project Two",
    "media": "/projects/ResumeBuilder.mov",
    "liveUrl": "https://resume-template-viewer.vercel.app/",
    "githubUrl": "https://github.com/benWozak",
    "content": {
      "problem": "The problem Project solves...",
      "solution": "How Project solves the problem..."
    }
  }
];

export async function getProjects(): Promise<Project[]> {
  try {
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return fallbackProjects;
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`);
    if (!res.ok) {
      throw new Error('Failed to fetch projects');
    }
    return res.json();
  } catch (error) {
    console.error('Projects fetch error:', error);
    
    return fallbackProjects;
  }
}

export async function getProjectByName(name: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.name.toLowerCase() === name.toLowerCase());
}