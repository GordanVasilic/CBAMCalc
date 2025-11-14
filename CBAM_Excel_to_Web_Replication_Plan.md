# CBAM Excel to Web Replication Plan

## Overview

This document outlines a comprehensive plan to ensure the CBAM web application's functionality is identical to the Excel template. The plan includes detailed phases, tasks, timelines, and success criteria.

## Objectives

1. Ensure 100% functional parity between Excel template and web application
2. Maintain calculation accuracy to 4 decimal places
3. Implement all validation rules from Excel
4. Replicate all user workflows and interactions
5. Provide seamless data import/export compatibility

## Phase 1: Excel Template Analysis (2-3 weeks)

### 1.1. Run Excel Extraction Script

**Task**: Execute the Excel extraction script to systematically analyze all functionality

**Steps**:
1. Run `excel_functionality_extractor.ps1` with the CBAM Excel template
2. Review all generated outputs and identify any missing information
3. Manually document any functionality not captured by the script

**Deliverables**:
- Complete Excel analysis report
- Detailed documentation of all Excel functionality
- List of all calculations, validations, and workflows

### 1.2. Document Reference Sheets

**Task**: Analyze and document all reference sheets in the Excel template

**Steps**:
1. Review all reference sheets (e.g., code lists, parameters)
2. Document the purpose and content of each reference sheet
3. Identify any dependencies between reference sheets
4. Document how reference data is used in calculations

**Deliverables**:
- Reference sheet documentation
- Data model for reference data
- Dependency diagram for reference data

### 1.3. Document Data Input Sheets

**Task**: Analyze and document all data input sheets in the Excel template

**Steps**:
1. Review all data input sheets (e.g., installation data, energy data)
2. Document all fields, their data types, and validation rules
3. Document any conditional logic that shows/hides fields
4. Document any calculations that occur on data entry

**Deliverables**:
- Data input sheet documentation
- Field specifications with validation rules
- Conditional logic documentation

### 1.4. Document Summary and Calculation Sheets

**Task**: Analyze and document all summary and calculation sheets in the Excel template

**Steps**:
1. Review all summary and calculation sheets
2. Document all calculations, including formulas and cell references
3. Document any cross-sheet calculations
4. Document summary aggregations and presentations

**Deliverables**:
- Calculation sheet documentation
- Formula documentation
- Cross-sheet reference documentation

### 1.5. Document VBA Macros and Automation

**Task**: Analyze and document all VBA macros and automation in the Excel template

**Steps**:
1. Review all VBA code in the Excel template
2. Document the purpose and functionality of each macro
3. Identify any automated workflows or processes
4. Document any external integrations or data connections

**Deliverables**:
- VBA macro documentation
- Automation workflow documentation
- Integration documentation

## Phase 2: Web Application Analysis (1-2 weeks)

### 2.1. Map Excel Sheets to Web Components

**Task**: Create a comprehensive mapping between Excel sheets and web application components

**Steps**:
1. Identify all web application components
2. Map each Excel sheet to its corresponding web component(s)
3. Identify any Excel sheets without corresponding web components
4. Identify any web components without corresponding Excel sheets

**Deliverables**:
- Excel sheet to web component mapping matrix
- List of missing components
- List of extra components

### 2.2. Analyze Web Application Data Models

**Task**: Analyze and document all data models in the web application

**Steps**:
1. Review all data models and interfaces
2. Document the structure and relationships of each model
3. Identify any missing fields or properties compared to Excel
4. Identify any extra fields or properties not in Excel

**Deliverables**:
- Web application data model documentation
- Data model comparison with Excel
- List of missing and extra fields

### 2.3. Analyze Web Application Calculation Engine

**Task**: Analyze and document the calculation engine in the web application

**Steps**:
1. Review all calculation functions and algorithms
2. Document the input and output of each calculation
3. Compare with Excel calculations to identify differences
4. Identify any missing or extra calculations

**Deliverables**:
- Calculation engine documentation
- Calculation comparison with Excel
- List of missing and extra calculations

### 2.4. Analyze Web Application Validation Logic

**Task**: Analyze and document all validation logic in the web application

**Steps**:
1. Review all validation rules and logic
2. Document the purpose and criteria of each validation
3. Compare with Excel validations to identify differences
4. Identify any missing or extra validations

**Deliverables**:
- Validation logic documentation
- Validation comparison with Excel
- List of missing and extra validations

## Phase 3: Detailed Comparison (2-3 weeks)

### 3.1. Sheet-by-Sheet Comparison

**Task**: Perform a detailed comparison of each Excel sheet with its corresponding web component

**Steps**:
1. Use the comparison templates generated in Phase 1
2. Complete the web application information for each template
3. Identify all differences, gaps, and inconsistencies
4. Prioritize identified issues by impact and complexity

**Deliverables**:
- Completed comparison templates for all sheets
- List of identified differences and gaps
- Prioritized issue list

### 3.2. Calculation Comparison

**Task**: Perform a detailed comparison of all calculations between Excel and the web application

**Steps**:
1. Create test cases for each calculation
2. Execute calculations in both Excel and the web application
3. Compare results and identify discrepancies
4. Analyze the root cause of any differences

**Deliverables**:
- Calculation comparison report
- Test case documentation
- Discrepancy analysis

### 3.3. Validation Comparison

**Task**: Perform a detailed comparison of all validation rules between Excel and the web application

**Steps**:
1. Create test cases for each validation rule
2. Test validations in both Excel and the web application
3. Compare results and identify differences
4. Determine the correct behavior for each validation

**Deliverables**:
- Validation comparison report
- Test case documentation
- Validation rule specifications

## Phase 4: Implementation Plan (3-4 weeks)

### 4.1. Define Implementation Tasks

**Task**: Create a detailed task list for implementing all identified gaps

**Steps**:
1. Break down each gap into specific implementation tasks
2. Estimate the effort required for each task
3. Identify dependencies between tasks
4. Assign tasks to team members

**Deliverables**:
- Detailed task list with estimates
- Task dependency diagram
- Team assignment plan

### 4.2. Create Implementation Timeline

**Task**: Create a realistic timeline for implementing all identified gaps

**Steps**:
1. Sequence tasks based on dependencies
2. Allocate resources for each task
3. Identify critical path items
4. Create milestone dates

**Deliverables**:
- Implementation timeline with milestones
- Resource allocation plan
- Critical path analysis

### 4.3. Define Risk Management Plan

**Task**: Identify and plan for potential risks during implementation

**Steps**:
1. Identify potential risks for each implementation task
2. Assess the probability and impact of each risk
3. Develop mitigation strategies for high-priority risks
4. Create contingency plans

**Deliverables**:
- Risk register
- Risk mitigation strategies
- Contingency plans

## Phase 5: Implementation (6-8 weeks)

### 5.1. Implement Field Gaps

**Task**: Implement all missing fields and correct field differences

**Steps**:
1. Update data models for missing fields
2. Add fields to React components
3. Implement validation rules for new fields
4. Update export/import functionality
5. Add appropriate tests

**Code Example**:

```typescript
// Update data model
type InstallationData = {
  // Existing fields...
  emissionFactor: number; // New field
  emissionFactorSource: string; // New field
};

// Update React component
const EmissionFactorField: React.FC<{
  value: number;
  onChange: (value: number) => void;
  error?: string;
}> = ({ value, onChange, error }) => {
  return (
    <div className="form-group">
      <label htmlFor="emissionFactor">Emission Factor (tCO2/MWh)</label>
      <input
        type="number"
        id="emissionFactor"
        className={error ? "is-invalid" : ""}
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        step="0.0001"
        min="0"
        max="10"
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

// Update validation
const validateEmissionFactor = (value: number): string | null => {
  if (isNaN(value) || value < 0) {
    return "Emission factor must be a positive number";
  }
  if (value > 10) {
    return "Emission factor cannot exceed 10 tCO2/MWh";
  }
  return null;
};
```

### 5.2. Implement Calculation Gaps

**Task**: Implement all missing calculations and correct calculation differences

**Steps**:
1. Create calculation functions matching Excel formulas
2. Integrate calculations with the calculation engine
3. Update components to use new calculations
4. Implement caching for performance optimization
5. Add appropriate tests

**Code Example**:

```typescript
// Create calculation function matching Excel formula
export const calculateEmissions = (
  energyConsumption: number,
  emissionFactor: number
): number => {
  // Excel formula: =energyConsumption * emissionFactor
  return energyConsumption * emissionFactor;
};

// Update calculation engine
export const calculateInstallationEmissions = (
  installation: InstallationData
): EmissionsResult => {
  const { energyConsumption, emissionFactor } = installation;
  
  const directEmissions = calculateEmissions(energyConsumption, emissionFactor);
  const indirectEmissions = calculateIndirectEmissions(installation);
  const totalEmissions = directEmissions + indirectEmissions;
  
  return {
    direct: directEmissions,
    indirect: indirectEmissions,
    total: totalEmissions,
  };
};

// Add to component
const EmissionsSummary: React.FC<{ installation: InstallationData }> = ({ installation }) => {
  const emissions = useMemo(
    () => calculateInstallationEmissions(installation),
    [installation]
  );
  
  return (
    <div className="emissions-summary">
      <h3>Emissions Summary</h3>
      <p>Direct Emissions: {emissions.direct.toFixed(4)} tCO2</p>
      <p>Indirect Emissions: {emissions.indirect.toFixed(4)} tCO2</p>
      <p>Total Emissions: {emissions.total.toFixed(4)} tCO2</p>
    </div>
  );
};
```

### 5.3. Implement Validation Gaps

**Task**: Implement all missing validations and correct validation differences

**Steps**:
1. Create validation functions matching Excel rules
2. Integrate validations with form components
3. Implement conditional validation logic
4. Add appropriate error messaging
5. Add appropriate tests

**Code Example**:

```typescript
// Create validation function matching Excel rule
export const validateEmissionData = (data: EmissionData): ValidationResult => {
  const errors: Record<string, string> = {};
  
  // Excel validation: Emissions must be positive and less than 1,000,000 tCO2
  if (data.emissions <= 0) {
    errors.emissions = "Emissions must be a positive number";
  } else if (data.emissions > 1000000) {
    errors.emissions = "Emissions cannot exceed 1,000,000 tCO2";
  }
  
  // Excel validation: If emissions > 10,000, verification required
  if (data.emissions > 10000 && !data.verified) {
    errors.verified = "Verification required for emissions exceeding 10,000 tCO2";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Add to form component
const EmissionForm: React.FC = () => {
  const [formData, setFormData] = useState<EmissionData>(initialData);
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
  });
  
  const handleFieldChange = (field: keyof EmissionData, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    setValidationResult(validateEmissionData(newData));
  };
  
  return (
    <form>
      {/* Form fields */}
      
      {!validationResult.isValid && (
        <div className="alert alert-danger">
          <h4>Please correct the following errors:</h4>
          <ul>
            {Object.entries(validationResult.errors).map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      
      <button
        type="submit"
        disabled={!validationResult.isValid}
        className="btn btn-primary"
      >
        Save
      </button>
    </form>
  );
};
```

### 5.4. Implement Workflow Gaps

**Task**: Implement all missing workflows and correct workflow differences

**Steps**:
1. Analyze workflow requirements from Excel
2. Implement state management for workflows
3. Create workflow components and navigation
4. Implement conditional logic based on Excel behavior
5. Add appropriate tests

**Code Example**:

```typescript
// Create workflow state management
interface WorkflowState {
  currentStep: number;
  data: Record<string, any>;
  completedSteps: Set<number>;
  errors: Record<string, string>;
}

type WorkflowAction =
  | { type: "NEXT_STEP" }
  | { type: "PREVIOUS_STEP" }
  | { type: "GO_TO_STEP"; payload: number }
  | { type: "UPDATE_DATA"; payload: Record<string, any> };

const workflowReducer = (
  state: WorkflowState,
  action: WorkflowAction
): WorkflowState => {
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, totalSteps),
        completedSteps: new Set([...state.completedSteps, state.currentStep]),
      };
    case "PREVIOUS_STEP":
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };
    case "GO_TO_STEP":
      return {
        ...state,
        currentStep: action.payload,
      };
    case "UPDATE_DATA":
      return {
        ...state,
        data: { ...state.data, ...action.payload },
      };
    default:
      return state;
  }
};

// Create workflow component
const InstallationWorkflow: React.FC = () => {
  const [state, dispatch] = useReducer(workflowReducer, initialState);
  
  const handleNext = () => {
    // Validate current step
    const isValid = validateStep(state.currentStep, state.data);
    
    if (isValid) {
      dispatch({ type: "NEXT_STEP" });
    } else {
      // Show validation errors
    }
  };
  
  const handlePrevious = () => {
    dispatch({ type: "PREVIOUS_STEP" });
  };
  
  return (
    <div className="workflow">
      <WorkflowSteps currentStep={state.currentStep} />
      
      {state.currentStep === 1 && (
        <BasicDataStep
          data={state.data}
          onChange={(data) => dispatch({ type: "UPDATE_DATA", payload: data })}
        />
      )}
      
      {state.currentStep === 2 && (
        <EnergyDataStep
          data={state.data}
          onChange={(data) => dispatch({ type: "UPDATE_DATA", payload: data })}
        />
      )}
      
      {/* More steps */}
      
      <WorkflowNavigation
        currentStep={state.currentStep}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canGoNext={validateStep(state.currentStep, state.data)}
        canGoPrevious={state.currentStep > 1}
      />
    </div>
  );
};
```

## Phase 6: Testing (2-3 weeks)

### 6.1. Unit Testing

**Task**: Create comprehensive unit tests for all implemented functionality

**Steps**:
1. Create unit tests for all new calculation functions
2. Create unit tests for all new validation functions
3. Create unit tests for all new data models
4. Ensure all code is covered by tests

**Deliverables**:
- Complete unit test suite
- Code coverage report
- Test documentation

### 6.2. Integration Testing

**Task**: Create comprehensive integration tests for all implemented functionality

**Steps**:
1. Create integration tests for component interactions
2. Create integration tests for data flow between components
3. Create integration tests for calculation workflows
4. Create integration tests for validation workflows

**Deliverables**:
- Complete integration test suite
- Test documentation
- Test results report

### 6.3. End-to-End Testing

**Task**: Create comprehensive end-to-end tests for all implemented functionality

**Steps**:
1. Create end-to-end tests for complete user workflows
2. Create tests for data import/export functionality
3. Create tests for error handling and recovery
4. Create tests for performance and scalability

**Deliverables**:
- Complete end-to-end test suite
- Test documentation
- Test results report

### 6.4. Excel Comparison Testing

**Task**: Create tests that directly compare web application results with Excel

**Steps**:
1. Create test data sets from the Excel template
2. Execute calculations in both Excel and the web application
3. Compare results and ensure they match to 4 decimal places
4. Document any remaining differences and their causes

**Deliverables**:
- Excel comparison test suite
- Test data sets
- Comparison results report

## Phase 7: Documentation and Deployment (2 weeks)

### 7.1. Update User Documentation

**Task**: Update all user documentation to reflect changes

**Steps**:
1. Update user guides for all changed functionality
2. Update help text and tooltips
3. Update screenshots and examples
4. Create migration guides for users

**Deliverables**:
- Updated user documentation
- Updated help text and tooltips
- Migration guides

### 7.2. Update Technical Documentation

**Task**: Update all technical documentation to reflect changes

**Steps**:
1. Update API documentation
2. Update component documentation
3. Update calculation documentation
4. Update deployment documentation

**Deliverables**:
- Updated technical documentation
- API documentation
- Component documentation

### 7.3. Deploy to Staging

**Task**: Deploy the updated application to a staging environment

**Steps**:
1. Prepare deployment scripts
2. Deploy to staging environment
3. Perform smoke testing
4. Perform user acceptance testing

**Deliverables**:
- Deployment scripts
- Staging environment
- Smoke test results
- User acceptance test results

### 7.4. Deploy to Production

**Task**: Deploy the updated application to production

**Steps**:
1. Schedule deployment window
2. Deploy to production environment
3. Perform post-deployment testing
4. Monitor for issues

**Deliverables**:
- Production deployment
- Post-deployment test results
- Monitoring reports

## Success Criteria

1. **Functional Completeness**: All Excel functionality is replicated in the web application
2. **Calculation Accuracy**: All calculations match Excel results to 4 decimal places
3. **Validation Consistency**: All validation rules match Excel behavior
4. **User Experience**: User workflows are intuitive and efficient
5. **Performance**: Application performs well with large data sets
6. **Reliability**: Application is stable and handles errors gracefully

## Required Resources

1. **Project Manager**: 1 person, 16 weeks
2. **Business Analyst**: 1 person, 8 weeks
3. **Excel Expert**: 1 person, 4 weeks
4. **Frontend Developer**: 2 people, 12 weeks
5. **Backend Developer**: 1 person, 8 weeks
6. **QA Engineer**: 1 person, 8 weeks
7. **Technical Writer**: 1 person, 4 weeks

## Timeline

| Phase | Duration | Start Date | End Date |
|-------|----------|------------|----------|
| Phase 1: Excel Template Analysis | 3 weeks | Week 1 | Week 3 |
| Phase 2: Web Application Analysis | 2 weeks | Week 4 | Week 5 |
| Phase 3: Detailed Comparison | 3 weeks | Week 6 | Week 8 |
| Phase 4: Implementation Plan | 3 weeks | Week 9 | Week 11 |
| Phase 5: Implementation | 8 weeks | Week 12 | Week 19 |
| Phase 6: Testing | 3 weeks | Week 20 | Week 22 |
| Phase 7: Documentation and Deployment | 2 weeks | Week 23 | Week 24 |

**Total Duration**: 24 weeks (6 months)

## Conclusion

This comprehensive plan ensures that the CBAM web application will have identical functionality to the Excel template. By following this systematic approach, we can identify and address all gaps between the Excel template and the web application, resulting in a robust and accurate web application that meets all requirements.

The key to success is thorough documentation, systematic comparison, and comprehensive testing at each stage of the process. By involving domain experts and end-users throughout the process, we can ensure that the final web application not only matches the Excel template in functionality but also provides an improved user experience.

Regular reviews and progress checkpoints will ensure that the project stays on track and that any issues are identified and addressed early in the process.