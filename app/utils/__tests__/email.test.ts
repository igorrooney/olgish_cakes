import { sendEmail } from '../email'

// Mock Resend
const mockSend = jest.fn()
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

describe('email', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.RESEND_API_KEY = 'test-api-key'
    process.env.NEXT_PUBLIC_EMAIL_FROM = 'Test <test@example.com>'
  })

  describe('sendEmail', () => {
    it('should send email with basic params', async () => {
      process.env.ADMIN_BCC_EMAIL = 'igorrooney@gmail.com'
      actualMockSend.mockResolvedValue({ data: { id: 'email-123' }, error: null })

      await sendEmail({
        to: 'customer@example.com',
        subject: 'Test Subject',
        text: 'Test message'
      })

      expect(actualMockSend).toHaveBeenCalledWith({
        from: 'Test <test@example.com>',
        to: 'customer@example.com',
        bcc: 'igorrooney@gmail.com',
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

      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })

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

      const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' })
      const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' })

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

    it('should throw error when Resend returns error', async () => {
      actualMockSend.mockResolvedValue({ error: { message: 'Invalid API key' } })

      await expect(sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message'
      })).rejects.toThrow('Invalid API key')
    })

    it('should log error on failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      actualMockSend.mockRejectedValue(new Error('Network error'))

      await expect(sendEmail({
        to: 'customer@example.com',
        subject: 'Test',
        text: 'Message'
      })).rejects.toThrow('Network error')

      expect(consoleSpy).toHaveBeenCalledWith('Error sending email:', expect.any(Error))
      consoleSpy.mockRestore()
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

      const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })

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

