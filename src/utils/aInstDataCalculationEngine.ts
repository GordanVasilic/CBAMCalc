/**
 * A_InstData Calculation Engine
 * 
 * This module implements all Excel formulas and calculations from the A_InstData worksheet
 * including validation rules, completeness checks, and data consistency validations.
 */

import { 
  AInstData, 
  ReportingPeriod, 
  InstallationIdentification, 
  InstallationAddress,
  AuthorizedRepresentative,
  VerifierInformation,
  AggregatedGoodsCategory,
  ProductionProcess,
  PurchasedPrecursor
} from '../types/AInstDataTypes';

/**
 * Validation result for individual fields
 */
export interface ValidationResult {
  field: string;
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

/**
 * Completeness check result
 */
export interface CompletenessResult {
  section: string;
  totalFields: number;
  completedFields: number;
  percentage: number;
  missingFields: string[];
  errors: ValidationResult[];
  warnings: ValidationResult[];
}

/**
 * Overall validation status
 */
export interface ValidationStatus {
  isValid: boolean;
  completeness: number;
  sections: CompletenessResult[];
  errors: ValidationResult[];
  warnings: ValidationResult[];
  recommendations: string[];
}

/**
 * Calculate reporting period duration and validate dates
 */
export function validateReportingPeriod(period: ReportingPeriod): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (!period.startDate || !period.endDate) {
    results.push({
      field: 'reportingPeriod',
      isValid: false,
      message: 'Početni i završni datum su obavezni',
      severity: 'error'
    });
    return results;
  }
  
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);
  
  // Validate date format and logic
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    results.push({
      field: 'reportingPeriod.dates',
      isValid: false,
      message: 'Nevažeći format datuma',
      severity: 'error'
    });
    return results;
  }
  
  // Check if start date is before end date
  if (startDate >= endDate) {
    results.push({
      field: 'reportingPeriod.endDate',
      isValid: false,
      message: 'Završni datum mora biti nakon početnog datuma',
      severity: 'error'
    });
  }
  
  // Calculate duration
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
  const durationMonths = Math.ceil(durationDays / 30);
  const durationYears = durationDays / 365.25;
  
  // Validate duration constraints
  if (durationMonths < 1) {
    results.push({
      field: 'reportingPeriod.duration',
      isValid: false,
      message: 'Izvještajni period mora biti najmanje 1 mjesec',
      severity: 'error'
    });
  }
  
  if (durationYears > 1.5) {
    results.push({
      field: 'reportingPeriod.duration',
      isValid: false,
      message: 'Izvještajni period ne smije biti duži od 1.5 godine',
      severity: 'error'
    });
  }
  
  // Check if it's a full calendar year
  const isFullCalendarYear = 
    startDate.getMonth() === 0 && startDate.getDate() === 1 &&
    endDate.getMonth() === 11 && endDate.getDate() === 31 &&
    startDate.getFullYear() === endDate.getFullYear();
  
  if (period.isFullCalendarYear && !isFullCalendarYear) {
    results.push({
      field: 'reportingPeriod.isFullCalendarYear',
      isValid: false,
      message: 'Odabrani datumi ne predstavljaju punu kalendarsku godinu',
      severity: 'warning',
      suggestion: 'Izmijenite datume da pokrivaju cijelu kalendarsku godinu (1.1.-31.12.)'
    });
  }
  
  // Validate reporting year consistency
  if (period.reportingYear && period.reportingYear !== startDate.getFullYear()) {
    results.push({
      field: 'reportingPeriod.reportingYear',
      isValid: false,
      message: 'Godina izvještavanja se ne podudara s početnim datumom',
      severity: 'warning'
    });
  }
  
  return results;
}

/**
 * Validate installation identification fields
 */
export function validateInstallationIdentification(identification: InstallationIdentification): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Required fields validation
  const requiredFields = ['installationName', 'installationType', 'mainActivity', 'economicActivity', 'cnCode'];
  
  requiredFields.forEach(field => {
    if (!identification[field as keyof InstallationIdentification]) {
      results.push({
        field: `installationIdentification.${field}`,
        isValid: false,
        message: `Polje ${field} je obavezno`,
        severity: 'error'
      });
    }
  });
  
  // CN Code validation
  if (identification.cnCode) {
    const cnCodePattern = /^\d{8}$/; // 8-digit CN code
    if (!cnCodePattern.test(identification.cnCode)) {
      results.push({
        field: 'installationIdentification.cnCode',
        isValid: false,
        message: 'CN kod mora imati točno 8 znamenki',
        severity: 'error'
      });
    }
  }
  
  // Production capacity and annual production validation
  if (identification.productionCapacity < 0) {
    results.push({
      field: 'installationIdentification.productionCapacity',
      isValid: false,
      message: 'Kapacitet proizvodnje ne smije biti negativan',
      severity: 'error'
    });
  }
  
  if (identification.annualProduction < 0) {
    results.push({
      field: 'installationIdentification.annualProduction',
      isValid: false,
      message: 'Godišnja proizvodnja ne smije biti negativna',
      severity: 'error'
    });
  }
  
  // Capacity vs production validation
  if (identification.productionCapacity > 0 && identification.annualProduction > identification.productionCapacity) {
    results.push({
      field: 'installationIdentification.annualProduction',
      isValid: false,
      message: 'Godišnja proizvodnja ne smije premašivati kapacitet',
      severity: 'error'
    });
  }
  
  // New installation validation
  if (identification.isNewInstallation && !identification.commissioningDate) {
    results.push({
      field: 'installationIdentification.commissioningDate',
      isValid: false,
      message: 'Datum puštanja u pogon je obavezan za nove instalacije',
      severity: 'error'
    });
  }
  
  // Major modification validation
  if (identification.isMajorModification && !identification.modificationDate) {
    results.push({
      field: 'installationIdentification.modificationDate',
      isValid: false,
      message: 'Datum značajne izmjene je obavezan',
      severity: 'error'
    });
  }
  
  return results;
}

/**
 * Validate installation address
 */
export function validateInstallationAddress(address: InstallationAddress): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Required fields validation
  const requiredFields = ['streetAndNumber', 'postalCode', 'city', 'country'];
  
  requiredFields.forEach(field => {
    if (!address[field as keyof InstallationAddress]) {
      results.push({
        field: `installationAddress.${field}`,
        isValid: false,
        message: `Polje ${field} je obavezno`,
        severity: 'error'
      });
    }
  });
  
  // Coordinate validation
  if (address.latitude !== undefined) {
    if (address.latitude < -90 || address.latitude > 90) {
      results.push({
        field: 'installationAddress.latitude',
        isValid: false,
        message: 'Latituda mora biti između -90 i 90 stupnjeva',
        severity: 'error'
      });
    }
  }
  
  if (address.longitude !== undefined) {
    if (address.longitude < -180 || address.longitude > 180) {
      results.push({
        field: 'installationAddress.longitude',
        isValid: false,
        message: 'Longituda mora biti između -180 i 180 stupnjeva',
        severity: 'error'
      });
    }
  }
  
  // Coordinate consistency
  if ((address.latitude !== undefined && address.longitude === undefined) ||
      (address.latitude === undefined && address.longitude !== undefined)) {
    results.push({
      field: 'installationAddress.coordinates',
      isValid: false,
      message: 'Oba koordinata (latituda i longituda) moraju biti unesena',
      severity: 'warning'
    });
  }
  
  return results;
}

/**
 * Validate authorized representative information
 */
export function validateAuthorizedRepresentative(representative: AuthorizedRepresentative): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Required fields validation
  if (!representative.name) {
    results.push({
      field: 'authorizedRepresentative.name',
      isValid: false,
      message: 'Ime ovlaštene osobe je obavezno',
      severity: 'error'
    });
  }
  
  if (!representative.email) {
    results.push({
      field: 'authorizedRepresentative.email',
      isValid: false,
      message: 'Email ovlaštene osobe je obavezan',
      severity: 'error'
    });
  } else {
    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(representative.email)) {
      results.push({
        field: 'authorizedRepresentative.email',
        isValid: false,
        message: 'Nevažeći format email adrese',
        severity: 'error'
      });
    }
  }
  
  if (!representative.telephone) {
    results.push({
      field: 'authorizedRepresentative.telephone',
      isValid: false,
      message: 'Telefon ovlaštene osobe je obavezan',
      severity: 'error'
    });
  }
  
  return results;
}

/**
 * Validate verifier information
 */
export function validateVerifierInformation(verifier?: VerifierInformation): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (!verifier) {
    return results; // Verifier is optional during transitional period
  }
  
  // Basic required fields
  if (!verifier.companyName) {
    results.push({
      field: 'verifierInformation.companyName',
      isValid: false,
      message: 'Naziv kompanije verifikatora je obavezan',
      severity: 'error'
    });
  }
  
  if (!verifier.authorizedRepresentative) {
    results.push({
      field: 'verifierInformation.authorizedRepresentative',
      isValid: false,
      message: 'Ime ovlaštenog predstavnika verifikatora je obavezno',
      severity: 'error'
    });
  }
  
  if (!verifier.email) {
    results.push({
      field: 'verifierInformation.email',
      isValid: false,
      message: 'Email verifikatora je obavezan',
      severity: 'error'
    });
  } else {
    // Email format validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(verifier.email)) {
      results.push({
        field: 'verifierInformation.email',
        isValid: false,
        message: 'Nevažeći format email adrese verifikatora',
        severity: 'error'
      });
    }
  }
  
  // Conditional validation for completed verification
  if (verifier.verificationStatus === 'completed') {
    if (!verifier.accreditationMemberState) {
      results.push({
        field: 'verifierInformation.accreditationMemberState',
        isValid: false,
        message: 'Država akreditacije je obavezna za završenu verifikaciju',
        severity: 'error'
      });
    }
    
    if (!verifier.accreditationBodyName) {
      results.push({
        field: 'verifierInformation.accreditationBodyName',
        isValid: false,
        message: 'Naziv akreditacijskog tijela je obavezan za završenu verifikaciju',
        severity: 'error'
      });
    }
    
    if (!verifier.accreditationRegistrationNumber) {
      results.push({
        field: 'verifierInformation.accreditationRegistrationNumber',
        isValid: false,
        message: 'Registracijski broj akreditacije je obavezan za završenu verifikaciju',
        severity: 'error'
      });
    }
  }
  
  return results;
}

/**
 * Validate aggregated goods categories
 */
export function validateAggregatedGoodsCategories(categories: AggregatedGoodsCategory[]): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (!categories || categories.length === 0) {
    results.push({
      field: 'aggregatedGoodsCategories',
      isValid: false,
      message: 'Mora biti definirana najmanje jedna agregirana kategorija dobara',
      severity: 'error'
    });
    return results;
  }
  
  // Validate each category
  categories.forEach((category, index) => {
    if (!category.id || !category.category) {
      results.push({
        field: `aggregatedGoodsCategories[${index}]`,
        isValid: false,
        message: `Kategorija ${index + 1}: ID i naziv kategorije su obavezni`,
        severity: 'error'
      });
    }
    
    // Validate production routes
    if (!category.productionRoutes || category.productionRoutes.length === 0) {
      results.push({
        field: `aggregatedGoodsCategories[${index}].productionRoutes`,
        isValid: false,
        message: `Kategorija ${category.id || index + 1}: Mora biti definirana najmanje jedna proizvodna ruta`,
        severity: 'error'
      });
    } else {
      category.productionRoutes.forEach((route, routeIndex) => {
        if (!route.routeName) {
          results.push({
            field: `aggregatedGoodsCategories[${index}].productionRoutes[${routeIndex}]`,
            isValid: false,
            message: `Kategorija ${category.id}: Ruta ${routeIndex + 1} mora imati naziv`,
            severity: 'error'
          });
        }
      });
    }
  });
  
  return results;
}

/**
 * Validate production processes
 */
export function validateProductionProcesses(processes: ProductionProcess[]): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  if (!processes || processes.length === 0) {
    results.push({
      field: 'productionProcesses',
      isValid: false,
      message: 'Mora biti definiran najmanje jedan proizvodni proces',
      severity: 'error'
    });
    return results;
  }
  
  // Validate each process
  processes.forEach((process, index) => {
    if (!process.id || !process.name) {
      results.push({
        field: `productionProcesses[${index}]`,
        isValid: false,
        message: `Proces ${index + 1}: ID i naziv procesa su obavezni`,
        severity: 'error'
      });
    }
    
    if (!process.aggregatedGoodsCategory) {
      results.push({
        field: `productionProcesses[${index}].aggregatedGoodsCategory`,
        isValid: false,
        message: `Proces ${process.id || index + 1}: Mora biti povezan s agregiranom kategorijom dobara`,
        severity: 'error'
      });
    }
    
    // Bubble approach validation
    if (process.isBubbleApproach && !process.bubbleApproachJustification) {
      results.push({
        field: `productionProcesses[${index}].bubbleApproachJustification`,
        isValid: false,
        message: `Proces ${process.id}: Bubble pristup zahtijeva obrazloženje`,
        severity: 'error'
      });
    }
  });
  
  return results;
}

/**
 * Validate purchased precursors
 */
export function validatePurchasedPrecursors(precursors: PurchasedPrecursor[]): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Precursors are optional, but validate if present
  if (!precursors || precursors.length === 0) {
    return results;
  }
  
  precursors.forEach((precursor, index) => {
    if (!precursor.name || precursor.totalAmountConsumed < 0) {
      results.push({
        field: `purchasedPrecursors[${index}]`,
        isValid: false,
        message: `Prekursor ${index + 1}: Naziv i količina su obavezni`,
        severity: 'error'
      });
    }
    
    if (precursor.usesDefaultValues && !precursor.defaultJustification) {
      results.push({
        field: `purchasedPrecursors[${index}].defaultJustification`,
        isValid: false,
        message: `Prekursor ${precursor.name}: Korištenje zadanih vrijednosti zahtijeva obrazloženje`,
        severity: 'error'
      });
    }
  });
  
  return results;
}

/**
 * Calculate completeness percentage for each section
 */
export function calculateSectionCompleteness(data: AInstData): CompletenessResult[] {
  const sections: CompletenessResult[] = [];
  
  // Reporting Period Section
  const reportingPeriodFields = ['startDate', 'endDate'];
  const reportingPeriodCompleted = reportingPeriodFields.filter(field => 
    data.reportingPeriod[field as keyof ReportingPeriod]
  ).length;
  
  sections.push({
    section: 'Reporting Period',
    totalFields: reportingPeriodFields.length,
    completedFields: reportingPeriodCompleted,
    percentage: (reportingPeriodCompleted / reportingPeriodFields.length) * 100,
    missingFields: reportingPeriodFields.filter(field => 
      !data.reportingPeriod[field as keyof ReportingPeriod]
    ),
    errors: [],
    warnings: []
  });
  
  // Installation Identification Section
  const identificationFields = ['installationName', 'installationType', 'mainActivity', 'economicActivity', 'cnCode'];
  const identificationCompleted = identificationFields.filter(field => 
    data.installationIdentification[field as keyof InstallationIdentification]
  ).length;
  
  sections.push({
    section: 'Installation Identification',
    totalFields: identificationFields.length,
    completedFields: identificationCompleted,
    percentage: (identificationCompleted / identificationFields.length) * 100,
    missingFields: identificationFields.filter(field => 
      !data.installationIdentification[field as keyof InstallationIdentification]
    ),
    errors: [],
    warnings: []
  });
  
  // Installation Address Section
  const addressFields = ['streetAndNumber', 'postalCode', 'city', 'country'];
  const addressCompleted = addressFields.filter(field => 
    data.installationAddress[field as keyof InstallationAddress]
  ).length;
  
  sections.push({
    section: 'Installation Address',
    totalFields: addressFields.length,
    completedFields: addressCompleted,
    percentage: (addressCompleted / addressFields.length) * 100,
    missingFields: addressFields.filter(field => 
      !data.installationAddress[field as keyof InstallationAddress]
    ),
    errors: [],
    warnings: []
  });
  
  // Authorized Representative Section
  const representativeFields = ['name', 'email', 'telephone'];
  const representativeCompleted = representativeFields.filter(field => 
    data.authorizedRepresentative[field as keyof AuthorizedRepresentative]
  ).length;
  
  sections.push({
    section: 'Authorized Representative',
    totalFields: representativeFields.length,
    completedFields: representativeCompleted,
    percentage: (representativeCompleted / representativeFields.length) * 100,
    missingFields: representativeFields.filter(field => 
      !data.authorizedRepresentative[field as keyof AuthorizedRepresentative]
    ),
    errors: [],
    warnings: []
  });
  
  // Aggregated Goods Categories Section
  const hasCategories = data.aggregatedGoodsCategories.length > 0;
  sections.push({
    section: 'Aggregated Goods Categories',
    totalFields: 1,
    completedFields: hasCategories ? 1 : 0,
    percentage: hasCategories ? 100 : 0,
    missingFields: hasCategories ? [] : ['categories'],
    errors: [],
    warnings: []
  });
  
  // Production Processes Section
  const hasProcesses = data.productionProcesses.length > 0;
  sections.push({
    section: 'Production Processes',
    totalFields: 1,
    completedFields: hasProcesses ? 1 : 0,
    percentage: hasProcesses ? 100 : 0,
    missingFields: hasProcesses ? [] : ['processes'],
    errors: [],
    warnings: []
  });
  
  return sections;
}

/**
 * Perform complete validation of A_InstData
 */
export function validateAInstData(data: AInstData): ValidationStatus {
  const allErrors: ValidationResult[] = [];
  const allWarnings: ValidationResult[] = [];
  
  // Validate all sections
  allErrors.push(...validateReportingPeriod(data.reportingPeriod));
  allErrors.push(...validateInstallationIdentification(data.installationIdentification));
  allErrors.push(...validateInstallationAddress(data.installationAddress));
  allErrors.push(...validateAuthorizedRepresentative(data.authorizedRepresentative));
  allErrors.push(...validateVerifierInformation(data.verifierInformation));
  allErrors.push(...validateAggregatedGoodsCategories(data.aggregatedGoodsCategories));
  allErrors.push(...validateProductionProcesses(data.productionProcesses));
  allErrors.push(...validatePurchasedPrecursors(data.purchasedPrecursors));
  
  // Calculate completeness
  const sections = calculateSectionCompleteness(data);
  const overallCompleteness = sections.reduce((sum, section) => sum + section.percentage, 0) / sections.length;
  
  // Update sections with errors and warnings
  sections.forEach(section => {
    section.errors = allErrors.filter(error => error.field.startsWith(section.section.toLowerCase().replace(/\s+/g, '')));
    section.warnings = allWarnings.filter(warning => warning.field.startsWith(section.section.toLowerCase().replace(/\s+/g, '')));
  });
  
  // Generate recommendations
  const recommendations: string[] = [];
  
  if (overallCompleteness < 100) {
    recommendations.push('Dovršite sva obavezna polja za postizanje 100% kompletnosti');
  }
  
  if (data.aggregatedGoodsCategories.length === 0) {
    recommendations.push('Dodajte najmanje jednu agregiranu kategoriju dobara');
  }
  
  if (data.productionProcesses.length === 0) {
    recommendations.push('Definirajte najmanje jedan proizvodni proces');
  }
  
  if (!data.verifierInformation) {
    recommendations.push('Razmislite o dodavanju informacija o verifikatoru (nije obvezno u prijelaznom periodu)');
  }
  
  return {
    isValid: allErrors.length === 0,
    completeness: overallCompleteness,
    sections,
    errors: allErrors,
    warnings: allWarnings,
    recommendations
  };
}

/**
 * Generate Excel-compatible row mapping
 */
export function generateExcelRowMapping(data: AInstData): { [key: string]: any } {
  const mapping: { [key: string]: any } = {};
  
  // Reporting Period (Row 10)
  mapping['B10'] = data.reportingPeriod.startDate;
  mapping['F10'] = data.reportingPeriod.endDate;
  
  // Installation Details (Rows 20-33)
  mapping['B20'] = data.installationIdentification.installationName;
  mapping['B21'] = data.installationIdentification.installationEnglishName;
  mapping['B22'] = data.installationAddress.streetAndNumber;
  mapping['B23'] = data.installationIdentification.economicActivity;
  mapping['B24'] = data.installationAddress.postalCode;
  mapping['B25'] = data.installationAddress.poBox;
  mapping['B26'] = data.installationAddress.city;
  mapping['B27'] = data.installationAddress.country;
  mapping['B28'] = data.installationAddress.unlocode;
  mapping['B29'] = data.installationAddress.latitude;
  mapping['B30'] = data.installationAddress.longitude;
  mapping['B31'] = data.authorizedRepresentative.name;
  mapping['B32'] = data.authorizedRepresentative.email;
  mapping['B33'] = data.authorizedRepresentative.telephone;
  
  // Verifier Information (Rows 38-54)
  if (data.verifierInformation) {
    mapping['B38'] = data.verifierInformation.companyName;
    mapping['B39'] = data.verifierInformation.streetAndNumber;
    mapping['B40'] = data.verifierInformation.city;
    mapping['B41'] = data.verifierInformation.postalCode;
    mapping['B42'] = data.verifierInformation.country;
    mapping['B46'] = data.verifierInformation.authorizedRepresentative;
    mapping['B47'] = data.verifierInformation.email;
    mapping['B48'] = data.verifierInformation.telephone;
    mapping['B49'] = data.verifierInformation.fax;
    mapping['B52'] = data.verifierInformation.accreditationMemberState;
    mapping['B53'] = data.verifierInformation.accreditationBodyName;
    mapping['B54'] = data.verifierInformation.accreditationRegistrationNumber;
  }
  
  return mapping;
}

/**
 * Calculate derived fields and update data
 */
export function calculateDerivedFields(data: AInstData): AInstData {
  const updatedData = { ...data };
  
  // Calculate reporting year from dates
  if (data.reportingPeriod.startDate) {
    const startDate = new Date(data.reportingPeriod.startDate);
    updatedData.reportingPeriod.reportingYear = startDate.getFullYear();
    
    // Determine if it's a full calendar year
    const endDate = new Date(data.reportingPeriod.endDate);
    updatedData.reportingPeriod.isFullCalendarYear = 
      startDate.getMonth() === 0 && startDate.getDate() === 1 &&
      endDate.getMonth() === 11 && endDate.getDate() === 31 &&
      startDate.getFullYear() === endDate.getFullYear();
  }
  
  // Update validation status
  const validationStatus = validateAInstData(updatedData);
  updatedData.validationStatus = {
    isComplete: validationStatus.isValid,
    missingFields: validationStatus.errors.map(e => e.field),
    errors: validationStatus.errors.map(e => e.message),
    warnings: validationStatus.warnings.map(w => w.message),
    completenessPercentage: validationStatus.completeness
  };
  
  // Update Excel row mapping
  updatedData.excelRowMapping = generateExcelRowMapping(updatedData);
  
  return updatedData;
}