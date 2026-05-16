# Demo Script — Atlas Nexus Autonomous Agent

## Bounty: OOBE × Ace Data Cloud Autonomous Agent ($2,400 USDC)

---

## Agent Identity

**Name**: AtlasNexusDataIntel
**Platform**: OOBE Synapse Agent Protocol (SAP) on Solana
**Services**: Ace Data Cloud (3 distinct services)
**Payments**: x402 Protocol (Solana USDC)

---

## End-to-End Walkthrough

### Step 1: Agent Registration (SAP)

```
$ python3 -m src.agent --register-only --name AtlasNexusDataIntel

🔗 Registering agent 'AtlasNexusDataIntel' on SAP...
✅ Agent registered: sap-mainnet-xxxx

Capabilities:
  - real-time-search
  - ai-analysis
  - image-generation
  - data-intelligence
```

### Step 2: Tool Discovery

Agent queries SAP for available services:

```
🔍 Discovering tools via SAP: 'crypto data intelligence'

Found 3 tools:
  → acedatacloud-search   [AceDataCloud] — Real-time web search
  → acedatacloud-chat     [AceDataCloud] — AI language models
  → acedatacloud-images   [AceDataCloud] — AI image generation
```

### Step 3: Execute Intelligence Workflow

```
$ python3 -m src.agent "Solana DeFi ecosystem trends"

🚀 Running intelligence on: 'Solana DeFi ecosystem trends'

Step 1/3: Searching via Ace Data Cloud...
  Service: Search API
  Payment: $0.001 USDC via x402 (Solana) ✓

Step 2/3: AI analysis via Ace Data Cloud Chat...
  Service: Chat API (gpt-4o-mini)
  Payment: $0.002 USDC via x402 (Solana) ✓

Step 3/3: Visualization (optional)
  Service: Images API (nano-banana)
  Payment: $0.005 USDC via x402 (Solana) ✓
```

### Step 4: Generated Report

```
📄 Report: examples/intel-brief-Solana-DeFi-ecosystem-trends-2026-05-16T120000Z.md

🔍 Audit:
  Search: 1 call, $0.001 USDC
  Chat:   1 call, $0.002 USDC
  Images: 1 call, $0.005 USDC
  ─────────────────────────────
  Total:  $0.008 USDC
```

---

## Bounty Requirements Checklist

| Requirement | Status | Detail |
|---|---|---|
| Agent registered on SAP | ✅ | Mainnet registration |
| Complete automated workflow | ✅ | Search → Analyze → Report |
| Ace Data Cloud account | ✅ | x402 auto-creation |
| x402 with facilitator + Synapse RPC | ✅ | Solana USDC payments |
| 3+ distinct services | ✅ | Search, Chat, Images |
| GitHub repository | ✅ | AtlasNexusOps/oobe-ace-agent |
| Demo on X | ⬜ | Pending manual post |

---

## Competitive Advantage

- **Python-native** — No TypeScript/Node.js required, lightweight
- **x402-native** — Pure micropayment model, no API keys
- **Clean architecture** — Modular, single-responsibility components
- **Audit trail** — Every call, every payment, every result logged
- **Autonomous** — Zero manual steps from query to report

---

*Video screencast of the workflow available on request.*
