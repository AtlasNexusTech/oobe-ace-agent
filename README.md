# 🔮 Atlas Nexus — Autonomous Data Intelligence Agent

**Built for the OOBE × Ace Data Cloud Autonomous Agent Bounty ($2,400 USDC)**

TypeScript/Node.js autonomous agent that:
- Registers on **Synapse Agent Protocol (SAP)** mainnet
- Publishes tools on-chain with JSON schemas
- Executes workflows across **3 Ace Data Cloud services** via Synapse MCP
- Pays via **x402** micropayments (Solana USDC)

## Quick Start

```bash
git clone https://github.com/AtlasNexusOps/oobe-ace-agent.git
cd oobe-ace-agent

npm install
cp .env.example .env
# Edit .env — fill in OOBE_API_KEY + SOLANA key

# Register agent on SAP + publish tools
npm run register

# Run end-to-end demo
npm run demo

# Run intelligence on any topic
npm start "Bitcoin ETF flows analysis"
```

## Architecture

```
AtlasNexusAgent (TypeScript)
├── SAP Integration    → Agent registration, tool publishing, escrow
├── Ace Data Cloud     → Search, Chat, Images (via Synapse MCP Bridge)
├── x402 Payments      → EscrowV2 + settlement via SAP SDK
├── Workflow Engine    → Search → Analyze → Visualize → Report
└── Report Generator   → Markdown briefs + audit trail
```

## Bounty Compliance

| Requirement | Status |
|---|---|
| Agent registered on SAP | ✅ `SapClient.agent.register()` |
| Complete automated workflow | ✅ Search → Analyze → Visualize → Report |
| Ace Data Cloud account | ✅ Via x402 auto-creation |
| x402 + Synapse RPC | ✅ Via `SapClient.escrowV2` |
| 3+ distinct services | ✅ Search, Chat, Images |
| GitHub repo | ✅ |
| Demo on X | ⬜ Pending |

## Demo

```bash
npm run demo "Solana DeFi trends"
```

## Tech Stack

- **Runtime**: Node.js ≥ 18, TypeScript ≥ 5.0
- **SDK**: `@oobe-protocol-labs/synapse-client-sdk` v2.0.6
- **SAP**: `@synapse-sap/sdk`
- **Blockchain**: Solana mainnet via Anchor v0.30

## License

MIT — Atlas Nexus (AtlasNexusOps)

## Live Site

🔗 **[atlasnexusops.github.io/oobe-ace-agent](https://atlasnexusops.github.io/oobe-ace-agent/)** — Architecture, workflow, compliance, demo.
