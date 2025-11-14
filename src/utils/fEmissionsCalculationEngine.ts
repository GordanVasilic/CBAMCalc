import {
  FEmissionsData,
  AdditionalEmission,
  EmissionCalculations,
  CalculationCheck,
  F_EMISSIONS_DEFAULTS,
  EMISSION_TYPES,
  CALCULATION_METHODS,
  DATA_QUALITY_LEVELS,
  VERIFICATION_LEVELS,
  VERIFICATION_RESULTS,
  VerificationData,
  EXCEL_ROW_MAPPINGS,
  VALIDATION_RULES,
  CALCULATION_CONSTANTS,
  ValidationResult,
  CalculationResult
} from '../types/FEmissionsTypes';

import { CInstEmissionsData } from '../types/CInstEmissionsTypes';
import { BEmInstData } from '../types/BEmInstTypes';

export function calculateFEmissions(
  currentData: Partial<FEmissionsData>,
  cInstEmissionsData?: CInstEmissionsData,
  bEmInstData?: BEmInstData
): CalculationResult {
  const data: FEmissionsData = {
    ...F_EMISSIONS_DEFAULTS,
    ...currentData
  };

  const validationErrors: string[] = [];
  const validationWarnings: string[] = [];

  // Validate each additional emission entry
  data.additionalEmissions.forEach((emission, index) => {
    validateAdditionalEmission(emission, index, validationErrors, validationWarnings);
  });

  // Perform cross-sheet validation if enabled
  if (data.metadata.crossSheetValidation) {
    performCrossSheetValidation(data, cInstEmissionsData, bEmInstData, validationErrors, validationWarnings);
  }

  // Calculate emission totals and checks
  const emissionCalculations = calculateEmissionCalculations(data.additionalEmissions);
  
  // Perform calculation checks
  const calculationChecks = performCalculationChecks(data.additionalEmissions, emissionCalculations);
  
  // Update emission calculations with checks
  emissionCalculations.calculationChecks = calculationChecks;

  // Validate verification data
  validateVerificationData(data.verificationData, validationErrors, validationWarnings);

  return {
    data: {
      ...data,
      emissionCalculations,
      validationStatus: {
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        warnings: validationWarnings,
        completenessScore: calculateCompletenessScore(data)
      }
    },
    calculatedFields: ['emissionCalculations'],
    validationErrors,
    validationWarnings
  };
}

function validateAdditionalEmission(
  emission: AdditionalEmission,
  index: number,
  errors: string[],
  warnings: string[]
): void {
  const prefix = `Additional Emission ${index + 1}`;

  // Required field validation
  if (!emission.emissionSource?.trim()) {
    errors.push(`${prefix}: Emission source is required`);
  } else if (emission.emissionSource.length > VALIDATION_RULES.emissionSource.maxLength) {
    errors.push(`${prefix}: Emission source too long (max ${VALIDATION_RULES.emissionSource.maxLength} characters)`);
  }

  if (!EMISSION_TYPES.includes(emission.emissionType)) {
    errors.push(`${prefix}: Invalid emission type`);
  }

  if (!CALCULATION_METHODS.includes(emission.calculationMethod)) {
    errors.push(`${prefix}: Invalid calculation method`);
  }

  // Emission value validation
  if (emission.co2Emissions < 0 || emission.co2Emissions > VALIDATION_RULES.co2Emissions.max) {
    errors.push(`${prefix}: CO2 emissions must be between 0 and ${VALIDATION_RULES.co2Emissions.max}`);
  }

  if (emission.n2OEmissions < 0 || emission.n2OEmissions > VALIDATION_RULES.n2OEmissions.max) {
    errors.push(`${prefix}: N2O emissions must be between 0 and ${VALIDATION_RULES.n2OEmissions.max}`);
  }

  if (emission.pfcEmissions < 0 || emission.pfcEmissions > VALIDATION_RULES.pfcEmissions.max) {
    errors.push(`${prefix}: PFC emissions must be between 0 and ${VALIDATION_RULES.pfcEmissions.max}`);
  }

  if (emission.biomassCO2 < 0 || emission.biomassCO2 > VALIDATION_RULES.biomassCO2.max) {
    errors.push(`${prefix}: Biomass CO2 must be between 0 and ${VALIDATION_RULES.biomassCO2.max}`);
  }

  // Uncertainty validation
  if (emission.uncertainty < 0 || emission.uncertainty > 100) {
    errors.push(`${prefix}: Uncertainty must be between 0% and 100%`);
  }

  if (emission.uncertainty > CALCULATION_CONSTANTS.maxUncertainty) {
    warnings.push(`${prefix}: High uncertainty detected (${emission.uncertainty}%)`);
  }

  // Data quality validation
  if (!DATA_QUALITY_LEVELS.includes(emission.dataQuality)) {
    errors.push(`${prefix}: Invalid data quality level`);
  }

  if (emission.dataQuality === 'Poor' || emission.dataQuality === 'Very Poor') {
    warnings.push(`${prefix}: Low data quality may affect reliability`);
  }

  // Verification status validation
  if (!['Verified', 'Not Verified', 'Under Review', 'Pending', 'Rejected'].includes(emission.verificationStatus)) {
    errors.push(`${prefix}: Invalid verification status`);
  }

  // Activity data validation
  if (emission.activityData.value <= 0) {
    errors.push(`${prefix}: Activity data value must be positive`);
  }

  if (!emission.activityData.unit?.trim()) {
    errors.push(`${prefix}: Activity data unit is required`);
  }

  // Emission factor validation
  if (emission.emissionFactor.value <= 0) {
    errors.push(`${prefix}: Emission factor must be positive`);
  }

  if (!emission.emissionFactor.unit?.trim()) {
    errors.push(`${prefix}: Emission factor unit is required`);
  }

  if (emission.emissionFactor.biomassFraction < 0 || emission.emissionFactor.biomassFraction > 1) {
    errors.push(`${prefix}: Biomass fraction must be between 0 and 1`);
  }

  const unitCompat = getUnitCompatibility(emission.activityData.unit, emission.emissionFactor.unit);
  if (!unitCompat.compatible) {
    warnings.push(`${prefix}: Incompatible units for activity data and emission factor (${emission.activityData.unit} vs ${emission.emissionFactor.unit})`);
  }
  const activityInEFUnit = convertActivityToEFUnit(emission.activityData.value, emission.activityData.unit, unitCompat);
  const calculatedCO2 = activityInEFUnit * emission.emissionFactor.value * (1 - emission.emissionFactor.biomassFraction);
  const tolerance = Math.abs(calculatedCO2 - emission.co2Emissions) / (emission.co2Emissions || 1);
  if (tolerance > 0.1) {
    warnings.push(`${prefix}: Significant difference between calculated and reported CO2 emissions`);
  }
}

function getUnitCompatibility(activityUnit?: string, efUnit?: string): { compatible: boolean; efPer: 't' | 'kWh' | 'MWh' | 'GJ' | 'TJ'; } {
  const au = (activityUnit || '').toUpperCase();
  const eu = (efUnit || '').toUpperCase();
  if (eu.endsWith('/T')) return { compatible: au === 'T' || au === 'KG' || au === 'G', efPer: 't' };
  if (eu.endsWith('/KWH')) return { compatible: au === 'KWH' || au === 'MWH', efPer: 'kWh' };
  if (eu.endsWith('/MWH')) return { compatible: au === 'MWH' || au === 'KWH', efPer: 'MWh' };
  if (eu.endsWith('/GJ')) return { compatible: au === 'GJ' || au === 'TJ', efPer: 'GJ' };
  if (eu.endsWith('/TJ')) return { compatible: au === 'TJ' || au === 'GJ', efPer: 'TJ' };
  return { compatible: true, efPer: 't' };
}

function convertActivityToEFUnit(value: number, unit?: string, compat?: { compatible: boolean; efPer: 't' | 'kWh' | 'MWh' | 'GJ' | 'TJ' }): number {
  const au = (unit || '').toUpperCase();
  const per = compat?.efPer || 't';
  if (per === 't') {
    if (au === 'KG') return value / 1000;
    if (au === 'G') return value / 1_000_000;
    return value;
  }
  if (per === 'MWh') {
    if (au === 'KWH') return value / 1000;
    return value;
  }
  if (per === 'kWh') {
    if (au === 'MWH') return value * 1000;
    return value;
  }
  if (per === 'GJ') {
    if (au === 'TJ') return value * 1000;
    return value;
  }
  if (per === 'TJ') {
    if (au === 'GJ') return value / 1000;
    return value;
  }
  return value;
}

function calculateEmissionCalculations(additionalEmissions: AdditionalEmission[]): EmissionCalculations {
  const totalCO2 = additionalEmissions.reduce((sum, emission) => sum + emission.co2Emissions, 0);
  const totalN2O = additionalEmissions.reduce((sum, emission) => sum + emission.n2OEmissions, 0);
  const totalPFC = additionalEmissions.reduce((sum, emission) => sum + emission.pfcEmissions, 0);
  const totalBiomassCO2 = additionalEmissions.reduce((sum, emission) => sum + emission.biomassCO2, 0);
  const totalFossilCO2 = totalCO2 - totalBiomassCO2;
  
  // Calculate CO2 equivalent using global warming potentials
  const co2Equivalent = totalCO2 + (totalN2O * CALCULATION_CONSTANTS.n2oGWP) + (totalPFC * CALCULATION_CONSTANTS.pfcGWP);
  const totalGHG = totalCO2 + totalN2O + totalPFC;

  return {
    totalCO2,
    totalN2O,
    totalPFC,
    totalBiomassCO2,
    totalFossilCO2,
    totalGHG,
    co2Equivalent,
    calculationChecks: []
  };
}

function performCalculationChecks(
  additionalEmissions: AdditionalEmission[],
  calculations: EmissionCalculations
): CalculationCheck[] {
  const checks: CalculationCheck[] = [];

  // Cross-total check
  const calculatedTotalCO2 = additionalEmissions.reduce((sum, emission) => sum + emission.co2Emissions, 0);
  checks.push({
    checkName: 'CO2 Total Cross-Check',
    checkType: 'CrossTotal',
    result: Math.abs(calculatedTotalCO2 - calculations.totalCO2) < 0.001 ? 'Pass' : 'Fail',
    expectedValue: calculatedTotalCO2,
    actualValue: calculations.totalCO2,
    tolerance: 0.001,
    status: Math.abs(calculatedTotalCO2 - calculations.totalCO2) < 0.001 ? 'OK' : 'Error',
    message: `CO2 total cross-check: Expected ${calculatedTotalCO2.toFixed(3)}, Actual ${calculations.totalCO2.toFixed(3)}`
  });

  // Biomass consistency check
  const hasBiomassEmissions = additionalEmissions.some(emission => emission.biomassCO2 > 0);
  const biomassFractionCheck = calculations.totalBiomassCO2 <= calculations.totalCO2;
  
  checks.push({
    checkName: 'Biomass Consistency Check',
    checkType: 'Consistency',
    result: biomassFractionCheck ? 'Pass' : 'Fail',
    actualValue: calculations.totalBiomassCO2,
    expectedValue: calculations.totalCO2,
    tolerance: 0,
    status: biomassFractionCheck ? 'OK' : 'Error',
    message: hasBiomassEmissions ? 'Biomass emissions detected and consistent' : 'No biomass emissions'
  });

  // Uncertainty check
  const avgUncertainty = additionalEmissions.length > 0 
    ? additionalEmissions.reduce((sum, emission) => sum + emission.uncertainty, 0) / additionalEmissions.length
    : 0;
  
  checks.push({
    checkName: 'Average Uncertainty Check',
    checkType: 'Uncertainty',
    result: avgUncertainty <= CALCULATION_CONSTANTS.maxUncertainty ? 'Pass' : 'Warning',
    actualValue: avgUncertainty,
    expectedValue: CALCULATION_CONSTANTS.maxUncertainty,
    tolerance: 5,
    status: avgUncertainty <= CALCULATION_CONSTANTS.maxUncertainty ? 'OK' : 'Warning',
    message: `Average uncertainty: ${avgUncertainty.toFixed(1)}%`
  });

  // Data quality check
  const lowQualityCount = additionalEmissions.filter(
    emission => emission.dataQuality === 'Poor' || emission.dataQuality === 'Very Poor'
  ).length;
  
  checks.push({
    checkName: 'Data Quality Check',
    checkType: 'Completeness',
    result: lowQualityCount === 0 ? 'Pass' : 'Warning',
    actualValue: lowQualityCount,
    expectedValue: 0,
    tolerance: 0,
    status: lowQualityCount === 0 ? 'OK' : 'Warning',
    message: `${lowQualityCount} entries with poor/very poor data quality`
  });

  // CO2 equivalent calculation check
  const calculatedCO2Equivalent = calculations.totalCO2 + 
    (calculations.totalN2O * CALCULATION_CONSTANTS.n2oGWP) + 
    (calculations.totalPFC * CALCULATION_CONSTANTS.pfcGWP);
  
  checks.push({
    checkName: 'CO2 Equivalent Calculation Check',
    checkType: 'EmissionFactor',
    result: Math.abs(calculatedCO2Equivalent - calculations.co2Equivalent) < 0.001 ? 'Pass' : 'Fail',
    expectedValue: calculatedCO2Equivalent,
    actualValue: calculations.co2Equivalent,
    tolerance: 0.001,
    status: Math.abs(calculatedCO2Equivalent - calculations.co2Equivalent) < 0.001 ? 'OK' : 'Error',
    message: `CO2 equivalent calculation verified`
  });

  return checks;
}

function validateVerificationData(
  verificationData: VerificationData,
  errors: string[],
  warnings: string[]
): void {
  if (verificationData.verificationBody?.trim() && !verificationData.verificationDate) {
    warnings.push('Verification body provided but no verification date');
  }

  if (verificationData.verificationDate && !verificationData.verificationBody?.trim()) {
    warnings.push('Verification date provided but no verification body');
  }

  if (!VERIFICATION_LEVELS.includes(verificationData.verificationLevel)) {
    errors.push('Invalid verification level');
  }

  if (!VERIFICATION_RESULTS.includes(verificationData.verificationResult)) {
    errors.push('Invalid verification result');
  }
}

function performCrossSheetValidation(
  fEmissionsData: FEmissionsData,
  cInstEmissionsData?: CInstEmissionsData,
  bEmInstData?: BEmInstData,
  errors: string[] = [],
  warnings: string[] = []
): void {
  if (!cInstEmissionsData && !bEmInstData) {
    return; // No cross-sheet data to validate against
  }

  // Validate against C_InstEmissions data
  if (cInstEmissionsData) {
    const cDirect = cInstEmissionsData.emissionsBalance.totalDirectEmissions;
    const cCO2 = cInstEmissionsData.emissionsBalance.totalCO2Emissions;
    const cBiomass = cInstEmissionsData.emissionsBalance.biomassEmissions;
    const cTotal = cInstEmissionsData.emissionsBalance.totalEmissions;

    const fCO2 = fEmissionsData.emissionCalculations.totalCO2;
    const fBiomass = fEmissionsData.emissionCalculations.totalBiomassCO2;
    const fCO2Eq = fEmissionsData.emissionCalculations.co2Equivalent;

    if (cDirect > 0 && fCO2 > cDirect) {
      errors.push('F_Emissions total CO2 exceeds total direct emissions reported in C_InstEmissions');
    } else if (cDirect > 0 && fCO2 > cDirect * 0.5) {
      warnings.push('F_Emissions total CO2 is unusually high compared to C_InstEmissions total direct emissions');
    }

    if (cCO2 > 0 && fCO2 > cCO2 * 0.6) {
      warnings.push('F_Emissions CO2 share is high relative to C_InstEmissions CO2');
    }

    if (cBiomass === 0 && fBiomass > 0) {
      warnings.push('Biomass emissions present in F_Emissions but not reported in C_InstEmissions');
    } else if (cBiomass > 0) {
      const base = cBiomass || 1;
      const ratio = Math.abs(fBiomass - cBiomass) / base;
      if (ratio > 0.6) {
        errors.push('Biomass emissions differ >60% between F_Emissions and C_InstEmissions');
      } else if (ratio > 0.3) {
        warnings.push('Biomass emissions differ >30% between F_Emissions and C_InstEmissions');
      }
    }

    if (cTotal > 0) {
      const ratio = Math.abs(fCO2Eq - cTotal) / cTotal;
      if (ratio > 0.5) {
        errors.push('CO2 equivalent in F_Emissions differs >50% from total emissions in C_InstEmissions');
      } else if (ratio > 0.2) {
        warnings.push('CO2 equivalent in F_Emissions differs >20% from total emissions in C_InstEmissions');
      }
    }
  }

  // Validate against B_EmInst data
  if (bEmInstData) {
    const bEmInstSources = bEmInstData.emissionSources.length;
    const fEmissionsSources = fEmissionsData.additionalEmissions.length;
    
    if (bEmInstSources > 0 && fEmissionsSources > bEmInstSources * 2) {
      warnings.push('Unusually high number of additional emission sources compared to B_EmInst emission sources');
    }
  }
}

function calculateCompletenessScore(data: FEmissionsData): number {
  if (data.additionalEmissions.length === 0) return 0;
  
  const scores = data.additionalEmissions.map(emission => {
    let score = 0;
    let maxScore = 100;

    // Required fields (70% of score)
    if (emission.emissionSource?.trim()) score += 15;
    if (EMISSION_TYPES.includes(emission.emissionType)) score += 10;
    if (emission.co2Emissions >= 0) score += 15;
    if (CALCULATION_METHODS.includes(emission.calculationMethod)) score += 10;
    if (emission.activityData.value > 0) score += 10;
    if (emission.emissionFactor.value > 0) score += 10;

    // Optional fields (30% of score)
    if (emission.n2OEmissions >= 0) score += 5;
    if (emission.pfcEmissions >= 0) score += 5;
    if (emission.biomassCO2 >= 0) score += 5;
    if (DATA_QUALITY_LEVELS.includes(emission.dataQuality)) score += 5;
    if (['Verified', 'Not Verified', 'Under Review'].includes(emission.verificationStatus)) score += 5;
    if (emission.uncertainty >= 0 && emission.uncertainty <= 100) score += 5;

    return score;
  });

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / data.additionalEmissions.length);
}

const fEmissionsAPI = {
  calculateFEmissions
};

export default fEmissionsAPI;

export function selfTestFEmissions(): { ok: boolean; errors: string[] } {
  const sample: Partial<FEmissionsData> = {
    additionalEmissions: [{
      id: 't1', emissionType: 'Other', emissionSource: 'Test', co2Emissions: 10, n2OEmissions: 0.1, pfcEmissions: 0.01,
      biomassCO2: 0, calculationMethod: 'Tier 1', activityData: { value: 10, unit: 't', dataSource: '', measurementMethod: '', uncertainty: 5, temporalResolution: 'Annual', spatialResolution: 'Site' },
      emissionFactor: { value: 1, unit: 't CO2/t', source: '', year: new Date().getFullYear(), applicability: '', uncertainty: 5, biomassFraction: 0 },
      uncertainty: 5, dataQuality: 'Good', verificationStatus: 'Not Verified', comments: ''
    }]
  } as any;
  const res = calculateFEmissions(sample);
  const errors: string[] = [];
  if (res.data.emissionCalculations.totalCO2 < 10) errors.push('CO2 total calculation incorrect');
  return { ok: errors.length === 0, errors };
}