@echo off
echo ===================================================
echo WORLDVIEW COMMAND CENTER V5.5 
echo ===================================================
echo LOCAL SERVER BOOT SEQUENCE INITIATED...
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting Python Server on Port 8080...
    echo.
    echo [ACCESS YOUR BROWSER AND NAVIGATE TO:]
    echo http://127.0.0.1:8080
    echo.
    python -m http.server 8080
    pause
    exit
)

:: PowerShell Fallback
echo [Python nicht gefunden - Starte PowerShell Fallback Server]
echo Starting Local Server on Port 8080...
echo.
echo [ACCESS YOUR BROWSER AND NAVIGATE TO:]
echo http://127.0.0.1:8080
echo.
echo Leave this window running while using Worldview. 
echo Press CTRL+C to terminate the local server.
echo ===================================================

powershell -NoProfile -Command "$port=8080; $MimeTypes = @{'.html'='text/html';'.js'='application/javascript';'.css'='text/css';'.json'='application/json';'.png'='image/png';'.jpg'='image/jpeg';'.svg'='image/svg+xml'}; $listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add('http://127.0.0.1:'+$port+'/'); $listener.Start(); while ($listener.IsListening) { try { $context = $listener.GetContext(); $response = $context.Response; $path = $context.Request.Url.LocalPath; if ($path -eq '/') { $path = '/index.html' }; $localPath = Join-Path $PWD $path; if (Test-Path $localPath -PathType Leaf) { $ext = [System.IO.Path]::GetExtension($localPath).ToLower(); if ($MimeTypes.ContainsKey($ext)) { $response.ContentType = $MimeTypes[$ext] } else { $response.ContentType = 'application/octet-stream' }; $content = [System.IO.File]::ReadAllBytes($localPath); $response.ContentLength64 = $content.Length; $response.OutputStream.Write($content, 0, $content.Length) } else { $response.StatusCode = 404 }; $response.Close() } catch {} }"

pause
