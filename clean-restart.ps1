
Write-Host "Stopping any running node processes..."
taskkill /F /IM node.exe
Write-Host "Creating clean slate..."
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
Write-Host "Regenerating Prisma Client..."
npx prisma generate
Write-Host "Ready to start!"
Write-Host "Run 'npm run dev' to start the server."
