#!/bin/bash
# NotebookLM MCP Setup Script for macOS/Linux
# This script installs and configures the NotebookLM MCP server

set -e

echo "=========================================="
echo "NotebookLM MCP Server Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/4] Node.js found: $(node --version)"
echo ""

# Install notebooklm-mcp globally
echo "[2/4] Installing notebooklm-mcp..."
npm install -g notebooklm-mcp@latest
echo "[✓] Installed successfully"
echo ""

# Setup configuration directory
echo "[3/4] Setting up configuration..."

# Detect OS and set config path
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CONFIG_DIR="$HOME/.config/Claude"
else
    echo "[i] Unknown OS, skipping auto-configuration"
    CONFIG_DIR=""
fi

if [ -n "$CONFIG_DIR" ]; then
    mkdir -p "$CONFIG_DIR"
    cp -f "$(dirname "$0")/mcp.json" "$CONFIG_DIR/mcp.json" 2>/dev/null || {
        echo "[i] Could not auto-configure Claude Desktop"
        echo "[i] Please manually copy mcp.json to: $CONFIG_DIR/"
    }
    echo "[✓] Claude Desktop configured"
    echo ""
fi

# Set minimal profile for reading
echo "[4/4] Setting minimal profile (optimized for reading sources)..."
npx notebooklm-mcp config set profile minimal
echo "[✓] Profile set to minimal"
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Open your AI assistant (Claude Desktop, Cursor, etc.)"
echo "2. Say: 'Log me in to NotebookLM'"
echo "3. A Chrome window will open - log in with Google Pro"
echo "4. Go to notebooklm.google.com and create notebooks"
echo "5. Share notebook links with your AI"
echo ""
echo "For detailed usage, see README.md in this directory."
echo ""

# Make the script executable
chmod +x "$0"
