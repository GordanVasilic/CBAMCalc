try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $workbook = $excel.Workbooks.Open('d:\Projekti\CBAM communication template for installations\CBAM Communication template for installations_en_20241213.xlsx')
    
    # List of key sheets to analyze
    $keySheets = @("Summary_Communication", "Summary_Processes", "Summary_Products", "A_InstData", "C_Emissions&Energy", "c_CodeLists")
    
    foreach ($sheetName in $keySheets) {
        try {
            $sheet = $workbook.Sheets.Item($sheetName)
            Write-Output "\n=== Analysis of '$sheetName' sheet ==="
            Write-Output "Used range: $($sheet.UsedRange.Address)"
            Write-Output "Number of rows used: $($sheet.UsedRange.Rows.Count)"
            Write-Output "Number of columns used: $($sheet.UsedRange.Columns.Count)"
            
            # Get header information from the first few rows
            Write-Output "\nHeader information (first 3 rows, first 5 columns):"
            for ($row = 1; $row -le 3; $row++) {
                $rowContent = ""
                for ($col = 1; $col -le 5; $col++) {
                    $cellValue = $sheet.Cells.Item($row, $col).Text
                    if ($cellValue -ne "") {
                        $rowContent += "[$cellValue] "
                    }
                }
                if ($rowContent -ne "") {
                    Write-Output "Row ${row}: $rowContent"
                }
            }
            
            # Check for key section indicators
            Write-Output "\nKey sections found:"
            $usedRange = $sheet.UsedRange
            for ($row = 1; $row -le Math.Min(20, $usedRange.Rows.Count); $row++) {
                $cellValue = $sheet.Cells.Item($row, 1).Text
                if ($cellValue -like "*Section*" -or $cellValue -like "*Supplier*" -or $cellValue -like "*Importer*" -or $cellValue -like "*Installation*" -or $cellValue -like "*Product*" -or $cellValue -like "*Process*") {
                    Write-Output "Row ${row}: $cellValue"
                }
            }
        }
        catch {
            Write-Output "Could not analyze sheet '$sheetName': $($_.Exception.Message)"
        }
    }
    
    $workbook.Close($false)
    $excel.Quit()
    
    Write-Output "\n\n=== Overview of all sheets ==="
    Write-Output "The CBAM Communication template contains the following sheets:"
    Write-Output "0_Versions: Version history and documentation"
    Write-Output "a_Contents: Table of contents for the template"
    Write-Output "b_Guidelines&Conditions: Usage guidelines and conditions"
    Write-Output "c_CodeLists: Reference codes and classifications"
    Write-Output "A_InstData: Installation data input"
    Write-Output "B_EmInst: Empty installation template"
    Write-Output "C_Emissions&Energy: Emissions and energy data input"
    Write-Output "D_Processes: Process data input"
    Write-Output "E_PurchPrec: Purchased precursors data input"
    Write-Output "F_Tools: Tools and calculations"
    Write-Output "G_FurtherGuidance: Additional guidance information"
    Write-Output "Summary_Processes: Summary of process data"
    Write-Output "Summary_Products: Summary of product data"
    Write-Output "Summary_Communication: Main communication sheet for reporting"
    Write-Output "InputOutput: Input/output calculations"
    Write-Output "Parameters_Constants: Constants and parameters"
    Write-Output "Parameters_CNCodes: CN codes reference"
    Write-Output "Translations: Translation data"
    Write-Output "VersionDocumentation: Version documentation"
}
catch {
    Write-Output "Error: $($_.Exception.Message)"
}