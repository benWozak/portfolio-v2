import { WebTechnology } from "../ui/WebTechnology";
import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiPayloadcms,
  SiNodedotjs,
  SiPython,
} from "react-icons/si";

export function TechnologyShowcase() {
  const technologies = [
    { name: "Next.js", icon: <SiNextdotjs className="w-6 h-6" /> },
    { name: "React", icon: <SiReact className="w-6 h-6" /> },
    { name: "TypeScript", icon: <SiTypescript className="w-6 h-6" /> },
    { name: "Tailwind CSS", icon: <SiTailwindcss className="w-6 h-6" /> },
    { name: "Payload CMS", icon: <SiPayloadcms className="w-6 h-6" /> },
    { name: "Node.js", icon: <SiNodedotjs className="w-6 h-6" /> },
    { name: "Python", icon: <SiPython className="w-6 h-6" /> },
  ];

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {technologies.map((tech) => (
        <WebTechnology key={tech.name} name={tech.name} icon={tech.icon} />
      ))}
    </div>
  );
}
