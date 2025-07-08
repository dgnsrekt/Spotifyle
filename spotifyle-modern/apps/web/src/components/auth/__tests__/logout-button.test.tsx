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

  it('should have proper styling for dark theme', () => {
    render(<LogoutButton />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-gray-700')
    expect(button).toHaveClass('text-gray-200')
    expect(button).toHaveClass('hover:bg-gray-600')
  })

  it('should have focus ring styling', () => {
    render(<LogoutButton />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('focus:ring-2')
    expect(button).toHaveClass('focus:ring-gray-500')
    expect(button).toHaveClass('focus:ring-offset-2')
    expect(button).toHaveClass('focus:ring-offset-gray-800')
  })

  it('should have transition effect', () => {
    render(<LogoutButton />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('transition-colors')
  })
})