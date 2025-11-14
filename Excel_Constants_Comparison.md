# CBAM Excel Template vs Web Application Constants Comparison

## Overview
This document compares the constants used in the Excel template with those currently implemented in the web application's calculation engine.

## Excel Template Constants (from Parameters_Constants worksheet)

### Units and Measures
- **CONST_tonnes**: tonnes
- **CONST_torkNm3**: t (for 1000Nm3)
- **CONST_TJ**: TJ
- **CONST_GJ**: GJ
- **CONST_GWh**: GWh
- **CONST_MWh**: MWh
- **CONST_tCO2**: tCO2
- **CONST_tCO2eq**: tCO2e
- **CONST_tCO2pt**: tCO2/t
- **CONST_tCO2pTJ**: tCO2/TJ
- **CONST_tCO2pkNm3**: tCO2/1000Nm3
- **CONST_GJpkNm3**: GJ/1000Nm3
- **CONST_tC**: tC
- **CONST_tCpt**: tC/t
- **CONST_tCpkNm3**: tC/1000Nm3

### Emission Factor Constants
- **CONST_EFNatGas**: 56,1 (appears to be an emission factor for natural gas)

### Data Quality and Verification
- **CONST_DataQuality**: "Mostly measurements & analyses", "Mostly measurements & international standard factors for e.g. the emission factor", "Mostly default values provided by the European Commission"
- **CONST_DataVerification**: "Third-party verification", "None"
- **CONST_DataQualityJustification**: "Unreasonable costs for more accurate monitoring"

### Economic Constants
- **CONST_CarbonPriceType**: "None", "Carbon Fee", "National Emissions Trading System"
- **CONST_RebateType**: "None", "Tax deduction", "Combination"

## Web Application Constants (from calculationEngine.ts)

### Conversion Factors
- **tCO2_to_kgCO2**: 1000
- **kgCO2_to_tCO2**: 0.001
- **MWh_to_GJ**: 3.6
- **GJ_to_MWh**: 0.2777777778

### Default Emission Factors
- **defaultElectricityEmissionFactor**: 0.475 (EU average)
- **defaultHeatEmissionFactor**: 0.25 (Natural gas)
- **biomassCO2Factor**: 1.83 (tCO2/t)

### Thresholds
- **renewableThreshold**: 0.2 (20% renewable energy threshold)

### Other Constants
- **defaultProcessEmissionFactor**: 0.1
- **defaultEmbeddedEmissionFactor**: 0.5

### Default Fuel Emission Factors
- **Natural Gas**: 0.202
- **Coal**: 0.34
- **Oil**: 0.267
- **LPG**: 0.229
- **Diesel**: 0.267
- **Petrol**: 0.267
- **Biomass**: 0
- **Electricity**: 0.475
- **Heat**: 0.25
- **Other**: 0.3

### Default Process Emission Factors
- **Iron and Steel Production**: 1.9
- **Aluminium Production**: 1.7
- **Cement Production**: 0.66
- **Fertilizer Production**: 2.0
- **Electricity Production**: 0.475
- **Hydrogen Production**: 0.0
- **Organic Chemicals**: 1.3
- **Plastics**: 2.0
- **Other**: 0.5

### Default Embedded Emission Factors
- **Iron Ore**: 0.03
- **Coal**: 0.09
- **Limestone**: 0.05
- **Bauxite**: 0.3
- **Alumina**: 1.6
- **Scrap Metal**: 0.3
- **Natural Gas**: 0.056
- **Crude Oil**: 0.12
- **Other**: 0.5

## Identified Gaps

1. **Missing Excel Constants in Web Application**:
   - Data quality and verification constants
   - Economic constants (carbon price types, rebate types)
   - Additional unit constants (tC, tC/t, tC/1000Nm3)
   - Natural gas emission factor (56,1) - format/interpretation needs clarification

2. **Potential Value Discrepancies**:
   - Natural gas emission factor: Excel has 56,1 (unclear units), web app has 0.202 (tCO2/MWh)
   - Need to verify if these are equivalent or represent different metrics

3. **Missing Functionality**:
   - No support for data quality and verification tracking
   - No support for carbon pricing and rebate calculations

## Recommendations

1. **Add Missing Constants**:
   - Implement data quality and verification constants
   - Add economic constants for carbon pricing and rebates
   - Add missing unit constants

2. **Verify Emission Factors**:
   - Clarify the meaning and units of the Excel natural gas emission factor (56,1)
   - Verify that all emission factors match between Excel and web app

3. **Implement Missing Functionality**:
   - Add data quality tracking to the CBAM data model
   - Implement carbon pricing and rebate calculations

4. **Create Configuration Management**:
   - Consider moving all constants to a configuration file that can be easily updated
   - Implement versioning for constants to match Excel template versions

## Next Steps

1. Extract more detailed information from the Excel template about calculations and formulas
2. Implement the missing constants in the web application
3. Add support for data quality and verification tracking
4. Implement carbon pricing and rebate calculations
5. Create comprehensive tests to verify calculation accuracy between Excel and web app