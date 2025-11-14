# Excel Analysis Script for CBAM Template
# This script systematically extracts information from the Excel template for comparison with the web application

# Parameters
$excelPath = "d:\Projekti\CBAM communication template for installations\CBAM Communication template for installations_en_20241213.xlsx"
$outputDir = "d:\Projekti\CBAM communication template for installations\ExcelAnalysis"

# Create output directory if it doesn't exist
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Created output directory: $outputDir"
}

# Install ImportExcel module if not present
if (-not (Get-Module -ListAvailable -Name ImportExcel)) {
    Write-Host "Installing ImportExcel module..."
    Install-Module -Name ImportExcel -Scope CurrentUser -Force
}

# Import the module
Import-Module ImportExcel

# Function to extract sheet information
function Get-SheetInformation {
    param (
        [string]$FilePath,
        [string]$OutputPath
    )
    
    Write-Host "Analyzing Excel file: $FilePath"
    
    # Get all worksheets
    $worksheets = Get-ExcelSheetInfo -Path $FilePath
    
    # Create summary of worksheets
    $summary = $worksheets | Select-Object @{Name="SheetName"; Expression={$_.Name}}, @{Name="Index"; Expression={$_.Index}}, @{Name="Visible"; Expression={$_.Visible}}
    $summary | Export-Csv -Path "$OutputPath\Worksheets_Summary.csv" -NoTypeInformation
    Write-Host "Created worksheet summary: $OutputPath\Worksheets_Summary.csv"
    
    # Analyze each worksheet
    foreach ($sheet in $worksheets) {
        $sheetName = $sheet.Name
        Write-Host "Analyzing sheet: $sheetName"
        
        # Create directory for this sheet
        $sheetDir = "$OutputDir\$sheetName"
        if (-not (Test-Path -Path $sheetDir)) {
            New-Item -ItemType Directory -Path $sheetDir | Out-Null
        }
        
        # Get sheet data
        try {
            $data = Import-Excel -Path $FilePath -WorksheetName $sheetName -NoHeader
            
            if ($data) {
                # Export raw data
                $data | Export-Csv -Path "$sheetDir\raw_data.csv" -NoTypeInformation
                
                # Analyze column structure
                $columnInfo = @()
                $firstRow = $data | Select-Object -First 1
                
                if ($firstRow) {
                    $properties = $firstRow.PSObject.Properties | Select-Object Name
                    
                    foreach ($prop in $properties) {
                        $columnName = $prop.Name
                        $columnData = $data | Select-Object -ExpandProperty $columnName
                        
                        # Determine data type
                        $dataType = "Unknown"
                        $sampleValue = ""
                        $uniqueCount = 0
                        $nullCount = 0
                        
                        if ($columnData) {
                            $sampleValue = ($columnData | Select-Object -First 1).ToString()
                            $uniqueCount = ($columnData | Sort-Object -Unique).Count
                            $nullCount = ($columnData | Where-Object { $_ -eq $null -or $_ -eq "" }).Count
                            
                            # Try to determine data type
                            $numericCount = 0
                            $dateCount = 0
                            $booleanCount = 0
                            
                            foreach ($value in $columnData) {
                                if ($value -ne $null -and $value -ne "") {
                                    if ($value -is [double] -or $value -is [int] -or $value -is [decimal]) {
                                        $numericCount++
                                    } elseif ($value -is [bool]) {
                                        $booleanCount++
                                    } elseif ($value -is [DateTime]) {
                                        $dateCount++
                                    } else {
                                        # Try to parse as number
                                        $numValue = 0
                                        if ([double]::TryParse($value.ToString(), [ref]$numValue)) {
                                            $numericCount++
                                        } else {
                                            # Try to parse as date
                                            $dateValue = [DateTime]::MinValue
                                            if ([DateTime]::TryParse($value.ToString(), [ref]$dateValue)) {
                                                $dateCount++
                                            }
                                        }
                                    }
                                }
                            }
                            
                            $totalCount = ($columnData | Where-Object { $_ -ne $null -and $_ -ne "" }).Count
                            
                            if ($totalCount -gt 0) {
                                $numericRatio = $numericCount / $totalCount
                                $dateRatio = $dateCount / $totalCount
                                $booleanRatio = $booleanCount / $totalCount
                                
                                if ($numericRatio -gt 0.8) {
                                    $dataType = "Number"
                                } elseif ($dateRatio -gt 0.8) {
                                    $dataType = "Date"
                                } elseif ($booleanRatio -gt 0.8) {
                                    $dataType = "Boolean"
                                } else {
                                    $dataType = "Text"
                                }
                            }
                        }
                        
                        $columnInfo += [PSCustomObject]@{
                            ColumnName = $columnName
                            DataType = $dataType
                            SampleValue = $sampleValue
                            UniqueCount = $uniqueCount
                            NullCount = $nullCount
                        }
                    }
                    
                    # Export column information
                    $columnInfo | Export-Csv -Path "$sheetDir\column_info.csv" -NoTypeInformation
                    
                    # Create summary markdown file
                    $markdownContent = """
# $sheetName Sheet Analysis

## Overview
This document provides an analysis of the $sheetName sheet from the CBAM Excel template.

## Column Information

| Column Name | Data Type | Sample Value | Unique Count | Null Count |
|-------------|-----------|--------------|--------------|------------|
"""
                    
                    foreach ($col in $columnInfo) {
                        $markdownContent += "`n| $($col.ColumnName) | $($col.DataType) | $($col.SampleValue) | $($col.UniqueCount) | $($col.NullCount) |"
                    }
                    
                    $markdownContent += """

## Raw Data
The raw data for this sheet is available in [raw_data.csv](raw_data.csv).

## Column Details
The detailed column information is available in [column_info.csv](column_info.csv).

## Notes

## Questions

## Next Steps

"""
                    
                    $markdownContent | Out-File -FilePath "$sheetDir\analysis.md" -Encoding UTF8
                    Write-Host "Created analysis for sheet: $sheetName"
                }
            }
        } catch {
            Write-Host "Error analyzing sheet $sheetName`: $($_.Exception.Message)"
        }
    }
}

# Function to extract formulas and named ranges
function Get-ExcelFormulas {
    param (
        [string]$FilePath,
        [string]$OutputPath
    )
    
    Write-Host "Extracting formulas and named ranges from: $FilePath"
    
    try {
        # Open Excel application
        $excel = New-Object -ComObject Excel.Application
        $excel.Visible = $false
        $excel.DisplayAlerts = $false
        
        # Open workbook
        $workbook = $excel.Workbooks.Open($FilePath)
        
        # Extract named ranges
        $namedRanges = @()
        foreach ($name in $workbook.Names) {
            $namedRanges += [PSCustomObject]@{
                Name = $name.Name
                RefersTo = $name.RefersTo
                Value = $name.Value
                Visible = $name.Visible
            }
        }
        
        if ($namedRanges.Count -gt 0) {
            $namedRanges | Export-Csv -Path "$OutputPath\Named_Ranges.csv" -NoTypeInformation
            Write-Host "Extracted $($namedRanges.Count) named ranges"
        }
        
        # Extract formulas from each sheet
        $formulas = @()
        foreach ($worksheet in $workbook.Worksheets) {
            $sheetName = $worksheet.Name
            
            # Create directory for this sheet if it doesn't exist
            $sheetDir = "$OutputDir\$sheetName"
            if (-not (Test-Path -Path $sheetDir)) {
                New-Item -ItemType Directory -Path $sheetDir | Out-Null
            }
            
            # Get used range
            $usedRange = $worksheet.UsedRange
            
            # Check each cell for formulas
            for ($row = 1; $row -le $usedRange.Rows.Count; $row++) {
                for ($col = 1; $col -le $usedRange.Columns.Count; $col++) {
                    $cell = $worksheet.Cells.Item($row, $col)
                    
                    if ($cell.Formula -and $cell.Formula.StartsWith("=")) {
                        $formulas += [PSCustomObject]@{
                            SheetName = $sheetName
                            CellAddress = $cell.Address($false, $false)
                            Formula = $cell.Formula
                            Value = $cell.Value
                        }
                    }
                }
            }
            
            # Extract data validation from this sheet
            $dataValidations = @()
            for ($row = 1; $row -le $usedRange.Rows.Count; $row++) {
                for ($col = 1; $col -le $usedRange.Columns.Count; $col++) {
                    $cell = $worksheet.Cells.Item($row, $col)
                    
                    if ($cell.Validation) {
                        $validation = $cell.Validation
                        $dataValidations += [PSCustomObject]@{
                            SheetName = $sheetName
                            CellAddress = $cell.Address($false, $false)
                            Type = $validation.Type
                            AlertStyle = $validation.AlertStyle
                            Operator = $validation.Operator
                            Formula1 = $validation.Formula1
                            Formula2 = $validation.Formula2
                            ErrorMessage = $validation.ErrorMessage
                        }
                    }
                }
            }
            
            if ($dataValidations.Count -gt 0) {
                $dataValidations | Export-Csv -Path "$sheetDir\data_validations.csv" -NoTypeInformation
                Write-Host "Extracted $($dataValidations.Count) data validations from sheet: $sheetName"
            }
        }
        
        if ($formulas.Count -gt 0) {
            $formulas | Export-Csv -Path "$OutputPath\Formulas.csv" -NoTypeInformation
            Write-Host "Extracted $($formulas.Count) formulas"
        }
        
        # Close workbook and Excel
        $workbook.Close($false)
        $excel.Quit()
        
        # Release COM objects
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()
        
    } catch {
        Write-Host "Error extracting formulas: $($_.Exception.Message)"
    }
}

# Function to create comparison templates
function New-ComparisonTemplates {
    param (
        [string]$OutputPath
    )
    
    Write-Host "Creating comparison templates"
    
    # Get worksheet summary
    $summary = Import-Csv -Path "$OutputPath\Worksheets_Summary.csv"
    
    foreach ($sheet in $summary) {
        $sheetName = $sheet.SheetName
        $sheetDir = "$OutputPath\$sheetName"
        
        if (Test-Path -Path $sheetDir) {
            # Create comparison template
            $templateContent = @"
# CBAM Sheet Comparison: $sheetName

## Overview
This document compares the $sheetName Excel sheet with its corresponding implementation in the web application.

## Sheet Information

### Sheet Name
- **Excel Sheet Name**: $sheetName
- **Web Component**: [To be determined]
- **Data Model**: [To be determined]
- **Status**: Not Started

### Sheet Purpose
- **Excel Purpose**: [To be determined]
- **Web Purpose**: [To be determined]
- **Match Status**: Unknown

## Field Comparison

### Excel Fields

| Field Name | Data Type | Required | Validation | Default Value | Notes |
|------------|-----------|----------|------------|---------------|-------|

### Web Fields

| Field Name | Data Type | Required | Validation | Default Value | Excel Match |
|------------|-----------|----------|------------|---------------|------------|

### Field Gap Analysis

| Excel Field | Web Field | Status | Action Required |
|-------------|-----------|--------|-----------------|

## Calculation Comparison

### Excel Calculations

| Calculation Name | Formula | Input Fields | Output Field | Notes |
|------------------|---------|--------------|--------------|-------|

### Web Calculations

| Calculation Name | Function | Input Fields | Output Field | Excel Match |
|------------------|---------|--------------|--------------|------------|

### Calculation Gap Analysis

| Excel Calculation | Web Calculation | Status | Action Required |
|-------------------|-----------------|--------|-----------------|

## Validation Comparison

### Excel Validations

| Field | Validation Type | Validation Rule | Error Message | Notes |
|-------|-----------------|-----------------|---------------|-------|

### Web Validations

| Field | Validation Type | Validation Rule | Error Message | Excel Match |
|-------|-----------------|-----------------|---------------|------------|

### Validation Gap Analysis

| Excel Validation | Web Validation | Status | Action Required |
|------------------|-----------------|--------|-----------------|

## UI Comparison

### Excel Layout

- [ ] Single page layout with all fields visible
- [ ] Fields grouped into sections
- [ ] Navigation through sheet tabs
- [ ] Data validation dropdowns
- [ ] Conditional formatting for errors

### Web Layout

- [ ] Multi-step form with sections
- [ ] Fields grouped into sections
- [ ] Navigation through step buttons
- [ ] Dropdown lists for selection fields
- [ ] Real-time validation feedback

### UI Gap Analysis

| Excel Element | Web Element | Status | Action Required |
|---------------|-------------|--------|-----------------|

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

## Integration Comparison

### Excel Integration

- [ ] Referenced by other sheets
- [ ] Exported to CSV
- [ ] Printed to PDF

### Web Integration

- [ ] Used by other components
- [ ] Exported to CSV
- [ ] Exported to PDF

### Integration Gap Analysis

| Excel Integration | Web Integration | Status | Action Required |
|------------------|-----------------|--------|-----------------|

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

## Summary

### Overall Status

- [ ] Fields: 0% complete
- [ ] Calculations: 0% complete
- [ ] Validations: 0% complete
- [ ] UI: 0% complete
- [ ] Data Flow: 0% complete
- [ ] Integration: 0% complete
- [ ] Testing: 0% complete

### Critical Issues

1. 
2. 
3. 

### Action Items

1. 
2. 
3. 

### Next Steps

1. 
2. 
3. 

## Sign-off

### Analyst
- [ ] Reviewed all comparisons
- [ ] Verified all gaps
- [ ] Approved action items

### Developer
- [ ] Reviewed all technical aspects
- [ ] Verified all implementations
- [ ] Approved development plan

### QA
- [ ] Reviewed all test scenarios
- [ ] Verified all test results
- [ ] Approved testing plan

### Project Manager
- [ ] Reviewed all documentation
- [ ] Verified all timelines
- [ ] Approved project plan

"@
            
            $templateContent | Out-File -FilePath "$sheetDir\comparison_template.md" -Encoding UTF8
            Write-Host "Created comparison template for sheet: $sheetName"
        }
    }
}

# Main execution
Write-Host "Starting Excel analysis..."

# Step 1: Extract sheet information
Get-SheetInformation -FilePath $excelPath -OutputPath $outputDir

# Step 2: Extract formulas and named ranges
Get-ExcelFormulas -FilePath $excelPath -OutputPath $outputDir

# Step 3: Create comparison templates
New-ComparisonTemplates -OutputPath $outputDir

Write-Host "Excel analysis complete. Results are available in: $outputDir"
Write-Host "Next steps:"
Write-Host "1. Review the analysis results in the ExcelAnalysis directory"
Write-Host "2. Use the comparison templates to document the differences between Excel and the web application"
Write-Host "3. Follow the CBAM_Step_by_Step_Implementation_Guide.md to implement any missing functionality"