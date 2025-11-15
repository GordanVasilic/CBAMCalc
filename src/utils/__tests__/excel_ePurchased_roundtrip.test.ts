import { exportToExcelArrayBuffer, importFromExcel } from '../../utils/excelExport'
import { CBAMData } from '../../types/CBAMData'
import { E_PURCHASED_DEFAULTS } from '../../types/EPurchasedTypes'

function makeSample(): CBAMData {
  const base: any = {
    companyInfo: { companyName: '', companyAddress: '', companyContactPerson: '', companyPhone: '', companyEmail: '' },
    reportConfig: { reportingPeriod: '2025-Q3', installationId: 'INST-001', installationName: '', installationCountry: '', installationAddress: '' },
    installationDetails: { installationType: '', mainActivity: '', cnCode: '', productionCapacity: 0, annualProduction: 0 },
    emissionInstallationData: { emissions: [], totalDirectCO2Emissions: 0, totalIndirectCO2Emissions: 0, totalCO2Emissions: 0, totalCH4Emissions: 0, totalN2OEmissions: 0, totalGHGEmissions: 0, reportingPeriod: '' },
    emissionFactors: [], energyFuelData: [], processProductionData: [], purchasedPrecursors: { precursors: [], totalDirectEmbeddedEmissions: 0, totalIndirectEmbeddedEmissions: 0, totalEmbeddedEmissions: 0, reportingPeriod: '' },
    calculationResults: { totalDirectCO2Emissions: 0, totalProcessEmissions: 0, totalEmissions: 0, specificEmissions: 0, totalEnergy: 0, renewableShare: 0, importedRawMaterialShare: 0, embeddedEmissions: 0, cumulativeEmissions: 0, directEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 }, biogenicCO2Emissions: 0, processEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 }, importedRawMaterialShareByCountry: { total: 0, byCountry: {} }, importedRawMaterialShareByMaterial: { total: 0, byMaterial: {} }, embeddedEmissionsByGasType: { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 }, importedMaterialEmbeddedEmissions: { total: 0, byMaterial: {} }, transportEmissions: 0, purchasedPrecursorsEmbeddedEmissions: 0 },
    ePurchased: { ...E_PURCHASED_DEFAULTS, reportingPeriod: '2025-Q3', precursors: [
      { id: 'p1', name: 'Iron ore', cnCode: '26011100', precursorType: 'Raw materials', totalQuantity: 100, unit: 't', supplierName: 'Supplier A', supplierCountry: 'RS', processConsumptions: [], nonCBAMQuantity: 0, nonCBAMUnit: 't', directEmbeddedEmissions: 50, directEmissionsUnit: 'tCO2e', directEmissionsDataSource: 'Supplier data', electricityConsumption: 120, electricityUnit: 'MWh', electricityEmissionFactor: 0.5, electricityEmissionFactorUnit: 'tCO2e/MWh', electricityEmissionFactorSource: 'Default values', indirectEmbeddedEmissions: 60, totalSpecificEmbeddedEmissions: 1.1, totalEmbeddedEmissionsUnit: 'tCO2e', usesDefaultValues: false, dataQuality: 'Actual data', verificationStatus: 'Verified', lastUpdated: new Date() },
      { id: 'p2', name: 'Coke', cnCode: '27040019', precursorType: 'Intermediate products', totalQuantity: 50, unit: 't', supplierName: 'Supplier B', supplierCountry: 'BA', processConsumptions: [{ processId: 'process-1', processName: 'Process 1', quantity: 10, unit: 't', consumptionType: 'consumption' }], nonCBAMQuantity: 0, nonCBAMUnit: 't', directEmbeddedEmissions: 40, directEmissionsUnit: 'tCO2e', directEmissionsDataSource: 'Supplier data', electricityConsumption: 0, electricityUnit: 'MWh', electricityEmissionFactor: 0.5, electricityEmissionFactorUnit: 'tCO2e/MWh', electricityEmissionFactorSource: 'Default values', indirectEmbeddedEmissions: 0, totalSpecificEmbeddedEmissions: 0.8, totalEmbeddedEmissionsUnit: 'tCO2e', usesDefaultValues: true, dataQuality: 'Calculated data', verificationStatus: 'Not verified', lastUpdated: new Date() }
    ] }
  };
  return base as CBAMData;
}

describe('Excel E_PurchPrec roundtrip', () => {
  test('export→import preserves E_Purchased precursors and summary', async () => {
    const sample = makeSample();
    const u8 = exportToExcelArrayBuffer(sample, sample.calculationResults);
    const imported = await importFromExcel(u8, sample);
    const a = sample.ePurchased as any;
    const b = imported.ePurchased as any;
    expect(b.precursors.length).toBe(a.precursors.length);
    for (let i = 0; i < a.precursors.length; i++) {
      const pa = a.precursors[i];
      const pb = b.precursors[i];
      expect(pb.name).toBe(pa.name);
      expect(pb.cnCode).toBe(pa.cnCode);
      expect(pb.precursorType).toBe(pa.precursorType);
      expect(pb.totalQuantity).toBe(pa.totalQuantity);
      expect(pb.unit).toBe(pa.unit);
      expect(pb.supplierName).toBe(pa.supplierName);
      expect(pb.supplierCountry).toBe(pa.supplierCountry);
      expect(pb.directEmbeddedEmissions).toBe(pa.directEmbeddedEmissions);
      expect(pb.directEmissionsUnit).toBe(pa.directEmissionsUnit);
      expect(pb.electricityConsumption).toBe(pa.electricityConsumption);
      expect(pb.electricityUnit).toBe(pa.electricityUnit);
      expect(Math.round((pb.totalSpecificEmbeddedEmissions || 0) * 1000)).toBe(Math.round((pa.totalSpecificEmbeddedEmissions || 0) * 1000));
      expect(pb.totalEmbeddedEmissionsUnit).toBe(pa.totalEmbeddedEmissionsUnit);
      expect(!!pb.usesDefaultValues).toBe(!!pa.usesDefaultValues);
      expect(pb.dataQuality).toBe(pa.dataQuality);
      expect(pb.verificationStatus).toBe(pa.verificationStatus);
    }
    expect(b.summary.totalPrecursors).toBe(a.precursors.length);
    expect(Math.round(b.summary.totalQuantity)).toBe(Math.round(a.precursors.reduce((s: number, p: any) => s + (p.totalQuantity || 0), 0)));
  });
});