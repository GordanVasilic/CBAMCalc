# CBAM Calculation Logic Comparison: Excel Template vs Web Application

## Overview

This document provides a detailed comparison of the calculation logic, data structures, and emission factors between the CBAM Excel template and the React web application.

## Data Structure Comparison

### Excel Template Structure

The Excel template contains 19 worksheets:
1. A_InstData - Installation data
2. B_EmInst - Emissions installation
3. C_Emissions_Energy - Energy emissions
4. D_Processes - Process data
5. E_Inputs - Input materials
6. F_Outputs - Output materials
7. G_Reporting - Reporting information
8. H_Summary - Summary data
9. I_Parameters - Parameters and constants
10. J_Translations - Translations
11. K_Version - Version information
12. L_Help - Help information
13. M_Validation - Validation rules
14. N_Export - Export data
15. O_Print - Print formatting
16. P_Archive - Archive data
17. Q_Backup - Backup data
18. R_Settings - Settings
19. S_Notes - Notes

### Web Application Structure

The web application is structured as a multi-step form with the following components:
1. CompanyInfoStep - Company information
2. ReportConfigStep - Report configuration
3. InstallationDetailsStep - Installation details
4. EmissionFactorsStep - Emission factors
5. EnergyFuelDataStep - Energy and fuel data
6. ProcessProductionDataStep - Process and production data
7. ResultsExportStep - Results and export

## Calculation Logic Comparison

### Emission Factors

#### Excel Template
- Emission factors are stored in the Parameters_Constants worksheet
- Default emission factors for various fuels and processes
- Specific emission factors for different CBAM goods (Cement, Iron/Steel, Aluminium, etc.)
- Biomass CO2 factor: 1.83 tCO2/t
- Default electricity emission factor: 0.475 tCO2/MWh (EU average)
- Default heat emission factor: 0.25 tCO2/MWh (Natural gas)

#### Web Application
- Emission factors are defined in calculationEngine.ts
- DEFAULT_FUEL_EMISSION_FACTORS with values for common fuels:
  - Natural Gas: 0.202 tCO2/MWh
  - Coal: 0.34 tCO2/MWh
  - Oil: 0.267 tCO2/MWh
  - LPG: 0.229 tCO2/MWh
  - Diesel: 0.267 tCO2/MWh
  - Petrol: 0.267 tCO2/MWh
  - Biomass: 0 tCO2/MWh (Biogenic CO2 reported separately)
  - Electricity: 0.475 tCO2/MWh (EU average)
  - Heat: 0.25 tCO2/MWh (Natural gas)
  - Other: 0.3 tCO2/MWh
- DEFAULT_PROCESS_EMISSION_FACTORS with values for common processes:
  - Iron and Steel Production: 1.9 tCO2/t product
  - Aluminium Production: 1.7 tCO2/t product
  - Cement Production: 0.66 tCO2/t product
  - Fertilizer Production: 2.0 tCO2/t product
  - Electricity Production: 0.475 tCO2/t product
  - Hydrogen Production: 0.0 tCO2/t product
  - Organic Chemicals: 1.3 tCO2/t product
  - Plastics: 2.0 tCO2/t product
  - Other: 0.5 tCO2/t product
- DEFAULT_EMBEDDED_EMISSION_FACTORS with values for common materials:
  - Iron Ore: 0.03 tCO2/t material
  - Coal: 0.09 tCO2/t material
  - Limestone: 0.05 tCO2/t material
  - Bauxite: 0.3 tCO2/t material
  - Alumina: 1.6 tCO2/t material
  - Scrap Metal: 0.3 tCO2/t material
  - Natural Gas: 0.056 tCO2/t material
  - Crude Oil: 0.12 tCO2/t material
  - Other: 0.5 tCO2/t material

### Calculation Methods

#### Direct CO2 Emissions

**Excel Template:**
- Calculated in C_Emissions_Energy worksheet
- Formula: Σ(Fuel Consumption × Emission Factor)
- Accounts for different fuel types and their specific emission factors

**Web Application:**
- Implemented in calculateTotalDirectCO2Emissions function
- Same formula: Σ(Fuel Consumption × Emission Factor)
- Uses DEFAULT_FUEL_EMISSION_FACTORS or custom factors provided by user
- Code: `const emissions = fuel.consumption * emissionFactor;`

#### Process Emissions

**Excel Template:**
- Calculated in D_Processes worksheet
- Formula: Σ(Production Amount × Process Emission Factor)
- Different factors for different process types

**Web Application:**
- Implemented in calculateTotalProcessEmissions function
- Same formula: Σ(Production Amount × Process Emission Factor)
- Uses DEFAULT_PROCESS_EMISSION_FACTORS or custom factors
- Code: `const emissions = production * emissionFactor;`

#### Total Emissions

**Excel Template:**
- Calculated in H_Summary worksheet
- Formula: Direct CO2 Emissions + Process Emissions

**Web Application:**
- Implemented in calculateTotalEmissions function
- Same formula: Direct CO2 Emissions + Process Emissions
- Code: `return directEmissions + processEmissions;`

#### Specific Emissions

**Excel Template:**
- Calculated in H_Summary worksheet
- Formula: Total Emissions / Total Production

**Web Application:**
- Implemented in calculateSpecificEmissions function
- Same formula: Total Emissions / Total Production
- Code: `return totalEmissions / totalProduction;`

#### Total Energy

**Excel Template:**
- Calculated in C_Emissions_Energy worksheet
- Sum of all energy consumption in MWh

**Web Application:**
- Implemented in calculateTotalEnergy function
- Same approach: Sum of all energy consumption
- Code: `return total + fuel.consumption;`

#### Renewable Energy Share

**Excel Template:**
- Calculated in C_Emissions_Energy worksheet
- Formula: Renewable Energy / Total Energy
- Includes electricity with renewable share and biomass

**Web Application:**
- Implemented in calculateRenewableShare function
- Same formula: Renewable Energy / Total Energy
- Includes electricity with renewable share and biomass
- Code: `return renewableEnergy / totalEnergy;`

#### Imported Raw Material Share

**Excel Template:**
- Calculated in E_Inputs worksheet
- Formula: Imported Input Materials / Total Input Materials

**Web Application:**
- Implemented in calculateImportedRawMaterialShare function
- Same formula: Imported Input Materials / Total Input Materials
- Code: `return importedInputs / totalInputs;`

#### Embedded Emissions

**Excel Template:**
- Calculated in E_Inputs worksheet
- Formula: Σ(Input Amount × Embedded Emission Factor)

**Web Application:**
- Implemented in calculateEmbeddedEmissions function
- Same formula: Σ(Input Amount × Embedded Emission Factor)
- Uses DEFAULT_EMBEDDED_EMISSION_FACTORS or custom factors
- Code: `return subTotal + ((input.amount ?? input.quantity ?? 0) * emissionFactor);`

#### Cumulative Emissions

**Excel Template:**
- Calculated in H_Summary worksheet
- Formula: Total Emissions + Embedded Emissions

**Web Application:**
- Implemented in calculateCumulativeEmissions function
- Same formula: Total Emissions + Embedded Emissions
- Code: `return totalEmissions + embeddedEmissions;`

## Constants and Parameters

### Excel Template

Based on the Parameters_Constants worksheet:
- CBAM Period: Transitional
- Conversion factors: tCO2_to_kgCO2: 1000, kgCO2_to_tCO2: 0.001
- Energy conversion: MWh_to_GJ: 3.6, GJ_to_MWh: 0.2777777778
- Biomass CO2 factor: 1.83 tCO2/t
- Renewable threshold: 0.2 (20%)
- Special parameters for different CBAM goods

### Web Application

Defined in DEFAULT_CONSTANTS:
- tCO2_to_kgCO2: 1000
- kgCO2_to_tCO2: 0.001
- MWh_to_GJ: 3.6
- GJ_to_MWh: 0.2777777778
- defaultElectricityEmissionFactor: 0.475
- defaultHeatEmissionFactor: 0.25
- biomassCO2Factor: 1.83
- renewableThreshold: 0.2
- defaultProcessEmissionFactor: 0.1
- defaultEmbeddedEmissionFactor: 0.5

## Data Validation

### Excel Template

- Validation rules in M_Validation worksheet
- Cell-level validation for different inputs
- Custom formulas for complex validation

### Web Application

- Implemented in validateCBAMData function
- Checks for required fields
- Validates data types and ranges
- Returns array of validation messages

## Export Functionality

### Excel Template

- Export data in N_Export worksheet
- Print formatting in O_Print worksheet
- Archive functionality in P_Archive worksheet

### Web Application

- exportToExcel function (currently placeholder)
- exportToPDF function (currently placeholder)
- exportToCSV function (currently placeholder)

## Key Differences and Gaps

1. **Emission Factors**
   - Excel template has more comprehensive emission factors for specific CBAM goods
   - Web application uses general default factors for common fuels and processes
   - Gap: Web application needs to incorporate specific emission factors for different CBAM goods

2. **Data Structure**
   - Excel template has separate worksheets for different data types
   - Web application uses a unified data structure (CBAMData interface)
   - Gap: Web application may need to expand its data structure to accommodate all Excel fields

3. **Calculation Complexity**
   - Excel template may have more complex formulas and calculations
   - Web application has simplified but functional calculation engine
   - Gap: Web application may need to implement more complex calculations to match Excel

4. **Validation**
   - Excel template has comprehensive validation rules
   - Web application has basic validation
   - Gap: Web application needs to implement more comprehensive validation

5. **Export Functionality**
   - Excel template has robust export and print functionality
   - Web application has placeholder export functions
   - Gap: Web application needs to implement proper export functionality

## Recommendations

1. **Expand Emission Factors**
   - Incorporate specific emission factors for different CBAM goods from Excel template
   - Add more fuel types and processes to DEFAULT_FUEL_EMISSION_FACTORS and DEFAULT_PROCESS_EMISSION_FACTORS

2. **Enhance Data Structure**
   - Review and expand CBAMData interface to include all fields from Excel template
   - Ensure compatibility with Excel template's data structure

3. **Implement Complex Calculations**
   - Review Excel template's formulas and implement any missing calculations
   - Ensure calculation results match between Excel and web application

4. **Improve Validation**
   - Implement comprehensive validation rules similar to Excel template
   - Add validation for specific fields and data ranges

5. **Complete Export Functionality**
   - Implement proper Excel, PDF, and CSV export functions
   - Ensure exported data matches Excel template format

## Conclusion

The web application's calculation engine follows the same basic principles as the Excel template but needs enhancements to fully match the Excel template's functionality. The main areas for improvement are emission factors, data structure, calculation complexity, validation, and export functionality.

By addressing these gaps, the web application can provide a faithful replication of the Excel template's functionality while offering a more user-friendly interface.