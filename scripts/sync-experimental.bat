@echo off
REM Thin wrapper - the implementation lives in scripts/sync-experimental.js
REM (single source of truth; do not duplicate logic here).
REM Usage: sync-experimental.bat [--dry-run] [--build] [--deploy] [--exp-build] [--force] [--interactive] [--all]
node "%~dp0sync-experimental.js" %*
