import * as XLSX from 'xlsx'
import { importFromExcel } from '../../utils/excelExport'
import { E_PURCHASED_DEFAULTS } from '../../types/EPurchasedTypes'
import { CBAMData } from '../../types/CBAMData'

function makeWB(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()
  const rows: any[][] = []
  rows.push([null,null,null,'Purchased precursor 1:',null,null,null,null,null,null,'ElecEFMeth_',null,null,'','n.a.'])
  rows.push([null,null,null,'iv.', 'Specific embedded indirect emissions (SEE (indirect))', null, null, null, null, null, '', '', 12])
  rows.push([null,null,null,'v.', 'Justification for use of default values (if relevant):', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'Default used'])
  rows.push([null,null,null,'Purchased precursor 2:',null,null,null,null,null,null,'ElecEFMeth_',null,null,'','Manual'])
  rows.push([null,null,null,'iv.', 'Specific embedded indirect emissions (SEE (indirect))', null, null, null, null, null, '', '', 5])
  rows.push([null,null,null,'v.', 'Justification for use of default values (if relevant):', null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 'n.a.'])
  const ws = XLSX.utils.aoa_to_sheet(rows)
  XLSX.utils.book_append_sheet(wb, ws, 'E_PurchPrec')
  return wb
}

describe('Import original E_PurchPrec markers', () => {
  test('parses SEE indirect, EF method and default justification per precursor block', async () => {
    const wb = makeWB()
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' }) as any
    const base: any = { ePurchased: { ...E_PURCHASED_DEFAULTS, precursors: [{ id: 'p1', name: 'A', totalQuantity: 0, unit: 't', supplierName: '', supplierCountry: '', processConsumptions: [], directEmbeddedEmissions: 0, directEmissionsUnit: 'tCO2e', electricityConsumption: 0, electricityUnit: 'MWh', totalEmbeddedEmissionsUnit: 'tCO2e', usesDefaultValues: false, dataQuality: '', verificationStatus: '', lastUpdated: new Date() }, { id: 'p2', name: 'B', totalQuantity: 0, unit: 't', supplierName: '', supplierCountry: '', processConsumptions: [], directEmbeddedEmissions: 0, directEmissionsUnit: 'tCO2e', electricityConsumption: 0, electricityUnit: 'MWh', totalEmbeddedEmissionsUnit: 'tCO2e', usesDefaultValues: false, dataQuality: '', verificationStatus: '', lastUpdated: new Date() }] } } as CBAMData
    const imported = await importFromExcel(buf, base)
    const ep = imported.ePurchased as any
    expect(ep.precursors[0].indirectEmbeddedEmissions).toBe(12)
    expect(ep.precursors[0].electricityEmissionFactorSource).toBe('n.a.')
    expect(ep.precursors[0].usesDefaultValues).toBe(true)
    expect(ep.precursors[0].defaultValueJustification).toBe('Default used')
    expect(ep.precursors[1].indirectEmbeddedEmissions).toBe(5)
    expect(ep.precursors[1].electricityEmissionFactorSource).toBe('Manual')
    expect(ep.precursors[1].usesDefaultValues).toBe(false)
  })
})