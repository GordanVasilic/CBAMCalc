# CBAM Excel to Web Implementation Guide

## Overview
This guide provides a step-by-step approach to ensure the CBAM web application has identical functionality to the Excel template.

## Prerequisites

1. **Excel Template**: CBAM Communication template for installations_en_20241213.xlsx
2. **PowerShell Scripts**: analyze_excel_template.ps1
3. **Web Application**: Current React implementation
4. **Documentation**: All existing project documentation

## Step 1: Excel Template Analysis

### 1.1 Run the Analysis Script

```powershell
.
\analyze_excel_template.ps1 -ExcelPath "CBAM Communication template for installations_en_20241213.xlsx" -OutputPath "excel_analysis"
```

This will create a detailed analysis of the Excel template structure.

### 1.2 Manual Excel Analysis

For each sheet, manually document:

1. **Formulas and Calculations**
   - Open the Excel file
   - Go to Formulas tab > Show Formulas (or Ctrl + `)
   - Take screenshots of each calculation sheet
   - Document complex formulas separately

2. **Data Validation Rules**
   - Go to Data tab > Data Validation
   - Document all validation rules for each cell
   - Note dropdown lists, number ranges, date restrictions

3. **Conditional Formatting**
   - Go to Home tab > Conditional Formatting
   - Document all formatting rules
   - Note conditions and resulting formats

4. **Named Ranges and References**
   - Go to Formulas tab > Name Manager
   - Document all named ranges
   - Note their scope and references

5. **Macros and VBA Code**
   - Go to Developer tab > Visual Basic
   - Document all macros and VBA code
   - Note triggers and functionality

## Step 2: Web Application Analysis

### 2.1 Component Analysis

For each component in `src/components/steps/`:

1. **Compare Fields**
   - List all input fields in the component
   - Compare with Excel sheet fields
   - Note missing fields

2. **Compare Validation**
   - List all validation rules in the component
   - Compare with Excel validation rules
   - Note missing validations

3. **Compare Calculations**
   - List all calculations in the component
   - Compare with Excel calculations
   - Note missing calculations

### 2.2 Data Model Analysis

For each data model in `src/types/CBAMData.ts`:

1. **Compare Fields**
   - List all fields in the model
   - Compare with Excel sheet fields
   - Note missing fields

2. **Compare Data Types**
   - List all data types in the model
   - Compare with Excel data types
   - Note mismatches

### 2.3 Calculation Engine Analysis

For the calculation engine in `src/utils/calculationEngine.ts`:

1. **Compare Calculations**
   - List all calculations in the engine
   - Compare with Excel calculations
   - Note missing calculations

2. **Compare Constants and Factors**
   - List all constants and factors
   - Compare with Excel constants
   - Note missing constants

## Step 3: Gap Analysis

### 3.1 Create Gap Analysis Document

For each Excel sheet:

1. **Missing Fields**
   - List all fields present in Excel but missing in the web app
   - Prioritize by importance

2. **Missing Validations**
   - List all validations present in Excel but missing in the web app
   - Prioritize by importance

3. **Missing Calculations**
   - List all calculations present in Excel but missing in the web app
   - Prioritize by importance

### 3.2 Create Implementation Plan

For each gap identified:

1. **Define Requirements**
   - What needs to be implemented
   - How it should work
   - Acceptance criteria

2. **Design Solution**
   - Component design
   - Data model changes
   - Calculation engine changes

3. **Implementation Steps**
   - Order of implementation
   - Dependencies
   - Testing requirements

## Step 4: Implementation

### 4.1 Implement Missing Fields

For each missing field:

1. **Update Data Model**
   ```typescript
   // Example: Add missing field to CBAMData.ts
   export interface InstallationDetails {
     // ... existing fields
     newField: string; // Add missing field
   }
   ```

2. **Update Component**
   ```tsx
   // Example: Add missing field to component
   <TextField
     label="New Field"
     value={installationDetails.newField}
     onChange={(e) => setInstallationDetails({...installationDetails, newField: e.target.value})}
   />
   ```

3. **Add Validation**
   ```typescript
   // Example: Add validation for new field
   const validateNewField = (value: string) => {
     if (!value) return "Field is required";
     if (value.length > 50) return "Field must be less than 50 characters";
     return "";
   };
   ```

### 4.2 Implement Missing Calculations

For each missing calculation:

1. **Update Calculation Engine**
   ```typescript
   // Example: Add missing calculation
   calculateNewCalculation(data: CBAMData): number {
     // Implement calculation logic from Excel
     return result;
   }
   ```

2. **Update Component**
   ```tsx
   // Example: Use new calculation in component
   const newCalculation = calculateNewCalculation(cbamData);
   ```

3. **Add Tests**
   ```typescript
   // Example: Test new calculation
   test('calculateNewCalculation returns correct result', () => {
     const testData = { /* test data */ };
     const result = calculateNewCalculation(testData);
     expect(result).toBe(expectedResult);
   });
   ```

### 4.3 Implement Missing Validations

For each missing validation:

1. **Update Validation Logic**
   ```typescript
   // Example: Add validation rule
   const validateField = (value: string) => {
     // Implement validation logic from Excel
     if (!validationRule(value)) {
       return "Validation error message";
     }
     return "";
   };
   ```

2. **Update Component**
   ```tsx
   // Example: Use validation in component
   const [fieldError, setFieldError] = useState("");
   
   const handleFieldChange = (e) => {
     const value = e.target.value;
     setFieldValue(value);
     setFieldError(validateField(value));
   };
   ```

## Step 5: Testing

### 5.1 Unit Testing

For each calculation:

1. **Create Test Cases**
   - Use data from Excel
   - Test edge cases
   - Test error conditions

2. **Verify Results**
   - Compare with Excel results
   - Document discrepancies
   - Fix issues

### 5.2 Integration Testing

For each workflow:

1. **Create Test Scenarios**
   - Mimic Excel workflows
   - Test complete data entry
   - Test all calculations

2. **Verify Results**
   - Compare with Excel results
   - Document discrepancies
   - Fix issues

### 5.3 User Acceptance Testing

For each user story:

1. **Create Test Scenarios**
   - Use real-world scenarios
   - Test common use cases
   - Test edge cases

2. **Verify Results**
   - Compare with Excel results
   - Document discrepancies
   - Fix issues

## Step 6: Documentation

### 6.1 Update Documentation

1. **User Documentation**
   - Update user guide
   - Add screenshots
   - Add examples

2. **Technical Documentation**
   - Update API documentation
   - Add component documentation
   - Add calculation documentation

### 6.2 Create Comparison Report

1. **Create Summary Report**
   - List all implemented features
   - List all missing features
   - Note any discrepancies

2. **Create Detailed Report**
   - Document each comparison
   - Note all differences
   - Provide recommendations

## Step 7: Deployment

### 7.1 Prepare for Deployment

1. **Final Testing**
   - Run all tests
   - Verify all calculations
   - Check all validations

2. **Performance Testing**
   - Test with large data sets
   - Check response times
   - Optimize if needed

### 7.2 Deploy Application

1. **Deploy to Staging**
   - Deploy application
   - Run smoke tests
   - Verify functionality

2. **Deploy to Production**
   - Deploy application
   - Monitor performance
   - Address any issues

## Success Criteria

The web application will be considered equivalent to the Excel template when:

1. All fields from the Excel template are present in the web application
2. All calculations produce identical results
3. All validation rules work identically
4. All workflows work identically
5. All exports produce identical results
6. All edge cases are handled identically

## Resources

1. **Excel Template Analysis Script**: analyze_excel_template.ps1
2. **Comparison Plan Document**: CBAM_Excel_to_Web_Comparison_Plan.md
3. **Web Application Source Code**: src/
4. **Excel Template**: CBAM Communication template for installations_en_20241213.xlsx

## Timeline

- Step 1: Excel Template Analysis - 2-3 weeks
- Step 2: Web Application Analysis - 1-2 weeks
- Step 3: Gap Analysis - 1 week
- Step 4: Implementation - 3-4 weeks
- Step 5: Testing - 2-3 weeks
- Step 6: Documentation - 1 week
- Step 7: Deployment - 1 week

Total estimated time: 11-15 weeks