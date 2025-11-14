# CBAM Web Application UI/UX Design

## Overview
This document outlines the user interface and user experience design for the CBAM web application, focusing on creating an intuitive wizard interface that guides users through the complex CBAM reporting process step by step.

## Design Principles
1. **Simplicity**: Break down complex processes into manageable steps
2. **Clarity**: Use clear language and visual cues to guide users
3. **Efficiency**: Minimize the number of steps and reduce data entry
4. **Consistency**: Maintain consistent design patterns throughout the application
5. **Accessibility**: Ensure the application is accessible to users with disabilities
6. **Responsiveness**: Design for various screen sizes and devices

## Visual Design System

### Color Palette
- **Primary Color**: #0052CC (Blue) - For primary actions and navigation
- **Secondary Color**: #00875A (Green) - For success states and positive actions
- **Accent Color**: #FF5630 (Red) - For warnings and error states
- **Neutral Colors**: 
  - #FFFFFF (White) - Background
  - #F7F8FA (Light Gray) - Secondary background
  - #6B778C (Gray) - Secondary text
  - #172B4D (Dark Blue) - Primary text

### Typography
- **Primary Font**: Inter, sans-serif
- **Heading Sizes**:
  - H1: 28px, Bold
  - H2: 22px, Bold
  - H3: 18px, Semibold
  - H4: 16px, Semibold
- **Body Text**: 14px, Regular
- **Small Text**: 12px, Regular

### Spacing
- **Base Unit**: 8px
- **Component Spacing**: 16px (2 base units)
- **Section Spacing**: 32px (4 base units)
- **Page Padding**: 24px

### Components
- **Buttons**: 
  - Primary: Blue background, white text, rounded corners
  - Secondary: White background, blue text, blue border
  - Tertiary: Transparent background, blue text
- **Form Elements**: Consistent styling for inputs, dropdowns, checkboxes
- **Cards**: White background, subtle shadow, rounded corners
- **Icons**: Consistent icon set for actions and indicators

## Wizard Interface Design

### Wizard Structure
The CBAM reporting process is divided into 6 main steps:

1. **Company Information**
2. **Report Configuration**
3. **Installation Details**
4. **Energy & Fuel Data**
5. **Process & Production Data**
6. **Review & Export**

### Wizard Navigation

```
+------------------------------------------------------------+
| Step 1: Company Information    Step 2  Step 3  Step 4  Step 5  Step 6  |
+------------------------------------------------------------+
|                                                            |
|                    Content Area                             |
|                                                            |
+------------------------------------------------------------+
|            Previous Button          Next/Save Button        |
+------------------------------------------------------------+
```

### Progress Indicator
- **Visual**: Horizontal step indicator with numbered circles
- **Functionality**: 
  - Completed steps: Green circle with checkmark
  - Current step: Blue circle with white number
  - Future steps: Gray circle with gray number
- **Accessibility**: Each step is keyboard navigable with clear labels

## Step-by-Step UI Design

### Step 1: Company Information

**Layout**:
```
+------------------------------------------------------------+
| Step 1: Company Information                                |
+------------------------------------------------------------+
|                                                            |
|  Company Name: [________________________]                  |
|                                                            |
|  Address:      [________________________]                  |
|                                                            |
|  Country:      [Dropdown Select]                          |
|                                                            |
|  Tax ID:       [________________________]                  |
|                                                            |
|  Contact Person: [________________________]                |
|                                                            |
|  Contact Email: [________________________]                |
|                                                            |
|  [ ] I confirm that I am authorized to submit this report  |
|                                                            |
+------------------------------------------------------------+
|            Cancel                   Next Step             |
+------------------------------------------------------------+
```

**Interactions**:
- Real-time validation with inline error messages
- Auto-save functionality to prevent data loss
- Tooltips for fields requiring additional explanation

### Step 2: Report Configuration

**Layout**:
```
+------------------------------------------------------------+
| Step 2: Report Configuration                               |
+------------------------------------------------------------+
|                                                            |
|  Report Name: [________________________]                  |
|                                                            |
|  Reporting Period:                                         |
|    Start Date: [Date Picker]                               |
|    End Date:   [Date Picker]                               |
|                                                            |
|  Reporting Frequency:                                      |
|    ( ) Quarterly                                           |
|    ( ) Annual                                              |
|                                                            |
|  Currency: [Dropdown Select]                               |
|                                                            |
|  Language: [Dropdown Select]                               |
|                                                            |
|  [ ] Copy data from previous report                        |
|                                                            |
|  Previous Report: [Dropdown Select]                        |
|                                                            |
+------------------------------------------------------------+
|            Previous                   Next Step             |
+------------------------------------------------------------+
```

**Interactions**:
- Date picker with calendar interface
- Copy data functionality to reduce manual entry
- Validation to ensure end date is after start date

### Step 3: Installation Details

**Layout**:
```
+------------------------------------------------------------+
| Step 3: Installation Details                               |
+------------------------------------------------------------+
|                                                            |
|  Installation Information                                  |
|  +------------------------------------------------------+  |
|  | Installation Name: [________________________]        |  |
|  |                                                      |  |
|  | Local Name:      [________________________]        |  |
|  |                                                      |  |
|  | Address:         [________________________]        |  |
|  |                                                      |  |
|  | Country:         [Dropdown Select]                 |  |
|  |                                                      |  |
|  | Postal Code:     [________________________]        |  |
|  |                                                      |  |
|  | Sector:          [Dropdown Select]                 |  |
|  |                                                      |  |
|  | Main Products:   [________________________]        |  |
|  |                                                      |  |
|  | Production Capacity: [____] [Dropdown]              |  |
|  |                                                      |  |
|  | Installation ID: [________________________]        |  |
|  |                                                      |  |
|  | Permit Number:   [________________________]        |  |
|  +------------------------------------------------------+  |
|                                                            |
|  [Add Installation]                                       |
|                                                            |
|  Current Installations:                                    |
|  +------------------------------------------------------+  |
|  | Installation 1 | Sector | Capacity | Edit | Delete   |  |
|  | Installation 2 | Sector | Capacity | Edit | Delete   |  |
|  +------------------------------------------------------+  |
|                                                            |
+------------------------------------------------------------+
|            Previous                   Next Step             |
+------------------------------------------------------------+
```

**Interactions**:
- Dynamic form for adding multiple installations
- Inline editing for existing installations
- Confirmation dialog for deletion
- Sector-specific fields that appear based on selection

### Step 4: Energy & Fuel Data

**Layout**:
```
+------------------------------------------------------------+
| Step 4: Energy & Fuel Data                                  |
+------------------------------------------------------------+
|                                                            |
|  Select Installation: [Dropdown Select]                    |
|                                                            |
|  Fuel Consumption                                          |
|  +------------------------------------------------------+  |
|  | Fuel Type: [Dropdown Select]                         |  |
|  |                                                      |  |
|  | Consumption: [____] [Dropdown]                      |  |
|  |                                                      |  |
|  | Biomass %: [____] %                                 |  |
|  |                                                      |  |
|  | Emission Factor: [____] [Dropdown]                  |  |
|  |                                                      |  |
|  | Source Type: [Dropdown Select]                      |  |
|  +------------------------------------------------------+  |
|                                                            |
|  [Add Fuel]                                               |
|                                                            |
|  Current Fuels:                                           |
|  +------------------------------------------------------+  |
|  | Fuel Type | Consumption | Biomass | Edit | Delete   |  |
|  | Fuel Type | Consumption | Biomass | Edit | Delete   |  |
|  +------------------------------------------------------+  |
|                                                            |
|  Energy Consumption                                       |
|  +------------------------------------------------------+  |
|  | Energy Type: [Dropdown Select]                      |  |
|  |                                                      |  |
|  | Source: [Dropdown Select]                           |  |
|  |                                                      |  |
|  | Consumption: [____] [Dropdown]                      |  |
|  |                                                      |  |
|  | Is Renewable: [ ] Yes                               |  |
|  |                                                      |  |
|  | Renewable %: [____] %                               |  |
|  |                                                      |  |
|  | Emission Factor: [____] [Dropdown]                  |  |
|  +------------------------------------------------------+  |
|                                                            |
|  [Add Energy]                                             |
|                                                            |
+------------------------------------------------------------+
|            Previous                   Next Step             |
+------------------------------------------------------------+
```

**Interactions**:
- Tabbed interface for switching between fuel and energy data
- Auto-calculation of emissions based on consumption and emission factors
- Pre-populated emission factors based on fuel/energy type
- Visual indicators for renewable energy

### Step 5: Process & Production Data

**Layout**:
```
+------------------------------------------------------------+
| Step 5: Process & Production Data                           |
+------------------------------------------------------------+
|                                                            |
|  Select Installation: [Dropdown Select]                    |
|                                                            |
|  Process Information                                        |
|  +------------------------------------------------------+  |
|  | Process Type: [Dropdown Select]                      |  |
|  |                                                      |  |
|  | Production Route: [________________________]        |  |
|  |                                                      |  |
|  | Production Amount: [____] [Dropdown]                |  |
|  |                                                      |  |
|  | Direct Emissions: [____] [Dropdown]                 |  |
|  |                                                      |  |
|  | Indirect Emissions: [____] [Dropdown]               |  |
|  +------------------------------------------------------+  |
|                                                            |
|  [Add Process]                                             |
|                                                            |
|  Current Processes:                                        |
|  +------------------------------------------------------+  |
|  | Process | Production | Direct | Indirect | Edit | Del |  |
|  | Process | Production | Direct | Indirect | Edit | Del |  |
|  +------------------------------------------------------+  |
|                                                            |
|  Product Information                                       |
|  +------------------------------------------------------+  |
|  | Product Name: [________________________]            |  |
|  |                                                      |  |
|  | CN Code: [Dropdown Select]                          |  |
|  |                                                      |  |
|  | Production Amount: [____] [Dropdown]                |  |
|  |                                                      |  |
|  | Specific Emissions: [____] [Dropdown]               |  |
|  +------------------------------------------------------+  |
|                                                            |
|  [Add Product]                                            |
|                                                            |
+------------------------------------------------------------+
|            Previous                   Next Step             |
+------------------------------------------------------------+
```

**Interactions**:
- Dynamic form fields based on process type selection
- Auto-calculation of specific emissions
- CN code lookup with autocomplete
- Visual representation of emissions breakdown

### Step 6: Review & Export

**Layout**:
```
+------------------------------------------------------------+
| Step 6: Review & Export                                     |
+------------------------------------------------------------+
|                                                            |
|  Report Summary                                            |
|  +------------------------------------------------------+  |
|  | Company: [Company Name]                               |  |
|  | Report: [Report Name]                                 |  |
|  | Period: [Start Date] - [End Date]                    |  |
|  | Installations: [Number]                               |  |
|  | Status: [Draft/Completed]                            |  |
|  +------------------------------------------------------+  |
|                                                            |
|  Calculated Results                                        |
|  +------------------------------------------------------+  |
|  | Total Direct Emissions: [Value] [Unit]               |  |
|  | Total Process Emissions: [Value] [Unit]              |  |
|  | Total Energy Consumption: [Value] [Unit]             |  |
|  | Renewable Energy Share: [Value] %                    |  |
|  | Total Embedded Emissions: [Value] [Unit]             |  |
|  | Total Cumulative Emissions: [Value] [Unit]           |  |
|  +------------------------------------------------------+  |
|                                                            |
|  [View Detailed Report]                                    |
|                                                            |
|  Export Options                                            |
|  +------------------------------------------------------+  |
|  | [ ] Export as Excel (CBAM Template)                  |  |
|  | [ ] Export as PDF                                     |  |
|  | [ ] Export as XML (for CBAM Registry)                |  |
|  +------------------------------------------------------+  |
|                                                            |
|  [ ] I confirm that the data is accurate and complete     |
|                                                            |
+------------------------------------------------------------+
|            Previous                Submit Report          |
+------------------------------------------------------------+
```

**Interactions**:
- Comprehensive summary of all entered data
- Real-time calculation results
- Multiple export options
- Confirmation checkbox before submission
- Visual indicators for any warnings or errors

## Responsive Design

### Mobile Layout (320px - 768px)
- Single column layout
- Collapsible navigation
- Simplified forms with fewer fields visible at once
- Larger touch targets for buttons and form elements
- Swipe gestures for navigation between wizard steps

### Tablet Layout (768px - 1024px)
- Two-column layout where appropriate
- Optimized form layouts
- Touch-friendly interface elements
- Side navigation for quick access to different sections

### Desktop Layout (1024px+)
- Full multi-column layout
- Hover states for interactive elements
- Keyboard shortcuts for power users
- Advanced features and data visualization

## Accessibility Considerations

1. **Keyboard Navigation**: All interactive elements are keyboard accessible
2. **Screen Reader Support**: Proper ARIA labels and semantic HTML
3. **Color Contrast**: WCAG AA compliant color contrast ratios
4. **Focus Indicators**: Clear focus states for all interactive elements
5. **Alternative Text**: Meaningful alt text for all images
6. **Error Handling**: Clear error messages that are accessible to screen readers

## Microinteractions

1. **Loading States**: Skeleton loaders during data retrieval
2. **Progress Indicators**: Visual feedback for long-running calculations
3. **Hover States**: Subtle hover effects on interactive elements
4. **Transitions**: Smooth transitions between wizard steps
5. **Success States**: Confirmation messages for successful actions
6. **Error States**: Clear error states with guidance for resolution

## Error Handling and Validation

1. **Inline Validation**: Real-time validation with helpful error messages
2. **Form Validation**: Comprehensive validation before proceeding to the next step
3. **Error Recovery**: Clear guidance on how to fix errors
4. **Data Persistence**: Auto-save to prevent data loss
5. **Confirmation Dialogs**: For destructive actions like deletion

## Performance Considerations

1. **Lazy Loading**: Load data as needed to improve initial load time
2. **Optimized Images**: Use properly sized and optimized images
3. **Minimize HTTP Requests**: Combine files where possible
4. **Caching Strategy**: Implement appropriate caching for static assets
5. **Progressive Enhancement**: Ensure core functionality works without JavaScript

## Conclusion
This UI/UX design provides a comprehensive roadmap for creating an intuitive wizard interface for the CBAM web application. The design focuses on simplifying the complex CBAM reporting process while ensuring all functional requirements are met.

The wizard interface guides users through the reporting process step by step, with clear visual cues, helpful validation, and an intuitive flow. The responsive design ensures the application works well on various devices, and the accessibility considerations ensure the application is usable by all users.