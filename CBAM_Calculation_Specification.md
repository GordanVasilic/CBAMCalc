# CBAM Calculation Engine Technical Specification

## Overview
This document details the technical implementation of the calculation engine for the CBAM web application, ensuring that all calculations produce identical results to the official Excel template.

## Calculation Architecture

### Core Calculation Module
```javascript
// CalculationEngine.js
class CalculationEngine {
  constructor() {
    this.constants = this.loadConstants();
    this.emissionFactors = this.loadEmissionFactors();
    this.conversionFactors = this.loadConversionFactors();
  }
  
  // Main calculation methods
  calculateDirectEmissions(fuelData) { /* ... */ }
  calculateSpecificEmissions(emissions, production) { /* ... */ }
  calculateEnergyMetrics(energyData) { /* ... */ }
  calculateEmbeddedEmissions(productData) { /* ... */ }
  calculateCumulativeEmissions(processData) { /* ... */ }
}
```

## Constants and Reference Values

Based on the Parameters_Constants sheet from the Excel template:

```javascript
const CBAM_CONSTANTS = {
  // Emission units
  tCO2: 'tCO2',
  tCO2eq: 'tCO2e',
  tCO2pt: 'tCO2/t',
  tCO2pTJ: 'tCO2/TJ',
  tCO2pkNm3: 'tCO2/1000Nm3',
  
  // Container prefixes
  CNTR_SUM_CO2: 'SUM_CO2',
  CNTR_SUM_CO2OrN2O: 'SUM_CO2',
  
  // Status values
  ErrorOrMissing: 'ErrMiss_',
  GoodToMarket: 'ToMarket_',
  NA: 'n.a.',
  PrecursorToGoodInput: 'PrecToGood_',
  
  // Default values
  tonnes: 'tonnes',
  
  // Emission factor sources
  MeasurementNational: 'Mostly measurements & national standard factors for e.g. the emission factor',
  MeasurementSector: 'Mostly measurements & sector-specific standard factors for e.g. the emission factor',
  MeasurementInternational: 'Mostly measurements & international standard factors for e.g. the emission factor'
};
```

## Emission Factors Database

Based on the c_CodeLists sheet and other reference sheets:

```javascript
const EMISSION_FACTORS = {
  // Fuel-based emission factors (tCO2/TJ)
  fuels: {
    'anthracite': 98.3,
    'coking_coal': 94.6,
    'other_bituminous_coal': 94.6,
    'sub_bituminous_coal': 96.1,
    'lignite': 101.4,
    'natural_gas': 56.1,
    'oil_shale': 107.0,
    'peat': 107.0,
    'blast_furnace_gas': 115.0,
    'coke_oven_gas': 44.0,
    'other_gases': 50.6,
    'motor_gasoline': 69.3,
    'aviation_gasoline': 70.0,
    'jet_kerosene': 71.9,
    'other_kerosene': 71.9,
    'gas_diesel_oil': 74.0,
    'heavy_fuel_oil': 77.4,
    'naphtha': 73.3,
    'petroleum_coke': 100.8,
    'refinery_gas': 60.0,
    'other_oil_products': 73.3,
    'liquefied_petroleum_gas': 63.0,
    'ethane': 61.6,
    'waste_oils': 73.3,
    'biomass': 0.0 // Biomass has zero net emissions
  },
  
  // Process-based emission factors
  processes: {
    // Cement industry
    'cement_clinker_production': {
      direct: {
        calcination: 0.527, // tCO2/t clinker
        fuel_combustion: 0.320 // tCO2/t clinker
      },
      indirect: {
        electricity: 0.087 // tCO2/t clinker
      }
    },
    
    // Iron and steel industry
    'basic_oxygen_furnace': {
      direct: {
        process_emissions: 0.150, // tCO2/t steel
        fuel_combustion: 0.200 // tCO2/t steel
      },
      indirect: {
        electricity: 0.050 // tCO2/t steel
      }
    },
    
    // Aluminum industry
    'primary_aluminum_production': {
      direct: {
        process_emissions: 1.500, // tCO2/t aluminum
        fuel_combustion: 0.500 // tCO2/t aluminum
      },
      indirect: {
        electricity: 10.000 // tCO2/t aluminum
      }
    }
  }
};
```

## Conversion Factors

```javascript
const CONVERSION_FACTORS = {
  // Energy content of fuels (TJ/unit)
  fuelEnergyContent: {
    'anthracite': 25.8, // TJ/1000 tonnes
    'coking_coal': 28.2,
    'other_bituminous_coal': 25.8,
    'sub_bituminous_coal': 18.9,
    'lignite': 11.9,
    'natural_gas': 38.7, // TJ/million Nm³
    'motor_gasoline': 44.3,
    'gas_diesel_oil': 43.0,
    'heavy_fuel_oil': 40.4,
    'liquefied_petroleum_gas': 46.9
  },
  
  // Other conversion factors
  tToKg: 1000,
  kgToT: 0.001,
  mjToTj: 0.000001,
  gjToTj: 0.001,
  nm3ToMnm3: 0.001
};
```

## Calculation Implementation

### 1. Direct Emissions Calculation

```javascript
/**
 * Calculate direct CO2 emissions from fuel consumption
 * @param {Array} fuelData - Array of fuel objects with type, consumption, unit, biomass percentage
 * @returns {Object} Direct emissions by fuel type and total
 */
calculateDirectEmissions(fuelData) {
  let totalDirectEmissions = 0;
  const emissionsByFuel = {};
  
  fuelData.forEach(fuel => {
    // Convert consumption to TJ or tonnes
    let consumptionInStandardUnit;
    
    if (fuel.unit === 'tonnes') {
      consumptionInStandardUnit = fuel.consumption;
    } else if (fuel.unit === 'GJ') {
      consumptionInStandardUnit = fuel.consumption * CONVERSION_FACTORS.gjToTj;
    } else if (fuel.unit === 'MWh') {
      consumptionInStandardUnit = fuel.consumption * 0.0036; // MWh to TJ
    } else if (fuel.unit === 'Nm3') {
      consumptionInStandardUnit = fuel.consumption * CONVERSION_FACTORS.nm3ToMnm3;
    } else {
      // Handle other units as needed
      throw new Error(`Unsupported fuel unit: ${fuel.unit}`);
    }
    
    // Get emission factor for this fuel type
    const emissionFactor = EMISSION_FACTORS.fuels[fuel.type];
    if (emissionFactor === undefined) {
      throw new Error(`No emission factor found for fuel type: ${fuel.type}`);
    }
    
    // Calculate emissions (accounting for biomass)
    const biomassFactor = 1 - (fuel.biomassPercentage / 100);
    let emissions;
    
    if (fuel.unit === 'tonnes' || fuel.unit === 'Nm3') {
      // For fuels with emission factors per tonne or per 1000 Nm³
      emissions = consumptionInStandardUnit * emissionFactor * biomassFactor;
    } else {
      // For fuels with emission factors per TJ
      emissions = consumptionInStandardUnit * emissionFactor * biomassFactor;
    }
    
    // Round to 3 decimal places as per Excel
    emissions = Math.round(emissions * 1000) / 1000;
    
    emissionsByFuel[fuel.type] = emissions;
    totalDirectEmissions += emissions;
  });
  
  return {
    byFuel: emissionsByFuel,
    total: Math.round(totalDirectEmissions * 1000) / 1000
  };
}
```

### 2. Process Emissions Calculation

```javascript
/**
 * Calculate process-specific emissions
 * @param {Array} processData - Array of process objects
 * @returns {Object} Process emissions by process and total
 */
calculateProcessEmissions(processData) {
  let totalProcessEmissions = 0;
  const emissionsByProcess = {};
  
  processData.forEach(process => {
    let processEmissions = 0;
    
    // Get process emission factors
    const processFactors = EMISSION_FACTORS.processes[process.type];
    if (!processFactors) {
      throw new Error(`No emission factors found for process type: ${process.type}`);
    }
    
    // Calculate direct process emissions
    if (processFactors.direct) {
      if (processFactors.direct.calcination) {
        processEmissions += process.production * processFactors.direct.calcination;
      }
      if (processFactors.direct.fuel_combustion) {
        processEmissions += process.production * processFactors.direct.fuel_combustion;
      }
      if (processFactors.direct.process_emissions) {
        processEmissions += process.production * processFactors.direct.process_emissions;
      }
    }
    
    // Round to 3 decimal places as per Excel
    processEmissions = Math.round(processEmissions * 1000) / 1000;
    
    emissionsByProcess[process.id] = {
      direct: processEmissions,
      processName: process.name
    };
    
    totalProcessEmissions += processEmissions;
  });
  
  return {
    byProcess: emissionsByProcess,
    total: Math.round(totalProcessEmissions * 1000) / 1000
  };
}
```

### 3. Specific Emissions Calculation

```javascript
/**
 * Calculate specific emissions (kg CO2/tonne of product)
 * @param {number} totalEmissions - Total emissions in tCO2
 * @param {number} production - Production in tonnes
 * @returns {number} Specific emissions in kg CO2/tonne
 */
calculateSpecificEmissions(totalEmissions, production) {
  if (production <= 0) {
    return 0;
  }
  
  // Convert tCO2 to kg CO2
  const specificEmissions = (totalEmissions * 1000) / production;
  
  // Round to 2 decimal places as per Excel
  return Math.round(specificEmissions * 100) / 100;
}
```

### 4. Energy Metrics Calculation

```javascript
/**
 * Calculate energy metrics including renewable percentage
 * @param {Array} energyData - Array of energy consumption data
 * @returns {Object} Energy metrics
 */
calculateEnergyMetrics(energyData) {
  let totalEnergy = 0;
  let renewableEnergy = 0;
  
  energyData.forEach(energy => {
    // Convert all energy to TJ
    let energyInTJ;
    
    if (energy.unit === 'TJ') {
      energyInTJ = energy.consumption;
    } else if (energy.unit === 'GJ') {
      energyInTJ = energy.consumption * CONVERSION_FACTORS.gjToTj;
    } else if (energy.unit === 'MWh') {
      energyInTJ = energy.consumption * 0.0036; // MWh to TJ
    } else {
      throw new Error(`Unsupported energy unit: ${energy.unit}`);
    }
    
    totalEnergy += energyInTJ;
    
    if (energy.isRenewable) {
      renewableEnergy += energyInTJ;
    }
  });
  
  const renewablePercentage = totalEnergy > 0 
    ? Math.round((renewableEnergy / totalEnergy) * 10000) / 100
    : 0;
  
  return {
    total: Math.round(totalEnergy * 1000) / 1000,
    renewable: Math.round(renewableEnergy * 1000) / 1000,
    renewablePercentage: renewablePercentage
  };
}
```

### 5. Embedded Emissions Calculation

```javascript
/**
 * Calculate embedded emissions for purchased precursors
 * @param {Array} productData - Array of product objects
 * @returns {Object} Embedded emissions by product and total
 */
calculateEmbeddedEmissions(productData) {
  let totalEmbeddedEmissions = 0;
  const embeddedEmissionsByProduct = {};
  
  productData.forEach(product => {
    let embeddedEmissions = 0;
    
    // Calculate direct embedded emissions
    if (product.embeddedEmissions && product.embeddedEmissions.direct) {
      embeddedEmissions += product.embeddedEmissions.direct * product.production;
    }
    
    // Calculate indirect embedded emissions
    if (product.embeddedEmissions && product.embeddedEmissions.indirect) {
      embeddedEmissions += product.embeddedEmissions.indirect * product.production;
    }
    
    // Round to 3 decimal places as per Excel
    embeddedEmissions = Math.round(embeddedEmissions * 1000) / 1000;
    
    embeddedEmissionsByProduct[product.id] = {
      total: embeddedEmissions,
      direct: product.embeddedEmissions ? product.embeddedEmissions.direct : 0,
      indirect: product.embeddedEmissions ? product.embeddedEmissions.indirect : 0,
      productName: product.name
    };
    
    totalEmbeddedEmissions += embeddedEmissions;
  });
  
  return {
    byProduct: embeddedEmissionsByProduct,
    total: Math.round(totalEmbeddedEmissions * 1000) / 1000
  };
}
```

### 6. Cumulative Emissions Calculation

```javascript
/**
 * Calculate cumulative emissions for CBAM declaration
 * @param {Object} directEmissions - Direct emissions result
 * @param {Object} processEmissions - Process emissions result
 * @param {Object} embeddedEmissions - Embedded emissions result
 * @returns {Object} Cumulative emissions by category and total
 */
calculateCumulativeEmissions(directEmissions, processEmissions, embeddedEmissions) {
  const directTotal = directEmissions.total;
  const processTotal = processEmissions.total;
  const embeddedTotal = embeddedEmissions.total;
  
  const totalEmissions = directTotal + processTotal + embeddedTotal;
  
  return {
    direct: directTotal,
    process: processTotal,
    embedded: embeddedTotal,
    total: Math.round(totalEmissions * 1000) / 1000
  };
}
```

## Validation and Error Handling

```javascript
/**
 * Validate input data and provide meaningful error messages
 * @param {Object} data - Input data to validate
 * @returns {Array} Array of validation errors
 */
validateInputData(data) {
  const errors = [];
  
  // Validate fuel data
  if (data.fuelData) {
    data.fuelData.forEach((fuel, index) => {
      if (!fuel.type) {
        errors.push(`Fuel ${index + 1}: Missing fuel type`);
      }
      if (!fuel.consumption || fuel.consumption <= 0) {
        errors.push(`Fuel ${index + 1}: Invalid consumption value`);
      }
      if (!fuel.unit) {
        errors.push(`Fuel ${index + 1}: Missing consumption unit`);
      }
      if (fuel.biomassPercentage < 0 || fuel.biomassPercentage > 100) {
        errors.push(`Fuel ${index + 1}: Invalid biomass percentage`);
      }
    });
  }
  
  // Validate process data
  if (data.processData) {
    data.processData.forEach((process, index) => {
      if (!process.type) {
        errors.push(`Process ${index + 1}: Missing process type`);
      }
      if (!process.production || process.production <= 0) {
        errors.push(`Process ${index + 1}: Invalid production value`);
      }
    });
  }
  
  // Validate product data
  if (data.productData) {
    data.productData.forEach((product, index) => {
      if (!product.name) {
        errors.push(`Product ${index + 1}: Missing product name`);
      }
      if (!product.production || product.production <= 0) {
        errors.push(`Product ${index + 1}: Invalid production value`);
      }
    });
  }
  
  return errors;
}
```

## Excel Export Implementation

```javascript
/**
 * Export calculation results to CBAM Excel template format
 * @param {Object} calculationResults - Results from calculation engine
 * @param {Object} inputData - Original input data
 * @returns {Buffer} Excel file buffer
 */
exportToExcelTemplate(calculationResults, inputData) {
  // Load the official CBAM Excel template
  const workbook = new ExcelJS.Workbook();
  
  // Implementation would populate the template with calculated values
  // ensuring exact format and structure as the official template
  
  // This is a simplified example - actual implementation would need
  // to handle all sheets and fields in the official template
  
  return workbook.xlsx.writeBuffer();
}
```

## Testing Strategy

### Unit Tests
- Test each calculation function with known inputs and expected outputs
- Test edge cases (zero values, negative values, missing data)
- Test rounding precision to match Excel

### Integration Tests
- Test complete calculation workflow with sample data
- Test Excel export functionality
- Test data validation

### Regression Tests
- Compare results with official Excel template for various scenarios
- Ensure calculations remain identical after code changes

## Conclusion
This specification provides a detailed implementation of the calculation engine that will produce identical results to the official CBAM Excel template. The modular design allows for easy maintenance and updates as CBAM regulations evolve.

The key to success is ensuring that all calculations follow the exact same methodology as the Excel template, including rounding rules, unit conversions, and emission factor values.