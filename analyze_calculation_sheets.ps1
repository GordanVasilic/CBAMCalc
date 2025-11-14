# Analyze calculation sheets in the CBAM Excel template

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $workbook = $excel.Workbooks.Open("$pwd\CBAM Communication template for installations_en_20241213.xlsx")
    
    # Sheets to analyze
    $sheetsToAnalyze = @("F_Tools", "InputOutput", "Parameters_Constants")
    
    foreach ($sheetName in $sheetsToAnalyze) {
        $sheet = $workbook.Worksheets.Item($sheetName)
        $usedRange = $sheet.UsedRange
        $rows = $usedRange.Rows.Count
        $cols = $usedRange.Columns.Count
        
        Write-Output "=== $sheetName Sheet ==="
        Write-Output "Rows used: $rows"
        Write-Output "Columns used: $cols"
        Write-Output ""
        
        # Analyze first 20 rows to understand structure
        Write-Output "First 20 rows structure:"
        for ($row = 1; $row -le 20; $row++) {
            $hasContent = $false
            $rowContent = "Row ${row}: "
            
            # Check first 10 columns for content
            for ($col = 1; $col -le 10; $col++) {
                $cellValue = $sheet.Cells.Item($row, $col).Text
                if ($cellValue -and $cellValue.Trim() -ne "") {
                    $rowContent += "[Col ${col}: $cellValue] "
                    $hasContent = $true
                }
            }
            
            if ($hasContent) {
                Write-Output $rowContent
            }
        }
        
        # Look for calculation formulas or constants
        Write-Output ""
        Write-Output "Key calculations/constants:"
        for ($row = 1; $row -le $rows; $row++) {
            for ($col = 1; $col -le $cols; $col++) {
                $cellValue = $sheet.Cells.Item($row, $col).Text
                $cellFormula = $sheet.Cells.Item($row, $col).Formula
                
                # Look for key terms that might indicate important fields
                if ($cellValue -and ($cellValue -like "*CO2*" -or $cellValue -like "*emission factor*" -or $cellValue -like "*calculation*" -or 
                    $cellValue -like "*formula*" -or $cellValue -like "*conversion*" -or $cellValue -like "*factor*")) {
                    Write-Output "Row ${row}, Col ${col}: $cellValue"
                    if ($cellFormula -and $cellFormula.StartsWith("=")) {
                        Write-Output "  Formula: $cellFormula"
                    }
                }
            }
        }
        
        Write-Output ""
        Write-Output "-------------------------------------------"
        Write-Output ""
    }
    
    $workbook.Close($false)
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
} catch {
    Write-Output "Error: $_"
}