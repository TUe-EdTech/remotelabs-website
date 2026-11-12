@echo off
REM Thin wrapper - the implementation lives in scripts/build-experimental.js
REM (single source of truth; do not duplicate logic here).
REM Usage: build-experimental.bat
node "%~dp0build-experimental.js" %*
