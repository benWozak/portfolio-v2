import {
  SiNextdotjs,
  SiReact,
  SiTypescript,
  SiTailwindcss,
  SiNodedotjs,
  SiPostgresql,
  SiVuedotjs,
  SiSass,
  SiLaravel,
  SiPython,
  SiGraphql,
  SiDocker,
  SiSqlite,
  // SiMysql,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { OrbitingCircles } from "../../magicui/orbiting-circles";

export function TechOrbit() {
  const iconSize = 32;
  const className =
    "hover:cursor-default text-secondary-700 dark:text-secondary-500 hover:text-secondary-900 hover:dark:text-secondary-300 filter hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)] dark:hover:drop-shadow-[0_0_8px_rgba(148,163,184,0.5)] transition-all duration-300";

  return (
    <div className="relative h-[500px] w-full">
      <OrbitingCircles radius={160} duration={50} path={true}>
        <SiNextdotjs size={iconSize} className={className} />
        <SiReact size={iconSize} className={className} />
        <SiTypescript size={iconSize} className={className} />
        <SiTailwindcss size={iconSize} className={className} />
        <SiSass size={iconSize} className={className} />
        <SiVuedotjs size={iconSize} className={className} />
      </OrbitingCircles>

      <OrbitingCircles radius={100} duration={40} reverse={true} path={true}>
        <SiLaravel size={iconSize} className={className} />
        <SiPython size={iconSize} className={className} />
        <SiGraphql size={iconSize} className={className} />
        <SiNodedotjs size={iconSize} className={className} />
        <SiDocker size={iconSize} className={className} />
      </OrbitingCircles>

      <OrbitingCircles radius={50} duration={30} path={true}>
        <SiSqlite size={iconSize} className={className} />
        <SiPostgresql size={iconSize} className={className} />
        <FaAws size={iconSize} className={className} />
      </OrbitingCircles>
    </div>
  );
}
