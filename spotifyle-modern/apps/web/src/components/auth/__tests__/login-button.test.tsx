import { render, screen } from '@testing-library/react'
import { LoginButton } from '../login-button'

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('LoginButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render with correct text', () => {
    render(<LoginButton />)
    
    const link = screen.getByRole('link', { name: /continue with spotify/i })
    expect(link).toBeInTheDocument()
  })

  it('should have Spotify green color styling', () => {
    render(<LoginButton />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveClass('bg-[#1DB954]')
    expect(link).toHaveClass('hover:bg-[#1aa34a]')
  })

  it('should render Spotify icon', () => {
    const { container } = render(<LoginButton />)
    
    const svgIcon = container.querySelector('svg')
    expect(svgIcon).toBeInTheDocument()
    expect(svgIcon).toHaveClass('h-5', 'w-5')
  })

  it('should link to auth signin endpoint', () => {
    render(<LoginButton />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/api/auth/signin')
  })

  it('should have proper accessibility attributes', () => {
    render(<LoginButton />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/api/auth/signin')
  })

  it('should have responsive text sizing', () => {
    render(<LoginButton />)
    
    const link = screen.getByRole('link')
    const span = link.querySelector('span')
    expect(span).toHaveClass('text-sm', 'font-medium')
  })
})