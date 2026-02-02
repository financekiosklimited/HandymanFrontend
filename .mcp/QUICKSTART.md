# NotebookLM MCP - Quick Reference Card

## 🚀 One-Line Install
```bash
npx notebooklm-mcp@latest
```

## 🔐 Authentication (One-time)
```
"Log me in to NotebookLM"
```

## 📚 Core Commands

### Library Management
| Command | Example |
|---------|---------|
| Add notebook | `"Add https://notebooklm.google.com/notebooks/xyz tagged 'react, docs'`" |
| List notebooks | `"Show my notebooks"` |
| Select notebook | `"Use the API documentation notebook"` |
| Remove notebook | `"Remove [notebook-name] from library"` |

### Query Sources
| Command | Example |
|---------|---------|
| Research first | `"Research this in NotebookLM before coding"` |
| Ask question | `"According to my sources, what's the best practice for...?"` |
| Get specific | `"What does the documentation say about error handling?"` |

### Utilities
| Command | Purpose |
|---------|---------|
| `"Show me the browser"` | Watch live NotebookLM chat |
| `"Repair NotebookLM auth"` | Fix authentication issues |
| `"Run NotebookLM cleanup"` | Fresh start (keeps library) |

## 🎯 Workflow Example

### 1. Setup Your Knowledge Base
1. Go to **notebooklm.google.com**
2. Create notebook: "Project Documentation"
3. Upload: API docs, README, architecture diagrams
4. Get share link

### 2. Add to AI Library
```
"Add [paste-link] to my library tagged 'project-api, backend'"
```

### 3. Use in Development
```
"I'm implementing user authentication. Research the auth flow in my NotebookLM first."
```

**AI will:**
1. Query your NotebookLM sources
2. Ask follow-up questions if needed
3. Get accurate, cited answers
4. Implement based on your actual docs

### 4. Switch Contexts
```
"Now switch to the frontend notebook for the React component"
```

## 🔧 Configuration

### Profiles
```bash
# Minimal (5 tools) - Best for reading
npx notebooklm-mcp config set profile minimal

# Standard (10 tools) - + Library management
npx notebooklm-mcp config set profile standard

# Full (16 tools) - Everything
npx notebooklm-mcp config set profile full
```

### Environment Variables
```bash
export NOTEBOOKLM_PROFILE=minimal
export NOTEBOOKLM_DISABLED_TOOLS="cleanup_data"
```

## 📖 Supported Source Types

- 📄 **PDFs** - Documentation, papers
- 📝 **Google Docs** - Notes, specs
- 📋 **Markdown** - README, guides
- 🔗 **Websites** - API docs, blogs
- 📁 **GitHub repos** - Code documentation
- 🎥 **YouTube videos** - Tutorials, talks

## 🎓 Pro Tips

1. **Tag strategically**: Use tags like `language-framework-topic`
2. **One topic per notebook**: Don't mix unrelated docs
3. **Let AI iterate**: Claude asks multiple questions automatically
4. **Citations included**: Every answer shows which source it came from
5. **Zero hallucinations**: If not in your docs, it says "I don't know"

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Auth expired | `"Repair NotebookLM authentication"` |
| Wrong account | `"Re-authenticate with different Google account"` |
| Can't see browser | `"Show me the browser"` |
| Need fresh start | `"Run NotebookLM cleanup"` |

## 🔗 Useful Links

- **Web**: https://notebooklm.google.com
- **GitHub**: https://github.com/PleasePrompto/notebooklm-mcp
- **Full Docs**: See README.md in `.mcp/` directory

---

**Remember**: Upload once, query forever. No more copy-paste between NotebookLM and your editor!
