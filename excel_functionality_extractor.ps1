# Extract Excel Functionality for CBAM Web Application Comparison

param(
    [Parameter(Mandatory=$true)]
    [string]$ExcelFilePath,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDirectory = "ExcelAnalysis"
)

# Check if Excel file exists
if (-not (Test-Path $ExcelFilePath)) {
    Write-Error "Excel file not found: $ExcelFilePath"
    exit 1
}

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
    Write-Host "Created output directory: $OutputDirectory"
}

# Check if ImportExcel module is installed
if (-not (Get-Module -ListAvailable -Name ImportExcel)) {
    Write-Host "Installing ImportExcel module..."
    Install-Module -Name ImportExcel -Scope CurrentUser -Force
}

# Import the module
Import-Module ImportExcel

# Get all worksheets in the Excel file
$worksheets = Get-ExcelSheetInfo -Path $ExcelFilePath

# Create a summary of all worksheets
$worksheetSummary = $worksheets | Select-Object Name, Index, Dimension | Export-Csv -Path "$OutputDirectory\WorksheetSummary.csv" -NoTypeInformation

Write-Host "Found $($worksheets.Count) worksheets in the Excel file"

# Analyze each worksheet
foreach ($worksheet in $worksheets) {
    $sheetName = $worksheet.Name
    Write-Host "Analyzing worksheet: $sheetName"
    
    # Create a directory for this worksheet
    $sheetDirectory = "$OutputDirectory\$($sheetName -replace '[^\w]','_')"
    if (-not (Test-Path $sheetDirectory)) {
        New-Item -ItemType Directory -Path $sheetDirectory | Out-Null
    }
    
    try {
        # Get the data from the worksheet
        $data = Import-Excel -Path $ExcelFilePath -WorksheetName $sheetName
        
        # Export the raw data
        if ($data) {
            $data | Export-Csv -Path "$sheetDirectory\RawData.csv" -NoTypeInformation
            
            # Get column information
            $columnInfo = @()
            $firstRow = $data[0]
            $dataColumns = $firstRow.PSObject.Properties.Name
            
            foreach ($column in $dataColumns) {
                $columnData = $data | Select-Object -ExpandProperty $column
                $uniqueValues = $columnData | Sort-Object -Unique
                $nullCount = ($columnData | Where-Object { $_ -eq $null -or $_ -eq "" }).Count
                
                $columnInfo += [PSCustomObject]@{
                    ColumnName = $column
                    DataType = ($columnData | Get-Member | Select-Object -First 1).TypeNameOfValue
                    SampleValue = $columnData[0]
                    UniqueCount = $uniqueValues.Count
                    HasNulls = $nullCount -gt 0
                    NullCount = $nullCount
                }
            }
            
            $columnInfo | Export-Csv -Path "$sheetDirectory\ColumnInfo.csv" -NoTypeInformation
            
            # Extract formulas if any
            $formulas = Get-ExcelFormula -Path $ExcelFilePath -WorksheetName $sheetName
            if ($formulas) {
                $formulas | Export-Csv -Path "$sheetDirectory\Formulas.csv" -NoTypeInformation
            }
            
            # Extract named ranges if any
            $namedRanges = Get-ExcelNamedRange -Path $ExcelFilePath -WorksheetName $sheetName
            if ($namedRanges) {
                $namedRanges | Export-Csv -Path "$sheetDirectory\NamedRanges.csv" -NoTypeInformation
            }
            
            # Extract data validations if any
            $dataValidations = Get-ExcelDataValidation -Path $ExcelFilePath -WorksheetName $sheetName
            if ($dataValidations) {
                $dataValidations | Export-Csv -Path "$sheetDirectory\DataValidations.csv" -NoTypeInformation
            }
        }
        
        # Create a comparison template for this sheet
        $comparisonTemplate = @"
# Comparison Template for $sheetName

## Sheet Information

- **Excel Sheet Name**: $sheetName
- **Worksheet Index**: $($worksheet.Index)
- **Dimension**: $($worksheet.Dimension)
- **Purpose**: [Describe the purpose of this sheet]
- **Key Fields**: [List the key fields in this sheet]
- **Calculations**: [List the key calculations in this sheet]
- **Validations**: [List the key validations in this sheet]

## Field Comparison

| Excel Field | Web Field | Data Type | Status | Notes |
|-------------|-----------|-----------|--------|-------|
| [Field Name] | [Field Name] | [Type] | [Match/Partial Match/Missing/Different] | [Notes] |

## Calculation Comparison

| Excel Calculation | Web Calculation | Status | Notes |
|-------------------|-----------------|--------|-------|
| [Calculation Description] | [Calculation Description] | [Match/Partial Match/Missing/Different] | [Notes] |

## Validation Comparison

| Excel Validation | Web Validation | Status | Notes |
|------------------|----------------|--------|-------|
| [Validation Description] | [Validation Description] | [Match/Partial Match/Missing/Different] | [Notes] |

## UI Comparison

| Excel UI Element | Web UI Element | Status | Notes |
|------------------|----------------|--------|-------|
| [UI Element Description] | [UI Element Description] | [Match/Partial Match/Missing/Different] | [Notes] |

## Data Flow Comparison

| Excel Data Flow | Web Data Flow | Status | Notes |
|-----------------|---------------|--------|-------|
| [Data Flow Description] | [Data Flow Description] | [Match/Partial Match/Missing/Different] | [Notes] |

## Integration Comparison

| Excel Integration | Web Integration | Status | Notes |
|-------------------|-----------------|--------|-------|
| [Integration Description] | [Integration Description] | [Match/Partial Match/Missing/Different] | [Notes] |

## Testing Comparison

| Excel Test | Web Test | Status | Notes |
|------------|---------|--------|-------|
| [Test Description] | [Test Description] | [Match/Partial Match/Missing/Different] | [Notes] |

## Summary

### Overall Status

- **Total Items Compared**: [Number]
- **Matches**: [Number]
- **Partial Matches**: [Number]
- **Missing**: [Number]
- **Different**: [Number]

### Critical Issues

1. [Issue Description]
2. [Issue Description]

### Action Items

1. [Action Item]
2. [Action Item]

### Next Steps

1. [Next Step]
2. [Next Step]

### Sign-off

- **Reviewed By**: [Name]
- **Date**: [Date]
- **Comments**: [Comments]

"@
        
        $comparisonTemplate | Out-File -FilePath "$sheetDirectory\ComparisonTemplate.md" -Force
    }
    catch {
        Write-Error "Error processing worksheet $sheetName`: $_"
    }
}

# Create an overall analysis summary
Write-Host "Creating analysis summary..."

$analysisSummary = @"
# CBAM Excel Template Analysis Summary

## Overview

This document summarizes the analysis of the CBAM Excel template and provides guidance for comparing it with the web application.

## Excel Template Structure

The Excel template contains $($worksheets.Count) worksheets:

$($worksheets | ForEach-Object { "- {0} (Index: {1})" -f $_.Name, $_.Index })

## Analysis Process

1. **Data Extraction**: All data from each worksheet has been extracted and saved to CSV files.
2. **Column Analysis**: Column information including data types, sample values, and unique counts has been documented.
3. **Formula Extraction**: All formulas have been extracted and documented.
4. **Named Range Extraction**: All named ranges have been extracted and documented.
5. **Data Validation Extraction**: All data validation rules have been extracted and documented.
6. **Comparison Templates**: A comparison template has been created for each worksheet.

## Directory Structure

```
$OutputDirectory/
├── WorksheetSummary.csv
├── [SheetName1]/
│   ├── RawData.csv
│   ├── ColumnInfo.csv
│   ├── Formulas.csv
│   ├── NamedRanges.csv
│   ├── DataValidations.csv
│   └── ComparisonTemplate.md
├── [SheetName2]/
│   ├── ...
└── ...
```

## Next Steps

1. Review the extracted data for each worksheet.
2. Complete the comparison templates by filling in the web application information.
3. Identify gaps between the Excel template and the web application.
4. Create a detailed implementation plan to address the gaps.
5. Implement the missing functionality.
6. Test the implementation against the Excel template.
7. Document the results.

## Verification Checklist

Use the "CBAM_Functionality_Verification_Checklist.md" file to systematically verify that the web application matches the Excel template.

## Files Generated

- **Worksheet Summary**: `WorksheetSummary.csv`
- **Analysis Directory**: `$OutputDirectory`
- **Comparison Templates**: One for each worksheet in its respective directory

## Tools Used

- PowerShell
- ImportExcel module
- CSV and Markdown files

## Date and Time

Analysis completed on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@

$analysisSummary | Out-File -FilePath "$OutputDirectory\AnalysisSummary.md" -Force

Write-Host "Excel template analysis completed successfully."
Write-Host "Output directory: $OutputDirectory"
Write-Host "Analysis Summary: $OutputDirectory\AnalysisSummary.md"
Write-Host "Worksheet Summary: $OutputDirectory\WorksheetSummary.csv"
Write-Host "For each worksheet, see its directory in $OutputDirectory for detailed analysis."