# This script removes all console statements from JavaScript and JSX files in the project
$jsxFiles = Get-ChildItem -Path "c:\Users\amrma\Documents\manafea\src\" -Include "*.js", "*.jsx" -Recurse

foreach ($file in $jsxFiles) {
    Write-Host "Processing file: $($file.FullName)"
    
    # Read file content
    $content = Get-Content -Path $file.FullName -Raw
    
    # Replace all console statements (this handles multi-line console statements too)
    $newContent = $content -replace '(?ms)console\.(log|error|warn|info)\([^;]*\);', ''
    
    # Write content back to file
    Set-Content -Path $file.FullName -Value $newContent -NoNewline
}

Write-Host "Done! All console statements have been removed."
