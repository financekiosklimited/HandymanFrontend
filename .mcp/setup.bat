@echo off
REM NotebookLM MCP Setup Script for Windows
REM This script installs and configures the NotebookLM MCP server

echo ==========================================
echo NotebookLM MCP Server Setup
echo ==========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Node.js found: 
node --version
echo.

REM Install notebooklm-mcp globally
echo [2/4] Installing notebooklm-mcp...
npm install -g notebooklm-mcp@latest
if errorlevel 1 (
    echo ERROR: Installation failed!
    pause
    exit /b 1
)
echo [✓] Installed successfully
echo.

REM Create MCP config directory if it doesn't exist
echo [3/4] Setting up configuration...
if not exist "%APPDATA%\Claude" mkdir "%APPDATA%\Claude"

REM Copy mcp.json to Claude config
copy /Y "%~dp0mcp.json" "%APPDATA%\Claude\mcp.json" >nul 2>&1
if errorlevel 1 (
    echo [i] Could not auto-configure Claude Desktop
    echo [i] Please manually copy mcp.json to: %APPDATA%\Claude\
) else (
    echo [✓] Claude Desktop configured
echo.
)

REM Set minimal profile for reading
echo [4/4] Setting minimal profile (optimized for reading sources)...
npx notebooklm-mcp config set profile minimal
echo [✓] Profile set to minimal
echo.

echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Open your AI assistant (Claude Desktop, Cursor, etc.)
echo 2. Say: "Log me in to NotebookLM"
echo 3. A Chrome window will open - log in with Google Pro
echo 4. Go to notebooklm.google.com and create notebooks
echo 5. Share notebook links with your AI
echo.
echo For detailed usage, see README.md in this directory.
echo.
pause
