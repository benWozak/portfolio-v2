import { WebTechnology } from "../ui/WebTechnology";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiPayloadcms,
  SiNodedotjs,
  SiPostgresql,
  SiVuedotjs,
  SiSass,
  SiLaravel,
  SiPython,
  SiGraphql,
  SiDocker,
} from "react-icons/si";

import { FaAws } from "react-icons/fa";

export function TechnologyShowcase() {
  const technologies = [
    { name: "Next.js", icon: <SiNextdotjs className="w-6 h-6" /> },
    { name: "React", icon: <SiReact className="w-6 h-6" /> },
    { name: "TypeScript", icon: <SiTypescript className="w-6 h-6" /> },
    { name: "Tailwind CSS", icon: <SiTailwindcss className="w-6 h-6" /> },
    { name: "Payload CMS", icon: <SiPayloadcms className="w-6 h-6" /> },
    { name: "Node.js", icon: <SiNodedotjs className="w-6 h-6" /> },
    { name: "Python", icon: <SiPython className="w-6 h-6" /> },
    { name: "Postgres", icon: <SiPostgresql className="w-6 h-6" /> },
    { name: "GraphQL", icon: <SiGraphql className="w-6 h-6" /> },
  ];

  const primaryStack = [
    { name: "Tailwind", icon: <SiTailwindcss className="w-6 h-6" /> },
    { name: "TypeScript", icon: <SiTypescript className="w-6 h-6" /> },
    { name: "React", icon: <SiReact className="w-6 h-6" /> },
    { name: "Next.js", icon: <SiNextdotjs className="w-6 h-6" /> },
    { name: "Postgres", icon: <SiPostgresql className="w-6 h-6" /> },
  ];
  const secondaryStack = [
    { name: "Vue", icon: <SiVuedotjs className="w-6 h-6" /> },
    { name: "Sass", icon: <SiSass className="w-6 h-6" /> },
    { name: "Node.js", icon: <SiNodedotjs className="w-6 h-6" /> },
    { name: "Laravel", icon: <SiLaravel className="w-6 h-6" /> },
    { name: "Python", icon: <SiPython className="w-6 h-6" /> },
    { name: "GraphQL", icon: <SiGraphql className="w-6 h-6" /> },
    { name: "AWS", icon: <FaAws className="w-6 h-6" /> },
    { name: "Docker", icon: <SiDocker className="w-6 h-6" /> },
  ];

  return (
    <div>
      <div className="flex items-center justify-center gap-2 lg:gap-5 uppercase text-sm lg:text-md font-semibold mb-4">
        <div className="w-6 lg:w-12 h-0.5 lg:h-1 rounded-full bg-primary"></div>
        Main Stack
        <div className="w-6 lg:w-12 h-0.5 lg:h-1.5 rounded-full bg-primary"></div>
      </div>
      <div className="flex flex-wrap gap-4 justify-center max-w-2xl">
        {primaryStack.map((tech) => (
          <WebTechnology key={tech.name} name={tech.name} icon={tech.icon} />
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 lg:gap-5 uppercase text-sm lg:text-md font-semibold my-4">
        <div className="w-6 lg:w-12 h-0.5 lg:h-1 rounded-full bg-primary"></div>
        Supporting
        <div className="w-6 lg:w-12 h-0.5 lg:h-1.5 rounded-full bg-primary"></div>
      </div>
      <div className="flex flex-wrap gap-4 justify-center max-w-2xl">
        {secondaryStack.map((tech) => (
          <WebTechnology key={tech.name} name={tech.name} icon={tech.icon} />
        ))}
      </div>
    </div>
  );
}
