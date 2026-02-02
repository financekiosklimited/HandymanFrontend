# NotebookLM MCP Configuration

## Quick Setup (30 seconds)

### 1. Install MCP Server
```bash
# Option A: Global install (recommended)
npm install -g notebooklm-mcp

# Option B: Use with npx (no install needed)
npx notebooklm-mcp@latest
```

### 2. Configure Your MCP Client

**For Claude Desktop/Code:**
Copy the `mcp.json` content to your Claude configuration:
- **macOS**: `~/Library/Application Support/Claude/mcp.json`
- **Windows**: `%APPDATA%\Claude\mcp.json`
- **Linux**: `~/.config/Claude/mcp.json`

**For Cursor:**
Copy to `~/.cursor/mcp.json`

**For Other MCP Clients:**
Use the `mcp.json` configuration provided in this directory.

### 3. Authenticate (One-time)

Say to your AI assistant:
```
"Log me in to NotebookLM"
```

Or run:
```bash
npx notebooklm-mcp auth
```

A Chrome window will open. Log in with your Google Pro account. ✅ Done!

---

## Usage Examples

### Add Notebook to Library
```
"Add https://notebooklm.google.com/notebooks/xyz to my library tagged 'research, project-alpha'"
```

### Query Your Sources
```
"Research the authentication flow in my NotebookLM before implementing"
```

### List Your Notebooks
```
"Show me all my saved notebooks"
```

### Select Active Notebook
```
"Use the React documentation notebook for this task"
```

### Ask Specific Questions
```
"According to my NotebookLM sources, what's the best practice for error handling in this API?"
```

---

## Configuration

### Profile: Minimal (Recommended for Reading)
The configuration uses `minimal` profile with these tools:
- `ask_question` - Query your notebooks
- `list_notebooks` - View saved notebooks
- `select_notebook` - Choose which notebook to query
- `get_notebook` - Get notebook details
- `get_health` - Check connection status

### Change Profile
```bash
# To standard (adds library management)
npx notebooklm-mcp config set profile standard

# To full (all 16 tools)
npx notebooklm-mcp config set profile full
```

### Environment Variables
```bash
# Set profile
export NOTEBOOKLM_PROFILE=minimal

# Disable specific tools
export NOTEBOOKLM_DISABLED_TOOLS="cleanup_data,re_auth"
```

---

## How It Works

```
You ask question 
    ↓
AI Assistant (Claude/Cursor) 
    ↓
MCP Server (notebooklm-mcp)
    ↓
Browser Automation (Chrome)
    ↓
NotebookLM Web Interface
    ↓
Gemini 2.5 AI
    ↓
Your Uploaded Sources (PDFs, docs, websites)
    ↓
Answer with citations back to you
```

**Key Features:**
- ✅ **Zero hallucinations** - Answers only from your sources
- ✅ **Persistent auth** - Login once, use forever
- ✅ **Citation-backed** - Every answer includes source references
- ✅ **Cross-tool sharing** - Works with Claude, Cursor, Codex, etc.
- ✅ **Library management** - Tag and organize notebooks

---

## Setting Up Your Knowledge Base

### 1. Create Notebooks
Go to [notebooklm.google.com](https://notebooklm.google.com) and create notebooks for:
- Project documentation
- API references
- Research papers
- Code documentation
- Meeting notes

### 2. Upload Sources
**Supported formats:**
- 📄 PDFs
- 📝 Google Docs
- 📋 Markdown files
- 🔗 Websites (URLs)
- 📁 GitHub repos
- 🎥 YouTube videos
- 📚 Multiple sources per notebook

### 3. Get Share Link
1. Open your notebook
2. Click ⚙️ (Settings)
3. Click "Share"
4. Select "Anyone with the link"
5. Copy the link

### 4. Add to AI Library
```
"Add [paste-link-here] to my library tagged 'backend-api'"
```

---

## Troubleshooting

### Authentication Issues
```bash
# Re-authenticate
npx notebooklm-mcp auth

# Or say to AI: "Repair NotebookLM authentication"
```

### Switch Google Account
```
"Re-authenticate with different Google account"
```

### View Browser Session
```
"Show me the browser"
```
(This opens Chrome so you can see the live NotebookLM chat)

### Clean Restart
```bash
# Remove all data
npx notebooklm-mcp cleanup

# Or: "Run NotebookLM cleanup but keep my library"
```

---

## Best Practices

1. **Use specific tags** when adding notebooks: `"Add [link] tagged 'react, frontend, hooks'"`

2. **Research first, code second**: `"Research this in NotebookLM before implementing"`

3. **Let AI ask follow-ups**: Claude will automatically ask multiple questions to build complete understanding

4. **Dedicated Google account**: Consider using a separate Google account for automation (optional but recommended)

5. **Organize by project**: Create separate notebooks for different projects/topics

---

## Links

- **MCP Server**: https://github.com/PleasePrompto/notebooklm-mcp
- **NotebookLM**: https://notebooklm.google.com
- **Documentation**: See README in the GitHub repo

---

## Next Steps

1. ✅ Install MCP server (see Quick Setup above)
2. ✅ Configure your MCP client with `mcp.json`
3. ✅ Authenticate with Google Pro account
4. ✅ Create your first notebook at notebooklm.google.com
5. ✅ Add notebook link to your AI library
6. ✅ Start querying your sources!

**Ready?** Run: `npx notebooklm-mcp@latest` or say to your AI: `"Log me in to NotebookLM"`
