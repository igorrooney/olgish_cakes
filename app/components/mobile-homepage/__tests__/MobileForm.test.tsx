/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MobileForm } from '../MobileForm';

describe('MobileForm', () => {
  beforeEach(() => {
    // Mock fetch with CSRF token handler
    global.fetch = jest.fn((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' }),
        });
      }
      // For other URLs, return a rejected promise (tests will override this)
      return Promise.reject(new Error('Unexpected fetch call'));
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders all form fields', () => {
    render(<MobileForm />);
    expect(screen.getByLabelText(/full name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone number:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^address:$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^city:$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^postcode:$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/when do you need it/i)).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    // Mock CSRF token fetch (already mocked in beforeEach, but ensure it's available)
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' }),
        });
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });

    render(<MobileForm />);
    
    // Wait for CSRF token to be loaded
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/csrf-token');
    });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    // Mock form submission (CSRF token is already mocked in beforeEach)
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' }),
        });
      }
      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Success' }),
        });
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });

    render(<MobileForm />);
    
    // Wait for CSRF token to be loaded
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/csrf-token');
    });
    
    fireEvent.change(screen.getByLabelText(/full name:/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address:/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone number:/i), { target: { value: '+44(0)7123456789' } });
    fireEvent.change(screen.getByLabelText(/^address:$/i), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByLabelText(/^city:$/i), { target: { value: 'Leeds' } });
    fireEvent.change(screen.getByLabelText(/^postcode:$/i), { target: { value: 'LS1 1AA' } });
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: '2024-12-25' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }));
    });
    
    // Verify CSRF token is included in the request
    const formSubmitCall = (global.fetch as jest.Mock).mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === '/api/custom-cake-enquiry'
    );
    if (formSubmitCall && formSubmitCall[1]?.body) {
      const body = JSON.parse(formSubmitCall[1].body);
      expect(body.csrfToken).toBe('test-csrf-token-123');
    }
  });

  it('shows success message after successful submission', async () => {
    // Mock form submission (CSRF token is already mocked in beforeEach)
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' }),
        });
      }
      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Success' }),
        });
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });

    render(<MobileForm />);
    
    // Wait for CSRF token to be loaded
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/csrf-token');
    });
    
    // Fill form
    fireEvent.change(screen.getByLabelText(/full name:/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address:/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone number:/i), { target: { value: '+44(0)7123456789' } });
    fireEvent.change(screen.getByLabelText(/^address:$/i), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByLabelText(/^city:$/i), { target: { value: 'Leeds' } });
    fireEvent.change(screen.getByLabelText(/^postcode:$/i), { target: { value: 'LS1 1AA' } });
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: '2024-12-25' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/thank you/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    let resolveFetch: (value: any) => void;
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve;
    });
    
    // Mock form submission with delayed response (CSRF token is already mocked in beforeEach)
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' }),
        });
      }
      if (url === '/api/custom-cake-enquiry') {
        return fetchPromise.then(() => ({ ok: true, json: async () => ({}) }));
      }
      return Promise.reject(new Error('Unexpected fetch call'));
    });

    render(<MobileForm />);
    
    // Wait for CSRF token to be loaded
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/csrf-token');
    });
    
    // Fill form with valid data matching the regex patterns
    // Phone regex: /^\+44\s?\(?0\)?\s?\d{4}\s?\d{3}\s?\d{3}$/
    // Valid formats: +44(0)7123456789, +447123456789, +44 0 7123 456789
    fireEvent.change(screen.getByLabelText(/full name:/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/email address:/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/phone number:/i), { target: { value: '+44(0)7123456789' } });
    fireEvent.change(screen.getByLabelText(/^address:$/i), { target: { value: '123 Test Street' } });
    fireEvent.change(screen.getByLabelText(/^city:$/i), { target: { value: 'Leeds' } });
    // Postcode regex: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i
    fireEvent.change(screen.getByLabelText(/^postcode:$/i), { target: { value: 'LS1 1AA' } });
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: '2024-12-25' } });
    
    const submitButton = screen.getByRole('button', { name: /submit/i });
    
    // Submit form - use fireEvent.submit on the form element for more realistic behavior
    const form = submitButton.closest('form');
    if (form) {
      fireEvent.submit(form);
    } else {
      fireEvent.click(submitButton);
    }
    
    // Wait for submitting text to appear (indicates isSubmitting is true and validation passed)
    // This will fail if validation fails, so we know the form is valid if this passes
    await waitFor(() => {
      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Now check that button is disabled (re-query to get updated state)
    const disabledButton = screen.getByRole('button', { name: /submitting/i });
    expect(disabledButton).toBeDisabled();
    
    // Resolve the fetch to complete the test
    resolveFetch!({});
    
    // Wait for submission to complete and button to be enabled again
    await waitFor(() => {
      const enabledButton = screen.getByRole('button', { name: /submit/i });
      expect(enabledButton).not.toBeDisabled();
    });
  });
});

