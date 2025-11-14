import { CBAMData, CalculationResults, CalculationConstants, EmissionFactor } from '../types/CBAMData';

/**
 * CBAM Calculation Engine
 * 
 * This module implements the calculation logic for CBAM emissions based on the Excel template.
 * It calculates direct CO2 emissions, specific emissions, total energy and renewable share,
 * imported raw material share and embedded emissions, and cumulative emissions.
 */

// Default calculation constants based on the Excel template
const DEFAULT_CONSTANTS: CalculationConstants = {
  // Conversion factors
  tCO2_to_kgCO2: 1000,
  kgCO2_to_tCO2: 0.001,
  MWh_to_GJ: 3.6,
  GJ_to_MWh: 0.2777777778,
  
  // Default emission factors (tCO2/MWh)
  defaultElectricityEmissionFactor: 0.475, // EU average
  defaultHeatEmissionFactor: 0.25, // Natural gas
  
  // Biomass CO2 factor (tCO2/t)
  biomassCO2Factor: 1.83,
  
  // Thresholds
  renewableThreshold: 0.2, // 20% renewable energy threshold
  
  // Other constants
  defaultProcessEmissionFactor: 0.1,
  defaultEmbeddedEmissionFactor: 0.5,
  
  // Additional constants from Excel template
  CBAMPeriod: 'Transitional',
  GWP_CH4: 28,
  GWP_N2O: 265,
  GWP_SF6: 23900,
  GWP_NF3: 16700,
  GWP_HFCs: 1430,
  GWP_PFCs: 7390,
  reportingYear: 2024,
  reportingQuarter: 4,
  dataQualityThreshold: 0.8,
  uncertaintyThreshold: 0.2,
  GWP_HFC23: 12400,
  GWP_HFC32: 677,
  GWP_HFC4310mee: 8840,
  GWP_c4f8: 10300,
  GWP_c2f6: 12200,
  GWP_c6f14: 9390,
  transportDistanceDefault: 1000,
  transportEmissionFactor: 0.1,
  roadTransportEmissionFactor: 0.089,
  railTransportEmissionFactor: 0.041,
  seaTransportEmissionFactor: 0.015,
  airTransportEmissionFactor: 0.602,
  defaultTransportEmissionFactor: 0.1
};

// Default emission factors for common fuels (tCO2/MWh)
const DEFAULT_FUEL_EMISSION_FACTORS: Record<string, number> = {
  // Common fuels
  'Natural Gas': 0.202,
  'Coal': 0.34,
  'Oil': 0.267,
  'LPG': 0.229,
  'Diesel': 0.267,
  'Petrol': 0.267,
  'Biomass': 0, // Biogenic CO2 is reported separately
  'Electricity': 0.475, // EU average
  'Heat': 0.25, // Natural gas
  'Other': 0.3,
  
  // Additional fuels from Excel template
  'Coke': 0.35,
  'Coke Oven Gas': 0.4,
  'Blast Furnace Gas': 0.28,
  'Propane': 0.24,
  'Butane': 0.24,
  'Naphtha': 0.27,
  'Fuel Oil': 0.28,
  'Peat': 0.32,
  'Waste Gas': 0.4,
  'Hydrogen': 0,
  'Steam': 0,
  'Geothermal': 0,
  'Solar': 0,
  'Wind': 0,
  'Hydro': 0,
  'Nuclear': 0
};

// Default emission factors for common processes (tCO2/t product)
const DEFAULT_PROCESS_EMISSION_FACTORS: Record<string, number> = {
  // Common processes
  'Iron and Steel Production': 1.9,
  'Aluminium Production': 1.7,
  'Cement Production': 0.66,
  'Fertilizer Production': 2.0,
  'Electricity Production': 0.475,
  'Hydrogen Production': 0.0,
  'Organic Chemicals': 1.3,
  'Plastics': 2.0,
  'Other': 0.5,
  
  // Additional processes from Excel template
  'Ammonia': 1.8,
  'Nitric Acid': 0.5,
  'Urea': 1.2,
  'Mixed Fertilisers': 1.5,
  'Aluminium Products': 1.7,
  'Unwrought Aluminium': 1.7,
  'Electricity Export': 0.475,
  'Glass': 0.3,
  'Paper': 0.5,
  'Refining': 0.7,
  'Chemicals': 1.0,
  'Steel Primary': 2.0,
  'Steel Secondary': 0.4,
  'Cement Clinker': 0.8,
  'Lime': 0.7,
  'Gypsum': 0.1,
  'Dolomite': 0.5
};

// Default embedded emission factors for common materials (tCO2/t material)
const DEFAULT_EMBEDDED_EMISSION_FACTORS: Record<string, number> = {
  // Common materials
  'Iron Ore': 0.03,
  'Coal': 0.09,
  'Limestone': 0.05,
  'Bauxite': 0.3,
  'Alumina': 1.6,
  'Scrap Metal': 0.3,
  'Natural Gas': 0.056,
  'Crude Oil': 0.12,
  'Other': 0.5,
  
  // Additional materials from Excel template
  'Coke': 0.35,
  'Sinter': 0.2,
  'Pellets': 0.15,
  'Direct Reduced Iron': 0.4,
  'Hot Metal': 0.35,
  'Steel Slabs': 0.4,
  'Steel Coils': 0.4,
  'Steel Beams': 0.4,
  'Aluminium Ingots': 1.7,
  'Aluminium Billets': 1.7,
  'Aluminium Slabs': 1.7,
  'Aluminium Sheets': 1.7,
  'Clinker': 0.8,
  'Cement': 0.66,
  'Lime': 0.7,
  'Gypsum': 0.1,
  'Ammonia': 1.8,
  'Nitric Acid': 0.5,
  'Urea': 1.2,
  'Mixed Fertilisers': 1.5,
  'Glass': 0.3,
  'Paper': 0.5,
  'Chemicals': 1.0,
  'Plastics': 2.0,
  'Electricity': 0.475,
  'Heat': 0.25,
  'Steam': 0,
  'Hydrogen': 0
};

/**
 * Calculate total direct CO2 emissions from fuel consumption
 * @param energyFuelData Array of fuel consumption data
 * @param emissionFactors Array of custom emission factors
 * @returns Total direct CO2 emissions in tonnes
 */
export const calculateTotalDirectCO2Emissions = (
  energyFuelData: CBAMData['energyFuelData'],
  emissionFactors: EmissionFactor[] = []
): number => {
  return energyFuelData.reduce((total, fuel) => {
    // First check for a custom emission factor
    let emissionFactor = fuel.co2EmissionFactor;
    
    // If no custom factor is provided, check for a factor in the emissionFactors array
    if (!emissionFactor && emissionFactors.length > 0) {
      const customFactor = emissionFactors.find(
        factor => factor.category === 'Fuel' && factor.name === fuel.fuelType
      );
      if (customFactor) {
        emissionFactor = customFactor.value;
      }
    }
    
    // If still no factor, use the default
    if (!emissionFactor) {
      emissionFactor = DEFAULT_FUEL_EMISSION_FACTORS[fuel.fuelType] || 0;
    }
    
    // Calculate emissions (consumption * emission factor)
    const emissions = fuel.consumption * emissionFactor;
    
    return total + emissions;
  }, 0);
};

/**
 * Calculate direct emissions by greenhouse gas type
 * @param energyFuelData Array of fuel consumption data
 * @param emissionFactors Array of custom emission factors
 * @returns Object with emissions by gas type (CO2, CH4, N2O, other GWP)
 */
export const calculateDirectEmissionsByGasType = (
  energyFuelData: CBAMData['energyFuelData'],
  emissionFactors: EmissionFactor[] = []
): { co2: number; ch4: number; n2o: number; otherGwp: number; total: number } => {
  const result = { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 };
  
  energyFuelData.forEach(fuel => {
    // Get emission factors for each gas type
    let co2Factor = fuel.co2EmissionFactor;
    let ch4Factor = fuel.ch4EmissionFactor || 0;
    let n2oFactor = fuel.n2oEmissionFactor || 0;
    let otherGwpFactor = fuel.otherGwpEmissionFactor || 0;
    
    // Check for custom factors in the emissionFactors array
    if (emissionFactors.length > 0) {
      const customCo2Factor = emissionFactors.find(
        factor => factor.category === 'Fuel' && factor.name === fuel.fuelType && factor.gasType === 'CO2'
      );
      if (customCo2Factor) co2Factor = customCo2Factor.value;
      
      const customCh4Factor = emissionFactors.find(
        factor => factor.category === 'Fuel' && factor.name === fuel.fuelType && factor.gasType === 'CH4'
      );
      if (customCh4Factor) ch4Factor = customCh4Factor.value;
      
      const customN2oFactor = emissionFactors.find(
        factor => factor.category === 'Fuel' && factor.name === fuel.fuelType && factor.gasType === 'N2O'
      );
      if (customN2oFactor) n2oFactor = customN2oFactor.value;
      
      const customOtherGwpFactor = emissionFactors.find(
        factor => factor.category === 'Fuel' && factor.name === fuel.fuelType && factor.gasType === 'OtherGWP'
      );
      if (customOtherGwpFactor) otherGwpFactor = customOtherGwpFactor.value;
    }
    
    // Use default factors if custom ones are not provided
    if (!co2Factor) co2Factor = DEFAULT_FUEL_EMISSION_FACTORS[fuel.fuelType] || 0;
    
    // Calculate emissions for each gas type
    const consumption = fuel.consumption;
    result.co2 += consumption * co2Factor;
    result.ch4 += consumption * ch4Factor;
    result.n2o += consumption * n2oFactor;
    result.otherGwp += consumption * otherGwpFactor;
  });
  
  // Calculate total emissions
  result.total = result.co2 + result.ch4 + result.n2o + result.otherGwp;
  
  return result;
};

/**
 * Calculate biogenic CO2 emissions
 * @param energyFuelData Array of fuel consumption data
 * @param emissionFactors Array of custom emission factors
 * @returns Biogenic CO2 emissions in tonnes
 */
export const calculateBiogenicCO2Emissions = (
  energyFuelData: CBAMData['energyFuelData'],
  emissionFactors: EmissionFactor[] = []
): number => {
  return energyFuelData.reduce((total, fuel) => {
    // Only calculate biogenic emissions for biogenic fuels
    if (!fuel.isBiogenic && fuel.fuelType !== 'Biomass') {
      return total;
    }
    
    // Get emission factor
    let emissionFactor = fuel.co2EmissionFactor;
    
    // Check for custom factors
    if (!emissionFactor && emissionFactors.length > 0) {
      const customFactor = emissionFactors.find(
        factor => factor.category === 'Fuel' && factor.name === fuel.fuelType && factor.isBiogenic === true
      );
      if (customFactor) {
        emissionFactor = customFactor.value;
      }
    }
    
    // Use default factor if custom one is not provided
    if (!emissionFactor) {
      emissionFactor = DEFAULT_FUEL_EMISSION_FACTORS[fuel.fuelType] || 0;
    }
    
    // Calculate biogenic emissions
    return total + (fuel.consumption * emissionFactor * DEFAULT_CONSTANTS.biomassCO2Factor);
  }, 0);
};

/**
 * Calculate total process emissions
 * @param processProductionData Array of process data
 * @param emissionFactors Array of custom emission factors
 * @returns Total process emissions in tonnes
 */
export const calculateTotalProcessEmissions = (
  processProductionData: CBAMData['processProductionData'],
  emissionFactors: EmissionFactor[] = []
): number => {
  return processProductionData.reduce((total, process) => {
    // First check for a custom emission factor
    let emissionFactor = process.processEmissionFactor;
    
    // If no custom factor is provided, check for a factor in the emissionFactors array
    if (emissionFactor === undefined && emissionFactors.length > 0) {
      const customFactor = emissionFactors.find(
        factor => factor.category === 'Process' && factor.name === process.processType
      );
      if (customFactor) {
        emissionFactor = customFactor.value;
      }
    }
    
    // If still no factor, use the default
    if (emissionFactor === undefined) {
      emissionFactor = DEFAULT_PROCESS_EMISSION_FACTORS[process.processType] ?? DEFAULT_CONSTANTS.defaultProcessEmissionFactor;
    }
    
    // Calculate emissions (production * emission factor)
    const production = (process.productionAmount ?? process.productionQuantity ?? 0);
    const emissions = production * emissionFactor;
    
    return total + emissions;
  }, 0);
};

/**
 * Calculate process emissions by greenhouse gas type
 * @param processProductionData Array of process data
 * @param emissionFactors Array of custom emission factors
 * @returns Object with emissions by gas type (CO2, CH4, N2O, other GWP)
 */
export const calculateProcessEmissionsByGasType = (
  processProductionData: CBAMData['processProductionData'],
  emissionFactors: EmissionFactor[] = []
): { co2: number; ch4: number; n2o: number; otherGwp: number; total: number } => {
  const result = { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 };
  
  processProductionData.forEach(process => {
    // Get emission factors for each gas type
    let co2Factor = process.processEmissionFactor;
    let ch4Factor = process.ch4Emissions || 0;
    let n2oFactor = process.n2oEmissions || 0;
    let otherGwpFactor = process.otherGwpEmissions || 0;
    
    // Check for custom factors in the emissionFactors array
    if (emissionFactors.length > 0) {
      const customCo2Factor = emissionFactors.find(
        factor => factor.category === 'Process' && factor.name === process.processType && factor.gasType === 'CO2'
      );
      if (customCo2Factor) co2Factor = customCo2Factor.value;
      
      const customCh4Factor = emissionFactors.find(
        factor => factor.category === 'Process' && factor.name === process.processType && factor.gasType === 'CH4'
      );
      if (customCh4Factor) ch4Factor = customCh4Factor.value;
      
      const customN2oFactor = emissionFactors.find(
        factor => factor.category === 'Process' && factor.name === process.processType && factor.gasType === 'N2O'
      );
      if (customN2oFactor) n2oFactor = customN2oFactor.value;
      
      const customOtherGwpFactor = emissionFactors.find(
        factor => factor.category === 'Process' && factor.name === process.processType && factor.gasType === 'OtherGWP'
      );
      if (customOtherGwpFactor) otherGwpFactor = customOtherGwpFactor.value;
    }
    
    // Use default factors if custom ones are not provided
    if (co2Factor === undefined) {
      co2Factor = DEFAULT_PROCESS_EMISSION_FACTORS[process.processType] ?? DEFAULT_CONSTANTS.defaultProcessEmissionFactor;
    }
    
    // Calculate emissions for each gas type
    const production = (process.productionAmount ?? process.productionQuantity ?? 0);
    result.co2 += production * (co2Factor || 0);
    result.ch4 += production * ch4Factor;
    result.n2o += production * n2oFactor;
    result.otherGwp += production * otherGwpFactor;
  });
  
  // Calculate total emissions
  result.total = result.co2 + result.ch4 + result.n2o + result.otherGwp;
  
  return result;
};

/**
 * Calculate total emissions (direct + process)
 * @param directEmissions Total direct CO2 emissions
 * @param processEmissions Total process emissions
 * @returns Total emissions in tonnes
 */
export const calculateTotalEmissions = (directEmissions: number, processEmissions: number): number => {
  return directEmissions + processEmissions;
};

/**
 * Calculate specific emissions (total emissions per unit of production)
 * @param totalEmissions Total emissions in tonnes
 * @param totalProduction Total production quantity
 * @returns Specific emissions in tCO2/t product
 */
export const calculateSpecificEmissions = (totalEmissions: number, totalProduction: number): number => {
  if (totalProduction <= 0) return 0;
  return totalEmissions / totalProduction;
};

/**
 * Calculate total energy consumption
 * @param energyFuelData Array of fuel consumption data
 * @returns Total energy consumption in MWh
 */
export const calculateTotalEnergy = (energyFuelData: CBAMData['energyFuelData']): number => {
  return energyFuelData.reduce((total, fuel) => {
    // For electricity and heat, consumption is already in MWh
    // For fuels, we need to convert to MWh using calorific values
    // For simplicity, we assume all consumption values are in MWh
    return total + fuel.consumption;
  }, 0);
};

/**
 * Calculate renewable energy share
 * @param energyFuelData Array of fuel consumption data
 * @returns Renewable energy share as a percentage (0-1)
 */
export const calculateRenewableShare = (energyFuelData: CBAMData['energyFuelData']): number => {
  const totalEnergy = calculateTotalEnergy(energyFuelData);
  
  if (totalEnergy <= 0) return 0;
  
  // Calculate renewable energy (electricity with renewable share + biomass)
  const renewableEnergy = energyFuelData.reduce((total, fuel) => {
    if (fuel.fuelType === 'Electricity') {
      return total + (fuel.consumption * (fuel.renewableShare || 0));
    } else if (fuel.fuelType === 'Biomass') {
      return total + fuel.consumption;
    }
    return total;
  }, 0);
  
  return renewableEnergy / totalEnergy;
};

/**
 * Calculate imported raw material share
 * @param processProductionData Array of process data
 * @returns Imported raw material share as a percentage (0-1)
 */
export const calculateImportedRawMaterialShare = (processProductionData: CBAMData['processProductionData']): number => {
  // Calculate total input materials
  const totalInputs = processProductionData.reduce((total, process) => {
    return total + process.inputs.reduce((subTotal, input) => subTotal + (input.amount ?? input.quantity ?? 0), 0);
  }, 0);
  
  if (totalInputs <= 0) return 0;
  
  // Calculate imported input materials
  const importedInputs = processProductionData.reduce((total, process) => {
    return total + process.inputs.reduce((subTotal, input) => {
      // Consider materials with an origin country specified or explicitly marked as imported
      const isImported = input.isImported || 
                       (input.originCountry && input.originCountry.trim().length > 0) ||
                       (input.countryOfOrigin && input.countryOfOrigin.trim().length > 0);
      return subTotal + (isImported ? (input.amount ?? input.quantity ?? 0) : 0);
    }, 0);
  }, 0);
  
  return importedInputs / totalInputs;
};

/**
 * Calculate imported raw material share by country
 * @param processProductionData Array of process data
 * @returns Object with imported material share by country
 */
export const calculateImportedRawMaterialShareByCountry = (
  processProductionData: CBAMData['processProductionData']
): { total: number; byCountry: { [country: string]: { amount: number; share: number } } } => {
  const result = { total: 0, byCountry: {} as { [country: string]: { amount: number; share: number } } };
  
  // Calculate total input materials
  const totalInputs = processProductionData.reduce((total, process) => {
    return total + process.inputs.reduce((subTotal, input) => subTotal + (input.amount ?? input.quantity ?? 0), 0);
  }, 0);
  
  if (totalInputs <= 0) return result;
  
  // Calculate imported input materials by country
  processProductionData.forEach(process => {
    process.inputs.forEach(input => {
      // Only consider imported materials
      const isImported = input.isImported || 
                       (input.originCountry && input.originCountry.trim().length > 0) ||
                       (input.countryOfOrigin && input.countryOfOrigin.trim().length > 0);
      
      if (!isImported) return;
      
      const country = input.countryOfOrigin || input.originCountry || 'Unknown';
      const amount = input.amount ?? input.quantity ?? 0;
      
      result.total += amount;
      
      if (!result.byCountry[country]) {
        result.byCountry[country] = { amount: 0, share: 0 };
      }
      result.byCountry[country].amount += amount;
    });
  });
  
  // Calculate shares for each country
  Object.keys(result.byCountry).forEach(country => {
    result.byCountry[country].share = result.byCountry[country].amount / totalInputs;
  });
  
  return result;
};

/**
 * Calculate imported raw material share by material type
 * @param processProductionData Array of process data
 * @returns Object with imported material share by material type
 */
export const calculateImportedRawMaterialShareByMaterial = (
  processProductionData: CBAMData['processProductionData']
): { total: number; byMaterial: { [materialName: string]: { imported: number; total: number; share: number } } } => {
  const result = { total: 0, byMaterial: {} as { [materialName: string]: { imported: number; total: number; share: number } } };
  
  // Calculate total and imported input materials by material type
  processProductionData.forEach(process => {
    process.inputs.forEach(input => {
      const materialName = input.materialName;
      const amount = input.amount ?? input.quantity ?? 0;
      
      // Initialize material entry if not exists
      if (!result.byMaterial[materialName]) {
        result.byMaterial[materialName] = { imported: 0, total: 0, share: 0 };
      }
      
      // Add to total
      result.byMaterial[materialName].total += amount;
      result.total += amount;
      
      // Check if material is imported
      const isImported = input.isImported || 
                       (input.originCountry && input.originCountry.trim().length > 0) ||
                       (input.countryOfOrigin && input.countryOfOrigin.trim().length > 0);
      
      if (isImported) {
        result.byMaterial[materialName].imported += amount;
      }
    });
  });
  
  // Calculate shares for each material
  Object.keys(result.byMaterial).forEach(materialName => {
    const material = result.byMaterial[materialName];
    material.share = material.total > 0 ? material.imported / material.total : 0;
  });
  
  return result;
};

/**
 * Calculate embedded emissions from input materials
 * @param processProductionData Array of process data
 * @param emissionFactors Array of custom emission factors
 * @returns Total embedded emissions in tonnes
 */
export const calculateEmbeddedEmissions = (
  processProductionData: CBAMData['processProductionData'],
  emissionFactors: EmissionFactor[] = []
): number => {
  return processProductionData.reduce((total, process) => {
    return total + process.inputs.reduce((subTotal, input) => {
      // Use provided embedded emissions
      if ((input.embeddedEmissions ?? 0) > 0) {
        return subTotal + (input.embeddedEmissions ?? 0);
      } else {
        // Check for a custom factor in the emissionFactors array
        let emissionFactor;
        if (emissionFactors.length > 0) {
          const customFactor = emissionFactors.find(
            factor => factor.category === 'Embedded' && factor.name.toLowerCase() === input.materialName.toLowerCase()
          );
          if (customFactor) {
            emissionFactor = customFactor.value;
          }
        }
        
        // If no custom factor, use the default
        if (!emissionFactor) {
          emissionFactor = DEFAULT_EMBEDDED_EMISSION_FACTORS[input.materialName] ?? DEFAULT_CONSTANTS.defaultEmbeddedEmissionFactor;
        }
        
        return subTotal + ((input.amount ?? input.quantity ?? 0) * emissionFactor);
      }
    }, 0);
  }, 0);
};

/**
 * Calculate embedded emissions from purchased precursors
 * @param purchasedPrecursorsData Array of purchased precursor data
 * @param emissionFactors Array of custom emission factors
 * @returns Total embedded emissions from purchased precursors in tonnes
 */
export const calculatePurchasedPrecursorsEmbeddedEmissions = (
  purchasedPrecursorsData: CBAMData['purchasedPrecursors'],
  emissionFactors: EmissionFactor[] = []
): number => {
  if (!purchasedPrecursorsData || !purchasedPrecursorsData.precursors || purchasedPrecursorsData.precursors.length === 0) {
    return 0;
  }

  return purchasedPrecursorsData.precursors.reduce((total, precursor) => {
    // Use provided embedded emissions
    if ((precursor.specificDirectEmbeddedEmissions ?? 0) > 0) {
      let embeddedEmissions = (precursor.totalAmountConsumed ?? 0) * (precursor.specificDirectEmbeddedEmissions ?? 0);
      
      // Add electricity emissions if provided
      if ((precursor.electricityConsumption ?? 0) > 0) {
        const electricityEmissionFactor = precursor.electricityEmissionFactor ?? DEFAULT_CONSTANTS.defaultElectricityEmissionFactor;
        embeddedEmissions += (precursor.electricityConsumption ?? 0) * electricityEmissionFactor;
      }
      
      return total + embeddedEmissions;
    } else {
      // Check for a custom factor in the emissionFactors array
      let emissionFactor;
      if (emissionFactors.length > 0) {
        const customFactor = emissionFactors.find(
          factor => factor.category === 'Embedded' && factor.name.toLowerCase() === precursor.name.toLowerCase()
        );
        if (customFactor) {
          emissionFactor = customFactor.value;
        }
      }
      
      // If no custom factor, use the default
      if (!emissionFactor) {
        emissionFactor = DEFAULT_EMBEDDED_EMISSION_FACTORS[precursor.name] ?? DEFAULT_CONSTANTS.defaultEmbeddedEmissionFactor;
      }
      
      let embeddedEmissions = (precursor.totalAmountConsumed ?? 0) * emissionFactor;
      
      // Add electricity emissions if provided
      if ((precursor.electricityConsumption ?? 0) > 0) {
        const electricityEmissionFactor = precursor.electricityEmissionFactor ?? DEFAULT_CONSTANTS.defaultElectricityEmissionFactor;
        embeddedEmissions += (precursor.electricityConsumption ?? 0) * electricityEmissionFactor;
      }
      
      return total + embeddedEmissions;
    }
  }, 0);
};

/**
 * Calculate embedded emissions by greenhouse gas type
 * @param processProductionData Array of process data
 * @param emissionFactors Array of custom emission factors
 * @returns Object with embedded emissions by gas type (CO2, CH4, N2O, other GWP)
 */
export const calculateEmbeddedEmissionsByGasType = (
  processProductionData: CBAMData['processProductionData'],
  emissionFactors: EmissionFactor[] = []
): { co2: number; ch4: number; n2o: number; otherGwp: number; total: number } => {
  const result = { co2: 0, ch4: 0, n2o: 0, otherGwp: 0, total: 0 };
  
  processProductionData.forEach(process => {
    process.inputs.forEach(input => {
      // Use provided embedded emissions if available
      if ((input.embeddedEmissions ?? 0) > 0) {
        // If only total embedded emissions are provided, assume all are CO2
        result.co2 += input.embeddedEmissions || 0;
      } else {
        // Check for custom factors for each gas type
        let co2Factor = 0;
        let ch4Factor = 0;
        let n2oFactor = 0;
        let otherGwpFactor = 0;
        
        if (emissionFactors.length > 0) {
          const customCo2Factor = emissionFactors.find(
            factor => factor.category === 'Embedded' && 
                     factor.name.toLowerCase() === input.materialName.toLowerCase() && 
                     factor.gasType === 'CO2'
          );
          if (customCo2Factor) co2Factor = customCo2Factor.value;
          
          const customCh4Factor = emissionFactors.find(
            factor => factor.category === 'Embedded' && 
                     factor.name.toLowerCase() === input.materialName.toLowerCase() && 
                     factor.gasType === 'CH4'
          );
          if (customCh4Factor) ch4Factor = customCh4Factor.value;
          
          const customN2oFactor = emissionFactors.find(
            factor => factor.category === 'Embedded' && 
                     factor.name.toLowerCase() === input.materialName.toLowerCase() && 
                     factor.gasType === 'N2O'
          );
          if (customN2oFactor) n2oFactor = customN2oFactor.value;
          
          const customOtherGwpFactor = emissionFactors.find(
            factor => factor.category === 'Embedded' && 
                     factor.name.toLowerCase() === input.materialName.toLowerCase() && 
                     factor.gasType === 'OtherGWP'
          );
          if (customOtherGwpFactor) otherGwpFactor = customOtherGwpFactor.value;
        }
        
        // Use default factors if custom ones are not provided
        if (!co2Factor) {
          co2Factor = DEFAULT_EMBEDDED_EMISSION_FACTORS[input.materialName] ?? DEFAULT_CONSTANTS.defaultEmbeddedEmissionFactor;
        }
        
        // Calculate embedded emissions for each gas type
        const quantity = (input.amount ?? input.quantity ?? 0);
        result.co2 += quantity * co2Factor;
        result.ch4 += quantity * ch4Factor;
        result.n2o += quantity * n2oFactor;
        result.otherGwp += quantity * otherGwpFactor;
      }
    });
  });
  
  // Calculate total emissions
  result.total = result.co2 + result.ch4 + result.n2o + result.otherGwp;
  
  return result;
};

/**
 * Calculate embedded emissions for imported raw materials
 * @param processProductionData Array of process data
 * @param emissionFactors Array of custom emission factors
 * @returns Object with embedded emissions for imported materials
 */
export const calculateImportedMaterialEmbeddedEmissions = (
  processProductionData: CBAMData['processProductionData'],
  emissionFactors: EmissionFactor[] = []
): { total: number; byMaterial: { [materialName: string]: number } } => {
  const result = { total: 0, byMaterial: {} as { [materialName: string]: number } };
  
  processProductionData.forEach(process => {
    process.inputs.forEach(input => {
      // Only consider imported materials
      if (!input.isImported && !input.countryOfOrigin) {
        return;
      }
      
      // Use provided embedded emissions if available
      let embeddedEmissions = input.embeddedEmissions || 0;
      
      // If no embedded emissions provided, calculate them
      if (!embeddedEmissions) {
        // Check for a custom factor in the emissionFactors array
        let emissionFactor;
        if (emissionFactors.length > 0) {
          const customFactor = emissionFactors.find(
            factor => factor.category === 'Embedded' && factor.name.toLowerCase() === input.materialName.toLowerCase()
          );
          if (customFactor) {
            emissionFactor = customFactor.value;
          }
        }
        
        // If no custom factor, use the default
        if (!emissionFactor) {
          emissionFactor = DEFAULT_EMBEDDED_EMISSION_FACTORS[input.materialName] ?? DEFAULT_CONSTANTS.defaultEmbeddedEmissionFactor;
        }
        
        embeddedEmissions = (input.amount ?? input.quantity ?? 0) * emissionFactor;
      }
      
      // Add to total and by-material breakdown
      result.total += embeddedEmissions;
      
      if (!result.byMaterial[input.materialName]) {
        result.byMaterial[input.materialName] = 0;
      }
      result.byMaterial[input.materialName] += embeddedEmissions;
    });
  });
  
  return result;
};

/**
 * Calculate transport emissions for imported materials
 * @param processProductionData Array of process data
 * @param emissionFactors Array of custom emission factors
 * @returns Total transport emissions in tonnes
 */
export const calculateTransportEmissions = (
  processProductionData: CBAMData['processProductionData'],
  emissionFactors: EmissionFactor[] = []
): number => {
  return processProductionData.reduce((total, process) => {
    return total + process.inputs.reduce((subTotal, input) => {
      // Only calculate transport emissions for imported materials with transport data
      if (!input.isImported || !input.transportDistance || !input.transportMode) {
        return subTotal;
      }
      
      // Use provided transport emissions if available
      if (input.transportEmissions) {
        return subTotal + input.transportEmissions;
      }
      
      // Calculate transport emissions based on distance and mode
      let emissionFactor = 0;
      
      // Check for custom transport emission factors
      if (emissionFactors.length > 0) {
        const customFactor = emissionFactors.find(
          factor => factor.category === 'Transport' && factor.name === input.transportMode
        );
        if (customFactor) {
          emissionFactor = customFactor.value;
        }
      }
      
      // Use default transport emission factors if custom ones are not provided
      if (!emissionFactor) {
        switch (input.transportMode.toLowerCase()) {
          case 'road':
            emissionFactor = DEFAULT_CONSTANTS.roadTransportEmissionFactor;
            break;
          case 'rail':
            emissionFactor = DEFAULT_CONSTANTS.railTransportEmissionFactor;
            break;
          case 'sea':
            emissionFactor = DEFAULT_CONSTANTS.seaTransportEmissionFactor;
            break;
          case 'air':
            emissionFactor = DEFAULT_CONSTANTS.airTransportEmissionFactor;
            break;
          default:
            emissionFactor = DEFAULT_CONSTANTS.defaultTransportEmissionFactor;
        }
      }
      
      // Calculate transport emissions (distance * emission factor * quantity)
      const quantity = (input.amount ?? input.quantity ?? 0);
      return subTotal + (input.transportDistance * emissionFactor * quantity);
    }, 0);
  }, 0);
};

/**
 * Calculate cumulative emissions (total + embedded)
 * @param totalEmissions Total emissions in tonnes
 * @param embeddedEmissions Embedded emissions in tonnes
 * @returns Cumulative emissions in tonnes
 */
export const calculateCumulativeEmissions = (totalEmissions: number, embeddedEmissions: number): number => {
  return totalEmissions + embeddedEmissions;
};

/**
 * Calculate emissions from emission installation data (B_EmInst worksheet)
 * @param emissionInstallationData Array of emission installation data
 * @returns Object with total emissions and emissions by source
 */
export const calculateEmissionInstallationData = (
  emissionInstallationData: CBAMData['emissionInstallationData']
): { totalEmissions: number; emissionsBySource: Array<{ sourceId: string; sourceName: string; emissions: number }> } => {
  const result = {
    totalEmissions: 0,
    emissionsBySource: [] as Array<{ sourceId: string; sourceName: string; emissions: number }>
  };

  if (!emissionInstallationData || !emissionInstallationData.emissions || emissionInstallationData.emissions.length === 0) {
    return result;
  }

  emissionInstallationData.emissions.forEach(source => {
    // Prefer explicitly stored CO2 emissions; otherwise compute from available inputs
    let co2Emissions: number;
    if (typeof source.co2Emissions === 'number') {
      co2Emissions = source.co2Emissions;
    } else {
      const activityLevel = source.activityLevel || 0;
      const emissionFactor = source.emissionFactor || 0;
      if (emissionFactor && emissionFactor > 0) {
        co2Emissions = activityLevel * emissionFactor;
      } else {
        const ncv = (source as any).calorificValue || 0; // GJ/unit
        const carbonContent = (source as any).carbonContent || 0; // tC/GJ or similar
        const oxidationFactor = typeof (source as any).oxidationFactor === 'number' ? (source as any).oxidationFactor : 1;
        const conversionFactor = typeof (source as any).conversionFactor === 'number' ? (source as any).conversionFactor : 3.667; // 44/12
        let computed = activityLevel * ncv * carbonContent * oxidationFactor * conversionFactor;
        const biomassFraction = source.biomassFraction || 0;
        if (biomassFraction && biomassFraction > 0) {
          const frac = Math.min(Math.max(biomassFraction, 0), 100) / 100;
          computed = computed * (1 - frac);
        }
        co2Emissions = computed;
      }
    }

    // Calculate CH4 and N2O emissions using GWP factors
    const ch4Emissions = (source.ch4Emissions || 0) * (DEFAULT_CONSTANTS.GWP_CH4 || 28);
    const n2oEmissions = (source.n2oEmissions || 0) * (DEFAULT_CONSTANTS.GWP_N2O || 265);

    // Note: otherGwpEmissions is not available in EmissionInstallationData
    const otherGwpEmissions = 0;

    const sourceEmissions = co2Emissions + ch4Emissions + n2oEmissions + otherGwpEmissions;

    // Add to total
    result.totalEmissions += sourceEmissions;

    // Add to emissions by source
    result.emissionsBySource.push({
      sourceId: source.emissionSourceId || '',
      sourceName: source.emissionSourceName || '',
      emissions: sourceEmissions
    });
  });

  return result;
};

/**
 * Calculate all CBAM emissions and metrics
 * @param data CBAM data object
 * @returns Calculation results object
 */
export const calculateCBAMEmissions = (data: CBAMData): CalculationResults => {
  // Get custom emission factors if available
  const emissionFactors = data.emissionFactors || [];
  
  // Calculate direct CO2 emissions
  const totalDirectCO2Emissions = calculateTotalDirectCO2Emissions(data.energyFuelData, emissionFactors);
  
  // Calculate direct emissions by gas type
  const directEmissionsByGasType = calculateDirectEmissionsByGasType(data.energyFuelData, emissionFactors);
  
  // Calculate biogenic CO2 emissions
  const biogenicCO2Emissions = calculateBiogenicCO2Emissions(data.energyFuelData, emissionFactors);
  
  // Calculate process emissions
  const totalProcessEmissions = calculateTotalProcessEmissions(data.processProductionData, emissionFactors);
  
  // Calculate process emissions by gas type
  const processEmissionsByGasType = calculateProcessEmissionsByGasType(data.processProductionData, emissionFactors);
  
  // Calculate emissions from emission installation data
  const emissionInstallationResults = calculateEmissionInstallationData(data.emissionInstallationData);
  const emissionInstallationEmissions = emissionInstallationResults.totalEmissions;
  
  // Calculate total emissions (direct + process + installation + indirect)
  const totalEmissions = calculateTotalEmissions(totalDirectCO2Emissions, totalProcessEmissions)
    + emissionInstallationEmissions
    + (data.emissionInstallationData?.totalIndirectCO2Emissions || 0);
  
  // Calculate total production
  const totalProduction = data.processProductionData.reduce((total, process) => {
    return total + (process.productionAmount ?? process.productionQuantity ?? 0);
  }, 0);
  
  // Calculate specific emissions
  const specificEmissions = calculateSpecificEmissions(totalEmissions, totalProduction);
  
  // Calculate total energy
  const totalEnergy = calculateTotalEnergy(data.energyFuelData);
  
  // Calculate renewable share
  const renewableShare = calculateRenewableShare(data.energyFuelData);
  
  // Calculate imported raw material share
  const importedRawMaterialShare = calculateImportedRawMaterialShare(data.processProductionData);
  
  // Calculate imported raw material share by country
  const importedRawMaterialShareByCountry = calculateImportedRawMaterialShareByCountry(data.processProductionData);
  
  // Calculate imported raw material share by material type
  const importedRawMaterialShareByMaterial = calculateImportedRawMaterialShareByMaterial(data.processProductionData);
  
  // Calculate embedded emissions
  const embeddedEmissions = calculateEmbeddedEmissions(data.processProductionData, emissionFactors);
  
  // Calculate embedded emissions by gas type
  const embeddedEmissionsByGasType = calculateEmbeddedEmissionsByGasType(data.processProductionData, emissionFactors);
  
  // Calculate imported material embedded emissions
  const importedMaterialEmbeddedEmissions = calculateImportedMaterialEmbeddedEmissions(data.processProductionData, emissionFactors);
  
  // Calculate purchased precursors embedded emissions
  const purchasedPrecursorsEmbeddedEmissions = calculatePurchasedPrecursorsEmbeddedEmissions(data.purchasedPrecursors, emissionFactors);
  
  // Calculate transport emissions for imported materials
  const transportEmissions = calculateTransportEmissions(data.processProductionData, emissionFactors);
  
  // Calculate cumulative emissions (including purchased precursors)
  const totalEmbeddedEmissions = embeddedEmissions + purchasedPrecursorsEmbeddedEmissions;
  const cumulativeEmissions = calculateCumulativeEmissions(totalEmissions, totalEmbeddedEmissions);
  
  return {
    totalDirectCO2Emissions,
    totalProcessEmissions,
    totalEmissions,
    specificEmissions,
    totalEnergy,
    renewableShare,
    importedRawMaterialShare,
    embeddedEmissions,
    purchasedPrecursorsEmbeddedEmissions,
    cumulativeEmissions,
    directEmissionsByGasType,
    biogenicCO2Emissions,
    processEmissionsByGasType,
    importedRawMaterialShareByCountry,
    importedRawMaterialShareByMaterial,
    embeddedEmissionsByGasType,
    importedMaterialEmbeddedEmissions,
    transportEmissions
  };
};

/**
 * Calculate comprehensive CBAM emissions report matching Excel template
 * @param data CBAM data object
 * @returns Comprehensive CBAM emissions calculation result
 */
export const calculateComprehensiveCBAMEmissions = (data: CBAMData): any => {
  // Get custom emission factors if available
  const emissionFactors = data.emissionFactors || [];
  
  // Calculate direct emissions from fuel consumption
  const directEmissions = calculateTotalDirectCO2Emissions(data.energyFuelData, emissionFactors);
  
  // Calculate direct emissions by gas type
  const directEmissionsByGasType = calculateDirectEmissionsByGasType(data.energyFuelData, emissionFactors);
  
  // Calculate biogenic CO2 emissions
  const biogenicCO2Emissions = calculateBiogenicCO2Emissions(data.energyFuelData, emissionFactors);
  
  // Calculate process emissions
  const processEmissions = calculateTotalProcessEmissions(data.processProductionData, emissionFactors);
  
  // Calculate process emissions by gas type
  const processEmissionsByGasType = calculateProcessEmissionsByGasType(data.processProductionData, emissionFactors);
  
  // Calculate total emissions (direct + process)
  const totalEmissions = calculateTotalEmissions(directEmissions, processEmissions);
  
  // Calculate embedded emissions from input materials
  const embeddedEmissions = calculateEmbeddedEmissions(data.processProductionData, emissionFactors);
  
  // Calculate embedded emissions by gas type
  const embeddedEmissionsByGasType = calculateEmbeddedEmissionsByGasType(data.processProductionData, emissionFactors);
  
  // Calculate imported material embedded emissions
  const importedMaterialEmbeddedEmissions = calculateImportedMaterialEmbeddedEmissions(data.processProductionData, emissionFactors);
  
  // Calculate transport emissions for imported materials
  const transportEmissions = calculateTransportEmissions(data.processProductionData, emissionFactors);
  
  // Calculate cumulative emissions (total + embedded)
  const cumulativeEmissions = calculateCumulativeEmissions(totalEmissions, embeddedEmissions);
  
  // Calculate imported raw material share
  const importedRawMaterialShare = calculateImportedRawMaterialShare(data.processProductionData);
  
  // Calculate imported raw material share by country
  const importedRawMaterialShareByCountry = calculateImportedRawMaterialShareByCountry(data.processProductionData);
  
  // Calculate imported raw material share by material type
  const importedRawMaterialShareByMaterial = calculateImportedRawMaterialShareByMaterial(data.processProductionData);
  
  // Calculate total emissions by gas type (direct + process + embedded)
  const totalEmissionsByGasType = {
    co2: directEmissionsByGasType.co2 + processEmissionsByGasType.co2 + embeddedEmissionsByGasType.co2,
    ch4: directEmissionsByGasType.ch4 + processEmissionsByGasType.ch4 + embeddedEmissionsByGasType.ch4,
    n2o: directEmissionsByGasType.n2o + processEmissionsByGasType.n2o + embeddedEmissionsByGasType.n2o,
    otherGwp: directEmissionsByGasType.otherGwp + processEmissionsByGasType.otherGwp + embeddedEmissionsByGasType.otherGwp,
    total: 0
  };
  
  // Calculate total emissions by gas type
  totalEmissionsByGasType.total = totalEmissionsByGasType.co2 + totalEmissionsByGasType.ch4 + 
                                totalEmissionsByGasType.n2o + totalEmissionsByGasType.otherGwp;
  
  // Calculate CBAM reportable emissions by gas type
  const cbamReportableEmissionsByGasType = {
    co2: totalEmissionsByGasType.co2 * importedRawMaterialShare,
    ch4: totalEmissionsByGasType.ch4 * importedRawMaterialShare,
    n2o: totalEmissionsByGasType.n2o * importedRawMaterialShare,
    otherGwp: totalEmissionsByGasType.otherGwp * importedRawMaterialShare,
    total: totalEmissionsByGasType.total * importedRawMaterialShare
  };
  
  // Calculate total production
  const totalProduction = data.processProductionData.reduce((total, process) => {
    return total + (process.productionAmount ?? process.productionQuantity ?? 0);
  }, 0);
  
  return {
    // Direct emissions
    directEmissions,
    directEmissionsByGasType,
    biogenicCO2Emissions,
    
    // Process emissions
    processEmissions,
    processEmissionsByGasType,
    
    // Total emissions
    totalEmissions,
    
    // Embedded emissions
    embeddedEmissions,
    embeddedEmissionsByGasType,
    importedMaterialEmbeddedEmissions,
    transportEmissions,
    
    // Cumulative emissions
    cumulativeEmissions,
    totalEmissionsByGasType,
    
    // Imported material analysis
    importedRawMaterialShare,
    importedRawMaterialShareByCountry,
    importedRawMaterialShareByMaterial,
    
    // CBAM reportable emissions
    cbamReportableEmissions: cumulativeEmissions * importedRawMaterialShare,
    cbamReportableEmissionsByGasType,
    
    // Additional metrics
    netCO2Emissions: totalEmissionsByGasType.co2 - biogenicCO2Emissions,
    netCO2EmissionsReportable: (totalEmissionsByGasType.co2 - biogenicCO2Emissions) * importedRawMaterialShare,
    
    // Production data
    totalProduction,
    
    // Emission intensity (emissions per unit of production)
    emissionIntensity: totalEmissions / Math.max(1, totalProduction),
    
    // CBAM reportable emission intensity
    cbamReportableEmissionIntensity: (cumulativeEmissions * importedRawMaterialShare) / Math.max(1, totalProduction)
  };
};

/**
 * Get default emission factor for a fuel type
 * @param fuelType Type of fuel
 * @returns Default emission factor (tCO2/MWh)
 */
export const getDefaultFuelEmissionFactor = (fuelType: string): number => {
  return DEFAULT_FUEL_EMISSION_FACTORS[fuelType] || DEFAULT_FUEL_EMISSION_FACTORS['Other'];
};

/**
 * Get default emission factor for a process type
 * @param processType Type of process
 * @returns Default emission factor (tCO2/t product)
 */
export const getDefaultProcessEmissionFactor = (processType: string): number => {
  return DEFAULT_PROCESS_EMISSION_FACTORS[processType] || DEFAULT_PROCESS_EMISSION_FACTORS['Other'];
};

/**
 * Get default embedded emission factor for a material
 * @param materialName Name of material
 * @returns Default embedded emission factor (tCO2/t material)
 */
export const getDefaultEmbeddedEmissionFactor = (materialName: string): number => {
  return DEFAULT_EMBEDDED_EMISSION_FACTORS[materialName] || DEFAULT_CONSTANTS.defaultEmbeddedEmissionFactor;
};

/**
 * Validate CBAM data for calculation
 * @param data CBAM data object
 * @returns Comprehensive validation result with errors, warnings, and information
 */
export const validateCBAMData = (data: CBAMData): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[];
  info: string[];
  fieldErrors: { field: string; message: string }[];
  summary: { totalFields: number; validFields: number; errorFields: number; warningFields: number };
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const info: string[] = [];
  const fieldErrors: { field: string; message: string }[] = [];
  let totalFields = 0;
  let validFields = 0;
  let errorFields = 0;
  let warningFields = 0;
  
  // Helper function to add field error
  const addFieldError = (field: string, message: string) => {
    fieldErrors.push({ field, message });
    errors.push(`${field}: ${message}`);
    errorFields++;
  };
  
  // Helper function to add field warning
  const addFieldWarning = (field: string, message: string) => {
    warnings.push(`${field}: ${message}`);
    warningFields++;
  };
  
  // Helper function to validate numeric value
  const validateNumeric = (value: any, fieldName: string, options: { min?: number; max?: number; required?: boolean } = {}) => {
    totalFields++;
    const { min, max, required = false } = options;
    
    if (value === undefined || value === null || value === '') {
      if (required) {
        addFieldError(fieldName, 'This field is required');
        return false;
      }
      return true; // Optional field
    }
    
    const numValue = Number(value);
    if (isNaN(numValue)) {
      addFieldError(fieldName, 'Must be a valid number');
      return false;
    }
    
    if (min !== undefined && numValue < min) {
      addFieldError(fieldName, `Must be at least ${min}`);
      return false;
    }
    
    if (max !== undefined && numValue > max) {
      addFieldError(fieldName, `Must be at most ${max}`);
      return false;
    }
    
    validFields++;
    return true;
  };
  
  // Helper function to validate string value
  const validateString = (value: any, fieldName: string, options: { minLength?: number; maxLength?: number; required?: boolean; pattern?: RegExp } = {}) => {
    totalFields++;
    const { minLength, maxLength, required = false, pattern } = options;
    
    if (value === undefined || value === null || value === '') {
      if (required) {
        addFieldError(fieldName, 'This field is required');
        return false;
      }
      return true; // Optional field
    }
    
    const strValue = String(value).trim();
    
    if (minLength !== undefined && strValue.length < minLength) {
      addFieldError(fieldName, `Must be at least ${minLength} characters`);
      return false;
    }
    
    if (maxLength !== undefined && strValue.length > maxLength) {
      addFieldError(fieldName, `Must be at most ${maxLength} characters`);
      return false;
    }
    
    if (pattern && !pattern.test(strValue)) {
      addFieldError(fieldName, 'Invalid format');
      return false;
    }
    
    validFields++;
    return true;
  };
  
  // Validate company information
  validateString(data.companyInfo.companyName, 'companyInfo.companyName', { required: true, minLength: 2 });
  validateString(data.companyInfo.companyAddress, 'companyInfo.companyAddress', { required: true, minLength: 5 });
  validateString(data.companyInfo.companyVAT, 'companyInfo.companyVAT', { pattern: /^[A-Za-z]{2}[0-9A-Za-z]{2,}$/ });
  
  // Validate report configuration
  validateString(data.reportConfig.installationId, 'reportConfig.installationId', { required: true, minLength: 1 });
  validateString(data.reportConfig.reportingPeriod, 'reportConfig.reportingPeriod', { required: true, pattern: /^[A-Za-z0-9-]+$/ });
  
  // Validate installation details
  validateString(data.installationDetails.mainActivity, 'installationDetails.mainActivity', { required: true });
  validateString(data.reportConfig.installationName, 'reportConfig.installationName', { required: true });
  validateString(data.reportConfig.installationAddress, 'reportConfig.installationAddress', { required: true });
  validateString(data.reportConfig.installationCountry, 'reportConfig.installationCountry', { required: true, minLength: 2, maxLength: 2 });
  
  // Validate energy/fuel data
  if (data.energyFuelData.length === 0) {
    addFieldWarning('energyFuelData', 'No energy or fuel data provided');
  } else {
    data.energyFuelData.forEach((fuel, index) => {
      const prefix = `energyFuelData[${index}]`;
      
      validateString(fuel.fuelType, `${prefix}.fuelType`, { required: true });
      validateNumeric(fuel.consumption, `${prefix}.consumption`, { required: true, min: 0 });
      validateString(fuel.unit, `${prefix}.unit`, { required: true });
      
      // Validate emission factors
      validateNumeric(fuel.co2EmissionFactor, `${prefix}.co2EmissionFactor`, { min: 0 });
      validateNumeric(fuel.ch4EmissionFactor, `${prefix}.ch4EmissionFactor`, { min: 0 });
      validateNumeric(fuel.n2oEmissionFactor, `${prefix}.n2oEmissionFactor`, { min: 0 });
      validateNumeric(fuel.otherGwpEmissionFactor, `${prefix}.otherGwpEmissionFactor`, { min: 0 });
      
      // Validate biomass share (percentage)
      validateNumeric(fuel.biomassShare, `${prefix}.biomassShare`, { min: 0, max: 1 });
      
      // Validate renewable share (percentage)
      validateNumeric(fuel.renewableShare, `${prefix}.renewableShare`, { min: 0, max: 1 });
      
      // Check if at least one emission factor is provided
      if (!fuel.co2EmissionFactor && !fuel.ch4EmissionFactor && !fuel.n2oEmissionFactor && !fuel.otherGwpEmissionFactor) {
        addFieldWarning(`${prefix}`, 'No emission factors provided for any greenhouse gas');
      }
      
      // Check for Excel-specific validation rules
      if (fuel.unit && fuel.unit.toLowerCase() === 'mwh' && fuel.consumption > 1000000) {
        addFieldWarning(`${prefix}.consumption`, 'Large consumption value (>1,000,000 MWh) - please verify');
      }
      
      // Check if fuel type matches Excel template values
      const validFuelTypes = Object.keys(DEFAULT_FUEL_EMISSION_FACTORS);
      if (fuel.fuelType && !validFuelTypes.includes(fuel.fuelType)) {
        addFieldWarning(`${prefix}.fuelType`, `Fuel type not in standard list (${validFuelTypes.join(', ')})`);
      }
    });
  }
  
  // Validate process/production data
  if (data.processProductionData.length === 0) {
    addFieldWarning('processProductionData', 'No process or production data provided');
  } else {
    data.processProductionData.forEach((process, index) => {
      const prefix = `processProductionData[${index}]`;
      
      validateString(process.processName, `${prefix}.processName`, { required: true });
      validateString(process.processType, `${prefix}.processType`, { required: true });
      validateNumeric(process.productionAmount, `${prefix}.productionAmount`, { min: 0 });
      validateNumeric(process.productionQuantity, `${prefix}.productionQuantity`, { min: 0 });
      validateString(process.unit, `${prefix}.unit`, { required: true });
      
      // Validate emission factors
      validateNumeric(process.processEmissionFactor, `${prefix}.processEmissionFactor`, { min: 0 });
      validateNumeric(process.co2EmissionFactor, `${prefix}.co2EmissionFactor`, { min: 0 });
      validateNumeric(process.ch4EmissionFactor, `${prefix}.ch4EmissionFactor`, { min: 0 });
      validateNumeric(process.n2oEmissionFactor, `${prefix}.n2oEmissionFactor`, { min: 0 });
      validateNumeric(process.otherGwpEmissionFactor, `${prefix}.otherGwpEmissionFactor`, { min: 0 });
      
      // Check if either productionAmount or productionQuantity is provided
      if (!process.productionAmount && !process.productionQuantity) {
        addFieldError(`${prefix}`, 'Either production amount or quantity must be provided');
      }
      
      // Validate input materials
      if (process.inputs.length === 0) {
        addFieldWarning(`${prefix}.inputs`, 'No input materials specified');
      } else {
        process.inputs.forEach((input, inputIndex) => {
          const inputPrefix = `${prefix}.inputs[${inputIndex}]`;
          
          validateString(input.materialName, `${inputPrefix}.materialName`, { required: true, minLength: 1 });
          validateNumeric(input.amount, `${inputPrefix}.amount`, { min: 0 });
          validateNumeric(input.quantity, `${inputPrefix}.quantity`, { min: 0 });
          validateString(input.unit, `${inputPrefix}.unit`, { required: true });
          
          // Check if either amount or quantity is provided
          if (!input.amount && !input.quantity) {
            addFieldError(`${inputPrefix}`, 'Either amount or quantity must be provided');
          }
          
          // Validate imported material data
          if (input.isImported) {
            validateString(input.countryOfOrigin, `${inputPrefix}.countryOfOrigin`, { minLength: 2, maxLength: 2 });
            validateString(input.originCountry, `${inputPrefix}.originCountry`, { minLength: 2, maxLength: 2 });
            
            if (!input.countryOfOrigin && !input.originCountry) {
              addFieldWarning(`${inputPrefix}`, 'Imported material but no country of origin specified');
            }
            
            // Validate transport data
            validateNumeric(input.transportDistance, `${inputPrefix}.transportDistance`, { min: 0 });
            validateString(input.transportMode, `${inputPrefix}.transportMode`);
            
            if (input.transportDistance && !input.transportMode) {
              addFieldWarning(`${inputPrefix}`, 'Transport distance provided but no transport mode specified');
            }
          }
          
          // Validate embedded emissions data
          validateNumeric(input.embeddedEmissions, `${inputPrefix}.embeddedEmissions`, { min: 0 });
          
          if (!input.embeddedEmissions) {
            addFieldWarning(`${inputPrefix}`, 'No embedded emissions provided');
          }
        });
      }
      
      // Check if process type matches Excel template values
      const validProcessTypes = Object.keys(DEFAULT_PROCESS_EMISSION_FACTORS);
      if (process.processType && !validProcessTypes.includes(process.processType)) {
        addFieldWarning(`${prefix}.processType`, `Process type not in standard list (${validProcessTypes.join(', ')})`);
      }
    });
  }
  
  // Add informational messages
  if (errors.length === 0 && warnings.length === 0) {
    info.push('All data validation checks passed');
  }
  
  // Calculate summary
  const summary = { totalFields, validFields, errorFields, warningFields };
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info,
    fieldErrors,
    summary
  };
};

/**
 * Validate CBAM data for Excel export
 * @param data CBAM data object
 * @returns Validation result specific to Excel export requirements
 */
export const validateForExcelExport = (data: CBAMData): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for required fields for Excel export
  if (!data.companyInfo.companyName) errors.push('Company name is required for Excel export');
  if (!data.reportConfig.installationId) errors.push('Installation ID is required for Excel export');
  if (!data.reportConfig.reportingPeriod) errors.push('Reporting period is required for Excel export');
  
  // Check for data completeness
  if (data.energyFuelData.length === 0) warnings.push('No energy/fuel data available for export');
  if (data.processProductionData.length === 0) warnings.push('No process/production data available for export');
  
  // Check for Excel-specific requirements
  data.processProductionData.forEach((process, index) => {
    if (!process.processName) errors.push(`Process ${index + 1}: Process name is required for Excel export`);
    if (!process.unit) errors.push(`Process ${index + 1}: Unit is required for Excel export`);
    
    process.inputs.forEach((input, inputIndex) => {
      if (!input.materialName) errors.push(`Process ${index + 1}, Input ${inputIndex + 1}: Material name is required for Excel export`);
      if (!input.amount && !input.quantity) errors.push(`Process ${index + 1}, Input ${inputIndex + 1}: Amount/quantity is required for Excel export`);
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate calculation results against Excel template expectations
 * @param results CBAM emissions calculation result
 * @returns Validation result for calculation results
 */
export const validateCalculationResults = (results: CalculationResults): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check for negative values where they shouldn't be
  if (results.totalDirectCO2Emissions < 0) errors.push('Direct emissions cannot be negative');
  if (results.totalProcessEmissions < 0) errors.push('Process emissions cannot be negative');
  if (results.embeddedEmissions < 0) errors.push('Embedded emissions cannot be negative');
  if (results.cumulativeEmissions < 0) errors.push('Cumulative emissions cannot be negative');
  
  // Check for logical consistency (allow indirect/installation in total)
  if (results.totalDirectCO2Emissions + results.totalProcessEmissions > results.totalEmissions + 0.01) {
    warnings.push('Total emissions should be at least direct + process emissions');
  }
  
  if (results.totalEmissions < results.embeddedEmissions) {
    warnings.push('Total emissions should be greater than or equal to embedded emissions');
  }
  
  if (results.cumulativeEmissions < results.totalEmissions) {
    warnings.push('Cumulative emissions should be greater than or equal to total emissions');
  }
  
  // Check for reasonable values
  if (results.importedRawMaterialShare < 0 || results.importedRawMaterialShare > 1) {
    errors.push('Imported raw material share must be between 0 and 1');
  }
  
  if (results.totalEmissions < 0) {
    errors.push('Total emissions cannot be negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Export CBAM data to Excel format
 * @param data CBAM data object
 * @param results Calculation results
 * @returns Blob representing the Excel file
 */
export const exportToExcel = (data: CBAMData, results: CalculationResults): Blob => {
  // This would typically use a library like xlsx or exceljs
  // For now, we'll return a placeholder
  const csvContent = `CBAM Declaration Results\n` +
    `Company Name,${data.companyInfo.companyName}\n` +
    `Installation ID,${data.reportConfig.installationId}\n` +
    `Reporting Period,${data.reportConfig.reportingPeriod}\n` +
    `\nEmissions Summary\n` +
    `Total Direct CO2 Emissions,${results.totalDirectCO2Emissions}\n` +
    `Total Process Emissions,${results.totalProcessEmissions}\n` +
    `Total Emissions,${results.totalEmissions}\n` +
    `Specific Emissions,${results.specificEmissions}\n` +
    `Total Energy,${results.totalEnergy}\n` +
    `Renewable Share,${results.renewableShare * 100}%\n` +
    `Imported Raw Material Share,${results.importedRawMaterialShare * 100}%\n` +
    `Embedded Emissions,${results.embeddedEmissions}\n` +
    `Cumulative Emissions,${results.cumulativeEmissions}`;
  
  return new Blob([csvContent], { type: 'text/csv' });
};

/**
 * Export CBAM data to PDF format
 * @param data CBAM data object
 * @param results Calculation results
 * @returns Blob representing the PDF file
 */
export const exportToPDF = (data: CBAMData, results: CalculationResults): Blob => {
  // This would typically use a library like jsPDF or react-pdf
  // For now, we'll return a placeholder
  const pdfContent = `CBAM Declaration Results\n\n` +
    `Company Name: ${data.companyInfo.companyName}\n` +
    `Installation ID: ${data.reportConfig.installationId}\n` +
    `Reporting Period: ${data.reportConfig.reportingPeriod}\n\n` +
    `Emissions Summary\n` +
    `Total Direct CO2 Emissions: ${results.totalDirectCO2Emissions}\n` +
    `Total Process Emissions: ${results.totalProcessEmissions}\n` +
    `Total Emissions: ${results.totalEmissions}\n` +
    `Specific Emissions: ${results.specificEmissions}\n` +
    `Total Energy: ${results.totalEnergy}\n` +
    `Renewable Share: ${results.renewableShare * 100}%\n` +
    `Imported Raw Material Share: ${results.importedRawMaterialShare * 100}%\n` +
    `Embedded Emissions: ${results.embeddedEmissions}\n` +
    `Cumulative Emissions: ${results.cumulativeEmissions}`;
  
  return new Blob([pdfContent], { type: 'text/plain' });
};

/**
 * Export CBAM data to CSV format
 * @param data CBAM data object
 * @param results Calculation results
 * @returns Blob representing the CSV file
 */
export const exportToCSV = (data: CBAMData, results: CalculationResults): Blob => {
  // Create CSV content
  const csvContent = `Category,Value\n` +
    `Company Name,${data.companyInfo.companyName}\n` +
    `Installation ID,${data.reportConfig.installationId}\n` +
    `Reporting Period,${data.reportConfig.reportingPeriod}\n` +
    `Total Direct CO2 Emissions,${results.totalDirectCO2Emissions}\n` +
    `Total Process Emissions,${results.totalProcessEmissions}\n` +
    `Total Emissions,${results.totalEmissions}\n` +
    `Specific Emissions,${results.specificEmissions}\n` +
    `Total Energy,${results.totalEnergy}\n` +
    `Renewable Share,${results.renewableShare}\n` +
    `Imported Raw Material Share,${results.importedRawMaterialShare}\n` +
    `Embedded Emissions,${results.embeddedEmissions}\n` +
    `Cumulative Emissions,${results.cumulativeEmissions}`;
  
  return new Blob([csvContent], { type: 'text/csv' });
};

/**
 * Export all calculation functions for easy importing
 */
export const CBAMCalculations = {
  calculateTotalDirectCO2Emissions,
  calculateDirectEmissionsByGasType,
  calculateBiogenicCO2Emissions,
  calculateTotalProcessEmissions,
  calculateProcessEmissionsByGasType,
  calculateTotalEmissions,
  calculateEmbeddedEmissions,
  calculateEmbeddedEmissionsByGasType,
  calculateImportedMaterialEmbeddedEmissions,
  calculateTransportEmissions,
  calculateCumulativeEmissions,
  calculateImportedRawMaterialShare,
  calculateImportedRawMaterialShareByCountry,
  calculateImportedRawMaterialShareByMaterial,
  calculateCBAMEmissions,
  calculateComprehensiveCBAMEmissions,
  validateCBAMData,
  exportToExcel,
  exportToPDF,
  exportToCSV,
  getDefaultFuelEmissionFactor,
  getDefaultProcessEmissionFactor,
  getDefaultEmbeddedEmissionFactor
};

const calculationEngine = {
  calculateCBAMEmissions,
  calculateComprehensiveCBAMEmissions,
  validateCBAMData,
  exportToExcel,
  exportToPDF,
  exportToCSV,
  getDefaultFuelEmissionFactor,
  getDefaultProcessEmissionFactor,
  getDefaultEmbeddedEmissionFactor,
  CBAMCalculations
};

export default calculationEngine;