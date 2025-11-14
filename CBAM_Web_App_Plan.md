# CBAM Web Application Plan

## Project Overview
Create a web application that guides users through the CBAM (Carbon Border Adjustment Mechanism) reporting process in an intuitive wizard format, replacing the complex Excel template with a step-by-step interface.

## Application Goals
1. Simplify the CBAM reporting process through an intuitive wizard interface
2. Automate calculations for emissions, energy usage, and embedded emissions
3. Generate CBAM-compliant reports identical to the Excel template output
4. Provide clear guidance and validation at each step
5. Support multiple languages (starting with English and Croatian)

## Application Architecture

### Technology Stack
- **Frontend**: React.js with TypeScript for type safety
- **UI Framework**: Material-UI or Ant Design for professional wizard components
- **State Management**: Redux Toolkit for complex state management
- **Backend**: Node.js with Express.js for API endpoints
- **Database**: PostgreSQL for storing user data and reports
- **Authentication**: JWT-based authentication
- **File Export**: Library to generate Excel files in the exact CBAM template format

### Application Structure
```
/src
  /components
    /wizard
      StepNavigation.js
      ProgressBar.js
    /forms
      InstallationForm.js
      EmissionsForm.js
      ProcessesForm.js
      ProductsForm.js
    /calculations
      EmissionsCalculator.js
      EnergyCalculator.js
      EmbeddedEmissionsCalculator.js
    /reports
      ReportPreview.js
      ReportExport.js
  /services
    api.js
    calculations.js
    export.js
  /store
    /slices
      installationSlice.js
      emissionsSlice.js
      processesSlice.js
      productsSlice.js
  /utils
    constants.js
    validators.js
    formatters.js
```

## User Flow (Wizard Steps)

### Step 1: Welcome & Setup
- Brief introduction to CBAM reporting
- Language selection (English/Croatian)
- New report or load existing report
- Basic project information:
  - Report name
  - Reporting period
  - Company details

### Step 2: Installation Details
Based on A_InstData sheet:
- Installation identification:
  - Installation name (English)
  - Installation name (local language)
  - Installation address
  - Country
  - Installation ID (if applicable)
- Installation type:
  - Industry sector (dropdown with CBAM categories)
  - Main products
  - Production capacity

### Step 3: Fuels & Energy Input
Based on C_Emissions&Energy sheet:
- Fuel consumption details:
  - Fuel type (dropdown with CBAM fuel codes)
  - Consumption amount
  - Unit of measurement
  - Emission factor (auto-populated based on fuel type)
  - Biomass percentage (if applicable)
- Energy consumption:
  - Electricity consumption
  - Heat/steam consumption
  - Renewable energy percentage
  - Source of electricity (grid/own generation)

### Step 4: Production Processes
Based on D_Processes sheet:
- Process definition:
  - Process name
  - Process type (from CBAM process codes)
  - Production route
- Input materials:
  - Raw materials (with quantities)
  - Intermediate products
  - Purchased precursors
- Output products:
  - Main products
  - By-products
  - Waste products
- Process efficiency parameters
- Emission points within the process

### Step 5: Emissions Data
Based on C_Emissions&Energy sheet:
- Direct emissions:
  - CO2 emissions by source
  - Measurement method
  - Calculation methodology
- Indirect emissions:
  - Electricity-related emissions
  - Heat/steam-related emissions
- Process emissions:
  - Chemical process emissions
  - Other specific process emissions

### Step 6: Product Details
Based on E_PurchPrec sheet:
- Product information:
  - Product name
  - CN code (auto-suggest based on product type)
  - Production quantity
  - Units
- Embedded emissions:
  - Direct embedded emissions
  - Indirect embedded emissions
  - Total embedded emissions

### Step 7: Data Review & Validation
- Summary of all entered data
- Validation checks:
  - Completeness checks
  - Consistency checks
  - Range validation for numerical values
- Highlight any missing or inconsistent data
- Allow corrections before finalization

### Step 8: Results & Reports
- Calculated results:
  - Total direct CO2 emissions by process
  - Total direct CO2 emissions by product
  - Specific emissions (kg CO2/tonne of product)
  - Total energy consumption and renewable percentage
  - Imported materials percentage and embedded emissions
  - Cumulative emissions for CBAM declaration
- Visual representations:
  - Emissions breakdown charts
  - Energy mix pie chart
  - Emissions intensity comparisons
- Export options:
  - Generate CBAM-compliant Excel file
  - Generate PDF report
  - Save data to account

## Data Model

### Installation Data
```javascript
{
  id: string,
  name: {
    english: string,
    local: string
  },
  address: {
    street: string,
    city: string,
    country: string,
    postalCode: string
  },
  sector: string, // CBAM sector code
  mainProducts: string[],
  productionCapacity: {
    value: number,
    unit: string
  }
}
```

### Fuel Data
```javascript
{
  id: string,
  fuelType: string, // CBAM fuel code
  consumption: {
    value: number,
    unit: string
  },
  emissionFactor: number, // tCO2/TJ or tCO2/tonne
  biomassPercentage: number
}
```

### Process Data
```javascript
{
  id: string,
  name: string,
  processType: string, // CBAM process code
  productionRoute: string,
  inputs: [{
    material: string,
    quantity: number,
    unit: string,
    isImported: boolean,
    embeddedEmissions: number
  }],
  outputs: [{
    product: string,
    quantity: number,
    unit: string
  }],
  emissions: {
    direct: number,
    indirect: number,
    total: number
  }
}
```

### Product Data
```javascript
{
  id: string,
  name: string,
  cnCode: string,
  productionQuantity: {
    value: number,
    unit: string
  },
  specificEmissions: {
    direct: number, // kg CO2/tonne
    indirect: number,
    total: number
  },
  embeddedEmissions: {
    direct: number,
    indirect: number,
    total: number
  }
}
```

## Calculation Logic

### Direct Emissions Calculation
Based on F_Tools sheet formulas:
```
Direct Emissions = Σ(Fuel Consumption × Emission Factor × (1 - Biomass%))
```

### Specific Emissions Calculation
```
Specific Emissions (kg CO2/tonne) = Total Emissions (tCO2) / Production (tonnes) × 1000
```

### Embedded Emissions Calculation
Based on E_PurchPrec sheet:
```
Total Embedded Emissions = Direct Embedded Emissions + Indirect Embedded Emissions
```

### Energy Metrics
```
Renewable Energy % = (Renewable Energy Consumption / Total Energy Consumption) × 100
```

## Implementation Phases

### Phase 1: Core Wizard Framework (4-6 weeks)
- Set up project structure
- Implement basic wizard navigation
- Create Step 1 (Welcome & Setup)
- Create Step 2 (Installation Details)
- Basic form validation

### Phase 2: Input Forms (6-8 weeks)
- Implement Step 3 (Fuels & Energy Input)
- Implement Step 4 (Production Processes)
- Implement Step 5 (Emissions Data)
- Implement Step 6 (Product Details)
- Advanced form validation
- Data persistence

### Phase 3: Calculations & Results (4-6 weeks)
- Implement calculation engine
- Implement Step 7 (Data Review & Validation)
- Implement Step 8 (Results & Reports)
- Create visual charts and graphs

### Phase 4: Export & Integration (3-4 weeks)
- Implement Excel export functionality
- Implement PDF report generation
- User account management
- Data saving and loading

### Phase 5: Testing & Refinement (2-3 weeks)
- Comprehensive testing
- User acceptance testing
- Performance optimization
- Bug fixes and refinements

## Key Features

### Data Validation
- Required field validation
- Range validation for numerical inputs
- Consistency checks between related fields
- Real-time validation feedback

### Auto-Population
- Emission factors based on fuel type
- CN codes based on product names
- Default values for common processes

### Calculation Transparency
- Show calculation formulas used
- Provide sources for emission factors
- Allow manual override of calculated values

### Multi-Language Support
- Croatian and English interface
- Croatian translations for technical terms
- Localized number and date formats

### Help & Guidance
- Tooltips explaining technical terms
- Context-sensitive help
- Example data for reference
- Links to official CBAM documentation

## Technical Considerations

### Performance
- Optimize calculation engine for large datasets
- Implement lazy loading for complex forms
- Use efficient state management patterns

### Security
- Secure data transmission
- User authentication and authorization
- Data encryption for sensitive information

### Compliance
- Ensure calculations match official CBAM methodology
- Stay updated with CBAM regulation changes
- Generate reports in exact CBAM template format

### Scalability
- Design for multiple concurrent users
- Optimize database queries
- Implement caching for frequently accessed data

## Conclusion
This web application will significantly simplify the CBAM reporting process by replacing the complex Excel template with an intuitive, step-by-step wizard. The automated calculations, validation, and guidance will help users accurately report their emissions data while ensuring compliance with CBAM regulations.

The modular architecture allows for phased development, making the project manageable while delivering value at each phase. The focus on user experience, calculation transparency, and compliance will result in a tool that users can trust and rely on for their CBAM reporting needs.