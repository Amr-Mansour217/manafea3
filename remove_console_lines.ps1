# This script removes all console statements from JavaScript and JSX files in the project
$jsxFiles = Get-ChildItem -Path "c:\Users\amrma\Documents\manafea\src\" -Include "*.js", "*.jsx" -Recurse

foreach ($file in $jsxFiles) {
    Write-Host "Processing file: $($file.FullName)"
    
    # Read file content line by line
    $lines = Get-Content -Path $file.FullName
    $newLines = @()
    
    foreach ($line in $lines) {
        # Skip any line containing console.log, console.error, console.warn, or console.info
        if ($line -notmatch "console\.(log|error|warn|info)") {
            $newLines += $line
        }
    }
    
    # Write content back to file
    $newLines | Set-Content -Path $file.FullName
}

Write-Host "Done! All console statements have been removed."
