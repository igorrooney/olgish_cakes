/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileHeader } from '../MobileHeader';

describe('MobileHeader', () => {
  it('renders logo and menu button', () => {
    render(<MobileHeader />);
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
    expect(screen.getByAltText(/olgish cakes logo/i)).toBeInTheDocument();
  });

  it('opens and closes menu on button click', () => {
    render(<MobileHeader />);
    const button = screen.getByLabelText(/open menu/i);
    
    fireEvent.click(button);
    expect(screen.getByLabelText(/close menu/i)).toBeInTheDocument();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes menu when clicking outside', () => {
    render(<MobileHeader />);
    const button = screen.getByLabelText(/open menu/i);
    fireEvent.click(button);
    
    const menu = screen.getByRole('menu');
    expect(menu).toBeInTheDocument();
    
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes menu on Escape key', () => {
    render(<MobileHeader />);
    const button = screen.getByLabelText(/open menu/i);
    fireEvent.click(button);
    
    expect(screen.getByRole('menu')).toBeInTheDocument();
    
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<MobileHeader />);
    const button = screen.getByLabelText(/open menu/i);
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-controls', 'mobile-menu');
    expect(button).toHaveAttribute('aria-haspopup', 'true');
  });

  it('updates aria-expanded when menu opens', () => {
    render(<MobileHeader />);
    const button = screen.getByLabelText(/open menu/i);
    
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes menu when clicking on a link', () => {
    render(<MobileHeader />);
    const button = screen.getByLabelText(/open menu/i);
    fireEvent.click(button);
    
    const link = screen.getByRole('menuitem', { name: /cakes by post/i });
    fireEvent.click(link);
    
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('menu items have proper role', () => {
    render(<MobileHeader />);
    const button = screen.getByLabelText(/open menu/i);
    fireEvent.click(button);
    
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems.length).toBeGreaterThan(0);
  });
});

