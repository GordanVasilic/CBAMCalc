export interface FEmissionsData {
  additionalEmissions: AdditionalEmission[];
  emissionCalculations: EmissionCalculations;
  verificationData: VerificationData;
  validationStatus: ValidationStatus;
  metadata: Metadata;
}

export interface AdditionalEmission {
  id: string;
  emissionType: EmissionType;
  emissionSource: string;
  co2Emissions: number;
  n2OEmissions: number;
  pfcEmissions: number;
  biomassCO2: number;
  calculationMethod: CalculationMethod;
  activityData: ActivityData;
  emissionFactor: EmissionFactor;
  uncertainty: number;
  dataQuality: DataQualityLevel;
  verificationStatus: VerificationStatus;
  comments: string;
}

export interface EmissionCalculations {
  totalCO2: number;
  totalN2O: number;
  totalPFC: number;
  totalBiomassCO2: number;
  totalFossilCO2: number;
  totalGHG: number;
  co2Equivalent: number;
  calculationChecks: CalculationCheck[];
}

export interface VerificationData {
  verificationBody: string;
  verificationDate: string;
  verificationScope: string;
  verificationLevel: VerificationLevel;
  verificationResult: VerificationResult;
  verificationReport: string;
  accreditedBody: boolean;
}

export interface ValidationStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  completenessScore: number;
}

export interface Metadata {
  reportingPeriod: string;
  calculationVersion: string;
  calculationDate: string;
  calculatedBy: string;
  reviewedBy: string;
  dataSource: DataSource;
  calculationApproach: CalculationApproach;
  crossSheetValidation: boolean;
}

export interface ActivityData {
  value: number;
  unit: string;
  dataSource: string;
  measurementMethod: string;
  uncertainty: number;
  temporalResolution: string;
  spatialResolution: string;
}

export interface EmissionFactor {
  value: number;
  unit: string;
  source: string;
  year: number;
  applicability: string;
  uncertainty: number;
  biomassFraction: number;
}

export interface CalculationCheck {
  checkName: string;
  checkType: CheckType;
  result: CheckResult;
  expectedValue?: number;
  actualValue: number;
  tolerance: number;
  status: CheckStatus;
  message: string;
}

export type EmissionType = 
  | 'Combustion'
  | 'Process'
  | 'Fugitive'
  | 'Venting'
  | 'Flaring'
  | 'Storage'
  | 'Transportation'
  | 'Waste'
  | 'Other';

export type CalculationMethod = 
  | 'Tier 1'
  | 'Tier 2'
  | 'Tier 3'
  | 'Mass Balance'
  | 'Engineering Estimate'
  | 'Direct Measurement'
  | 'Site Specific';

export type DataQualityLevel = 
  | 'Excellent'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Very Poor'
  | 'Unknown';

export type VerificationStatus = 
  | 'Verified'
  | 'Not Verified'
  | 'Under Review'
  | 'Pending'
  | 'Rejected';

export type VerificationLevel = 
  | 'Limited'
  | 'Reasonable'
  | 'High'
  | 'Full';

export type VerificationResult = 
  | 'Satisfactory'
  | 'Unsatisfactory'
  | 'Qualified'
  | 'Adverse'
  | 'Inconclusive';

export type CheckType = 
  | 'CrossTotal'
  | 'MaterialBalance'
  | 'EmissionFactor'
  | 'ActivityData'
  | 'Uncertainty'
  | 'Completeness'
  | 'Consistency';

export type CheckResult = 'Pass' | 'Fail' | 'Warning';

export type CheckStatus = 'OK' | 'Error' | 'Warning' | 'Info';

export type DataSource = 
  | 'Manual Entry'
  | 'Auto Calculated'
  | 'Imported'
  | 'Previous Period'
  | 'Estimated';

export type CalculationApproach = 
  | 'IPCC Guidelines'
  | 'EU ETS Methodology'
  | 'CBAM Methodology'
  | 'Company Specific'
  | 'Industry Standard';

export const EMISSION_TYPES: EmissionType[] = [
  'Combustion',
  'Process',
  'Fugitive',
  'Venting',
  'Flaring',
  'Storage',
  'Transportation',
  'Waste',
  'Other'
];

export const CALCULATION_METHODS: CalculationMethod[] = [
  'Tier 1',
  'Tier 2',
  'Tier 3',
  'Mass Balance',
  'Engineering Estimate',
  'Direct Measurement',
  'Site Specific'
];

export const DATA_QUALITY_LEVELS: DataQualityLevel[] = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Very Poor',
  'Unknown'
];

export const VERIFICATION_LEVELS: VerificationLevel[] = [
  'Limited',
  'Reasonable',
  'High',
  'Full'
];

export const VERIFICATION_RESULTS: VerificationResult[] = [
  'Satisfactory',
  'Unsatisfactory',
  'Qualified',
  'Adverse',
  'Inconclusive'
];

export const F_EMISSIONS_DEFAULTS: FEmissionsData = {
  additionalEmissions: [],
  emissionCalculations: {
    totalCO2: 0,
    totalN2O: 0,
    totalPFC: 0,
    totalBiomassCO2: 0,
    totalFossilCO2: 0,
    totalGHG: 0,
    co2Equivalent: 0,
    calculationChecks: []
  },
  verificationData: {
    verificationBody: '',
    verificationDate: '',
    verificationScope: '',
    verificationLevel: 'Limited',
    verificationResult: 'Inconclusive',
    verificationReport: '',
    accreditedBody: false
  },
  validationStatus: {
    isValid: false,
    errors: [],
    warnings: [],
    completenessScore: 0
  },
  metadata: {
    reportingPeriod: '',
    calculationVersion: '1.0',
    calculationDate: new Date().toISOString(),
    calculatedBy: '',
    reviewedBy: '',
    dataSource: 'Manual Entry',
    calculationApproach: 'CBAM Methodology',
    crossSheetValidation: true
  }
};

export const EXCEL_ROW_MAPPINGS = {
  additionalEmissions: {
    startRow: 10,
    columns: {
      emissionType: 'B',
      emissionSource: 'C',
      co2Emissions: 'D',
      n2OEmissions: 'E',
      pfcEmissions: 'F',
      biomassCO2: 'G',
      calculationMethod: 'H',
      activityDataValue: 'I',
      activityDataUnit: 'J',
      emissionFactorValue: 'K',
      emissionFactorUnit: 'L',
      uncertainty: 'M',
      dataQuality: 'N',
      verificationStatus: 'O',
      comments: 'P'
    }
  },
  calculations: {
    totalCO2: 'D5',
    totalN2O: 'E5',
    totalPFC: 'F5',
    totalBiomassCO2: 'G5',
    totalFossilCO2: 'H5',
    totalGHG: 'I5',
    co2Equivalent: 'J5'
  },
  verification: {
    verificationBody: 'B3',
    verificationDate: 'C3',
    verificationScope: 'D3',
    verificationLevel: 'E3',
    verificationResult: 'F3'
  }
};

export const VALIDATION_RULES = {
  emissionSource: {
    required: true,
    maxLength: 200,
    pattern: /^[\w\s\-,.()]+$/
  },
  co2Emissions: {
    min: 0,
    max: 1000000,
    precision: 3
  },
  n2OEmissions: {
    min: 0,
    max: 10000,
    precision: 6
  },
  pfcEmissions: {
    min: 0,
    max: 1000,
    precision: 9
  },
  biomassCO2: {
    min: 0,
    max: 1000000,
    precision: 3
  },
  uncertainty: {
    min: 0,
    max: 100,
    precision: 1
  }
};

export const CALCULATION_CONSTANTS = {
  n2oGWP: 298, // Global Warming Potential for N2O
  pfcGWP: 6630, // Average GWP for PFCs (can be adjusted per specific PFC)
  biomassCO2Factor: 1.0, // Biomass CO2 is considered carbon neutral
  defaultUncertainty: 5.0, // Default uncertainty percentage
  maxUncertainty: 50.0, // Maximum acceptable uncertainty
  minDataQualityScore: 60 // Minimum acceptable data quality score
};

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CalculationResult {
  data: FEmissionsData;
  calculatedFields: string[];
  validationErrors: string[];
  validationWarnings: string[];
}

export {};
