import { getFaqs } from '../../utils/fetchFaqs'
import { faqQueryKeys, faqQueryOptions } from '../query-options'

jest.mock('../../utils/fetchFaqs', () => ({
  getFaqs: jest.fn()
}))

const mockGetFaqs = jest.mocked(getFaqs)

describe('faq query options', () => {
  it('uses a stable key and forwards the query cancellation signal', async () => {
    const controller = new AbortController()
    mockGetFaqs.mockResolvedValue([])
    const options = faqQueryOptions()

    expect(options.queryKey).toEqual(faqQueryKeys.all)
    expect(options.staleTime).toBe(Infinity)

    await options.queryFn?.({
      queryKey: faqQueryKeys.all,
      signal: controller.signal,
      meta: undefined,
      client: undefined as never
    })

    expect(mockGetFaqs).toHaveBeenCalledWith({ signal: controller.signal })
  })
})
