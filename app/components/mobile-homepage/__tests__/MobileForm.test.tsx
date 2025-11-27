/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MobileForm } from '../MobileForm';

describe('MobileForm', () => {
  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all form fields', () => {
    render(<MobileForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/postcode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/when do you need it/i)).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    render(<MobileForm />);
    const submitButton = screen.getByRole('button', { name: /submit/i });
    
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    render(<MobileForm />);
    
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+44 7123 456789' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Leeds' } });
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: 'LS1 1AA' } });
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: '2024-12-25' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });

  it('shows success message after successful submission', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Success' }),
    });

    render(<MobileForm />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+44 7123 456789' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Leeds' } });
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: 'LS1 1AA' } });
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: '2024-12-25' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 100))
    );

    render(<MobileForm />);
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '+44 7123 456789' } });
    fireEvent.change(screen.getByLabelText(/address/i), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Leeds' } });
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: 'LS1 1AA' } });
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: '2024-12-25' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/submitting/i)).toBeInTheDocument();
  });
});

