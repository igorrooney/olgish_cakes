# PowerShell script to fix StructuredData imports and usages
$files = Get-ChildItem -Path "app" -Recurse -Filter "*.tsx" | Where-Object { 
    (Get-Content $_.FullName) -match "StructuredData"
}

foreach ($file in $files) {
    Write-Host "Processing: $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw
    
    # Remove StructuredData import
    $content = $content -replace "import\s+\{\s*StructuredData\s*\}\s+from\s+['""][^'""]*StructuredData['""];?\s*", ""
    
    # Replace StructuredData usage with script tag
    $content = $content -replace '<StructuredData\s+data=\{structuredData\}\s*/>', '<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />'
    
    # Write back to file
    Set-Content -Path $file.FullName -Value $content -NoNewline
}

Write-Host "Fixed $($files.Count) files" 