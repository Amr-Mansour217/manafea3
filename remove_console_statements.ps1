# This script removes all console statements from JavaScript and JSX files in the project
$jsxFiles = Get-ChildItem -Path "c:\Users\amrma\Documents\manafea\src\" -Include "*.js", "*.jsx" -Recurse

foreach ($file in $jsxFiles) {
    Write-Host "Processing file: $($file.FullName)"
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace console.log statements
    $newContent = $content -replace 'console\.log\([^;]*\);', ''
    
    # Replace console.error statements
    $newContent = $newContent -replace 'console\.error\([^;]*\);', ''
    
    # Replace console.warn statements
    $newContent = $newContent -replace 'console\.warn\([^;]*\);', ''
    
    # Replace console.info statements
    $newContent = $newContent -replace 'console\.info\([^;]*\);', ''
    
    # Write content back to file
    Set-Content -Path $file.FullName -Value $newContent
}

Write-Host "Done! All console statements have been removed."
