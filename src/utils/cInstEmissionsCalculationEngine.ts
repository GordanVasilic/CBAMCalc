/**
 * C_InstEmissions Calculation Engine
 * Implements Excel formulas and validation logic for C_InstEmissions worksheet
 */

import {
  CInstEmissionsData,
  FuelBalance,
  GHGEmissionsBalance,
  DataQualityInfo,
  C_INST_EMISSIONS_DEFAULTS,
  C_INST_EMISSIONS_VALIDATION_RULES
} from '../types/CInstEmissionsTypes';
import { BEmInstData } from '../types/BEmInstTypes';

// Validation result interface
export interface ValidationResult {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Calculation result interface
export interface CalculationResult {
  success: boolean;
  data: CInstEmissionsData;
  validationResults: ValidationResult[];
  autoCalculatedFields: string[];
}

/**
 * Main calculation function for C_InstEmissions
 */
export function calculateCInstEmissions(
  currentData: Partial<CInstEmissionsData>,
  bEmInstData?: BEmInstData
): CalculationResult {
  try {
    // Merge with defaults
    const data: CInstEmissionsData = {
      ...C_INST_EMISSIONS_DEFAULTS,
      ...currentData,
      fuelBalance: {
        ...C_INST_EMISSIONS_DEFAULTS.fuelBalance,
        ...currentData.fuelBalance,
        manualEntries: currentData.fuelBalance?.manualEntries || {}
      },
      emissionsBalance: {
        ...C_INST_EMISSIONS_DEFAULTS.emissionsBalance,
        ...currentData.emissionsBalance,
        manualEntries: currentData.emissionsBalance?.manualEntries || {}
      },
      dataQuality: {
        ...C_INST_EMISSIONS_DEFAULTS.dataQuality,
        ...currentData.dataQuality
      },
      metadata: {
        ...C_INST_EMISSIONS_DEFAULTS.metadata,
        ...currentData.metadata,
        lastCalculated: new Date()
      }
    };

    // Auto-import from B_EmInst if available and not manually overridden
    if (bEmInstData && data.metadata.dataSource === 'B_EmInst') {
      importFromBEmInst(data, bEmInstData);
    }

    // Perform calculations
    performCalculations(data);

    // Validate results
    const validationResults = validateCInstEmissions(data);

    // Cross-sheet validation against B_EmInst totals when available
    if (bEmInstData) {
      validationResults.push(...validateAgainstBEmInst(data, bEmInstData));
    }

    // Update validation status
    data.validationStatus = {
      isValid: validationResults.filter(r => r.severity === 'error').length === 0,
      errors: validationResults.filter(r => r.severity === 'error').map(r => r.message),
      warnings: validationResults.filter(r => r.severity === 'warning').map(r => r.message),
      completenessScore: calculateCompletenessScore(data)
    };

    const autoCalculatedFields = identifyAutoCalculatedFields(data);

    return {
      success: true,
      data,
      validationResults,
      autoCalculatedFields
    };
  } catch (error) {
    return {
      success: false,
      data: C_INST_EMISSIONS_DEFAULTS,
      validationResults: [{
        field: 'calculation',
        message: `Calculation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      }],
      autoCalculatedFields: []
    };
  }
}

/**
 * Import data from B_EmInst worksheet
 */
function importFromBEmInst(data: CInstEmissionsData, bEmInstData: BEmInstData): void {
  data.metadata.importedFromBEmInst = true;
  const b = (bEmInstData as any).totals || {};
  const hasManualDirect = !!data.emissionsBalance.manualEntries.totalDirectEmissions;
  const hasManualTotal = !!data.emissionsBalance.manualEntries.totalEmissions;
  const hasManualFuel = !!data.fuelBalance.manualEntries.totalFuelInput;
  const bCO2eSum = (b.totalCO2eFossil || 0) + (b.totalCO2eBiomass || 0) + (b.totalCO2eNonSustainableBiomass || 0) + (b.totalPFCEmissions || 0);
  if (!hasManualDirect && (data.emissionsBalance.totalDirectEmissions || 0) === 0) {
    data.emissionsBalance.totalDirectEmissions = bCO2eSum;
  }
  if ((data.emissionsBalance.totalCO2Emissions || 0) === 0 && (b.totalCO2eFossil || 0) > 0) {
    data.emissionsBalance.totalCO2Emissions = b.totalCO2eFossil;
  }
  if ((data.emissionsBalance.biomassEmissions || 0) === 0 && (b.totalCO2eBiomass || 0) > 0) {
    data.emissionsBalance.biomassEmissions = b.totalCO2eBiomass;
  }
  if ((data.emissionsBalance.totalPFCEmissions || 0) === 0 && (b.totalPFCEmissions || 0) > 0) {
    data.emissionsBalance.totalPFCEmissions = b.totalPFCEmissions;
  }
  if (!hasManualTotal && (data.emissionsBalance.totalEmissions || 0) === 0 && (data.emissionsBalance.totalDirectEmissions || 0) > 0) {
    data.emissionsBalance.totalEmissions = data.emissionsBalance.totalDirectEmissions + (data.emissionsBalance.totalIndirectEmissions || 0);
  }
  const bEnergySum = (b.totalEnergyContentFossil || 0) + (b.totalEnergyContentBiomass || 0);
  if (!hasManualFuel && (data.fuelBalance.totalFuelInput || 0) === 0 && bEnergySum > 0) {
    data.fuelBalance.totalFuelInput = bEnergySum;
  }
}

/**
 * Perform all calculations for C_InstEmissions
 */
function performCalculations(data: CInstEmissionsData): void {
  // Calculate fuel balance totals
  calculateFuelBalance(data.fuelBalance);
  
  // Calculate emissions balance totals
  calculateEmissionsBalance(data.emissionsBalance);
}

/**
 * Calculate fuel balance totals
 */
function calculateFuelBalance(fuelBalance: FuelBalance): void {
  // Validate that fuel components add up to total
  const calculatedTotal = fuelBalance.directFuelCBAM + 
                         fuelBalance.fuelForElectricity + 
                         fuelBalance.directFuelNonCBAM;
  
  // If total is manually set, use it; otherwise calculate
  if (!fuelBalance.manualEntries.totalFuelInput) {
    fuelBalance.totalFuelInput = calculatedTotal;
  }
}

/**
 * Calculate emissions balance totals
 */
function calculateEmissionsBalance(emissionsBalance: GHGEmissionsBalance): void {
  // Calculate total direct emissions if not manually overridden
  if (!emissionsBalance.manualEntries.totalDirectEmissions) {
    emissionsBalance.totalDirectEmissions = 
      emissionsBalance.totalCO2Emissions +
      emissionsBalance.totalN2OEmissions +
      emissionsBalance.totalPFCEmissions;
  }

  // Calculate total emissions if not manually overridden
  if (!emissionsBalance.manualEntries.totalEmissions) {
    emissionsBalance.totalEmissions = 
      emissionsBalance.totalDirectEmissions +
      emissionsBalance.totalIndirectEmissions;
  }
}

/**
 * Validate C_InstEmissions data
 */
function validateCInstEmissions(data: CInstEmissionsData): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Validate fuel balance
  results.push(...validateFuelBalance(data.fuelBalance));
  
  // Validate emissions balance
  results.push(...validateEmissionsBalance(data.emissionsBalance));
  
  // Validate data quality
  results.push(...validateDataQuality(data.dataQuality));
  
  // Cross-validation
  results.push(...performCrossValidation(data));

  return results;
}

/**
 * Validate fuel balance
 */
function validateFuelBalance(fuelBalance: FuelBalance): ValidationResult[] {
  const results: ValidationResult[] = [];
  const rules = C_INST_EMISSIONS_VALIDATION_RULES.fuelBalance;

  // Check individual fuel components
  Object.entries(fuelBalance).forEach(([key, value]) => {
    if (key !== 'manualEntries' && typeof value === 'number') {
      const rule = rules[key as keyof typeof rules];
      if (rule) {
        if (rule.required && value === 0 && !fuelBalance.manualEntries[key as keyof typeof fuelBalance.manualEntries]) {
          results.push({
            field: `fuelBalance.${key}`,
            message: `${key} is required and cannot be zero`,
            severity: 'warning'
          });
        }
        if (value < rule.min || value > rule.max) {
          results.push({
            field: `fuelBalance.${key}`,
            message: `${key} must be between ${rule.min} and ${rule.max}`,
            severity: 'error'
          });
        }
      }
    }
  });

  // Check fuel balance consistency
  const calculatedTotal = fuelBalance.directFuelCBAM + 
                         fuelBalance.fuelForElectricity + 
                         fuelBalance.directFuelNonCBAM;
  
  if (Math.abs(fuelBalance.totalFuelInput - calculatedTotal) > 0.01) {
    results.push({
      field: 'fuelBalance.totalFuelInput',
      message: 'Total fuel input does not equal sum of components',
      severity: 'warning'
    });
  }

  return results;
}

/**
 * Validate emissions balance
 */
function validateEmissionsBalance(emissionsBalance: GHGEmissionsBalance): ValidationResult[] {
  const results: ValidationResult[] = [];
  const rules = C_INST_EMISSIONS_VALIDATION_RULES.emissionsBalance;

  // Check individual emission components
  Object.entries(emissionsBalance).forEach(([key, value]) => {
    if (key !== 'manualEntries' && typeof value === 'number') {
      const rule = rules[key as keyof typeof rules];
      if (rule) {
        if (rule.required && value === 0 && !emissionsBalance.manualEntries[key as keyof typeof emissionsBalance.manualEntries]) {
          results.push({
            field: `emissionsBalance.${key}`,
            message: `${key} is required and cannot be zero`,
            severity: 'warning'
          });
        }
        if (value < rule.min || value > rule.max) {
          results.push({
            field: `emissionsBalance.${key}`,
            message: `${key} must be between ${rule.min} and ${rule.max}`,
            severity: 'error'
          });
        }
      }
    }
  });

  // Check emissions balance consistency
  const calculatedDirect = emissionsBalance.totalCO2Emissions +
                          emissionsBalance.totalN2OEmissions +
                          emissionsBalance.totalPFCEmissions;
  
  if (Math.abs(emissionsBalance.totalDirectEmissions - calculatedDirect) > 0.01) {
    results.push({
      field: 'emissionsBalance.totalDirectEmissions',
      message: 'Total direct emissions does not equal sum of CO2, N2O and PFC emissions',
      severity: 'warning'
    });
  }

  const calculatedTotal = emissionsBalance.totalDirectEmissions + emissionsBalance.totalIndirectEmissions;
  
  if (Math.abs(emissionsBalance.totalEmissions - calculatedTotal) > 0.01) {
    results.push({
      field: 'emissionsBalance.totalEmissions',
      message: 'Total emissions does not equal sum of direct and indirect emissions',
      severity: 'warning'
    });
  }

  return results;
}

/**
 * Validate data quality information
 */
function validateDataQuality(dataQuality: DataQualityInfo): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (!dataQuality.generalDataQuality) {
    results.push({
      field: 'dataQuality.generalDataQuality',
      message: 'General data quality assessment is required',
      severity: 'error'
    });
  }

  if (!dataQuality.defaultValuesJustification) {
    results.push({
      field: 'dataQuality.defaultValuesJustification',
      message: 'Default values justification is required',
      severity: 'error'
    });
  }

  if (!dataQuality.qualityAssurance) {
    results.push({
      field: 'dataQuality.qualityAssurance',
      message: 'Quality assurance method is required',
      severity: 'error'
    });
  }

  return results;
}

/**
 * Perform cross-validation between different sections
 */
function performCrossValidation(data: CInstEmissionsData): ValidationResult[] {
  const results: ValidationResult[] = [];

  // Check if fuel input corresponds to emissions (rough check)
  const fuelEfficiency = data.emissionsBalance.totalDirectEmissions / (data.fuelBalance.totalFuelInput || 1);
  
  if (fuelEfficiency > 100) { // More than 100 tCO2e per TJ
    results.push({
      field: 'crossValidation',
      message: 'Emission factor seems unusually high (>100 tCO2e/TJ). Please verify fuel and emission data.',
      severity: 'warning'
    });
  }

  if (fuelEfficiency < 10) { // Less than 10 tCO2e per TJ
    results.push({
      field: 'crossValidation',
      message: 'Emission factor seems unusually low (<10 tCO2e/TJ). Please verify fuel and emission data.',
      severity: 'warning'
    });
  }

  return results;
}

/**
 * Cross-sheet validation: compare C_InstEmissions against B_EmInst totals
 */
function validateAgainstBEmInst(data: CInstEmissionsData, bEmInstData: BEmInstData): ValidationResult[] {
  const results: ValidationResult[] = [];

  const cDirect = data.emissionsBalance.totalDirectEmissions || 0;
  const cBiomass = data.emissionsBalance.biomassEmissions || 0;
  const cTotal = data.emissionsBalance.totalEmissions || 0;
  const cFuelInput = data.fuelBalance.totalFuelInput || 0;

  const bTotals = bEmInstData.totals || {
    totalCO2eFossil: 0,
    totalCO2eBiomass: 0,
    totalCO2eNonSustainableBiomass: 0,
    totalPFCEmissions: 0,
    totalEnergyContentFossil: 0,
    totalEnergyContentBiomass: 0
  } as any;

  const bCO2eSum =
    (bTotals.totalCO2eFossil || 0) +
    (bTotals.totalCO2eBiomass || 0) +
    (bTotals.totalCO2eNonSustainableBiomass || 0) +
    (bTotals.totalPFCEmissions || 0);

  if (bCO2eSum > 0 && cDirect > 0) {
    const ratio = Math.abs(cDirect - bCO2eSum) / bCO2eSum;
    if (ratio > 0.6) {
      results.push({
        field: 'crossSheetValidation',
        message: 'C_InstEmissions total direct emissions differ >60% from B_EmInst totals',
        severity: 'error'
      });
    } else if (ratio > 0.3) {
      results.push({
        field: 'crossSheetValidation',
        message: 'C_InstEmissions total direct emissions differ >30% from B_EmInst totals',
        severity: 'warning'
      });
    }
  }

  const bBiomass = (bTotals.totalCO2eBiomass || 0);
  if (bBiomass > 0 || cBiomass > 0) {
    const base = bBiomass || cBiomass || 1;
    const ratio = Math.abs(cBiomass - bBiomass) / base;
    if (ratio > 0.6) {
      results.push({
        field: 'crossSheetValidation',
        message: 'Biomass emissions differ >60% between C_InstEmissions and B_EmInst',
        severity: 'error'
      });
    } else if (ratio > 0.3) {
      results.push({
        field: 'crossSheetValidation',
        message: 'Biomass emissions differ >30% between C_InstEmissions and B_EmInst',
        severity: 'warning'
      });
    }
  }

  const bEnergySum = (bTotals.totalEnergyContentFossil || 0) + (bTotals.totalEnergyContentBiomass || 0);
  if (bEnergySum > 0 && cFuelInput > 0) {
    const ratio = Math.abs(cFuelInput - bEnergySum) / bEnergySum;
    if (ratio > 0.5) {
      results.push({
        field: 'crossSheetValidation',
        message: 'Fuel input in C differs >50% from energy content totals in B_EmInst',
        severity: 'warning'
      });
    } else if (ratio > 0.3) {
      results.push({
        field: 'crossSheetValidation',
        message: 'Fuel input in C differs >30% from energy content totals in B_EmInst',
        severity: 'info'
      });
    }
  }

  if (bCO2eSum > 0 && cTotal > 0) {
    const ratio = Math.abs(cTotal - bCO2eSum) / bCO2eSum;
    if (ratio > 0.6) {
      results.push({
        field: 'crossSheetValidation',
        message: 'Total emissions differ >60% between C_InstEmissions and B_EmInst totals',
        severity: 'error'
      });
    } else if (ratio > 0.3) {
      results.push({
        field: 'crossSheetValidation',
        message: 'Total emissions differ >30% between C_InstEmissions and B_EmInst totals',
        severity: 'warning'
      });
    }
  }

  return results;
}

/**
 * Calculate completeness score (0-100%)
 */
function calculateCompletenessScore(data: CInstEmissionsData): number {
  let totalFields = 0;
  let completedFields = 0;

  // Count fuel balance fields
  Object.entries(data.fuelBalance).forEach(([key, value]) => {
    if (key !== 'manualEntries' && typeof value === 'number') {
      totalFields++;
      if (value > 0) completedFields++;
    }
  });

  // Count emissions balance fields
  Object.entries(data.emissionsBalance).forEach(([key, value]) => {
    if (key !== 'manualEntries' && typeof value === 'number') {
      totalFields++;
      if (value > 0) completedFields++;
    }
  });

  // Count data quality fields
  if (data.dataQuality.generalDataQuality) completedFields++;
  if (data.dataQuality.defaultValuesJustification) completedFields++;
  if (data.dataQuality.qualityAssurance) completedFields++;
  totalFields += 3;

  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
}

/**
 * Identify which fields were auto-calculated
 */
function identifyAutoCalculatedFields(data: CInstEmissionsData): string[] {
  const autoFields: string[] = [];

  // Check fuel balance
  if (!data.fuelBalance.manualEntries.totalFuelInput) {
    autoFields.push('fuelBalance.totalFuelInput');
  }

  // Check emissions balance
  if (!data.emissionsBalance.manualEntries.totalDirectEmissions) {
    autoFields.push('emissionsBalance.totalDirectEmissions');
  }
  if (!data.emissionsBalance.manualEntries.totalEmissions) {
    autoFields.push('emissionsBalance.totalEmissions');
  }

  return autoFields;
}

/**
 * Convert C_InstEmissions data to Excel row mapping
 */
export function mapCInstEmissionsToExcel(data: CInstEmissionsData): { [key: string]: any } {
  const mapping: { [key: string]: any } = {};

  // Fuel balance mapping
  mapping['C15'] = data.fuelBalance.totalFuelInput;
  mapping['D15'] = data.fuelBalance.totalFuelInput;
  mapping['E15'] = data.fuelBalance.totalFuelInput;
  mapping['F15'] = data.fuelBalance.totalFuelInput;

  mapping['C16'] = data.fuelBalance.directFuelCBAM;
  mapping['D16'] = data.fuelBalance.directFuelCBAM;
  mapping['E16'] = data.fuelBalance.directFuelCBAM;
  mapping['F16'] = data.fuelBalance.directFuelCBAM;

  mapping['C17'] = data.fuelBalance.fuelForElectricity;
  mapping['D17'] = data.fuelBalance.fuelForElectricity;
  mapping['E17'] = data.fuelBalance.fuelForElectricity;
  mapping['F17'] = data.fuelBalance.fuelForElectricity;

  mapping['C18'] = data.fuelBalance.directFuelNonCBAM;
  mapping['D18'] = data.fuelBalance.directFuelNonCBAM;
  mapping['E18'] = data.fuelBalance.directFuelNonCBAM;
  mapping['F18'] = data.fuelBalance.directFuelNonCBAM;

  // Emissions balance mapping
  mapping['C26'] = data.emissionsBalance.totalCO2Emissions;
  mapping['D26'] = data.emissionsBalance.totalCO2Emissions;
  mapping['E26'] = data.emissionsBalance.totalCO2Emissions;
  mapping['F26'] = data.emissionsBalance.totalCO2Emissions;

  mapping['C27'] = data.emissionsBalance.biomassEmissions;
  mapping['D27'] = data.emissionsBalance.biomassEmissions;
  mapping['E27'] = data.emissionsBalance.biomassEmissions;
  mapping['F27'] = data.emissionsBalance.biomassEmissions;

  mapping['C28'] = data.emissionsBalance.totalN2OEmissions;
  mapping['D28'] = data.emissionsBalance.totalN2OEmissions;
  mapping['E28'] = data.emissionsBalance.totalN2OEmissions;
  mapping['F28'] = data.emissionsBalance.totalN2OEmissions;

  mapping['C29'] = data.emissionsBalance.totalPFCEmissions;
  mapping['D29'] = data.emissionsBalance.totalPFCEmissions;
  mapping['E29'] = data.emissionsBalance.totalPFCEmissions;
  mapping['F29'] = data.emissionsBalance.totalPFCEmissions;

  mapping['C30'] = data.emissionsBalance.totalDirectEmissions;
  mapping['D30'] = data.emissionsBalance.totalDirectEmissions;
  mapping['E30'] = data.emissionsBalance.totalDirectEmissions;
  mapping['F30'] = data.emissionsBalance.totalDirectEmissions;

  mapping['C31'] = data.emissionsBalance.totalIndirectEmissions;
  mapping['D31'] = data.emissionsBalance.totalIndirectEmissions;
  mapping['E31'] = data.emissionsBalance.totalIndirectEmissions;
  mapping['F31'] = data.emissionsBalance.totalIndirectEmissions;

  mapping['C32'] = data.emissionsBalance.totalEmissions;
  mapping['D32'] = data.emissionsBalance.totalEmissions;
  mapping['E32'] = data.emissionsBalance.totalEmissions;
  mapping['F32'] = data.emissionsBalance.totalEmissions;

  // Data quality mapping
  mapping['H40'] = data.dataQuality.generalDataQuality;
  mapping['I40'] = data.dataQuality.generalDataQuality;
  mapping['J40'] = data.dataQuality.generalDataQuality;
  mapping['K40'] = data.dataQuality.generalDataQuality;

  mapping['H41'] = data.dataQuality.defaultValuesJustification;
  mapping['I41'] = data.dataQuality.defaultValuesJustification;
  mapping['J41'] = data.dataQuality.defaultValuesJustification;
  mapping['K41'] = data.dataQuality.defaultValuesJustification;

  mapping['H42'] = data.dataQuality.qualityAssurance;
  mapping['I42'] = data.dataQuality.qualityAssurance;
  mapping['J42'] = data.dataQuality.qualityAssurance;
  mapping['K42'] = data.dataQuality.qualityAssurance;
  mapping['L42'] = data.dataQuality.qualityAssurance;
  mapping['M42'] = data.dataQuality.qualityAssurance;

  return mapping;
}

export function selfTestCInstEmissions(): { ok: boolean; errors: string[] } {
  const sample: Partial<CInstEmissionsData> = {
    fuelBalance: { totalFuelInput: 100, directFuelCBAM: 40, fuelForElectricity: 30, directFuelNonCBAM: 30, manualEntries: {} },
    emissionsBalance: { totalCO2Emissions: 1000, biomassEmissions: 0, totalN2OEmissions: 10, totalPFCEmissions: 1, totalDirectEmissions: 0, totalIndirectEmissions: 50, totalEmissions: 0, manualEntries: {} },
    dataQuality: { generalDataQuality: 'Actual data', defaultValuesJustification: 'No data available', qualityAssurance: 'Verified by accredited verifier' },
    metadata: { reportingPeriod: '', calculationMethod: 'auto', dataSource: 'manual' },
    validationStatus: { isValid: false, errors: [], warnings: [], completenessScore: 0 }
  } as any;
  const res = calculateCInstEmissions(sample);
  const errors: string[] = [];
  if (res.data.emissionsBalance.totalDirectEmissions <= 0) errors.push('Direct emissions not calculated');
  if (res.data.emissionsBalance.totalEmissions <= 0) errors.push('Total emissions not calculated');
  return { ok: errors.length === 0, errors };
}
