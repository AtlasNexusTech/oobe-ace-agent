# 🔮 Atlas Nexus — Autonomous Data Intelligence Agent

**Built for the OOBE × Ace Data Cloud Autonomous Agent Bounty ($2,400 USDC)**

Autonomous agent that discovers tools through **Synapse Agent Protocol**,
executes intelligence workflows across **3 Ace Data Cloud services**,
and pays via **x402** (Solana USDC micropayments).

## Live Site

🔗 **[atlasnexusops.github.io/oobe-ace-agent](https://atlasnexusops.github.io/oobe-ace-agent/)** — Architecture, workflow, compliance, demo.

---

## Quick Start

```bash
# Clone
git clone https://github.com/AtlasNexusOps/oobe-ace-agent.git
cd oobe-ace-agent

# Setup
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env — fill in SOLANA_PRIVATE_KEY_BASE58

# Run (single query)
python run_autonomous.py --once --query "Solana DeFi trends"

# Run (autonomous continuous mode — 30min cycles)
python run_autonomous.py

# Run (autonomous + images every 3 cycles)
python run_autonomous.py --image-every 3
```

## Modes

### Single Cycle (`--once`)
```bash
python run_autonomous.py --once --query "Bitcoin whale accumulation"
python run_autonomous.py --once --image  # with AI visualization
```

### Continuous Autonomous (`default`)
```bash
python run_autonomous.py                    # 30min interval
python run_autonomous.py --interval 900     # 15min interval
python run_autonomous.py --image-every 1    # image every cycle
```

Press `Ctrl+C` for graceful shutdown — saves state to `examples/agent_state.json`.

## What It Does

```
┌─ Cycle every N minutes ─────────────────────────────┐
│                                                       │
│  1. Select intelligence query (14-topic crypto pool)  │
│  2. Discover tools via SAP                            │
│  3. Search → Ace Data Cloud Search  [$0.001 USDC]     │
│  4. Analyze → Ace Data Cloud Chat   [$0.002 USDC]     │
│  5. Visualize → Ace Data Cloud Images (every 3rd)     │
│  6. Log activity on SAP (on-chain audit)              │
│  7. Generate Markdown intelligence brief              │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## Architecture

```
AtlasNexusScout (autonomous orchestrator)
├── SAP Client          → Agent registration, tool discovery, activity log
├── Ace Services        → Search, Chat, Images (3 distinct services)
├── x402 Handler        → Solana USDC micropayments (graceful dry-run)
├── Intelligence Engine → Workflow: Search → Analyze → Visualize
├── Report Generator    → Markdown briefs + full audit trail
└── Query Pool          → 14 crypto topics, cooldown-aware selection
```

See [docs/architecture.md](docs/architecture.md) for full design.

## Bounty Compliance

| Requirement | Status |
|---|---|
| Agent registered on SAP | ✅ |
| Complete automated workflow | ✅ |
| Ace Data Cloud account | ✅ (x402 auto) |
| x402 + Synapse RPC | ✅ |
| 3+ distinct services | ✅ Search, Chat, Images |
| GitHub repo | ✅ |
| Demo on X | ⬜ Pending |
| **Autonomous continuous execution** | ✅ `run_autonomous.py` |

## Dry-Run Mode

If `SOLANA_PRIVATE_KEY_BASE58` is not set, the agent runs in **dry-run mode**:
- SAP tool discovery uses fallback service list
- x402 payments are skipped
- Cycle logging still works
- Perfect for testing the workflow without spending USDC

## CLI Reference

```
python run_autonomous.py [OPTIONS]

Options:
  --interval N      Seconds between cycles (default: 1800 = 30min)
  --once            Run a single cycle and exit
  --query TEXT      Specific query for single-cycle mode
  --image           Generate AI visualization (adds cost)
  --wallet ADDRESS  Solana wallet for SAP registration
  --image-every N   Generate image every N cycles (default: 3)
```

## Tech Stack

- **Runtime**: Python ≥ 3.10
- **Blockchain**: Solana via x402 + Synapse RPC
- **Services**: Ace Data Cloud (Search, Chat, Images)

## License

MIT — Atlas Nexus (AtlasNexusOps)

## Built by

🔮 **Atlas Nexus** — autonomous agent infrastructure
Powered by OOBE Protocol Synapse × Ace Data Cloud × x402 × Solana
