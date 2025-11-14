# CBAM Web Application Faithful Replication Guide

## Overview

This guide provides a comprehensive, step-by-step process to ensure the CBAM web application faithfully replicates all functionality of the Excel template. It includes detailed comparison methods, implementation strategies, and verification procedures.

## Prerequisites

1. Access to the CBAM Excel template
2. Access to the CBAM web application source code
3. PowerShell environment with ImportExcel module
4. Text editor or IDE for code review
5. Understanding of both Excel and web application architecture

## Step 1: Excel Template Analysis

### 1.1. Run the Excel Extraction Script

Execute the PowerShell script to extract all functionality from the Excel template:

```powershell
.\excel_functionality_extractor.ps1 -ExcelFilePath "path_to_CBAM_template.xlsx" -OutputDirectory "ExcelAnalysis"
```

This will create a detailed analysis of the Excel template including:
- Worksheet structure and summary
- Raw data from each sheet
- Column information (names, types, sample values)
- Formulas used in calculations
- Named ranges and references
- Data validation rules
- Comparison templates for each sheet

### 1.2. Review Extracted Information

1. Open `ExcelAnalysis\AnalysisSummary.md` to understand the overall structure
2. Review `ExcelAnalysis\WorksheetSummary.csv` for a quick overview of all sheets
3. Examine each sheet's directory for detailed information:
   - `RawData.csv` - All data values
   - `ColumnInfo.csv` - Column structure and types
   - `Formulas.csv` - Calculation formulas
   - `NamedRanges.csv` - Named references
   - `DataValidations.csv` - Validation rules

### 1.3. Document Excel Functionality

For each worksheet, document:
1. Purpose and function
2. Input fields and their properties
3. Calculations performed
4. Validation rules applied
5. Cross-sheet references
6. User interaction patterns

## Step 2: Web Application Analysis

### 2.1. Map Excel Sheets to Web Components

Create a mapping between Excel worksheets and web application components:

| Excel Sheet | Web Component | Status | Notes |
|-------------|---------------|--------|-------|
| Sheet1 | Component1 | Complete | Matches functionality |
| Sheet2 | Component2 | Partial | Missing calculations |
| Sheet3 | Component3 | Missing | Not implemented |

### 2.2. Document Web Application Structure

For each web component:
1. Identify the React components and files
2. Document the data models used
3. List the calculations implemented
4. Note validation rules applied
5. Identify cross-component data flow

### 2.3. Document Web Calculations

Extract all calculation logic from the web application:
1. Locate calculation functions in the codebase
2. Document inputs and outputs
3. Note any external libraries used
4. Identify performance considerations

## Step 3: Detailed Comparison

### 3.1. Use Comparison Templates

For each Excel sheet, complete the comparison template:

1. Open `ExcelAnalysis\[SheetName]\ComparisonTemplate.md`
2. Fill in the corresponding web application information
3. Compare fields, calculations, validations, and UI elements
4. Document any differences or missing functionality

### 3.2. Identify Gaps

Create a comprehensive list of gaps between Excel and web:

### Field Gaps
| Excel Field | Web Field | Gap Type | Priority |
|-------------|-----------|----------|----------|
| Field1 | - | Missing | High |
| Field2 | Field2 | Different Type | Medium |

### Calculation Gaps
| Excel Calculation | Web Calculation | Gap Type | Priority |
|-------------------|-----------------|----------|----------|
| Calculation1 | - | Missing | High |
| Calculation2 | Calculation2 | Different Formula | High |

### Validation Gaps
| Excel Validation | Web Validation | Gap Type | Priority |
|------------------|----------------|----------|----------|
| Validation1 | - | Missing | Medium |
| Validation2 | Validation2 | Different Rules | Low |

### 3.3. Report Findings

Create a comprehensive report of all findings:
1. Summary of all gaps
2. Impact analysis of each gap
3. Prioritization of fixes
4. Implementation recommendations

## Step 4: Implementation Plan

### 4.1. Define Implementation Tasks

For each gap, create a detailed task:

#### Task Example: Missing Field Implementation

**Task**: Add missing field "Emission Factor" to installation data form
**Component**: `InstallationDataForm.tsx`
**Priority**: High
**Estimated Effort**: 4 hours

**Implementation Steps**:
1. Update data model in `types/installation.ts`
2. Add field to React component
3. Implement validation rules
4. Add to calculation engine
5. Update export functionality
6. Add tests

### 4.2. Create Timeline

Develop a realistic timeline for implementation:

| Phase | Duration | Tasks |
|-------|----------|-------|
| Phase 1 | 2 weeks | High priority field gaps |
| Phase 2 | 3 weeks | High priority calculation gaps |
| Phase 3 | 2 weeks | Medium priority gaps |
| Phase 4 | 2 weeks | Low priority gaps |
| Phase 5 | 2 weeks | Testing and verification |

### 4.3. Risk Management

Identify and plan for potential risks:

| Risk | Probability | Impact | Mitigation |
|-------|-------------|--------|------------|
| Complex calculations | Medium | High | Involve domain experts early |
| Performance issues | Low | Medium | Optimize algorithms and caching |
| Data model changes | High | Medium | Implement migration strategy |

## Step 5: Implementation

### 5.1. Field Implementation

When implementing missing fields:

1. Update the data model:

```typescript
// types/installation.ts
export interface Installation {
  // Existing fields...
  emissionFactor: number; // New field
  emissionFactorUnit: string; // New field
}
```

2. Add to React component:

```tsx
// components/InstallationForm.tsx
<div className="form-group">
  <label htmlFor="emissionFactor">Emission Factor</label>
  <input
    type="number"
    id="emissionFactor"
    name="emissionFactor"
    value={installation.emissionFactor}
    onChange={handleChange}
    step="0.001"
    min="0"
    required
  />
  <small className="form-text text-muted">
    Emission factor in tCO2/MWh
  </small>
</div>
```

3. Add validation:

```typescript
// validation/installationValidation.ts
export const validateInstallation = (installation: Installation) => {
  const errors: Record<string, string> = {};
  
  // Existing validations...
  
  if (!installation.emissionFactor || installation.emissionFactor <= 0) {
    errors.emissionFactor = "Emission factor must be a positive number";
  }
  
  return errors;
};
```

### 5.2. Calculation Implementation

When implementing calculations:

1. Create calculation function:

```typescript
// calculations/emissionsCalculations.ts
export const calculateEmissions = (
  energyConsumption: number,
  emissionFactor: number
): number => {
  return energyConsumption * emissionFactor;
};
```

2. Integrate with calculation engine:

```typescript
// services/calculationEngine.ts
import { calculateEmissions } from '../calculations/emissionsCalculations';

export const calculateInstallationEmissions = (installation: Installation): number => {
  return calculateEmissions(
    installation.energyConsumption,
    installation.emissionFactor
  );
};
```

3. Use in component:

```tsx
// components/InstallationSummary.tsx
const emissions = calculateInstallationEmissions(installation);

return (
  <div className="emissions-display">
    <h3>Calculated Emissions</h3>
    <p>{emissions.toFixed(3)} tCO2</p>
  </div>
);
```

### 5.3. Validation Implementation

When implementing validation rules:

1. Define validation schema:

```typescript
// validation/schemas/installationSchema.ts
import { z } from 'zod';

export const installationSchema = z.object({
  // Existing fields...
  
  emissionFactor: z
    .number()
    .min(0, "Emission factor must be positive")
    .max(10, "Emission factor cannot exceed 10 tCO2/MWh"),
    
  // More fields...
});
```

2. Implement validation component:

```tsx
// components/ValidationErrors.tsx
interface ValidationErrorsProps {
  errors: Record<string, string>;
}

export const ValidationErrors: React.FC<ValidationErrorsProps> = ({ errors }) => {
  if (Object.keys(errors).length === 0) {
    return null;
  }

  return (
    <div className="alert alert-danger">
      <h4>Please correct the following errors:</h4>
      <ul>
        {Object.entries(errors).map(([field, message]) => (
          <li key={field}>{message}</li>
        ))}
      </ul>
    </div>
  );
};
```

### 5.4. Workflow Implementation

When implementing complex workflows:

1. Create state management:

```typescript
// context/InstallationContext.tsx
import { createContext, useContext, useReducer } from 'react';

interface InstallationState {
  installations: Installation[];
  currentInstallation: Installation | null;
  isCalculating: boolean;
  errors: Record<string, string>;
}

type InstallationAction = 
  | { type: 'ADD_INSTALLATION'; payload: Installation }
  | { type: 'UPDATE_INSTALLATION'; payload: { id: string; updates: Partial<Installation> } }
  | { type: 'SET_CALCULATING'; payload: boolean };
  // More action types...

const installationReducer = (
  state: InstallationState,
  action: InstallationAction
): InstallationState => {
  // Implementation...
};

export const InstallationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(installationReducer, initialState);
  
  // Provider implementation...
};
```

2. Create workflow components:

```tsx
// components/InstallationWorkflow.tsx
export const InstallationWorkflow: React.FC = () => {
  const { state, dispatch } = useInstallationContext();
  
  const handleNextStep = () => {
    // Validate current step
    // Calculate if needed
    // Move to next step
  };
  
  return (
    <div className="installation-workflow">
      <WorkflowSteps currentStep={state.currentStep} />
      
      {state.currentStep === 1 && (
        <BasicInstallationData 
          installation={state.currentInstallation}
          onChange={(updates) => dispatch({ type: 'UPDATE_INSTALLATION', payload: { id: state.currentInstallation?.id, updates } })}
        />
      )}
      
      {/* More step components */}
      
      <WorkflowNavigation 
        currentStep={state.currentStep}
        onNext={handleNextStep}
        onPrevious={() => dispatch({ type: 'PREVIOUS_STEP' })}
      />
    </div>
  );
};
```

## Step 6: Testing

### 6.1. Unit Tests

Create unit tests for all new functionality:

```typescript
// tests/calculations/emissionsCalculations.test.ts
import { calculateEmissions } from '../../calculations/emissionsCalculations';

describe('calculateEmissions', () => {
  test('should calculate emissions correctly', () => {
    const energyConsumption = 1000; // MWh
    const emissionFactor = 0.5; // tCO2/MWh
    
    const result = calculateEmissions(energyConsumption, emissionFactor);
    
    expect(result).toBe(500); // tCO2
  });
  
  test('should handle edge cases', () => {
    expect(calculateEmissions(0, 0.5)).toBe(0);
    expect(calculateEmissions(1000, 0)).toBe(0);
  });
  
  test('should match Excel calculation', () => {
    // Test with values from Excel template
    const excelEnergyConsumption = 1234.56;
    const excelEmissionFactor = 0.789;
    const excelResult = 973.67484; // Calculated in Excel
    
    const result = calculateEmissions(excelEnergyConsumption, excelEmissionFactor);
    
    expect(Math.abs(result - excelResult) < 0.0001).toBe(true);
  });
});
```

### 6.2. Integration Tests

Test component interactions:

```typescript
// tests/components/InstallationForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { InstallationForm } from '../../components/InstallationForm';

describe('InstallationForm', () => {
  test('should update emission factor when input changes', () => {
    const mockOnChange = jest.fn();
    
    render(
      <InstallationForm
        installation={mockInstallation}
        onChange={mockOnChange}
        errors={{}}
      />
    );
    
    const emissionFactorInput = screen.getByLabelText('Emission Factor');
    fireEvent.change(emissionFactorInput, { target: { value: '0.75' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ emissionFactor: 0.75 })
    );
  });
  
  test('should show validation error for negative emission factor', () => {
    render(
      <InstallationForm
        installation={mockInstallation}
        onChange={jest.fn()}
        errors={{ emissionFactor: 'Emission factor must be positive' }}
      />
    );
    
    expect(screen.getByText('Emission factor must be positive')).toBeInTheDocument();
  });
});
```

### 6.3. End-to-End Tests

Test complete workflows:

```typescript
// tests/e2e/installationWorkflow.test.ts
describe('Installation Workflow', () => {
  test('should complete full installation workflow', () => {
    // Navigate to installation page
    cy.visit('/installations/new');
    
    // Fill in basic data
    cy.get('[data-testid=installation-name]').type('Test Installation');
    cy.get('[data-testid=installation-type]').select('Iron and Steel');
    
    // Fill in energy data
    cy.get('[data-testid=energy-consumption]').type('1000');
    cy.get('[data-testid=emission-factor]').type('0.5');
    
    // Verify calculated emissions
    cy.get('[data-testid=calculated-emissions]').should('contain', '500');
    
    // Save installation
    cy.get('[data-testid=save-button]').click();
    
    // Verify success message
    cy.get('[data-testid=success-message]').should('contain', 'Installation saved successfully');
  });
});
```

### 6.4. Comparison Tests

Create tests that directly compare with Excel calculations:

```typescript
// tests/comparisons/excelComparison.test.ts
describe('Excel Comparison Tests', () => {
  const excelTestData = [
    { energyConsumption: 1000, emissionFactor: 0.5, expectedEmissions: 500 },
    { energyConsumption: 2500, emissionFactor: 0.75, expectedEmissions: 1875 },
    { energyConsumption: 1234.56, emissionFactor: 0.789, expectedEmissions: 973.67484 },
  ];
  
  excelTestData.forEach(({ energyConsumption, emissionFactor, expectedEmissions }) => {
    test(`should match Excel calculation for ${energyConsumption} MWh and ${emissionFactor} tCO2/MWh`, () => {
      const result = calculateEmissions(energyConsumption, emissionFactor);
      
      // Allow for small floating point differences
      expect(Math.abs(result - expectedEmissions) < 0.0001).toBe(true);
    });
  });
});
```

## Step 7: Documentation

### 7.1. Update User Documentation

Update user guides to reflect any changes:

1. Update field descriptions
2. Add new workflow instructions
3. Include examples and screenshots
4. Provide troubleshooting guides

### 7.2. Update Technical Documentation

Update technical documentation:

1. Update API documentation
2. Document calculation formulas
3. Update data model documentation
4. Add integration guides

### 7.3. Create Migration Guide

If data model changes are required:

1. Document data migration strategy
2. Provide migration scripts
3. Create rollback procedures
4. Document testing approach

## Conclusion

By following this comprehensive guide, you can ensure that the CBAM web application faithfully replicates all functionality of the Excel template. The systematic approach to analysis, comparison, implementation, and testing will result in a robust and accurate web application that meets all requirements.

Remember to:
1. Thoroughly document all findings
2. Test against the Excel template at every step
3. Involve domain experts in verification
4. Regularly review progress against the plan
5. Maintain detailed records of all changes

This approach will result in a web application that provides identical functionality to the Excel template while offering the benefits of a modern web interface.