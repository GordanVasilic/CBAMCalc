/**
 * E_Purchased Types - Carbon Border Adjustment Mechanism
 * Purchased Precursors Data and Emissions
 * Based on Excel template structure
 */

// Constants and enums
export const PRECURSOR_TYPES = [
  'Raw materials',
  'Intermediate products',
  'Chemicals',
  'Minerals',
  'Metals',
  'Other'
] as const;

export const DATA_SOURCES = [
  'Supplier data',
  'Default values',
  'Calculated',
  'Estimated',
  'Other'
] as const;

export const UNITS = [
  't',
  'kg',
  'm³',
  'l',
  'm²',
  'm',
  'pcs',
  'Other'
] as const;

export type PrecursorType = typeof PRECURSOR_TYPES[number];
export type DataSource = typeof DATA_SOURCES[number];
export type Unit = typeof UNITS[number];

// Individual purchased precursor item
export interface PurchasedPrecursorItem {
  id: string;
  name: string;
  cnCode?: string;
  precursorType: PrecursorType;
  
  // Quantity information
  totalQuantity: number;
  unit: Unit;
  
  // Supplier information
  supplierName: string;
  supplierCountry: string;
  supplierContact?: string;
  
  // Production route information
  productionRoute?: string;
  productionProcess?: string;
  
  // Consumption by production processes
  processConsumptions: ProcessConsumption[];
  
  // Non-CBAM usage
  nonCBAMQuantity: number;
  nonCBAMUnit: Unit;
  nonCBAMJustification?: string;
  
  // Embedded emissions data
  directEmbeddedEmissions: number;
  directEmissionsUnit: string;
  directEmissionsDataSource: DataSource;
  directEmissionsUncertainty?: number;
  
  // Indirect emissions (electricity)
  electricityConsumption: number;
  electricityUnit: string;
  electricityEmissionFactor: number;
  electricityEmissionFactorUnit: string;
  electricityEmissionFactorSource: DataSource;
  
  // Calculated indirect emissions
  indirectEmbeddedEmissions?: number;
  
  // Total embedded emissions
  totalSpecificEmbeddedEmissions?: number;
  totalEmbeddedEmissionsUnit: string;
  
  // Default values usage
  usesDefaultValues: boolean;
  defaultValueJustification?: string;
  
  // Data quality
  dataQuality: string;
  verificationStatus: string;
  verificationDate?: string;
  verifierName?: string;
  verifierAccreditation?: string;
  
  // Additional information
  notes?: string;
  comments?: string;
  lastUpdated: Date;
}

// Process consumption details
export interface ProcessConsumption {
  processId: string;
  processName: string;
  quantity: number;
  unit: Unit;
  consumptionType: 'input' | 'consumption' | 'other';
  allocationMethod?: string;
  allocationFactor?: number;
}

// Summary calculations for all precursors
export interface PrecursorsSummary {
  totalPrecursors: number;
  totalQuantity: number;
  totalDirectEmbeddedEmissions: number;
  totalIndirectEmbeddedEmissions: number;
  totalEmbeddedEmissions: number;
  averageDataQuality: number;
  verifiedPrecursors: number;
  defaultValuesUsed: number;
}

// Main E_Purchased data structure
export interface EPurchasedData {
  // Individual precursor items
  precursors: PurchasedPrecursorItem[];
  
  // Summary calculations
  summary: PrecursorsSummary;
  
  // Reporting period
  reportingPeriod: string;
  
  // Overall data quality
  overallDataQuality: string;
  overallVerificationStatus: string;
  
  // Validation status
  validationStatus: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    completenessScore: number; // 0-100%
  };
  
  // Metadata
  metadata: {
    createdDate: Date;
    lastModified: Date;
    modifiedBy: string;
    version: string;
    calculationMethod: 'detailed' | 'simplified' | 'other';
    dataSource: 'supplier' | 'default' | 'mixed';
  };
}

// Constants for default values
export const E_PURCHASED_DEFAULTS: EPurchasedData = {
  precursors: [],
  summary: {
    totalPrecursors: 0,
    totalQuantity: 0,
    totalDirectEmbeddedEmissions: 0,
    totalIndirectEmbeddedEmissions: 0,
    totalEmbeddedEmissions: 0,
    averageDataQuality: 0,
    verifiedPrecursors: 0,
    defaultValuesUsed: 0
  },
  reportingPeriod: '',
  overallDataQuality: 'Good',
  overallVerificationStatus: 'Not verified',
  validationStatus: {
    isValid: false,
    errors: [],
    warnings: [],
    completenessScore: 0
  },
  metadata: {
    createdDate: new Date(),
    lastModified: new Date(),
    modifiedBy: '',
    version: '1.0',
    calculationMethod: 'detailed',
    dataSource: 'supplier'
  }
};

// Validation rules
export const E_PURCHASED_VALIDATION_RULES = {
  name: { required: true, maxLength: 200 },
  cnCode: { required: false, pattern: /^[0-9]{8}$/ },
  totalQuantity: { required: true, min: 0, max: 1000000 },
  unit: { required: true },
  supplierName: { required: true, maxLength: 100 },
  supplierCountry: { required: true, maxLength: 50 },
  directEmbeddedEmissions: { required: true, min: 0, max: 1000000 },
  electricityConsumption: { required: false, min: 0, max: 1000000 },
  dataQuality: { required: true },
  verificationStatus: { required: true }
};

// Excel row mapping for export functionality
export const E_PURCHASED_EXCEL_MAPPING = {
  // Precursor data (rows 15-50, depending on number of precursors)
  precursorStartRow: 15,
  
  // Column mappings for each precursor
  columns: {
    name: { column: 'B' },
    cnCode: { column: 'C' },
    precursorType: { column: 'D' },
    totalQuantity: { column: 'E' },
    unit: { column: 'F' },
    supplierName: { column: 'G' },
    supplierCountry: { column: 'H' },
    directEmbeddedEmissions: { column: 'I' },
    directEmissionsUnit: { column: 'J' },
    electricityConsumption: { column: 'K' },
    electricityUnit: { column: 'L' },
    totalSpecificEmbeddedEmissions: { column: 'M' },
    totalEmbeddedEmissionsUnit: { column: 'N' },
    usesDefaultValues: { column: 'O' },
    dataQuality: { column: 'P' },
    verificationStatus: { column: 'Q' }
  },
  
  // Summary section (rows 52-58)
  summary: {
    totalPrecursors: { row: 52, column: 'E' },
    totalQuantity: { row: 53, column: 'E' },
    totalDirectEmbeddedEmissions: { row: 54, column: 'E' },
    totalIndirectEmbeddedEmissions: { row: 55, column: 'E' },
    totalEmbeddedEmissions: { row: 56, column: 'E' },
    averageDataQuality: { row: 57, column: 'E' },
    verifiedPrecursors: { row: 58, column: 'E' }
  }
};