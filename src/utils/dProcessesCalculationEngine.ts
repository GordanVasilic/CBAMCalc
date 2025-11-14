/**
 * D_Processes Calculation Engine
 * Implements Excel formulas and calculations for production processes
 */

import {
  ProductionProcess,
  DProcessesData,
  ProcessEmissionResults
} from '../types/DProcessesTypes';

// Excel formula conversions for D_Processes calculations
export function calculateDirectEmissions(process: ProductionProcess) {
  if (!process.directlyAttributableEmissions.applicable) {
    return process.directlyAttributableEmissions;
  }

  const amount = process.amounts;
  const emissionFactor = process.directlyAttributableEmissions.amount > 0 
    ? process.directlyAttributableEmissions.amount / amount 
    : 0;

  return {
    ...process.directlyAttributableEmissions,
    amount: amount * emissionFactor,
    unit: 'tCO2e'
  };
}

export function calculateMeasurableHeatEmissions(heatData: any): number {
  if (!heatData.applicable || heatData.netAmount === 0) {
    return 0;
  }
  const netHeat = heatData.imported - heatData.exported;
  return netHeat * heatData.emissionFactor;
}

export function calculateWasteGasEmissions(wasteGasData: any): number {
  if (!wasteGasData.applicable || wasteGasData.amount === 0) {
    return 0;
  }
  return wasteGasData.amount * wasteGasData.emissionFactor;
}

export function calculateIndirectEmissions(indirectData: any): number {
  if (!indirectData.applicable || indirectData.electricityConsumption === 0) {
    return 0;
  }
  return indirectData.electricityConsumption * indirectData.emissionFactor;
}

export function calculateElectricityExportCredit(exportData: any): number {
  if (!exportData.applicable || exportData.exportedAmount === 0) {
    return 0;
  }
  return exportData.exportedAmount * exportData.emissionFactor;
}

export function calculateProcessEmissions(process: ProductionProcess): ProcessEmissionResults {
  const directEmissions = calculateDirectEmissions(process);
  const heatEmissions = calculateMeasurableHeatEmissions(process.measurableHeat);
  const wasteGasEmissions = calculateWasteGasEmissions(process.wasteGases);
  const indirectEmissions = calculateIndirectEmissions(process.indirectEmissions);
  const electricityCredit = calculateElectricityExportCredit(process.electricityExported);
  
  const totalDirect = directEmissions.amount + heatEmissions + wasteGasEmissions;
  const totalIndirect = indirectEmissions;
  const netAttributed = totalDirect + totalIndirect - electricityCredit;
  
  // Specific embedded emissions (SEE) calculation
  const see = process.amounts > 0 ? netAttributed / process.amounts : 0;
  
  return {
    directEmissionsTotal: totalDirect,
    directEmissionsPerUnit: process.amounts > 0 ? totalDirect / process.amounts : 0,
    indirectEmissionsTotal: totalIndirect,
    indirectEmissionsPerUnit: process.amounts > 0 ? totalIndirect / process.amounts : 0,
    heatEmissionsTotal: heatEmissions,
    heatEmissionsPerUnit: process.amounts > 0 ? heatEmissions / process.amounts : 0,
    wasteGasEmissionsTotal: wasteGasEmissions,
    wasteGasEmissionsPerUnit: process.amounts > 0 ? wasteGasEmissions / process.amounts : 0,
    electricityExportCredit: electricityCredit,
    netAttributedEmissions: netAttributed,
    netAttributedEmissionsPerUnit: process.amounts > 0 ? netAttributed / process.amounts : 0,
    specificEmbeddedEmissions: see,
    uncertaintyPercentage: calculateUncertainty(process),
    confidenceInterval: calculateConfidenceInterval(process)
  };
}

export function calculateUncertainty(process: ProductionProcess): number {
  let uncertainty = 5; // Base uncertainty
  
  // Add uncertainty based on data sources
  if (process.directlyAttributableEmissions.dataSource === 'Default values') {
    uncertainty += 10;
  }
  
  if (process.indirectEmissions.emissionFactorSource === 'Default values') {
    uncertainty += 5;
  }
  
  // Add uncertainty based on calculation methods
  if (process.directlyAttributableEmissions.calculationMethod === 'Other (please specify)') {
    uncertainty += 3;
  }
  
  return Math.min(uncertainty, 50); // Cap at 50%
}

export function calculateConfidenceInterval(process: ProductionProcess): number[] {
  const uncertainty = calculateUncertainty(process);
  const emissions = calculateProcessEmissions(process);
  
  const margin = emissions.netAttributedEmissions * (uncertainty / 100);
  return [
    emissions.netAttributedEmissions - margin,
    emissions.netAttributedEmissions + margin
  ];
}

// Main calculation function for D_Processes
export function calculateDProcessesData(data: DProcessesData): DProcessesData {
  const updatedData = { ...data };
  
  // Calculate each production process
  updatedData.productionProcesses = data.productionProcesses.map(process => {
    const updatedProcess = { ...process };
    
    // Calculate emissions
    updatedProcess.calculatedEmissions = calculateProcessEmissions(process);
    
    return updatedProcess;
  });
  
  // Calculate summary data
  updatedData.processSummary = {
    totalProcesses: updatedData.productionProcesses.length,
    totalProduction: updatedData.productionProcesses.reduce((sum, p) => sum + p.amounts, 0),
    totalAttributedEmissions: updatedData.productionProcesses.reduce((sum, p) => sum + p.calculatedEmissions.netAttributedEmissions, 0),
    averageSEE: updatedData.productionProcesses.length > 0 
      ? updatedData.productionProcesses.reduce((sum, p) => sum + p.calculatedEmissions.specificEmbeddedEmissions, 0) / updatedData.productionProcesses.length
      : 0,
    processesWithCompleteData: 0, // Will be calculated in validation
    processesWithValidCalculations: updatedData.productionProcesses.length
  };
  
  return updatedData;
}