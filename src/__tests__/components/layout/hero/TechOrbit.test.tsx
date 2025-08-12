import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@/test-utils'
import { TechOrbit } from '@/components/layout/hero/TechOrbit'

// Mock React Icons
vi.mock('react-icons/si', () => ({
  SiNextdotjs: ({ size, className }: any) => (
    <div data-testid="icon-nextjs" data-size={size} className={className}>Next.js</div>
  ),
  SiReact: ({ size, className }: any) => (
    <div data-testid="icon-react" data-size={size} className={className}>React</div>
  ),
  SiTypescript: ({ size, className }: any) => (
    <div data-testid="icon-typescript" data-size={size} className={className}>TypeScript</div>
  ),
  SiTailwindcss: ({ size, className }: any) => (
    <div data-testid="icon-tailwind" data-size={size} className={className}>Tailwind</div>
  ),
  SiNodedotjs: ({ size, className }: any) => (
    <div data-testid="icon-nodejs" data-size={size} className={className}>Node.js</div>
  ),
  SiPostgresql: ({ size, className }: any) => (
    <div data-testid="icon-postgresql" data-size={size} className={className}>PostgreSQL</div>
  ),
  SiVuedotjs: ({ size, className }: any) => (
    <div data-testid="icon-vue" data-size={size} className={className}>Vue.js</div>
  ),
  SiSass: ({ size, className }: any) => (
    <div data-testid="icon-sass" data-size={size} className={className}>Sass</div>
  ),
  SiLaravel: ({ size, className }: any) => (
    <div data-testid="icon-laravel" data-size={size} className={className}>Laravel</div>
  ),
  SiPython: ({ size, className }: any) => (
    <div data-testid="icon-python" data-size={size} className={className}>Python</div>
  ),
  SiGraphql: ({ size, className }: any) => (
    <div data-testid="icon-graphql" data-size={size} className={className}>GraphQL</div>
  ),
  SiDocker: ({ size, className }: any) => (
    <div data-testid="icon-docker" data-size={size} className={className}>Docker</div>
  ),
  SiSqlite: ({ size, className }: any) => (
    <div data-testid="icon-sqlite" data-size={size} className={className}>SQLite</div>
  ),
}))

vi.mock('react-icons/fa', () => ({
  FaAws: ({ size, className }: any) => (
    <div data-testid="icon-aws" data-size={size} className={className}>AWS</div>
  ),
}))

// Mock OrbitingCircles component
vi.mock('@/components/magicui/orbiting-circles', () => ({
  OrbitingCircles: ({ children, radius, duration, reverse, path }: any) => (
    <div 
      data-testid="orbiting-circles"
      data-radius={radius}
      data-duration={duration}
      data-reverse={reverse}
      data-path={path}
    >
      {children}
    </div>
  )
}))

describe('TechOrbit Component', () => {
  describe('Rendering', () => {
    it('renders main container with correct styling', () => {
      render(<TechOrbit />)
      
      const container = screen.getByTestId('orbiting-circles').parentElement
      expect(container).toHaveClass('relative', 'h-[500px]', 'w-full')
    })

    it('renders three orbiting circles', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      expect(orbitingCircles).toHaveLength(3)
    })
  })

  describe('Outer Orbit (Frontend Technologies)', () => {
    it('configures outer orbit correctly', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      const outerOrbit = orbitingCircles[0]
      
      expect(outerOrbit).toHaveAttribute('data-radius', '160')
      expect(outerOrbit).toHaveAttribute('data-duration', '50')
      expect(outerOrbit).toHaveAttribute('data-reverse', 'false')
      expect(outerOrbit).toHaveAttribute('data-path', 'true')
    })

    it('renders frontend technology icons in outer orbit', () => {
      render(<TechOrbit />)
      
      const frontendIcons = [
        'icon-nextjs',
        'icon-react',
        'icon-typescript',
        'icon-tailwind',
        'icon-sass',
        'icon-vue'
      ]
      
      frontendIcons.forEach(iconTestId => {
        expect(screen.getByTestId(iconTestId)).toBeInTheDocument()
      })
    })

    it('applies correct icon size to outer orbit icons', () => {
      render(<TechOrbit />)
      
      const nextjsIcon = screen.getByTestId('icon-nextjs')
      expect(nextjsIcon).toHaveAttribute('data-size', '32')
    })

    it('applies correct styling classes to outer orbit icons', () => {
      render(<TechOrbit />)
      
      const reactIcon = screen.getByTestId('icon-react')
      expect(reactIcon).toHaveClass(
        'hover:cursor-default',
        'text-secondary-700',
        'dark:text-secondary-500',
        'hover:text-secondary-900',
        'hover:dark:text-secondary-300',
        'filter',
        'hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
        'dark:hover:drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]',
        'transition-all',
        'duration-300'
      )
    })
  })

  describe('Middle Orbit (Backend Technologies)', () => {
    it('configures middle orbit correctly', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      const middleOrbit = orbitingCircles[1]
      
      expect(middleOrbit).toHaveAttribute('data-radius', '100')
      expect(middleOrbit).toHaveAttribute('data-duration', '40')
      expect(middleOrbit).toHaveAttribute('data-reverse', 'true')
      expect(middleOrbit).toHaveAttribute('data-path', 'true')
    })

    it('renders backend technology icons in middle orbit', () => {
      render(<TechOrbit />)
      
      const backendIcons = [
        'icon-laravel',
        'icon-python',
        'icon-graphql',
        'icon-nodejs',
        'icon-docker'
      ]
      
      backendIcons.forEach(iconTestId => {
        expect(screen.getByTestId(iconTestId)).toBeInTheDocument()
      })
    })

    it('applies correct icon size to middle orbit icons', () => {
      render(<TechOrbit />)
      
      const laravelIcon = screen.getByTestId('icon-laravel')
      expect(laravelIcon).toHaveAttribute('data-size', '32')
    })
  })

  describe('Inner Orbit (Database & Cloud)', () => {
    it('configures inner orbit correctly', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      const innerOrbit = orbitingCircles[2]
      
      expect(innerOrbit).toHaveAttribute('data-radius', '50')
      expect(innerOrbit).toHaveAttribute('data-duration', '30')
      expect(innerOrbit).toHaveAttribute('data-reverse', 'false')
      expect(innerOrbit).toHaveAttribute('data-path', 'true')
    })

    it('renders database and cloud icons in inner orbit', () => {
      render(<TechOrbit />)
      
      const databaseCloudIcons = [
        'icon-sqlite',
        'icon-postgresql',
        'icon-aws'
      ]
      
      databaseCloudIcons.forEach(iconTestId => {
        expect(screen.getByTestId(iconTestId)).toBeInTheDocument()
      })
    })

    it('applies correct icon size to inner orbit icons', () => {
      render(<TechOrbit />)
      
      const sqliteIcon = screen.getByTestId('icon-sqlite')
      expect(sqliteIcon).toHaveAttribute('data-size', '32')
    })
  })

  describe('Icon Styling', () => {
    it('applies consistent styling to all technology icons', () => {
      render(<TechOrbit />)
      
      const allIcons = [
        'icon-nextjs', 'icon-react', 'icon-typescript', 'icon-tailwind',
        'icon-sass', 'icon-vue', 'icon-laravel', 'icon-python',
        'icon-graphql', 'icon-nodejs', 'icon-docker', 'icon-sqlite',
        'icon-postgresql', 'icon-aws'
      ]
      
      const expectedClasses = [
        'hover:cursor-default',
        'text-secondary-700',
        'dark:text-secondary-500',
        'hover:text-secondary-900',
        'hover:dark:text-secondary-300',
        'filter',
        'hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
        'dark:hover:drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]',
        'transition-all',
        'duration-300'
      ]
      
      allIcons.forEach(iconTestId => {
        const icon = screen.getByTestId(iconTestId)
        expectedClasses.forEach(className => {
          expect(icon).toHaveClass(className)
        })
      })
    })

    it('uses consistent icon size across all orbits', () => {
      render(<TechOrbit />)
      
      const allIcons = screen.getAllByTestId(/^icon-/)
      
      allIcons.forEach(icon => {
        expect(icon).toHaveAttribute('data-size', '32')
      })
    })
  })

  describe('Orbit Configuration', () => {
    it('uses different speeds for each orbit', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      
      expect(orbitingCircles[0]).toHaveAttribute('data-duration', '50') // Outer - slowest
      expect(orbitingCircles[1]).toHaveAttribute('data-duration', '40') // Middle - medium
      expect(orbitingCircles[2]).toHaveAttribute('data-duration', '30') // Inner - fastest
    })

    it('uses different radii for each orbit', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      
      expect(orbitingCircles[0]).toHaveAttribute('data-radius', '160') // Outer - largest
      expect(orbitingCircles[1]).toHaveAttribute('data-radius', '100') // Middle - medium
      expect(orbitingCircles[2]).toHaveAttribute('data-radius', '50')  // Inner - smallest
    })

    it('configures reverse rotation correctly', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      
      expect(orbitingCircles[0]).toHaveAttribute('data-reverse', 'false') // Outer - normal
      expect(orbitingCircles[1]).toHaveAttribute('data-reverse', 'true')  // Middle - reverse
      expect(orbitingCircles[2]).toHaveAttribute('data-reverse', 'false') // Inner - normal
    })

    it('enables path visibility for all orbits', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      
      orbitingCircles.forEach(orbit => {
        expect(orbit).toHaveAttribute('data-path', 'true')
      })
    })
  })

  describe('Technology Categories', () => {
    it('groups frontend technologies in outer orbit', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      const outerOrbit = orbitingCircles[0]
      
      const frontendTechs = [
        screen.getByTestId('icon-nextjs'),
        screen.getByTestId('icon-react'),
        screen.getByTestId('icon-typescript'),
        screen.getByTestId('icon-tailwind'),
        screen.getByTestId('icon-sass'),
        screen.getByTestId('icon-vue')
      ]
      
      frontendTechs.forEach(tech => {
        expect(outerOrbit).toContainElement(tech)
      })
    })

    it('groups backend technologies in middle orbit', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      const middleOrbit = orbitingCircles[1]
      
      const backendTechs = [
        screen.getByTestId('icon-laravel'),
        screen.getByTestId('icon-python'),
        screen.getByTestId('icon-graphql'),
        screen.getByTestId('icon-nodejs'),
        screen.getByTestId('icon-docker')
      ]
      
      backendTechs.forEach(tech => {
        expect(middleOrbit).toContainElement(tech)
      })
    })

    it('groups database and cloud technologies in inner orbit', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      const innerOrbit = orbitingCircles[2]
      
      const dataCloudTechs = [
        screen.getByTestId('icon-sqlite'),
        screen.getByTestId('icon-postgresql'),
        screen.getByTestId('icon-aws')
      ]
      
      dataCloudTechs.forEach(tech => {
        expect(innerOrbit).toContainElement(tech)
      })
    })
  })

  describe('Icon Distribution', () => {
    it('distributes correct number of icons per orbit', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      
      // Outer orbit should have 6 icons
      const outerIcons = orbitingCircles[0].children
      expect(outerIcons).toHaveLength(6)
      
      // Middle orbit should have 5 icons
      const middleIcons = orbitingCircles[1].children
      expect(middleIcons).toHaveLength(5)
      
      // Inner orbit should have 3 icons
      const innerIcons = orbitingCircles[2].children
      expect(innerIcons).toHaveLength(3)
    })

    it('renders total of 14 technology icons', () => {
      render(<TechOrbit />)
      
      const allIcons = screen.getAllByTestId(/^icon-/)
      expect(allIcons).toHaveLength(14) // 6 + 5 + 3 = 14 total icons
    })
  })

  describe('Hover Effects', () => {
    it('applies hover cursor styling', () => {
      render(<TechOrbit />)
      
      const reactIcon = screen.getByTestId('icon-react')
      expect(reactIcon).toHaveClass('hover:cursor-default')
    })

    it('applies hover color transitions', () => {
      render(<TechOrbit />)
      
      const pythonIcon = screen.getByTestId('icon-python')
      expect(pythonIcon).toHaveClass(
        'hover:text-secondary-900',
        'hover:dark:text-secondary-300'
      )
    })

    it('applies hover drop shadow effects', () => {
      render(<TechOrbit />)
      
      const dockerIcon = screen.getByTestId('icon-docker')
      expect(dockerIcon).toHaveClass(
        'filter',
        'hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]',
        'dark:hover:drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]'
      )
    })

    it('applies transition timing to hover effects', () => {
      render(<TechOrbit />)
      
      const awsIcon = screen.getByTestId('icon-aws')
      expect(awsIcon).toHaveClass('transition-all', 'duration-300')
    })
  })

  describe('Color Theming', () => {
    it('applies light theme colors', () => {
      render(<TechOrbit />)
      
      const typescriptIcon = screen.getByTestId('icon-typescript')
      expect(typescriptIcon).toHaveClass('text-secondary-700')
    })

    it('applies dark theme colors', () => {
      render(<TechOrbit />)
      
      const tailwindIcon = screen.getByTestId('icon-tailwind')
      expect(tailwindIcon).toHaveClass('dark:text-secondary-500')
    })

    it('applies hover colors for both themes', () => {
      render(<TechOrbit />)
      
      const postgresIcon = screen.getByTestId('icon-postgresql')
      expect(postgresIcon).toHaveClass(
        'hover:text-secondary-900',
        'hover:dark:text-secondary-300'
      )
    })
  })

  describe('Component Integration', () => {
    it('integrates with OrbitingCircles component correctly', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      expect(orbitingCircles).toHaveLength(3)
      
      orbitingCircles.forEach(orbit => {
        expect(orbit).toHaveAttribute('data-radius')
        expect(orbit).toHaveAttribute('data-duration')
        expect(orbit).toHaveAttribute('data-path')
      })
    })

    it('passes children correctly to OrbitingCircles', () => {
      render(<TechOrbit />)
      
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      
      orbitingCircles.forEach(orbit => {
        expect(orbit.children.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles missing icon imports gracefully', () => {
      expect(() => render(<TechOrbit />)).not.toThrow()
    })

    it('maintains structure with all required orbits', () => {
      render(<TechOrbit />)
      
      const container = screen.getAllByTestId('orbiting-circles')[0].parentElement
      const orbitingCircles = screen.getAllByTestId('orbiting-circles')
      
      expect(container).toContainElement(orbitingCircles[0]) // Outer
      expect(container).toContainElement(orbitingCircles[1]) // Middle
      expect(container).toContainElement(orbitingCircles[2]) // Inner
    })
  })
})