# Extract Excel Functionality Script
# This script extracts all functionality from the CBAM Excel template for comparison with the web application

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

# Install ImportExcel module if not already installed
if (-not (Get-Module -ListAvailable -Name ImportExcel)) {
    Write-Host "Installing ImportExcel module..."
    Install-Module -Name ImportExcel -Scope CurrentUser -Force
}

# Import the module
Import-Module ImportExcel

# Get all worksheets
$worksheets = Get-ExcelSheetInfo -Path $ExcelFilePath
Write-Host "Found $($worksheets.Count) worksheets in the Excel file"

# Create a summary of all worksheets
$worksheetSummary = @()
foreach ($worksheet in $worksheets) {
    $worksheetSummary += [PSCustomObject]@{
        Name = $worksheet.Name
        Visible = $worksheet.Visible
        Index = $worksheet.Index
    }
}

# Export worksheet summary to CSV
$worksheetSummary | Export-Csv -Path "$OutputDirectory\WorksheetSummary.csv" -NoTypeInformation
Write-Host "Exported worksheet summary to WorksheetSummary.csv"

# Analyze each worksheet
foreach ($worksheet in $worksheets) {
    $sheetName = $worksheet.Name
    Write-Host "Analyzing worksheet: $sheetName"
    
    # Create a directory for this worksheet
    $sheetDir = "$OutputDirectory\$sheetName"
    if (-not (Test-Path $sheetDir)) {
        New-Item -ItemType Directory -Path $sheetDir | Out-Null
    }
    
    # Get the data from the worksheet
    $data = Import-Excel -Path $ExcelFilePath -WorksheetName $sheetName
    
    # Export raw data to CSV
    if ($data.Count -gt 0) {
        $data | Export-Csv -Path "$sheetDir\RawData.csv" -NoTypeInformation
        Write-Host "  Exported raw data to RawData.csv"
        
        # Analyze column structure
        $columnInfo = @()
        $properties = $data[0].PSObject.Properties
        foreach ($prop in $properties) {
            $columnName = $prop.Name
            $columnValues = $data | Select-Object -ExpandProperty $columnName
            $uniqueValues = $columnValues | Sort-Object -Unique
            $nullCount = ($columnValues | Where-Object { $_ -eq $null -or $_ -eq "" }).Count
            
            $columnInfo += [PSCustomObject]@{
                ColumnName = $columnName
                DataType = if ($columnValues[0] -is [datetime]) { "DateTime" } 
                          elseif ($columnValues[0] -is [int]) { "Integer" }
                          elseif ($columnValues[0] -is [double]) { "Number" }
                          elseif ($columnValues[0] -is [bool]) { "Boolean" }
                          else { "String" }
                SampleValue = if ($columnValues[0]) { $columnValues[0] } else { "" }
                UniqueCount = $uniqueValues.Count
                HasNulls = if ($nullCount -gt 0) { "Yes" } else { "No" }
                NullCount = $nullCount
            }
        }
        
        # Export column information to CSV
        $columnInfo | Export-Csv -Path "$sheetDir\ColumnInfo.csv" -NoTypeInformation
        Write-Host "  Exported column information to ColumnInfo.csv"
    }
    
    # Extract formulas from the worksheet
    $formulas = Get-ExcelFormula -Path $ExcelFilePath -WorksheetName $sheetName
    if ($formulas.Count -gt 0) {
        $formulas | Export-Csv -Path "$sheetDir\Formulas.csv" -NoTypeInformation
        Write-Host "  Exported formulas to Formulas.csv"
    }
    
    # Extract named ranges
    $namedRanges = Get-ExcelNamedRange -Path $ExcelFilePath -WorksheetName $sheetName
    if ($namedRanges.Count -gt 0) {
        $namedRanges | Export-Csv -Path "$sheetDir\NamedRanges.csv" -NoTypeInformation
        Write-Host "  Exported named ranges to NamedRanges.csv"
    }
    
    # Extract data validations
    $dataValidations = Get-ExcelDataValidation -Path $ExcelFilePath -WorksheetName $sheetName
    if ($dataValidations.Count -gt 0) {
        $dataValidations | Export-Csv -Path "$sheetDir\DataValidations.csv" -NoTypeInformation
        Write-Host "  Exported data validations to DataValidations.csv"
    }
    
    # Generate a comparison template for this sheet
    $comparisonTemplate = @"
# $sheetName Comparison Template

## Sheet Information

- **Sheet Name**: $sheetName
- **Visible**: $($worksheet.Visible)
- **Index**: $($worksheet.Index)
- **Rows**: if ($data.Count -gt 0) { $data.Count } else { 0 }
- **Columns**: if ($data.Count -gt 0) { $data[0].PSObject.Properties.Count } else { 0 }

## Field Comparison

| Field Name | Excel Data Type | Web Field Name | Web Data Type | Status | Notes |
|------------|-----------------|----------------|---------------|--------|-------|
"@
    
    if ($data.Count -gt 0) {
        $properties = $data[0].PSObject.Properties
        foreach ($prop in $properties) {
            $columnName = $prop.Name
            $columnValues = $data | Select-Object -ExpandProperty $columnName
            $dataType = if ($columnValues[0] -is [datetime]) { "DateTime" } 
                      elseif ($columnValues[0] -is [int]) { "Integer" }
                      elseif ($columnValues[0] -is [double]) { "Number" }
                      elseif ($columnValues[0] -is [bool]) { "Boolean" }
                      else { "String" }
            
            $comparisonTemplate += "`n| $columnName | $dataType | | | | |"
        }
    }
    
    $comparisonTemplate += @"

## Calculation Comparison

| Calculation Name | Excel Formula | Web Implementation | Status | Notes |
|------------------|---------------|-------------------|--------|-------|
"@
    
    if ($formulas.Count -gt 0) {
        foreach ($formula in $formulas) {
            $formulaAddress = $formula.Address
            $formulaValue = $formula.Formula
            $comparisonTemplate += "`n| $formulaAddress | $formulaValue | | | |"
        }
    }
    
    $comparisonTemplate += @"

## Validation Comparison

| Field Name | Excel Validation | Web Validation | Status | Notes |
|------------|-----------------|----------------|--------|-------|
"@
    
    if ($dataValidations.Count -gt 0) {
        foreach ($validation in $dataValidations) {
            $validationAddress = $validation.Address
            $validationType = $validation.Type
            $validationFormula = $validation.Formula1
            $comparisonTemplate += "`n| $validationAddress | $validationType: $validationFormula | | | |"
        }
    }
    
    $comparisonTemplate += @"

## UI Comparison

| UI Element | Excel Implementation | Web Implementation | Status | Notes |
|------------|---------------------|-------------------|--------|-------|
| Layout | | | | |
| Navigation | | | | |
| Help Text | | | | |
| Error Messages | | | | |

## Data Flow Comparison

| Data Flow | Excel Implementation | Web Implementation | Status | Notes |
|------------|---------------------|-------------------|--------|-------|
| Input | | | | |
| Processing | | | | |
| Output | | | | |

## Integration Comparison

| Integration | Excel Implementation | Web Implementation | Status | Notes |
|-------------|---------------------|-------------------|--------|-------|
| | | | | |

## Testing Comparison

| Test Case | Excel Result | Web Result | Status | Notes |
|-----------|--------------|------------|--------|-------|
| | | | | |

## Summary

- **Overall Status**: 
- **Critical Issues**: 
- **Action Items**: 
- **Next Steps**: 

## Sign-off

- **Analyst**: 
- **Date": 
- **Developer": 
- **Date": 
- **QA": 
- **Date": 
"@
    
    # Save the comparison template
    $comparisonTemplate | Out-File -FilePath "$sheetDir\ComparisonTemplate.md" -Encoding UTF8
    Write-Host "  Generated comparison template"
}

# Create an overall analysis summary
$analysisSummary = @"
# CBAM Excel Template Analysis Summary

## Overview

This document provides a summary of the analysis of the CBAM Excel template for comparison with the web application.

## Worksheet Summary

The Excel template contains $($worksheets.Count) worksheets:

"@

foreach ($worksheet in $worksheets) {
    $analysisSummary += "- $($worksheet.Name) (Index: $($worksheet.Index), Visible: $($worksheet.Visible))`n"
}

$analysisSummary += @"

## Analysis Process

1. Extracted all worksheets from the Excel template
2. Analyzed the structure and content of each worksheet
3. Extracted formulas, named ranges, and data validations
4. Generated comparison templates for each worksheet

## Next Steps

1. Review the generated comparison templates
2. Compare each Excel sheet with the corresponding web component
3. Document all gaps and differences
4. Create an implementation plan to address the gaps
5. Implement the missing functionality
6. Re-test to ensure identical behavior

## Files Generated

- WorksheetSummary.csv: Summary of all worksheets
- [SheetName]/RawData.csv: Raw data from each sheet
- [SheetName]/ColumnInfo.csv: Column information for each sheet
- [SheetName]/Formulas.csv: Formulas from each sheet
- [SheetName]/NamedRanges.csv: Named ranges from each sheet
- [SheetName]/DataValidations.csv: Data validations from each sheet
- [SheetName]/ComparisonTemplate.md: Template for comparing each sheet with the web application
"@

# Save the analysis summary
$analysisSummary | Out-File -FilePath "$OutputDirectory\AnalysisSummary.md" -Encoding UTF8
Write-Host "Generated analysis summary"

Write-Host "Excel analysis complete. All files saved to: $OutputDirectory"
Write-Host "Next step: Review the generated comparison templates and compare with the web application."