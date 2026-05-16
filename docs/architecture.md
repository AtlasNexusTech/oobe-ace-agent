# Architecture — Atlas Nexus Autonomous Agent

## Overview

```
┌──────────────────────────────────────────────────────────┐
│                    AtlasNexusAgent                        │
│                    (Orchestrator)                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │  SAP Client │  │ Ace Services │  │   x402 Payment │  │
│  │  (Synapse)  │  │ (Search/Chat │  │    Handler     │  │
│  │             │  │  /Images)    │  │   (Solana)     │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                │                   │           │
│         ▼                ▼                   ▼           │
│  ┌──────────────────────────────────────────────────┐    │
│  │            Intelligence Engine                    │    │
│  │         Search → Analyze → Report                │    │
│  └────────────────────┬─────────────────────────────┘    │
│                       │                                  │
│                       ▼                                  │
│  ┌──────────────────────────────────────────────────┐    │
│  │            Report Generator                       │    │
│  │      Markdown Brief + Audit Trail                │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Component Design

### 1. Agent Core (`agent.py`)
- `AtlasNexusAgent` — Main orchestrator
- Manages lifecycle: register → discover → execute → report → audit
- CLI entry point for standalone execution

### 2. SAP Integration (`sap.py`)
- Agent registration on Synapse Agent Protocol
- Tool discovery through SAP
- Activity logging for on-chain transparency

### 3. Ace Data Cloud Services (`ace_services.py`)
- **Search** — Real-time web/crypto search
- **Chat** — AI-powered analysis (gpt-4o-mini)
- **Images** — AI visualization generation
- All 3 services used → bounty requirement met

### 4. x402 Payments (`x402_payments.py`)
- Solana USDC micropayments
- Transparent payment tracking
- No API key needed

### 5. Intelligence Engine (`intelligence_engine.py`)
- Orchestrates the workflow: Search → Analyze → (Visualize)
- Clean pipeline, no external dependencies
- Full audit trail per run

### 6. Report Generator (`report_generator.py`)
- Markdown intelligence briefs
- Execution audit trail
- Demo script generator for bounty submission

## Data Flow

```
User Query (natural language)
    │
    ▼
Agent discovers tools via SAP ──────────────────┐
    │                                            │
    ▼                                            │
Search: Ace Data Cloud Search API                │ On-chain
    │  Payment: x402 ($0.001 USDC)              │ (SAP)
    ▼                                            │
Analyze: Ace Data Cloud Chat API                │
    │  Payment: x402 ($0.002 USDC)              │
    ▼                                            │
[Optional] Visualize: Ace Data Cloud Images     │
    │  Payment: x402 ($0.005 USDC)              │
    ▼                                            │
Generate Report (Markdown + audit trail) ◄───────┘
    │
    ▼
Output: intel-brief-{topic}-{timestamp}.md
```

## Payment Flow (x402)

```
Agent → Ace Data Cloud API request
         ↓
    402 Payment Required (with Solana USDC requirement)
         ↓
    x402 handler signs payment envelope
         ↓
    Retry request with X-Payment header
         ↓
    API responds with result
```

## Key Design Decisions

1. **Python-native** — Full Python stack, no Node.js bridge needed
2. **x402-only** — No API keys, pure micropayments via Solana USDC
3. **Clean architecture** — Each module single responsibility
4. **Audit-first** — Every payment and service call logged
5. **SAP fallback** — Agent works in standalone mode if SAP unavailable
