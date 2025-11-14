# Comprehensive Excel Template Analysis Script
# This script extracts detailed information from the CBAM Excel template
# to ensure the web application has identical functionality

# Import required modules
Import-Module ImportExcel -ErrorAction SilentlyContinue
if (-not (Get-Module -ListAvailable -Name ImportExcel)) {
    Install-Module -Name ImportExcel -Scope CurrentUser -Force
    Import-Module ImportExcel
}

# Configuration
$excelFile = "CBAM Communication template for installations_en_20241213.xlsx"
$outputDir = "ExcelAnalysis"

# Create output directory if it doesn't exist
if (-not (Test-Path -Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

# Function to create a comparison template for each sheet
function Create-ComparisonTemplate {
    param(
        [string]$SheetName,
        [object]$Fields,
        [object]$Formulas,
        [object]$Validations,
        [object]$NamedRanges
    )
    
    $template = ""
    $template += "# $SheetName Sheet Comparison\n\n"
    $template += "## Sheet Information\n"
    $template += "- **Sheet Name**: $SheetName\n"
    $template += "- **Purpose**: [Document the purpose of this sheet]\n"
    $template += "- **Key Functionality**: [Document the key functionality]\n"
    $template += "- **Dependencies**: [Document dependencies on other sheets]\n\n"
    
    $template += "## Field Comparison\n"
    $template += "| Excel Field | Data Type | Validation | Web Field | Data Type | Validation | Status | Notes |\n"
    $template += "|-------------|----------|------------|-----------|----------|------------|--------|-------|\n"
    
    if ($Fields) {
        foreach ($field in $Fields) {
            $template += "| $($field.Name) | $($field.DataType) | $($field.Validation) | [Web Field Name] | [Web Data Type] | [Web Validation] | [Status] | [Notes] |\n"
        }
    }
    
    $template += "\n## Calculation Comparison\n"
    $template += "| Excel Calculation | Formula | Web Calculation | Function | Status | Notes |\n"
    $template += "|-------------------|---------|-----------------|----------|--------|-------|\n"
    
    if ($Formulas) {
        foreach ($formula in $Formulas) {
            $template += "| $($formula.Description) | `$($formula.Formula)` | [Web Calculation Name] | [Function Name] | [Status] | [Notes] |\n"
        }
    }
    
    $template += "\n## Validation Comparison\n"
    $template += "| Excel Validation | Type | Rule | Web Validation | Type | Rule | Status | Notes |\n"
    $template += "|-----------------|------|------|---------------|------|------|--------|-------|\n"
    
    if ($Validations) {
        foreach ($validation in $Validations) {
            $template += "| $($validation.Description) | $($validation.Type) | `$($validation.Rule)` | [Web Validation Name] | [Web Type] | [Web Rule] | [Status] | [Notes] |\n"
        }
    }
    
    $template += "\n## UI Comparison\n"
    $template += "- **Layout**: [Describe Excel layout]\n"
    $template += "- **Instructions**: [List any instructions in Excel]\n"
    $template += "- **Helper Text**: [List any helper text in Excel]\n"
    $template += "- **Web UI**: [Describe web UI]\n"
    $template += "- **Status**: [UI comparison status]\n"
    $template += "- **Notes**: [Notes on UI differences]\n\n"
    
    $template += "## Data Flow Comparison\n"
    $template += "- **Excel Data Flow**: [Describe how data flows in Excel]\n"
    $template += "- **Web Data Flow**: [Describe how data flows in web app]\n"
    $template += "- **Status**: [Data flow comparison status]\n"
    $template += "- **Notes**: [Notes on data flow differences]\n\n"
    
    $template += "## Integration Comparison\n"
    $template += "- **Excel Integration**: [Describe how this sheet integrates with others]\n"
    $template += "- **Web Integration**: [Describe how the web component integrates with others]\n"
    $template += "- **Status**: [Integration comparison status]\n"
    $template += "- **Notes**: [Notes on integration differences]\n\n"
    
    $template += "## Testing Comparison\n"
    $template += "- **Excel Testing**: [Describe how this sheet is tested in Excel]\n"
    $template += "- **Web Testing**: [Describe how the web component is tested]\n"
    $template += "- **Status**: [Testing comparison status]\n"
    $template += "- **Notes**: [Notes on testing differences]\n\n"
    
    $template += "## Summary\n"
    $template += "- **Overall Status**: [Overall comparison status]\n"
    $template += "- **Critical Issues**: [List any critical issues]\n"
    $template += "- **Action Items**: [List any action items]\n"
    $template += "- **Next Steps**: [List next steps]\n\n"
    
    $template += "## Sign-off\n"
    $template += "- **Reviewed By**: [Name]\n"
    $template += "- **Review Date**: [Date]\n"
    $template += "- **Approved**: [Yes/No]\n"
    $template += "- **Comments**: [Comments]\n\n"
    
    return $template
}

# Main script
try {
    Write-Host "Starting comprehensive analysis of $excelFile..." -ForegroundColor Green
    
    # Check if Excel file exists
    if (-not (Test-Path -Path $excelFile)) {
        Write-Host "Error: Excel file '$excelFile' not found." -ForegroundColor Red
        exit 1
    }
    
    # Get all worksheets
    $worksheets = Get-ExcelSheetInfo -Path $excelFile
    
    # Create a summary of all worksheets
    $summary = @()
    foreach ($worksheet in $worksheets) {
        $summary += [PSCustomObject]@{
            Name = $worksheet.Name
            Index = $worksheet.Index
            Visible = $worksheet.Visible
        }
    }
    
    # Export worksheet summary
    $summary | Export-Csv -Path "$outputDir\Worksheets_Summary.csv" -NoTypeInformation
    Write-Host "Created worksheet summary: $outputDir\Worksheets_Summary.csv" -ForegroundColor Green
    
    # Analyze each worksheet in detail
    foreach ($worksheet in $worksheets) {
        Write-Host "Analyzing worksheet: $($worksheet.Name)..." -ForegroundColor Yellow
        
        # Get worksheet data
        $data = Import-Excel -Path $excelFile -WorksheetName $worksheet.Name -NoHeader
        
        # Get formulas from the worksheet
        $formulas = Import-Excel -Path $excelFile -WorksheetName $worksheet.Name -NoHeader -DataOnly:$false
        
        # Extract column information
        $columns = @()
        if ($data) {
            $firstRow = $data[0]
            $columnNames = $firstRow.PSObject.Properties.Name
            
            foreach ($columnName in $columnNames) {
                $columnValues = $data | Select-Object -ExpandProperty $columnName
                $columnValues = $columnValues | Where-Object { $_ -ne $null -and $_ -ne "" }
                
                $columns += [PSCustomObject]@{
                    Name = $columnName
                    DataType = if ($columnValues) { 
                        $firstValue = $columnValues[0]
                        if ($firstValue -is [int] -or $firstValue -is [double]) { "Number" }
                        elseif ($firstValue -is [datetime]) { "Date" }
                        elseif ($firstValue -is [bool]) { "Boolean" }
                        else { "Text" }
                    } else { "Unknown" }
                    SampleValues = if ($columnValues) { $columnValues[0..2] -join ", " } else { "" }
                    UniqueCount = if ($columnValues) { ($columnValues | Sort-Object -Unique).Count } else { 0 }
                    HasNulls = if ($data) { ($data | Where-Object { $_.$columnName -eq $null -or $_.$columnName -eq "" }).Count -gt 0 } else { $false }
                }
            }
        }
        
        # Export column information
        if ($columns) {
            $columns | Export-Csv -Path "$outputDir\$($worksheet.Name)_Columns.csv" -NoTypeInformation
            Write-Host "Created column info: $outputDir\$($worksheet.Name)_Columns.csv" -ForegroundColor Green
        }
        
        # Export raw data
        if ($data) {
            $data | Export-Csv -Path "$outputDir\$($worksheet.Name)_Data.csv" -NoTypeInformation
            Write-Host "Created data export: $outputDir\$($worksheet.Name)_Data.csv" -ForegroundColor Green
        }
        
        # Extract formulas
        $formulaList = @()
        if ($formulas) {
            $rowCount = 0
            foreach ($row in $formulas) {
                $rowCount++
                $columnCount = 0
                foreach ($cell in $row.PSObject.Properties) {
                    $columnCount++
                    if ($cell.Value -and $cell.Value.ToString().StartsWith("=")) {
                        $formulaList += [PSCustomObject]@{
                            Cell = "$([char]($columnCount + 64))$rowCount"
                            Formula = $cell.Value
                            Description = "Formula in cell $([char]($columnCount + 64))$rowCount"
                        }
                    }
                }
            }
        }
        
        # Export formulas
        if ($formulaList) {
            $formulaList | Export-Csv -Path "$outputDir\$($worksheet.Name)_Formulas.csv" -NoTypeInformation
            Write-Host "Created formulas export: $outputDir\$($worksheet.Name)_Formulas.csv" -ForegroundColor Green
        }
        
        # Extract named ranges
        $namedRanges = @()
        $excel = New-Object -ComObject Excel.Application
        $workbook = $excel.Workbooks.Open((Resolve-Path $excelFile).Path)
        $worksheetObj = $workbook.Worksheets[$worksheet.Name]
        
        foreach ($namedRange in $workbook.Names) {
            if ($namedRange.RefersToRange.Worksheet.Name -eq $worksheet.Name) {
                $namedRanges += [PSCustomObject]@{
                    Name = $namedRange.Name
                    RefersTo = $namedRange.RefersTo
                    Value = $namedRange.RefersToRange.Value2
                    Description = "Named range in worksheet $($worksheet.Name)"
                }
            }
        }
        
        $workbook.Close($false)
        $excel.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
        
        # Export named ranges
        if ($namedRanges) {
            $namedRanges | Export-Csv -Path "$outputDir\$($worksheet.Name)_Named_Ranges.csv" -NoTypeInformation
            Write-Host "Created named ranges export: $outputDir\$($worksheet.Name)_Named_Ranges.csv" -ForegroundColor Green
        }
        
        # Extract data validations
        $dataValidations = @()
        $excel = New-Object -ComObject Excel.Application
        $workbook = $excel.Workbooks.Open((Resolve-Path $excelFile).Path)
        $worksheetObj = $workbook.Worksheets[$worksheet.Name]
        
        $usedRange = $worksheetObj.UsedRange
        foreach ($cell in $usedRange) {
            if ($cell.Validation.Type -ne 0) {
                $dataValidations += [PSCustomObject]@{
                    Cell = $cell.Address
                    Type = $cell.Validation.Type
                    Operator = $cell.Validation.Operator
                    Formula1 = $cell.Validation.Formula1
                    Formula2 = $cell.Validation.Formula2
                    ErrorMessage = $cell.Validation.ErrorMessage
                    Description = "Data validation in cell $($cell.Address)"
                }
            }
        }
        
        $workbook.Close($false)
        $excel.Quit()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
        
        # Export data validations
        if ($dataValidations) {
            $dataValidations | Export-Csv -Path "$outputDir\$($worksheet.Name)_Data_Validations.csv" -NoTypeInformation
            Write-Host "Created data validations export: $outputDir\$($worksheet.Name)_Data_Validations.csv" -ForegroundColor Green
        }
        
        # Create comparison template
        $template = Create-ComparisonTemplate -SheetName $worksheet.Name -Fields $columns -Formulas $formulaList -Validations $dataValidations -NamedRanges $namedRanges
        $template | Out-File -FilePath "$outputDir\$($worksheet.Name)_Comparison.md" -Encoding UTF8
        Write-Host "Created comparison template: $outputDir\$($worksheet.Name)_Comparison.md" -ForegroundColor Green
    }
    
    # Create a summary report
    $summaryReport = "# CBAM Excel Template Analysis Summary\n\n"
    $summaryReport += "This document provides a summary of the CBAM Excel template analysis.\n\n"
    $summaryReport += "## Worksheets\n\n"
    $summaryReport += "| Sheet Name | Purpose | Key Fields | Key Calculations | Status |\n"
    $summaryReport += "|------------|---------|------------|------------------|--------|\n"
    
    foreach ($worksheet in $worksheets) {
        $summaryReport += "| $($worksheet.Name) | [Purpose] | [Key Fields] | [Key Calculations] | [Status] |\n"
    }
    
    $summaryReport += "\n## Next Steps\n\n"
    $summaryReport += "1. Review the comparison templates for each worksheet\n"
    $summaryReport += "2. Compare Excel functionality with web application\n"
    $summaryReport += "3. Identify gaps and create implementation tasks\n"
    $summaryReport += "4. Implement missing functionality\n"
    $summaryReport += "5. Test to ensure identical functionality\n\n"
    
    $summaryReport | Out-File -FilePath "$outputDir\Analysis_Summary.md" -Encoding UTF8
    Write-Host "Created analysis summary: $outputDir\Analysis_Summary.md" -ForegroundColor Green
    
    Write-Host "Analysis complete! All files created in the '$outputDir' directory." -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Review the comparison templates in the '$outputDir' directory" -ForegroundColor Yellow
    Write-Host "2. Compare Excel functionality with the web application" -ForegroundColor Yellow
    Write-Host "3. Implement any missing functionality" -ForegroundColor Yellow
    Write-Host "4. Test to ensure identical functionality" -ForegroundColor Yellow
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}