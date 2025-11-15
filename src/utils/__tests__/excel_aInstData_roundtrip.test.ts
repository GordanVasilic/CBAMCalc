import { exportToExcelArrayBuffer, importFromExcel } from '../../utils/excelExport'
import { CBAMData } from '../../types/CBAMData'
import { DEFAULT_AINST_DATA } from '../../types/AInstDataTypes'

function makeSample(): CBAMData {
  const a = { ...DEFAULT_AINST_DATA } as any
  a.reportingPeriod = { startDate: '2025-01-01', endDate: '2025-03-31', isFullCalendarYear: false, reportingYear: 2025, reportingQuarter: 1 }
  a.installationIdentification = {
    installationName: 'Inst A', installationEnglishName: 'Installation A', installationId: 'INST-001', installationType: 'Type X', mainActivity: 'Steel', economicActivity: 'NACE', cnCode: '72011000', productionCapacity: 1000, capacityUnit: 't/y', annualProduction: 900, productionUnit: 't'
  }
  a.installationAddress = { streetAndNumber: 'Main 1', postalCode: '11000', city: 'Belgrade', country: 'RS', poBox: '', unlocode: 'RSBEG', latitude: 44.8, longitude: 20.5 }
  a.authorizedRepresentative = { name: 'Rep A', email: 'rep@example.com', telephone: '+381', isPrimaryContact: true }
  a.verifierInformation = { companyName: 'Verifier Co', streetAndNumber: 'V St 1', city: 'Belgrade', postalCode: '11000', country: 'RS', authorizedRepresentative: 'V Rep', email: 'v@example.com', telephone: '+381', fax: '', accreditationMemberState: 'RS', accreditationBodyName: 'Body', accreditationRegistrationNumber: 'ACC-001' }
  a.aggregatedGoodsCategories = [{ id: 'G1', category: 'Iron', productionRoutes: [{ routeNumber: 1, routeName: 'Route 1', isPrimaryRoute: true, rawMaterials: [], intermediates: [], finalProducts: [], energySources: [], emissionSources: [] }], isDirectProduction: true, relevantPrecursors: [], pfcEmissionsRelevant: false }]
  a.productionProcesses = [{ id: 'P1', name: 'Process 1', aggregatedGoodsCategory: 'G1', includedGoodsCategories: ['G1'], isBubbleApproach: false, systemBoundary: { includesDirectEmissions: true, includesMeasurableHeat: true, includesWasteGases: true, includesIndirectEmissions: true, includesPrecursors: true }, goodsAndPrecursors: { goods: [], precursors: [] }, validationStatus: { isComplete: false, errorMessages: [], warnings: [] } }]
  const base: any = {
    companyInfo: { companyName: '', companyAddress: '', companyContactPerson: '', companyPhone: '', companyEmail: '' },
    reportConfig: { reportingPeriod: '2025-Q1', installationId: 'INST-001', installationName: '', installationCountry: '', installationAddress: '' },
    installationDetails: {},
    emissionInstallationData: { emissions: [], totalDirectCO2Emissions: 0, totalIndirectCO2Emissions: 0, totalCO2Emissions: 0, totalCH4Emissions: 0, totalN2OEmissions: 0, totalGHGEmissions: 0, reportingPeriod: '' },
    emissionFactors: [], energyFuelData: [], processProductionData: [], purchasedPrecursors: { precursors: [], totalDirectEmbeddedEmissions: 0, totalIndirectEmbeddedEmissions: 0, totalEmbeddedEmissions: 0, reportingPeriod: '' },
    calculationResults: { totalDirectCO2Emissions: 0, totalProcessEmissions: 0, totalEmissions: 0, specificEmissions: 0, totalEnergy: 0, renewableShare: 0, importedRawMaterialShare: 0, embeddedEmissions: 0, cumulativeEmissions: 0, directEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 }, biogenicCO2Emissions: 0, processEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 }, importedRawMaterialShareByCountry: { total: 0, byCountry: {} }, importedRawMaterialShareByMaterial: { total: 0, byMaterial: {} }, embeddedEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 }, importedMaterialEmbeddedEmissions: { total: 0, byMaterial: {} }, transportEmissions: 0, purchasedPrecursorsEmbeddedEmissions: 0 },
    aInstData: a,
    dProcessesData: undefined,
    ePurchased: undefined,
    cInstEmissions: undefined,
    fEmissions: undefined
  }
  return base as CBAMData
}

describe('Excel A_InstData roundtrip', () => {
  test('export→import preserves key A_InstData fields', async () => {
    const sample = makeSample()
    const u8 = exportToExcelArrayBuffer(sample, sample.calculationResults)
    const imported = await importFromExcel(u8, sample)
    const a = sample.aInstData as any
    const b = imported.aInstData as any
    expect(b.reportingPeriod.startDate).toBe(a.reportingPeriod.startDate)
    expect(b.reportingPeriod.endDate).toBe(a.reportingPeriod.endDate)
    expect(b.installationIdentification.installationName).toBe(a.installationIdentification.installationName)
    expect(b.installationIdentification.cnCode).toBe(a.installationIdentification.cnCode)
    expect(b.installationAddress.city).toBe(a.installationAddress.city)
    expect(b.verifierInformation.companyName).toBe(a.verifierInformation.companyName)
    expect(Array.isArray(b.aggregatedGoodsCategories)).toBe(true)
    expect(Array.isArray(b.productionProcesses)).toBe(true)
  })
})