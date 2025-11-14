import { CBAMData, CalculationResults } from '../types/CBAMData';
import * as XLSX from 'xlsx';

/**
 * Excel Export Utility
 * 
 * This module provides functionality to export CBAM data and results to Excel format.
 * It creates a structured Excel file similar to the original CBAM Communication template.
 */

/**
 * Export CBAM data and results to Excel format
 * @param data CBAM data object
 * @param results Calculation results
 * @returns Blob representing the Excel file
 */
export const exportToExcel = (data: CBAMData, results: CalculationResults): Blob => {
  const wb = XLSX.utils.book_new();
  const sheetData: (string | number)[][] = [
    ['Company Information'],
    ['Name', data.companyInfo.companyName],
    ['Address', data.companyInfo.companyAddress],
    ['Contact Person', data.companyInfo.companyContactPerson],
    ['Phone', data.companyInfo.companyPhone],
    ['Email', data.companyInfo.companyEmail],
    [''],
    ['Report Configuration'],
    ['Reporting Period', data.reportConfig.reportingPeriod],
    ['Installation ID', data.reportConfig.installationId],
    ['Installation Name', data.reportConfig.installationName],
    ['Country', data.reportConfig.installationCountry],
    ['Address', data.reportConfig.installationAddress],
    [''],
    ['Installation Details'],
    ['Installation Type', data.installationDetails.installationType],
    ['Main Activity', data.installationDetails.mainActivity],
    ['Economic Activity', data.installationDetails.economicActivity ?? ''],
    ['CN Code', data.installationDetails.cnCode],
    ['Production Capacity', data.installationDetails.productionCapacity],
    ['Annual Production', data.installationDetails.annualProduction],
    ['Installation English Name', data.installationDetails.installationEnglishName ?? ''],
    ['Street and Number', data.installationDetails.streetAndNumber ?? ''],
    ['Postal Code', data.installationDetails.postalCode ?? ''],
    ['PO Box', data.installationDetails.poBox ?? ''],
    ['City', data.installationDetails.city ?? ''],
    ['Country', data.installationDetails.country ?? ''],
    ['UNLOCODE', data.installationDetails.unlocode ?? ''],
    ['Latitude', data.installationDetails.latitude ?? ''],
    ['Longitude', data.installationDetails.longitude ?? ''],
    ['Authorized Representative Name', data.installationDetails.authorizedRepresentativeName ?? ''],
    ['Authorized Representative Email', data.installationDetails.authorizedRepresentativeEmail ?? ''],
    ['Authorized Representative Telephone', data.installationDetails.authorizedRepresentativeTelephone ?? ''],
    [''],
    ['Reporting Period Details'],
    ['Start Date', data.installationDetails.startDate ?? ''],
    ['End Date', data.installationDetails.endDate ?? ''],
    [''],
    ['Verifier Details'],
    ['Verifier Company Name', data.installationDetails.verifierCompanyName ?? ''],
    ['Verifier Street and Number', data.installationDetails.verifierStreetAndNumber ?? ''],
    ['Verifier City', data.installationDetails.verifierCity ?? ''],
    ['Verifier Postal Code', data.installationDetails.verifierPostalCode ?? ''],
    ['Verifier Country', data.installationDetails.verifierCountry ?? ''],
    ['Verifier Authorized Representative', data.installationDetails.verifierAuthorizedRepresentative ?? ''],
    ['Verifier Name', data.installationDetails.verifierName ?? ''],
    ['Verifier Email', data.installationDetails.verifierEmail ?? ''],
    ['Verifier Telephone', data.installationDetails.verifierTelephone ?? ''],
    ['Verifier Fax', data.installationDetails.verifierFax ?? ''],
    ['Accreditation Member State', data.installationDetails.accreditationMemberState ?? ''],
    ['Accreditation Body Name', data.installationDetails.accreditationBodyName ?? ''],
    ['Accreditation Registration Number', data.installationDetails.accreditationRegistrationNumber ?? ''],
    [''],
    ['Aggregated Goods Categories and Routes'],
    ['Category', 'Routes'],
    ...((data.installationDetails.aggregatedGoods ?? []).map(g => [g.category ?? '', (g.routes ?? []).join(' ; ')])),
    [''],
    ['Production Processes and Included Categories'],
    ['Process Name', 'Included Goods Categories'],
    ...((data.installationDetails.productionProcesses ?? []).map(p => [p.name ?? '', (p.includedGoodsCategories ?? []).join(' ; ')])),
    [''],
    ['Energy and Fuel Data'],
    ['Fuel Type', 'Source', 'Consumption', 'Unit', 'CO2 Emission Factor', 'Biomass Share', 'Renewable Share', 'Use Category'],
    ...data.energyFuelData.map(fuel => [
      fuel.fuelType,
      fuel.fuelSource ?? '',
      fuel.consumption ?? 0,
      fuel.unit ?? '',
      fuel.co2EmissionFactor ?? 0,
      fuel.biomassShare ?? '',
      fuel.renewableShare ?? '',
      fuel.useCategory ?? ''
    ]),
    [''],
    ['Process and Production Data'],
    ['Process Name', 'Process Type', 'Production Amount', 'Unit', 'Emission Factor', 'Emissions'],
    ...data.processProductionData.flatMap(process => {
      const rows: (string|number)[][] = [
        [process.processName ?? '', process.processType ?? '', process.productionAmount ?? process.productionQuantity ?? 0, process.unit ?? '', process.processEmissionFactor ?? 0, process.processEmissions ?? 0],
      ];
      if (process.inputs.length > 0) {
        rows.push(['Input Materials']);
        rows.push(['Name', 'Quantity', 'Origin', 'Embedded Emissions']);
        process.inputs.forEach(input => {
          rows.push([input.materialName ?? 'Unknown', input.amount ?? input.quantity ?? 0, input.originCountry ?? input.origin ?? '', input.embeddedEmissions ?? '']);
        });
      }
      if (process.outputs.length > 0) {
        rows.push(['Output Products']);
        rows.push(['Name', 'Quantity', 'CN Code', 'Destination']);
        process.outputs.forEach(output => {
          rows.push([output.productName ?? 'Unknown', output.amount ?? output.quantity ?? 0, output.cnCode ?? '', output.destination ?? '']);
        });
      }
      rows.push(['']);
      return rows;
    }),
    ['Calculation Results'],
    ['Total Direct CO2 Emissions', results.totalDirectCO2Emissions, 'tCO2'],
    ['Total Process Emissions', results.totalProcessEmissions, 'tCO2'],
    ['Total Emissions', results.totalEmissions, 'tCO2'],
    ['Specific Emissions', results.specificEmissions, 'tCO2/t product'],
    ['Total Energy', results.totalEnergy, 'MWh'],
    ['Renewable Share', results.renewableShare, 'fraction'],
    ['Imported Raw Material Share', results.importedRawMaterialShare, 'fraction'],
    ['Embedded Emissions', results.embeddedEmissions, 'tCO2'],
    ['Cumulative Emissions', results.cumulativeEmissions, 'tCO2'],
    ['Total Indirect CO2 Emissions', data.emissionInstallationData?.totalIndirectCO2Emissions ?? 0, 'tCO2'],
    [''],
    ['Fuel Balance (TJ)'],
    ['Metric', 'Value', 'Unit'],
    ['Total Fuel Input', (data.energyFuelData || []).reduce((sum, fuel) => sum + ((fuel.unit === 'GJ') ? (fuel.consumption || 0)/1000 : (fuel.unit === 'MWh') ? ((fuel.consumption || 0)*3.6)/1000 : (fuel.unit === 'TJ') ? (fuel.consumption || 0) : 0), 0), 'TJ'],
    ['CBAM proizvodni procesi', (data.energyFuelData || []).reduce((sum, fuel) => fuel.useCategory === 'CBAM proizvodni procesi' ? sum + ((fuel.unit === 'GJ') ? (fuel.consumption || 0)/1000 : (fuel.unit === 'MWh') ? ((fuel.consumption || 0)*3.6)/1000 : (fuel.unit === 'TJ') ? (fuel.consumption || 0) : 0) : sum, 0), 'TJ'],
    ['Proizvodnja električne energije', (data.energyFuelData || []).reduce((sum, fuel) => fuel.useCategory === 'Proizvodnja električne energije' ? sum + ((fuel.unit === 'GJ') ? (fuel.consumption || 0)/1000 : (fuel.unit === 'MWh') ? ((fuel.consumption || 0)*3.6)/1000 : (fuel.unit === 'TJ') ? (fuel.consumption || 0) : 0) : sum, 0), 'TJ'],
    ['Ne-CBAM procesi', (data.energyFuelData || []).reduce((sum, fuel) => fuel.useCategory === 'Ne-CBAM procesi' ? sum + ((fuel.unit === 'GJ') ? (fuel.consumption || 0)/1000 : (fuel.unit === 'MWh') ? ((fuel.consumption || 0)*3.6)/1000 : (fuel.unit === 'TJ') ? (fuel.consumption || 0) : 0) : sum, 0), 'TJ'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'CBAM Report');

  // Additional sheets: C_InstEmissions, E_Purchased, F_Emissions summaries
  const c = data.cInstEmissions;
  const e = data.ePurchased as any;
  const f = data.fEmissions as any;

  if (c) {
    const cSheet: (string | number)[][] = [
      ['C_InstEmissions Summary'],
      ['Reporting Period', c.metadata.reportingPeriod || ''],
      ['Calculation Method', c.metadata.calculationMethod || ''],
      ['Data Source', c.metadata.dataSource || ''],
      [''],
      ['Fuel Balance (TJ)'],
      ['Total Fuel Input', c.fuelBalance.totalFuelInput, 'TJ'],
      ['Direct Fuel CBAM', c.fuelBalance.directFuelCBAM, 'TJ'],
      ['Fuel for Electricity', c.fuelBalance.fuelForElectricity, 'TJ'],
      ['Direct Fuel non-CBAM', c.fuelBalance.directFuelNonCBAM, 'TJ'],
      [''],
      ['GHG Emissions Balance (tCO2e)'],
      ['Total CO2 Emissions', c.emissionsBalance.totalCO2Emissions, 'tCO2e'],
      ['Biomass Emissions', c.emissionsBalance.biomassEmissions, 'tCO2e'],
      ['Total N2O Emissions', c.emissionsBalance.totalN2OEmissions, 'tCO2e'],
      ['Total PFC Emissions', c.emissionsBalance.totalPFCEmissions, 'tCO2e'],
      ['Total Direct Emissions', c.emissionsBalance.totalDirectEmissions, 'tCO2e'],
      ['Total Indirect Emissions', c.emissionsBalance.totalIndirectEmissions, 'tCO2e'],
      ['Total Emissions', c.emissionsBalance.totalEmissions, 'tCO2e'],
      [''],
      ['Data Quality'],
      ['General Data Quality', c.dataQuality.generalDataQuality],
      ['Default Values Justification', c.dataQuality.defaultValuesJustification],
      ['Quality Assurance', c.dataQuality.qualityAssurance],
      [''],
      ['Validation Status'],
      ['Is Valid', c.validationStatus.isValid ? 'Yes' : 'No'],
      ['Errors Count', c.validationStatus.errors.length],
      ['Warnings Count', c.validationStatus.warnings.length],
      ['Completeness Score (%)', c.validationStatus.completenessScore]
    ];
    const b = (data as any).bEmInstData || {};
    const bTotals = b.totals || {};
    const bCO2e = (bTotals.totalCO2eFossil || 0) + (bTotals.totalCO2eBiomass || 0) + (bTotals.totalCO2eNonSustainableBiomass || 0) + (bTotals.totalPFCEmissions || 0);
    const bEnergy = (bTotals.totalEnergyContentFossil || 0) + (bTotals.totalEnergyContentBiomass || 0);
    const pct = (a: number, b: number) => (b > 0 ? Math.abs(a - b) / b : 0);
    cSheet.push(['']);
    cSheet.push(['Cross-sheet Checks (C ↔ B)']);
    cSheet.push(['Direct Emissions vs B CO2e', `${(pct(c.emissionsBalance.totalDirectEmissions || 0, bCO2e) * 100).toFixed(1)}%`]);
    cSheet.push(['Biomass vs B Biomass', `${(pct(c.emissionsBalance.biomassEmissions || 0, bTotals.totalCO2eBiomass || 0) * 100).toFixed(1)}%`]);
    cSheet.push(['Fuel vs B Energy Content', `${(pct(c.fuelBalance.totalFuelInput || 0, bEnergy) * 100).toFixed(1)}%`]);
    const cWs = XLSX.utils.aoa_to_sheet(cSheet);
    XLSX.utils.book_append_sheet(wb, cWs, 'C_InstEmissions');
  }

  if (e) {
    const eSheet: (string | number)[][] = [
      ['E_Purchased Summary'],
      ['Reporting Period', e.reportingPeriod || ''],
      ['Calculation Method', e.metadata?.calculationMethod || ''],
      ['Data Source', e.metadata?.dataSource || ''],
      [''],
      ['Totals'],
      ['Total Precursors', e.summary?.totalPrecursors || 0],
      ['Total Quantity', e.summary?.totalQuantity || 0],
      ['Total Direct Embedded Emissions', e.summary?.totalDirectEmbeddedEmissions || 0, 'tCO2e'],
      ['Total Indirect Embedded Emissions', e.summary?.totalIndirectEmbeddedEmissions || 0, 'tCO2e'],
      ['Total Embedded Emissions', e.summary?.totalEmbeddedEmissions || 0, 'tCO2e'],
      ['Average Data Quality (%)', e.summary?.averageDataQuality || 0],
      ['Verified Precursors', e.summary?.verifiedPrecursors || 0],
      [''],
      ['Overall Status'],
      ['Overall Data Quality', e.overallDataQuality || ''],
      ['Overall Verification Status', e.overallVerificationStatus || ''],
      ['Validation Is Valid', e.validationStatus?.isValid ? 'Yes' : 'No'],
      ['Errors Count', e.validationStatus?.errors?.length || 0],
      ['Warnings Count', e.validationStatus?.warnings?.length || 0],
      ['Completeness Score (%)', e.validationStatus?.completenessScore || 0]
    ];
    const eWs = XLSX.utils.aoa_to_sheet(eSheet);
    XLSX.utils.book_append_sheet(wb, eWs, 'E_Purchased');
  }

  if (f) {
    const fSheet: (string | number)[][] = [
      ['F_Emissions Summary'],
      ['Reporting Period', f.metadata?.reportingPeriod || ''],
      ['Calculation Approach', f.metadata?.calculationApproach || ''],
      [''],
      ['Emission Totals (t)'],
      ['Total CO2', f.emissionCalculations?.totalCO2 || 0, 't'],
      ['Total N2O', f.emissionCalculations?.totalN2O || 0, 't'],
      ['Total PFC', f.emissionCalculations?.totalPFC || 0, 't'],
      ['Total Biomass CO2', f.emissionCalculations?.totalBiomassCO2 || 0, 't'],
      ['Total Fossil CO2', f.emissionCalculations?.totalFossilCO2 || 0, 't'],
      ['Total GHG', f.emissionCalculations?.totalGHG || 0, 't'],
      ['CO2 Equivalent', f.emissionCalculations?.co2Equivalent || 0, 't'],
      ['Number of Sources', (f.additionalEmissions || []).length],
      [''],
      ['Verification'],
      ['Verification Body', f.verificationData?.verificationBody || ''],
      ['Verification Date', f.verificationData?.verificationDate || ''],
      ['Verification Level', f.verificationData?.verificationLevel || ''],
      ['Verification Result', f.verificationData?.verificationResult || ''],
      [''],
      ['Validation Status'],
      ['Is Valid', f.validationStatus?.isValid ? 'Yes' : 'No'],
      ['Errors Count', f.validationStatus?.errors?.length || 0],
      ['Warnings Count', f.validationStatus?.warnings?.length || 0],
      ['Completeness Score (%)', f.validationStatus?.completenessScore || 0]
    ];
    const cBal = (data.cInstEmissions || {}).emissionsBalance || {} as any;
    const bCount = ((data as any).bEmInstData?.emissionSources || []).length || 0;
    const fCount = (f.additionalEmissions || []).length || 0;
    const pct = (a: number, b: number) => (b > 0 ? Math.abs(a - b) / b : 0);
    fSheet.push(['']);
    fSheet.push(['Cross-sheet Checks (F ↔ C/B)']);
    fSheet.push(['CO2 vs C Direct', `${(pct(f.emissionCalculations?.totalCO2 || 0, cBal.totalDirectEmissions || 0) * 100).toFixed(1)}%`]);
    fSheet.push(['CO2 vs C CO2', `${(pct(f.emissionCalculations?.totalCO2 || 0, cBal.totalCO2Emissions || 0) * 100).toFixed(1)}%`]);
    fSheet.push(['Biomass vs C Biomass', `${(pct(f.emissionCalculations?.totalBiomassCO2 || 0, cBal.biomassEmissions || 0) * 100).toFixed(1)}%`]);
    fSheet.push(['CO2eq vs C Total', `${(pct(f.emissionCalculations?.co2Equivalent || 0, cBal.totalEmissions || 0) * 100).toFixed(1)}%`]);
    fSheet.push(['Additional Sources vs B Sources', `${fCount} vs ${bCount}`]);
    const fWs = XLSX.utils.aoa_to_sheet(fSheet);
    XLSX.utils.book_append_sheet(wb, fWs, 'F_Emissions');
  }

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
 * Export CBAM data and results to Excel and download it
 * @param data CBAM data object
 * @param results Calculation results
 */
export const exportAndDownloadExcel = (data: CBAMData, results: CalculationResults): void => {
  const blob = exportToExcel(data, results);
  const filename = `CBAM_Declaration_${data.reportConfig.installationId}_${data.reportConfig.reportingPeriod}.xlsx`;
  downloadBlob(blob, filename);
};

const excelExport = {
  exportToExcel,
  downloadBlob,
  exportAndDownloadExcel
};

export default excelExport;

export const importFromExcel = async (arrayBuffer: ArrayBuffer, existingData: CBAMData): Promise<CBAMData> => {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });

  const nextData: CBAMData = { ...existingData } as any;

  const readRows = (ws: XLSX.WorkSheet): any[] => XLSX.utils.sheet_to_json(ws, { header: 1 });

  const getValueByLabel = (rows: any[], label: string): any => {
    for (const r of rows) {
      if (Array.isArray(r) && String(r[0]).trim() === label) return r[1];
    }
    return undefined;
  };
  const getValueByLabels = (rows: any[], labels: string[]): any => {
    for (const l of labels) {
      const v = getValueByLabel(rows, l);
      if (v !== undefined) return v;
    }
    return undefined;
  };

  const cWs = wb.Sheets['C_InstEmissions'];
  if (cWs) {
    const rows = readRows(cWs);
    const c = nextData.cInstEmissions || ({} as any);
    c.metadata = c.metadata || {};
    c.fuelBalance = c.fuelBalance || { totalFuelInput: 0, directFuelCBAM: 0, fuelForElectricity: 0, directFuelNonCBAM: 0, manualEntries: {} };
    c.emissionsBalance = c.emissionsBalance || { totalCO2Emissions: 0, biomassEmissions: 0, totalN2OEmissions: 0, totalPFCEmissions: 0, totalDirectEmissions: 0, totalIndirectEmissions: 0, totalEmissions: 0, manualEntries: {} };
    c.metadata.reportingPeriod = getValueByLabels(rows, ['Reporting Period', 'Period izveštavanja', 'Period izvještavanja']) || c.metadata.reportingPeriod || '';
    c.metadata.calculationMethod = getValueByLabels(rows, ['Calculation Method', 'Metoda proračuna']) || c.metadata.calculationMethod || 'auto';
    c.metadata.dataSource = getValueByLabels(rows, ['Data Source', 'Izvor podataka']) || c.metadata.dataSource || 'manual';
    c.fuelBalance.totalFuelInput = Number(getValueByLabels(rows, ['Total Fuel Input', 'Ukupan unos goriva'])) || c.fuelBalance.totalFuelInput;
    c.fuelBalance.directFuelCBAM = Number(getValueByLabel(rows, 'Direct Fuel CBAM')) || c.fuelBalance.directFuelCBAM;
    c.fuelBalance.fuelForElectricity = Number(getValueByLabel(rows, 'Fuel for Electricity')) || c.fuelBalance.fuelForElectricity;
    c.fuelBalance.directFuelNonCBAM = Number(getValueByLabel(rows, 'Direct Fuel non-CBAM')) || c.fuelBalance.directFuelNonCBAM;
    c.emissionsBalance.totalCO2Emissions = Number(getValueByLabels(rows, ['Total CO2 Emissions', 'Ukupne CO2 emisije'])) || c.emissionsBalance.totalCO2Emissions;
    c.emissionsBalance.biomassEmissions = Number(getValueByLabel(rows, 'Biomass Emissions')) || c.emissionsBalance.biomassEmissions;
    c.emissionsBalance.totalN2OEmissions = Number(getValueByLabel(rows, 'Total N2O Emissions')) || c.emissionsBalance.totalN2OEmissions;
    c.emissionsBalance.totalPFCEmissions = Number(getValueByLabel(rows, 'Total PFC Emissions')) || c.emissionsBalance.totalPFCEmissions;
    c.emissionsBalance.totalDirectEmissions = Number(getValueByLabel(rows, 'Total Direct Emissions')) || c.emissionsBalance.totalDirectEmissions;
    c.emissionsBalance.totalIndirectEmissions = Number(getValueByLabel(rows, 'Total Indirect Emissions')) || c.emissionsBalance.totalIndirectEmissions;
    c.emissionsBalance.totalEmissions = Number(getValueByLabel(rows, 'Total Emissions')) || c.emissionsBalance.totalEmissions;
    // Validation Status block
    const isValid = getValueByLabel(rows, 'Is Valid');
    const errorsCount = getValueByLabel(rows, 'Errors Count');
    const warningsCount = getValueByLabel(rows, 'Warnings Count');
    const completenessScore = getValueByLabel(rows, 'Completeness Score');
    c.validationStatus = c.validationStatus || { isValid: true, errors: [], warnings: [], completenessScore: 0 };
    if (isValid !== undefined) c.validationStatus.isValid = String(isValid).toLowerCase() === 'yes' || isValid === true;
    if (errorsCount !== undefined) {
      const n = Number(errorsCount) || 0;
      c.validationStatus.errors = new Array(n).fill('');
    }
    if (warningsCount !== undefined) {
      const n = Number(warningsCount) || 0;
      c.validationStatus.warnings = new Array(n).fill('');
    }
    if (completenessScore !== undefined) c.validationStatus.completenessScore = Number(completenessScore) || 0;
    nextData.cInstEmissions = c;
  }

  const eWs = wb.Sheets['E_Purchased'];
  if (eWs) {
    const rows = readRows(eWs);
    const e = nextData.ePurchased as any;
    if (!e) nextData.ePurchased = { ...((existingData as any).ePurchased || {}), precursors: [], summary: (existingData as any).ePurchased?.summary || undefined } as any;
    const ep = nextData.ePurchased as any;
    ep.reportingPeriod = getValueByLabels(rows, ['Reporting Period', 'Period izveštavanja', 'Period izvještavanja']) || ep.reportingPeriod || '';
    ep.summary = ep.summary || {};
    ep.summary.totalPrecursors = Number(getValueByLabel(rows, 'Total Precursors')) || ep.summary.totalPrecursors || 0;
    ep.summary.totalQuantity = Number(getValueByLabel(rows, 'Total Quantity')) || ep.summary.totalQuantity || 0;
    ep.summary.totalDirectEmbeddedEmissions = Number(getValueByLabel(rows, 'Total Direct Embedded Emissions')) || ep.summary.totalDirectEmbeddedEmissions || 0;
    ep.summary.totalIndirectEmbeddedEmissions = Number(getValueByLabel(rows, 'Total Indirect Embedded Emissions')) || ep.summary.totalIndirectEmbeddedEmissions || 0;
    ep.summary.totalEmbeddedEmissions = Number(getValueByLabel(rows, 'Total Embedded Emissions')) || ep.summary.totalEmbeddedEmissions || 0;
    ep.summary.averageDataQuality = Number(getValueByLabel(rows, 'Average Data Quality')) || ep.summary.averageDataQuality || 0;
    ep.summary.verifiedPrecursors = Number(getValueByLabel(rows, 'Verified Precursors')) || ep.summary.verifiedPrecursors || 0;
    ep.overallDataQuality = getValueByLabel(rows, 'Overall Data Quality') || ep.overallDataQuality || '';
    ep.overallVerificationStatus = getValueByLabel(rows, 'Overall Verification Status') || ep.overallVerificationStatus || '';
    // Validation Status block
    ep.validationStatus = ep.validationStatus || { isValid: true, errors: [], warnings: [], completenessScore: 0 };
    const eIsValid = getValueByLabel(rows, 'Is Valid');
    const eErrors = getValueByLabel(rows, 'Errors Count');
    const eWarnings = getValueByLabel(rows, 'Warnings Count');
    const eComplete = getValueByLabel(rows, 'Completeness Score');
    if (eIsValid !== undefined) ep.validationStatus.isValid = String(eIsValid).toLowerCase() === 'yes' || eIsValid === true;
    if (eErrors !== undefined) ep.validationStatus.errors = new Array(Number(eErrors) || 0).fill('');
    if (eWarnings !== undefined) ep.validationStatus.warnings = new Array(Number(eWarnings) || 0).fill('');
    if (eComplete !== undefined) ep.validationStatus.completenessScore = Number(eComplete) || 0;
  }

  const fWs = wb.Sheets['F_Emissions'];
  if (fWs) {
    const rows = readRows(fWs);
    const f = nextData.fEmissions as any;
    if (!f) nextData.fEmissions = { additionalEmissions: [], emissionCalculations: {}, metadata: {}, verificationData: {}, validationStatus: { isValid: true, errors: [], warnings: [], completenessScore: 0 } } as any;
    const fd = nextData.fEmissions as any;
    fd.metadata = fd.metadata || {};
    fd.emissionCalculations = fd.emissionCalculations || {};
    fd.metadata.reportingPeriod = getValueByLabels(rows, ['Reporting Period', 'Period izveštavanja', 'Period izvještavanja']) || fd.metadata.reportingPeriod || '';
    fd.emissionCalculations.totalCO2 = Number(getValueByLabel(rows, 'Total CO2')) || fd.emissionCalculations.totalCO2 || 0;
    fd.emissionCalculations.totalN2O = Number(getValueByLabel(rows, 'Total N2O')) || fd.emissionCalculations.totalN2O || 0;
    fd.emissionCalculations.totalPFC = Number(getValueByLabel(rows, 'Total PFC')) || fd.emissionCalculations.totalPFC || 0;
    fd.emissionCalculations.totalBiomassCO2 = Number(getValueByLabel(rows, 'Total Biomass CO2')) || fd.emissionCalculations.totalBiomassCO2 || 0;
    fd.emissionCalculations.totalFossilCO2 = Number(getValueByLabel(rows, 'Total Fossil CO2')) || fd.emissionCalculations.totalFossilCO2 || 0;
    fd.emissionCalculations.totalGHG = Number(getValueByLabel(rows, 'Total GHG')) || fd.emissionCalculations.totalGHG || 0;
    fd.emissionCalculations.co2Equivalent = Number(getValueByLabel(rows, 'CO2 Equivalent')) || fd.emissionCalculations.co2Equivalent || 0;
    // Verification block
    fd.verificationData = fd.verificationData || {};
    const vBody = getValueByLabel(rows, 'Verification Body');
    const vDate = getValueByLabel(rows, 'Verification Date');
    const vLevel = getValueByLabel(rows, 'Verification Level');
    const vResult = getValueByLabel(rows, 'Verification Result');
    if (vBody !== undefined) fd.verificationData.verificationBody = String(vBody || '');
    if (vDate !== undefined) fd.verificationData.verificationDate = String(vDate || '');
    if (vLevel !== undefined) fd.verificationData.verificationLevel = String(vLevel || '');
    if (vResult !== undefined) fd.verificationData.verificationResult = String(vResult || '');
    // Validation Status block
    fd.validationStatus = fd.validationStatus || { isValid: true, errors: [], warnings: [], completenessScore: 0 };
    const fIsValid = getValueByLabel(rows, 'Is Valid');
    const fErrors = getValueByLabel(rows, 'Errors Count');
    const fWarnings = getValueByLabel(rows, 'Warnings Count');
    const fComplete = getValueByLabel(rows, 'Completeness Score');
    if (fIsValid !== undefined) fd.validationStatus.isValid = String(fIsValid).toLowerCase() === 'yes' || fIsValid === true;
    if (fErrors !== undefined) fd.validationStatus.errors = new Array(Number(fErrors) || 0).fill('');
    if (fWarnings !== undefined) fd.validationStatus.warnings = new Array(Number(fWarnings) || 0).fill('');
    if (fComplete !== undefined) fd.validationStatus.completenessScore = Number(fComplete) || 0;
  }

  return nextData;
};