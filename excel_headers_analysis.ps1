try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $workbook = $excel.Workbooks.Open('d:\Projekti\CBAM communication template for installations\CBAM Communication template for installations_en_20241213.xlsx')
    
    # Analyze Summary_Communication sheet
    $summarySheet = $workbook.Sheets.Item("Summary_Communication")
    Write-Output "=== Summary_Communication Sheet ==="
    Write-Output "Rows used: $($summarySheet.UsedRange.Rows.Count)"
    Write-Output "Columns used: $($summarySheet.UsedRange.Columns.Count)"
    
    # Look for headers in row 5-10 (common location)
    Write-Output "\nHeaders (checking rows 5-10):"
    for ($row = 5; $row -le 10; $row++) {
        $hasContent = $false
        $rowContent = "Row ${row}: "
        for ($col = 1; $col -le 10; $col++) {
            $cellValue = $summarySheet.Cells.Item($row, $col).Text
            if ($cellValue -ne "") {
                $rowContent += "[$cellValue] "
                $hasContent = $true
            }
        }
        if ($hasContent) {
            Write-Output $rowContent
        }
    }
    
    # Look for section indicators
    Write-Output "\nSection indicators:"
    for ($row = 1; $row -le 50; $row++) {
        for ($col = 1; $col -le 5; $col++) {
            $cellValue = $summarySheet.Cells.Item($row, $col).Text
            if ($cellValue -like "*Section*" -or $cellValue -like "*Supplier*" -or $cellValue -like "*Importer*" -or $cellValue -like "*Installation*") {
                Write-Output "Row ${row}, Col ${col}: $cellValue"
            }
        }
    }
    
    # Analyze Summary_Processes sheet
    $processesSheet = $workbook.Sheets.Item("Summary_Processes")
    Write-Output "\n\n=== Summary_Processes Sheet ==="
    Write-Output "Rows used: $($processesSheet.UsedRange.Rows.Count)"
    Write-Output "Columns used: $($processesSheet.UsedRange.Columns.Count)"
    
    # Look for headers
    Write-Output "\nHeaders (checking rows 5-10):"
    for ($row = 5; $row -le 10; $row++) {
        $hasContent = $false
        $rowContent = "Row ${row}: "
        for ($col = 1; $col -le 10; $col++) {
            $cellValue = $processesSheet.Cells.Item($row, $col).Text
            if ($cellValue -ne "") {
                $rowContent += "[$cellValue] "
                $hasContent = $true
            }
        }
        if ($hasContent) {
            Write-Output $rowContent
        }
    }
    
    # Check a_Contents sheet for overview
    try {
        $contentsSheet = $workbook.Sheets.Item("a_Contents")
        Write-Output "\n\n=== a_Contents Sheet ==="
        Write-Output "Rows used: $($contentsSheet.UsedRange.Rows.Count)"
        Write-Output "Columns used: $($contentsSheet.UsedRange.Columns.Count)"
        
        # Get first 15 rows to understand structure
        Write-Output "\nContent overview:"
        for ($row = 1; $row -le 15; $row++) {
            $rowContent = ""
            for ($col = 1; $col -le 5; $col++) {
                $cellValue = $contentsSheet.Cells.Item($row, $col).Text
                if ($cellValue -ne "") {
                    $rowContent += "[$cellValue] "
                }
            }
            if ($rowContent -ne "") {
                Write-Output "Row ${row}: $rowContent"
            }
        }
    }
    catch {
        Write-Output "Could not analyze a_Contents sheet"
    }
    
    $workbook.Close($false)
    $excel.Quit()
    
    Write-Output "\n\n=== Overall Structure Overview ==="
    Write-Output "The CBAM Communication template is a comprehensive Excel file with 19 sheets organized as follows:"
    Write-Output "1. Documentation sheets (0_Versions, a_Contents, b_Guidelines&Conditions, G_FurtherGuidance)"
    Write-Output "2. Reference sheets (c_CodeLists, Parameters_Constants, Parameters_CNCodes, Translations)"
    Write-Output "3. Data input sheets (A_InstData, B_EmInst, C_Emissions&Energy, D_Processes, E_PurchPrec)"
    Write-Output "4. Summary sheets (Summary_Processes, Summary_Products, Summary_Communication)"
    Write-Output "5. Calculation sheets (F_Tools, InputOutput)"
    Write-Output "6. Documentation (VersionDocumentation)"
}
catch {
    Write-Output "Error: $($_.Exception.Message)"
}