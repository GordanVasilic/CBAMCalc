try {
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $workbook = $excel.Workbooks.Open('d:\Projekti\CBAM communication template for installations\CBAM Communication template for installations_en_20241213.xlsx')
    
    Write-Output "Excel file analysis:"
    Write-Output "Number of sheets: $($workbook.Sheets.Count)"
    Write-Output ""
    Write-Output "Sheet names:"
    
    for ($i = 1; $i -le $workbook.Sheets.Count; $i++) {
        $sheet = $workbook.Sheets.Item($i)
        Write-Output "$i. $($sheet.Name)"
    }
    
    $workbook.Close($false)
    $excel.Quit()
}
catch {
    Write-Output "Error: $($_.Exception.Message)"
}