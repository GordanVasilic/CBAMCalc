# CBAM Comprehensive Implementation Guide

This guide provides a comprehensive step-by-step approach to ensure the CBAM web application has identical functionality to the Excel template.

## Prerequisites

1. **Excel Template**: CBAM Communication template for installations_en_20241213.xlsx
2. **PowerShell Scripts**: excel_analysis_script.ps1
3. **Web Application**: Current React implementation
4. **Documentation**: All existing project documentation

## Step 1: Excel Template Analysis

### 1.1 Run the Analysis Script

```powershell
# Navigate to the project directory
cd "d:\Projekti\CBAM communication template for installations"

# Run the analysis script
.
\excel_analysis_script.ps1
```

This will create a detailed analysis of the Excel template structure in the `ExcelAnalysis` directory.

### 1.2 Document Excel Formulas and Calculations

1. Review the `Formulas.csv` file to identify all calculations in the Excel template
2. Document each calculation with its formula, input fields, and output fields
3. Note any special cases or error handling
4. Use Excel's "Show Formulas" feature (Ctrl + `) to visualize all formulas
5. Take screenshots of complex formulas for reference

### 1.3 Document Excel Data Validation

1. Review the `data_validations.csv` files for each sheet
2. Document each validation rule, including type, operator, and formula
3. Note any custom error messages
4. Use Excel's Data Validation dialog to verify rules

### 1.4 Document Excel Named Ranges

1. Review the `Named_Ranges.csv` file
2. Document each named range and its purpose
3. Note any named ranges used in calculations
4. Use Excel's Name Manager to verify ranges

### 1.5 Document Excel Conditional Formatting

1. Manually review the Excel template for conditional formatting rules
2. Document each rule, including condition and format
3. Note any conditional formatting used for validation or highlighting

### 1.6 Document Excel VBA Code

1. Check for any VBA macros in the Excel template
2. Document each macro's purpose and functionality
3. Note any macros that affect calculations or validation

### 1.7 Document Excel User Workflows

1. Document the typical user workflow in the Excel template
2. Note any navigation patterns or instructions
3. Document any helper text or tooltips

## Step 2: Web Application Analysis

### 2.1 Map Excel Sheets to Web Components

Create a mapping between Excel sheets and web components:

| Excel Sheet | Web Component | Status | Notes |
|-------------|---------------|--------|-------|
| A_InstData | InstallationDetailsStep.tsx |  |  |
| B_Emissions | EmissionFactorsStep.tsx |  |  |
| C_Energy | EnergyFuelDataStep.tsx |  |  |
| D_Process | ProcessProductionDataStep.tsx |  |  |
| Reference | Various components |  |  |
| Summary | ResultsExportStep.tsx |  |  |
| Calculation | calculationEngine.ts |  |  |

### 2.2 Document Web Application Structure

1. Component hierarchy and relationships
2. Data flow between components
3. State management approach
4. Navigation patterns

### 2.3 Document Web Calculations

1. Review `calculationEngine.ts` for all calculations
2. Document each calculation with its function, input fields, and output fields
3. Note any special cases or error handling

## Step 3: Detailed Comparison Process

### 3.1 Create Comparison Documents

For each Excel sheet, use the comparison template in the `ExcelAnalysis` directory to:

1. Compare field names, data types, and validation rules
2. Compare calculations and formulas
3. Compare UI elements and layout
4. Compare data flow and integration
5. Compare testing scenarios

### 3.2 Document All Gaps

Create a comprehensive list of all gaps between the Excel template and the web application:

| Excel Element | Web Element | Gap Type | Priority | Action Required |
|---------------|-------------|----------|----------|-----------------|
| Field X | Missing | Field | High | Add field to data model and component |
| Calculation Y | Different | Calculation | High | Update calculation function |
| Validation Z | Missing | Validation | Medium | Add validation rule |

## Step 4: Implementation Plan

### 4.1 Prioritize Gaps

Prioritize gaps based on impact and complexity:

1. **Critical**: Missing calculations or fields that affect the final results
2. **High**: Missing validations that could lead to incorrect data
3. **Medium**: UI improvements that enhance user experience
4. **Low**: Nice-to-have features that don't affect functionality

### 4.2 Create Implementation Tasks

For each gap, create a specific implementation task:

| Task ID | Description | Component | Priority | Estimated Hours |
|---------|-------------|-----------|----------|-----------------|
| CBAM-001 | Add missing field X to InstallationDetails | InstallationDetailsStep.tsx | High | 4 |
| CBAM-002 | Update calculation Y in calculationEngine | calculationEngine.ts | High | 8 |
| CBAM-003 | Add validation Z to EmissionFactors | EmissionFactorsStep.tsx | Medium | 2 |

### 4.3 Assign Tasks to Team Members

Assign tasks based on expertise and availability:

| Task ID | Assigned To | Status | Due Date |
|---------|-------------|--------|----------|
| CBAM-001 | Developer A | Not Started | 2024-01-15 |
| CBAM-002 | Developer B | Not Started | 2024-01-20 |
| CBAM-003 | Developer A | Not Started | 2024-01-18 |

## Step 5: Implementation Process

### 5.1 Update Data Models

For each missing field, update the corresponding interface in `CBAMData.ts`:

```typescript
// Example: Adding a missing field to InstallationDetails
export interface InstallationDetails {
  // Existing fields...
  installationId: string;
  installationName: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  
  // New field from Excel
  installationType: string; // From Excel column 'Installation Type'
  
  // Additional fields...
}
```

### 5.2 Update React Components

For each missing field or validation, update the corresponding React component:

```typescript
// Example: Adding a missing field to InstallationDetailsStep.tsx
import React, { useState } from 'react';
import { InstallationDetails } from '../../types/CBAMData';

interface InstallationDetailsStepProps {
  data: InstallationDetails;
  onChange: (data: InstallationDetails) => void;
  errors: Record<string, string>;
}

const InstallationDetailsStep: React.FC<InstallationDetailsStepProps> = ({ data, onChange, errors }) => {
  const handleChange = (field: keyof InstallationDetails, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="installation-details-step">
      {/* Existing fields... */}
      
      {/* New field from Excel */}
      <div className="form-field">
        <label htmlFor="installationType">Installation Type *</label>
        <select
          id="installationType"
          value={data.installationType || ''}
          onChange={(e) => handleChange('installationType', e.target.value)}
          className={errors.installationType ? 'error' : ''}
        >
          <option value="">Select Installation Type</option>
          <option value="type1">Type 1</option>
          <option value="type2">Type 2</option>
          <option value="type3">Type 3</option>
        </select>
        {errors.installationType && <div className="error-message">{errors.installationType}</div>}
      </div>
      
      {/* Additional fields... */}
    </div>
  );
};

export default InstallationDetailsStep;
```

### 5.3 Update Calculation Engine

For each missing or incorrect calculation, update the calculation engine:

```typescript
// Example: Adding a missing calculation to calculationEngine.ts
export const calculateSpecificEmissions = (
  emissions: EmissionFactorsData,
  production: ProcessProductionData
): number => {
  // Validate inputs
  if (!emissions || !production) {
    return 0;
  }
  
  // Extract values
  const { emissionFactor, uncertainty } = emissions;
  const { productionAmount, productionUnit } = production;
  
  // Convert production amount to standard unit if needed
  const standardProductionAmount = convertToStandardUnit(productionAmount, productionUnit);
  
  // Calculate specific emissions (matching Excel formula)
  const specificEmissions = (emissionFactor * standardProductionAmount) / 1000;
  
  // Apply uncertainty factor if available
  const result = uncertainty ? specificEmissions * (1 + uncertainty / 100) : specificEmissions;
  
  // Round to 2 decimal places (matching Excel)
  return Math.round(result * 100) / 100;
};
```

### 5.4 Update Validation Logic

For each missing validation, update the validation logic:

```typescript
// Example: Adding a validation function in a validation utility file
export const validateInstallationDetails = (data: InstallationDetails): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  // Existing validations...
  
  // New validation from Excel
  if (!data.installationType) {
    errors.installationType = 'Installation type is required';
  } else if (!isValidInstallationType(data.installationType)) {
    errors.installationType = 'Invalid installation type';
  }
  
  return errors;
};

// Helper function to validate installation type
const isValidInstallationType = (type: string): boolean => {
  const validTypes = ['type1', 'type2', 'type3'];
  return validTypes.includes(type);
};
```

### 5.5 Update Export Functionality

Ensure the export functionality matches the Excel template format:

```typescript
// Example: Updating Excel export to match template format
export const exportToExcel = (data: CBAMData): void => {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  
  // Add installation details sheet
  const installationSheet = workbook.addWorksheet('A_InstData');
  
  // Add headers matching Excel template
  installationSheet.addRow(['Installation ID', 'Installation Name', 'Installation Type', 'Address', 'City', 'Postal Code', 'Country']);
  
  // Add data
  installationSheet.addRow([
    data.installationDetails.installationId,
    data.installationDetails.installationName,
    data.installationDetails.installationType, // New field
    data.installationDetails.streetAddress,
    data.installationDetails.city,
    data.installationDetails.postalCode,
    data.installationDetails.country
  ]);
  
  // Apply formatting to match Excel template
  installationSheet.getRow(1).font = { bold: true };
  installationSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Add other sheets...
  
  // Save the workbook
  workbook.xlsx.writeBuffer().then((buffer) => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CBAM_Report.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  });
};
```

## Step 6: Testing Process

### 6.1 Unit Tests

Create unit tests for each new function:

```typescript
// Example: Unit test for a new calculation function
describe('calculateSpecificEmissions', () => {
  it('should calculate specific emissions correctly', () => {
    const emissions = {
      emissionFactor: 2.5,
      uncertainty: 10
    };
    
    const production = {
      productionAmount: 1000,
      productionUnit: 'kg'
    };
    
    const result = calculateSpecificEmissions(emissions, production);
    
    // Expected: (2.5 * 1000 / 1000) * (1 + 10/100) = 2.5 * 1.1 = 2.75
    expect(result).toBe(2.75);
  });
  
  it('should handle null inputs', () => {
    const result = calculateSpecificEmissions(null, null);
    expect(result).toBe(0);
  });
  
  // Additional test cases...
});
```

### 6.2 Integration Tests

Create integration tests for component interactions:

```typescript
// Example: Integration test for component and calculation engine
describe('Installation and Emission Integration', () => {
  it('should correctly calculate emissions based on installation details', () => {
    // Set up test data
    const installationData = {
      installationType: 'type1',
      // Other fields...
    };
    
    const emissionData = {
      emissionFactor: 2.5,
      // Other fields...
    };
    
    // Render components
    const { getByLabelText } = render(
      <CBAMWizard
        initialData={{ installationDetails: installationData, emissionFactors: emissionData }}
      />
    );
    
    // Interact with components
    fireEvent.change(getByLabelText('Installation Type'), { target: { value: 'type2' } });
    
    // Verify calculations update correctly
    // This would depend on the specific implementation
  });
});
```

### 6.3 End-to-End Tests

Create end-to-end tests for complete user workflows:

```typescript
// Example: End-to-end test for the complete CBAM report generation
describe('CBAM Report Generation', () => {
  it('should generate a complete CBAM report matching Excel output', () => {
    // Navigate to the application
    cy.visit('/');
    
    // Fill in all forms
    cy.get('[data-testid="company-info-step"]').within(() => {
      cy.get('#companyName').type('Test Company');
      // Fill other fields...
    });
    
    cy.get('[data-testid="installation-details-step"]').within(() => {
      cy.get('#installationId').type('INST001');
      cy.get('#installationType').select('type1');
      // Fill other fields...
    });
    
    // Continue through all steps...
    
    // Export to Excel
    cy.get('[data-testid="export-excel"]').click();
    
    // Verify the exported file
    cy.readFile('cypress/downloads/CBAM_Report.xlsx').then((fileContent) => {
      // Compare with expected Excel template
      // This would require a library to read Excel files in Cypress
    });
  });
});
```

### 6.4 Compare Results with Excel

For each test case, compare the web application's output with the Excel template's output:

1. Create test data in the Excel template
2. Record the results
3. Enter the same data in the web application
4. Compare the results
5. Document any discrepancies

## Step 7: Documentation Updates

### 7.1 Update User Documentation

Update the user guide to reflect any changes in functionality:

1. Add descriptions of new fields
2. Update screenshots of the UI
3. Update instructions for new workflows
4. Add troubleshooting information

### 7.2 Update Technical Documentation

Update the technical documentation to reflect any changes:

1. Add descriptions of new functions
2. Update API documentation
3. Add new data models
4. Update architecture diagrams

### 7.3 Create Comparison Report

Create a final comparison report showing:

1. All Excel features that have been implemented in the web application
2. Any remaining differences
3. Justification for any differences (if applicable)
4. Test results showing identical functionality

## Step 8: Final Verification

### 8.1 Complete Verification Checklist

Use the `CBAM_Verification_Checklist.md` to verify all aspects of the implementation:

1. Check all documentation sheets
2. Check all reference sheets
3. Check all data input sheets
4. Check all summary sheets
5. Check all calculation sheets
6. Check all web application components
7. Check all data models
8. Check the calculation engine
9. Check all validation rules
10. Check all export functionality
11. Check all test results
12. Check performance and security
13. Check all documentation
14. Check deployment readiness

### 8.2 User Acceptance Testing

Conduct user acceptance testing with actual users:

1. Provide users with test scenarios
2. Have users perform tasks in both Excel and the web application
3. Collect feedback on usability and functionality
4. Address any issues identified

## Step 9: Deployment

### 9.1 Prepare for Deployment

1. Finalize all code changes
2. Complete all testing
3. Update all documentation
4. Prepare deployment scripts

### 9.2 Deploy to Staging

1. Deploy to staging environment
2. Conduct final testing in staging
3. Address any issues identified

### 9.3 Deploy to Production

1. Deploy to production environment
2. Monitor for any issues
3. Address any issues identified
4. Announce the new functionality

## Timeline

- **Week 1-2**: Excel Template Analysis
- **Week 3**: Web Application Analysis
- **Week 4-5**: Detailed Comparison
- **Week 6**: Implementation Planning
- **Week 7-10**: Implementation
- **Week 11-12**: Testing
- **Week 13**: Documentation Updates
- **Week 14**: Final Verification
- **Week 15-16**: Deployment

## Success Criteria

1. **Functional Completeness**: All Excel functionality is implemented in the web application
2. **Calculation Accuracy**: All calculations produce identical results to Excel
3. **Validation Consistency**: All validation rules match Excel behavior
4. **User Experience**: The web application provides a better user experience than Excel
5. **Performance**: The web application performs well with large datasets
6. **Reliability**: The web application is stable and error-free

## Resources

1. **Team Members**:
   - Project Manager
   - Business Analyst
   - UI/UX Designer
   - Frontend Developer(s)
   - Backend Developer(s)
   - QA Engineer(s)
   - DevOps Engineer

2. **Tools**:
   - Excel Template
   - Web Application Code
   - PowerShell Scripts
   - Testing Frameworks
   - Documentation Tools

3. **Documentation**:
   - Excel Template Documentation
   - Web Application Documentation
   - Analysis Results
   - Comparison Templates
   - Verification Checklist