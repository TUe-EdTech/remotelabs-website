@echo off
REM Build Experimental Layout
REM Usage: build-experimental.bat
REM 
REM This script builds the experimental version and creates a deployable
REM version in the experimental_deploy/ folder.

set REPO_ROOT=%~dp0..
set EXPERIMENTAL_DIR=%REPO_ROOT%\experimental
set EXPERIMENTAL_DEPLOY_DIR=%REPO_ROOT%\experimental_deploy

REM Check if experimental directory exists
if not exist "%EXPERIMENTAL_DIR%\" (
    echo ERROR: Experimental directory not found: %EXPERIMENTAL_DIR%
    exit /b 1
)

echo Building experimental layout...
echo.

REM Clean experimental_deploy directory
if exist "%EXPERIMENTAL_DEPLOY_DIR%\" (
    rmdir /S /Q "%EXPERIMENTAL_DEPLOY_DIR%"
    echo Cleaned experimental_deploy directory
)

REM Create experimental_deploy directory
mkdir "%EXPERIMENTAL_DEPLOY_DIR%"

REM Copy files
echo Copying files...

REM Individual files
for %%F in (index.html script.js styles.css manifest.json robots.txt sitemap.xml) do (
    if exist "%EXPERIMENTAL_DIR%\%%F" (
        copy /Y "%EXPERIMENTAL_DIR%\%%F" "%EXPERIMENTAL_DEPLOY_DIR%\" >nul
        echo Copied: %%F
    ) else (
        echo Warning: File not found: %%F
    )
)

REM Copy assets directory
if exist "%EXPERIMENTAL_DIR%\assets\" (
    xcopy /E /I /Y "%EXPERIMENTAL_DIR%\assets\*" "%EXPERIMENTAL_DEPLOY_DIR%\assets\" >nul
    echo Copied: assets/
)

REM Copy icons from root
for %%F in (icon-192x192.svg icon-512x512.svg) do (
    if exist "%REPO_ROOT%\%%F" (
        copy /Y "%REPO_ROOT%\%%F" "%EXPERIMENTAL_DEPLOY_DIR%\" >nul
        echo Copied: %%F
    )
)

REM Copy .htaccess if exists
if exist "%EXPERIMENTAL_DIR%\.htaccess" (
    copy /Y "%EXPERIMENTAL_DIR%\.htaccess" "%EXPERIMENTAL_DEPLOY_DIR%\.htaccess" >nul
    echo Copied: .htaccess
)

REM Minify assets
echo.
echo Minifying assets...

REM Minify CSS
if exist "%EXPERIMENTAL_DIR%\styles.css" (
    echo Minifying CSS...
    npx clean-css -o "%EXPERIMENTAL_DEPLOY_DIR%\styles.min.css" "%EXPERIMENTAL_DIR%\styles.css"
    if errorlevel 1 (
        echo Warning: CSS minification failed, copying original
        copy /Y "%EXPERIMENTAL_DIR%\styles.css" "%EXPERIMENTAL_DEPLOY_DIR%\styles.min.css" >nul
    ) else (
        echo CSS minified successfully
    )
)

REM Minify JS
if exist "%EXPERIMENTAL_DIR%\script.js" (
    echo Minifying JavaScript...
    npx uglifyjs "%EXPERIMENTAL_DIR%\script.js" -o "%EXPERIMENTAL_DEPLOY_DIR%\script.min.js" -c -m
    if errorlevel 1 (
        echo Warning: JS minification failed, copying original
        copy /Y "%EXPERIMENTAL_DIR%\script.js" "%EXPERIMENTAL_DEPLOY_DIR%\script.min.js" >nul
    ) else (
        echo JavaScript minified successfully
    )
)

REM Update HTML references
echo.
echo Updating HTML references...

if exist "%EXPERIMENTAL_DEPLOY_DIR%\index.html" (
    REM Use PowerShell for more complex string replacement
    powershell -Command "(Get-Content '%EXPERIMENTAL_DEPLOY_DIR%\index.html') -replace 'styles\.css', 'styles.min.css?v=exp' | Set-Content '%EXPERIMENTAL_DEPLOY_DIR%\index.html'" >nul 2>&1
    powershell -Command "(Get-Content '%EXPERIMENTAL_DEPLOY_DIR%\index.html') -replace 'script\.js', 'script.min.js?v=exp' | Set-Content '%EXPERIMENTAL_DEPLOY_DIR%\index.html'" >nul 2>&1
    echo Updated HTML references to minified files
)

echo.
echo Build complete!
echo.
echo Your experimental build is ready in: %EXPERIMENTAL_DEPLOY_DIR%
echo Open experimental_deploy\index.html in your browser to preview.
