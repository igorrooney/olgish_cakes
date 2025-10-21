import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '../route'

describe('Dynamic API Route', () => {
  it('should export route handlers', () => {
    expect(GET || POST || PUT || DELETE).toBeDefined()
  })

  it('should handle requests', async () => {
    const handler = GET || POST || PUT || DELETE
    if (handler) {
      const request = new NextRequest('http://localhost/api/test')
      const response = await handler(request as any, { params: { id: '1', slug: 'test' } })
      expect(response).toBeDefined()
    }
  })
})
