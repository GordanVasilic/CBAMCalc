/**
 * A_InstData Sheet Types - Complete Excel Template Compatibility
 * 
 * This file contains comprehensive TypeScript interfaces for the A_InstData worksheet
 * from the CBAM Excel template, ensuring 100% compatibility with all fields and functionality.
 */

/**
 * Reporting period information
 */
export interface ReportingPeriod {
  startDate: string;
  endDate: string;
  isFullCalendarYear: boolean;
  reportingYear: number;
  reportingQuarter?: number;
  notes?: string;
}

/**
 * Installation address and location details
 */
export interface InstallationAddress {
  streetAndNumber: string;
  postalCode: string;
  city: string;
  country: string;
  poBox?: string;
  unlocode?: string;
  latitude?: number;
  longitude?: number;
  coordinatesSource?: string;
  locationAccuracy?: 'exact' | 'approximate' | 'estimated';
}

/**
 * Installation identification and classification
 */
export interface InstallationIdentification {
  installationName: string;
  installationEnglishName?: string;
  installationId?: string;
  installationType: string;
  mainActivity: string;
  economicActivity: string; // NACE code and description
  cnCode: string; // Combined Nomenclature code
  cnCodeDescription?: string;
  productionCapacity: number;
  capacityUnit: string;
  annualProduction: number;
  productionUnit: string;
  productionDescription?: string;
  isNewInstallation: boolean;
  commissioningDate?: string;
  isMajorModification: boolean;
  modificationDate?: string;
  modificationDescription?: string;
}

/**
 * Authorized representative contact information
 */
export interface AuthorizedRepresentative {
  name: string;
  email: string;
  telephone: string;
  fax?: string;
  position?: string;
  department?: string;
  isPrimaryContact: boolean;
  alternativeContact?: {
    name: string;
    email: string;
    telephone: string;
  };
}

/**
 * Verifier information and accreditation details
 */
export interface VerifierInformation {
  companyName?: string;
  streetAndNumber?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  authorizedRepresentative?: string;
  email?: string;
  telephone?: string;
  fax?: string;
  accreditationMemberState?: string;
  accreditationBodyName?: string;
  accreditationRegistrationNumber?: string;
  accreditationValidFrom?: string;
  accreditationValidTo?: string;
  accreditationScope: string[];
  isAccredited: boolean;
  verificationStatus: 'planned' | 'in_progress' | 'completed' | 'not_required';
  verificationDate?: string;
  verificationReportReference?: string;
}

/**
 * Aggregated goods category with production routes
 */
export interface AggregatedGoodsCategory {
  id: string; // G1, G2, G3, etc.
  category: string;
  categoryCode?: string;
  description?: string;
  productionRoutes: ProductionRoute[];
  isDirectProduction: boolean;
  relevantPrecursors: string[];
  pfcEmissionsRelevant: boolean;
  notes?: string;
}

/**
 * Production route details
 */
export interface ProductionRoute {
  routeNumber: number; // 1, 2, 3, 4, 5, 6
  routeName: string;
  routeDescription?: string;
  isPrimaryRoute: boolean;
  technologyType?: string;
  rawMaterials: string[];
  intermediates: string[];
  finalProducts: string[];
  energySources: string[];
  emissionSources: string[];
  efficiency?: number;
  yield?: number;
  notes?: string;
}

/**
 * Production process with bubble approach support
 */
export interface ProductionProcess {
  id: string; // P1, P2, P3, etc.
  name: string;
  description?: string;
  aggregatedGoodsCategory: string; // Reference to G1, G2, etc.
  includedGoodsCategories: string[]; // Multiple G-codes for bubble approach
  isBubbleApproach: boolean;
  bubbleApproachJustification?: string;
  productionRoute?: string;
  systemBoundary: {
    includesDirectEmissions: boolean;
    includesMeasurableHeat: boolean;
    includesWasteGases: boolean;
    includesIndirectEmissions: boolean;
    includesPrecursors: boolean;
  };
  goodsAndPrecursors: {
    goods: string[];
    precursors: string[];
  };
  validationStatus: {
    isComplete: boolean;
    errorMessages: string[];
    warnings: string[];
  };
  notes?: string;
}

/**
 * Purchased precursor details
 */
export interface PurchasedPrecursor {
  id: string;
  name: string;
  cnCode?: string;
  productionRoute?: string;
  productionCountry?: string;
  supplierName?: string;
  totalAmountConsumed: number;
  unit: string;
  specificDirectEmbeddedEmissions: number;
  directEmissionsUnit: string;
  directEmissionsDataSource: string;
  electricityConsumption: number;
  electricityUnit: string;
  electricityEmissionFactor: number;
  electricityEmissionFactorUnit: string;
  electricityEmissionFactorSource: string;
  specificIndirectEmbeddedEmissions?: number;
  totalSpecificEmbeddedEmissions?: number;
  usesDefaultValues: boolean;
  defaultJustification?: string;
  notes?: string;
}

/**
 * Installation operational details
 */
export interface InstallationOperations {
  operatingHours: number;
  operatingDays: number;
  operatingShifts?: number;
  isSeasonalOperation: boolean;
  seasonalOperationPeriods?: {
    start: string;
    end: string;
    description: string;
  }[];
  isBatchOperation: boolean;
  batchSizes?: {
    product: string;
    batchSize: number;
    unit: string;
    frequency: number;
  }[];
  shutdownPeriods?: {
    start: string;
    end: string;
    reason: string;
    planned: boolean;
  }[];
  startupDate?: string;
  plannedDecommissioningDate?: string;
  isTemporaryClosure: boolean;
  temporaryClosureStartDate?: string;
  temporaryClosureEndDate?: string;
  temporaryClosureReason?: string;
  isPermanentClosure: boolean;
  permanentClosureDate?: string;
  permanentClosureReason?: string;
}

/**
 * Environmental permits and compliance
 */
export interface EnvironmentalCompliance {
  permits: EnvironmentalPermit[];
  complianceStatus: 'compliant' | 'non_compliant' | 'under_review';
  complianceIssues?: string[];
  environmentalManagementSystem?: {
    hasISO14001: boolean;
    certificationDate?: string;
    certificationBody?: string;
    lastAuditDate?: string;
  };
  emissionsMonitoring: {
    hasContinuousMonitoring: boolean;
    monitoringTechnologies: string[];
    calibrationFrequency: string;
    lastCalibrationDate?: string;
  };
}

/**
 * Environmental permit details
 */
export interface EnvironmentalPermit {
  permitId: string;
  permitType: string;
  issuingAuthority: string;
  issueDate: string;
  validFrom: string;
  validTo: string;
  conditions: string[];
  emissionLimits: {
    pollutant: string;
    limit: number;
    unit: string;
    monitoringFrequency: string;
  }[];
  isValid: boolean;
}

/**
 * Energy and utilities information
 */
export interface EnergyUtilities {
  electricitySupplier?: string;
  electricityContractType?: 'fixed' | 'variable' | 'indexed';
  gridConnectionCapacity?: number;
  gridConnectionUnit?: string;
  steamSupplier?: string;
  steamContractType?: string;
  compressedAirSystem?: string;
  coolingSystem?: string;
  waterSupply?: string;
  wastewaterTreatment?: string;
}

/**
 * Complete A_InstData structure matching Excel template
 */
export interface AInstData {
  // Section 1: Reporting Period
  reportingPeriod: ReportingPeriod;
  
  // Section 2: About the Installation
  installationIdentification: InstallationIdentification;
  installationAddress: InstallationAddress;
  authorizedRepresentative: AuthorizedRepresentative;
  installationOperations: InstallationOperations;
  
  // Section 3: Verifier Information
  verifierInformation?: VerifierInformation;
  
  // Section 4: Aggregated Goods Categories and Production Processes
  aggregatedGoodsCategories: AggregatedGoodsCategory[];
  productionProcesses: ProductionProcess[];
  
  // Section 5: Purchased Precursors
  purchasedPrecursors: PurchasedPrecursor[];
  
  // Additional Sections
  environmentalCompliance?: EnvironmentalCompliance;
  energyUtilities?: EnergyUtilities;
  
  // Validation and metadata
  validationStatus: {
    isComplete: boolean;
    missingFields: string[];
    errors: string[];
    warnings: string[];
    completenessPercentage: number;
  };
  
  // Excel-specific fields
  excelRowMapping: {
    [key: string]: any; // Maps to specific Excel rows for export/import
  };
  
  lastModified: string;
  modifiedBy: string;
  version: string;
}

/**
 * Default values for A_InstData
 */
export const DEFAULT_AINST_DATA: AInstData = {
  reportingPeriod: {
    startDate: '',
    endDate: '',
    isFullCalendarYear: false,
    reportingYear: 0,
    notes: ''
  },
  installationIdentification: {
    installationName: '',
    installationEnglishName: '',
    installationType: '',
    mainActivity: '',
    economicActivity: '',
    cnCode: '',
    cnCodeDescription: '',
    productionCapacity: 0,
    capacityUnit: '',
    annualProduction: 0,
    productionUnit: '',
    productionDescription: '',
    isNewInstallation: false,
    isMajorModification: false
  },
  installationAddress: {
    streetAndNumber: '',
    postalCode: '',
    city: '',
    country: '',
    locationAccuracy: 'exact'
  },
  authorizedRepresentative: {
    name: '',
    email: '',
    telephone: '',
    isPrimaryContact: true
  },
  installationOperations: {
    operatingHours: 0,
    operatingDays: 0,
    isSeasonalOperation: false,
    isBatchOperation: false,
    isTemporaryClosure: false,
    isPermanentClosure: false
  },
  aggregatedGoodsCategories: [],
  productionProcesses: [],
  purchasedPrecursors: [],
  validationStatus: {
    isComplete: false,
    missingFields: [],
    errors: [],
    warnings: [],
    completenessPercentage: 0
  },
  excelRowMapping: {},
  lastModified: new Date().toISOString(),
  modifiedBy: 'system',
  version: '1.0'
};

/**
 * Validation rules for A_InstData fields
 */
export const AINST_VALIDATION_RULES = {
  reportingPeriod: {
    required: ['startDate', 'endDate'],
    dateValidation: {
      startBeforeEnd: true,
      maxDuration: '1 year',
      minDuration: '1 month'
    }
  },
  installationIdentification: {
    required: ['installationName', 'installationType', 'mainActivity', 'economicActivity', 'cnCode'],
    numericValidation: {
      productionCapacity: { min: 0, max: 1000000000 },
      annualProduction: { min: 0, max: 1000000000 }
    }
  },
  installationAddress: {
    required: ['streetAndNumber', 'postalCode', 'city', 'country'],
    coordinateValidation: {
      latitude: { min: -90, max: 90 },
      longitude: { min: -180, max: 180 }
    }
  },
  authorizedRepresentative: {
    required: ['name', 'email', 'telephone'],
    emailValidation: true
  },
  verifierInformation: {
    required: ['companyName', 'authorizedRepresentative', 'email'],
    conditionalRequired: {
      condition: 'verificationStatus === "completed"',
      fields: ['accreditationMemberState', 'accreditationBodyName', 'accreditationRegistrationNumber']
    }
  }
};

/**
 * Excel column mappings for A_InstData export/import
 */
export const AINST_EXCEL_MAPPINGS = {
  reportingPeriod: {
    startDate: 'B10',
    endDate: 'F10'
  },
  installationName: 'B20',
  installationEnglishName: 'B21',
  streetAndNumber: 'B22',
  economicActivity: 'B23',
  postalCode: 'B24',
  poBox: 'B25',
  city: 'B26',
  country: 'B27',
  unlocode: 'B28',
  latitude: 'B29',
  longitude: 'B30',
  authorizedRepresentativeName: 'B31',
  authorizedRepresentativeEmail: 'B32',
  authorizedRepresentativeTelephone: 'B33',
  verifierCompanyName: 'B38',
  verifierStreetAndNumber: 'B39',
  verifierCity: 'B40',
  verifierPostalCode: 'B41',
  verifierCountry: 'B42',
  verifierAuthorizedRepresentative: 'B46',
  verifierEmail: 'B47',
  verifierTelephone: 'B48',
  verifierFax: 'B49',
  accreditationMemberState: 'B52',
  accreditationBodyName: 'B53',
  accreditationRegistrationNumber: 'B54'
};