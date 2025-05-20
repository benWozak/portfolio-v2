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
  SiMysql,
} from "react-icons/si";
import { FaAws } from "react-icons/fa";
import { OrbitingCircles } from "../../magicui/orbiting-circles";

export function TechOrbit() {
  const iconSize = 32;

  return (
    <div className="relative h-[500px] w-full">
      <OrbitingCircles radius={160} duration={50} path={true}>
        <SiNextdotjs
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiReact
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiTypescript
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiTailwindcss
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiSass
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiVuedotjs
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
      </OrbitingCircles>

      <OrbitingCircles radius={100} duration={40} reverse={true} path={true}>
        <SiLaravel
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiPython
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiGraphql
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiNodedotjs
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiDocker
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
      </OrbitingCircles>

      <OrbitingCircles radius={50} duration={30} path={true}>
        <SiSqlite
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <SiPostgresql
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
        <FaAws
          size={iconSize}
          className="dark:text-secondary-500 text-secondary-800"
        />
      </OrbitingCircles>
    </div>
  );
}
