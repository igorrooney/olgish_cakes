import { sendEmail } from '../email'

// Mock Resend
const mockSend = jest.fn()

jest.mock('@/lib/logger', () => {
  const loggerError = jest.fn()
  return {
    logger: {
      error: loggerError
    },
    __mockLoggerError: loggerError
  }
})

jest.mock('resend', () => {
  const mockSend = jest.fn()
  return {
    Resend: jest.fn(() => ({
      emails: {
        send: mockSend
      }
    })),
    __mockSend: mockSend
  }
})

const { __mockSend } = jest.requireMock('resend')
const actualMockSend = __mockSend || mockSend
const { __mockLoggerError } = jest.requireMock('@/lib/logger')

describe('email', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.NEXT_PUBLIC_EMAIL_FROM = 'Test <test@example.com>'
  })

  describe('sendEmail', () => {
    it('should send email with basic params', async () => {
      process.env.ADMIN_BCC_EMAIL = 'owner@example.com'
      actualMockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Test Subject',
        text: 'Test message'
      })

      expect(actualMockSend).toHaveBeenCalledWith({
        from: 'Test <test@example.com>',
        to: 'customer@example.com',
        bcc: 'owner@example.com',
        subject: 'Test Subject',
        text: 'Test message',
        attachments: []
      })
    })

    it('should use default from email when not configured', async () => {
      delete process.env.NEXT_PUBLIC_EMAIL_FROM
      actualMockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message'
      })

      expect(actualMockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'Olgish Cakes <hello@olgishcakes.co.uk>'
        })
      )
    })

    it('should include custom BCC', async () => {
      actualMockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message',
        bcc: 'custom@example.com'
      })

      expect(actualMockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          bcc: 'custom@example.com'
        })
      )
    })

    it('should handle attachments', async () => {
      actualMockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      // Create a mock File with arrayBuffer method
      const mockArrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8))
      const mockFile = {
        name: 'test.txt',
        type: 'text/plain',
        arrayBuffer: mockArrayBuffer
      } as unknown as File

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message',
        attachments: [{
          filename: 'test.txt',
          content: mockFile
        }]
      })

      expect(actualMockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({
              filename: 'test.txt',
              content: expect.any(Buffer)
            })
          ])
        })
      )
    })

    it('should handle multiple attachments', async () => {
      actualMockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      // Create mock Files with arrayBuffer method
      const mockArrayBuffer1 = jest.fn().mockResolvedValue(new ArrayBuffer(8))
      const mockArrayBuffer2 = jest.fn().mockResolvedValue(new ArrayBuffer(8))
      const file1 = {
        name: 'file1.txt',
        type: 'text/plain',
        arrayBuffer: mockArrayBuffer1
      } as unknown as File
      const file2 = {
        name: 'file2.txt',
        type: 'text/plain',
        arrayBuffer: mockArrayBuffer2
      } as unknown as File

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message',
        attachments: [
          { filename: 'file1.txt', content: file1 },
          { filename: 'file2.txt', content: file2 }
        ]
      })

      expect(actualMockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          attachments: expect.arrayContaining([
            expect.objectContaining({ filename: 'file1.txt' }),
            expect.objectContaining({ filename: 'file2.txt' })
          ])
        })
      )
    })

    it('should not expose a Resend provider error', async () => {
      actualMockSend.mockResolvedValue({ error: { message: 'Invalid API key' } })

      await expect(sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message'
      })).rejects.toThrow('Email delivery failed')

      expect(JSON.stringify(__mockLoggerError.mock.calls)).not.toContain('Invalid API key')
    })

    it('should log only safe operational metadata on failure', async () => {
      actualMockSend.mockRejectedValue(new Error('Network error'))

      await expect(sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message'
      })).rejects.toThrow('Email delivery failed')

      expect(__mockLoggerError).toHaveBeenCalledWith('Email delivery failed', {
        operation: 'email.send',
        code: 'OPERATION_FAILED'
      })
      expect(JSON.stringify(__mockLoggerError.mock.calls)).not.toContain('Network error')
    })

    it('should return response on success', async () => {
      const mockResponse = { data: { id: 'email-123' }, error: null }
      actualMockSend.mockResolvedValue(mockResponse)

      const result = await sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message'
      })

      expect(result).toEqual(mockResponse)
    })

    it('should handle file conversion to buffer', async () => {
      actualMockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      // Create a mock File with arrayBuffer method
      const mockArrayBuffer = jest.fn().mockResolvedValue(new ArrayBuffer(8))
      const mockFile = {
        name: 'test.txt',
        type: 'text/plain',
        arrayBuffer: mockArrayBuffer
      } as unknown as File

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message',
        attachments: [{ filename: 'test.txt', content: mockFile }]
      })

      const call = actualMockSend.mock.calls[0][0]
      expect(call.attachments[0].content).toBeInstanceOf(Buffer)
    })
  })
})

