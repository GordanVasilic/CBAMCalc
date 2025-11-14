import { selfTestCInstEmissions } from '../../utils/cInstEmissionsCalculationEngine'
import { selfTestEPurchased } from '../../utils/ePurchasedCalculationEngine'
import { selfTestFEmissions } from '../../utils/fEmissionsCalculationEngine'

describe('CBAM engines self-tests', () => {
  test('C_InstEmissions self test passes', () => {
    const res = selfTestCInstEmissions()
    expect(res.ok).toBe(true)
    expect(res.errors.length).toBe(0)
  })

  test('E_Purchased self test passes', () => {
    const res = selfTestEPurchased()
    expect(res.ok).toBe(true)
    expect(res.errors.length).toBe(0)
  })

  test('F_Emissions self test passes', () => {
    const res = selfTestFEmissions()
    expect(res.ok).toBe(true)
    expect(res.errors.length).toBe(0)
  })
})