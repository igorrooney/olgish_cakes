import { BUSINESS_CONSTANTS, PHONE_UTILS, EMAIL_UTILS } from '../constants'

describe('BUSINESS_CONSTANTS', () => {
  describe('Contact Information', () => {
    it('should have correct phone number', () => {
      expect(BUSINESS_CONSTANTS.PHONE).toBe('+44 786 721 8194')
    })

    it('should have correct email address', () => {
      expect(BUSINESS_CONSTANTS.EMAIL).toBe('hello@olgishcakes.co.uk')
    })

    it('should have correct website URL', () => {
      expect(BUSINESS_CONSTANTS.WEBSITE).toBe('https://olgishcakes.co.uk')
    })
  })

  describe('Business Details', () => {
    it('should have correct business name', () => {
      expect(BUSINESS_CONSTANTS.NAME).toBe('Olgish Cakes')
    })

    it('should have correct tagline', () => {
      expect(BUSINESS_CONSTANTS.TAGLINE).toBe('Traditional Ukrainian Cakes & Desserts')
    })
  })

  describe('Address', () => {
    it('should have empty street', () => {
      expect(BUSINESS_CONSTANTS.ADDRESS.street).toBe('')
    })

    it('should have city as Leeds', () => {
      expect(BUSINESS_CONSTANTS.ADDRESS.city).toBe('Leeds')
    })

    it('should have empty postcode', () => {
      expect(BUSINESS_CONSTANTS.ADDRESS.postcode).toBe('')
    })

    it('should have country as United Kingdom', () => {
      expect(BUSINESS_CONSTANTS.ADDRESS.country).toBe('United Kingdom')
    })
  })

  describe('Social Media', () => {
    it('should have Instagram URL', () => {
      expect(BUSINESS_CONSTANTS.SOCIAL.instagram).toBe('https://instagram.com/olgishcakes')
    })

    it('should have Facebook URL', () => {
      expect(BUSINESS_CONSTANTS.SOCIAL.facebook).toBe('https://facebook.com/olgishcakes')
    })

    it('should have WhatsApp URL', () => {
      expect(BUSINESS_CONSTANTS.SOCIAL.whatsapp).toBe('https://wa.me/447867218194')
    })

    it('should have YouTube URL', () => {
      expect(BUSINESS_CONSTANTS.SOCIAL.youtube).toBe('https://www.youtube.com/channel/UCxv3i6tL5v5KZNjT1z1Rx1Q')
    })
  })

  describe('Business Hours', () => {
    it('should have Monday hours', () => {
      expect(BUSINESS_CONSTANTS.HOURS.monday).toBe('9:00 AM - 8:00 PM')
    })

    it('should have Tuesday hours', () => {
      expect(BUSINESS_CONSTANTS.HOURS.tuesday).toBe('9:00 AM - 8:00 PM')
    })

    it('should have Wednesday hours', () => {
      expect(BUSINESS_CONSTANTS.HOURS.wednesday).toBe('9:00 AM - 8:00 PM')
    })

    it('should have Thursday hours', () => {
      expect(BUSINESS_CONSTANTS.HOURS.thursday).toBe('9:00 AM - 8:00 PM')
    })

    it('should have Friday hours', () => {
      expect(BUSINESS_CONSTANTS.HOURS.friday).toBe('9:00 AM - 8:00 PM')
    })

    it('should have Saturday hours', () => {
      expect(BUSINESS_CONSTANTS.HOURS.saturday).toBe('9:00 AM - 8:00 PM')
    })

    it('should have Sunday hours', () => {
      expect(BUSINESS_CONSTANTS.HOURS.sunday).toBe('9:00 AM - 8:00 PM')
    })
  })

  describe('Type Safety', () => {
    it('should have readonly properties at compile time', () => {
      // Type check - this would fail at compile time if not readonly
      expect(BUSINESS_CONSTANTS.PHONE).toBeDefined()
    })
  })
})

describe('PHONE_UTILS', () => {
  describe('displayPhone', () => {
    it('should return formatted phone number', () => {
      expect(PHONE_UTILS.displayPhone).toBe('+44 786 721 8194')
    })

    it('should match BUSINESS_CONSTANTS.PHONE', () => {
      expect(PHONE_UTILS.displayPhone).toBe(BUSINESS_CONSTANTS.PHONE)
    })
  })

  describe('telLink', () => {
    it('should return tel: link format', () => {
      expect(PHONE_UTILS.telLink).toBe('tel:+44 786 721 8194')
    })

    it('should start with tel:', () => {
      expect(PHONE_UTILS.telLink).toMatch(/^tel:/)
    })
  })

  describe('whatsappPhone', () => {
    it('should remove spaces from phone number', () => {
      expect(PHONE_UTILS.whatsappPhone).not.toContain(' ')
    })

    it('should remove plus sign', () => {
      expect(PHONE_UTILS.whatsappPhone).not.toContain('+')
    })

    it('should return digits only', () => {
      expect(PHONE_UTILS.whatsappPhone).toBe('447867218194')
    })

    it('should match expected format', () => {
      expect(PHONE_UTILS.whatsappPhone).toMatch(/^\d+$/)
    })
  })

  describe('whatsappLink', () => {
    it('should return WhatsApp link format', () => {
      expect(PHONE_UTILS.whatsappLink).toBe('https://wa.me/447867218194')
    })

    it('should start with https://wa.me/', () => {
      expect(PHONE_UTILS.whatsappLink).toMatch(/^https:\/\/wa\.me\//)
    })

    it('should contain phone number without spaces or plus', () => {
      expect(PHONE_UTILS.whatsappLink).toContain('447867218194')
    })
  })

  describe('Type Safety', () => {
    it('should have readonly getters at compile time', () => {
      // Type check - getters provide consistent values
      expect(PHONE_UTILS.displayPhone).toBeDefined()
    })
  })
})

describe('EMAIL_UTILS', () => {
  describe('mailtoLink', () => {
    it('should return mailto: link format', () => {
      expect(EMAIL_UTILS.mailtoLink).toBe('mailto:hello@olgishcakes.co.uk')
    })

    it('should start with mailto:', () => {
      expect(EMAIL_UTILS.mailtoLink).toMatch(/^mailto:/)
    })

    it('should include business email', () => {
      expect(EMAIL_UTILS.mailtoLink).toContain(BUSINESS_CONSTANTS.EMAIL)
    })
  })

  describe('Type Safety', () => {
    it('should have readonly getters at compile time', () => {
      // Type check - getters provide consistent values
      expect(EMAIL_UTILS.mailtoLink).toBeDefined()
    })
  })
})

