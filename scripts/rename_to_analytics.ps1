$files = Get-ChildItem -Path 'd:\MyProfile\Desktop\gridiron-iq\src' -Recurse -File -Include '*.ts','*.tsx','*.css'
foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    if ($content -match 'Peddie Football S.A.C.|PEDDIE FOOTBALL S.A.C.') {
        $content = $content -replace 'Peddie Football S.A.C.', 'Peddie Football Analytics'
        $content = $content -replace 'PEDDIE FOOTBALL S.A.C.', 'PEDDIE FOOTBALL ANALYTICS'
        [System.IO.File]::WriteAllText($f.FullName, $content)
        Write-Host "Updated: $($f.FullName)"
    }
}
Write-Host "Done."
