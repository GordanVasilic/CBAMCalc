export interface CompanyInfo {
  companyName: string;
  companyAddress: string;
  companyContactPerson: string;
  companyEmail: string;
  companyPhone: string;
  companyVAT?: string;
  companyRegistrationNumber?: string;
  companyWebsite?: string;
  companyCountry?: string;
  companyPostalCode?: string;
  companyCity?: string;
}

export interface ReportConfig {
  reportingPeriod: string;
  installationId: string;
  installationName: string;
  installationCountry: string;
  installationAddress: string;
  reportType?: string;
  submissionDate?: string;
  cbamPeriod?: string;
  declarationPeriod?: string;
  declarationType?: string;
  currency?: string;
}

export interface InstallationDetails {
  installationType: string;
  mainActivity: string;
  cnCode: string;
  productionCapacity: number;
  annualProduction: number;
  capacityUnit?: string;
  productionUnit?: string;
  latitude?: number;
  longitude?: number;
  startDate?: string;
  endDate?: string;
  isPermanentClosure?: boolean;
  isTemporaryClosure?: boolean;
  temporaryClosureStartDate?: string;
  temporaryClosureEndDate?: string;
  previousYearEmissions?: number;
  previousYearProduction?: number;
  verificationDate?: string;
  verifierName?: string;
  verifierAccreditationNumber?: string;
  // A_InstData: About the installation
  installationName?: string;
  installationEnglishName?: string;
  streetAndNumber?: string;
  postalCode?: string;
  poBox?: string;
  city?: string;
  country?: string;
  unlocode?: string;
  authorizedRepresentativeName?: string;
  authorizedRepresentativeEmail?: string;
  authorizedRepresentativeTelephone?: string;
  economicActivity?: string;
  // A_InstData: Verifier of the report
  verifierCompanyName?: string;
  verifierStreetAndNumber?: string;
  verifierCity?: string;
  verifierPostalCode?: string;
  verifierCountry?: string;
  verifierAuthorizedRepresentative?: string;
  verifierEmail?: string;
  verifierTelephone?: string;
  verifierFax?: string;
  accreditationMemberState?: string;
  accreditationBodyName?: string;
  accreditationRegistrationNumber?: string;
  // A_InstData: Aggregated goods categories and production processes
  aggregatedGoods?: { category: string; routes: string[] }[];
  productionProcesses?: { name: string; includedGoodsCategories: string[] }[];
}

export interface EmissionInstallationData {
  installationId: string;
  installationName: string;
  installationCountry: string;
  emissionSourceId: string;
  emissionSourceName: string;
  emissionSourceType: string;
  fuelType: string;
  fuelCode?: string;
  activityLevel: number;
  activityUnit: string;
  emissionFactor: number;
  emissionFactorUnit: string;
  co2Emissions: number;
  co2EmissionsUnit: string;
  ch4Emissions?: number;
  ch4EmissionsUnit?: string;
  n2oEmissions?: number;
  n2oEmissionsUnit?: string;
  totalGhgEmissions?: number;
  totalGhgEmissionsUnit?: string;
  biomassFraction?: number;
  carbonCaptureRate?: number;
  carbonCaptureUnit?: string;
  carbonStorageRate?: number;
  carbonStorageUnit?: string;
  // Advanced calculation inputs (optional)
  calorificValue?: number; // NCV (e.g., GJ/unit of activity)
  carbonContent?: number; // Carbon content per energy (e.g., tC/GJ)
  oxidationFactor?: number; // Oxidation factor (default 1)
  conversionFactor?: number; // Conversion factor from C to CO2 (default 3.667)
  monitoringMethod: string;
  dataQuality: string;
  uncertainty?: number;
  notes?: string;
}

export interface EmissionInstallationDataList {
  emissions: EmissionInstallationData[];
  totalDirectCO2Emissions: number;
  totalIndirectCO2Emissions: number;
  totalCO2Emissions: number;
  totalCH4Emissions: number;
  totalN2OEmissions: number;
  totalGHGEmissions: number;
  reportingPeriod: string;
  verificationDate?: string;
  verifierName?: string;
  verifierAccreditationNumber?: string;
}

export interface EnergyFuelData {
  id: string;
  fuelType: string;
  fuelSource: string;
  consumption: number;
  unit: string;
  // Nova kategorija namjene goriva radi Fuel balance sažetka
  useCategory?: string;
  co2EmissionFactor?: number;
  biomassShare?: number;
  renewableShare?: number;
  // Additional fields for Excel compatibility
  ch4EmissionFactor?: number;
  n2oEmissionFactor?: number;
  otherGwpEmissionFactor?: number;
  biogenicCO2EmissionFactor?: number;
  calorificValue?: number;
  carbonContent?: number;
  moistureContent?: number;
  ashContent?: number;
  sulfurContent?: number;
  supplierName?: string;
  originCountry?: string;
  transportDistance?: number;
  transportMode?: string;
  transportEmissions?: number;
  isBiogenic?: boolean;
  isRenewable?: boolean;
  isImported?: boolean;
  importDate?: string;
  customsProcedure?: string;
  countryOfOrigin?: string;
  countryOfConsignment?: string;
  price?: number;
  currency?: string;
  notes?: string;
}

export interface ProcessProductionData {
  id: string;
  processType: string;
  processName: string;
  productionAmount: number;
  unit: string;
  inputs: ProcessInput[];
  outputs: ProcessOutput[];
  directEmissions: number;
  processEmissions: number;
  // D_Processes polja
  totalProductionWithinInstallation?: number;
  producedForMarket?: number;
  isProductionOnlyForMarket?: boolean;
  nonCBAMAmount?: number;
  nonCBAMUnit?: string;
  applicableElements?: {
    directEmissions?: boolean;
    measurableHeat?: boolean;
    wasteGases?: boolean;
    indirectEmissions?: boolean;
  };
  measurableHeatData?: {
    quantity?: number;
    imported?: number;
    exported?: number;
    emissionFactor?: number;
    emissionFactorUnit?: string;
    unit?: string;
    shareToCBAMGoods?: number;
  };
  wasteGasesData?: {
    quantity?: number;
    imported?: number;
    exported?: number;
    emissionFactor?: number;
    emissionFactorUnit?: string;
    unit?: string;
    reusedShare?: number;
  };
  electricityConsumption?: number;
  electricityUnit?: string;
  electricityEmissionFactor?: number;
  electricityEmissionFactorUnit?: string;
  electricityEmissionFactorSource?: string;
  // NOVO: Električna energija izvezena
  electricityExportedAmount?: number;
  electricityExportedUnit?: string;
  electricityExportedEmissionFactor?: number;
  electricityExportedEmissionFactorUnit?: string;
  // NOVO: Interna potrošnja u drugim procesima
  consumedInOtherProcesses?: ConsumedInOtherProcess[];
  // NOVO: Spremanje udjela za tržište
  marketSharePercent?: number;
  indirectEmissions?: number;
  // Optional fields used in UI for compatibility
  productionQuantity?: number;
  processEmissionFactor?: number;
  co2EmissionFactor?: number;
  ch4EmissionFactor?: number;
  n2oEmissionFactor?: number;
  otherGwpEmissionFactor?: number;
  emissions?: number;
  // Additional fields for Excel compatibility
  ch4Emissions?: number;
  n2oEmissions?: number;
  otherGwpEmissions?: number;
  co2EmissionsFromBiomass?: number;
  co2EmissionsFromNonBiomass?: number;
  energyConsumption?: number;
  energyUnit?: string;
  energySource?: string;
  processEfficiency?: number;
  operatingHours?: number;
  operatingDays?: number;
  technologyType?: string;
  startDate?: string;
  endDate?: string;
  verificationStatus?: string;
  verificationDate?: string;
  verifierName?: string;
  comments?: string;
  notes?: string;
}

export interface ProcessInput {
  materialName: string;
  amount: number;
  unit: string;
  cnCode?: string;
  originCountry?: string;
  embeddedEmissions?: number;
  // Optional fields used in UI for compatibility
  id?: string;
  quantity?: number;
  origin?: string;
  // Additional fields for Excel compatibility
  materialType?: string;
  recycledContent?: number;
  biogenicContent?: number;
  carbonContent?: number;
  moistureContent?: number;
  ashContent?: number;
  calorificValue?: number;
  supplierName?: string;
  transportDistance?: number;
  transportMode?: string;
  transportEmissions?: number;
  isImported?: boolean;
  importDate?: string;
  customsProcedure?: string;
  countryOfOrigin?: string;
}

// Data structures for purchased precursors (E_PurchPrec worksheet)
export interface PurchasedPrecursor {
  id: string;
  name: string;
  cnCode?: string;
  productionRoute?: string;
  totalAmountConsumed: number;
  totalAmountUnit: string;
  
  // Consumption by production process
  processConsumption: ProcessConsumption[];
  
  // Amount not used for CBAM goods
  nonCBAMAmount: number;
  nonCBAMUnit: string;
  
  // Emissions data
  specificDirectEmbeddedEmissions: number;
  directEmissionsUnit: string;
  directEmissionsDataSource: string;
  
  // Electricity consumption
  electricityConsumption: number;
  electricityUnit: string;
  
  // Emission factor for electricity
  electricityEmissionFactor: number;
  electricityEmissionFactorUnit: string;
  electricityEmissionFactorSource: string;
  
  // Calculated indirect emissions
  specificIndirectEmbeddedEmissions?: number;
  
  // Total embedded emissions
  totalSpecificEmbeddedEmissions?: number;
  
  // Default value justification
  usesDefaultValues: boolean;
  defaultJustification?: string;
  
  // Additional fields
  supplierName?: string;
  originCountry?: string;
  notes?: string;
}

export interface ProcessConsumption {
  processId: string;
  processName: string;
  amount: number;
  unit: string;
}

// NOVO: referenca na potrošnju u drugim procesima (PrecToGood__)
export interface ConsumedInOtherProcess {
  targetProcessId: string;
  quantity: number;
  unit: string;
}

export interface PurchasedPrecursorsData {
  precursors: PurchasedPrecursor[];
  totalDirectEmbeddedEmissions: number;
  totalIndirectEmbeddedEmissions: number;
  totalEmbeddedEmissions: number;
  reportingPeriod: string;
  verificationDate?: string;
  verifierName?: string;
  verifierAccreditationNumber?: string;
}

export interface ProcessOutput {
  productName: string;
  amount: number;
  unit: string;
  cnCode?: string;
  // Optional fields used in UI for compatibility
  id?: string;
  quantity?: number;
  destination?: string;
  // Additional fields for Excel compatibility
  productType?: string;
  quality?: string;
  grade?: string;
  certification?: string;
  isExported?: boolean;
  exportDate?: string;
  destinationCountry?: string;
  transportDistance?: number;
  transportMode?: string;
  transportEmissions?: number;
  customsProcedure?: string;
}

export interface CalculationResults {
  totalDirectCO2Emissions: number;
  totalProcessEmissions: number;
  totalEmissions: number;
  specificEmissions: number;
  totalEnergy: number;
  renewableShare: number;
  importedRawMaterialShare: number;
  embeddedEmissions: number;
  purchasedPrecursorsEmbeddedEmissions: number;
  cumulativeEmissions: number;
  directEmissionsByGasType: EmissionsByGasType;
  biogenicCO2Emissions: number;
  processEmissionsByGasType: EmissionsByGasType;
  importedRawMaterialShareByCountry: { total: number; byCountry: { [country: string]: { amount: number; share: number } } };
  importedRawMaterialShareByMaterial: { total: number; byMaterial: { [materialName: string]: { imported: number; total: number; share: number } } };
  embeddedEmissionsByGasType: EmissionsByGasType;
  importedMaterialEmbeddedEmissions: { total: number; byMaterial: { [materialName: string]: number } };
  transportEmissions: number;
  // Additional fields for Excel compatibility
  totalBiogenicCO2Emissions?: number;
  totalNonBiogenicCO2Emissions?: number;
  totalCH4Emissions?: number;
  totalN2OEmissions?: number;
  totalOtherGHGEmissions?: number;
  co2EmissionsFromBiomass?: number;
  co2EmissionsFromNonBiomass?: number;
  co2EmissionsFromElectricity?: number;
  co2EmissionsFromHeat?: number;
  co2EmissionsFromSteam?: number;
  co2EmissionsFromOther?: number;
  totalCO2EquivInGWP1?: number;
  totalCO2EquivInGWP100?: number;
  verificationStatus?: string;
  verificationDate?: string;
  verifierName?: string;
  comments?: string;
}

/**
 * Emissions by gas type
 */
export interface EmissionsByGasType {
  co2: number;
  ch4: number;
  n2o: number;
  otherGwp: number;
  total: number;
}

/**
 * CBAM emissions calculation result
 */
export interface CBAMEmissionsResult {
  directEmissions: number;
  directEmissionsByGasType: EmissionsByGasType;
  biogenicCO2Emissions: number;
  processEmissions: number;
  processEmissionsByGasType: EmissionsByGasType;
  totalEmissions: number;
  embeddedEmissions: number;
  embeddedEmissionsByGasType: EmissionsByGasType;
  importedMaterialEmbeddedEmissions: number;
  transportEmissions: number;
  cumulativeEmissions: number;
  importedRawMaterialShare: number;
  importedRawMaterialShareByCountry: Record<string, number>;
  importedRawMaterialShareByMaterial: Record<string, number>;
  cbamReportableEmissions: number;
}

/**
 * Comprehensive CBAM emissions calculation result
 */
export interface ComprehensiveCBAMEmissionsResult extends CBAMEmissionsResult {
  totalEmissionsByGasType: EmissionsByGasType;
  cbamReportableEmissionsByGasType: EmissionsByGasType;
  netCO2Emissions: number;
  netCO2EmissionsReportable: number;
  totalProduction: number;
  emissionIntensity: number;
  cbamReportableEmissionIntensity: number;
}

import { BEmInstData } from './BEmInstTypes';
import { AInstData } from './AInstDataTypes';
import { DProcessesData } from './DProcessesTypes';
import { CInstEmissionsData } from './CInstEmissionsTypes';
import { EPurchasedData } from './EPurchasedTypes';
import { FEmissionsData } from './FEmissionsTypes';

export interface CBAMData {
  companyInfo: CompanyInfo;
  reportConfig: ReportConfig;
  installationDetails: InstallationDetails;
  emissionInstallationData: EmissionInstallationDataList;
  bEmInstData?: BEmInstData; // B_EmInst sheet data
  aInstData?: AInstData; // A_InstData sheet data - complete Excel compatibility
  dProcessesData?: DProcessesData; // D_Processes sheet data - production processes with input/output matrices
  cInstEmissions?: CInstEmissionsData; // C_InstEmissions sheet data - emissions and energy balance
  ePurchased?: EPurchasedData; // E_Purchased sheet data - purchased precursors and emissions
  fEmissions?: FEmissionsData; // F_Emissions sheet data - additional emissions and calculations
  emissionFactors: EmissionFactor[];
  energyFuelData: EnergyFuelData[];
  processProductionData: ProcessProductionData[];
  purchasedPrecursors: PurchasedPrecursorsData;
  calculationResults: CalculationResults;
  validationResults?: ValidationResult[];
  exportData?: ExportData;
  archiveData?: ArchiveData;
  settings?: SettingsData;
  notes?: NotesData;
}

export interface CalculationConstants {
  // Legacy/GWP constants (optional)
  tCO2?: number;
  GWP_CO2?: number;
  GWP_CH4?: number;
  GWP_N2O?: number;
  GWP_SF6?: number;
  GWP_NF3?: number;
  
  // Conversion factors
  tCO2_to_kgCO2: number;
  kgCO2_to_tCO2: number;
  MWh_to_GJ: number;
  GJ_to_MWh: number;
  
  // Default emission factors
  defaultElectricityEmissionFactor: number;
  defaultHeatEmissionFactor: number;
  
  // Biomass and thresholds
  biomassCO2Factor: number;
  renewableThreshold: number;
  
  // Additional constants from Excel template
  CBAMPeriod: string;
  GWP_HFCs: number;
  GWP_PFCs: number;
  reportingYear: number;
  reportingQuarter: number;
  dataQualityThreshold: number;
  GWP_HFC23: number;
  GWP_HFC32: number;
  GWP_HFC4310mee: number;
  GWP_c4f8: number;
  GWP_c2f6: number;
  GWP_c6f14: number;
  transportDistanceDefault: number;
  transportEmissionFactor: number;
  roadTransportEmissionFactor: number;
  railTransportEmissionFactor: number;
  seaTransportEmissionFactor: number;
  airTransportEmissionFactor: number;
  defaultTransportEmissionFactor: number;
  uncertaintyThreshold: number;
  
  // Other defaults
  defaultProcessEmissionFactor: number;
  defaultEmbeddedEmissionFactor: number;
}

export interface EmissionFactor {
  id: string;
  name: string;
  category: string;
  gasType: string;
  value: number;
  unit: string;
  source: string;
  sourceDescription: string;
  year: number;
  applicableTo: string;
  notes: string;
  isBiogenic?: boolean;
}

export interface ProcessEmissionFactor {
  processType: string;
  cnCode: string;
  emissionFactor: number;
  unit: string;
  source: string;
  lastUpdated: string;
  // Additional fields for Excel compatibility
  ch4EmissionFactor?: number;
  n2oEmissionFactor?: number;
  otherGwpEmissionFactor?: number;
  gwp1?: number;
  gwp100?: number;
  uncertainty?: number;
  methodology?: string;
  applicableConditions?: string;
  technologyType?: string;
  region?: string;
  validFrom?: string;
  validTo?: string;
}

// New interfaces for Excel template compatibility
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DataValidationStatus {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  hasMissingData: boolean;
  hasInconsistentData: boolean;
}

export interface ExportData {
  format: 'excel' | 'pdf' | 'csv' | 'xml';
  template: string;
  version: string;
  exportDate: string;
  exportedBy: string;
  data: any;
  settings?: any;
}

export interface ArchiveData {
  archiveId: string;
  archiveDate: string;
  archivedBy: string;
  version: string;
  description: string;
  data: any;
  isArchived: boolean;
  restoreDate?: string;
  restoredBy?: string;
}

export interface SettingsData {
  units: {
    energy: string;
    emissions: string;
    production: string;
  };
  language: string;
  currency: string;
  decimalPlaces: number;
  dateFormat: string;
  autoSave: boolean;
  autoSaveInterval: number;
  validationLevel: 'basic' | 'standard' | 'strict';
  exportOptions: {
    includeCalculations: boolean;
    includeValidation: boolean;
    includeNotes: boolean;
    includeArchiveInfo: boolean;
  };
  defaultEmissionFactors: {
    useDefaults: boolean;
    source: string;
    year: number;
  };
}

export interface NotesData {
  generalNotes?: string;
  methodologyNotes?: string;
  dataQualityNotes?: string;
  assumptionsNotes?: string;
  limitationsNotes?: string;
  lastModified: string;
  modifiedBy: string;
}