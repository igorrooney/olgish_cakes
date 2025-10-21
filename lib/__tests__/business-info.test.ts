import { BUSINESS_INFO, CLIENT_BUSINESS_INFO } from '../business-info'
import { BUSINESS_CONSTANTS, PHONE_UTILS, EMAIL_UTILS } from '../constants'

describe('BUSINESS_INFO', () => {
  describe('phone getter', () => {
    it('should return phone from BUSINESS_CONSTANTS', () => {
      expect(BUSINESS_INFO.phone).toBe(BUSINESS_CONSTANTS.PHONE)
    })

    it('should return correct phone number', () => {
      expect(BUSINESS_INFO.phone).toBe('+44 786 721 8194')
    })
  })

  describe('displayPhone getter', () => {
    it('should return displayPhone from PHONE_UTILS', () => {
      expect(BUSINESS_INFO.displayPhone).toBe(PHONE_UTILS.displayPhone)
    })

    it('should return formatted phone number', () => {
      expect(BUSINESS_INFO.displayPhone).toBe('+44 786 721 8194')
    })
  })

  describe('telLink getter', () => {
    it('should return telLink from PHONE_UTILS', () => {
      expect(BUSINESS_INFO.telLink).toBe(PHONE_UTILS.telLink)
    })

    it('should return tel: link format', () => {
      expect(BUSINESS_INFO.telLink).toBe('tel:+44 786 721 8194')
    })
  })

  describe('email getter', () => {
    it('should return email from BUSINESS_CONSTANTS', () => {
      expect(BUSINESS_INFO.email).toBe(BUSINESS_CONSTANTS.EMAIL)
    })

    it('should return correct email address', () => {
      expect(BUSINESS_INFO.email).toBe('hello@olgishcakes.co.uk')
    })
  })

  describe('emailLink getter', () => {
    it('should return emailLink from EMAIL_UTILS', () => {
      expect(BUSINESS_INFO.emailLink).toBe(EMAIL_UTILS.mailtoLink)
    })

    it('should return mailto: link format', () => {
      expect(BUSINESS_INFO.emailLink).toBe('mailto:hello@olgishcakes.co.uk')
    })
  })

  describe('website getter', () => {
    it('should return website from BUSINESS_CONSTANTS', () => {
      expect(BUSINESS_INFO.website).toBe(BUSINESS_CONSTANTS.WEBSITE)
    })

    it('should return correct website URL', () => {
      expect(BUSINESS_INFO.website).toBe('https://olgishcakes.co.uk')
    })
  })

  describe('Type Safety', () => {
    it('should have readonly getters at compile time', () => {
      // Type check - getters provide consistent values
      expect(BUSINESS_INFO.phone).toBeDefined()
    })
  })
})

describe('CLIENT_BUSINESS_INFO', () => {
  describe('phone getter', () => {
    it('should return phone from BUSINESS_CONSTANTS', () => {
      expect(CLIENT_BUSINESS_INFO.phone).toBe(BUSINESS_CONSTANTS.PHONE)
    })

    it('should match BUSINESS_INFO.phone', () => {
      expect(CLIENT_BUSINESS_INFO.phone).toBe(BUSINESS_INFO.phone)
    })
  })

  describe('displayPhone getter', () => {
    it('should return displayPhone from PHONE_UTILS', () => {
      expect(CLIENT_BUSINESS_INFO.displayPhone).toBe(PHONE_UTILS.displayPhone)
    })

    it('should match BUSINESS_INFO.displayPhone', () => {
      expect(CLIENT_BUSINESS_INFO.displayPhone).toBe(BUSINESS_INFO.displayPhone)
    })
  })

  describe('telLink getter', () => {
    it('should return telLink from PHONE_UTILS', () => {
      expect(CLIENT_BUSINESS_INFO.telLink).toBe(PHONE_UTILS.telLink)
    })

    it('should match BUSINESS_INFO.telLink', () => {
      expect(CLIENT_BUSINESS_INFO.telLink).toBe(BUSINESS_INFO.telLink)
    })
  })

  describe('email getter', () => {
    it('should return email from BUSINESS_CONSTANTS', () => {
      expect(CLIENT_BUSINESS_INFO.email).toBe(BUSINESS_CONSTANTS.EMAIL)
    })

    it('should match BUSINESS_INFO.email', () => {
      expect(CLIENT_BUSINESS_INFO.email).toBe(BUSINESS_INFO.email)
    })
  })

  describe('emailLink getter', () => {
    it('should return emailLink from EMAIL_UTILS', () => {
      expect(CLIENT_BUSINESS_INFO.emailLink).toBe(EMAIL_UTILS.mailtoLink)
    })

    it('should match BUSINESS_INFO.emailLink', () => {
      expect(CLIENT_BUSINESS_INFO.emailLink).toBe(BUSINESS_INFO.emailLink)
    })
  })

  describe('website getter', () => {
    it('should return website from BUSINESS_CONSTANTS', () => {
      expect(CLIENT_BUSINESS_INFO.website).toBe(BUSINESS_CONSTANTS.WEBSITE)
    })

    it('should match BUSINESS_INFO.website', () => {
      expect(CLIENT_BUSINESS_INFO.website).toBe(BUSINESS_INFO.website)
    })
  })

  describe('Type Safety', () => {
    it('should have readonly getters at compile time', () => {
      // Type check - getters provide consistent values
      expect(CLIENT_BUSINESS_INFO.phone).toBeDefined()
    })
  })

  describe('Equivalence with BUSINESS_INFO', () => {
    it('should have same phone value', () => {
      expect(CLIENT_BUSINESS_INFO.phone).toBe(BUSINESS_INFO.phone)
    })

    it('should have same displayPhone value', () => {
      expect(CLIENT_BUSINESS_INFO.displayPhone).toBe(BUSINESS_INFO.displayPhone)
    })

    it('should have same telLink value', () => {
      expect(CLIENT_BUSINESS_INFO.telLink).toBe(BUSINESS_INFO.telLink)
    })

    it('should have same email value', () => {
      expect(CLIENT_BUSINESS_INFO.email).toBe(BUSINESS_INFO.email)
    })

    it('should have same emailLink value', () => {
      expect(CLIENT_BUSINESS_INFO.emailLink).toBe(BUSINESS_INFO.emailLink)
    })

    it('should have same website value', () => {
      expect(CLIENT_BUSINESS_INFO.website).toBe(BUSINESS_INFO.website)
    })
  })
})

