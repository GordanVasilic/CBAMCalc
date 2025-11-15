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
  const netHeat = (Number(heatData.netAmount || 0) + Number(heatData.imported || 0) - Number(heatData.exported || 0));
  const share = heatData.shareToCBAMGoods !== undefined ? Math.max(0, Math.min(100, Number(heatData.shareToCBAMGoods))) / 100 : 1;
  return Math.max(0, netHeat) * Number(heatData.emissionFactor || 0) * share;
}

export function calculateWasteGasEmissions(wasteGasData: any): number {
  if (!wasteGasData.applicable || wasteGasData.amount === 0) {
    return 0;
  }
  const netWg = (Number(wasteGasData.amount || 0) + Number(wasteGasData.imported || 0) - Number(wasteGasData.exported || 0));
  const reused = wasteGasData.reusedShare !== undefined ? Math.max(0, Math.min(100, Number(wasteGasData.reusedShare))) / 100 : 0;
  const effective = Math.max(0, netWg) * (1 - reused);
  return effective * Number(wasteGasData.emissionFactor || 0);
}

export function calculateIndirectEmissions(indirectData: any): number {
  if (!indirectData.applicable || indirectData.electricityConsumption === 0) {
    return 0;
  }
  const cons = Number(indirectData.electricityConsumption || 0);
  const unit = String(indirectData.electricityUnit || 'MWh');
  const ef = Number(indirectData.emissionFactor || 0);
  const efUnit = String(indirectData.emissionFactorUnit || 'tCO2/MWh');
  const consMWh = unit === 'kWh' ? cons / 1000 : unit === 'GJ' ? cons * 0.2777777778 : cons;
  const efPerMWh = efUnit === 'tCO2/kWh' ? ef * 1000 : efUnit === 'tCO2/GJ' ? ef * 3.6 : ef;
  return consMWh * efPerMWh;
}

export function calculateElectricityExportCredit(exportData: any): number {
  if (!exportData.applicable || exportData.exportedAmount === 0) {
    return 0;
  }
  const amt = Number(exportData.exportedAmount || 0);
  const unit = String(exportData.unit || 'MWh');
  const ef = Number(exportData.emissionFactor || 0);
  const efUnit = String(exportData.emissionFactorUnit || 'tCO2/MWh');
  const amtMWh = unit === 'kWh' ? amt / 1000 : unit === 'GJ' ? amt * 0.2777777778 : amt;
  const efPerMWh = efUnit === 'tCO2/kWh' ? ef * 1000 : efUnit === 'tCO2/GJ' ? ef * 3.6 : ef;
  return amtMWh * efPerMWh;
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