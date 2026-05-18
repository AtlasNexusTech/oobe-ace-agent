# 🔮 Atlas Nexus — Autonomous Data Intelligence Agent

**Built for the OOBE × Ace Data Cloud Autonomous Agent Bounty ($2,400 USDC)**

Multi-service autonomous agent registered on **Synapse Agent Protocol (SAP)** and connected to **x402guard** for on-chain spending guardrails.

## Live

🔗 **[atlasnexus.tech](https://atlasnexus.tech)** — Atlas Nexus ecosystem
🔗 **[atlasnexusops.github.io/oobe-ace-agent](https://atlasnexusops.github.io/oobe-ace-agent/)** — Architecture & compliance

---

## What It Does

```
┌─ AtlasNexusScout ────────────────────────────────────┐
│                                                       │
│  SAP Agent Protocol (Solana mainnet)                  │
│  ├── 8 tools published on-chain                       │
│  │   ├── AceDataCloud: search, chat, images           │
│  │   └── Seedance 2.0: t2v, i2v, character, omni, edit│
│  ├── 0.1 SOL staked                                   │
│  └── Status: active                                   │
│                                                       │
│  x402guard (Solana devnet)                            │
│  ├── Vault: Nexus Scout                               │
│  ├── Daily cap: 2 USDC                                │
│  ├── Per-call cap: 0.5 USDC                           │
│  ├── Allowlist: api.acedata.cloud                     │
│  └── MCP tools: balance, history, spend, pay_for_api  │
│                                                       │
└───────────────────────────────────────────────────────┘
```

## Quick Start

```bash
git clone https://github.com/AtlasNexusOps/oobe-ace-agent.git
cd oobe-ace-agent

# Install
npm install

# Configure
cp .env.example .env
# Fill in: OOBE_API_KEY, SOLANA_PRIVATE_KEY_BASE58, ACE_API_KEY

# Run autonomous cycle
npx tsx src/autonomous_workflow.ts
```

## SAP Tools Published

### AceDataCloud (3 tools)
| Tool | Category | Description |
|------|----------|-------------|
| `acedatacloud-search` | Data | Web search with structured results |
| `acedatacloud-chat` | Analytics | GPT-4o-mini intelligence analysis |
| `acedatacloud-images` | Custom | AI image generation |

### Seedance 2.0 (5 tools)
| Tool | Category | Description |
|------|----------|-------------|
| `seedance-t2v` | Custom | Text-to-video generation |
| `seedance-i2v` | Custom | Image-to-video generation |
| `seedance-character` | Custom | 4K character sheet creation |
| `seedance-omni` | Custom | Multi-reference video generation |
| `seedance-edit` | Custom | AI video editing |

All tools published on SAP mainnet (`SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ`), agent PDA `FHTLFvsLijuvknHJSKwjfLGXFCV8a2X1cvMHJUEuTeer`.

## x402guard Integration

x402guard provides Solana-native spending guardrails for AI agents. The vault enforces:
- **Per-call cap** — maximum USDC per API call
- **Daily cap** — maximum USDC per day
- **Endpoint allowlist** — only approved API hosts
- **On-chain enforcement** — every `spend` validated by the Solana program

Connect via MCP:
```json
{
  "mcpServers": {
    "x402guard": {
      "url": "https://x402guard.acedata.cloud/mcp/YOUR_VAULT_TOKEN"
    }
  }
}
```

## Scripts

| Script | Purpose |
|--------|---------|
| `publish-tools.ts` | Publish AceDataCloud tools to SAP |
| `publish-seedance.ts` | Publish Seedance 2.0 tools to SAP |
| `migrate-scout-v2.ts` | Register fresh agent with new wallet |
| `init-pricing-menu.ts` | Initialize pricing_menu PDA (requires SAP v2) |
| `check-agent.ts` | Verify agent PDA on-chain |
| `find-agent.ts` | Discover agent PDA from stake receipt |

## Architecture

```
AtlasNexusScout
├── SAP (Synapse Agent Protocol)
│   ├── Agent identity (on-chain PDA)
│   ├── 8 published x402 tools
│   └── Stake: 0.1 SOL
├── x402guard (Spending Guardrails)
│   ├── Vault with USDC caps
│   ├── MCP integration (4 tools)
│   └── On-chain policy enforcement
├── Ace Services
│   ├── Search, Chat, Images
│   └── x402 micropayments
└── Seedance 2.0
    ├── Text-to-Video, Image-to-Video
    ├── Character consistency
    └── Omni-reference, Video editing
```

## Known Issues

- **SAP pricing_menu**: On-chain v0.10 program requires `pricing_menu` PDA for escrow v2, but no instruction creates it for pre-existing agents. Fixed in SAP v2 (not yet deployed). Workaround: wait for v2 or contact OOBE.
- **x402guard top-up**: USDC devnet top-up flow may require sending directly to vault PDA (not wallet address). Vault PDA: `61WT4bPiN4b6d7SrKXPQPThpcP4q2e16ZYk27Pxwsqod`.

## License

MIT — Atlas Nexus (AtlasNexusOps)

## Built by

🔮 **Atlas Nexus** — autonomous agent infrastructure
Powered by OOBE Protocol × Ace Data Cloud × Seedance 2.0 × x402guard × Solana
