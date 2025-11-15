/**
 * B_EmInst Sheet Types - Emission Installation Data
 * Based on Excel template B_EmInst worksheet structure
 */

export interface EmissionSourceStream {
  id: string;
  rowNumber: number;
  method: 'Combustion' | 'Process Emissions' | 'Mass balance' | 'PFC';
  sourceStreamName: string;
  activityData: number;
  activityDataUnit: string;
  netCalorificValue?: number;
  netCalorificValueUnit?: string;
  emissionFactor?: number;
  emissionFactorUnit?: string;
  carbonContent?: number;
  carbonContentUnit?: string;
  oxidationFactor?: number;
  oxidationFactorUnit?: string;
  conversionFactor?: number;
  conversionFactorUnit?: string;
  biomassContent?: number;
  biomassContentUnit?: string;
  nonSustainableBiomassContent?: number;
  nonSustainableBiomassContentUnit?: string;
  
  // PFC specific fields
  hourlyGHGConcentrationAverage?: number;
  hourlyGHGConcentrationUnit?: string;
  hoursOperating?: number;
  hoursOperatingUnit?: string;
  flueGasFlowAverage?: number;
  flueGasFlowAverageUnit?: string;
  flueGasTotal?: number;
  flueGasTotalUnit?: string;
  
  // Annual GHG data
  annualGHGAmount?: number;
  annualGHGUnit?: string;
  gwp?: number;
  
  // PFC specific calculation fields
  frequency?: number;
  duration?: number;
  sefCF4?: number;
  aeo?: number;
  ce?: number;
  ovc?: number;
  c2f6Factor?: number;
  cf4EmissionsTons?: number;
  c2f6EmissionsTons?: number;
  gwpCF4?: number;
  gwpC2F6?: number;
  cf4EmissionsCO2e?: number;
  c2f6EmissionsCO2e?: number;
  collectionEfficiency?: number;
  
  // Calculated emissions
  co2eFossil?: number;
  co2eBiomass?: number;
  co2eNonSustainableBiomass?: number;
  energyContentFossil?: number;
  energyContentBiomass?: number;
  energyContentFossilUnit?: string;
  energyContentBiomassUnit?: string;
  
  // Validation and calculation flags
  isValid?: boolean;
  validationErrors?: string[];
  calculationMethod?: 'Combustion' | 'Process' | 'Mass Balance';
  isBiomass?: boolean;
  isFossil?: boolean;
  
  // Additional Excel fields
  notes?: string;
  dataSource?: string;
  uncertainty?: number;
  measurementFrequency?: string;
  measurementMethod?: string;
  
  // Conditional formatting flags (from Excel)
  condFormatEF?: boolean;
  condFormatCC?: boolean;
  condFormatOxF?: boolean;
  condFormatNCV?: boolean;
  condFormatADEFUnits?: boolean;
  condFormatCombustion?: boolean;
  condFormatProcess?: boolean;
  condFormatMassBalance?: boolean;
  condFormatCompleteness?: boolean;
}

export interface BEmInstData {
  emissionSources: EmissionSourceStream[];
  pfcEmissions: PFCSourceStream[];
  totals: {
    totalCO2eFossil: number;
    totalCO2eBiomass: number;
    totalCO2eNonSustainableBiomass: number;
    totalEnergyContentFossil: number;
    totalEnergyContentBiomass: number;
    totalCF4Emissions: number;
    totalC2F6Emissions: number;
    totalPFCEmissions: number;
  };
  validationStatus: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    completenessScore: number;
  };
  reportingPeriod: string;
  verificationDate?: string;
  verifierName?: string;
  verifierAccreditationNumber?: string;
}

export interface PFCSourceStream {
  id: string;
  rowNumber: number;
  method: 'Slope method' | 'Technology specific' | 'Other';
  technologyType: string;
  activityData: number;
  activityDataUnit: string;
  
  // PFC calculation parameters
  frequency: number;
  duration: number;
  sefCF4: number;
  aeo: number;
  ce: number;
  ovc: number;
  c2f6Factor: number;
  
  // Results
  cf4EmissionsTons: number;
  c2f6EmissionsTons: number;
  gwpCF4: number;
  gwpC2F6: number;
  cf4EmissionsCO2e: number;
  c2f6EmissionsCO2e: number;
  collectionEfficiency: number;
  
  // Status
  isComplete: boolean;
  validationErrors?: string[];
}

// Constants from Excel B_EmInst sheet
export const BEMINST_CONSTANTS = {
  GWP_CF4: 6630,
  GWP_C2F6: 11100,
  DEFAULT_OXIDATION_FACTOR: 1.0,
  DEFAULT_CONVERSION_FACTOR: 3.667,
  
  // Validation thresholds
  MIN_ACTIVITY_DATA: 0,
  MAX_UNCERTAINTY: 0.2,
  MIN_COLLECTION_EFFICIENCY: 0.95,
  
  // Unit conversions
  TJ_TO_TCO2: 0.001, // Conversion from TJ to tCO2
  
  // Excel row mappings
  COMBUSTION_START_ROW: 15,
  COMBUSTION_END_ROW: 48,
  PROCESS_START_ROW: 49,
  PROCESS_END_ROW: 75,
  PFC_START_ROW: 98,
  PFC_END_ROW: 100,
} as const;

// Default emission sources from Excel template
export const DEFAULT_EMISSION_SOURCES: Omit<EmissionSourceStream, 'id'>[] = [
  // Combustion sources (rows 15-48)
  { rowNumber: 15, method: 'Combustion', sourceStreamName: 'Heavy fuel oil', activityData: 252000, activityDataUnit: 't', netCalorificValue: 45, netCalorificValueUnit: 'GJ/t', emissionFactor: 73, emissionFactorUnit: 'tCO2/TJ', oxidationFactor: 100, oxidationFactorUnit: '%', conversionFactor: 1, conversionFactorUnit: '%', biomassContent: 0, biomassContentUnit: '%', nonSustainableBiomassContent: 0, nonSustainableBiomassContentUnit: '%' },
  { rowNumber: 16, method: 'Process Emissions', sourceStreamName: 'Raw meal for clinker', activityData: 121000, activityDataUnit: 't', netCalorificValue: 0, netCalorificValueUnit: 'GJ/t', emissionFactor: 0.08794, emissionFactorUnit: 'tCO2/t', carbonContent: 0, carbonContentUnit: '%', oxidationFactor: 100, oxidationFactorUnit: '%', conversionFactor: 1, conversionFactorUnit: '%', biomassContent: 0, biomassContentUnit: '%', nonSustainableBiomassContent: 0, nonSustainableBiomassContentUnit: '%' },
  { rowNumber: 17, method: 'Mass balance', sourceStreamName: 'Steel', activityData: 1808226, activityDataUnit: 't', netCalorificValue: 0, netCalorificValueUnit: 'GJ/t', emissionFactor: 0, emissionFactorUnit: '', carbonContent: 0.003878, carbonContentUnit: 'tC/t', oxidationFactor: 0, oxidationFactorUnit: '%', conversionFactor: 1, conversionFactorUnit: '%', biomassContent: 0, biomassContentUnit: '%', nonSustainableBiomassContent: 0, nonSustainableBiomassContentUnit: '%' },
];

// PFC default sources
export const DEFAULT_PFC_SOURCES: Omit<PFCSourceStream, 'id'>[] = [
  { rowNumber: 98, method: 'Slope method', technologyType: 'Centre Worked Pre-Bake (CWPB)', activityData: 500000, activityDataUnit: 't', frequency: 2.17, duration: 1.23, sefCF4: 0.146, aeo: 0, ce: 0, ovc: 0.122, c2f6Factor: 0.122, cf4EmissionsTons: 194.8443, c2f6EmissionsTons: 23.7710046, gwpCF4: 6630, gwpC2F6: 11100, cf4EmissionsCO2e: 1291817.709, c2f6EmissionsCO2e: 263858.15106, collectionEfficiency: 0.98, isComplete: true },
];