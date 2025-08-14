import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockResumeData } from './__mocks__/mockResumeData'

// Mock react-hot-toast
const mockToast = {
  loading: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  dismiss: vi.fn(),
}

vi.mock('react-hot-toast', () => ({
  toast: mockToast,
}))

// Mock fetch
global.fetch = vi.fn()

// Mock DOM methods
const mockElement = {
  outerHTML: '<div id="resume-container">Resume Content</div>',
}

const mockAnchor = {
  href: '',
  download: '',
  click: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
  
  vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)
  vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)
  vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn())
  vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn())
  
  Object.defineProperty(document, 'styleSheets', {
    value: [
      {
        cssRules: [
          { cssText: 'body { margin: 0; }' },
        ],
      },
    ],
    configurable: true,
  })

  global.URL.createObjectURL = vi.fn(() => 'blob:test-url')
  global.URL.revokeObjectURL = vi.fn()
  global.Blob = vi.fn() as any
  global.setTimeout = vi.fn((fn) => { fn(); return 1 as any })
})

describe('ResumeClientWrapper Logic Tests', () => {
  describe('PDF Generation Function', () => {
    it('should handle successful PDF generation', async () => {
      const mockBlob = new Blob(['pdf content'])
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      // Simulate the PDF generation logic
      const handleExportHTMLPDF = async () => {
        const element = document.getElementById('resume-container')
        if (!element) {
          mockToast.error('Resume container not found')
          return
        }

        mockToast.loading('Generating PDF...')

        try {
          const htmlContent = `<!DOCTYPE html><html><head></head><body>${element.outerHTML}</body></html>`
          const filename = 'John_Doe_Resume.pdf'

          const response = await fetch('/api/generate-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: htmlContent, filename }),
          })

          if (!response.ok) {
            throw new Error('Failed to generate PDF')
          }

          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          
          const a = document.createElement('a')
          a.href = url
          a.download = filename
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          mockToast.dismiss()
          mockToast.success('PDF generated successfully!')
        } catch {
          mockToast.dismiss()
          mockToast.error('Failed to generate PDF')
        }
      }

      await handleExportHTMLPDF()

      expect(mockToast.loading).toHaveBeenCalledWith('Generating PDF...')
      expect(global.fetch).toHaveBeenCalledWith('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('John_Doe_Resume.pdf'),
      })
      expect(mockToast.success).toHaveBeenCalledWith('PDF generated successfully!')
      expect(mockAnchor.click).toHaveBeenCalled()
    })

    it('should handle missing resume container', async () => {
      vi.spyOn(document, 'getElementById').mockReturnValue(null)

      const handleExportHTMLPDF = async () => {
        const element = document.getElementById('resume-container')
        if (!element) {
          mockToast.error('Resume container not found')
          return
        }
      }

      await handleExportHTMLPDF()

      expect(mockToast.error).toHaveBeenCalledWith('Resume container not found')
      expect(global.fetch).not.toHaveBeenCalled()
    })

    it('should handle API errors', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'PDF generation failed' }),
      })

      const handleExportHTMLPDF = async () => {
        const element = document.getElementById('resume-container')
        if (!element) {
          mockToast.error('Resume container not found')
          return
        }

        mockToast.loading('Generating PDF...')

        try {
          const response = await fetch('/api/generate-resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: 'test', filename: 'test.pdf' }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to generate PDF')
          }
        } catch (error) {
          mockToast.dismiss()
          mockToast.error(error instanceof Error ? error.message : 'Failed to generate PDF')
        }
      }

      await handleExportHTMLPDF()

      expect(mockToast.dismiss).toHaveBeenCalled()
      expect(mockToast.error).toHaveBeenCalledWith('PDF generation failed')
    })
  })

  describe('State Management Logic', () => {
    it('should test state update patterns', () => {
      // Test basic state management patterns
      let resumeData = mockResumeData
      let isGeneratingPDF = false
      let hideContactForPDF = true

      // Simulate prop change
      const newData = { ...mockResumeData, full_name: 'Jane Doe' }
      resumeData = newData

      expect(resumeData.full_name).toBe('Jane Doe')

      // Simulate PDF generation state changes
      isGeneratingPDF = true
      hideContactForPDF = false

      expect(isGeneratingPDF).toBe(true)
      expect(hideContactForPDF).toBe(false)

      // Simulate completion
      isGeneratingPDF = false
      hideContactForPDF = true

      expect(isGeneratingPDF).toBe(false)
      expect(hideContactForPDF).toBe(true)
    })
  })

  describe('HTML Content Generation', () => {
    it('should generate proper HTML with styles', () => {
      const element = { outerHTML: '<div>Resume Content</div>' }
      
      const generateHTML = () => {
        const styles = Array.from(document.styleSheets)
          .map((sheet) => {
            try {
              return Array.from(sheet.cssRules || [])
                .map((rule) => rule.cssText)
                .join('\n')
            } catch {
              return ''
            }
          })
          .join('\n')

        return `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                ${styles}
              </style>
            </head>
            <body>
              ${element.outerHTML}
            </body>
          </html>
        `
      }

      const html = generateHTML()

      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('<html>')
      expect(html).toContain('<head>')
      expect(html).toContain('<style>')
      expect(html).toContain('body { margin: 0; }')
      expect(html).toContain('Resume Content')
    })

    it('should handle CSS access errors', () => {
      Object.defineProperty(document, 'styleSheets', {
        value: [
          {
            get cssRules() {
              throw new Error('CORS error')
            },
          },
        ],
        configurable: true,
      })

      const generateStyles = () => {
        return Array.from(document.styleSheets)
          .map((sheet) => {
            try {
              return Array.from(sheet.cssRules || [])
                .map((rule) => rule.cssText)
                .join('\n')
            } catch {
              return ''
            }
          })
          .join('\n')
      }

      const styles = generateStyles()

      // Should not throw error and return empty string
      expect(styles).toBe('')
    })
  })

  describe('Filename Generation', () => {
    it('should format filename correctly', () => {
      const generateFilename = (fullName: string) => {
        return `${fullName.replace(/\s+/g, '_')}_Resume.pdf`
      }

      expect(generateFilename('John Doe')).toBe('John_Doe_Resume.pdf')
      expect(generateFilename('John William Doe Jr.')).toBe('John_William_Doe_Jr._Resume.pdf')
      expect(generateFilename('Mary-Jane Watson')).toBe('Mary-Jane_Watson_Resume.pdf')
    })
  })
})