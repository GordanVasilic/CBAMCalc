import {
  EPurchasedData,
  PurchasedPrecursorItem,
  E_PURCHASED_DEFAULTS
} from '../types/EPurchasedTypes';
import { DProcessesData } from '../types/DProcessesTypes';

type CalculationResult = {
  data: EPurchasedData;
  calculatedFields: string[];
  validationErrors: string[];
  validationWarnings: string[];
};

export function calculateEPurchased(
  currentData: Partial<EPurchasedData>,
  dProcessesData?: DProcessesData
): CalculationResult {
  const data: EPurchasedData = {
    ...E_PURCHASED_DEFAULTS,
    ...currentData
  };

  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  // Validate each precursor item
  data.precursors.forEach((precursor, index) => {
    validatePrecursorItem(precursor, index, validationErrors, validationWarnings);
  });

  // Calculate summary statistics
  const summary = calculateSummary(data.precursors);
  
  // Calculate overall data quality
  const overallDataQuality = calculateOverallDataQuality(data.precursors);
  
  // Calculate verification status
  const overallVerificationStatus = calculateVerificationStatus(data.precursors);

  // Cross-validation with D_Processes: external precursor consumption vs EPurchased allocations
  if (dProcessesData && dProcessesData.productionProcesses && dProcessesData.productionProcesses.length > 0) {
    performCrossValidationWithDProcesses(data.precursors, dProcessesData, validationErrors, validationWarnings);
  }

  return {
    data: {
      ...data,
      summary,
      overallDataQuality,
      overallVerificationStatus,
      validationStatus: {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        warnings: validationWarnings,
        completenessScore: calculateCompletenessScore(data.precursors)
      }
    },
    calculatedFields: ['summary'],
    validationErrors,
    validationWarnings
  };
}

function validatePrecursorItem(
  precursor: PurchasedPrecursorItem,
  index: number,
  errors: string[],
  warnings: string[]
): void {
  const prefix = `Precursor ${index + 1}`;

  // Required field validation
  if (!precursor.name?.trim()) {
    errors.push(`${prefix}: Name is required`);
  }

  if (!precursor.supplierName?.trim()) {
    errors.push(`${prefix}: Supplier name is required`);
  }

  if (!precursor.supplierCountry?.trim()) {
    errors.push(`${prefix}: Supplier country is required`);
  }

  if (precursor.totalQuantity <= 0) {
    errors.push(`${prefix}: Total quantity must be positive`);
  }

  // Process consumption validation
  if (precursor.processConsumptions.length === 0) {
    warnings.push(`${prefix}: No process consumptions defined`);
  }

  precursor.processConsumptions.forEach((consumption, pcIndex) => {
    if (consumption.quantity <= 0) {
      errors.push(`${prefix} - Process ${pcIndex + 1}: Consumed quantity must be positive`);
    }
    if (!consumption.processId?.trim()) {
      errors.push(`${prefix} - Process ${pcIndex + 1}: Process ID is required`);
    }
  });

  // Emissions validation
  if (precursor.directEmbeddedEmissions < 0) {
    errors.push(`${prefix}: Direct embedded emissions cannot be negative`);
  }

  if (precursor.electricityConsumption < 0) {
    errors.push(`${prefix}: Electricity consumption cannot be negative`);
  }

  // Calculate specific emissions if not provided
  if (precursor.totalSpecificEmbeddedEmissions === undefined) {
    const calculatedSpecificEmissions = calculateSpecificEmissions(precursor);
    precursor.totalSpecificEmbeddedEmissions = calculatedSpecificEmissions;
  }
}

function calculateSpecificEmissions(precursor: PurchasedPrecursorItem): number {
  const indirect = precursor.indirectEmbeddedEmissions !== undefined
    ? precursor.indirectEmbeddedEmissions
    : (precursor.electricityConsumption || 0) * (precursor.electricityEmissionFactor || 0);
  const totalEmissions = (precursor.directEmbeddedEmissions || 0) + indirect;
  return precursor.totalQuantity > 0 ? totalEmissions / precursor.totalQuantity : 0;
}

function calculateSummary(precursors: PurchasedPrecursorItem[]) {
  const totalPrecursors = precursors.length;
  const totalQuantity = precursors.reduce((sum, p) => sum + (p.totalQuantity || 0), 0);
  const totalDirectEmbeddedEmissions = precursors.reduce((sum, p) => sum + (p.directEmbeddedEmissions || 0), 0);
  const totalIndirectEmbeddedEmissions = precursors.reduce((sum, p) => {
    const indirect = p.indirectEmbeddedEmissions !== undefined
      ? p.indirectEmbeddedEmissions
      : (p.electricityConsumption || 0) * (p.electricityEmissionFactor || 0);
    return sum + (indirect || 0);
  }, 0);
  const totalEmbeddedEmissions = totalDirectEmbeddedEmissions + totalIndirectEmbeddedEmissions;

  const verifiedPrecursors = precursors.filter(p => p.verificationStatus === 'Verified').length;
  const defaultValuesUsed = precursors.filter(p => p.usesDefaultValues).length;

  return {
    totalPrecursors,
    totalQuantity,
    totalDirectEmbeddedEmissions,
    totalIndirectEmbeddedEmissions,
    totalEmbeddedEmissions,
    averageDataQuality: calculateAverageDataQuality(precursors),
    verifiedPrecursors,
    defaultValuesUsed
  };
}

function calculateOverallDataQuality(precursors: PurchasedPrecursorItem[]): string {
  const avgQuality = calculateAverageDataQuality(precursors);
  if (avgQuality >= 90) return 'Excellent';
  if (avgQuality >= 75) return 'Good';
  if (avgQuality >= 60) return 'Fair';
  if (avgQuality >= 40) return 'Poor';
  return 'Very Poor';
}

function calculateAverageDataQuality(precursors: PurchasedPrecursorItem[]): number {
  if (precursors.length === 0) return 0;
  
  const qualityScores = precursors.map(precursor => {
    let score = 0;
    let factors = 0;

    // Completeness scoring
    if (precursor.name?.trim()) { score += 20; factors++; }
    if (precursor.cnCode?.trim()) { score += 15; factors++; }
    if (precursor.supplierName?.trim()) { score += 20; factors++; }
    if (precursor.supplierCountry?.trim()) { score += 15; factors++; }
    if (precursor.directEmbeddedEmissions >= 0) { score += 15; factors++; }
    if (precursor.electricityConsumption >= 0) { score += 15; factors++; }

    return factors > 0 ? score / factors : 0;
  });

  return qualityScores.reduce((sum, score) => sum + score, 0) / precursors.length;
}

function calculateVerificationStatus(precursors: PurchasedPrecursorItem[]): string {
  const verifiedCount = precursors.filter(p => p.verificationStatus === 'Verified').length;
  const totalCount = precursors.length;
  if (totalCount === 0) return 'Not verified';
  if (verifiedCount === totalCount) return 'Fully verified';
  if (verifiedCount > 0) return 'Partially verified';
  return 'Not verified';
}

function calculateCompletenessScore(precursors: PurchasedPrecursorItem[]): number {
  if (precursors.length === 0) return 0;
  
  const scores = precursors.map(precursor => {
    let score = 0;

    // Required fields (60% of score)
    if (precursor.name?.trim()) score += 15;
    if (precursor.supplierName?.trim()) score += 15;
    if (precursor.supplierCountry?.trim()) score += 15;
    if (precursor.totalQuantity > 0) score += 15;

    // Optional fields (40% of score)
    if (precursor.cnCode?.trim()) score += 10;
    if (precursor.directEmbeddedEmissions >= 0) score += 10;
    if (precursor.electricityConsumption >= 0) score += 10;
    if (precursor.processConsumptions.length > 0) score += 5;

    return score;
  });

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / precursors.length);
}

 

const ePurchasedAPI = {
  calculateEPurchased
};

export default ePurchasedAPI;

export function selfTestEPurchased(): { ok: boolean; errors: string[] } {
  const sample: Partial<EPurchasedData> = {
    precursors: [{
      id: 'p1', name: 'Test', precursorType: 'Raw materials', totalQuantity: 10, unit: 't', supplierName: 'Supp', supplierCountry: 'Country',
      processConsumptions: [{ processId: 'proc1', processName: 'Process 1', quantity: 5, unit: 't', consumptionType: 'input' }],
      nonCBAMQuantity: 0, nonCBAMUnit: 't', directEmbeddedEmissions: 5, directEmissionsUnit: 'tCO2', directEmissionsDataSource: 'Supplier data',
      electricityConsumption: 0, electricityUnit: 'MWh', electricityEmissionFactor: 0, electricityEmissionFactorUnit: 'tCO2/MWh', electricityEmissionFactorSource: 'Default values',
      totalEmbeddedEmissionsUnit: 'tCO2', usesDefaultValues: false, dataQuality: 'Good', verificationStatus: 'Not Verified', lastUpdated: new Date()
    }],
    summary: { totalPrecursors: 0, totalQuantity: 0, totalDirectEmbeddedEmissions: 0, totalIndirectEmbeddedEmissions: 0, totalEmbeddedEmissions: 0, averageDataQuality: 0, verifiedPrecursors: 0, defaultValuesUsed: 0 },
    reportingPeriod: '', overallDataQuality: 'Good', overallVerificationStatus: 'Not verified',
    validationStatus: { isValid: true, errors: [], warnings: [], completenessScore: 0 },
    metadata: { createdDate: new Date(), lastModified: new Date(), modifiedBy: '', version: '1.0', calculationMethod: 'detailed', dataSource: 'supplier' }
  } as any;
  const res = calculateEPurchased(sample);
  const errors: string[] = [];
  if (res.data.summary.totalPrecursors < 1) errors.push('Summary calculation incorrect');
  return { ok: errors.length === 0, errors };
}
function convertToT(value: number, unit?: string): { valueT: number; supported: boolean } {
  if (!unit) return { valueT: value, supported: true };
  const u = unit.toLowerCase();
  if (u === 'kg') return { valueT: value / 1000, supported: true };
  if (u === 't') return { valueT: value, supported: true };
  if (u === 'g') return { valueT: value / 1_000_000, supported: true };
  return { valueT: value, supported: false };
}

function performCrossValidationWithDProcesses(
  precursors: PurchasedPrecursorItem[],
  dProcessesData: DProcessesData,
  errors: string[],
  warnings: string[]
): void {
  const processesById = new Map<string, any>();
  dProcessesData.productionProcesses.forEach(pp => processesById.set(pp.id, pp));

  precursors.forEach((p, idx) => {
    const perProcessConsumption = new Map<string, number>();
    p.processConsumptions.forEach(pc => {
      const conv = convertToT(pc.quantity, pc.unit as any);
      if (!conv.supported) {
        const u = String(pc.unit || '').toLowerCase();
        if (u === 'm³' || u === 'm3') {
          warnings.push(`Precursor ${idx + 1}: Jedinica 'm³' za potrošnju procesa zahteva gustinu (kg/m³) za konverziju u t`);
        } else if (u === 'l') {
          warnings.push(`Precursor ${idx + 1}: Jedinica 'l' za potrošnju procesa zahteva masu po litru (kg/l) za konverziju u t`);
        } else if (u === 'pcs') {
          warnings.push(`Precursor ${idx + 1}: Jedinica 'pcs' zahteva masu po komadu (kg/kom) za konverziju u t`);
        } else {
          warnings.push(`Precursor ${idx + 1}: Nepoznata jedinica '${pc.unit}' za potrošnju procesa; mapirajte na kg/t/g`);
        }
      }
      perProcessConsumption.set(pc.processId, (perProcessConsumption.get(pc.processId) || 0) + conv.valueT);
    });

    perProcessConsumption.forEach((epValueT, processId) => {
      const proc = processesById.get(processId);
      if (!proc) {
        warnings.push(`Precursor ${idx + 1}: Process ${processId} not found in D_Processes for cross-check`);
        return;
      }
      const dExternalT = (proc.consumedInOtherProcesses || [])
        .filter((c: any) => c.precursorType === 'external')
        .reduce((sum: number, c: any) => {
      const conv = convertToT(c.amount, c.unit);
          if (!conv.supported) {
            const u = String(c.unit || '').toLowerCase();
            if (u === 'm³' || u === 'm3') {
              warnings.push(`Process ${processId}: Jedinica 'm³' u D_Processes zahteva gustinu (kg/m³) za konverziju u t`);
            } else if (u === 'l') {
              warnings.push(`Process ${processId}: Jedinica 'l' u D_Processes zahteva masu po litru (kg/l) za konverziju u t`);
            } else if (u === 'pcs') {
              warnings.push(`Process ${processId}: Jedinica 'pcs' u D_Processes zahteva masu po komadu (kg/kom) za konverziju u t`);
            } else {
              warnings.push(`Process ${processId}: Nepoznata jedinica '${c.unit}' u D_Processes; mapirajte na kg/t/g`);
            }
          }
          return sum + conv.valueT;
        }, 0);

      if (dExternalT > 0) {
        const ratio = Math.abs(epValueT - dExternalT) / dExternalT;
        if (ratio > 0.6) {
          errors.push(`Precursor ${idx + 1}: EPurchased consumption for process ${processId} differs >60% from D_Processes external precursor consumption`);
        } else if (ratio > 0.3) {
          warnings.push(`Precursor ${idx + 1}: EPurchased consumption for process ${processId} differs >30% from D_Processes external precursor consumption`);
        }
      } else if (epValueT > 0) {
        warnings.push(`Precursor ${idx + 1}: EPurchased shows consumption for process ${processId}, but D_Processes external consumption is 0`);
      }
    });

    const totalProcConsT = p.processConsumptions.reduce((sum, pc) => sum + convertToT(pc.quantity, pc.unit as any).valueT, 0);
    const totalQuantityT = convertToT(p.totalQuantity, p.unit as any).valueT;
    if (totalQuantityT > 0) {
      const ratio = Math.abs(totalProcConsT - totalQuantityT) / totalQuantityT;
      if (ratio > 0.15) {
        warnings.push(`Precursor ${idx + 1}: Sum of process consumptions differs >15% from total quantity`);
      }
    }
    if (p.nonCBAMQuantity !== undefined) {
      const nonCbamT = convertToT(p.nonCBAMQuantity, p.nonCBAMUnit as any).valueT;
      if (nonCbamT > totalQuantityT) {
        errors.push(`Precursor ${idx + 1}: Non‑CBAM quantity exceeds total quantity`);
      }
    }
  });
}