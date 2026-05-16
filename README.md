# 🔮 Atlas Nexus — Autonomous Data Intelligence Agent

**Built for the OOBE × Ace Data Cloud Autonomous Agent Bounty ($2,400 USDC)**

Autonomous agent that discovers tools through **Synapse Agent Protocol**,
executes intelligence workflows across **3 Ace Data Cloud services**,
and pays via **x402** (Solana USDC micropayments).

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

# Run
python3 -m src.agent "Solana DeFi trends"
```

## What It Does

```
User: "Solana DeFi ecosystem trends"
  ↓
Agent registers on SAP → discovers Ace Data Cloud tools
  ↓
1. Search: fetches latest market data  [$0.001 USDC via x402]
2. Chat: AI analysis of results         [$0.002 USDC via x402]
3. Images: visualization (optional)     [$0.005 USDC via x402]
  ↓
Intelligence brief → examples/intel-brief-*.md
```

## Architecture

```
AtlasNexusAgent (orchestrator)
├── SAP Client       → Agent registration, tool discovery
├── Ace Services     → Search, Chat, Images (3 distinct services)
├── x402 Handler     → Solana USDC micropayments
├── Intelligence Engine → Workflow: Search → Analyze → Report
└── Report Generator → Markdown briefs + audit trail
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

## Demo

```bash
# Dry-run (no live API calls)
bash scripts/demo.sh

# Live run
bash scripts/demo.sh "Bitcoin ETF inflows analysis"
```

## License

MIT — Atlas Nexus (AtlasNexusOps)
