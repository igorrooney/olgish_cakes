/**
 * @jest-environment node
 */
import { POST } from '../route';
import { NextRequest } from 'next/server';
import { validateCsrfToken } from '@/lib/csrf';

// Mock the CSRF validation
jest.mock('@/lib/csrf', () => ({
  validateCsrfToken: jest.fn(),
}));

describe('/api/custom-cake-enquiry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects request without CSRF token', async () => {
    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+44(0)7123456789',
        address: '123 Test St',
        city: 'Leeds',
        postcode: 'LS1 1AA',
        date: '2024-12-25',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('CSRF token missing');
  });

  it('rejects request with invalid CSRF token', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(false);

    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+44(0)7123456789',
        address: '123 Test St',
        city: 'Leeds',
        postcode: 'LS1 1AA',
        date: '2024-12-25',
        csrfToken: 'invalid-token',
      }),
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'csrf-token=invalid-token',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Invalid CSRF token');
    expect(validateCsrfToken).toHaveBeenCalled();
  });

  it('accepts request with valid CSRF token', async () => {
    (validateCsrfToken as jest.Mock).mockReturnValue(true);

    const request = new NextRequest('http://localhost/api/custom-cake-enquiry', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '+44(0)7123456789',
        address: '123 Test St',
        city: 'Leeds',
        postcode: 'LS1 1AA',
        date: '2024-12-25',
        csrfToken: 'valid-token',
      }),
      headers: {
        'Content-Type': 'application/json',
        Cookie: 'csrf-token=valid-token',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBe('Enquiry submitted successfully');
    expect(validateCsrfToken).toHaveBeenCalledWith('valid-token', 'valid-token');
  });
});

