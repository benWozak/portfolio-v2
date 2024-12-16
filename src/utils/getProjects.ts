import { Project } from '@/types';

// Workaround for build failure fetching from local json.
const fallbackProjects: Project[] = [
  {
    "id": 1,
    "name": "OurRecipes",
    "type": "web",
    "status": "Prototype",
    "description": "A Simple tool to parse the recipe from websites without all the extra stuff. Designed to be used primarily on mobile devices.",
    "media": "https://ua4mmiw8i4jbla3y.public.blob.vercel-storage.com/OurRecipes-T4hv1q2TwNchNqirkV15paO4UZmSlB.mov",
    "liveUrl": "https://recipes-v2-alpha.vercel.app/",
    "githubUrl": "https://github.com/benWozak/recipes-v2",
    "content": {
      "problem": "My wife and I spend a lot of time finding and using recipes on line. Recipe websites are often full of adds and sometimes jump the page when they refresh, causing you to lose your spot.",
      "solution": "I wanted to create a simple solution to parse the recipe from the website to cut out all of the noise, so we could focus on making the recipe."
    }
  },
  {
    "id": 2,
    "name": "Tedana App",
    "type": "native",
    "status": "Prototype",
    "description": "A desktop application for Tedana - a program for multi-echo fMRI processing",
    "media": "https://ua4mmiw8i4jbla3y.public.blob.vercel-storage.com/TedanaApp-71fvLOCahSSxyzvgKNJj7vTKHwGOhw.mov",
    "liveUrl": null,
    "githubUrl": "https://github.com/benWozak/tedana-gui",
    "content": {
      "problem": "Multi-echo fMRI is a new concept in the world of neuroscience. It is not very well understood and not yet integrated into current data processing pipelines.",
      "solution": "I sought to create a tool to make it easier to use Tedana, and used this as a medium to learn Tauri, a new framework for building modern desktop applications."
    }
  },
  {
    "id": 3,
    "name": "Resume Builder",
    "type": "web",
    "status": "Prototype",
    "description": "A tool I used to create my resume using LateX",
    "media": "https://ua4mmiw8i4jbla3y.public.blob.vercel-storage.com/ResumeBuilder-7bvXctc9Zs0UcOId9Qe1aONx8lQnhQ.mov",
    "liveUrl": "https://resume-template-viewer.vercel.app/",
    "githubUrl": "https://github.com/benWozak/resume-template-viewer",
    "content": {
      "problem": "Resume templates via word or other sources like canva are often bloated, difficult to modify, and don't work well with ATS parsing.",
      "solution": "I decided to learn how to work with LateX using a clean resume format so that I could customize exactly the way I wanted, and I could be confident in its parsability. I then took it another step further and created a simple custom CMS to integrate with it."
    }
  },
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