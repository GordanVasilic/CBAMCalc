// Centralized code lists (Phase 1: static JSON). Later to be backed by DB.

// Countries (Bosnian labels)
export const countries: string[] = [
  'Austrija', 'Belgija', 'Bugarska', 'Hrvatska', 'Kipar', 'Češka',
  'Danska', 'Estonija', 'Finska', 'Francuska', 'Njemačka', 'Grčka', 'Mađarska',
  'Irska', 'Italija', 'Latvija', 'Litvanija', 'Luksemburg', 'Malta', 'Nizozemska',
  'Poljska', 'Portugal', 'Rumunija', 'Slovačka', 'Slovenija', 'Španija', 'Švedska'
];

// Installation types (currently English, mirroring existing UI)
export const installationTypes: string[] = [
  'Cement', 'Željezo i čelik', 'Aluminij', 'Gnojiva', 'Električna energija', 'Vodik', 'Organske hemikalije', 'Polimeri'
];

// Main activities (currently English, mirroring existing UI)
export const mainActivities: string[] = [
  'Proizvodnja klinkera',
  'Proizvodnja cementa',
  'Proizvodnja željeza',
  'Proizvodnja čelika',
  'Primarna proizvodnja aluminija',
  'Sekundarna proizvodnja aluminija',
  'Proizvodnja amonijaka',
  'Proizvodnja nitrata',
  'Proizvodnja električne energije',
  'Proizvodnja vodika',
  'Proizvodnja organskih hemikalija',
  'Proizvodnja polimera'
];

export const emissionCategories: string[] = [
  'Electricity', 'Heat', 'Steam', 'Process', 'Transport',
  'Raw Material', 'Fuel', 'Product', 'Waste', 'Other'
];
export const fuelTypes: string[] = [
  'Natural gas', 'Coal', 'Oil', 'LPG', 'Coke', 'Biomass', 'Electricity', 'Steam', 'Other'
];
export const fuelSources: string[] = [
  'On-site production', 'External supplier', 'Grid', 'Other'
];
export const emissionFactorUnits: string[] = [
  't/t', 'kg/t', 'kg/MWh', 't/MWh', 'kg/GJ', 't/GJ',
  'kg/km', 't/km', 'kg/h', 't/h'
];
export const gasTypes: string[] = ['CO2', 'CH4', 'N2O', 'HFCs', 'PFCs', 'SF6', 'NF3'];
export const emissionSources: string[] = [
  'Default', 'IPCC', 'IEA', 'Ecoinvent', 'GaBi',
  'National Registry', 'Company Specific', 'Supplier Provided', 'Other'
];
export const applicables: string[] = [
  'All', 'Electricity', 'Heat', 'Steam', 'Process',
  'Transport', 'Raw Material', 'Fuel', 'Product'
];
export const processUnits: string[] = ['t', 'kg', 'm³', 'L', 'kWh', 'MWh'];
export const electricityUnits: string[] = ['kWh', 'MWh'];
export const energyUnits: string[] = ['GJ', 'MWh', 't', 'm³', 'L'];
export const processTypes: string[] = [
  'Calcination', 'Reduction', 'Smelting', 'Refining',
  'Chemical Reaction', 'Physical Transformation', 'Other'
];
export const origins: string[] = ['Domestic', 'EU', 'Non-EU'];
export const monitoringMethods: string[] = [
  'Continuous Emission Monitoring System (CEMS)',
  'Mass Balance',
  'Default Emission Factor',
  'Measured Emission Factor'
];
export const dataQualityOptions: string[] = ['High', 'Medium', 'Low'];
export const emissionSourceTypes: string[] = [
  'Combustion', 'Process', 'Fugitive', 'Electricity', 'Heat', 'Transport'
];
// Dodane kategorije namjene goriva za Fuel balance (C_Emissions&Energy)
export const fuelUseCategories: string[] = [
  'CBAM proizvodni procesi',
  'Proizvodnja električne energije',
  'Ne-CBAM procesi'
];