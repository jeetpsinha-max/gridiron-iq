$files = Get-ChildItem -Path 'd:\MyProfile\Desktop\gridiron-iq\src' -Recurse -File -Include '*.ts','*.tsx','*.css'
foreach ($f in $files) {
    $content = Get-Content -Path $f.FullName -Raw
    if ($content -match 'GridironIQ|GRIDIRON IQ|Gridiron IQ|GridironStore|useGridironStore') {
        $content = $content -replace 'useGridironStore', 'usePeddieSACStore'
        $content = $content -replace 'GridironStore', 'PeddieSACStore'
        $content = $content -replace 'GridironIQ', 'Peddie Football S.A.C.'
        $content = $content -replace 'GRIDIRON IQ', 'PEDDIE FOOTBALL S.A.C.'
        $content = $content -replace 'Gridiron IQ', 'Peddie Football S.A.C.'
        Set-Content -Path $f.FullName -Value $content -NoNewline
        Write-Host "Updated: $($f.FullName)"
    }
}
Write-Host "Done."
