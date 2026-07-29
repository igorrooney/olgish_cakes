import {
  REFUND_AFTER_WORK_POLICY,
  REFUND_BEFORE_WORK_POLICY,
  STATUTORY_RIGHTS_POLICY
} from '../public-policies'

describe('public cancellation and returns policies', () => {
  it('offers a voluntary cancellation and refund before preparation starts', () => {
    expect(REFUND_BEFORE_WORK_POLICY).toMatch(/has not begun/i)
    expect(REFUND_BEFORE_WORK_POLICY).toMatch(/cancel.*refund/i)
  })

  it('excludes post-preparation change-of-mind cancellations for made-to-order food', () => {
    expect(REFUND_AFTER_WORK_POLICY).toMatch(/work or non-recoverable purchasing has begun/i)
    expect(REFUND_AFTER_WORK_POLICY).toMatch(/fair amount/i)
    expect(REFUND_AFTER_WORK_POLICY).toMatch(/actual costs/i)
    expect(REFUND_AFTER_WORK_POLICY).toMatch(/explain any deduction/i)
  })

  it('preserves statutory remedies for faulty, damaged or misdescribed orders', () => {
    expect(STATUTORY_RIGHTS_POLICY).toMatch(/statutory rights/i)
    expect(STATUTORY_RIGHTS_POLICY).toMatch(/faulty/i)
    expect(STATUTORY_RIGHTS_POLICY).toMatch(/damaged/i)
    expect(STATUTORY_RIGHTS_POLICY).toMatch(/not as described/i)
    expect(STATUTORY_RIGHTS_POLICY).toMatch(/not fit for purpose/i)
  })
})
