/**
 * D_Processes Types - Production Processes with Input/Output Matrices
 * Based on CBAM Excel template D_Processes and InputOutput sheets
 */

// Production process structure matching Excel template
export interface ProductionProcess {
  id: string;
  processNumber: number;
  name: string;
  productionRoute: string;
  unit: string;
  amounts: number;
  
  // Production details
  producedForMarket: number;
  shareProducedForMarket: number;
  totalProductionOnlyForMarket: boolean;
  
  // Consumption within installation (precursors to goods)
  consumedInOtherProcesses: ProcessConsumption[];
  
  // Consumed for non-CBAM goods
  consumedForNonCBAMGoods: number;
  
  // Control calculations
  controlTotal: number;
  
  // Attributed emissions calculations
  directlyAttributableEmissions: DirectEmissions;
  measurableHeat: MeasurableHeatData;
  wasteGases: WasteGasData;
  indirectEmissions: IndirectEmissionsData;
  electricityExported: ElectricityExportData;
  
  // Input/Output matrix data
  inputOutputMatrix: InputOutputMatrix;
  
  // Validation and calculation results
  validationStatus: ProcessValidationStatus;
  calculatedEmissions: ProcessEmissionResults;
  
  // Excel compatibility
  excelRowMapping: { [key: string]: any };
}

export interface ProcessConsumption {
  id: string;
  processNumber: number;
  amount: number;
  unit: string;
  precursorType: 'internal' | 'external';
  sourceProcessId?: string; // For internal precursors
  sourceInstallationId?: string; // For external precursors
}

export interface DirectEmissions {
  applicable: boolean;
  amount: number;
  unit: 'tCO2e';
  calculationMethod: string;
  dataSource: string;
  measurementMethod?: string;
  measurementFrequency?: string;
}

export interface MeasurableHeatData {
  applicable: boolean;
  netAmount: number;
  unit: 'TJ';
  emissionFactor: number;
  emissionFactorUnit: 'tCO2/TJ';
  imported: number;
  exported: number;
  shareToCBAMGoods?: number;
}

export interface WasteGasData {
  applicable: boolean;
  amount: number;
  unit: 'TJ';
  emissionFactor: number;
  emissionFactorUnit: 'tCO2/TJ';
  imported: number;
  exported: number;
  reusedShare?: number;
}

export interface IndirectEmissionsData {
  applicable: boolean;
  electricityConsumption: number;
  electricityUnit: 'MWh' | 'kWh' | 'GJ';
  emissionFactor: number;
  emissionFactorUnit: 'tCO2/MWh' | 'tCO2/kWh' | 'tCO2/GJ';
  emissionFactorSource: string;
  emissionFactorMethod: string;
}

export interface ElectricityExportData {
  applicable: boolean;
  exportedAmount: number;
  unit: 'MWh' | 'kWh' | 'GJ';
  emissionFactor: number;
  emissionFactorUnit: 'tCO2/MWh' | 'tCO2/kWh' | 'tCO2/GJ';
}

// Input/Output Matrix Structure
export interface InputOutputMatrix {
  // Process-to-process matrix (10x10 max)
  processToProcess: ProcessMatrixCell[][];
  
  // Process-to-product matrix
  processToProduct: ProductMatrixCell[][];
  
  // Precursor consumption matrix
  precursorConsumption: PrecursorMatrixCell[][];
  
  // Summary calculations
  totalInputs: number[];
  totalOutputs: number[];
  netProduction: number[];
  
  // Matrix metadata
  matrixSize: number;
  goodsProduced: Good[];
  precursors: Precursor[];
}

export interface ProcessMatrixCell {
  fromProcess: number;
  toProcess: number;
  amount: number;
  unit: string;
  share: number; // Percentage share
  calculationMethod: string;
}

export interface ProductMatrixCell {
  processNumber: number;
  productNumber: number;
  amount: number;
  unit: string;
  shareOfTotal: number;
  cbamRelevant: boolean;
}

export interface PrecursorMatrixCell {
  processNumber: number;
  precursorNumber: number;
  amount: number;
  unit: string;
  sourceType: 'internal' | 'external';
  sourceProcess?: number;
  sourceInstallation?: string;
}

export interface Good {
  id: string;
  number: number;
  name: string;
  unit: string;
  cbamRelevant: boolean;
  cnCode?: string;
}

export interface Precursor {
  id: string;
  number: number;
  name: string;
  unit: string;
  cbamRelevant: boolean;
  sourceType: 'internal' | 'external';
}

export interface ProcessValidationStatus {
  isComplete: boolean;
  missingFields: string[];
  errors: string[];
  warnings: string[];
  completenessPercentage: number;
  
  // Section-specific validation
  productionDataComplete: boolean;
  emissionsDataComplete: boolean;
  inputOutputMatrixComplete: boolean;
  calculationsValid: boolean;
}

export interface ProcessEmissionResults {
  // Direct emissions
  directEmissionsTotal: number;
  directEmissionsPerUnit: number;
  
  // Indirect emissions
  indirectEmissionsTotal: number;
  indirectEmissionsPerUnit: number;
  
  // Heat-related emissions
  heatEmissionsTotal: number;
  heatEmissionsPerUnit: number;
  
  // Waste gas emissions
  wasteGasEmissionsTotal: number;
  wasteGasEmissionsPerUnit: number;
  
  // Electricity export credits
  electricityExportCredit: number;
  
  // Net attributed emissions
  netAttributedEmissions: number;
  netAttributedEmissionsPerUnit: number;
  
  // Specific embedded emissions (SEE)
  specificEmbeddedEmissions: number;
  
  // Uncertainty calculations
  uncertaintyPercentage: number;
  confidenceInterval: number[];
}

// D_Processes worksheet structure
export interface DProcessesData {
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
    reportingEntity: string;
  };
  
  productionProcesses: ProductionProcess[];
  
  // Summary data across all processes
  processSummary: {
    totalProcesses: number;
    totalProduction: number;
    totalAttributedEmissions: number;
    averageSEE: number;
    processesWithCompleteData: number;
    processesWithValidCalculations: number;
  };
  
  // Input/Output matrix summary
  inputOutputSummary: {
    totalInternalFlows: number;
    totalExternalInputs: number;
    totalProductOutputs: number;
    totalPrecursorInputs: number;
    matrixCompleteness: number;
  };
  
  // Validation status
  validationStatus: {
    isComplete: boolean;
    missingFields: string[];
    errors: string[];
    warnings: string[];
    completenessPercentage: number;
  };
  
  // Excel compatibility
  excelRowMapping: { [key: string]: any };
}

// Constants and enums
export const PRODUCTION_PROCESS_LIMITS = {
  MAX_PROCESSES: 10,
  MAX_PRODUCTS_PER_PROCESS: 20,
  MAX_PRECursors_PER_PROCESS: 15,
  MAX_INTERNAL_FLOWS: 50,
} as const;

export const EMISSION_FACTOR_SOURCES = [
  'EU ETS',
  'National inventory',
  'Plant-specific',
  'Default values',
  'Other (please specify)'
] as const;

export const EMISSION_FACTOR_METHODS = [
  'Direct measurement',
  'Calculation based on fuel consumption',
  'Mass balance',
  'Emission factors',
  'Other (please specify)'
] as const;

export const CALCULATION_METHODS = [
  'Standard method',
  'Mass balance',
  'Heat balance',
  'Other (please specify)'
] as const;

// Default values
export const DEFAULT_PRODUCTION_PROCESS: ProductionProcess = {
  id: '',
  processNumber: 1,
  name: '',
  productionRoute: '',
  unit: '',
  amounts: 0,
  producedForMarket: 0,
  shareProducedForMarket: 0,
  totalProductionOnlyForMarket: false,
  consumedInOtherProcesses: [],
  consumedForNonCBAMGoods: 0,
  controlTotal: 0,
  directlyAttributableEmissions: {
    applicable: false,
    amount: 0,
    unit: 'tCO2e',
    calculationMethod: '',
    dataSource: '',
    measurementMethod: '',
    measurementFrequency: ''
  },
  measurableHeat: {
    applicable: false,
    netAmount: 0,
    unit: 'TJ',
    emissionFactor: 0,
    emissionFactorUnit: 'tCO2/TJ',
    imported: 0,
    exported: 0
  },
  wasteGases: {
    applicable: false,
    amount: 0,
    unit: 'TJ',
    emissionFactor: 0,
    emissionFactorUnit: 'tCO2/TJ',
    imported: 0,
    exported: 0
  },
  indirectEmissions: {
    applicable: false,
    electricityConsumption: 0,
    electricityUnit: 'MWh',
    emissionFactor: 0,
    emissionFactorUnit: 'tCO2/MWh',
    emissionFactorSource: '',
    emissionFactorMethod: ''
  },
  electricityExported: {
    applicable: false,
    exportedAmount: 0,
    unit: 'MWh',
    emissionFactor: 0,
    emissionFactorUnit: 'tCO2/MWh'
  },
  inputOutputMatrix: {
    processToProcess: [],
    processToProduct: [],
    precursorConsumption: [],
    totalInputs: [],
    totalOutputs: [],
    netProduction: [],
    matrixSize: 0,
    goodsProduced: [],
    precursors: []
  },
  validationStatus: {
    isComplete: false,
    missingFields: [],
    errors: [],
    warnings: [],
    completenessPercentage: 0,
    productionDataComplete: false,
    emissionsDataComplete: false,
    inputOutputMatrixComplete: false,
    calculationsValid: false
  },
  calculatedEmissions: {
    directEmissionsTotal: 0,
    directEmissionsPerUnit: 0,
    indirectEmissionsTotal: 0,
    indirectEmissionsPerUnit: 0,
    heatEmissionsTotal: 0,
    heatEmissionsPerUnit: 0,
    wasteGasEmissionsTotal: 0,
    wasteGasEmissionsPerUnit: 0,
    electricityExportCredit: 0,
    netAttributedEmissions: 0,
    netAttributedEmissionsPerUnit: 0,
    specificEmbeddedEmissions: 0,
    uncertaintyPercentage: 0,
    confidenceInterval: [0, 0]
  },
  excelRowMapping: {}
};

export const DEFAULT_DPROCESSES_DATA: DProcessesData = {
  reportingPeriod: {
    startDate: new Date(),
    endDate: new Date(),
    reportingEntity: ''
  },
  productionProcesses: [],
  processSummary: {
    totalProcesses: 0,
    totalProduction: 0,
    totalAttributedEmissions: 0,
    averageSEE: 0,
    processesWithCompleteData: 0,
    processesWithValidCalculations: 0
  },
  inputOutputSummary: {
    totalInternalFlows: 0,
    totalExternalInputs: 0,
    totalProductOutputs: 0,
    totalPrecursorInputs: 0,
    matrixCompleteness: 0
  },
  validationStatus: {
    isComplete: false,
    missingFields: [],
    errors: [],
    warnings: [],
    completenessPercentage: 0
  },
  excelRowMapping: {}
};

// Validation rules matching Excel constraints
export const DPROCESSES_VALIDATION_RULES = {
  processNumber: {
    required: true,
    min: 1,
    max: PRODUCTION_PROCESS_LIMITS.MAX_PROCESSES
  },
  amounts: {
    required: true,
    min: 0,
    max: 1000000000
  },
  unit: {
    required: true,
    allowedValues: ['t', 'kg', 'm3', 'm2', 'm', 'pieces', 'l', 'other']
  },
  emissionFactor: {
    required: false,
    min: 0,
    max: 100
  },
  share: {
    required: false,
    min: 0,
    max: 100
  }
} as const;