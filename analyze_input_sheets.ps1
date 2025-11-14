# Analyze key input sheets in the CBAM Excel template

try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $workbook = $excel.Workbooks.Open("$pwd\CBAM Communication template for installations_en_20241213.xlsx")
    
    # Sheets to analyze
    $sheetsToAnalyze = @("A_InstData", "C_Emissions&Energy", "D_Processes", "E_PurchPrec")
    
    foreach ($sheetName in $sheetsToAnalyze) {
        $sheet = $workbook.Worksheets.Item($sheetName)
        $usedRange = $sheet.UsedRange
        $rows = $usedRange.Rows.Count
        $cols = $usedRange.Columns.Count
        
        Write-Output "=== $sheetName Sheet ==="
        Write-Output "Rows used: $rows"
        Write-Output "Columns used: $cols"
        Write-Output ""
        
        # Analyze first 15 rows to understand structure
        Write-Output "First 15 rows structure:"
        for ($row = 1; $row -le 15; $row++) {
            $hasContent = $false
            $rowContent = "Row ${row}: "
            
            # Check first 15 columns for content
            for ($col = 1; $col -le 15; $col++) {
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
        
        # Look for section headers or key fields
        Write-Output ""
        Write-Output "Key fields/sections:"
        for ($row = 1; $row -le $rows; $row++) {
            for ($col = 1; $col -le $cols; $col++) {
                $cellValue = $sheet.Cells.Item($row, $col).Text
                # Look for key terms that might indicate important fields
                if ($cellValue -and ($cellValue -like "*installation*" -or $cellValue -like "*emission*" -or $cellValue -like "*energy*" -or 
                    $cellValue -like "*fuel*" -or $cellValue -like "*process*" -or $cellValue -like "*product*" -or
                    $cellValue -like "*CO2*" -or $cellValue -like "*carbon*")) {
                    Write-Output "Row ${row}, Col ${col}: $cellValue"
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