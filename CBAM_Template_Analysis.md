# CBAM Communication Template for Installations - Structure Analysis

## Overview
The CBAM (Carbon Border Adjustment Mechanism) Communication Template for Installations is a comprehensive Excel file with 19 sheets designed to collect and communicate carbon emissions data from non-EU suppliers to EU importers.

## File Information
- File name: CBAM Communication template for installations_en_20241213.xlsx
- Size: 1,333,557 bytes (approximately 1.3 MB)
- Last modified: October 21, 2025
- Language: English

## Sheet Structure

### 1. Documentation Sheets
- **0_Versions**: Version history and documentation
- **a_Contents**: Table of contents for navigation
- **b_Guidelines&Conditions**: Usage guidelines and conditions
- **G_FurtherGuidance**: Additional guidance information
- **VersionDocumentation**: Detailed version documentation

### 2. Reference Sheets
- **c_CodeLists**: Reference codes and classifications (1043 rows, 24 columns)
- **Parameters_Constants**: Constants and parameters for calculations
- **Parameters_CNCodes**: CN codes reference
- **Translations**: Translation data

### 3. Data Input Sheets
- **A_InstData**: Installation data input
- **B_EmInst**: Empty installation template
- **C_Emissions&Energy**: Emissions and energy data input
- **D_Processes**: Process data input
- **E_PurchPrec**: Purchased precursors data input

### 4. Summary Sheets
- **Summary_Processes**: Summary of process data (522 rows, 41 columns)
- **Summary_Products**: Summary of product data
- **Summary_Communication**: Main communication sheet for reporting (128 rows, 59 columns)

### 5. Calculation Sheets
- **F_Tools**: Tools and calculations
- **InputOutput**: Input/output calculations

## Key Sections

### Summary_Communication Sheet
This is the main communication sheet that summarizes information from "Summary_Processes" and "Summary_Products" to be communicated to reporting declarants importing goods into the European Union.

Key sections include:
- Installation details
- Summary of the production processes and production routes
- Name of the installation
- Other installation and production process information

### Summary_Processes Sheet
This sheet provides:
- Summary of the installation, processes and production routes
- Summary of the installation details
- Name of the installation

## Purpose and Usage
The CBAM Communication Template is used by:
1. Non-EU suppliers to provide emissions data to EU importers
2. EU importers for CBAM reporting to European authorities
3. Organizations to calculate and report carbon emissions associated with imported goods

The template helps collect production parameters and carbon emissions data from the supply chain for goods covered by the CBAM regulation, including cement, electricity, fertilizers, iron and steel, aluminum, and hydrogen.

## Data Flow
1. Data is entered in the input sheets (A_InstData, C_Emissions&Energy, etc.)
2. Calculations are performed in the calculation sheets
3. Summaries are generated in the Summary sheets
4. The Summary_Communication sheet provides the final data to be communicated to reporting declarants

## Language Considerations
According to the template documentation, the headers and content of the tables in the Summary_Communication sheet will always be in English language to avoid translation problems with reporting declarants.

## Analysis Method
This analysis was performed using PowerShell scripts to examine the Excel file structure, as direct binary file reading is not possible. The scripts identified sheet names, row and column counts, and key section headers to provide this comprehensive overview of the CBAM Communication Template structure.