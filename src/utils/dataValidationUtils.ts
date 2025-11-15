/**
 * Data validation utilities for CBAM calculations
 * Provides validation functions for CBAM data structures and export formats
 */

import { CBAMData, ValidationResult, CalculationResults, DataValidationStatus } from '../types/CBAMData';
import { DProcessesData } from '../types/DProcessesTypes';

/**
 * Validates CBAM data structure and content
 * @param data - CBAM data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateCBAMData(data: CBAMData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate company information
  if (!data.companyInfo) {
    errors.push('Company information is required');
  } else {
    if (!data.companyInfo.companyName) errors.push('Company name is required');
    if (!data.companyInfo.companyAddress) errors.push('Company address is required');
    if (!data.companyInfo.companyCountry) errors.push('Company country is required');
  }
  
  // Validate report configuration
  if (!data.reportConfig) {
    errors.push('Report configuration is required');
  } else {
    if (!data.reportConfig.reportingPeriod) errors.push('Reporting period is required');
    if (!data.reportConfig.reportType) warnings.push('Report type is recommended');
  }
  
  // Validate installation details
  if (!data.installationDetails) {
    errors.push('Installation details are required');
  } else {
    if (!data.installationDetails.mainActivity) errors.push('Main activity is required');
  }
  
  // Validate energy and fuel data
  if (data.energyFuelData && data.energyFuelData.length > 0) {
    data.energyFuelData.forEach((item, index) => {
      if (!item.fuelType) errors.push(`Fuel type is required for energy entry ${index + 1}`);
      if (item.consumption === undefined || item.consumption === null) 
        errors.push(`Consumption value is required for energy entry ${index + 1}`);
      if (item.consumption < 0) errors.push(`Consumption cannot be negative for energy entry ${index + 1}`);
    });
  }
  
  // Validate process production data
  if (data.processProductionData && data.processProductionData.length > 0) {
    data.processProductionData.forEach((process, index) => {
      if (!process.processName) errors.push(`Process name is required for process entry ${index + 1}`);
      if (process.inputs && process.inputs.length > 0) {
        process.inputs.forEach((input, inputIndex) => {
          if (!input.materialName) errors.push(`Material name is required for input ${inputIndex + 1} in process ${index + 1}`);
          if (input.amount === undefined || input.amount === null) 
            errors.push(`Amount is required for input ${inputIndex + 1} in process ${index + 1}`);
          if (input.amount < 0) errors.push(`Amount cannot be negative for input ${inputIndex + 1} in process ${index + 1}`);
        });
      }

      // D_Processes: Production totals and market
      const totalProd = process.totalProductionWithinInstallation ?? process.productionQuantity ?? process.productionAmount ?? 0;
      const marketProd = process.producedForMarket ?? 0;
      if (marketProd > totalProd) {
        errors.push(`Produced for market exceeds total production in process ${index + 1}`);
      }
      // NOVO: marketSharePercent raspon
      if (process.marketSharePercent !== undefined && (process.marketSharePercent < 0 || process.marketSharePercent > 100)) {
        errors.push(`Market share (%) must be 0..100 in process ${index + 1}`);
      }
      if (process.nonCBAMAmount !== undefined) {
        if (process.nonCBAMAmount < 0) errors.push(`Non-CBAM amount cannot be negative in process ${index + 1}`);
        if ((process.nonCBAMAmount ?? 0) > 0 && !process.nonCBAMUnit) errors.push(`Unit required for Non-CBAM amount in process ${index + 1}`);
      }
      if (process.isProductionOnlyForMarket && (process.nonCBAMAmount ?? 0) > 0) {
        warnings.push(`Process ${index + 1}: production only for market but Non-CBAM amount provided`);
      }

      // D_Processes: Applicable elements
      const elements = process.applicableElements || {};
      if (elements.indirectEmissions) {
        if (process.electricityConsumption === undefined || process.electricityConsumption === null) {
          errors.push(`Electricity consumption is required for process ${index + 1}`);
        } else if (process.electricityConsumption < 0) {
          errors.push(`Electricity consumption cannot be negative for process ${index + 1}`);
        }
        if (!process.electricityUnit) errors.push(`Electricity unit is required for process ${index + 1}`);
        if (process.electricityEmissionFactor === undefined || process.electricityEmissionFactor === null) {
          errors.push(`Electricity emission factor is required for process ${index + 1}`);
        } else if (process.electricityEmissionFactor < 0) {
          errors.push(`Electricity emission factor cannot be negative for process ${index + 1}`);
        }
        if (!process.electricityEmissionFactorUnit) errors.push(`Electricity EF unit is required for process ${index + 1}`);

        // NOVO: Električna energija izvezena (opcionalno)
        if (process.electricityExportedAmount !== undefined) {
          if (process.electricityExportedAmount < 0) {
            errors.push(`Electricity exported amount cannot be negative for process ${index + 1}`);
          }
          if (process.electricityExportedAmount > 0 && !process.electricityExportedUnit) {
            errors.push(`Electricity exported unit is required when amount > 0 for process ${index + 1}`);
          }
        }
        if (process.electricityExportedEmissionFactor !== undefined) {
          if (process.electricityExportedEmissionFactor < 0) {
            errors.push(`Electricity exported EF cannot be negative for process ${index + 1}`);
          }
          if (!process.electricityExportedEmissionFactorUnit) {
            errors.push(`Electricity exported EF unit is required when EF provided for process ${index + 1}`);
          }
        }
      }

      if (elements.measurableHeat) {
        const mh = process.measurableHeatData || {} as any;
        if (mh.quantity === undefined || mh.quantity === null) {
          errors.push(`Measurable heat quantity is required for process ${index + 1}`);
        } else if (mh.quantity < 0) {
          errors.push(`Measurable heat quantity cannot be negative for process ${index + 1}`);
        }
        if (!mh.unit) errors.push(`Measurable heat unit is required for process ${index + 1}`);
        if (mh.emissionFactor !== undefined && mh.emissionFactor < 0) {
          errors.push(`Measurable heat EF cannot be negative for process ${index + 1}`);
        }
        if (mh.shareToCBAMGoods !== undefined && (mh.shareToCBAMGoods < 0 || mh.shareToCBAMGoods > 100)) {
          errors.push(`Measurable heat share must be between 0 and 100 in process ${index + 1}`);
        }
        // NOVO: imported/exported ne smiju biti negativni
        if (mh.imported !== undefined && mh.imported < 0) {
          errors.push(`Measurable heat imported cannot be negative for process ${index + 1}`);
        }
        if (mh.exported !== undefined && mh.exported < 0) {
          errors.push(`Measurable heat exported cannot be negative for process ${index + 1}`);
        }
      }

      if (elements.wasteGases) {
        const wg = process.wasteGasesData || {} as any;
        if (wg.quantity === undefined || wg.quantity === null) {
          errors.push(`Waste gases quantity is required for process ${index + 1}`);
        } else if (wg.quantity < 0) {
          errors.push(`Waste gases quantity cannot be negative for process ${index + 1}`);
        }
        if (!wg.unit) errors.push(`Waste gases unit is required for process ${index + 1}`);
        if (wg.emissionFactor !== undefined && wg.emissionFactor < 0) {
          errors.push(`Waste gases EF cannot be negative for process ${index + 1}`);
        }
        if (wg.reusedShare !== undefined && (wg.reusedShare < 0 || wg.reusedShare > 100)) {
          errors.push(`Waste gases reused share must be between 0 and 100 in process ${index + 1}`);
        }
        // NOVO: imported/exported ne smiju biti negativni
        if (wg.imported !== undefined && wg.imported < 0) {
          errors.push(`Waste gases imported cannot be negative for process ${index + 1}`);
        }
        if (wg.exported !== undefined && wg.exported < 0) {
          errors.push(`Waste gases exported cannot be negative for process ${index + 1}`);
        }
      }

      // NOVO: Potrošeno u drugim procesima (PrecToGood__ reference)
      if (process.consumedInOtherProcesses && process.consumedInOtherProcesses.length > 0) {
        const allProcesses = data.processProductionData || [];
        process.consumedInOtherProcesses.forEach((entry, eIdx) => {
          if (!entry.targetProcessId) {
            errors.push(`Consumed in other processes entry ${eIdx + 1} is missing target process (process ${index + 1})`);
          } else if (!allProcesses.some(p => p.id === entry.targetProcessId)) {
            errors.push(`Consumed in other processes entry ${eIdx + 1} references unknown process ID in process ${index + 1}`);
          }
          if (entry.quantity === undefined || entry.quantity === null) {
            errors.push(`Consumed in other processes entry ${eIdx + 1} is missing quantity (process ${index + 1})`);
          } else if (entry.quantity < 0) {
            errors.push(`Consumed in other processes entry ${eIdx + 1} cannot have negative quantity (process ${index + 1})`);
          }
          if ((entry.quantity ?? 0) > 0 && !entry.unit) {
            errors.push(`Consumed in other processes entry ${eIdx + 1} requires unit when quantity > 0 (process ${index + 1})`);
          }
          if (entry.targetProcessId === process.id) {
            warnings.push(`Process ${index + 1} references itself in 'Consumed in other processes'`);
          }
        });
      }
    });
  }
  
  // Validate purchased precursors data
  if (data.purchasedPrecursors && data.purchasedPrecursors.precursors && data.purchasedPrecursors.precursors.length > 0) {
    data.purchasedPrecursors.precursors.forEach((precursor, index) => {
      if (!precursor.name) errors.push(`Precursor name is required for entry ${index + 1}`);
      if (precursor.totalAmountConsumed === undefined || precursor.totalAmountConsumed === null) 
        errors.push(`Consumption value is required for precursor ${index + 1}`);
      if (precursor.totalAmountConsumed < 0) errors.push(`Consumption cannot be negative for precursor ${index + 1}`);
      
      if (precursor.specificDirectEmbeddedEmissions !== undefined && precursor.specificDirectEmbeddedEmissions < 0) 
        errors.push(`Specific direct embedded emissions cannot be negative for precursor ${index + 1}`);
        
      if (precursor.electricityConsumption !== undefined && precursor.electricityConsumption < 0) 
        errors.push(`Electricity consumption cannot be negative for precursor ${index + 1}`);
        
      if (precursor.defaultJustification && !precursor.defaultJustification.trim()) 
        warnings.push(`Default value justification is empty for precursor ${index + 1}`);
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates CBAM data for Excel export
 * @param data - CBAM data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateForExcelExport(data: CBAMData): ValidationResult {
  const result = validateCBAMData(data);
  
  // Add Excel-specific validations
  if (!data.companyInfo.companyVAT) {
    result.warnings.push('VAT number is recommended for Excel export');
  }
  

  
  return result;
}

/**
 * Validates calculation results
 * @param results - Calculation results to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateCalculationResults(results: CalculationResults): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate basic calculation results
  if (results.totalDirectCO2Emissions < 0) errors.push('Total direct CO2 cannot be negative');
  if (results.totalProcessEmissions < 0) errors.push('Total process emissions cannot be negative');
  if (results.totalEmissions < 0) errors.push('Total emissions cannot be negative');
  
  // Validate energy metrics
  if (results.totalEnergy < 0) errors.push('Total energy cannot be negative');
  if (results.renewableShare < 0 || results.renewableShare > 100) 
    errors.push('Renewable share must be between 0 and 100');
  if (results.importedRawMaterialShare < 0 || results.importedRawMaterialShare > 100) 
    errors.push('Imported raw material share must be between 0 and 100');
  
  // Check for calculation consistency (allow additional components like installation/indirect)
  const calculatedTotal = results.totalDirectCO2Emissions + results.totalProcessEmissions;
  if (calculatedTotal - results.totalEmissions > 0.01) {
    warnings.push('Total emissions appear lower than direct + process; check inputs');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates data consistency across different sections
 * @param data - CBAM data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateDataConsistency(data: CBAMData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for consistency between reporting period and data dates
  
  // Check for consistency in units
  if (data.energyFuelData && data.energyFuelData.length > 0) {
    const units = new Set(data.energyFuelData.map(item => item.unit));
    if (units.size > 3) {
      warnings.push('Multiple different units used in energy data');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates that all required fields are present
 * @param data - CBAM data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateRequiredFields(data: CBAMData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields based on business rules
  if (!data.installationDetails) {
    errors.push('Installation details are required');
  }
  
  if (!data.companyInfo) {
    errors.push('Company information is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates that numeric values are within acceptable ranges
 * @param data - CBAM data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateNumericRanges(data: CBAMData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate numeric ranges
  if (data.energyFuelData) {
    data.energyFuelData.forEach((item, index) => {
      if (item.co2EmissionFactor && item.co2EmissionFactor < 0) {
        errors.push(`Emission factor cannot be negative for energy entry ${index + 1}`);
      }
    });
  }
  
  if (data.processProductionData) {
    data.processProductionData.forEach((process, pIndex) => {
      if (process.inputs) {
        process.inputs.forEach((input, iIndex) => {
          if (input.embeddedEmissions && input.embeddedEmissions < 0) {
            errors.push(`Emission factor cannot be negative for input ${iIndex + 1} in process ${pIndex + 1}`);
          }
        });
      }

      // D_Processes numeric ranges
      if (process.electricityConsumption !== undefined && process.electricityConsumption < 0) {
        errors.push(`Electricity consumption cannot be negative for process ${pIndex + 1}`);
      }
      if (process.electricityEmissionFactor !== undefined && process.electricityEmissionFactor < 0) {
        errors.push(`Electricity EF cannot be negative for process ${pIndex + 1}`);
      }
      if (process.measurableHeatData?.emissionFactor !== undefined && process.measurableHeatData.emissionFactor < 0) {
        errors.push(`Measurable heat EF cannot be negative for process ${pIndex + 1}`);
      }
      if (process.wasteGasesData?.emissionFactor !== undefined && process.wasteGasesData.emissionFactor < 0) {
        errors.push(`Waste gases EF cannot be negative for process ${pIndex + 1}`);
      }
      if (process.measurableHeatData?.shareToCBAMGoods !== undefined) {
        const v = process.measurableHeatData.shareToCBAMGoods;
        if (v! < 0 || v! > 100) errors.push(`Measurable heat share must be 0..100 for process ${pIndex + 1}`);
      }
      if (process.wasteGasesData?.reusedShare !== undefined) {
        const v = process.wasteGasesData.reusedShare;
        if (v! < 0 || v! > 100) errors.push(`Waste gases reused share must be 0..100 for process ${pIndex + 1}`);
      }
      // NOVO: imported/exported minimalne provjere
      if (process.measurableHeatData?.imported !== undefined && process.measurableHeatData.imported < 0) {
        errors.push(`Measurable heat imported cannot be negative for process ${pIndex + 1}`);
      }
      if (process.measurableHeatData?.exported !== undefined && process.measurableHeatData.exported < 0) {
        errors.push(`Measurable heat exported cannot be negative for process ${pIndex + 1}`);
      }
      if (process.wasteGasesData?.imported !== undefined && process.wasteGasesData.imported < 0) {
        errors.push(`Waste gases imported cannot be negative for process ${pIndex + 1}`);
      }
      if (process.wasteGasesData?.exported !== undefined && process.wasteGasesData.exported < 0) {
        errors.push(`Waste gases exported cannot be negative for process ${pIndex + 1}`);
      }
      // NOVO: Električna energija izvezena
      if (process.electricityExportedAmount !== undefined && process.electricityExportedAmount < 0) {
        errors.push(`Electricity exported amount cannot be negative for process ${pIndex + 1}`);
      }
      if (process.electricityExportedEmissionFactor !== undefined && process.electricityExportedEmissionFactor < 0) {
        errors.push(`Electricity exported EF cannot be negative for process ${pIndex + 1}`);
      }
      // NOVO: marketSharePercent raspon
      if (process.marketSharePercent !== undefined && (process.marketSharePercent < 0 || process.marketSharePercent > 100)) {
        errors.push(`Market share (%) must be 0..100 for process ${pIndex + 1}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validates that string values are in the correct format
 * @param data - CBAM data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateStringFormats(data: CBAMData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate string formats
  if (data.companyInfo && data.companyInfo.companyVAT) {
    // Add VAT number format validation if needed
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Combines multiple validation results into one
 * @param results - Array of validation results
 * @returns Combined ValidationResult
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  const allWarnings = results.flatMap(r => r.warnings);
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Validates data for Excel template compatibility
 * @param data - CBAM data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateExcelCompatibility(data: CBAMData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for Excel-specific requirements
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateDProcessesData(d: DProcessesData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const procs = d.productionProcesses || [];
  procs.forEach((p) => {
    if ((p.amounts || 0) < 0) errors.push(`Proces ${p.processNumber}: ukupna količina ne može biti negativna`);
    if ((p.producedForMarket || 0) < 0) errors.push(`Proces ${p.processNumber}: tržišna količina ne može biti negativna`);
    if ((p.producedForMarket || 0) > (p.amounts || 0)) errors.push(`Proces ${p.processNumber}: tržišna količina veća od ukupne`);
    if ((p.shareProducedForMarket || 0) < 0 || (p.shareProducedForMarket || 0) > 100) errors.push(`Proces ${p.processNumber}: udio za tržište mora biti 0..100`);

    if (p.measurableHeat?.imported !== undefined && (p.measurableHeat?.imported || 0) < 0) errors.push(`Proces ${p.processNumber}: uvezena toplina ne može biti negativna`);
    if (p.measurableHeat?.exported !== undefined && (p.measurableHeat?.exported || 0) < 0) errors.push(`Proces ${p.processNumber}: izvezena toplina ne može biti negativna`);
    if (p.measurableHeat?.emissionFactor !== undefined && (p.measurableHeat?.emissionFactor || 0) < 0) errors.push(`Proces ${p.processNumber}: EF topline ne može biti negativan`);
    if (p.measurableHeat?.shareToCBAMGoods !== undefined) {
      const v = p.measurableHeat?.shareToCBAMGoods || 0;
      if (v < 0 || v > 100) errors.push(`Proces ${p.processNumber}: udio topline mora biti 0..100`);
    }
    if (p.measurableHeat?.applicable) {
      if (p.measurableHeat.emissionFactor === undefined) errors.push(`Proces ${p.processNumber}: EF topline je obavezan kada je toplina primjenjiva`);
    }

    if (p.wasteGases?.imported !== undefined && (p.wasteGases?.imported || 0) < 0) errors.push(`Proces ${p.processNumber}: uvezeni otpadni plinovi ne mogu biti negativni`);
    if (p.wasteGases?.exported !== undefined && (p.wasteGases?.exported || 0) < 0) errors.push(`Proces ${p.processNumber}: izvezeni otpadni plinovi ne mogu biti negativni`);
    if (p.wasteGases?.emissionFactor !== undefined && (p.wasteGases?.emissionFactor || 0) < 0) errors.push(`Proces ${p.processNumber}: EF otpadnih plinova ne može biti negativan`);
    if (p.wasteGases?.emissionFactorUnit && !['tCO2/TJ'].includes(p.wasteGases.emissionFactorUnit)) warnings.push(`Proces ${p.processNumber}: nepodržana jedinica EF otpadnih plinova`);
    if (p.wasteGases?.amount !== undefined && (p.wasteGases?.amount || 0) < 0) errors.push(`Proces ${p.processNumber}: količina otpadnih plinova ne može biti negativna`);
    if (p.wasteGases?.reusedShare !== undefined) {
      const v = p.wasteGases?.reusedShare || 0;
      if (v < 0 || v > 100) errors.push(`Proces ${p.processNumber}: iskorišteni udio mora biti 0..100`);
    }

    if (p.indirectEmissions?.electricityConsumption !== undefined && (p.indirectEmissions?.electricityConsumption || 0) < 0) errors.push(`Proces ${p.processNumber}: potrošnja električne energije ne može biti negativna`);
    if (p.indirectEmissions?.emissionFactor !== undefined && (p.indirectEmissions?.emissionFactor || 0) < 0) errors.push(`Proces ${p.processNumber}: EF električne energije ne može biti negativan`);
    if (p.indirectEmissions?.emissionFactorUnit && !['tCO2/MWh', 'tCO2/kWh', 'tCO2/GJ'].includes(p.indirectEmissions.emissionFactorUnit)) warnings.push(`Proces ${p.processNumber}: nepodržana jedinica EF električne energije`);
    if (p.indirectEmissions?.applicable) {
      if (p.indirectEmissions.emissionFactor === undefined) errors.push(`Proces ${p.processNumber}: EF električne energije je obavezan kada su neizravne emisije primjenjive`);
      if (!p.indirectEmissions.emissionFactorUnit) errors.push(`Proces ${p.processNumber}: jedinica EF električne energije je obavezna`);
    }

    if (p.electricityExported?.exportedAmount !== undefined && (p.electricityExported?.exportedAmount || 0) < 0) errors.push(`Proces ${p.processNumber}: izvezena el. energija ne može biti negativna`);
    if (p.electricityExported?.emissionFactor !== undefined && (p.electricityExported?.emissionFactor || 0) < 0) errors.push(`Proces ${p.processNumber}: EF izvezene el. energije ne može biti negativan`);
    if (p.electricityExported?.emissionFactorUnit && !['tCO2/MWh', 'tCO2/kWh', 'tCO2/GJ'].includes(p.electricityExported.emissionFactorUnit)) warnings.push(`Proces ${p.processNumber}: nepodržana jedinica EF izvezene el. energije`);
    if (p.electricityExported?.applicable) {
      if ((p.electricityExported.exportedAmount || 0) > 0 && p.electricityExported.emissionFactor === undefined) errors.push(`Proces ${p.processNumber}: EF izvezene el. energije je obavezan kada je količina > 0`);
      if ((p.electricityExported.exportedAmount || 0) > 0 && !p.electricityExported.emissionFactorUnit) errors.push(`Proces ${p.processNumber}: jedinica EF izvezene el. energije je obavezna`);
    }

    (p.inputOutputMatrix?.processToProcess || []).forEach((rowArr: any[]) => {
      const row = (rowArr || [])[0] || {};
      if (row.share !== undefined) {
        const v = Number(row.share || 0);
        if (v < 0 || v > 100) errors.push(`Proces ${p.processNumber}: udio Proces→Proces mora biti 0..100`);
      }
      if ((Number(row.share || 0) > 0) && (!row.calculationMethod || !String(row.calculationMethod).trim())) {
        errors.push(`Proces ${p.processNumber}: metoda izračuna mora biti unesena za Proces→Proces kada je udio > 0`);
      }
      if (row.amount !== undefined && Number(row.amount || 0) < 0) errors.push(`Proces ${p.processNumber}: količina Proces→Proces ne može biti negativna`);
    });

    (p.inputOutputMatrix?.processToProduct || []).forEach((rowArr: any[]) => {
      const row = (rowArr || [])[0] || {};
      if (row.shareOfTotal !== undefined) {
        const v = Number(row.shareOfTotal || 0);
        if (v < 0 || v > 100) errors.push(`Proces ${p.processNumber}: udio Proces→Proizvod mora biti 0..100`);
      }
      if (row.amount !== undefined && Number(row.amount || 0) < 0) errors.push(`Proces ${p.processNumber}: količina Proces→Proizvod ne može biti negativna`);
      if ((Number(row.shareOfTotal || 0) > 0) && (row.cbamRelevant === false)) {
        warnings.push(`Proces ${p.processNumber}: udio Proces→Proizvod > 0 ali označeno kao ne‑CBAM relevantno`);
      }
    });

    (p.inputOutputMatrix?.precursorConsumption || []).forEach((rowArr: any[]) => {
      const row = (rowArr || [])[0] || {};
      if (row.amount !== undefined && Number(row.amount || 0) < 0) errors.push(`Proces ${p.processNumber}: količina prekursora ne može biti negativna`);
    });
  });

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validates CBAM data for all requirements
 * @param data - CBAM data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validateAllRequirements(data: CBAMData): ValidationResult {
  const basicValidation = validateCBAMData(data);
  const excelValidation = validateForExcelExport(data);
  const consistencyValidation = validateDataConsistency(data);
  const rangeValidation = validateNumericRanges(data);
  const formatValidation = validateStringFormats(data);
  const excelCompatibility = validateExcelCompatibility(data);
  const purchasedPrecursorsValidation = validatePurchasedPrecursors(data);
  
  return combineValidationResults(
    basicValidation,
    excelValidation,
    consistencyValidation,
    rangeValidation,
    formatValidation,
    excelCompatibility,
    purchasedPrecursorsValidation
  );
}

/**
 * Validates CBAM data and returns status
 * @param data - CBAM data to validate
 * @returns DataValidationStatus
 */
export function validateCBAMDataStatus(data: CBAMData): DataValidationStatus {
  const result = validateCBAMData(data);
  
  return {
    isValid: result.isValid,
    errors: result.errors,
    warnings: result.warnings,
    hasMissingData: result.errors.length > 0,
    hasInconsistentData: result.warnings.length > 0
  };
}

/**
 * Validates calculation results and returns status
 * @param results - Calculation results to validate
 * @returns DataValidationStatus
 */
export function validateCalculationResultsStatus(results: CalculationResults): DataValidationStatus {
  const result = validateCalculationResults(results);
  
  return {
    isValid: result.isValid,
    errors: result.errors,
    warnings: result.warnings,
    hasMissingData: result.errors.length > 0,
    hasInconsistentData: result.warnings.length > 0
  };
}

/**
 * Validates purchased precursors data
 * @param data - CBAM data to validate
 * @returns ValidationResult with errors and warnings
 */
export function validatePurchasedPrecursors(data: CBAMData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!data.purchasedPrecursors) {
    warnings.push('No purchased precursors data provided');
    return {
      isValid: true,
      errors,
      warnings
    };
  }
  
  const { precursors } = data.purchasedPrecursors;
  
  if (!precursors || precursors.length === 0) {
    warnings.push('No purchased precursors defined');
    return {
      isValid: true,
      errors,
      warnings
    };
  }
  
  // Validate each precursor
  precursors.forEach((precursor, index) => {
    // Required fields
    if (!precursor.name || !precursor.name.trim()) {
      errors.push(`Precursor name is required for entry ${index + 1}`);
    }
    
    if (precursor.totalAmountConsumed === undefined || precursor.totalAmountConsumed === null) {
      errors.push(`Total amount consumed value is required for precursor ${index + 1}`);
    } else if (precursor.totalAmountConsumed < 0) {
      errors.push(`Total amount consumed cannot be negative for precursor ${index + 1}`);
    }
    
    // Optional numeric fields (validate if provided)
    if (precursor.specificDirectEmbeddedEmissions !== undefined && precursor.specificDirectEmbeddedEmissions < 0) {
      errors.push(`Specific direct embedded emissions cannot be negative for precursor ${index + 1}`);
    }
    
    if (precursor.electricityConsumption !== undefined && precursor.electricityConsumption < 0) {
      errors.push(`Electricity consumption cannot be negative for precursor ${index + 1}`);
    }
    
    if (precursor.electricityEmissionFactor !== undefined && precursor.electricityEmissionFactor < 0) {
      errors.push(`Electricity emission factor cannot be negative for precursor ${index + 1}`);
    }
    
    // Optional text fields
    if (precursor.defaultJustification && !precursor.defaultJustification.trim()) {
      warnings.push(`Default value justification is empty for precursor ${index + 1}`);
    }
    
    // Check for logical consistency
    if (precursor.specificDirectEmbeddedEmissions === 0 && !precursor.defaultJustification) {
      warnings.push(`Zero specific direct embedded emissions without justification for precursor ${index + 1}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Section-specific validation
export type ValidationSection = 'companyInfo' | 'reportConfig' | 'installationDetails' | 'bEmInstData' | 'energyFuelData' | 'processProductionData' | 'purchasedPrecursors' | 'aInstData' | 'dProcessesData' | 'cInstEmissions' | 'ePurchased' | 'fEmissions';

export function validateCBAMSections(data: CBAMData, sections: ValidationSection[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (sections.includes('companyInfo')) {
    if (!data.companyInfo) {
      errors.push('Company information is required');
    } else {
      if (!data.companyInfo.companyName) errors.push('Company name is required');
      if (!data.companyInfo.companyAddress) errors.push('Company address is required');
      // Optional in current UI
      if (!data.companyInfo.companyCountry) warnings.push('Company country is recommended');
    }
  }

  if (sections.includes('reportConfig')) {
    if (!data.reportConfig) {
      errors.push('Report configuration is required');
    } else {
      // Optional in current UI
      if (!data.reportConfig.reportingPeriod) warnings.push('Reporting period is recommended');
      if (!data.reportConfig.reportType) warnings.push('Report type is recommended');
    }
  }

  if (sections.includes('installationDetails')) {
    if (!data.installationDetails) {
      errors.push('Installation details are required');
    } else {
      if (!data.installationDetails.mainActivity) errors.push('Main activity is required');
      if (!data.installationDetails.cnCode) warnings.push('CN code is recommended');
    }
  }

  if (sections.includes('bEmInstData')) {
    if (!data.bEmInstData) {
      errors.push('B_EmInst emission sources data is required');
    } else {
      // Validate emission source streams
      if (data.bEmInstData.emissionSources && data.bEmInstData.emissionSources.length > 0) {
        data.bEmInstData.emissionSources.forEach((source, index) => {
          if (!source.sourceStreamName) errors.push(`Source stream name is required for emission source ${index + 1}`);
          if (!source.method) errors.push(`Emission calculation method is required for emission source ${index + 1}`);
          if (source.activityData === undefined || source.activityData === null) {
            errors.push(`Activity data is required for emission source ${index + 1}`);
          }
          if (source.activityData < 0) errors.push(`Activity data cannot be negative for emission source ${index + 1}`);
        });
      } else {
        warnings.push('No emission sources defined in B_EmInst data');
      }

      // Validate PFC sources if any
      if (data.bEmInstData.pfcEmissions && data.bEmInstData.pfcEmissions.length > 0) {
        data.bEmInstData.pfcEmissions.forEach((pfcSource, index) => {
          if (pfcSource.activityData === undefined || pfcSource.activityData === null) {
            errors.push(`Activity data is required for PFC source ${index + 1}`);
          }
        });
      }
    }
  }

  if (sections.includes('energyFuelData')) {
    if (data.energyFuelData && data.energyFuelData.length > 0) {
      data.energyFuelData.forEach((item, index) => {
        if (!item.fuelType) errors.push(`Fuel type is required for energy entry ${index + 1}`);
        if (item.consumption === undefined || item.consumption === null) {
          errors.push(`Consumption value is required for energy entry ${index + 1}`);
        }
        if (item.consumption < 0) errors.push(`Consumption cannot be negative for energy entry ${index + 1}`);
      });
    }
  }

  if (sections.includes('processProductionData')) {
    if (data.processProductionData && data.processProductionData.length > 0) {
      data.processProductionData.forEach((process, index) => {
        if (!process.processName) errors.push(`Process name is required for process entry ${index + 1}`);
        if (process.inputs && process.inputs.length > 0) {
          process.inputs.forEach((input, inputIndex) => {
            if (!input.materialName) errors.push(`Material name is required for input ${inputIndex + 1} in process ${index + 1}`);
            if (input.amount === undefined || input.amount === null) {
              errors.push(`Amount is required for input ${inputIndex + 1} in process ${index + 1}`);
            }
            if (input.amount < 0) errors.push(`Amount cannot be negative for input ${inputIndex + 1} in process ${index + 1}`);
          });
        }
      });
    }
  }

  if (sections.includes('purchasedPrecursors')) {
    const precursorsResult = validatePurchasedPrecursors(data);
    errors.push(...precursorsResult.errors);
    warnings.push(...precursorsResult.warnings);
  }

  if (sections.includes('aInstData')) {
    if (!data.aInstData) {
      errors.push('A_InstData installation data is required');
    } else {
      // Basic validation for A_InstData
      if (!data.aInstData.installationIdentification?.installationName) {
        warnings.push('Installation name is recommended in A_InstData');
      }
    }
  }

  if (sections.includes('dProcessesData')) {
    if (!data.dProcessesData) {
      errors.push('D_Processes production processes data is required');
    } else {
      const res = validateDProcessesData(data.dProcessesData as any);
      errors.push(...res.errors);
      warnings.push(...res.warnings);
    }
  }

  if (sections.includes('cInstEmissions')) {
    if (!data.cInstEmissions) {
      errors.push('C_InstEmissions emissions and energy balance data is required');
    } else {
      // Basic validation for C_InstEmissions
      if (!data.cInstEmissions.fuelBalance) {
        warnings.push('Fuel balance data is missing in C_InstEmissions');
      }
      const vs = data.cInstEmissions.validationStatus;
      if (vs && Array.isArray(vs.errors) && vs.errors.length > 0) {
        errors.push(...vs.errors);
      }
      if (vs && Array.isArray(vs.warnings) && vs.warnings.length > 0) {
        warnings.push(...vs.warnings);
      }
    }
  }

  if (sections.includes('ePurchased')) {
    if (!data.ePurchased) {
      errors.push('E_Purchased purchased precursors data is required');
    } else {
      if (data.ePurchased.precursors && data.ePurchased.precursors.length === 0) {
        warnings.push('No purchased precursors defined in E_Purchased data');
      }
    }
  }

  if (sections.includes('fEmissions')) {
    if (!data.fEmissions) {
      errors.push('F_Emissions additional emissions data is required');
    } else {
      // Basic validation for F_Emissions
      if (!data.fEmissions.metadata?.reportingPeriod) {
        warnings.push('Reporting period is missing in F_Emissions');
      }
      const vs = data.fEmissions.validationStatus;
      if (vs && Array.isArray(vs.errors) && vs.errors.length > 0) {
        errors.push(...vs.errors);
      }
      if (vs && Array.isArray(vs.warnings) && vs.warnings.length > 0) {
        warnings.push(...vs.warnings);
      }
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function validateCBAMSectionsStatus(data: CBAMData, sections: ValidationSection[]): DataValidationStatus {
  const result = validateCBAMSections(data, sections);
  return {
    isValid: result.isValid,
    errors: result.errors,
    warnings: result.warnings,
    hasMissingData: result.errors.length > 0,
    hasInconsistentData: result.warnings.length > 0
  };
}

const dataValidationUtils = {
  validateCBAMData,
  validateForExcelExport,
  validateCalculationResults,
  validateDataConsistency,
  validateRequiredFields,
  validateNumericRanges,
  validateStringFormats,
  combineValidationResults,
  validateExcelCompatibility,
  validateAllRequirements,
  validateCBAMDataStatus,
  validateCalculationResultsStatus,
  validatePurchasedPrecursors,
  validateCBAMSections,
  validateCBAMSectionsStatus
};

export default dataValidationUtils;