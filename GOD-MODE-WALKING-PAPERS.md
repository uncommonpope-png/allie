# GOD MODE WALKING PAPERS
## Multi-Agent Build System: Codex + Cline + 9Router + Hermes

**Purpose:** Set up a multi-agent build system where Profit (opencode) orchestrates Codex, Cline, and 9Router-powered Hermes as parallel builders. Each agent can be dispatched for different tasks without interrupting the others.

**Date:** June 27, 2026  
**Author:** Profit (opencode)  
**For:** Craig (Grand Code Pope)

---

## ARCHITECTURE

```
                    ┌─────────────────┐
                    │  PROFIT (me)    │
                    │  opencode CLI   │
                    │  Orchestrator   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────────┐ ┌──▼──────────┐ ┌▼───────────────┐
     │  CODEX CLI      │ │  CLINE CLI  │ │  9ROUTER       │
     │  gpt-5.5        │ │  deepseek   │ │  Local Proxy   │
     │  ChatGPT OAuth  │ │  via Cline  │ │  :20128        │
     │  Full sandbox   │ │  Provider   │ │  35+ models    │
     └─────────────────┘ └─────────────┘ └────────────────┘
                                              │
                                    ┌─────────┼─────────┐
                                    │         │         │
                               ┌────▼───┐ ┌──▼───┐ ┌──▼────┐
                               │Hermes  │ │GPT   │ │Gemini │
                               │Ollama  │ │5.5   │ │2.5    │
                               │local   │ │OpenAI│ │Google │
                               └────────┘ └──────┘ └───────┘
```

---

## PREREQUISITES

All of these are already installed on this machine. Just verify:

```bash
# Check installations
npx codex --version        # Should show 0.142.3+
npx cline --version        # Should show 3.0.7+
npx 9router --version      # Should show 0.5.4+
node --version             # Should show v20+
```

---

## STEP 1: Start 9Router

9Router is the local LLM proxy that gives all agents access to 35+ models.

```bash
# Start in tray mode (background, no browser)
npx 9router -n -l -t

# Verify it's running
curl http://127.0.0.1:20128/v1/models
```

### Available Models on 9Router

| Prefix | Provider | Models |
|--------|----------|--------|
| `free` | Combo | Free tier routing |
| `ollama/` | Ollama | gpt-oss:120b, kimi-k2.5, glm-5, minimax-m2.5, qwen3.5 |
| `mistral/` | Mistral | mistral-large, codestral, mistral-medium |
| `nvidia/` | NVIDIA | minimax-m2.7, glm4.7 |
| `gc/` | Google Cloud | gemini-3.1-pro, gemini-2.5-pro, gemini-2.5-flash |
| `cx/` | Codex/OpenAI | gpt-5.5, gpt-5.4, gpt-5.3-codex (multiple reasoning levels) |

### Hermes via 9Router

Hermes is available through the Ollama provider on 9Router. The model IDs:
- `ollama/gpt-oss:120b` — Large Hermes-like model
- `ollama/qwen3.5` — Qwen 3.5 (general purpose)
- `ollama/kimi-k2.5` — Kimi K2.5 (reasoning)
- `free` — Auto-routes to best available

**To use Hermes specifically, pass model name to 9Router API:**
```bash
curl http://127.0.0.1:20128/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ollama/gpt-oss:120b",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

---

## STEP 2: Configure Cline to Use 9Router

Cline is already installed. Configure it to use 9Router as an OpenAI-compatible provider.

### Option A: CLI Configuration (Recommended)

```bash
# Set Cline to use 9Router as OpenAI-compatible endpoint
npx cline config --provider openai-compatible \
  --api-base http://127.0.0.1:20128/v1 \
  --model free
```

### Option B: Manual Config Edit

Edit `C:\Users\uncom\.cline\data\settings\providers.json`:

```json
{
  "version": 1,
  "lastUsedProvider": "nine-router",
  "providers": {
    "nine-router": {
      "settings": {
        "provider": "openai-compatible",
        "apiBase": "http://127.0.0.1:20128/v1",
        "apiKey": "not-needed",
        "model": "free",
        "timeout": 30000
      }
    },
    "cline": { ... existing ... },
    "openai-codex": { ... existing ... }
  }
}
```

### Option C: Per-Session Override

```bash
# Use 9Router for a single Cline session
npx cline -P openai-compatible \
  -k "not-needed" \
  -m "free" \
  -c "C:\Users\uncom\Desktop\allie\containment-observatory\containment-observatory-app" \
  "Your prompt here"
```

### Testing Cline + 9Router

```bash
# Quick test
npx cline -P openai-compatible -k "not-needed" -m "free" "Say hello in 5 words"

# Interactive TUI
npx cline -i -P openai-compatible -k "not-needed" -m "free"
```

---

## STEP 3: Codex Configuration (Already Done)

Codex is configured at `C:\Users\uncom\.codex\config.toml`:

```toml
model = "gpt-5.5"
provider = "openai"
```

Auth at `C:\Users\uncom\.codex\auth.json` (ChatGPT Plus OAuth).

### Using Codex with 9Router Models

Codex can use any model via 9Router by specifying the model:

```bash
# Use Gemini via 9Router
codex exec -C "path/to/project" --skip-git-repo-check \
  --model "gc/gemini-2.5-pro" \
  "Your prompt"

# Use Mistral via 9Router
codex exec -C "path/to/project" --skip-git-repo-check \
  --model "mistral/codestral-latest" \
  "Your prompt"

# Use free tier
codex exec -C "path/to/project" --skip-git-repo-check \
  --model "free" \
  "Your prompt"
```

---

## STEP 4: Agent Dispatch Patterns

### Pattern 1: Codex for Heavy Build Tasks
```bash
# Codex builds features, creates files, runs commands
codex exec -C "C:\Users\uncom\Desktop\allie\containment-observatory\containment-observatory-app" \
  --skip-git-repo-check \
  "Read CODEX-GOD-MODE-DIRECTIVE.md and execute all tasks. Run npm run build after."
```

### Pattern 2: Cline for Code Review / Light Tasks
```bash
# Cline reviews code, suggests improvements
npx cline -P openai-compatible -k "not-needed" -m "free" \
  -c "C:\Users\uncom\Desktop\allie\containment-observatory\containment-observatory-app" \
  "Review all components in src/components/gsk/ and report any issues"
```

### Pattern 3: 9Router Direct for Quick Questions
```bash
# Direct API call for fast answers
curl http://127.0.0.1:20128/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "free",
    "messages": [
      {"role": "system", "content": "You are a React/Three.js expert."},
      {"role": "user", "content": "How do I optimize useGLTF loading?"}
    ]
  }'
```

### Pattern 4: Parallel Dispatch (God Mode)
```bash
# Dispatch multiple agents simultaneously
# Agent 1: Codex builds feature
Start-Job { codex exec -C "path" --skip-git-repo-check "Build the bedroom scene" }

# Agent 2: Cline reviews existing code  
Start-Job { npx cline -P openai-compatible -k "not-needed" -m "free" -c "path" "Review GskScene.tsx" }

# Agent 3: 9Router generates documentation
Start-Job { curl -s http://127.0.0.1:20128/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"free","messages":[{"role":"user","content":"Write API docs for our GSK bridge"}]}' }
```

---

## STEP 5: Model Selection Guide

| Task | Best Model | How to Access |
|------|-----------|---------------|
| **Heavy coding** | gpt-5.5 | Codex (default) or `cx/gpt-5.5` via 9Router |
| **Code review** | deepseek-v4-flash | Cline (default) or `free` via 9Router |
| **Quick questions** | free | 9Router direct API |
| **Deep reasoning** | gemini-2.5-pro | `gc/gemini-2.5-pro` via 9Router |
| **Fast responses** | gemini-2.5-flash | `gc/gemini-2.5-flash` via 9Router |
| **Creative writing** | mistral-large | `mistral/mistral-large-latest` via 9Router |
| **Local/private** | ollama models | `ollama/*` via 9Router |
| **Budget tasks** | free | 9Router `free` model |

---

## QUICK REFERENCE COMMANDS

```bash
# === START SERVICES ===
npx 9router -n -l -t           # Start 9Router in tray

# === CODEX ===
codex exec -C "path" "prompt"  # Run Codex with ChatGPT auth
codex exec -C "path" --model "gc/gemini-2.5-pro" "prompt"  # Use Gemini
codex --help                    # All Codex options

# === CLINE ===
npx cline "prompt"             # Cline with default provider
npx cline -i                   # Interactive TUI
npx cline -P openai-compatible -k "not-needed" -m "free" "prompt"  # Via 9Router
npx cline --help               # All Cline options

# === 9ROUTER ===
curl http://127.0.0.1:20128/v1/models              # List models
curl http://127.0.0.1:20128/v1/chat/completions \   # Chat completion
  -H "Content-Type: application/json" \
  -d '{"model":"free","messages":[{"role":"user","content":"hello"}]}'

# === VERIFY ALL ===
curl -s http://127.0.0.1:20128/v1/models | python -m json.tool  # 9Router
npx codex --version   # Codex
npx cline --version   # Cline
```

---

## TROUBLESHOOTING

### 9Router not responding
```bash
# Kill any existing instances
Get-Process -Name "node" | Where-Object {$_.CommandLine -like "*9router*"} | Stop-Process

# Restart
npx 9router -n -l -t
```

### Cline can't connect to 9Router
```bash
# Verify 9Router is running
curl http://127.0.0.1:20128/v1/models

# Test with direct API
curl http://127.0.0.1:20128/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"free","messages":[{"role":"user","content":"test"}]}'
```

### Codex timeout
```bash
# Use --timeout flag
codex exec -C "path" --timeout 300 "long task"
```

---

## NOTES

- **9Router is the hub** — all agents can use it as their LLM backend
- **No API keys needed** for 9Router models (free tier routing)
- **Hermes is accessible** via `ollama/gpt-oss:120b` or `free` on 9Router
- **Cline uses deepseek** by default via Cline provider — good for code review
- **Codex uses gpt-5.5** via ChatGPT OAuth — best for heavy build tasks
- **All three agents can run simultaneously** without conflicts
- **Profit (opencode) orchestrates** — dispatches tasks, collects results, commits

---

*This is the walking papers. Give them to any new agent and they can set up the full multi-agent system.*
