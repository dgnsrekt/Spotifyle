import { render, screen } from '@testing-library/react'
import { LogoutButton } from '../logout-button'

describe('LogoutButton', () => {
  it('should render a form with POST method', () => {
    const { container } = render(<LogoutButton />)
    
    const form = container.querySelector('form')
    expect(form).toHaveAttribute('action', '/api/auth/signout')
    expect(form).toHaveAttribute('method', 'POST')
  })

  it('should render sign out button', () => {
    render(<LogoutButton />)
    
    const button = screen.getByRole('button', { name: /sign out/i })
    expect(button).toBeInTheDocument()
  })

  it('should have submit type button', () => {
    render(<LogoutButton />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('should have proper styling with Shadcn/ui Button', () => {
    render(<LogoutButton />)
    
    const button = screen.getByRole('button')
    // Shadcn/ui Button component uses secondary variant and has base classes
    expect(button).toHaveClass('bg-secondary')
    expect(button).toHaveClass('text-secondary-foreground')
    expect(button).toHaveClass('hover:bg-secondary/80')
  })

  it('should have focus ring styling', () => {
    render(<LogoutButton />)
    
    const button = screen.getByRole('button')
    // Shadcn/ui Button has built-in focus-visible styles
    expect(button).toHaveClass('focus-visible:ring-ring/50')
  })

  it('should have transition effect', () => {
    render(<LogoutButton />)
    
    const button = screen.getByRole('button')
    // Shadcn/ui Button uses transition-all
    expect(button).toHaveClass('transition-all')
  })
})