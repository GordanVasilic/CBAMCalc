# CBAM Excel Template Analysis Script
# This script helps extract information from the Excel template for comparison with the web application

param(
    [string]$ExcelPath = "CBAM Communication template for installations_en_20241213.xlsx",
    [string]$OutputPath = "excel_analysis"
)

# Create output directory if it doesn't exist
if (-not (Test-Path -Path $OutputPath)) {
    New-Item -ItemType Directory -Path $OutputPath
}

# Import Excel module
try {
    Import-Module ImportExcel -ErrorAction Stop
}
catch {
    Write-Host "ImportExcel module not found. Installing..."
    Install-Module -Name ImportExcel -Scope CurrentUser -Force
    Import-Module ImportExcel
}

# Get all worksheets
$worksheets = Get-ExcelSheetInfo -Path $ExcelPath

Write-Host "Found $($worksheets.Count) worksheets in the Excel file"

# Create summary of all worksheets
$summary = @()
foreach ($sheet in $worksheets) {
    $summary += [PSCustomObject]@{
        Name = $sheet.Name
        Index = $sheet.Index
        Visible = $sheet.Visible
    }
}

# Export worksheet summary
$summary | Export-Csv -Path "$OutputPath/worksheets_summary.csv" -NoTypeInformation

# Analyze each worksheet
foreach ($sheet in $worksheets) {
    Write-Host "Analyzing worksheet: $($sheet.Name)"
    
    # Create directory for this sheet
    $sheetDir = "$OutputPath/$($sheet.Name)"
    if (-not (Test-Path -Path $sheetDir)) {
        New-Item -ItemType Directory -Path $sheetDir
    }
    
    # Get sheet data
    $data = Import-Excel -Path $ExcelPath -WorksheetName $sheet.Name
    
    # Export raw data
    $data | Export-Csv -Path "$sheetDir/raw_data.csv" -NoTypeInformation
    
    # Get sheet structure
    $structure = @()
    if ($data.Count -gt 0) {
        $firstRow = $data[0]
        $columns = $firstRow.PSObject.Properties | Select-Object Name, TypeNameOfValue
        
        foreach ($column in $columns) {
            # Get sample values for this column
            $sampleValues = $data | Select-Object -First 10 | ForEach-Object { $_.($column.Name) }
            $uniqueValues = $data | Select-Object -ExpandProperty $column.Name -Unique | Measure-Object
            
            $structure += [PSCustomObject]@{
                ColumnName = $column.Name
                DataType = $column.TypeNameOfValue
                SampleValues = $sampleValues -join "; "
                UniqueCount = $uniqueValues.Count
                HasNulls = ($data | Where-Object { [string]::IsNullOrWhiteSpace($_.($column.Name)) } | Measure-Object).Count -gt 0
            }
        }
    }
    
    # Export structure
    $structure | Export-Csv -Path "$sheetDir/structure.csv" -NoTypeInformation
    
    # Try to extract formulas (this is limited with ImportExcel module)
    # For more detailed formula extraction, we would need a different approach
    
    # Create summary
    $sheetSummary = [PSCustomObject]@{
        Name = $sheet.Name
        RowCount = $data.Count
        ColumnCount = $structure.Count
        HasFormulas = $false # Placeholder
    }
    
    $sheetSummary | Export-Csv -Path "$sheetDir/summary.csv" -NoTypeInformation
}

# Create comparison template
$comparisonTemplate = @"
# Excel Sheet Analysis: {SHEET_NAME}

## Overview
- Row Count: {ROW_COUNT}
- Column Count: {COLUMN_COUNT}
- Purpose: {PURPOSE}

## Fields
| Field Name | Data Type | Required | Validation | Default Value | Web App Equivalent | Status |
|------------|-----------|----------|-----------|---------------|-------------------|--------|
{FIELDS_TABLE}

## Calculations
| Calculation | Excel Formula | Web App Implementation | Status |
|-------------|---------------|----------------------|--------|
{CALCULATIONS_TABLE}

## Validation Rules
| Rule | Excel Implementation | Web App Implementation | Status |
|------|---------------------|----------------------|--------|
{VALIDATION_TABLE}

## Notes
{NOTES}

## Action Items
{ACTION_ITEMS}
"@

# Create comparison templates for each sheet
foreach ($sheet in $worksheets) {
    $sheetDir = "$OutputPath/$($sheet.Name)"
    $summary = Import-Csv -Path "$sheetDir/summary.csv"
    $structure = Import-Csv -Path "$sheetDir/structure.csv"
    
    # Create fields table
    $fieldsTable = ""
    foreach ($field in $structure) {
        $fieldsTable += "| $($field.ColumnName) | $($field.DataType) |  |  |  |  |  |`n"
    }
    
    # Create comparison file
    $comparisonContent = $comparisonTemplate -replace "{SHEET_NAME}", $sheet.Name `
                                        -replace "{ROW_COUNT}", $summary.RowCount `
                                        -replace "{COLUMN_COUNT}", $summary.ColumnCount `
                                        -replace "{PURPOSE}", "" `
                                        -replace "{FIELDS_TABLE}", $fieldsTable `
                                        -replace "{CALCULATIONS_TABLE}", "" `
                                        -replace "{VALIDATION_TABLE}", "" `
                                        -replace "{NOTES}", "" `
                                        -replace "{ACTION_ITEMS}", ""
    
    $comparisonContent | Out-File -FilePath "$sheetDir/comparison_template.md"
}

Write-Host "Analysis complete. Results saved to $OutputPath"
Write-Host "Next steps:"
Write-Host "1. Review the analysis files in $OutputPath"
Write-Host "2. Fill in the comparison templates for each sheet"
Write-Host "3. Implement missing functionality in the web application"
Write-Host "4. Verify calculations match Excel results"