try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $workbook = $excel.Workbooks.Open('d:\Projekti\CBAM communication template for installations\CBAM Communication template for installations_en_20241213.xlsx')
    
    # Get information about Summary_Communication sheet
    $summarySheet = $workbook.Sheets.Item("Summary_Communication")
    Write-Output "=== Summary_Communication Sheet ==="
    Write-Output "Rows used: $($summarySheet.UsedRange.Rows.Count)"
    Write-Output "Columns used: $($summarySheet.UsedRange.Columns.Count)"
    
    # Get first few rows to understand structure
    Write-Output "\nFirst few rows:"
    for ($i = 1; $i -le 5; $i++) {
        $cellValue = $summarySheet.Cells.Item($i, 1).Text
        if ($cellValue -ne "") {
            Write-Output "Row $i : $cellValue"
        }
    }
    
    # Get information about Summary_Processes sheet
    $processesSheet = $workbook.Sheets.Item("Summary_Processes")
    Write-Output "\n=== Summary_Processes Sheet ==="
    Write-Output "Rows used: $($processesSheet.UsedRange.Rows.Count)"
    Write-Output "Columns used: $($processesSheet.UsedRange.Columns.Count)"
    
    # Get first few rows
    Write-Output "\nFirst few rows:"
    for ($i = 1; $i -le 5; $i++) {
        $cellValue = $processesSheet.Cells.Item($i, 1).Text
        if ($cellValue -ne "") {
            Write-Output "Row $i : $cellValue"
        }
    }
    
    # Get information about c_CodeLists sheet
    $codeListsSheet = $workbook.Sheets.Item("c_CodeLists")
    Write-Output "\n=== c_CodeLists Sheet ==="
    Write-Output "Rows used: $($codeListsSheet.UsedRange.Rows.Count)"
    Write-Output "Columns used: $($codeListsSheet.UsedRange.Columns.Count)"
    
    # Get first few rows
    Write-Output "\nFirst few rows:"
    for ($i = 1; $i -le 5; $i++) {
        $cellValue = $codeListsSheet.Cells.Item($i, 1).Text
        if ($cellValue -ne "") {
            Write-Output "Row $i : $cellValue"
        }
    }
    
    $workbook.Close($false)
    $excel.Quit()
}
catch {
    Write-Output "Error: $($_.Exception.Message)"
}