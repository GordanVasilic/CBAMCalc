# Excel Template Analyzer Script
# This script systematically extracts information from the CBAM Excel template
# and generates comparison templates for each sheet

# Parameters
param(
    [Parameter(Mandatory=$false)]
    [string]$ExcelFile = "CBAM communication template for installations.xlsx",
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDirectory = "ExcelAnalysisOutput"
)

# Check if Excel file exists
if (-not (Test-Path $ExcelFile)) {
    Write-Error "Excel file not found: $ExcelFile"
    exit 1
}

# Create output directory if it doesn't exist
if (-not (Test-Path $OutputDirectory)) {
    New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
}

# Install ImportExcel module if not already installed
if (-not (Get-Module -ListAvailable -Name ImportExcel)) {
    try {
        Install-Module -Name ImportExcel -Scope CurrentUser -Force
        Write-Host "ImportExcel module installed successfully"
    }
    catch {
        Write-Error "Failed to install ImportExcel module: $_"
        exit 1
    }
}

# Import the module
Import-Module ImportExcel

# Get all worksheets in the Excel file
Write-Host "Analyzing Excel file: $ExcelFile"
$worksheets = Get-ExcelSheetInfo -Path $ExcelFile
Write-Host "Found $($worksheets.Count) worksheets"

# Create a summary of all worksheets
$worksheetSummary = @()
foreach ($worksheet in $worksheets) {
    $worksheetSummary += [PSCustomObject]@{
        Name = $worksheet.Name
        Index = $worksheet.Index
        Visible = $worksheet.Visible
    }
}

# Export worksheet summary to CSV
$worksheetSummary | Export-Csv -Path "$OutputDirectory\WorksheetSummary.csv" -NoTypeInformation
Write-Host "Worksheet summary exported to $($OutputDirectory)\WorksheetSummary.csv"

# Analyze each worksheet
foreach ($worksheet in $worksheets) {
    $sheetName = $worksheet.Name
    Write-Host "Analyzing worksheet: $sheetName"
    
    # Create a directory for this sheet's analysis
    $sheetDirectory = "$OutputDirectory\$sheetName"
    if (-not (Test-Path $sheetDirectory)) {
        New-Item -ItemType Directory -Path $sheetDirectory | Out-Null
    }
    
    try {
        # Get the data from the worksheet
        $data = Import-Excel -Path $ExcelFile -WorksheetName $sheetName
        
        # Get column information
        if ($data.Count -gt 0) {
            $columnInfo = @()
            $firstRow = $data[0]
            
            foreach ($property in $firstRow.PSObject.Properties) {
                $columnValues = $data | Select-Object -ExpandProperty $property.Name
                $uniqueValues = $columnValues | Sort-Object -Unique
                $sampleValues = $uniqueValues | Select-Object -First 5
                $hasNulls = $columnValues -eq $null -or $columnValues -eq ""
                
                $columnInfo += [PSCustomObject]@{
                    ColumnName = $property.Name
                    DataType = $property.TypeNameOfValue
                    SampleValues = $sampleValues -join ", "
                    UniqueCount = $uniqueValues.Count
                    HasNulls = if ($hasNulls) { "Yes" } else { "No" }
                }
            }
            
            # Export column information to CSV
            $columnInfo | Export-Csv -Path "$sheetDirectory\ColumnInfo.csv" -NoTypeInformation
            
            # Export raw data to CSV
            $data | Export-Csv -Path "$sheetDirectory\RawData.csv" -NoTypeInformation
            
            # Get formulas from the worksheet
            $formulas = Get-ExcelFormula -Path $ExcelFile -WorksheetName $sheetName
            if ($formulas) {
                $formulas | Export-Csv -Path "$sheetDirectory\Formulas.csv" -NoTypeInformation
            }
            
            # Get named ranges from the worksheet
            $namedRanges = Get-ExcelNamedRange -Path $ExcelFile -WorksheetName $sheetName
            if ($namedRanges) {
                $namedRanges | Export-Csv -Path "$sheetDirectory\NamedRanges.csv" -NoTypeInformation
            }
            
            # Get data validation from the worksheet
            $dataValidations = Get-ExcelDataValidation -Path $ExcelFile -WorksheetName $sheetName
            if ($dataValidations) {
                $dataValidations | Export-Csv -Path "$sheetDirectory\DataValidations.csv" -NoTypeInformation
            }
        }
        
        # Generate comparison template
        $comparisonTemplate = @"
# Comparison Template: $sheetName

## Excel Sheet Information

- **Sheet Name**: $sheetName
- **Sheet Index**: $($worksheet.Index)
- **Visible**: $($worksheet.Visible)
- **Rows**: $($data.Count)
- **Columns**: $(if ($data.Count -gt 0) { $data[0].PSObject.Properties.Count } else { 0 })

## Web Application Information

- **Component Name**: 
- **Component Path**: 
- **Route**: 
- **Data Model**: 
- **API Endpoint**: 

## Field Comparison

| Excel Field | Web Field | Data Type | Validation | Status |
|-------------|-----------|-----------|------------|--------|

$(if ($columnInfo) { foreach ($column in $columnInfo) { "| $($column.ColumnName) | | $($column.DataType) | | |" } })

## Calculation Comparison

| Excel Calculation | Web Calculation | Formula | Status |
|-------------------|-----------------|---------|--------|

$(if ($formulas) { foreach ($formula in $formulas) { "| $($formula.Address) | | $($formula.Formula) | |" } })

## Validation Comparison

| Excel Validation | Web Validation | Criteria | Status |
|------------------|----------------|----------|--------|

$(if ($dataValidations) { foreach ($validation in $dataValidations) { "| $($validation.Address) | | $($validation.ValidationType) | |" } })

## UI Comparison

| Excel Element | Web Element | Type | Status |
|---------------|-------------|------|--------|

## Data Flow Comparison

| Excel Data Flow | Web Data Flow | Direction | Status |
|-----------------|---------------|-----------|--------|

## Integration Comparison

| Excel Integration | Web Integration | Type | Status |
|-------------------|----------------|------|--------|

## Testing Comparison

| Test Case | Excel Result | Web Result | Status |
|-----------|--------------|------------|--------|

## Summary

### Matching Elements

- 
- 

### Missing Elements

- 
- 

### Additional Elements

- 
- 

## Critical Issues

1. 
2. 

## Action Items

1. 
2. 

## Next Steps

1. 
2. 

## Sign-off

**Excel Analyst**: _________________________

**Web Developer**: _________________________

**Date**: _________________________

"@
        
        # Write comparison template to file
        $comparisonTemplate | Out-File -FilePath "$sheetDirectory\ComparisonTemplate.md" -Encoding UTF8
        Write-Host "Comparison template created for $sheetName"
    }
    catch {
        Write-Error "Error analyzing worksheet $sheetName`: $_"
    }
}

# Create overall analysis summary
$analysisSummary = @"
# Excel Template Analysis Summary

## Overview

This document summarizes the analysis of the CBAM Excel template.

## Analysis Details

- **Excel File**: $ExcelFile
- **Analysis Date**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
- **Total Worksheets**: $($worksheets.Count)
- **Output Directory**: $OutputDirectory

## Worksheets

$(foreach ($worksheet in $worksheetSummary) { "- $($worksheet.Name) (Index: $($worksheet.Index), Visible: $($worksheet.Visible))" })

## Next Steps

1. Review the analysis output for each worksheet
2. Complete the comparison templates for each worksheet
3. Identify gaps between Excel and web application
4. Implement missing functionality in the web application
5. Test and verify the implementation

## Files Generated

- WorksheetSummary.csv: Summary of all worksheets
- [Sheet Name]\\ColumnInfo.csv: Information about columns in each sheet
- [Sheet Name]\\RawData.csv: Raw data from each sheet
- [Sheet Name]\\Formulas.csv: Formulas from each sheet
- [Sheet Name]\\NamedRanges.csv: Named ranges from each sheet
- [Sheet Name]\\DataValidations.csv: Data validations from each sheet
- [Sheet Name]\\ComparisonTemplate.md: Template for comparing Excel with web application

"@

# Write analysis summary to file
$analysisSummary | Out-File -FilePath "$OutputDirectory\AnalysisSummary.md" -Encoding UTF8
Write-Host "Analysis summary created at $($OutputDirectory)\AnalysisSummary.md"

Write-Host "Excel template analysis completed successfully!"
Write-Host "Output directory: $OutputDirectory"
Write-Host "Review the generated files and complete the comparison templates for each worksheet."

# Open the output directory in File Explorer
Invoke-Item $OutputDirectory