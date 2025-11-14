try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $workbook = $excel.Workbooks.Open('d:\Projekti\CBAM communication template for installations\CBAM Communication template for installations_en_20241213.xlsx')
    
    # First, get information about the Summary_Communication sheet
    $summarySheet = $workbook.Sheets.Item("Summary_Communication")
    Write-Output "Analysis of Summary_Communication sheet:"
    Write-Output "Used range: $($summarySheet.UsedRange.Address)"
    Write-Output "Number of rows used: $($summarySheet.UsedRange.Rows.Count)"
    Write-Output "Number of columns used: $($summarySheet.UsedRange.Columns.Count)"
    Write-Output ""
    
    # Get some header information from the first few rows
    Write-Output "Header information (first 5 rows):"
    for ($row = 1; $row -le 5; $row++) {
        $rowContent = ""
        for ($col = 1; $col -le 5; $col++) {
            $cellValue = $summarySheet.Cells.Item($row, $col).Text
            if ($cellValue -ne "") {
                $rowContent += "[$cellValue] "
            }
        }
        if ($rowContent -ne "") {
            Write-Output "Row ${row}: $rowContent"
        }
    }
    
    Write-Output ""
    
    # Check some key sections in the sheet
    Write-Output "Checking for key sections in the sheet:"
    $usedRange = $summarySheet.UsedRange
    for ($row = 1; $row -le $usedRange.Rows.Count; $row++) {
        $cellValue = $summarySheet.Cells.Item($row, 1).Text
        if ($cellValue -like "*Section*" -or $cellValue -like "*Supplier*" -or $cellValue -like "*Importer*" -or $cellValue -like "*Installation*") {
            Write-Output "Found key section at Row ${row}: $cellValue"
        }
    }
    
    $workbook.Close($false)
    $excel.Quit()
}
catch {
    Write-Output "Error: $($_.Exception.Message)"
}