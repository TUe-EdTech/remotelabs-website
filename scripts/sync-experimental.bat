@echo off
REM Sync Experimental Layout to Production
REM Usage: sync-experimental.bat [options]
REM 
REM Options:
REM   --dry-run       Show what would be copied without actually copying
REM   --build         Also run npm build after syncing
REM   --deploy        Also copy to deploy/ folder after building
REM   --force         Overwrite without confirmation
REM   --interactive   Ask for confirmation for each file

set REPO_ROOT=%~dp0..
set EXPERIMENTAL_DIR=%REPO_ROOT%\experimental
set PRODUCTION_DIR=%REPO_ROOT%\production_source
set DEPLOY_DIR=%REPO_ROOT%\deploy

REM Check if experimental directory exists
if not exist "%EXPERIMENTAL_DIR%\" (
    echo ERROR: Experimental directory not found: %EXPERIMENTAL_DIR%
    exit /b 1
)

REM Check if production_source directory exists
if not exist "%PRODUCTION_DIR%\" (
    echo ERROR: Production directory not found: %PRODUCTION_DIR%
    exit /b 1
)

echo Starting experimental sync...
echo.

REM Parse arguments
set DRY_RUN=false
set BUILD=false
set DEPLOY=false
set FORCE=false
set INTERACTIVE=false

:parse_args
if "%~1"=="" goto end_parse
if "%~1"=="--dry-run" set DRY_RUN=true
if "%~1"=="--build" set BUILD=true
if "%~1"=="--deploy" set DEPLOY=true
if "%~1"=="--force" set FORCE=true
if "%~1"=="--interactive" set INTERACTIVE=true
shift
goto parse_args

:end_parse

echo Options: dry-run=%DRY_RUN%, build=%BUILD%, deploy=%DEPLOY%, force=%FORCE%
echo.

REM Check for versioned files reminder
set VERSIONED_FILES Found=false
if exist "%EXPERIMENTAL_DIR%\sw.js" set VERSIONED_FILES Found=true
if exist "%EXPERIMENTAL_DIR%\index.html" set VERSIONED_FILES Found=true
if exist "%EXPERIMENTAL_DIR%\privacy.html" set VERSIONED_FILES Found=true

if "%VERSIONED_FILES%"=="Found=true" (
    echo ⚠️  VERSION UPDATE REMINDER
    echo The following files may require version updates:
    echo   - sw.js (CACHE_NAME)
    echo   - index.html (version query strings)
    echo   - privacy.html (version query strings)
    echo.
)

REM Copy files
set FILES_COPYED=0

REM HTML files
for %%F in ("%EXPERIMENTAL_DIR%\*.html") do (
    set EXP_FILE=%%F
    set PROD_FILE=%PRODUCTION_DIR%\%%~nxF
    if "%DRY_RUN%"=="true" (
        echo [DRY RUN] Would copy: !EXP_FILE! -> !PROD_FILE!
    ) else (
        if not "%FORCE%"=="true" (
            set /p CONFIRM=Copy %%~nxF to production_source? (y/N): 
            if /i "!CONFIRM!" NEQ "y" (
                echo Skipped: %%~nxF
                goto :skip_copy
            )
        )
        copy /Y "!EXP_FILE!" "!PROD_FILE!" >nul
        echo Copied: %%~nxF
        set /a FILES_COPYED+=1
        :skip_copy
    )
)

REM CSS files
for %%F in ("%EXPERIMENTAL_DIR%\*.css") do (
    set EXP_FILE=%%F
    set PROD_FILE=%PRODUCTION_DIR%\%%~nxF
    if "%DRY_RUN%"=="true" (
        echo [DRY RUN] Would copy: !EXP_FILE! -> !PROD_FILE!
    ) else (
        if not "%FORCE%"=="true" (
            set /p CONFIRM=Copy %%~nxF to production_source? (y/N): 
            if /i "!CONFIRM!" NEQ "y" (
                echo Skipped: %%~nxF
                goto :skip_copy_css
            )
        )
        copy /Y "!EXP_FILE!" "!PROD_FILE!" >nul
        echo Copied: %%~nxF
        set /a FILES_COPYED+=1
        :skip_copy_css
    )
)

REM JavaScript files
for %%F in ("%EXPERIMENTAL_DIR%\*.js") do (
    set EXP_FILE=%%F
    set PROD_FILE=%PRODUCTION_DIR%\%%~nxF
    if "%DRY_RUN%"=="true" (
        echo [DRY RUN] Would copy: !EXP_FILE! -> !PROD_FILE!
    ) else (
        if not "%FORCE%"=="true" (
            set /p CONFIRM=Copy %%~nxF to production_source? (y/N): 
            if /i "!CONFIRM!" NEQ "y" (
                echo Skipped: %%~nxF
                goto :skip_copy_js
            )
        )
        copy /Y "!EXP_FILE!" "!PROD_FILE!" >nul
        echo Copied: %%~nxF
        set /a FILES_COPYED+=1
        :skip_copy_js
    )
)

REM Assets directory
if exist "%EXPERIMENTAL_DIR%\assets\" (
    if "%DRY_RUN%"=="true" (
        echo [DRY RUN] Would copy: %EXPERIMENTAL_DIR%\assets -> %PRODUCTION_DIR%\assets
    ) else (
        if not "%FORCE%"=="true" (
            set /p CONFIRM=Copy assets directory to production_source? (y/N): 
            if /i "!CONFIRM!" NEQ "y" (
                echo Skipped: assets/
                goto :skip_assets
            )
        )
        xcopy /E /I /Y "%EXPERIMENTAL_DIR%\assets\*" "%PRODUCTION_DIR%\assets\" >nul
        echo Copied: assets/
        set /a FILES_COPYED+=1
        :skip_assets
    )
)

REM Other files (json, txt, xml, etc.)
for %%E in (.json .txt .xml .htaccess .svg .png .jpg .jpeg .gif .webp .ico) do (
    for %%F in ("%EXPERIMENTAL_DIR%\*.%%E") do (
        set EXP_FILE=%%F
        set PROD_FILE=%PRODUCTION_DIR%\%%~nxF
        if "%DRY_RUN%"=="true" (
            echo [DRY RUN] Would copy: !EXP_FILE! -> !PROD_FILE!
        ) else (
            if not "%FORCE%"=="true" (
                set /p CONFIRM=Copy %%~nxF to production_source? (y/N): 
                if /i "!CONFIRM!" NEQ "y" (
                    echo Skipped: %%~nxF
                    goto :skip_other
                )
            )
            copy /Y "!EXP_FILE!" "!PROD_FILE!" >nul
            echo Copied: %%~nxF
            set /a FILES_COPYED+=1
            :skip_other
        )
    )
)

if %FILES_COPYED% EQU 0 (
    echo No files need to be synced. Everything is up to date!
) else (
    echo.
    echo %FILES_COPYED% file(s) synced successfully!
)

REM Build if requested
if "%BUILD%"=="true" (
    if "%DRY_RUN%"=="true" (
        echo [DRY RUN] Would run: npm run build in production_source/
    ) else (
        echo.
        echo Running build process...
        cd /d "%PRODUCTION_DIR%"
        npm run build
        if errorlevel 1 (
            echo Build failed!
            exit /b 1
        )
        echo Build completed successfully!
    )
)

REM Deploy if requested
if "%DEPLOY%"=="true" (
    if "%BUILD%"=="false" (
        echo Warning: --deploy requires --build. Skipping deploy.
    ) else (
        if "%DRY_RUN%"=="true" (
            echo [DRY RUN] Would copy built files to deploy/
        ) else (
            echo.
            echo Copying built files to deploy/...
            
            REM Copy key files
            for %%F in (index.html privacy.html styles.min.css script.min.js sw.js manifest.json robots.txt sitemap.xml .htaccess) do (
                if exist "%PRODUCTION_DIR%\%%F" (
                    copy /Y "%PRODUCTION_DIR%\%%F" "%DEPLOY_DIR%\%%F" >nul
                    echo Copied: %%F
                )
            )
            
            REM Copy assets
            if exist "%PRODUCTION_DIR%\assets\" (
                if exist "%DEPLOY_DIR%\assets\" (
                    rmdir /S /Q "%DEPLOY_DIR%\assets"
                )
                xcopy /E /I /Y "%PRODUCTION_DIR%\assets\*" "%DEPLOY_DIR%\assets\" >nul
                echo Copied: assets/
            )
            
            echo Deploy files updated!
        )
    )
)

echo.
echo Sync complete!
if "%DRY_RUN%"=="false" (
    echo.
    echo Next steps:
    if "%BUILD%"=="false" (
        echo   Run: npm run build (in production_source/)
    )
    if "%DEPLOY%"=="false" (
        echo   Copy built files to deploy/
    )
    echo   Update version numbers if needed
    echo   Test in deploy/index.html
)
