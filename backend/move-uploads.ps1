# move-uploads.ps1
Write-Host "=== Moving Upload Files to Services Directory ===" -ForegroundColor Green

$backendDir = Get-Location
$uploadsDir = Join-Path $backendDir "uploads"
$servicesDir = Join-Path $uploadsDir "services"

Write-Host "Backend directory: $backendDir"
Write-Host "Uploads directory: $uploadsDir"
Write-Host "Services directory: $servicesDir"

# Create services directory if it doesn't exist
if (-not (Test-Path $servicesDir)) {
    New-Item -ItemType Directory -Path $servicesDir -Force
    Write-Host "✅ Created services directory" -ForegroundColor Green
}

# Check for image files in uploads root that should be moved to services
if (Test-Path $uploadsDir) {
    $imageFiles = Get-ChildItem -Path $uploadsDir -File | Where-Object { 
        $_.Extension -match '\.(jpg|jpeg|png|gif|webp)$' -and 
        $_.Name -match '^(images-|fil-)'
    }
    
    if ($imageFiles.Count -gt 0) {
        Write-Host "Found $($imageFiles.Count) image files to move:" -ForegroundColor Yellow
        
        foreach ($file in $imageFiles) {
            $destination = Join-Path $servicesDir $file.Name
            try {
                Move-Item -Path $file.FullName -Destination $destination -Force
                Write-Host "✅ Moved: $($file.Name)" -ForegroundColor Green
            }
            catch {
                Write-Host "❌ Failed to move $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "No image files found to move" -ForegroundColor Yellow
    }
}

# List final directory contents
Write-Host "`n=== Final Directory Structure ===" -ForegroundColor Blue

if (Test-Path $uploadsDir) {
    Write-Host "Uploads directory contents:"
    Get-ChildItem -Path $uploadsDir | ForEach-Object {
        if ($_.PSIsContainer) {
            Write-Host "  [DIR]  $($_.Name)" -ForegroundColor Cyan
        } else {
            Write-Host "  [FILE] $($_.Name)"
        }
    }
}

if (Test-Path $servicesDir) {
    Write-Host "`nServices directory contents:"
    $serviceFiles = Get-ChildItem -Path $servicesDir -File
    if ($serviceFiles.Count -eq 0) {
        Write-Host "  (empty)" -ForegroundColor Yellow
    } else {
        $serviceFiles | ForEach-Object {
            Write-Host "  [FILE] $($_.Name)"
        }
        Write-Host "Total: $($serviceFiles.Count) files" -ForegroundColor Green
    }
}

Write-Host "`n✅ File migration complete!" -ForegroundColor Green
