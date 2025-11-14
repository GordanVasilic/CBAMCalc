/**
 * B_EmInst Calculation Engine
 * Implements Excel formulas from B_EmInst worksheet
 */

import { 
  EmissionSourceStream, 
  PFCSourceStream, 
  BEmInstData, 
  BEMINST_CONSTANTS 
} from '../types/BEmInstTypes';

/**
 * Calculate emissions for a single emission source stream
 * Based on Excel formulas from B_EmInst sheet
 */
export function calculateEmissionSourceStream(source: EmissionSourceStream): EmissionSourceStream {
  const calculated = { ...source };

  try {
    // Calculate based on method type
    switch (source.method) {
      case 'Combustion':
        calculateCombustionEmissions(calculated);
        break;
      case 'Process Emissions':
        calculateProcessEmissions(calculated);
        break;
      case 'Mass balance':
        calculateMassBalanceEmissions(calculated);
        break;
      case 'PFC':
        calculatePFCEmissions(calculated);
        break;
    }

    // Calculate energy content
    calculateEnergyContent(calculated);
    
    // Update validation status
    calculated.isValid = validateEmissionSourceStream(calculated);
    
  } catch (error) {
    calculated.validationErrors = [error instanceof Error ? error.message : String(error)];
    calculated.isValid = false;
  }

  return calculated;
}

/**
 * Calculate combustion emissions using formula:
 * CO2 = AD × NCV × EF × OxF × ConvF
 */
function calculateCombustionEmissions(source: EmissionSourceStream): void {
  if (!source.activityData || !source.netCalorificValue || !source.emissionFactor) {
    throw new Error('Missing required parameters for combustion calculation');
  }

  const oxidationFactor = source.oxidationFactor || BEMINST_CONSTANTS.DEFAULT_OXIDATION_FACTOR;
  const conversionFactor = source.conversionFactor || BEMINST_CONSTANTS.DEFAULT_CONVERSION_FACTOR;

  // Calculate total CO2 emissions
  const totalEmissions = source.activityData * 
                        (source.netCalorificValue / 1000) * // Convert to TJ if needed
                        (source.emissionFactor / 1000) * // Convert to tCO2/TJ
                        (oxidationFactor / 100) * // Convert percentage
                        (conversionFactor / 100); // Convert percentage

  // Split into fossil and biomass components
  const biomassFraction = (source.biomassContent || 0) / 100;
  const nonSustainableBiomassFraction = (source.nonSustainableBiomassContent || 0) / 100;
  
  source.co2eBiomass = totalEmissions * biomassFraction;
  source.co2eNonSustainableBiomass = totalEmissions * nonSustainableBiomassFraction;
  source.co2eFossil = totalEmissions * (1 - biomassFraction - nonSustainableBiomassFraction);

  source.calculationMethod = 'Combustion';
  source.isBiomass = biomassFraction > 0;
  source.isFossil = source.co2eFossil > 0;
}

/**
 * Calculate process emissions using formula:
 * CO2 = AD × EF
 */
function calculateProcessEmissions(source: EmissionSourceStream): void {
  if (!source.activityData || !source.emissionFactor) {
    throw new Error('Missing required parameters for process calculation');
  }

  const totalEmissions = source.activityData * source.emissionFactor;

  // Split into components based on biomass content
  const biomassFraction = (source.biomassContent || 0) / 100;
  const nonSustainableBiomassFraction = (source.nonSustainableBiomassContent || 0) / 100;
  
  source.co2eBiomass = totalEmissions * biomassFraction;
  source.co2eNonSustainableBiomass = totalEmissions * nonSustainableBiomassFraction;
  source.co2eFossil = totalEmissions * (1 - biomassFraction - nonSustainableBiomassFraction);

  source.calculationMethod = 'Process';
  source.isBiomass = biomassFraction > 0;
  source.isFossil = source.co2eFossil > 0;
}

/**
 * Calculate mass balance emissions using formula:
 * CO2 = AD × Carbon Content × ConvF
 */
function calculateMassBalanceEmissions(source: EmissionSourceStream): void {
  if (!source.activityData || !source.carbonContent || !source.conversionFactor) {
    throw new Error('Missing required parameters for mass balance calculation');
  }

  const conversionFactor = source.conversionFactor || BEMINST_CONSTANTS.DEFAULT_CONVERSION_FACTOR;
  
  const totalEmissions = source.activityData * 
                        source.carbonContent * 
                        (conversionFactor / 100); // Convert percentage

  // Split into components
  const biomassFraction = (source.biomassContent || 0) / 100;
  const nonSustainableBiomassFraction = (source.nonSustainableBiomassContent || 0) / 100;
  
  source.co2eBiomass = totalEmissions * biomassFraction;
  source.co2eNonSustainableBiomass = totalEmissions * nonSustainableBiomassFraction;
  source.co2eFossil = totalEmissions * (1 - biomassFraction - nonSustainableBiomassFraction);

  source.calculationMethod = 'Mass Balance';
  source.isBiomass = biomassFraction > 0;
  source.isFossil = source.co2eFossil > 0;
}

/**
 * Calculate PFC emissions using specific formulas
 */
function calculatePFCEmissions(source: EmissionSourceStream): void {
  // PFC calculations are handled separately in PFC-specific functions
  // This function is a placeholder for PFC-specific logic
}

/**
 * Calculate energy content for the source stream
 */
function calculateEnergyContent(source: EmissionSourceStream): void {
  if (source.method === 'Combustion' && source.netCalorificValue && source.activityData) {
    const totalEnergy = source.activityData * (source.netCalorificValue / 1000); // Convert to TJ
    
    const biomassFraction = (source.biomassContent || 0) / 100;
    source.energyContentFossil = totalEnergy * (1 - biomassFraction);
    source.energyContentBiomass = totalEnergy * biomassFraction;
    source.energyContentFossilUnit = 'TJ';
    source.energyContentBiomassUnit = 'TJ';
  }
}

/**
 * Calculate PFC emissions using Excel formulas
 */
export function calculatePFCSourceStream(pfc: PFCSourceStream): PFCSourceStream {
  const calculated = { ...pfc };

  try {
    // Calculate CF4 emissions: CF4 = Frequency × Duration × SEF(CF4) × AD
    calculated.cf4EmissionsTons = calculated.frequency * 
                                  calculated.duration * 
                                  calculated.sefCF4 * 
                                  (calculated.activityData / 1000); // Convert to thousands of tons

    // Calculate C2F6 emissions: C2F6 = F(C2F6) × CF4
    calculated.c2f6EmissionsTons = calculated.c2f6Factor * calculated.cf4EmissionsTons;

    // Calculate CO2 equivalent emissions
    calculated.cf4EmissionsCO2e = calculated.cf4EmissionsTons * BEMINST_CONSTANTS.GWP_CF4;
    calculated.c2f6EmissionsCO2e = calculated.c2f6EmissionsTons * BEMINST_CONSTANTS.GWP_C2F6;

    // Validate completeness
    calculated.isComplete = validatePFCSourceStream(calculated);
    
  } catch (error) {
    calculated.validationErrors = [error instanceof Error ? error.message : String(error)];
    calculated.isComplete = false;
  }

  return calculated;
}

/**
 * Validate emission source stream data
 */
export function validateEmissionSourceStream(source: EmissionSourceStream): boolean {
  const errors: string[] = [];

  // Required field validation
  if (!source.activityData || source.activityData < 0) {
    errors.push('Activity data must be positive');
  }

  if (!source.sourceStreamName?.trim()) {
    errors.push('Source stream name is required');
  }

  // Method-specific validation
  switch (source.method) {
    case 'Combustion':
      if (!source.netCalorificValue || source.netCalorificValue <= 0) {
        errors.push('Net calorific value is required for combustion method');
      }
      if (!source.emissionFactor || source.emissionFactor <= 0) {
        errors.push('Emission factor is required for combustion method');
      }
      break;
    case 'Process Emissions':
      if (!source.emissionFactor || source.emissionFactor <= 0) {
        errors.push('Emission factor is required for process method');
      }
      break;
    case 'Mass balance':
      if (!source.carbonContent || source.carbonContent < 0) {
        errors.push('Carbon content is required for mass balance method');
      }
      break;
  }

  // Range validation
  if (source.biomassContent && (source.biomassContent < 0 || source.biomassContent > 100)) {
    errors.push('Biomass content must be between 0 and 100 percent');
  }

  if (source.oxidationFactor && (source.oxidationFactor < 0 || source.oxidationFactor > 100)) {
    errors.push('Oxidation factor must be between 0 and 100 percent');
  }

  if (source.uncertainty && (source.uncertainty < 0 || source.uncertainty > 1)) {
    errors.push('Uncertainty must be between 0 and 1');
  }

  source.validationErrors = errors;
  return errors.length === 0;
}

/**
 * Validate PFC source stream data
 */
export function validatePFCSourceStream(pfc: PFCSourceStream): boolean {
  const errors: string[] = [];

  if (!pfc.activityData || pfc.activityData < 0) {
    errors.push('Activity data must be positive');
  }

  if (!pfc.technologyType?.trim()) {
    errors.push('Technology type is required');
  }

  if (pfc.collectionEfficiency && (pfc.collectionEfficiency < 0 || pfc.collectionEfficiency > 1)) {
    errors.push('Collection efficiency must be between 0 and 1');
  }

  // Validate calculation parameters
  if (pfc.frequency <= 0 || pfc.duration <= 0 || pfc.sefCF4 < 0) {
    errors.push('PFC calculation parameters must be positive');
  }

  pfc.validationErrors = errors;
  return errors.length === 0;
}

/**
 * Calculate B_EmInst totals
 */
export function calculateBEmInstTotals(data: BEmInstData): BEmInstData {
  const totals = {
    totalCO2eFossil: 0,
    totalCO2eBiomass: 0,
    totalCO2eNonSustainableBiomass: 0,
    totalEnergyContentFossil: 0,
    totalEnergyContentBiomass: 0,
    totalCF4Emissions: 0,
    totalC2F6Emissions: 0,
    totalPFCEmissions: 0,
  };

  // Sum emission sources
  data.emissionSources.forEach(source => {
    totals.totalCO2eFossil += source.co2eFossil || 0;
    totals.totalCO2eBiomass += source.co2eBiomass || 0;
    totals.totalCO2eNonSustainableBiomass += source.co2eNonSustainableBiomass || 0;
    totals.totalEnergyContentFossil += source.energyContentFossil || 0;
    totals.totalEnergyContentBiomass += source.energyContentBiomass || 0;
  });

  // Sum PFC emissions
  data.pfcEmissions.forEach(pfc => {
    totals.totalCF4Emissions += pfc.cf4EmissionsCO2e || 0;
    totals.totalC2F6Emissions += pfc.c2f6EmissionsCO2e || 0;
  });

  totals.totalPFCEmissions = totals.totalCF4Emissions + totals.totalC2F6Emissions;

  data.totals = totals;
  return data;
}

/**
 * Main calculation function for B_EmInst data
 */
export function calculateBEmInstData(data: BEmInstData): BEmInstData {
  try {
    // Calculate all emission sources
    data.emissionSources = data.emissionSources.map(calculateEmissionSourceStream);
    
    // Calculate all PFC sources
    data.pfcEmissions = data.pfcEmissions.map(calculatePFCSourceStream);
    
    // Calculate totals
    data = calculateBEmInstTotals(data);
    
    // Validate overall data
    const allErrors = [
      ...data.emissionSources.flatMap(s => s.validationErrors || []),
      ...data.pfcEmissions.flatMap(p => p.validationErrors || [])
    ];
    
    data.validationStatus = {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: [], // TODO: Add warning logic
      completenessScore: calculateCompletenessScore(data)
    };
    
  } catch (error) {
    data.validationStatus = {
      isValid: false,
      errors: [error instanceof Error ? error.message : String(error)],
      warnings: [],
      completenessScore: 0
    };
  }

  return data;
}

/**
 * Calculate completeness score based on Excel logic
 */
function calculateCompletenessScore(data: BEmInstData): number {
  let totalFields = 0;
  let completedFields = 0;

  data.emissionSources.forEach(source => {
    // Count required fields based on method
    switch (source.method) {
      case 'Combustion':
        totalFields += 6; // AD, NCV, EF, OxF, ConvF, BioC
        if (source.activityData) completedFields++;
        if (source.netCalorificValue) completedFields++;
        if (source.emissionFactor) completedFields++;
        if (source.oxidationFactor !== undefined) completedFields++;
        if (source.conversionFactor !== undefined) completedFields++;
        if (source.biomassContent !== undefined) completedFields++;
        break;
      case 'Process Emissions':
        totalFields += 3; // AD, EF, BioC
        if (source.activityData) completedFields++;
        if (source.emissionFactor) completedFields++;
        if (source.biomassContent !== undefined) completedFields++;
        break;
      case 'Mass balance':
        totalFields += 4; // AD, Carbon Content, ConvF, BioC
        if (source.activityData) completedFields++;
        if (source.carbonContent !== undefined) completedFields++;
        if (source.conversionFactor !== undefined) completedFields++;
        if (source.biomassContent !== undefined) completedFields++;
        break;
    }
  });

  return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
}