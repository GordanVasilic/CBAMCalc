import { CBAMData, CalculationResults } from '../types/CBAMData';

/**
 * Print Export Utility
 * 
 * This module provides functionality to print CBAM data and results.
 * It creates a formatted print view of the CBAM declaration information.
 */

/**
 * Generate HTML for printing CBAM data and results
 * @param data CBAM data object
 * @param results Calculation results
 * @returns HTML string for printing
 */
const generatePrintHTML = (data: CBAMData, results: CalculationResults): string => {
  // Convert energy/fuel consumption to TJ
  const toTJ = (item: any): number => {
    const unit = (item?.unit ?? '').toString();
    const consumption = Number(item?.consumption ?? 0);
    if (unit === 'TJ') return consumption;
    if (unit === 'GJ') return consumption / 1000;
    if (unit === 'MWh') return (consumption * 3.6) / 1000;
    return 0;
  };

  const energyItems = Array.isArray(data.energyFuelData) ? data.energyFuelData : [];
  const totalFuelInputTJ = energyItems.reduce((sum, i) => sum + toTJ(i), 0);
  const cbamProcTJ = energyItems
    .filter(i => i.useCategory === 'CBAM proizvodni procesi')
    .reduce((sum, i) => sum + toTJ(i), 0);
  const electricityProdTJ = energyItems
    .filter(i => i.useCategory === 'Proizvodnja električne energije')
    .reduce((sum, i) => sum + toTJ(i), 0);
  const nonCbamProcTJ = energyItems
    .filter(i => i.useCategory === 'Ne-CBAM procesi')
    .reduce((sum, i) => sum + toTJ(i), 0);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>CBAM Declaration Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        h1 { text-align: center; color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .section { margin-bottom: 30px; }
        .label { font-weight: bold; width: 200px; }
        .value { padding-left: 10px; }
        .page-break { page-break-before: always; }
        .no-print { display: none; }
        @media print { .no-print { display: none; } .page-break { page-break-before: always; } }
      </style>
    </head>
    <body>
      <h1>CBAM DECLARATION REPORT</h1>
      
      <div class="section">
        <h2>Company Information</h2>
        <table>
          <tr><td class="label">Name:</td><td class="value">${data.companyInfo.companyName}</td></tr>
          <tr><td class="label">Address:</td><td class="value">${data.companyInfo.companyAddress}</td></tr>
          <tr><td class="label">Contact Person:</td><td class="value">${data.companyInfo.companyContactPerson}</td></tr>
          <tr><td class="label">Phone:</td><td class="value">${data.companyInfo.companyPhone}</td></tr>
          <tr><td class="label">Email:</td><td class="value">${data.companyInfo.companyEmail}</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h2>Report Configuration</h2>
        <table>
          <tr><td class="label">Reporting Period:</td><td class="value">${data.reportConfig.reportingPeriod}</td></tr>
          <tr><td class="label">Installation ID:</td><td class="value">${data.reportConfig.installationId}</td></tr>
          <tr><td class="label">Installation Name:</td><td class="value">${data.reportConfig.installationName}</td></tr>
          <tr><td class="label">Country:</td><td class="value">${data.reportConfig.installationCountry}</td></tr>
          <tr><td class="label">Address:</td><td class="value">${data.reportConfig.installationAddress}</td></tr>
        </table>
      </div>
      
      <div class="section">
        <h2>Installation Details</h2>
        <table>
          <tr><td class="label">Installation Type:</td><td class="value">${data.installationDetails.installationType}</td></tr>
          <tr><td class="label">Main Activity:</td><td class="value">${data.installationDetails.mainActivity}</td></tr>
          <tr><td class="label">CN Code:</td><td class="value">${data.installationDetails.cnCode}</td></tr>
          <tr><td class="label">Production Capacity:</td><td class="value">${data.installationDetails.productionCapacity}</td></tr>
          <tr><td class="label">Annual Production:</td><td class="value">${data.installationDetails.annualProduction}</td></tr>
        </table>
      </div>
      
      <div class="page-break"></div>
      
      <div class="section">
        <h2>Energy and Fuel Data</h2>
        <table>
          <thead>
            <tr>
              <th>Fuel Type</th>
              <th>Source</th>
              <th>Namjena</th>
              <th>Consumption</th>
              <th>Unit</th>
              <th>CO2 Emission Factor</th>
              <th>Biomass Share</th>
              <th>Renewable Share</th>
            </tr>
          </thead>
          <tbody>
            ${data.energyFuelData.map(fuel => `
              <tr>
                <td>${fuel.fuelType}</td>
                <td>${fuel.fuelSource}</td>
                <td>${fuel.useCategory ?? ''}</td>
                <td>${fuel.consumption}</td>
                <td>${fuel.unit}</td>
                <td>${fuel.co2EmissionFactor}</td>
                <td>${fuel.biomassShare ?? ''}</td>
                <td>${fuel.renewableShare ?? ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h2>Process and Production Data</h2>
        ${data.processProductionData.map((process, index) => `
          <div style="margin-bottom: 30px;">
            <h3>Process ${index + 1}: ${process.processName}</h3>
            <table style="margin-bottom: 15px;">
              <tr><td class="label">Process Type:</td><td class="value">${process.processType}</td></tr>
              <tr><td class="label">Production Amount:</td><td class="value">${process.productionAmount ?? process.productionQuantity ?? 0} ${process.unit}</td></tr>
              <tr><td class="label">Emission Factor:</td><td class="value">${process.processEmissionFactor ?? 0}</td></tr>
              <tr><td class="label">Emissions:</td><td class="value">${process.processEmissions ?? 0}</td></tr>
            </table>
            
            ${process.inputs.length > 0 ? `
              <h4>Input Materials</h4>
              <table style="margin-bottom: 15px;">
                <thead>
                  <tr><th>Name</th><th>Quantity</th><th>Origin</th><th>Embedded Emissions</th></tr>
                </thead>
                <tbody>
                  ${process.inputs.map(input => `
                    <tr>
                      <td>${input.materialName ?? 'Unknown'}</td>
                      <td>${input.amount ?? input.quantity ?? 0}</td>
                      <td>${input.originCountry ?? input.origin ?? ''}</td>
                      <td>${input.embeddedEmissions ?? ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
            
            ${process.outputs.length > 0 ? `
              <h4>Output Products</h4>
              <table style="margin-bottom: 15px;">
                <thead>
                  <tr><th>Name</th><th>Quantity</th><th>CN Code</th><th>Destination</th></tr>
                </thead>
                <tbody>
                  ${process.outputs.map(output => `
                    <tr>
                      <td>${output.productName ?? 'Unknown'}</td>
                      <td>${output.amount ?? output.quantity ?? 0}</td>
                      <td>${output.cnCode ?? ''}</td>
                      <td>${output.destination ?? ''}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : ''}
          </div>
        `).join('')}
      </div>
      
      <div class="page-break"></div>
      
      <div class="section">
        <h2>Calculation Results</h2>
        <table>
          <tr><td class="label">Total Direct CO2 Emissions:</td><td class="value">${results.totalDirectCO2Emissions} tCO2</td></tr>
          <tr><td class="label">Total Process Emissions:</td><td class="value">${results.totalProcessEmissions} tCO2</td></tr>
          <tr><td class="label">Total Indirect CO2 Emissions:</td><td class="value">${data.emissionInstallationData?.totalIndirectCO2Emissions ?? 0} tCO2</td></tr>
          <tr><td class="label">Total Emissions:</td><td class="value">${results.totalEmissions} tCO2</td></tr>
          <tr><td class="label">Specific Emissions:</td><td class="value">${results.specificEmissions} tCO2/t product</td></tr>
          <tr><td class="label">Total Energy:</td><td class="value">${results.totalEnergy} MWh</td></tr>
          <tr><td class="label">Renewable Share:</td><td class="value">${(results.renewableShare * 100).toFixed(2)}%</td></tr>
          <tr><td class="label">Imported Raw Material Share:</td><td class="value">${(results.importedRawMaterialShare * 100).toFixed(2)}%</td></tr>
          <tr><td class="label">Embedded Emissions:</td><td class="value">${results.embeddedEmissions} tCO2</td></tr>
          <tr><td class="label">Cumulative Emissions:</td><td class="value">${results.cumulativeEmissions} tCO2</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>Fuel Balance (TJ)</h2>
        <table>
          <thead>
            <tr><th>Metric</th><th>Value</th><th>Unit</th></tr>
          </thead>
          <tbody>
            <tr><td>Total Fuel Input</td><td>${totalFuelInputTJ.toFixed(3)}</td><td>TJ</td></tr>
            <tr><td>CBAM proizvodni procesi</td><td>${cbamProcTJ.toFixed(3)}</td><td>TJ</td></tr>
            <tr><td>Proizvodnja električne energije</td><td>${electricityProdTJ.toFixed(3)}</td><td>TJ</td></tr>
            <tr><td>Ne-CBAM procesi</td><td>${nonCbamProcTJ.toFixed(3)}</td><td>TJ</td></tr>
          </tbody>
        </table>
        <p style="font-size: 12px; color: #666;">Napomena: Obuhvaća konverzije GJ/MWh u TJ radi usporedbe.</p>
      </div>
      
      <div class="no-print"><button onclick="window.print()">Print</button></div>
    </body>
    </html>
  `;
};

/**
 * Print CBAM data and results
 * @param data CBAM data object
 * @param results Calculation results
 */
export const printCBAMData = (data: CBAMData, results: CalculationResults): void => {
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(generatePrintHTML(data, results));
    printWindow.document.close();
    
    // Wait for the content to load before printing
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  } else {
    // Fallback for browsers that block popups
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.write(generatePrintHTML(data, results));
      iframeDoc.close();
      
      iframe.onload = () => {
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
      };
    }
  }
};

const printExport = {
  printCBAMData
};

export default printExport;