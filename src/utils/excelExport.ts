import { CBAMData, CalculationResults } from '../types/CBAMData';
import { PurchasedPrecursorItem, ProcessConsumption } from '../types/EPurchasedTypes';
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
const buildWorkbook = (data: CBAMData, results: CalculationResults): XLSX.WorkBook => {
  const wb = XLSX.utils.book_new();
  const sheetData: (string | number)[][] = [
    ['Company Information'],
    ['Name', data.companyInfo.companyName],
    ['Address', data.companyInfo.companyAddress],
    ['Contact Person', data.companyInfo.companyContactPerson],
    ['Phone', data.companyInfo.companyPhone],
    ['Email', data.companyInfo.companyEmail],
    ['Country', data.companyInfo.companyCountry ?? ''],
    [''],
    ['Report Configuration'],
    ['Reporting Period', `${(data.aInstData?.reportingPeriod?.startDate || '')}${data.aInstData?.reportingPeriod?.startDate ? ' – ' : ''}${data.aInstData?.reportingPeriod?.endDate || ''}`],
    ['Installation ID', (data.aInstData?.installationIdentification?.installationId ?? data.reportConfig.installationId) || ''],
    ['Installation Name', (data.aInstData?.installationIdentification?.installationName ?? '')],
    ['Country', (data.aInstData?.installationAddress?.country ?? '')],
    ['Address', (data.aInstData?.installationAddress?.streetAndNumber ?? '')],
    [''],
    ['Installation Details'],
    ['Installation Type', (data.aInstData?.installationIdentification?.installationType ?? data.installationDetails.installationType) || ''],
    ['Main Activity', (data.aInstData?.installationIdentification?.mainActivity ?? data.installationDetails.mainActivity) || ''],
    ['Economic Activity', (data.aInstData?.installationIdentification?.economicActivity ?? data.installationDetails.economicActivity) || ''],
    ['CN Code', (data.aInstData?.installationIdentification?.cnCode ?? data.installationDetails.cnCode) || ''],
    ['Production Capacity', (data.aInstData?.installationIdentification?.productionCapacity ?? data.installationDetails.productionCapacity) || 0],
    ['Annual Production', (data.aInstData?.installationIdentification?.annualProduction ?? data.installationDetails.annualProduction) || 0],
    ['Installation English Name', (data.aInstData?.installationIdentification?.installationEnglishName ?? data.installationDetails.installationEnglishName) || ''],
    ['Street and Number', (data.aInstData?.installationAddress?.streetAndNumber ?? data.installationDetails.streetAndNumber) || ''],
    ['Postal Code', (data.aInstData?.installationAddress?.postalCode ?? data.installationDetails.postalCode) || ''],
    ['PO Box', (data.aInstData?.installationAddress?.poBox ?? data.installationDetails.poBox) || ''],
    ['City', (data.aInstData?.installationAddress?.city ?? data.installationDetails.city) || ''],
    ['Country', (data.aInstData?.installationAddress?.country ?? data.installationDetails.country) || ''],
    ['UNLOCODE', (data.aInstData?.installationAddress?.unlocode ?? data.installationDetails.unlocode) || ''],
    ['Latitude', (data.aInstData?.installationAddress?.latitude ?? data.installationDetails.latitude) || ''],
    ['Longitude', (data.aInstData?.installationAddress?.longitude ?? data.installationDetails.longitude) || ''],
    ['Authorized Representative Name', (data.aInstData?.authorizedRepresentative?.name ?? data.installationDetails.authorizedRepresentativeName) || ''],
    ['Authorized Representative Email', (data.aInstData?.authorizedRepresentative?.email ?? data.installationDetails.authorizedRepresentativeEmail) || ''],
    ['Authorized Representative Telephone', (data.aInstData?.authorizedRepresentative?.telephone ?? data.installationDetails.authorizedRepresentativeTelephone) || ''],
    [''],
    ['Reporting Period Details'],
    ['Start Date', (data.aInstData?.reportingPeriod?.startDate ?? data.installationDetails.startDate) || ''],
    ['End Date', (data.aInstData?.reportingPeriod?.endDate ?? data.installationDetails.endDate) || ''],
    [''],
    ['Verifier Details'],
    ['Verifier Company Name', (data.aInstData?.verifierInformation?.companyName ?? data.installationDetails.verifierCompanyName) || ''],
    ['Verifier Street and Number', (data.aInstData?.verifierInformation?.streetAndNumber ?? data.installationDetails.verifierStreetAndNumber) || ''],
    ['Verifier City', (data.aInstData?.verifierInformation?.city ?? data.installationDetails.verifierCity) || ''],
    ['Verifier Postal Code', (data.aInstData?.verifierInformation?.postalCode ?? data.installationDetails.verifierPostalCode) || ''],
    ['Verifier Country', (data.aInstData?.verifierInformation?.country ?? data.installationDetails.verifierCountry) || ''],
    ['Verifier Authorized Representative', (data.aInstData?.verifierInformation?.authorizedRepresentative ?? data.installationDetails.verifierAuthorizedRepresentative) || ''],
    ['Verifier Name', (data.aInstData?.verifierInformation?.verificationReportReference ?? data.installationDetails.verifierName) || ''],
    ['Verifier Email', (data.aInstData?.verifierInformation?.email ?? data.installationDetails.verifierEmail) || ''],
    ['Verifier Telephone', (data.aInstData?.verifierInformation?.telephone ?? data.installationDetails.verifierTelephone) || ''],
    ['Verifier Fax', (data.aInstData?.verifierInformation?.fax ?? data.installationDetails.verifierFax) || ''],
    ['Accreditation Member State', (data.aInstData?.verifierInformation?.accreditationMemberState ?? data.installationDetails.accreditationMemberState) || ''],
    ['Accreditation Body Name', (data.aInstData?.verifierInformation?.accreditationBodyName ?? data.installationDetails.accreditationBodyName) || ''],
    ['Accreditation Registration Number', (data.aInstData?.verifierInformation?.accreditationRegistrationNumber ?? data.installationDetails.accreditationRegistrationNumber) || ''],
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

  const aSheetRows: (string | number)[][] = [];
  const a = data.aInstData as any;
  aSheetRows.push(['A_InstData']);
  aSheetRows.push(['Reporting Period']);
  aSheetRows.push(['Reporting Period Start', (a?.reportingPeriod?.startDate ?? data.installationDetails.startDate) || '']);
  aSheetRows.push(['Reporting Period End', (a?.reportingPeriod?.endDate ?? data.installationDetails.endDate) || '']);
  aSheetRows.push(['Is Full Calendar Year', a?.reportingPeriod?.isFullCalendarYear ? 'Yes' : 'No']);
  aSheetRows.push(['Reporting Year', a?.reportingPeriod?.reportingYear ?? '']);
  aSheetRows.push(['Reporting Quarter', a?.reportingPeriod?.reportingQuarter ?? '']);
  aSheetRows.push(['']);
  aSheetRows.push(['About the Installation']);
  aSheetRows.push(['Installation Name', (a?.installationIdentification?.installationName ?? data.installationDetails.installationName) || '']);
  aSheetRows.push(['Installation English Name', (a?.installationIdentification?.installationEnglishName ?? data.installationDetails.installationEnglishName) || '']);
  aSheetRows.push(['Installation ID', (a?.installationIdentification?.installationId ?? data.reportConfig.installationId) || '']);
  aSheetRows.push(['Installation Type', (a?.installationIdentification?.installationType ?? data.installationDetails.installationType) || '']);
  aSheetRows.push(['Main Activity', (a?.installationIdentification?.mainActivity ?? data.installationDetails.mainActivity) || '']);
  aSheetRows.push(['Economic Activity', (a?.installationIdentification?.economicActivity ?? data.installationDetails.economicActivity) || '']);
  aSheetRows.push(['CN Code', (a?.installationIdentification?.cnCode ?? data.installationDetails.cnCode) || '']);
  aSheetRows.push(['Production Capacity', (a?.installationIdentification?.productionCapacity ?? data.installationDetails.productionCapacity) || 0]);
  aSheetRows.push(['Capacity Unit', (a?.installationIdentification?.capacityUnit ?? data.installationDetails.capacityUnit) || '']);
  aSheetRows.push(['Annual Production', (a?.installationIdentification?.annualProduction ?? data.installationDetails.annualProduction) || 0]);
  aSheetRows.push(['Production Unit', (a?.installationIdentification?.productionUnit ?? data.installationDetails.productionUnit) || '']);
  aSheetRows.push(['']);
  aSheetRows.push(['Address']);
  aSheetRows.push(['Street and Number', (a?.installationAddress?.streetAndNumber ?? data.installationDetails.streetAndNumber) || '']);
  aSheetRows.push(['Postal Code', (a?.installationAddress?.postalCode ?? data.installationDetails.postalCode) || '']);
  aSheetRows.push(['PO Box', (a?.installationAddress?.poBox ?? data.installationDetails.poBox) || '']);
  aSheetRows.push(['City', (a?.installationAddress?.city ?? data.installationDetails.city) || '']);
  aSheetRows.push(['Country', (a?.installationAddress?.country ?? data.installationDetails.country) || '']);
  aSheetRows.push(['UNLOCODE', (a?.installationAddress?.unlocode ?? data.installationDetails.unlocode) || '']);
  aSheetRows.push(['Latitude', (a?.installationAddress?.latitude ?? data.installationDetails.latitude) || '']);
  aSheetRows.push(['Longitude', (a?.installationAddress?.longitude ?? data.installationDetails.longitude) || '']);
  aSheetRows.push(['']);
  aSheetRows.push(['Authorized Representative']);
  aSheetRows.push(['Name', (a?.authorizedRepresentative?.name ?? data.installationDetails.authorizedRepresentativeName) || '']);
  aSheetRows.push(['Email', (a?.authorizedRepresentative?.email ?? data.installationDetails.authorizedRepresentativeEmail) || '']);
  aSheetRows.push(['Telephone', (a?.authorizedRepresentative?.telephone ?? data.installationDetails.authorizedRepresentativeTelephone) || '']);
  aSheetRows.push(['']);
  aSheetRows.push(['Verifier Information']);
  aSheetRows.push(['Verifier Company Name', (a?.verifierInformation?.companyName ?? data.installationDetails.verifierCompanyName) || '']);
  aSheetRows.push(['Verifier Street and Number', (a?.verifierInformation?.streetAndNumber ?? data.installationDetails.verifierStreetAndNumber) || '']);
  aSheetRows.push(['Verifier City', (a?.verifierInformation?.city ?? data.installationDetails.verifierCity) || '']);
  aSheetRows.push(['Verifier Postal Code', (a?.verifierInformation?.postalCode ?? data.installationDetails.verifierPostalCode) || '']);
  aSheetRows.push(['Verifier Country', (a?.verifierInformation?.country ?? data.installationDetails.verifierCountry) || '']);
  aSheetRows.push(['Verifier Authorized Representative', (a?.verifierInformation?.authorizedRepresentative ?? data.installationDetails.verifierAuthorizedRepresentative) || '']);
  aSheetRows.push(['Verifier Email', (a?.verifierInformation?.email ?? data.installationDetails.verifierEmail) || '']);
  aSheetRows.push(['Verifier Telephone', (a?.verifierInformation?.telephone ?? data.installationDetails.verifierTelephone) || '']);
  aSheetRows.push(['Verifier Fax', (a?.verifierInformation?.fax ?? data.installationDetails.verifierFax) || '']);
  aSheetRows.push(['Accreditation Member State', (a?.verifierInformation?.accreditationMemberState ?? data.installationDetails.accreditationMemberState) || '']);
  aSheetRows.push(['Accreditation Body Name', (a?.verifierInformation?.accreditationBodyName ?? data.installationDetails.accreditationBodyName) || '']);
  aSheetRows.push(['Accreditation Registration Number', (a?.verifierInformation?.accreditationRegistrationNumber ?? data.installationDetails.accreditationRegistrationNumber) || '']);
  aSheetRows.push(['']);
  aSheetRows.push(['Aggregated Goods Categories']);
  aSheetRows.push(['Category', 'Routes']);
  ;(a?.aggregatedGoodsCategories ?? data.installationDetails.aggregatedGoods ?? []).forEach((g: any) => {
    const routes = (g.productionRoutes ?? g.routes ?? []).map((r: any) => (typeof r === 'string' ? r : r?.routeName)).filter(Boolean).join(' ; ');
    aSheetRows.push([g.category ?? g.categoryCode ?? '', routes]);
  });
  aSheetRows.push(['']);
  aSheetRows.push(['Production Processes']);
  aSheetRows.push(['Process Name', 'Included Goods Categories']);
  ;(a?.productionProcesses ?? data.installationDetails.productionProcesses ?? []).forEach((p: any) => {
    aSheetRows.push([p.name ?? '', (p.includedGoodsCategories ?? []).join(' ; ')]);
  });
  const aWs = XLSX.utils.aoa_to_sheet(aSheetRows);
  XLSX.utils.book_append_sheet(wb, aWs, 'A_InstData');

  let dData = (data as any).dProcessesData;
  if (!dData || !Array.isArray(dData.productionProcesses)) {
    const pp = (data.processProductionData || []) as any[];
    if (pp.length > 0) {
      const toTJ = (val: number, unit: string) => {
        if (unit === 'GJ') return (val || 0) / 1000;
        if (unit === 'MWh') return ((val || 0) * 3.6) / 1000;
        return val || 0;
      };
      const efToTJ = (ef: number, unit: string) => {
        if (unit === 't/GJ' || unit === 'tCO2/GJ') return (ef || 0) * 1000;
        if (unit === 't/kWh' || unit === 'tCO2/kWh') return ((ef || 0) * 1000) / 3.6;
        return ef || 0;
      };
      dData = {
        reportingPeriod: { startDate: new Date(), endDate: new Date(), reportingEntity: '' },
        productionProcesses: pp.map((p, idx) => {
          const total = Number(p.totalProductionWithinInstallation ?? p.productionQuantity ?? p.productionAmount ?? 0) || 0;
          const market = Number(p.producedForMarket ?? 0) || 0;
          const ms = total > 0 ? Math.min(100, Math.max(0, (market / total) * 100)) : 0;
          const mhUnit = String(p.measurableHeatData?.unit || '');
          const mhQtyTJ = toTJ(Number(p.measurableHeatData?.quantity || 0), mhUnit);
          const mhImpTJ = toTJ(Number(p.measurableHeatData?.imported || 0), mhUnit);
          const mhExpTJ = toTJ(Number(p.measurableHeatData?.exported || 0), mhUnit);
          const mhEfTJ = efToTJ(Number(p.measurableHeatData?.emissionFactor || 0), String(p.measurableHeatData?.emissionFactorUnit || ''));
          const elUnit = String(p.electricityUnit || 'MWh');
          const elEFUnit = String(p.electricityEmissionFactorUnit || 't/MWh');
          const elCons = Number(p.electricityConsumption || 0) || 0;
          const elEF = Number(p.electricityEmissionFactor || 0) || 0;
          const expUnit = String(p.electricityExportedUnit || 'MWh');
          const expEFUnit = String(p.electricityExportedEmissionFactorUnit || 't/MWh');
          const expAmt = Number(p.electricityExportedAmount || 0) || 0;
          const expEF = Number(p.electricityExportedEmissionFactor || 0) || 0;
          return {
            id: `process-${idx + 1}`,
            processNumber: idx + 1,
            name: String(p.processName || ''),
            productionRoute: String(p.processType || ''),
            unit: String(p.unit || 't'),
            amounts: total,
            producedForMarket: market,
            shareProducedForMarket: Number(p.marketSharePercent ?? ms) || 0,
            totalProductionOnlyForMarket: !!p.isProductionOnlyForMarket,
            consumedInOtherProcesses: [],
            consumedForNonCBAMGoods: Number(p.nonCBAMAmount || 0) || 0,
            controlTotal: Number(p.processEmissions || 0) || 0,
            directlyAttributableEmissions: { applicable: Number(p.processEmissions || 0) > 0, amount: Number(p.processEmissions || 0) || 0, unit: 'tCO2e', calculationMethod: '', dataSource: '' },
            measurableHeat: { applicable: !!p.applicableElements?.measurableHeat, netAmount: mhQtyTJ, unit: 'TJ', emissionFactor: mhEfTJ, emissionFactorUnit: 'tCO2/TJ', imported: mhImpTJ, exported: mhExpTJ },
            wasteGases: { applicable: !!p.applicableElements?.wasteGases, amount: 0, unit: 'TJ', emissionFactor: 0, emissionFactorUnit: 'tCO2/TJ', imported: 0, exported: 0 },
            indirectEmissions: { applicable: !!p.applicableElements?.indirectEmissions, electricityConsumption: elCons, electricityUnit: elUnit === 'kWh' ? 'kWh' : elUnit === 'GJ' ? 'GJ' : 'MWh', emissionFactor: elEF, emissionFactorUnit: elEFUnit === 't/kWh' ? 'tCO2/kWh' : elEFUnit === 't/GJ' ? 'tCO2/GJ' : 'tCO2/MWh', emissionFactorSource: '', emissionFactorMethod: '' },
            electricityExported: { applicable: (expAmt || 0) > 0, exportedAmount: expAmt, unit: expUnit === 'kWh' ? 'kWh' : expUnit === 'GJ' ? 'GJ' : 'MWh', emissionFactor: expEF, emissionFactorUnit: expEFUnit === 't/kWh' ? 'tCO2/kWh' : expEFUnit === 't/GJ' ? 'tCO2/GJ' : 'tCO2/MWh' },
            inputOutputMatrix: { processToProcess: [], processToProduct: [], precursorConsumption: [], totalInputs: [], totalOutputs: [], netProduction: [], matrixSize: 0, goodsProduced: [], precursors: [] },
            validationStatus: { isComplete: false, missingFields: [], errors: [], warnings: [], completenessPercentage: 0, productionDataComplete: false, emissionsDataComplete: false, inputOutputMatrixComplete: false, calculationsValid: false },
            calculatedEmissions: { directEmissionsTotal: 0, directEmissionsPerUnit: 0, indirectEmissionsTotal: 0, indirectEmissionsPerUnit: 0, heatEmissionsTotal: 0, heatEmissionsPerUnit: 0, wasteGasEmissionsTotal: 0, wasteGasEmissionsPerUnit: 0, electricityExportCredit: 0, netAttributedEmissions: 0, netAttributedEmissionsPerUnit: 0, specificEmbeddedEmissions: 0, uncertaintyPercentage: 0, confidenceInterval: [0, 0] },
            excelRowMapping: {}
          };
        }),
        processSummary: { totalProcesses: 0, totalProduction: 0, totalAttributedEmissions: 0, averageSEE: 0, processesWithCompleteData: 0, processesWithValidCalculations: 0 },
        inputOutputSummary: { totalInternalFlows: 0, totalExternalInputs: 0, totalProductOutputs: 0, totalPrecursorInputs: 0, matrixCompleteness: 0 },
        validationStatus: { isComplete: false, missingFields: [], errors: [], warnings: [], completenessPercentage: 0 },
        excelRowMapping: {}
      } as any;
    }
  }
  if (dData && Array.isArray(dData.productionProcesses)) {
    const dSheet: (string | number | boolean)[][] = [];
    dSheet.push(['D_Processes - Proizvodni procesi']);
    dSheet.push(['#', 'Naziv', 'Ruta', 'Jedinica', 'Ukupno', 'Za tržište', 'Udio %', 'Samo tržište']);
    dData.productionProcesses.forEach((p: any) => {
      dSheet.push([
        p.processNumber || '',
        p.name || '',
        p.productionRoute || '',
        p.unit || '',
        p.amounts || 0,
        p.producedForMarket || 0,
        p.shareProducedForMarket || 0,
        !!p.totalProductionOnlyForMarket
      ]);
    });
    dSheet.push(['']);
    dSheet.push(['Direktne emisije', 'tCO2e']);
    dData.productionProcesses.forEach((p: any) => {
      const val = (p.directlyAttributableEmissions?.applicable ? (p.directlyAttributableEmissions?.amount || 0) : 0);
      dSheet.push([`Proces ${p.processNumber}`, val]);
    });
    dSheet.push(['']);
    dSheet.push(['Mjerljiva toplota', 'Neto (TJ)', 'Uvezena (TJ)', 'Izvezena (TJ)', 'EF (tCO2/TJ)']);
    dData.productionProcesses.forEach((p: any) => {
      const mh = p.measurableHeat || {};
      dSheet.push([`Proces ${p.processNumber}`, mh.netAmount || 0, mh.imported || 0, mh.exported || 0, mh.emissionFactor || 0]);
    });
    dSheet.push(['']);
    dSheet.push(['Otpadni plinovi', 'Količina (TJ)', 'Uvezena (TJ)', 'Izvezena (TJ)', 'EF (tCO2/TJ)']);
    dData.productionProcesses.forEach((p: any) => {
      const wg = p.wasteGases || {};
      dSheet.push([`Proces ${p.processNumber}`, wg.amount || 0, wg.imported || 0, wg.exported || 0, wg.emissionFactor || 0]);
    });
    dSheet.push(['']);
    dSheet.push(['Neizravne emisije (el. energija)', 'Potrošnja', 'Jedinica', 'EF', 'Jedinica EF']);
    dData.productionProcesses.forEach((p: any) => {
      const ie = p.indirectEmissions || {};
      dSheet.push([`Proces ${p.processNumber}`, ie.electricityConsumption || 0, ie.electricityUnit || '', ie.emissionFactor || 0, ie.emissionFactorUnit || '']);
    });
    dSheet.push(['']);
    dSheet.push(['Izvoz električne energije', 'Količina', 'Jedinica', 'EF', 'Jedinica EF']);
    dData.productionProcesses.forEach((p: any) => {
      const ex = p.electricityExported || {};
      dSheet.push([`Proces ${p.processNumber}`, ex.exportedAmount || 0, ex.unit || '', ex.emissionFactor || 0, ex.emissionFactorUnit || '']);
    });
    dSheet.push(['']);
    dSheet.push(['Ne‑CBAM dobra i kontrola', 'Ne‑CBAM količina', 'Kontrolni total']);
    dData.productionProcesses.forEach((p: any) => {
      dSheet.push([`Proces ${p.processNumber}`, p.consumedForNonCBAMGoods || 0, p.controlTotal || 0]);
    });
    dSheet.push(['']);
    dSheet.push(['Rezultati', 'Neto emisije (tCO2e)', 'SEE (tCO2e/jed)']);
    dData.productionProcesses.forEach((p: any) => {
      const calc = p.calculatedEmissions || {};
      dSheet.push([`Proces ${p.processNumber}`, calc.netAttributedEmissions || 0, calc.specificEmbeddedEmissions || 0]);
    });
    const dWs = XLSX.utils.aoa_to_sheet(dSheet);
    XLSX.utils.book_append_sheet(wb, dWs, 'D_Processes');

    const ioSheet: (string | number)[][] = [];
    ioSheet.push(['InputOutput - Proces→Proces']);
    ioSheet.push(['From', 'To', 'Amount', 'Unit', 'Share', 'Method']);
    dData.productionProcesses.forEach((p: any) => {
      (p.inputOutputMatrix?.processToProcess || []).forEach((row: any) => {
        ioSheet.push([row.fromProcess || p.processNumber || 0, row.toProcess || 0, row.amount || 0, row.unit || '', row.share || 0, row.calculationMethod || '']);
      });
    });
    ioSheet.push(['']);
    ioSheet.push(['InputOutput - Proces→Proizvod']);
    ioSheet.push(['Process', 'Product', 'Amount', 'Unit', 'Share of total', 'CBAM relevant']);
    dData.productionProcesses.forEach((p: any) => {
      (p.inputOutputMatrix?.processToProduct || []).forEach((row: any) => {
        ioSheet.push([row.processNumber || p.processNumber || 0, row.productNumber || 0, row.amount || 0, row.unit || '', row.shareOfTotal || 0, row.cbamRelevant ? 'Yes' : 'No']);
      });
    });
    ioSheet.push(['']);
    ioSheet.push(['InputOutput - Prekursor konzumacija']);
    ioSheet.push(['Process', 'Precursor', 'Amount', 'Unit', 'Source type']);
    dData.productionProcesses.forEach((p: any) => {
      (p.inputOutputMatrix?.precursorConsumption || []).forEach((row: any) => {
        ioSheet.push([row.processNumber || p.processNumber || 0, row.precursorNumber || 0, row.amount || 0, row.unit || '', row.sourceType || '']);
      });
    });
    const ioWs = XLSX.utils.aoa_to_sheet(ioSheet);
    XLSX.utils.book_append_sheet(wb, ioWs, 'InputOutput');
  }

  // B_EmInst sheet (Emission Installation Data)
  const b = (data as any).bEmInstData || {};
  if (b && Array.isArray(b.emissionSources)) {
    const bSheet: (string | number)[][] = [];
    bSheet.push(['B_EmInst - Izvori emisija']);
    bSheet.push(['Row', 'Method', 'Source Stream', 'AD', 'AD Unit', 'NCV', 'NCV Unit', 'EF', 'EF Unit', 'CC', 'CC Unit', 'OxF', 'ConvF', 'Biomass %', 'Non-sust. Biomass %', 'Energy Fossil (TJ)', 'Energy Biomass (TJ)', 'CO2e Fossil', 'CO2e Biomass', 'CO2e Non-sust. Biomass', 'Data Source', 'Notes']);
    (b.emissionSources || []).forEach((s: any) => {
      bSheet.push([
        s.rowNumber ?? '',
        s.method ?? '',
        s.sourceStreamName ?? '',
        s.activityData ?? 0,
        s.activityDataUnit ?? '',
        s.netCalorificValue ?? '',
        s.netCalorificValueUnit ?? '',
        s.emissionFactor ?? '',
        s.emissionFactorUnit ?? '',
        s.carbonContent ?? '',
        s.carbonContentUnit ?? '',
        s.oxidationFactor ?? '',
        s.conversionFactor ?? '',
        s.biomassContent ?? '',
        s.nonSustainableBiomassContent ?? '',
        s.energyContentFossil ?? 0,
        s.energyContentBiomass ?? 0,
        s.co2eFossil ?? 0,
        s.co2eBiomass ?? 0,
        s.co2eNonSustainableBiomass ?? 0,
        s.dataSource ?? '',
        s.notes ?? ''
      ]);
    });

    // PFC section if present
    if (Array.isArray(b.pfcEmissions) && b.pfcEmissions.length > 0) {
      bSheet.push(['']);
      bSheet.push(['PFC Emissions']);
      bSheet.push(['Row', 'Method', 'Technology', 'Frequency', 'Duration', 'SEF CF4', 'AEo', 'CE', 'CE Unit', 'OVC', 'C2F6 Factor', 'CF4 (t)', 'C2F6 (t)', 'GWP CF4', 'GWP C2F6', 'CF4 CO2e', 'C2F6 CO2e', 'Collection Efficiency']);
      (b.pfcEmissions || []).forEach((p: any) => {
        const ceUnit = (p.ce || 0) > 0 ? ((p.ce || 0) <= 1 ? 'fraction' : '%') : '';
        bSheet.push([
          p.rowNumber ?? '',
          p.method ?? '',
          p.technologyType ?? '',
          p.frequency ?? '',
          p.duration ?? '',
          p.sefCF4 ?? '',
          p.aeo ?? '',
          p.ce ?? '',
          ceUnit,
          p.ovc ?? '',
          p.c2f6Factor ?? '',
          p.cf4EmissionsTons ?? 0,
          p.c2f6EmissionsTons ?? 0,
          p.gwpCF4 ?? '',
          p.gwpC2F6 ?? '',
          p.cf4EmissionsCO2e ?? 0,
          p.c2f6EmissionsCO2e ?? 0,
          p.collectionEfficiency ?? ''
        ]);
      });
    }

    // Measurement-based approaches (section c) sourced from C_InstEmissions
    const c = (data as any).cInstEmissions || {};
    const meas = c.measurementSources || [];
    if (Array.isArray(meas) && meas.length > 0) {
      bSheet.push(['']);
      bSheet.push(['Measurement-Based Approaches']);
      bSheet.push(['#', 'Name', 'Type of GHG', 'Activity data (AD)', 'AD Unit', 'Net calorific value (NCV)', 'Measurement method', 'Data source', 'Data quality', 'Notes']);
      meas.forEach((m: any, idx: number) => {
        bSheet.push([
          m.rowNumber ?? (idx + 1),
          m.name ?? '',
          m.ghgType ?? '',
          m.activityData ?? 0,
          m.activityDataUnit ?? '',
          m.netCalorificValue ?? '',
          m.measurementMethod ?? '',
          m.dataSource ?? '',
          m.dataQuality ?? '',
          m.notes ?? ''
        ]);
      });
    }

    const bWs = XLSX.utils.aoa_to_sheet(bSheet);
    XLSX.utils.book_append_sheet(wb, bWs, 'B_EmInst');
  }

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

    const header = [
      '#',
      'Name',
      'CN Code',
      'Precursor Type',
      'Total Quantity',
      'Unit',
      'Supplier Name',
      'Supplier Country',
      'Direct Embedded Emissions',
      'Direct Emissions Unit',
      'Electricity Consumption',
      'Electricity Unit',
      'Total Specific Embedded Emissions',
      'Total Embedded Emissions Unit',
      'Uses Default Values',
      'Data Quality',
      'Verification Status'
    ];
    const rows: (string | number | boolean)[][] = [header];
    ((e.precursors || []) as PurchasedPrecursorItem[]).forEach((p: PurchasedPrecursorItem, idx: number) => {
      rows.push([
        idx + 1,
        p.name || '',
        p.cnCode || '',
        p.precursorType || '',
        p.totalQuantity || 0,
        p.unit || '',
        p.supplierName || '',
        p.supplierCountry || '',
        p.directEmbeddedEmissions || 0,
        p.directEmissionsUnit || '',
        p.electricityConsumption || 0,
        p.electricityUnit || '',
        p.totalSpecificEmbeddedEmissions || 0,
        p.totalEmbeddedEmissionsUnit || '',
        !!p.usesDefaultValues,
        p.dataQuality || '',
        p.verificationStatus || ''
      ]);
    });
    const ePrecWs = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ePrecWs, 'E_PurchPrec');

    const aHeader: (string | number)[][] = [];
    aHeader.push(['(a) Total purchased levels:']);
    aHeader.push(['#', 'Production route', 'Unit', 'Amounts']);
    ((e.precursors || []) as PurchasedPrecursorItem[]).forEach((p: PurchasedPrecursorItem, idx: number) => {
      aHeader.push([idx + 1, p.productionRoute || '', p.unit || '', p.totalQuantity || 0]);
    });
    aHeader.push(['']);
    aHeader.push(['(b) Consumed in \'production processes\' within the installation:']);
    aHeader.push(['Process', 'Precursor #', 'Amount', 'Unit']);
    ((e.precursors || []) as PurchasedPrecursorItem[]).forEach((p: PurchasedPrecursorItem, idx: number) => {
      ((p.processConsumptions || []) as ProcessConsumption[]).forEach((pc: ProcessConsumption) => {
        aHeader.push([pc.processName || pc.processId || '', idx + 1, pc.quantity || 0, pc.unit || '']);
      });
    });
    const ePrec2 = XLSX.utils.aoa_to_sheet(aHeader);
    XLSX.utils.book_append_sheet(wb, ePrec2, 'E_PurchPrec_Sections');
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

  return wb;
};

export const exportToExcel = (data: CBAMData, results: CalculationResults): Blob => {
  const wb = buildWorkbook(data, results);
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

export const exportToExcelArrayBuffer = (data: CBAMData, results: CalculationResults): Uint8Array => {
  const wb = buildWorkbook(data, results);
  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as any;
  const u8 = new Uint8Array(buf);
  return u8;
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

export const importFromExcel = async (arrayBuffer: ArrayBuffer | Uint8Array | any, existingData: CBAMData): Promise<CBAMData> => {
  let wb: XLSX.WorkBook;
  const input: any = arrayBuffer as any;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(input)) {
    wb = XLSX.read(input, { type: 'buffer' });
  } else {
    wb = XLSX.read(input, { type: 'array' });
  }

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

  const aWs = wb.Sheets['A_InstData'];
  if (aWs) {
    const rows = readRows(aWs);
    const get = (label: string) => getValueByLabel(rows, label);
    const a = (nextData.aInstData || {}) as any;
    a.reportingPeriod = a.reportingPeriod || {};
    const s = get('Reporting Period Start');
    const e2 = get('Reporting Period End');
    const isFY = get('Is Full Calendar Year');
    const rY = get('Reporting Year');
    const rQ = get('Reporting Quarter');
    if (s !== undefined) a.reportingPeriod.startDate = String(s || '');
    if (e2 !== undefined) a.reportingPeriod.endDate = String(e2 || '');
    if (isFY !== undefined) a.reportingPeriod.isFullCalendarYear = String(isFY).toLowerCase() === 'yes' || isFY === true;
    if (rY !== undefined) a.reportingPeriod.reportingYear = Number(rY) || 0;
    if (rQ !== undefined) a.reportingPeriod.reportingQuarter = Number(rQ) || undefined;
    a.installationIdentification = a.installationIdentification || {};
    const ii = a.installationIdentification;
    const name = get('Installation Name');
    const ename = get('Installation English Name');
    const iid = get('Installation ID');
    const it = get('Installation Type');
    const ma = get('Main Activity');
    const ea = get('Economic Activity');
    const cn = get('CN Code');
    const pc = get('Production Capacity');
    const cu = get('Capacity Unit');
    const ap = get('Annual Production');
    const pu = get('Production Unit');
    if (name !== undefined) ii.installationName = String(name || '');
    if (ename !== undefined) ii.installationEnglishName = String(ename || '');
    if (iid !== undefined) ii.installationId = String(iid || '');
    if (it !== undefined) ii.installationType = String(it || '');
    if (ma !== undefined) ii.mainActivity = String(ma || '');
    if (ea !== undefined) ii.economicActivity = String(ea || '');
    if (cn !== undefined) ii.cnCode = String(cn || '');
    if (pc !== undefined) ii.productionCapacity = Number(pc) || 0;
    if (cu !== undefined) ii.capacityUnit = String(cu || '');
    if (ap !== undefined) ii.annualProduction = Number(ap) || 0;
    if (pu !== undefined) ii.productionUnit = String(pu || '');
    a.installationAddress = a.installationAddress || {};
    const ia = a.installationAddress;
    const st = get('Street and Number');
    const po = get('Postal Code');
    const pob = get('PO Box');
    const city = get('City');
    const country = get('Country');
    const ul = get('UNLOCODE');
    const lat = get('Latitude');
    const lon = get('Longitude');
    if (st !== undefined) ia.streetAndNumber = String(st || '');
    if (po !== undefined) ia.postalCode = String(po || '');
    if (pob !== undefined) ia.poBox = String(pob || '');
    if (city !== undefined) ia.city = String(city || '');
    if (country !== undefined) ia.country = String(country || '');
    if (ul !== undefined) ia.unlocode = String(ul || '');
    if (lat !== undefined) ia.latitude = Number(lat) || 0;
    if (lon !== undefined) ia.longitude = Number(lon) || 0;
    a.authorizedRepresentative = a.authorizedRepresentative || {};
    const ar = a.authorizedRepresentative;
    const arn = get('Name');
    const are = get('Email');
    const art = get('Telephone');
    if (arn !== undefined) ar.name = String(arn || '');
    if (are !== undefined) ar.email = String(are || '');
    if (art !== undefined) ar.telephone = String(art || '');
    a.verifierInformation = a.verifierInformation || {};
    const vi = a.verifierInformation;
    const vcn = get('Verifier Company Name');
    const vst = get('Verifier Street and Number');
    const vci = get('Verifier City');
    const vpo = get('Verifier Postal Code');
    const vco = get('Verifier Country');
    const varp = get('Verifier Authorized Representative');
    const vem = get('Verifier Email');
    const vtel = get('Verifier Telephone');
    const vfx = get('Verifier Fax');
    const vms = get('Accreditation Member State');
    const vab = get('Accreditation Body Name');
    const varn = get('Accreditation Registration Number');
    if (vcn !== undefined) vi.companyName = String(vcn || '');
    if (vst !== undefined) vi.streetAndNumber = String(vst || '');
    if (vci !== undefined) vi.city = String(vci || '');
    if (vpo !== undefined) vi.postalCode = String(vpo || '');
    if (vco !== undefined) vi.country = String(vco || '');
    if (varp !== undefined) vi.authorizedRepresentative = String(varp || '');
    if (vem !== undefined) vi.email = String(vem || '');
    if (vtel !== undefined) vi.telephone = String(vtel || '');
    if (vfx !== undefined) vi.fax = String(vfx || '');
    if (vms !== undefined) vi.accreditationMemberState = String(vms || '');
    if (vab !== undefined) vi.accreditationBodyName = String(vab || '');
    if (varn !== undefined) vi.accreditationRegistrationNumber = String(varn || '');
    const aggIdx = rows.findIndex(r => Array.isArray(r) && String(r[0]).trim() === 'Aggregated Goods Categories');
    if (aggIdx >= 0) {
      const header = aggIdx + 1;
      const dataStart = header + 1;
      const list: any[] = [];
      for (let i = dataStart; i < rows.length; i++) {
        const r = rows[i] || [];
        if (!r[0] || (Array.isArray(r) && r.length === 1 && String(r[0]).trim() === '')) break;
        if (String(r[0]).trim() === '') break;
        if (String(r[0]).trim() === 'Production Processes') break;
        const cat = String(r[0] ?? '');
        const routes = String(r[1] ?? '');
        list.push({ category: cat, productionRoutes: routes ? routes.split(' ; ') : [] });
      }
      a.aggregatedGoodsCategories = list;
    }
    const ppIdx = rows.findIndex(r => Array.isArray(r) && String(r[0]).trim() === 'Production Processes');
    if (ppIdx >= 0) {
      const header = ppIdx + 1;
      const dataStart = header + 1;
      const procs: any[] = [];
      for (let i = dataStart; i < rows.length; i++) {
        const r = rows[i] || [];
        if (!r[0]) break;
        const name = String(r[0] ?? '');
        const inc = String(r[1] ?? '');
        if (!name) break;
        procs.push({ name, includedGoodsCategories: inc ? inc.split(' ; ') : [] });
      }
      a.productionProcesses = procs;
    }
    nextData.aInstData = a;
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

  const ePrecWs = wb.Sheets['E_PurchPrec'];
  if (ePrecWs) {
    const rows = XLSX.utils.sheet_to_json(ePrecWs, { header: 1 }) as any[];
    let headerRowIndex = -1;
    let colIndex: Record<string, number> = {} as any;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (Array.isArray(r) && r.includes('Name') && r.includes('CN Code') && r.includes('Precursor Type')) {
        headerRowIndex = i;
        r.forEach((v: any, idx: number) => { if (typeof v === 'string') colIndex[v] = idx; });
        break;
      }
    }
    if (headerRowIndex >= 0) {
      const precursors: any[] = [];
      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const r = rows[i];
        if (!Array.isArray(r) || r.length === 0) break;
        const name = r[colIndex['Name']];
        const unit = r[colIndex['Unit']];
        const supplierName = r[colIndex['Supplier Name']];
        const supplierCountry = r[colIndex['Supplier Country']];
        const totalQuantity = Number(r[colIndex['Total Quantity']] || 0);
        const directEm = Number(r[colIndex['Direct Embedded Emissions']] || 0);
        const elCons = Number(r[colIndex['Electricity Consumption']] || 0);
        const tSee = Number(r[colIndex['Total Specific Embedded Emissions']] || 0);
        const usesDef = !!r[colIndex['Uses Default Values']];
        const verificationStatus = r[colIndex['Verification Status']] || '';
        const dataQuality = r[colIndex['Data Quality']] || '';
        if (!name && !supplierName && totalQuantity === 0) break;
        precursors.push({
          id: `precursor_${i}`,
          name: String(name || ''),
          cnCode: String(r[colIndex['CN Code']] || ''),
          precursorType: String(r[colIndex['Precursor Type']] || ''),
          totalQuantity,
          unit: String(unit || ''),
          supplierName: String(supplierName || ''),
          supplierCountry: String(supplierCountry || ''),
          directEmbeddedEmissions: directEm,
          directEmissionsUnit: String(r[colIndex['Direct Emissions Unit']] || ''),
          electricityConsumption: elCons,
          electricityUnit: String(r[colIndex['Electricity Unit']] || ''),
          totalSpecificEmbeddedEmissions: tSee,
          totalEmbeddedEmissionsUnit: String(r[colIndex['Total Embedded Emissions Unit']] || ''),
          usesDefaultValues: usesDef,
          dataQuality: String(dataQuality || ''),
          verificationStatus: String(verificationStatus || ''),
          processConsumptions: [],
          nonCBAMQuantity: 0,
          nonCBAMUnit: String(unit || ''),
          lastUpdated: new Date()
        });
      }
      const ep = (nextData.ePurchased || { precursors: [], summary: {}, reportingPeriod: '', overallDataQuality: '', overallVerificationStatus: '', validationStatus: { isValid: true, errors: [], warnings: [], completenessScore: 0 }, metadata: { createdDate: new Date(), lastModified: new Date(), modifiedBy: '', version: '1.0', calculationMethod: 'detailed', dataSource: 'supplier' } }) as any;
      ep.precursors = precursors;
      ep.summary = ep.summary || {};
      ep.summary.totalPrecursors = precursors.length;
      ep.summary.totalQuantity = precursors.reduce((s: number, p: any) => s + (p.totalQuantity || 0), 0);
      nextData.ePurchased = ep;
    }
    let currentPrecIdx = -1;
    const findFirstNumber = (arr: any[]) => {
      for (const v of arr) { if (typeof v === 'number' && !isNaN(v)) return v; }
      return undefined;
    };
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!Array.isArray(r)) continue;
      const str = r.map((c: any) => (typeof c === 'string' ? c : '')).join(' ').toLowerCase();
      if (str.includes('purchased precursor')) {
        let n = findFirstNumber(r);
        if (typeof n !== 'number') {
          for (const c of r) {
            if (typeof c === 'string') {
              const m = c.match(/purchased\s+precursor\s+(\d+)/i);
              if (m) { n = Number(m[1]); break; }
            }
          }
        }
        if (typeof n === 'number') currentPrecIdx = Math.max(0, Number(n) - 1);
      }
      if (currentPrecIdx >= 0) {
        if (str.includes('specific embedded indirect emissions') || str.includes('see (indirect)')) {
          const num = findFirstNumber(r);
          const ep = nextData.ePurchased as any;
          if (ep?.precursors?.[currentPrecIdx]) {
            ep.precursors[currentPrecIdx].indirectEmbeddedEmissions = Number(num || 0);
          }
          continue;
        }
        if (str.includes('justification for use of default values')) {
          const txt = r.filter((c: any) => typeof c === 'string' && c.trim()).pop();
          const ep = nextData.ePurchased as any;
          if (ep?.precursors?.[currentPrecIdx]) {
            ep.precursors[currentPrecIdx].defaultValueJustification = String(txt || '');
            ep.precursors[currentPrecIdx].usesDefaultValues = !!txt && String(txt).toLowerCase() !== 'n.a.';
          }
          continue;
        }
        if (str.includes('elecefmeth_')) {
          const txt = r.filter((c: any) => typeof c === 'string' && c.trim()).pop();
          const ep = nextData.ePurchased as any;
          if (ep?.precursors?.[currentPrecIdx]) {
            ep.precursors[currentPrecIdx].electricityEmissionFactorSource = String(txt || ep.precursors[currentPrecIdx].electricityEmissionFactorSource || '');
          }
          continue;
        }
      }
    }
  }
  const ePrecSections = wb.Sheets['E_PurchPrec_Sections'];
  if (ePrecSections) {
    const rows = XLSX.utils.sheet_to_json(ePrecSections, { header: 1 }) as any[];
    let aIdx = -1;
    let aCols: Record<string, number> = {} as any;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (Array.isArray(r) && String(r[0]).includes('(a)')) { aIdx = i; break; }
    }
    if (aIdx >= 0 && Array.isArray(rows[aIdx + 1])) {
      const hr = rows[aIdx + 1];
      hr.forEach((v: any, idx: number) => { if (typeof v === 'string') aCols[v] = idx; });
      const precs: any[] = []; 
      for (let i = aIdx + 2; i < rows.length; i++) {
        const r = rows[i];
        if (!Array.isArray(r) || (Array.isArray(r) && r.length === 1 && String(r[0]).trim() === '')) break;
        const no = Number(r[aCols['#']] || 0);
        const route = r[aCols['Production route']];
        const unit = r[aCols['Unit']];
        const amt = Number(r[aCols['Amounts']] || 0);
        precs.push({ idx: no, productionRoute: String(route || ''), unit: String(unit || ''), totalQuantity: amt });
      }
      const ep = (nextData.ePurchased || { precursors: [], summary: {} }) as any;
      if (!Array.isArray(ep.precursors) || ep.precursors.length === 0) {
        ep.precursors = precs.map((p: any) => ({ id: `precursor_${p.idx}`, name: '', cnCode: '', precursorType: 'Raw materials', totalQuantity: p.totalQuantity, unit: p.unit, supplierName: '', supplierCountry: '', directEmbeddedEmissions: 0, directEmissionsUnit: 'tCO2e', electricityConsumption: 0, electricityUnit: 'MWh', totalSpecificEmbeddedEmissions: 0, totalEmbeddedEmissionsUnit: 'tCO2e', usesDefaultValues: false, dataQuality: '', verificationStatus: '', productionRoute: p.productionRoute, processConsumptions: [], nonCBAMQuantity: 0, nonCBAMUnit: p.unit, lastUpdated: new Date() }));
      } else {
        precs.forEach((p: any, i: number) => {
          const tgt = ep.precursors[i] || (ep.precursors[i] = { id: `precursor_${i + 1}` } as any);
          tgt.productionRoute = p.productionRoute;
          tgt.unit = p.unit || tgt.unit;
          tgt.totalQuantity = typeof p.totalQuantity === 'number' ? p.totalQuantity : tgt.totalQuantity;
        });
      }
      ep.summary = ep.summary || {};
      ep.summary.totalPrecursors = ep.precursors.length;
      ep.summary.totalQuantity = ep.precursors.reduce((s: number, p: any) => s + (p.totalQuantity || 0), 0);
      nextData.ePurchased = ep;
    }
    let bIdx = -1;
    let bCols: Record<string, number> = {} as any;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (Array.isArray(r) && String(r[0]).includes('(b)')) { bIdx = i; break; }
    }
    if (bIdx >= 0 && Array.isArray(rows[bIdx + 1])) {
      const hr = rows[bIdx + 1];
      hr.forEach((v: any, idx: number) => { if (typeof v === 'string') bCols[v] = idx; });
      const ep = nextData.ePurchased as any;
      for (let i = bIdx + 2; i < rows.length; i++) {
        const r = rows[i];
        if (!Array.isArray(r) || (Array.isArray(r) && r.length === 1 && String(r[0]).trim() === '')) break;
        const pname = r[bCols['Process']];
        const precNo = Number(r[bCols['Precursor #']] || 0);
        const amt = Number(r[bCols['Amount']] || 0);
        const unit = r[bCols['Unit']];
        const tgt = ep.precursors?.[precNo - 1];
        if (tgt) {
          tgt.processConsumptions = tgt.processConsumptions || [];
          tgt.processConsumptions.push({ processId: pname, processName: pname, quantity: amt, unit: String(unit || ''), consumptionType: 'consumption' });
        }
      }
    }
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

  const dWs = wb.Sheets['D_Processes'];
  if (dWs) {
    const rows = readRows(dWs);
    const d = nextData.dProcessesData || { reportingPeriod: { startDate: new Date(), endDate: new Date(), reportingEntity: '' }, productionProcesses: [], processSummary: { totalProcesses: 0, totalProduction: 0, totalAttributedEmissions: 0, averageSEE: 0, processesWithCompleteData: 0, processesWithValidCalculations: 0 }, inputOutputSummary: { totalInternalFlows: 0, totalExternalInputs: 0, totalProductOutputs: 0, totalPrecursorInputs: 0, matrixCompleteness: 0 }, validationStatus: { isComplete: false, missingFields: [], errors: [], warnings: [], completenessPercentage: 0 }, excelRowMapping: {} } as any;

    const headerIdx = rows.findIndex(r => Array.isArray(r) && String(r[0]).trim() === '#');
    if (headerIdx >= 0) {
      const dataStart = headerIdx + 1;
      const processes: any[] = [];
      for (let i = dataStart; i < rows.length; i++) {
        const r = rows[i] || [];
        const first = String(r[0] ?? '').trim();
        if (!first || first === '') break;
        if (String(r[0]).toLowerCase().startsWith('proces')) break;
        const procNumber = Number(r[0] ?? 0) || 0;
        const name = String(r[1] ?? '');
        const route = String(r[2] ?? '');
        const unit = String(r[3] ?? '') || 't';
        const amounts = Number(r[4] ?? 0) || 0;
        const producedForMarket = Number(r[5] ?? 0) || 0;
        const shareProducedForMarket = Number(r[6] ?? 0) || 0;
        const onlyMarket = !!r[7];
        processes.push({
          id: `process-${procNumber}`,
          processNumber: procNumber,
          name,
          productionRoute: route,
          unit,
          amounts,
          producedForMarket,
          shareProducedForMarket,
          totalProductionOnlyForMarket: onlyMarket,
          directlyAttributableEmissions: { applicable: false, amount: 0, unit: 'tCO2e', calculationMethod: '', dataSource: '' },
          measurableHeat: { applicable: false, netAmount: 0, unit: 'TJ', emissionFactor: 0, emissionFactorUnit: 'tCO2/TJ', imported: 0, exported: 0 },
          wasteGases: { applicable: false, amount: 0, unit: 'TJ', emissionFactor: 0, emissionFactorUnit: 'tCO2/TJ', imported: 0, exported: 0 },
          indirectEmissions: { applicable: false, electricityConsumption: 0, electricityUnit: 'MWh', emissionFactor: 0, emissionFactorUnit: 'tCO2/MWh', emissionFactorSource: '', emissionFactorMethod: '' },
          electricityExported: { applicable: false, exportedAmount: 0, unit: 'MWh', emissionFactor: 0, emissionFactorUnit: 'tCO2/MWh' },
          consumedInOtherProcesses: [],
          consumedForNonCBAMGoods: 0,
          controlTotal: 0,
          inputOutputMatrix: { processToProcess: [], processToProduct: [], precursorConsumption: [], totalInputs: [], totalOutputs: [], netProduction: [], matrixSize: 0, goodsProduced: [], precursors: [] },
          validationStatus: { isComplete: false, missingFields: [], errors: [], warnings: [], completenessPercentage: 0, productionDataComplete: false, emissionsDataComplete: false, inputOutputMatrixComplete: false, calculationsValid: false },
          calculatedEmissions: { directEmissionsTotal: 0, directEmissionsPerUnit: 0, indirectEmissionsTotal: 0, indirectEmissionsPerUnit: 0, heatEmissionsTotal: 0, heatEmissionsPerUnit: 0, wasteGasEmissionsTotal: 0, wasteGasEmissionsPerUnit: 0, electricityExportCredit: 0, netAttributedEmissions: 0, netAttributedEmissionsPerUnit: 0, specificEmbeddedEmissions: 0, uncertaintyPercentage: 0, confidenceInterval: [0, 0] },
          excelRowMapping: {}
        });
      }

      const findSection = (label: string) => rows.findIndex(r => Array.isArray(r) && String(r[0]).trim() === label);

      const idxDir = findSection('Direktne emisije');
      if (idxDir >= 0) {
        for (let i = idxDir + 1; i < rows.length; i++) {
          const r = rows[i] || [];
          if (!r[0]) break;
          const tag = String(r[0]).trim();
          if (!tag.toLowerCase().startsWith('proces')) break;
          const num = Number(tag.replace(/[^0-9]/g, '')) || 0;
          const p = processes.find(pp => pp.processNumber === num);
          if (p) {
            const val = Number(r[1] ?? 0) || 0;
            p.directlyAttributableEmissions = { ...p.directlyAttributableEmissions, applicable: val > 0, amount: val };
          }
        }
      }

      const idxMh = findSection('Mjerljiva toplota');
      if (idxMh >= 0) {
        for (let i = idxMh + 1; i < rows.length; i++) {
          const r = rows[i] || [];
          if (!r[0]) break;
          const tag = String(r[0]).trim();
          if (!tag.toLowerCase().startsWith('proces')) break;
          const num = Number(tag.replace(/[^0-9]/g, '')) || 0;
          const p = processes.find(pp => pp.processNumber === num);
          if (p) {
            p.measurableHeat = { ...p.measurableHeat, applicable: true, netAmount: Number(r[1] ?? 0) || 0, imported: Number(r[2] ?? 0) || 0, exported: Number(r[3] ?? 0) || 0, emissionFactor: Number(r[4] ?? 0) || 0 };
          }
        }
      }

      const idxWg = findSection('Otpadni plinovi');
      if (idxWg >= 0) {
        for (let i = idxWg + 1; i < rows.length; i++) {
          const r = rows[i] || [];
          if (!r[0]) break;
          const tag = String(r[0]).trim();
          if (!tag.toLowerCase().startsWith('proces')) break;
          const num = Number(tag.replace(/[^0-9]/g, '')) || 0;
          const p = processes.find(pp => pp.processNumber === num);
          if (p) {
            p.wasteGases = { ...p.wasteGases, applicable: true, amount: Number(r[1] ?? 0) || 0, imported: Number(r[2] ?? 0) || 0, exported: Number(r[3] ?? 0) || 0, emissionFactor: Number(r[4] ?? 0) || 0 };
          }
        }
      }

      const idxInd = findSection('Neizravne emisije (el. energija)');
      if (idxInd >= 0) {
        for (let i = idxInd + 1; i < rows.length; i++) {
          const r = rows[i] || [];
          if (!r[0]) break;
          const tag = String(r[0]).trim();
          if (!tag.toLowerCase().startsWith('proces')) break;
          const num = Number(tag.replace(/[^0-9]/g, '')) || 0;
          const p = processes.find(pp => pp.processNumber === num);
          if (p) {
            p.indirectEmissions = { ...p.indirectEmissions, applicable: true, electricityConsumption: Number(r[1] ?? 0) || 0, electricityUnit: String(r[2] ?? '') || 'MWh', emissionFactor: Number(r[3] ?? 0) || 0, emissionFactorUnit: String(r[4] ?? '') || 'tCO2/MWh' };
          }
        }
      }

      const idxExp = findSection('Izvoz električne energije');
      if (idxExp >= 0) {
        for (let i = idxExp + 1; i < rows.length; i++) {
          const r = rows[i] || [];
          if (!r[0]) break;
          const tag = String(r[0]).trim();
          if (!tag.toLowerCase().startsWith('proces')) break;
          const num = Number(tag.replace(/[^0-9]/g, '')) || 0;
          const p = processes.find(pp => pp.processNumber === num);
          if (p) {
            p.electricityExported = { ...p.electricityExported, applicable: true, exportedAmount: Number(r[1] ?? 0) || 0, unit: String(r[2] ?? '') || 'MWh', emissionFactor: Number(r[3] ?? 0) || 0, emissionFactorUnit: String(r[4] ?? '') || 'tCO2/MWh' };
          }
        }
      }

      const idxNc = findSection('Ne‑CBAM dobra i kontrola');
      if (idxNc >= 0) {
        for (let i = idxNc + 1; i < rows.length; i++) {
          const r = rows[i] || [];
          if (!r[0]) break;
          const tag = String(r[0]).trim();
          if (!tag.toLowerCase().startsWith('proces')) break;
          const num = Number(tag.replace(/[^0-9]/g, '')) || 0;
          const p = processes.find(pp => pp.processNumber === num);
          if (p) {
            p.consumedForNonCBAMGoods = Number(r[1] ?? 0) || 0;
            p.controlTotal = Number(r[2] ?? 0) || 0;
          }
        }
      }

      d.productionProcesses = processes;
      d.processSummary = {
        totalProcesses: processes.length,
        totalProduction: processes.reduce((s, p) => s + (p.amounts || 0), 0),
        totalAttributedEmissions: processes.reduce((s, p) => s + (p.calculatedEmissions?.netAttributedEmissions || 0), 0),
        averageSEE: processes.length ? processes.reduce((s, p) => s + (p.calculatedEmissions?.specificEmbeddedEmissions || 0), 0) / processes.length : 0,
        processesWithCompleteData: processes.filter(p => !!p.name && !!p.unit && (p.amounts || 0) > 0).length,
        processesWithValidCalculations: processes.length
      } as any;

      nextData.dProcessesData = d;
      // Map to processProductionData for UI coherence
      const toProcessProduction = (dp: any): any => {
        const total = Number(dp.amounts || 0) || 0;
        return {
          id: dp.id || `pp-${dp.processNumber}`,
          processName: String(dp.name || ''),
          processType: String(dp.productionRoute || ''),
          productionAmount: total,
          unit: String(dp.unit || 't'),
          inputs: [],
          outputs: [],
          directEmissions: Number(dp.directlyAttributableEmissions?.amount || 0) || 0,
          processEmissions: Number(dp.directlyAttributableEmissions?.amount || 0) || 0,
          totalProductionWithinInstallation: total,
          producedForMarket: Number(dp.producedForMarket || 0) || 0,
          isProductionOnlyForMarket: !!dp.totalProductionOnlyForMarket,
          nonCBAMAmount: Number(dp.consumedForNonCBAMGoods || 0) || 0,
          applicableElements: {
            measurableHeat: !!dp.measurableHeat?.applicable,
            wasteGases: !!dp.wasteGases?.applicable,
            indirectEmissions: !!dp.indirectEmissions?.applicable
          },
          measurableHeatData: {
            quantity: (dp.measurableHeat?.netAmount || 0) * 1000,
            imported: (dp.measurableHeat?.imported || 0) * 1000,
            exported: (dp.measurableHeat?.exported || 0) * 1000,
            unit: 'GJ',
            emissionFactor: (dp.measurableHeat?.emissionFactor || 0) / 1000,
            emissionFactorUnit: 't/GJ',
            shareToCBAMGoods: dp.measurableHeat?.shareToCBAMGoods
          },
          wasteGasesData: {
            quantity: dp.wasteGases?.amount || 0,
            imported: dp.wasteGases?.imported || 0,
            exported: dp.wasteGases?.exported || 0,
            unit: 'TJ',
            emissionFactor: dp.wasteGases?.emissionFactor || 0,
            emissionFactorUnit: dp.wasteGases?.emissionFactorUnit || 'tCO2/TJ',
            reusedShare: dp.wasteGases?.reusedShare
          },
          electricityConsumption: Number(dp.indirectEmissions?.electricityConsumption || 0) || 0,
          electricityUnit: dp.indirectEmissions?.electricityUnit || 'MWh',
          electricityEmissionFactor: Number(dp.indirectEmissions?.emissionFactor || 0) || 0,
          electricityEmissionFactorUnit: dp.indirectEmissions?.emissionFactorUnit || 'tCO2/MWh',
          electricityEmissionFactorSource: dp.indirectEmissions?.emissionFactorSource || '',
          electricityExportedAmount: Number(dp.electricityExported?.exportedAmount || 0) || 0,
          electricityExportedUnit: dp.electricityExported?.unit || 'MWh',
          electricityExportedEmissionFactor: Number(dp.electricityExported?.emissionFactor || 0) || 0,
          electricityExportedEmissionFactorUnit: dp.electricityExported?.emissionFactorUnit || 'tCO2/MWh',
          marketSharePercent: Number(dp.shareProducedForMarket || 0) || 0
        };
      };
      nextData.processProductionData = (d.productionProcesses || []).map(toProcessProduction);
    }
  }

  const ioWs = wb.Sheets['InputOutput'];
  if (ioWs && nextData.dProcessesData && Array.isArray(nextData.dProcessesData.productionProcesses)) {
    const rows = readRows(ioWs);
    const findIdx = (label: string) => rows.findIndex(r => Array.isArray(r) && String(r[0]).trim() === label);

    const p2pIdx = findIdx('InputOutput - Proces→Proces');
    if (p2pIdx >= 0) {
      const header = p2pIdx + 1;
      for (let i = header + 1; i < rows.length; i++) {
        const r = rows[i] || [];
        if (!r[0]) break;
        if (Array.isArray(r) && r.length === 1 && String(r[0]).trim() === '') break;
        const from = Number(r[0] ?? 0) || 0;
        const to = Number(r[1] ?? 0) || 0;
        const amount = Number(r[2] ?? 0) || 0;
        const unit = String(r[3] ?? '') || 't';
        const share = Number(r[4] ?? 0) || 0;
        const method = String(r[5] ?? '') || '';
        const p = nextData.dProcessesData.productionProcesses.find(pp => pp.processNumber === from);
        if (p) {
          const row = { fromProcess: from, toProcess: to, amount, unit, share, calculationMethod: method } as any;
          p.inputOutputMatrix.processToProcess = [...(p.inputOutputMatrix.processToProcess || []), [row] as any];
        }
      }
    }

    const p2prodIdx = findIdx('InputOutput - Proces→Proizvod');
    if (p2prodIdx >= 0) {
      const header = p2prodIdx + 1;
      for (let i = header + 1; i < rows.length; i++) {
        const r = rows[i] || [];
        if (!r[0]) break;
        if (Array.isArray(r) && r.length === 1 && String(r[0]).trim() === '') break;
        const proc = Number(r[0] ?? 0) || 0;
        const prod = Number(r[1] ?? 0) || 0;
        const amount = Number(r[2] ?? 0) || 0;
        const unit = String(r[3] ?? '') || 't';
        const share = Number(r[4] ?? 0) || 0;
        const rel = String(r[5] ?? '') === 'Yes';
        const p = nextData.dProcessesData.productionProcesses.find(pp => pp.processNumber === proc);
        if (p) {
          const row = { processNumber: proc, productNumber: prod, amount, unit, shareOfTotal: share, cbamRelevant: rel } as any;
          p.inputOutputMatrix.processToProduct = [...(p.inputOutputMatrix.processToProduct || []), [row] as any];
        }
      }
    }

    const precIdx = findIdx('InputOutput - Prekursor konzumacija');
    if (precIdx >= 0) {
      const header = precIdx + 1;
      for (let i = header + 1; i < rows.length; i++) {
        const r = rows[i] || [];
        if (!r[0]) break;
        if (Array.isArray(r) && r.length === 1 && String(r[0]).trim() === '') break;
        const proc = Number(r[0] ?? 0) || 0;
        const prec = Number(r[1] ?? 0) || 0;
        const amount = Number(r[2] ?? 0) || 0;
        const unit = String(r[3] ?? '') || 't';
        const sourceType = String(r[4] ?? '') as any;
        const p = nextData.dProcessesData.productionProcesses.find(pp => pp.processNumber === proc);
        if (p) {
          const row = { processNumber: proc, precursorNumber: prec, amount, unit, sourceType } as any;
          p.inputOutputMatrix.precursorConsumption = [...(p.inputOutputMatrix.precursorConsumption || []), [row] as any];
        }
      }
    }
  }

  return nextData;
};