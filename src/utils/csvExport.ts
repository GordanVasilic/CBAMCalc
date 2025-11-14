import { CBAMData, CalculationResults } from '../types/CBAMData';

/**
 * CSV Export Utility
 * 
 * This module provides functionality to export CBAM data and results to CSV format.
 * It creates a structured CSV file with the CBAM declaration information.
 */

/**
 * Escape a value for CSV format
 * @param value The value to escape
 * @returns The escaped value
 */
const escapeCSVValue = (value: string): string => {
  // If the value contains a comma, newline, or quote, wrap it in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    // Escape any quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Export CBAM data and results to CSV format
 * @param data CBAM data object
 * @param results Calculation results
 * @returns Blob representing the CSV file
 */
export const exportToCSV = (data: CBAMData, results: CalculationResults): Blob => {
  // Create the content for the CSV file
  let content = '';
  
  // Add company information
  content += 'Company Information\n';
  content += `Name,${data.companyInfo.companyName}\n`;
  content += `Address,${data.companyInfo.companyAddress}\n`;
  content += `Contact Person,${data.companyInfo.companyContactPerson}\n`;
  content += `Phone,${data.companyInfo.companyPhone}\n`;
  content += `Email,${data.companyInfo.companyEmail}\n`;
  content += '\n';
  
  // Add report configuration
  content += 'Report Configuration\n';
  content += `Reporting Period,${data.reportConfig.reportingPeriod}\n`;
  content += `Installation ID,${data.reportConfig.installationId}\n`;
  content += `Installation Name,${data.reportConfig.installationName}\n`;
  content += `Country,${data.reportConfig.installationCountry}\n`;
  content += `Address,${data.reportConfig.installationAddress}\n`;
  content += '\n';
  
  // Add installation details
  content += 'Installation Details,Installation Type,' + escapeCSVValue(data.installationDetails.installationType) + '\n';
  content += 'Installation Details,Main Activity,' + escapeCSVValue(data.installationDetails.mainActivity) + '\n';
content += 'Installation Details,Economic Activity,' + escapeCSVValue(data.installationDetails.economicActivity ?? '') + '\n';
  content += 'Installation Details,CN Code,' + escapeCSVValue(data.installationDetails.cnCode) + '\n';
  content += 'Installation Details,Production Capacity,' + escapeCSVValue(String(data.installationDetails.productionCapacity)) + '\n';
  content += 'Installation Details,Annual Production,' + escapeCSVValue(String(data.installationDetails.annualProduction)) + '\n';
  content += 'Installation Details,Installation English Name,' + escapeCSVValue(data.installationDetails.installationEnglishName ?? '') + '\n';
  content += 'Installation Details,Street and Number,' + escapeCSVValue(data.installationDetails.streetAndNumber ?? '') + '\n';
  content += 'Installation Details,Postal Code,' + escapeCSVValue(data.installationDetails.postalCode ?? '') + '\n';
  content += 'Installation Details,PO Box,' + escapeCSVValue(data.installationDetails.poBox ?? '') + '\n';
  content += 'Installation Details,City,' + escapeCSVValue(data.installationDetails.city ?? '') + '\n';
  content += 'Installation Details,Country,' + escapeCSVValue(data.installationDetails.country ?? '') + '\n';
  content += 'Installation Details,UNLOCODE,' + escapeCSVValue(data.installationDetails.unlocode ?? '') + '\n';
  content += 'Installation Details,Latitude,' + escapeCSVValue(String(data.installationDetails.latitude ?? '')) + '\n';
  content += 'Installation Details,Longitude,' + escapeCSVValue(String(data.installationDetails.longitude ?? '')) + '\n';
  content += 'Installation Details,Authorized Representative Name,' + escapeCSVValue(data.installationDetails.authorizedRepresentativeName ?? '') + '\n';
  content += 'Installation Details,Authorized Representative Email,' + escapeCSVValue(data.installationDetails.authorizedRepresentativeEmail ?? '') + '\n';
  content += 'Installation Details,Authorized Representative Telephone,' + escapeCSVValue(data.installationDetails.authorizedRepresentativeTelephone ?? '') + '\n';
  content += '\n';
  content += 'Reporting Period Details\n';
  content += 'Start Date,' + escapeCSVValue(data.installationDetails.startDate ?? '') + '\n';
  content += 'End Date,' + escapeCSVValue(data.installationDetails.endDate ?? '') + '\n';
  content += '\n';
  content += 'Verifier Details\n';
  content += 'Verifier Company Name,' + escapeCSVValue(data.installationDetails.verifierCompanyName ?? '') + '\n';
content += 'Verifier Street and Number,' + escapeCSVValue(data.installationDetails.verifierStreetAndNumber ?? '') + '\n';
content += 'Verifier City,' + escapeCSVValue(data.installationDetails.verifierCity ?? '') + '\n';
  content += 'Verifier Postal Code,' + escapeCSVValue(data.installationDetails.verifierPostalCode ?? '') + '\n';
content += 'Verifier Country,' + escapeCSVValue(data.installationDetails.verifierCountry ?? '') + '\n';
  content += 'Verifier Authorized Representative,' + escapeCSVValue(data.installationDetails.verifierAuthorizedRepresentative ?? '') + '\n';
  content += 'Verifier Name,' + escapeCSVValue(data.installationDetails.verifierName ?? '') + '\n';
  content += 'Verifier Email,' + escapeCSVValue(data.installationDetails.verifierEmail ?? '') + '\n';
  content += 'Verifier Telephone,' + escapeCSVValue(data.installationDetails.verifierTelephone ?? '') + '\n';
  content += 'Verifier Fax,' + escapeCSVValue(data.installationDetails.verifierFax ?? '') + '\n';
  content += 'Accreditation Member State,' + escapeCSVValue(data.installationDetails.accreditationMemberState ?? '') + '\n';
  content += 'Accreditation Body Name,' + escapeCSVValue(data.installationDetails.accreditationBodyName ?? '') + '\n';
  content += 'Accreditation Registration Number,' + escapeCSVValue(data.installationDetails.accreditationRegistrationNumber ?? '') + '\n';
  content += '\n';
  content += 'Aggregated Goods Categories and Routes\n';
  content += 'Category,Routes\n';
  (data.installationDetails.aggregatedGoods ?? []).forEach(g => {
    content += `${escapeCSVValue(g.category ?? '')},${escapeCSVValue((g.routes ?? []).join(' ; '))}\n`;
  });
  content += '\n';
  content += 'Production Processes and Included Categories\n';
  content += 'Process Name,Included Goods Categories\n';
  (data.installationDetails.productionProcesses ?? []).forEach(p => {
    content += `${escapeCSVValue(p.name ?? '')},${escapeCSVValue((p.includedGoodsCategories ?? []).join(' ; '))}\n`;
  });
  content += '\n';
  
  // Add energy and fuel data
  content += 'Energy and Fuel Data\n';
  content += 'Fuel Type,Source,Use Category,Consumption,Unit,CO2 Emission Factor,Biomass Share,Renewable Share\n';
  
  data.energyFuelData.forEach(fuel => {
    content += `${fuel.fuelType},${fuel.fuelSource},${fuel.useCategory ?? ''},${fuel.consumption},${fuel.unit},${fuel.co2EmissionFactor},${fuel.biomassShare ?? ''},${fuel.renewableShare ?? ''}\n`;
  });
  
  // Add process and production data
  content += 'Process and Production Data\n';
  content += 'Process Name,Process Type,Production Amount,Unit,Emission Factor,Emissions\n';
  
  data.processProductionData.forEach(process => {
    content += `${process.processName},${process.processType},${process.productionAmount ?? process.productionQuantity ?? 0},${process.unit},${process.processEmissionFactor ?? 0},${process.processEmissions ?? 0}\n`;
    
    // Add input materials
    if (process.inputs.length > 0) {
      content += 'Input Materials\n';
      content += 'Name,Quantity,Origin,Embedded Emissions\n';
      
      process.inputs.forEach(input => {
        content += `${input.materialName ?? 'Unknown'},${input.amount ?? input.quantity ?? 0},${input.originCountry ?? input.origin ?? ''},${input.embeddedEmissions ?? ''}\n`;
      });
    }
    
    // Add output products
    if (process.outputs.length > 0) {
      content += 'Output Products\n';
      content += 'Name,Quantity,CN Code,Destination\n';
      
      process.outputs.forEach(output => {
        content += `${output.productName ?? 'Unknown'},${output.amount ?? output.quantity ?? 0},${output.cnCode ?? ''},${output.destination ?? ''}\n`;
      });
    }
    
    content += '\n';
  });
  
  // Add calculation results
  content += '\nCalculation Results\n';
  content += 'Metric,Value,Unit\n';
  content += 'Total Direct CO2 Emissions,' + results.totalDirectCO2Emissions + ',tCO2\n';
  content += 'Total Process Emissions,' + results.totalProcessEmissions + ',tCO2\n';
  content += 'Total Indirect CO2 Emissions,' + (data.emissionInstallationData?.totalIndirectCO2Emissions ?? 0) + ',tCO2\n';
  content += 'Total Emissions,' + results.totalEmissions + ',tCO2\n';
  content += 'Specific Emissions,' + results.specificEmissions + ',tCO2/t product\n';
  content += 'Total Energy,' + results.totalEnergy + ',MWh\n';
  content += 'Renewable Share,' + results.renewableShare + ',fraction\n';
  content += 'Imported Raw Material Share,' + results.importedRawMaterialShare + ',fraction\n';
  content += 'Embedded Emissions,' + results.embeddedEmissions + ',tCO2\n';
  content += 'Cumulative Emissions,' + results.cumulativeEmissions + ',tCO2\n';
  
  // Fuel Balance (TJ)
  const toTJ = (i: any) => (i.unit === 'GJ' ? i.consumption / 1000 : i.unit === 'MWh' ? (i.consumption * 3.6) / 1000 : i.unit === 'TJ' ? i.consumption : 0);
  const totalFuelInputTJ = (data.energyFuelData || []).reduce((s, i) => s + toTJ(i), 0);
  const cbamProcTJ = (data.energyFuelData || []).filter(i => i.useCategory === 'CBAM proizvodni procesi').reduce((s, i) => s + toTJ(i), 0);
  const electricityProdTJ = (data.energyFuelData || []).filter(i => i.useCategory === 'Proizvodnja električne energije').reduce((s, i) => s + toTJ(i), 0);
  const nonCbamTJ = (data.energyFuelData || []).filter(i => i.useCategory === 'Ne-CBAM procesi').reduce((s, i) => s + toTJ(i), 0);
  
  content += '\nFuel Balance (TJ)\n';
  content += 'Metric,Value,Unit\n';
  content += 'Total Fuel Input,' + totalFuelInputTJ.toFixed(3) + ',TJ\n';
  content += 'CBAM proizvodni procesi,' + cbamProcTJ.toFixed(3) + ',TJ\n';
  content += 'Proizvodnja električne energije,' + electricityProdTJ.toFixed(3) + ',TJ\n';
  content += 'Ne-CBAM procesi,' + nonCbamTJ.toFixed(3) + ',TJ\n';
  content += 'Note,Includes GJ/MWh converted to TJ,,\n';

  // C_InstEmissions Summary
  content += '\nC_InstEmissions Summary\n';
  const c: any = data.cInstEmissions;
  if (c) {
    content += 'Reporting Period,' + escapeCSVValue(c.metadata.reportingPeriod || '') + '\n';
    content += 'Calculation Method,' + escapeCSVValue(c.metadata.calculationMethod || '') + '\n';
    content += 'Data Source,' + escapeCSVValue(c.metadata.dataSource || '') + '\n';
    content += 'Total Fuel Input (TJ),' + c.fuelBalance.totalFuelInput + ',TJ\n';
    content += 'Direct Fuel CBAM (TJ),' + c.fuelBalance.directFuelCBAM + ',TJ\n';
    content += 'Fuel for Electricity (TJ),' + c.fuelBalance.fuelForElectricity + ',TJ\n';
    content += 'Direct Fuel non-CBAM (TJ),' + c.fuelBalance.directFuelNonCBAM + ',TJ\n';
    content += 'Total CO2 Emissions (tCO2e),' + c.emissionsBalance.totalCO2Emissions + ',tCO2e\n';
    content += 'Biomass Emissions (tCO2e),' + c.emissionsBalance.biomassEmissions + ',tCO2e\n';
    content += 'Total N2O Emissions (tCO2e),' + c.emissionsBalance.totalN2OEmissions + ',tCO2e\n';
    content += 'Total PFC Emissions (tCO2e),' + c.emissionsBalance.totalPFCEmissions + ',tCO2e\n';
    content += 'Total Direct Emissions (tCO2e),' + c.emissionsBalance.totalDirectEmissions + ',tCO2e\n';
    content += 'Total Indirect Emissions (tCO2e),' + c.emissionsBalance.totalIndirectEmissions + ',tCO2e\n';
    content += 'Total Emissions (tCO2e),' + c.emissionsBalance.totalEmissions + ',tCO2e\n';
    content += 'Completeness Score (%),' + c.validationStatus.completenessScore + ',%\n';
  } else {
    content += 'Note,No C_InstEmissions data\n';
  }

  // E_Purchased Summary
  content += '\nE_Purchased Summary\n';
  const e: any = data.ePurchased;
  if (e) {
    content += 'Reporting Period,' + escapeCSVValue(e.reportingPeriod || '') + '\n';
    content += 'Total Precursors,' + (e.summary?.totalPrecursors || 0) + '\n';
    content += 'Total Quantity,' + (e.summary?.totalQuantity || 0) + '\n';
    content += 'Total Direct Embedded Emissions (tCO2e),' + (e.summary?.totalDirectEmbeddedEmissions || 0) + ',tCO2e\n';
    content += 'Total Indirect Embedded Emissions (tCO2e),' + (e.summary?.totalIndirectEmbeddedEmissions || 0) + ',tCO2e\n';
    content += 'Total Embedded Emissions (tCO2e),' + (e.summary?.totalEmbeddedEmissions || 0) + ',tCO2e\n';
    content += 'Average Data Quality (%),' + (e.summary?.averageDataQuality || 0) + ',%\n';
    content += 'Verified Precursors,' + (e.summary?.verifiedPrecursors || 0) + '\n';
    content += 'Overall Data Quality,' + escapeCSVValue(e.overallDataQuality || '') + '\n';
    content += 'Overall Verification Status,' + escapeCSVValue(e.overallVerificationStatus || '') + '\n';
  } else {
    content += 'Note,No E_Purchased data\n';
  }

  // F_Emissions Summary
  content += '\nF_Emissions Summary\n';
  const f: any = data.fEmissions;
  if (f) {
    content += 'Reporting Period,' + escapeCSVValue(f.metadata?.reportingPeriod || '') + '\n';
    content += 'Total CO2 (t),' + (f.emissionCalculations?.totalCO2 || 0) + ',t\n';
    content += 'Total N2O (t),' + (f.emissionCalculations?.totalN2O || 0) + ',t\n';
    content += 'Total PFC (t),' + (f.emissionCalculations?.totalPFC || 0) + ',t\n';
    content += 'Total Biomass CO2 (t),' + (f.emissionCalculations?.totalBiomassCO2 || 0) + ',t\n';
    content += 'Total Fossil CO2 (t),' + (f.emissionCalculations?.totalFossilCO2 || 0) + ',t\n';
    content += 'Total GHG (t),' + (f.emissionCalculations?.totalGHG || 0) + ',t\n';
    content += 'CO2 Equivalent (t),' + (f.emissionCalculations?.co2Equivalent || 0) + ',t\n';
    content += 'Number of Sources,' + ((f.additionalEmissions || []).length) + '\n';
    content += 'Verification Level,' + escapeCSVValue(f.verificationData?.verificationLevel || '') + '\n';
    content += 'Verification Result,' + escapeCSVValue(f.verificationData?.verificationResult || '') + '\n';
    content += 'Completeness Score (%),' + (f.validationStatus?.completenessScore || 0) + ',%\n';
  } else {
    content += 'Note,No F_Emissions data\n';
  }
  
  // Create a blob with the content
  return new Blob([content], { type: 'text/csv' });
};

/**
 * Download a blob as a file
 * @param blob The blob to download
 * @param filename The filename to use
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export CBAM data and results to CSV and download it
 * @param data CBAM data object
 * @param results Calculation results
 */
export const exportAndDownloadCSV = (data: CBAMData, results: CalculationResults): void => {
  const blob = exportToCSV(data, results);
  const filename = `CBAM_Declaration_${data.reportConfig.installationId}_${data.reportConfig.reportingPeriod}.csv`;
  downloadBlob(blob, filename);
};

const csvExport = {
  exportToCSV,
  downloadBlob,
  exportAndDownloadCSV
};

export default csvExport;
