# CBAM Example Sheet Comparison: A_InstData

## Overview
This document provides an example of how to use the CBAM Sheet Comparison Template to systematically compare the A_InstData Excel sheet with its corresponding implementation in the web application.

## Sheet Information

### Sheet Name
- **Excel Sheet Name**: A_InstData
- **Web Component**: InstallationDetailsStep.tsx
- **Data Model**: InstallationDetails in CBAMData.ts
- **Status**: In Progress

### Sheet Purpose
- **Excel Purpose**: Collect installation information including installation name, address, contact person, and other details required for CBAM reporting.
- **Web Purpose**: Collect installation information through a multi-step form in the web application.
- **Match Status**: Partial Match

## Field Comparison

### Excel Fields

| Field Name | Data Type | Required | Validation | Default Value | Notes |
|------------|-----------|----------|------------|---------------|-------|
| Installation name | Text | Yes | Not empty | N/A | Name of the installation |
| Installation ID | Text | Yes | Not empty, unique | N/A | Unique identifier |
| Street | Text | Yes | Not empty | N/A | Street address |
| City | Text | Yes | Not empty | N/A | City name |
| Postal code | Text | Yes | Not empty, format | N/A | Postal code format varies by country |
| Country | Text | Yes | Not empty, from list | N/A | Country from reference list |
| Contact person | Text | Yes | Not empty | N/A | Name of contact person |
| Email | Text | Yes | Not empty, email format | N/A | Email address |
| Phone | Text | No | Phone format | N/A | Phone number |
| Installation type | Text | Yes | Not empty, from list | N/A | Type of installation |
| Main activity | Text | Yes | Not empty, from list | N/A | Main activity of installation |
| NACE code | Text | Yes | Not empty, from list | N/A | NACE classification code |
| Installation capacity | Number | Yes | Positive number | N/A | Production capacity |
| Capacity unit | Text | Yes | Not empty, from list | N/A | Unit of capacity |
| Start date | Date | Yes | Not empty, before today | N/A | Date of installation start |
| End date | Date | No | After start date | N/A | Date of installation end |
| Status | Text | Yes | Not empty, from list | N/A | Installation status |
| Comments | Text | No | No limit | N/A | Additional comments |

### Web Fields

| Field Name | Data Type | Required | Validation | Default Value | Excel Match |
|------------|-----------|----------|------------|---------------|------------|
| installationName | string | Yes | Not empty | "" | Yes |
| installationId | string | Yes | Not empty, unique | "" | Yes |
| street | string | Yes | Not empty | "" | Yes |
| city | string | Yes | Not empty | "" | Yes |
| postalCode | string | Yes | Not empty, format | "" | Yes |
| country | string | Yes | Not empty, from list | "" | Yes |
| contactPerson | string | Yes | Not empty | "" | Yes |
| email | string | Yes | Not empty, email format | "" | Yes |
| phone | string | No | Phone format | "" | Yes |
| installationType | string | Yes | Not empty, from list | "" | Yes |
| mainActivity | string | Yes | Not empty, from list | "" | Yes |
| naceCode | string | Yes | Not empty, from list | "" | Yes |
| installationCapacity | number | Yes | Positive number | 0 | Yes |
| capacityUnit | string | Yes | Not empty, from list | "" | Yes |
| startDate | Date | Yes | Not empty, before today | new Date() | Yes |
| endDate | Date | No | After start date | null | Yes |
| status | string | Yes | Not empty, from list | "" | Yes |
| comments | string | No | No limit | "" | Yes |

### Field Gap Analysis

| Excel Field | Web Field | Status | Action Required |
|-------------|-----------|--------|-----------------|
| Installation name | installationName | Match | None |
| Installation ID | installationId | Match | None |
| Street | street | Match | None |
| City | city | Match | None |
| Postal code | postalCode | Match | None |
| Country | country | Match | None |
| Contact person | contactPerson | Match | None |
| Email | email | Match | None |
| Phone | phone | Match | None |
| Installation type | installationType | Match | None |
| Main activity | mainActivity | Match | None |
| NACE code | naceCode | Match | None |
| Installation capacity | installationCapacity | Match | None |
| Capacity unit | capacityUnit | Match | None |
| Start date | startDate | Match | None |
| End date | endDate | Match | None |
| Status | status | Match | None |
| Comments | comments | Match | None |

## Calculation Comparison

### Excel Calculations

| Calculation Name | Formula | Input Fields | Output Field | Notes |
|------------------|---------|--------------|--------------|-------|
| Installation duration | =endDate - startDate | startDate, endDate | duration | Calculated in days |
| Full years | =YEAR(endDate) - YEAR(startDate) | startDate, endDate | fullYears | Calculated in years |

### Web Calculations

| Calculation Name | Function | Input Fields | Output Field | Excel Match |
|------------------|---------|--------------|--------------|------------|
| Installation duration | calculateDuration | startDate, endDate | duration | Yes |
| Full years | calculateFullYears | startDate, endDate | fullYears | Yes |

### Calculation Gap Analysis

| Excel Calculation | Web Calculation | Status | Action Required |
|-------------------|-----------------|--------|-----------------|
| Installation duration | calculateDuration | Match | None |
| Full years | calculateFullYears | Match | None |

## Validation Comparison

### Excel Validations

| Field | Validation Type | Validation Rule | Error Message | Notes |
|-------|-----------------|-----------------|---------------|-------|
| Installation name | Text length | 1-100 characters | "Installation name must be 1-100 characters" | |
| Installation ID | Text pattern | INST-[0-9]{6} | "Installation ID must be in format INST-XXXXXX" | |
| Postal code | Text pattern | [0-9]{5} | "Postal code must be 5 digits" | For specific countries |
| Email | Email format | standard email | "Invalid email format" | |
| Phone | Phone pattern | [0-9-+() ]+ | "Invalid phone format" | |
| Installation capacity | Number range | > 0 | "Installation capacity must be positive" | |
| Start date | Date range | Before today | "Start date must be before today" | |
| End date | Date range | After start date | "End date must be after start date" | |

### Web Validations

| Field | Validation Type | Validation Rule | Error Message | Excel Match |
|-------|-----------------|-----------------|---------------|------------|
| installationName | Text length | 1-100 characters | "Installation name must be 1-100 characters" | Yes |
| installationId | Text pattern | INST-[0-9]{6} | "Installation ID must be in format INST-XXXXXX" | Yes |
| postalCode | Text pattern | [0-9]{5} | "Postal code must be 5 digits" | Partial |
| email | Email format | standard email | "Invalid email format" | Yes |
| phone | Phone pattern | [0-9-+() ]+ | "Invalid phone format" | Yes |
| installationCapacity | Number range | > 0 | "Installation capacity must be positive" | Yes |
| startDate | Date range | Before today | "Start date must be before today" | Yes |
| endDate | Date range | After start date | "End date must be after start date" | Yes |

### Validation Gap Analysis

| Excel Validation | Web Validation | Status | Action Required |
|------------------|-----------------|--------|-----------------|
| Installation name | installationName | Match | None |
| Installation ID | installationId | Match | None |
| Postal code | postalCode | Partial Match | Update validation to handle different country formats |
| Email | email | Match | None |
| Phone | phone | Match | None |
| Installation capacity | installationCapacity | Match | None |
| Start date | startDate | Match | None |
| End date | endDate | Match | None |

## UI Comparison

### Excel Layout

- [ ] Single page layout with all fields visible
- [ ] Fields grouped into sections: Basic Information, Location, Contact, Technical Details
- [ ] Navigation through sheet tabs
- [ ] Data validation dropdowns
- [ ] Conditional formatting for errors

### Web Layout

- [ ] Multi-step form with sections
- [ ] Fields grouped into sections: Basic Information, Location, Contact, Technical Details
- [ ] Navigation through step buttons
- [ ] Dropdown lists for selection fields
- [ ] Real-time validation feedback

### UI Gap Analysis

| Excel Element | Web Element | Status | Action Required |
|---------------|-------------|--------|-----------------|
| Single page layout | Multi-step form | Partial Match | Consider adding single page view option |
| Field grouping | Field grouping | Match | None |
| Sheet tab navigation | Step button navigation | Match | None |
| Data validation dropdowns | Dropdown lists | Match | None |
| Conditional formatting | Real-time validation | Match | None |

## Data Flow Comparison

### Excel Data Flow

- [ ] Input from user typing
- [ ] Validation on cell exit
- [ ] Calculations update automatically
- [ ] Data stored in worksheet
- [ ] Data referenced by other sheets

### Web Data Flow

- [ ] Input from form fields
- [ ] Validation on field change
- [ ] Calculations update on value change
- [ ] Data stored in state
- [ ] Data passed to other components

### Data Flow Gap Analysis

| Excel Flow | Web Flow | Status | Action Required |
|------------|----------|--------|-----------------|
| User input | Form input | Match | None |
| Validation on exit | Validation on change | Partial Match | Consider adding validation on blur |
| Automatic calculations | On-change calculations | Match | None |
| Store in worksheet | Store in state | Match | None |
| Reference by other sheets | Pass to components | Match | None |

## Integration Comparison

### Excel Integration

- [ ] Referenced by Summary_Communication sheet
- [ ] Referenced by InputOutput sheet
- [ ] Exported to CSV
- [ ] Printed to PDF

### Web Integration

- [ ] Used by ResultsExportStep component
- [ ] Used by calculation engine
- [ ] Exported to CSV
- [ ] Exported to PDF

### Integration Gap Analysis

| Excel Integration | Web Integration | Status | Action Required |
|------------------|-----------------|--------|-----------------|
| Summary_Communication reference | ResultsExportStep | Match | None |
| InputOutput reference | Calculation engine | Match | None |
| CSV export | CSV export | Match | None |
| PDF export | PDF export | Match | None |

## Testing Comparison

### Excel Testing

- [ ] Test with valid data
- [ ] Test with invalid data
- [ ] Test with empty fields
- [ ] Test with special characters
- [ ] Test with boundary values

### Web Testing

- [ ] Test with valid data
- [ ] Test with invalid data
- [ ] Test with empty fields
- [ ] Test with special characters
- [ ] Test with boundary values

### Testing Gap Analysis

| Excel Test | Web Test | Status | Action Required |
|-------------|----------|--------|-----------------|
| Valid data test | Valid data test | Match | None |
| Invalid data test | Invalid data test | Match | None |
| Empty fields test | Empty fields test | Match | None |
| Special characters test | Special characters test | Match | None |
| Boundary values test | Boundary values test | Match | None |

## Summary

### Overall Status

- [ ] Fields: 100% complete
- [ ] Calculations: 100% complete
- [ ] Validations: 90% complete (postal code validation needs update)
- [ ] UI: 90% complete (consider adding single page view)
- [ ] Data Flow: 90% complete (consider adding validation on blur)
- [ ] Integration: 100% complete
- [ ] Testing: 100% complete

### Critical Issues

1. Postal code validation needs to handle different country formats
2. Consider adding single page view option for advanced users
3. Consider adding validation on blur for better user experience

### Action Items

1. Update postal code validation to handle different country formats - High - Developer - 2024-01-15
2. Add single page view option - Medium - Developer - 2024-01-22
3. Add validation on blur - Low - Developer - 2024-01-29

### Next Steps

1. Implement updated postal code validation
2. Test updated validation with different country formats
3. Implement single page view option
4. Test single page view with users
5. Implement validation on blur
6. Test updated validation flow

## Sign-off

### Analyst
- [x] Reviewed all comparisons
- [x] Verified all gaps
- [x] Approved action items

### Developer
- [ ] Reviewed all technical aspects
- [ ] Verified all implementations
- [ ] Approved development plan

### QA
- [ ] Reviewed all test scenarios
- [ ] Verified all test results
- [ ] Approved testing plan

### Project Manager
- [x] Reviewed all documentation
- [x] Verified all timelines
- [x] Approved project plan