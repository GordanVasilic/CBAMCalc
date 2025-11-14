import { CBAMData, CalculationResults } from '../types/CBAMData';
import { jsPDF } from 'jspdf';

/**
 * PDF Export Utility
 * 
 * This module provides functionality to export CBAM data and results to PDF format.
 * It creates a formatted PDF document with the CBAM declaration information.
 */

/**
 * Export CBAM data and results to PDF format
 * @param data CBAM data object
 * @param results Calculation results
 * @returns Blob representing the PDF file
 */
export const exportToPDF = (data: CBAMData, results: CalculationResults): Blob => {
  const doc = new jsPDF();
  let y = 10;
  const ensureSpace = () => { if (y > 280) { doc.addPage(); y = 10; } };
  const line = (text: string = '') => { doc.text(String(text), 10, y); y += 8; ensureSpace(); };
  const section = (title: string) => { doc.setFontSize(12); line(title); doc.setFontSize(10); };

  doc.setFontSize(16);
  line('CBAM DECLARATION REPORT');
  doc.setFontSize(10);
  line('');

  section('COMPANY INFORMATION');
  line(`Name: ${data.companyInfo.companyName}`);
  line(`Address: ${data.companyInfo.companyAddress}`);
  line(`Contact Person: ${data.companyInfo.companyContactPerson}`);
  line(`Phone: ${data.companyInfo.companyPhone}`);
  line(`Email: ${data.companyInfo.companyEmail}`);
  line('');

  section('REPORT CONFIGURATION');
  line(`Reporting Period: ${data.reportConfig.reportingPeriod}`);
  line(`Installation ID: ${data.reportConfig.installationId}`);
  line(`Installation Name: ${data.reportConfig.installationName}`);
  line(`Country: ${data.reportConfig.installationCountry}`);
  line(`Address: ${data.reportConfig.installationAddress}`);
  line('');

  section('INSTALLATION DETAILS');
  line(`Installation Type: ${data.installationDetails.installationType}`);
  line(`Main Activity: ${data.installationDetails.mainActivity}`);
  line(`Economic Activity: ${data.installationDetails.economicActivity ?? ''}`);
  line(`CN Code: ${data.installationDetails.cnCode}`);
  line(`Production Capacity: ${data.installationDetails.productionCapacity}`);
  line(`Annual Production: ${data.installationDetails.annualProduction}`);
  line(`Installation English Name: ${data.installationDetails.installationEnglishName ?? ''}`);
  line(`Street and Number: ${data.installationDetails.streetAndNumber ?? ''}`);
  line(`Postal Code: ${data.installationDetails.postalCode ?? ''}`);
  line(`PO Box: ${data.installationDetails.poBox ?? ''}`);
  line(`City: ${data.installationDetails.city ?? ''}`);
  line(`Country: ${data.installationDetails.country ?? ''}`);
  line(`UNLOCODE: ${data.installationDetails.unlocode ?? ''}`);
  line(`Latitude: ${data.installationDetails.latitude ?? ''}`);
  line(`Longitude: ${data.installationDetails.longitude ?? ''}`);
  line(`Authorized Representative: ${data.installationDetails.authorizedRepresentativeName ?? ''}`);
  line(`Authorized Email: ${data.installationDetails.authorizedRepresentativeEmail ?? ''}`);
  line(`Authorized Telephone: ${data.installationDetails.authorizedRepresentativeTelephone ?? ''}`);
  line('');

  section('REPORTING PERIOD DETAILS');
  line(`Start Date: ${data.installationDetails.startDate ?? ''}`);
  line(`End Date: ${data.installationDetails.endDate ?? ''}`);
  line('');

  section('VERIFIER DETAILS');
  line(`Verifier Company Name: ${data.installationDetails.verifierCompanyName ?? ''}`);
  line(`Verifier Street and Number: ${data.installationDetails.verifierStreetAndNumber ?? ''}`);
  line(`Verifier City: ${data.installationDetails.verifierCity ?? ''}`);
  line(`Verifier Postal Code: ${data.installationDetails.verifierPostalCode ?? ''}`);
  line(`Verifier Country: ${data.installationDetails.verifierCountry ?? ''}`);
  line(`Authorized Representative: ${data.installationDetails.verifierAuthorizedRepresentative ?? ''}`);
  line(`Verifier Name: ${data.installationDetails.verifierName ?? ''}`);
  line(`Verifier Email: ${data.installationDetails.verifierEmail ?? ''}`);
  line(`Verifier Telephone: ${data.installationDetails.verifierTelephone ?? ''}`);
  line(`Verifier Fax: ${data.installationDetails.verifierFax ?? ''}`);
  line(`Accreditation Member State: ${data.installationDetails.accreditationMemberState ?? ''}`);
  line(`Accreditation Body Name: ${data.installationDetails.accreditationBodyName ?? ''}`);
  line(`Accreditation Registration Number: ${data.installationDetails.accreditationRegistrationNumber ?? ''}`);
  line('');

  section('AGGREGATED GOODS CATEGORIES AND ROUTES');
  (data.installationDetails.aggregatedGoods ?? []).forEach((g, i) => {
    line(`${i + 1}. ${g.category ?? ''}`);
    line(`   Routes: ${(g.routes ?? []).join(' ; ')}`);
  });
  line('');

  section('PRODUCTION PROCESSES AND INCLUDED CATEGORIES');
  (data.installationDetails.productionProcesses ?? []).forEach((p, i) => {
    line(`${i + 1}. ${p.name ?? ''}`);
    line(`   Included: ${(p.includedGoodsCategories ?? []).join(' ; ')}`);
  });
  line('');

  section('ENERGY AND FUEL DATA');
  data.energyFuelData.forEach(fuel => {
    line(`${fuel.fuelType} | ${fuel.fuelSource ?? ''} | Namjena: ${fuel.useCategory ?? ''} | ${fuel.consumption ?? 0} ${fuel.unit ?? ''} | EF: ${fuel.co2EmissionFactor ?? 0} | Biomass: ${fuel.biomassShare ?? ''} | Renewable: ${fuel.renewableShare ?? ''}`);
  });
  line('');

  section('PROCESS AND PRODUCTION DATA');
  data.processProductionData.forEach((process, index) => {
    line(`Process ${index + 1}: ${process.processName}`);
    line(`Type: ${process.processType}`);
    line(`Production: ${process.productionAmount ?? process.productionQuantity ?? 0} ${process.unit}`);
    line(`Emission Factor: ${process.processEmissionFactor ?? 0}`);
    line(`Emissions: ${process.processEmissions ?? 0}`);

    if (process.inputs.length > 0) {
      line('Input Materials:');
      process.inputs.forEach(input => {
        line(`- ${input.materialName ?? 'Unknown'} | Qty: ${input.amount ?? input.quantity ?? 0} | Origin: ${input.originCountry ?? input.origin ?? ''} | Embedded: ${input.embeddedEmissions ?? ''}`);
      });
    }

    if (process.outputs.length > 0) {
      line('Output Products:');
      process.outputs.forEach(output => {
        line(`- ${output.productName ?? 'Unknown'} | Qty: ${output.amount ?? output.quantity ?? 0} | CN: ${output.cnCode ?? ''} | Dest: ${output.destination ?? ''}`);
      });
    }

    line('');
  });

  section('CALCULATION RESULTS');
  line(`Total Direct CO2 Emissions: ${results.totalDirectCO2Emissions} tCO2`);
  line(`Total Process Emissions: ${results.totalProcessEmissions} tCO2`);
  line(`Total Indirect CO2 Emissions: ${(data.emissionInstallationData?.totalIndirectCO2Emissions ?? 0)} tCO2`);
  line(`Total Emissions: ${results.totalEmissions} tCO2`);
  line(`Specific Emissions: ${results.specificEmissions} tCO2/t product`);
  line(`Total Energy: ${results.totalEnergy} MWh`);
  line(`Renewable Share: ${(results.renewableShare * 100).toFixed(2)}%`);
  line(`Imported Raw Material Share: ${(results.importedRawMaterialShare * 100).toFixed(2)}%`);
  line(`Embedded Emissions: ${results.embeddedEmissions} tCO2`);
  line(`Cumulative Emissions: ${results.cumulativeEmissions} tCO2`);
  
  // Fuel Balance (TJ)
  const toTJ = (i: any) => (i.unit === 'GJ' ? i.consumption / 1000 : i.unit === 'MWh' ? (i.consumption * 3.6) / 1000 : i.unit === 'TJ' ? i.consumption : 0);
  const totalFuelInputTJ = (data.energyFuelData || []).reduce((s, i) => s + toTJ(i), 0);
  const cbamProcTJ = (data.energyFuelData || []).filter(i => i.useCategory === 'CBAM proizvodni procesi').reduce((s, i) => s + toTJ(i), 0);
  const electricityProdTJ = (data.energyFuelData || []).filter(i => i.useCategory === 'Proizvodnja električne energije').reduce((s, i) => s + toTJ(i), 0);
  const nonCbamTJ = (data.energyFuelData || []).filter(i => i.useCategory === 'Ne-CBAM procesi').reduce((s, i) => s + toTJ(i), 0);

  line('');
  section('FUEL BALANCE (TJ)');
  line(`Total Fuel Input: ${totalFuelInputTJ.toFixed(3)} TJ`);
  line(`CBAM proizvodni procesi: ${cbamProcTJ.toFixed(3)} TJ`);
  line(`Proizvodnja električne energije: ${electricityProdTJ.toFixed(3)} TJ`);
  line(`Ne-CBAM procesi: ${nonCbamTJ.toFixed(3)} TJ`);
  line('Note: Includes GJ/MWh converted to TJ');

  // C_InstEmissions Summary
  line('');
  section('C_INSTEMISSIONS SUMMARY');
  const c = data.cInstEmissions;
  if (c) {
    line(`Reporting Period: ${c.metadata.reportingPeriod || ''}`);
    line(`Calculation Method: ${c.metadata.calculationMethod || ''}`);
    line(`Data Source: ${c.metadata.dataSource || ''}`);
    line(`Total Fuel Input (TJ): ${c.fuelBalance.totalFuelInput}`);
    line(`Direct Fuel CBAM (TJ): ${c.fuelBalance.directFuelCBAM}`);
    line(`Fuel for Electricity (TJ): ${c.fuelBalance.fuelForElectricity}`);
    line(`Direct Fuel non-CBAM (TJ): ${c.fuelBalance.directFuelNonCBAM}`);
    line(`Total CO2 Emissions (tCO2e): ${c.emissionsBalance.totalCO2Emissions}`);
    line(`Biomass Emissions (tCO2e): ${c.emissionsBalance.biomassEmissions}`);
    line(`Total N2O Emissions (tCO2e): ${c.emissionsBalance.totalN2OEmissions}`);
    line(`Total PFC Emissions (tCO2e): ${c.emissionsBalance.totalPFCEmissions}`);
    line(`Total Direct Emissions (tCO2e): ${c.emissionsBalance.totalDirectEmissions}`);
    line(`Total Indirect Emissions (tCO2e): ${c.emissionsBalance.totalIndirectEmissions}`);
    line(`Total Emissions (tCO2e): ${c.emissionsBalance.totalEmissions}`);
    line(`Completeness Score (%): ${c.validationStatus.completenessScore}`);
  } else {
    line('No C_InstEmissions data');
  }

  // E_Purchased Summary
  line('');
  section('E_PURCHASED SUMMARY');
  const e: any = data.ePurchased;
  if (e) {
    line(`Reporting Period: ${e.reportingPeriod || ''}`);
    line(`Total Precursors: ${e.summary?.totalPrecursors || 0}`);
    line(`Total Quantity: ${e.summary?.totalQuantity || 0}`);
    line(`Total Direct Embedded Emissions (tCO2e): ${e.summary?.totalDirectEmbeddedEmissions || 0}`);
    line(`Total Indirect Embedded Emissions (tCO2e): ${e.summary?.totalIndirectEmbeddedEmissions || 0}`);
    line(`Total Embedded Emissions (tCO2e): ${e.summary?.totalEmbeddedEmissions || 0}`);
    line(`Average Data Quality (%): ${e.summary?.averageDataQuality || 0}`);
    line(`Verified Precursors: ${e.summary?.verifiedPrecursors || 0}`);
    line(`Overall Data Quality: ${e.overallDataQuality || ''}`);
    line(`Overall Verification Status: ${e.overallVerificationStatus || ''}`);
  } else {
    line('No E_Purchased data');
  }

  // F_Emissions Summary
  line('');
  section('F_EMISSIONS SUMMARY');
  const f: any = data.fEmissions;
  if (f) {
    line(`Reporting Period: ${f.metadata?.reportingPeriod || ''}`);
    line(`Total CO2 (t): ${f.emissionCalculations?.totalCO2 || 0}`);
    line(`Total N2O (t): ${f.emissionCalculations?.totalN2O || 0}`);
    line(`Total PFC (t): ${f.emissionCalculations?.totalPFC || 0}`);
    line(`Total Biomass CO2 (t): ${f.emissionCalculations?.totalBiomassCO2 || 0}`);
    line(`Total Fossil CO2 (t): ${f.emissionCalculations?.totalFossilCO2 || 0}`);
    line(`Total GHG (t): ${f.emissionCalculations?.totalGHG || 0}`);
    line(`CO2 Equivalent (t): ${f.emissionCalculations?.co2Equivalent || 0}`);
    line(`Number of Sources: ${(f.additionalEmissions || []).length}`);
    line(`Verification Level: ${f.verificationData?.verificationLevel || ''}`);
    line(`Verification Result: ${f.verificationData?.verificationResult || ''}`);
    line(`Completeness Score (%): ${f.validationStatus?.completenessScore || 0}`);
  } else {
    line('No F_Emissions data');
  }

  const pdfBuffer = doc.output('arraybuffer');
  return new Blob([pdfBuffer], { type: 'application/pdf' });
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
 * Export CBAM data and results to PDF and download it
 * @param data CBAM data object
 * @param results Calculation results
 */
export const exportAndDownloadPDF = (data: CBAMData, results: CalculationResults): void => {
  const blob = exportToPDF(data, results);
  const filename = `CBAM_Declaration_${data.reportConfig.installationId}_${data.reportConfig.reportingPeriod}.pdf`;
  downloadBlob(blob, filename);
};

const pdfExport = {
  exportToPDF,
  downloadBlob,
  exportAndDownloadPDF
};

export default pdfExport;