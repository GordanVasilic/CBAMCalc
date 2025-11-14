/**
 * C_InstEmissions Types - Carbon Border Adjustment Mechanism
 * Emissions and Energy Balance Data for Installation
 * Based on Excel template structure
 */

// Constants and enums
export const DATA_QUALITY_OPTIONS = [
  'Actual data',
  'Estimated data',
  'Calculated data',
  'Default values',
  'Other'
] as const;

export const DEFAULT_VALUES_JUSTIFICATION_OPTIONS = [
  'No data available',
  'Data quality issues',
  'Cost of data collection',
  'Technical limitations',
  'Other'
] as const;

export const QUALITY_ASSURANCE_OPTIONS = [
  'Verified by accredited verifier',
  'Internal quality control',
  'Third party verification',
  'Not verified',
  'Other'
] as const;

export type DataQualityOption = typeof DATA_QUALITY_OPTIONS[number];
export type DefaultValuesJustificationOption = typeof DEFAULT_VALUES_JUSTIFICATION_OPTIONS[number];
export type QualityAssuranceOption = typeof QUALITY_ASSURANCE_OPTIONS[number];

// Fuel balance structure
export interface FuelBalance {
  totalFuelInput: number; // TJ - Total fuel input
  directFuelCBAM: number; // TJ - Direct fuel for CBAM goods
  fuelForElectricity: number; // TJ - Fuel for electricity generation
  directFuelNonCBAM: number; // TJ - Direct fuel for non-CBAM goods
  manualEntries: {
    totalFuelInput?: number;
    directFuelCBAM?: number;
    fuelForElectricity?: number;
    directFuelNonCBAM?: number;
  };
}

// GHG emissions balance structure
export interface GHGEmissionsBalance {
  totalCO2Emissions: number; // tCO2e - Total CO2 emissions
  biomassEmissions: number; // tCO2e - CO2 emissions from biomass
  totalN2OEmissions: number; // tCO2e - Total N2O emissions
  totalPFCEmissions: number; // tCO2e - Total PFC emissions
  totalDirectEmissions: number; // tCO2e - Total direct emissions
  totalIndirectEmissions: number; // tCO2e - Total indirect emissions
  totalEmissions: number; // tCO2e - Total emissions (direct + indirect)
  manualEntries: {
    totalCO2Emissions?: number;
    biomassEmissions?: number;
    totalN2OEmissions?: number;
    totalPFCEmissions?: number;
    totalDirectEmissions?: number;
    totalIndirectEmissions?: number;
    totalEmissions?: number;
  };
}

// Data quality information
export interface DataQualityInfo {
  generalDataQuality: DataQualityOption; // General data quality assessment
  defaultValuesJustification: DefaultValuesJustificationOption; // Why using default values
  qualityAssurance: QualityAssuranceOption; // Quality assurance method
  additionalComments?: string; // Optional additional comments
}

// Main C_InstEmissions data structure
export interface CInstEmissionsData {
  // Fuel balance data
  fuelBalance: FuelBalance;
  
  // GHG emissions balance data
  emissionsBalance: GHGEmissionsBalance;
  
  // Data quality information
  dataQuality: DataQualityInfo;
  
  // Validation and metadata
  validationStatus: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    completenessScore: number; // 0-100%
  };
  
  // Calculation metadata
  metadata: {
    reportingPeriod: string;
    calculationMethod: 'auto' | 'manual';
    dataSource: 'B_EmInst' | 'manual';
    lastCalculated?: Date;
    importedFromBEmInst?: boolean;
  };
}

// Constants for default values
export const C_INST_EMISSIONS_DEFAULTS: CInstEmissionsData = {
  fuelBalance: {
    totalFuelInput: 0,
    directFuelCBAM: 0,
    fuelForElectricity: 0,
    directFuelNonCBAM: 0,
    manualEntries: {}
  },
  emissionsBalance: {
    totalCO2Emissions: 0,
    biomassEmissions: 0,
    totalN2OEmissions: 0,
    totalPFCEmissions: 0,
    totalDirectEmissions: 0,
    totalIndirectEmissions: 0,
    totalEmissions: 0,
    manualEntries: {}
  },
  dataQuality: {
    generalDataQuality: 'Actual data',
    defaultValuesJustification: 'No data available',
    qualityAssurance: 'Verified by accredited verifier'
  },
  validationStatus: {
    isValid: false,
    errors: [],
    warnings: [],
    completenessScore: 0
  },
  metadata: {
    reportingPeriod: '',
    calculationMethod: 'auto',
    dataSource: 'B_EmInst'
  }
};

// Validation rules
export const C_INST_EMISSIONS_VALIDATION_RULES = {
  fuelBalance: {
    totalFuelInput: { min: 0, max: 1000000, required: true },
    directFuelCBAM: { min: 0, max: 1000000, required: true },
    fuelForElectricity: { min: 0, max: 1000000, required: true },
    directFuelNonCBAM: { min: 0, max: 1000000, required: true }
  },
  emissionsBalance: {
    totalCO2Emissions: { min: 0, max: 10000000, required: true },
    biomassEmissions: { min: 0, max: 1000000, required: false },
    totalN2OEmissions: { min: 0, max: 1000000, required: true },
    totalPFCEmissions: { min: 0, max: 1000000, required: false },
    totalDirectEmissions: { min: 0, max: 10000000, required: true },
    totalIndirectEmissions: { min: 0, max: 10000000, required: true }
  }
};

// Excel row mapping for export functionality
export const C_INST_EMISSIONS_EXCEL_MAPPING = {
  // Fuel Balance (rows 15-18)
  fuelBalance: {
    totalFuelInput: { row: 15, columns: ['C', 'D', 'E', 'F'] },
    directFuelCBAM: { row: 16, columns: ['C', 'D', 'E', 'F'] },
    fuelForElectricity: { row: 17, columns: ['C', 'D', 'E', 'F'] },
    directFuelNonCBAM: { row: 18, columns: ['C', 'D', 'E', 'F'] }
  },
  // Emissions Balance (rows 26-32)
  emissionsBalance: {
    totalCO2Emissions: { row: 26, columns: ['C', 'D', 'E', 'F'] },
    biomassEmissions: { row: 27, columns: ['C', 'D', 'E', 'F'] },
    totalN2OEmissions: { row: 28, columns: ['C', 'D', 'E', 'F'] },
    totalPFCEmissions: { row: 29, columns: ['C', 'D', 'E', 'F'] },
    totalDirectEmissions: { row: 30, columns: ['C', 'D', 'E', 'F'] },
    totalIndirectEmissions: { row: 31, columns: ['C', 'D', 'E', 'F'] },
    totalEmissions: { row: 32, columns: ['C', 'D', 'E', 'F'] }
  },
  // Data Quality (rows 40-42)
  dataQuality: {
    generalDataQuality: { row: 40, columns: ['H', 'I', 'J', 'K'] },
    defaultValuesJustification: { row: 41, columns: ['H', 'I', 'J', 'K'] },
    qualityAssurance: { row: 42, columns: ['H', 'I', 'J', 'K', 'L', 'M'] }
  }
};
