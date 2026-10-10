param(
    [Parameter(Mandatory=$true)][string]$JsonPath,
    [Parameter(Mandatory=$true)][string]$OutPath
)

$ErrorActionPreference = "Stop"

$jsonText = [System.IO.File]::ReadAllText($JsonPath, [System.Text.Encoding]::UTF8)
$data = $jsonText | ConvertFrom-Json

$sabaDesc = @{
    "1"="ჰიპოთეზების ჩამოყალიბება და მათი მართებულობის დადგენა ან უარყოფა."
    "2"="მსჯელობის ხაზის განვითარება; დასკვნების დასაბუთება."
    "3"="მათემატიკური ობიექტების განსაზღვრებებისა და თვისებების სწორად ჩამოყალიბება, ტერმინებისა და სიმბოლოების გამოყენება."
    "4"="მათემატიკურ დებულებათა ფორმულირების ხერხების გამოყენება."
    "5"="მათემატიკურ იდეებს შორის კავშირის დადგენა, კანონზომიერების აღმოჩენა."
    "6"="გრაფიკულად გადმოცემული ინფორმაციის წაკითხვა და გრაფიკული ხერხით წარმოდგენა."
    "7"="რეალური ობიექტებისა და პროცესების მათემატიკური ფორმულირება და მოდელირება."
    "8"="ამოცანის შინაარსის აღქმა, მონაცემებისა და საძიებელი სიდიდეების გამიჯვნა."
    "9"="კომპლექსური პრობლემის საფეხურებად დაყოფა და ეტაპობრივად ამოხსნა."
    "10"="მიღებული შედეგის კრიტიკული შეფასება და ანალიზი."
    "11"="ტექნოლოგიების გამოყენება მათემატიკური პრობლემის ამოსახსნელად."
}
$sashDesc = @{
    "1"="სიდიდეების რიცხვითი მახასიათებლებით წარმოდგენა, ზუსტი და მიახლოებითი გამოთვლები."
    "2"="ცვლადის, ალგებრული გამოსახულების, განტოლების ან უტოლობის საშუალებით მოვლენის მოდელირება."
    "3"="ცვლად სიდიდეთა შორის ფუნქციური კავშირის დამყარება და გამოყენება მოდელირებისთვის."
    "4"="გეომეტრიული ფორმების ამოცნობა, აღწერა, კლასიფიკაცია და ზომების გამოთვლა."
    "5"="გეომეტრიული ობიექტების ადგილმდებარეობის განსაზღვრა კოორდინატებით და გარდაქმნების გამოყენება."
    "6"="კვლევის დაგეგმვა, მონაცემთა შეგროვება, დამუშავება და წარმოდგენა."
    "7"="ხდომილობის სტატისტიკური და თეორიული ალბათობის შეფასება, შედეგების პროგნოზირება."
    "8"="სიმრავლეთა თეორიასა და ლოგიკურ მსჯელობაზე დაყრდნობით ამოცანის ფორმულირება და ამოხსნა."
    "9"="გამონათქვამებზე ოპერაციებით და დასაბუთების მეთოდებით ლოგიკური დასკვნის გამოტანა."
}

$descMap = if ($data.codePrefix -eq "მათ.საშ.") { $sashDesc } else { $sabaDesc }

function Build-StdText($rawStd) {
    if ($rawStd -match '^[0-9,\s]+$') {
        $codes = $rawStd -split ',' | ForEach-Object { $_.Trim() }
        $parts = foreach ($c in $codes) {
            $desc = $descMap[$c]
            "$($data.codePrefix)$c. - $desc"
        }
        return ($parts -join " ")
    } else {
        return $rawStd
    }
}

$romanHeaders = @("I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII","XIX","XX","XXI","XXII","XXIII","XXIV","XXV","XXVI","XXVII","XXVIII","XXIX","XXX","XXXI","XXXII","XXXIII","XXXIV","XXXV","XXXVI")

Write-Output "checkpoint 1: data loaded, weeks=$($data.weeks.Count)"

$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false
$wb = $excel.Workbooks.Add()
$ws = $wb.Worksheets.Item(1)
Write-Output "checkpoint 2: workbook created"
$ws.Name = "$($data.grade) კლასი - $($data.subject)"
Write-Output "checkpoint 3: sheet named"

# Row labels
$labels = @{
    1="კატეგორია"
    2="სტანდარტით გათვალისწინებული მიზანი/ შედეგი"
    3="ლექსიკური ერთეულები/ცნება/ქვეცნება"
    4="სასწავლო თემა/ ქვეთემა"
    5="სასწავლო აქტივობა (სამუშაო ფურცელი...)"
    6="კავშირი სასკოლო მიზნებთან"
    7="შეფასება (ტიპი, რუბრიკა)"
    8="რესურსები"
    9="კომენტარი"
}
foreach ($r in $labels.Keys) {
    $ws.Cells.Item($r,1) = $labels[$r]
}

$levelWord = if ($data.codePrefix -eq "მათ.საშ.") { "საშუალო" } else { "საბაზო" }
$noteText = "შენიშვნა: თითოეულ კვირაში მითითებულია ეროვნული სასწავლო გეგმის მათემატიკის სტანდარტის (დოკუმენტი «მათემატიკა», $($data.levelNote)) ის კონკრეტული შედეგის ინდექსი(ები) და მისი მოკლე აღწერა, რომელიც სწორედ ამ კვირის საკითხს უკავშირდება. ეს მონაცემები მოცემულია უშუალოდ რიგში «სტანდარტით გათვალისწინებული მიზანი/ შედეგი», ცალკე რიგის დამატების გარეშე."
$ws.Cells.Item(11,1) = $noteText

# Header row: week roman numerals
for ($i=0; $i -lt 36; $i++) {
    $col = $i + 2
    $ws.Cells.Item(1,$col) = $romanHeaders[$i]
}

# Fill week data
$weeks = $data.weeks
for ($i=0; $i -lt $weeks.Count; $i++) {
    $w = $weeks[$i]
    $col = $i + 2
    $ws.Cells.Item(2,$col) = (Build-StdText $w.std)
    $ws.Cells.Item(3,$col) = $w.lex
    $ws.Cells.Item(4,$col) = $w.topic
    $ws.Cells.Item(5,$col) = $w.act
    $ws.Cells.Item(6,$col) = $w.goal
    $ws.Cells.Item(7,$col) = $w.ass
    $ws.Cells.Item(8,$col) = $w.res
    $roman = $romanHeaders[$i]
    if ($data.comments.PSObject.Properties.Name -contains $roman) {
        $ws.Cells.Item(9,$col) = $data.comments.$roman
    }
}
Write-Output "checkpoint 4: week data filled"

# --- Formatting ---
$lastCol = 37 # A(1) + 36 weeks (2..37)
Write-Output "checkpoint 4a: lastCol=$lastCol"
$fullRange = $ws.Range($ws.Cells.Item(1,1), $ws.Cells.Item(11,$lastCol))
Write-Output "checkpoint 4b: range obtained"
$fullRange.Font.Name = "Calibri"
Write-Output "checkpoint 4c: font name set"
$fullRange.Font.Size = 11
Write-Output "checkpoint 4d: font size set"
$fullRange.WrapText = $true
Write-Output "checkpoint 4e: wraptext set"

# Column widths
$ws.Columns.Item(1).ColumnWidth = 34
Write-Output "checkpoint 4f: col A width set"
for ($c=2; $c -le $lastCol; $c++) { $ws.Columns.Item($c).ColumnWidth = 33.22 }
Write-Output "checkpoint 4g: col widths set"

# Row heights
$rowHeights = @{1=24;2=150;3=50;4=80;5=80;6=40.1;7=40.1;8=75;9=55.1;10=14.4;11=187.2}
foreach ($r in $rowHeights.Keys) {
    Write-Output "setting row $r to $($rowHeights[$r])"
    $ws.Rows.Item([int]$r).RowHeight = [double]$rowHeights[$r]
}
Write-Output "checkpoint 5: sizing done"

# Header row style (row 1): bold white on dark teal, centered
$headerRange = $ws.Range($ws.Cells.Item(1,1), $ws.Cells.Item(1,$lastCol))
$headerRange.Font.Bold = $true
$headerRange.Font.Color = 16777215
$headerRange.Interior.Color = 6975020
$headerRange.HorizontalAlignment = -4108
$headerRange.VerticalAlignment = -4108
Write-Output "checkpoint 6: header styled"

# Column A (rows 2-9) bold labels
$labelRange = $ws.Range($ws.Cells.Item(2,1), $ws.Cells.Item(9,1))
$labelRange.Font.Bold = $true
$labelRange.HorizontalAlignment = 1
$labelRange.VerticalAlignment = -4108
$labelRange.Interior.Color = 16777215
Write-Output "checkpoint 7: label column styled"

# Data cells (rows 2-9, cols 2..lastCol)
$dataRange = $ws.Range($ws.Cells.Item(2,2), $ws.Cells.Item(9,$lastCol))
$dataRange.Font.Bold = $false
$dataRange.HorizontalAlignment = 1
$dataRange.VerticalAlignment = -4160
$dataRange.Interior.Color = 16777215
$borders = $dataRange.Borders
foreach ($edgeIdx in 7,8,9,10,11,12) {
    try {
        $b = $dataRange.Borders.Item($edgeIdx)
        $b.LineStyle = 1
        $b.Weight = 2
        $b.Color = 14277081
    } catch {}
}
Write-Output "checkpoint 8: data cells styled"

# Row 11 note cell
$noteCell = $ws.Cells.Item(11,1)
$noteCell.Font.Bold = $false
$noteCell.WrapText = $true
$noteCell.VerticalAlignment = -4160
Write-Output "checkpoint 9: note cell styled"

# Freeze panes at B2
$excel.ActiveWindow.SplitRow = 1
$excel.ActiveWindow.SplitColumn = 1
$excel.ActiveWindow.FreezePanes = $true
Write-Output "checkpoint 10: freeze panes set"

$excel.ActiveWindow.DisplayGridlines = $true
$ws.PageSetup.Orientation = 1
$ws.PageSetup.FitToPagesWide = 1
$ws.PageSetup.FitToPagesTall = 1
Write-Output "checkpoint 11: page setup done"

$wb.SaveAs($OutPath, 51) # xlOpenXMLWorkbook (.xlsx)
$wb.Close($false)
$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
Write-Output "Saved: $OutPath"
