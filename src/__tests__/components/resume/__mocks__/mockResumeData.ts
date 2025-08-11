import { ResumeData } from '@/types/resume'

export const mockResumeData: ResumeData = {
  full_name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '(555) 123-4567',
  socials: {
    linkedin_url: 'https://www.linkedin.com/in/johndoe',
    github_url: 'https://github.com/johndoe',
    portfolio_url: 'https://www.johndoe.com',
  },
  summary: 'Experienced full-stack developer with expertise in React, Node.js, and cloud technologies.',
  experience: [
    {
      company: 'Tech Corp',
      position: 'Senior Software Engineer',
      duration: {
        startDate: '2022-01-01',
        endDate: null,
      },
      description: [
        'Led development of microservices architecture',
        'Improved application performance by 40%',
        'Mentored junior developers',
      ],
    },
    {
      company: 'StartupXYZ',
      position: 'Full Stack Developer',
      duration: {
        startDate: '2020-06-01',
        endDate: '2021-12-31',
      },
      description: [
        'Built responsive web applications using React',
        'Implemented RESTful APIs with Node.js',
        'Deployed applications on AWS',
      ],
    },
    {
      company: 'Web Solutions Inc',
      position: 'Junior Developer',
      duration: {
        startDate: '2019-01-01',
        endDate: '2020-05-31',
      },
      description: [
        'Developed frontend components',
        'Collaborated with design team',
        'Maintained legacy codebases',
      ],
    },
    {
      company: 'Freelance',
      position: 'Web Developer',
      duration: {
        startDate: '2018-01-01',
        endDate: '2018-12-31',
      },
      description: [
        'Created custom WordPress themes',
        'Optimized website performance',
        'Provided technical support to clients',
      ],
    },
  ],
  skills: [
    {
      skill_title: 'Frontend Technologies',
      skill_items: 'React, TypeScript, Next.js, HTML5, CSS3, Tailwind CSS',
    },
    {
      skill_title: 'Backend Technologies',
      skill_items: 'Node.js, Express, Python, GraphQL, REST APIs',
    },
    {
      skill_title: 'Databases',
      skill_items: 'PostgreSQL, MongoDB, Redis, SQLite',
    },
    {
      skill_title: 'Cloud & DevOps',
      skill_items: 'AWS, Docker, Kubernetes, CI/CD, GitHub Actions',
    },
  ],
  education: {
    institution: 'University of Technology',
    location: 'San Francisco, CA',
    duration: {
      startDate: '2014-09-01',
      endDate: '2018-05-31',
    },
    degree: 'Bachelor of Science in Computer Science',
  },
}

export const createMockResumeData = (overrides: Partial<ResumeData> = {}): ResumeData => {
  return {
    ...mockResumeData,
    ...overrides,
  }
}