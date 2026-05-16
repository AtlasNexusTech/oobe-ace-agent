/**
 * Ace Data Cloud — via Synapse MCP Bridge
 *
 * Connects to Ace Data Cloud services through the Synapse MCP client bridge.
 * All 3 required services: Search, Chat, Images.
 */

import { McpClientBridge } from '@oobe-protocol-labs/synapse-client-sdk/ai/mcp';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

// ─── Connection ────────────────────────────────────────────

export async function connectAceDataCloud(): Promise<McpClientBridge | null> {
  const aceEndpoint = process.env.ACE_MCP_ENDPOINT ||
    'https://platform.acedata.cloud/mcp/sse';

  console.log('☁️  Connecting to Ace Data Cloud via MCP...');

  try {
    const bridge = new McpClientBridge();
    await bridge.connect({
      id: 'acedatacloud',
      name: 'AceDataCloud',
      transport: 'sse',
      url: aceEndpoint,
      toolPrefix: 'ace_',
    });
    console.log('✅ Connected to Ace Data Cloud MCP');
    return bridge;
  } catch (err: any) {
    console.warn(`⚠️  Ace Data Cloud MCP unavailable: ${err.message?.slice(0, 100) || err}`);
    console.warn('   Running in demo mode (services simulated)');
    return null;
  }
}

// ─── Service Tracker ───────────────────────────────────────

export interface ServiceCall {
  service: string;
  calls: number;
  estimatedCostUsdc: number;
}

export class ServiceTracker {
  private _services = new Map<string, ServiceCall>();

  record(service: string, cost: number): void {
    const existing = this._services.get(service);
    if (existing) {
      existing.calls++;
      existing.estimatedCostUsdc += cost;
    } else {
      this._services.set(service, { service, calls: 1, estimatedCostUsdc: cost });
    }
  }

  summary(): ServiceCall[] {
    return Array.from(this._services.values());
  }

  get totalUsdc(): number {
    return this.summary().reduce((sum, s) => sum + s.estimatedCostUsdc, 0);
  }

  get serviceNames(): string[] {
    return this.summary().map(s => s.service);
  }
}

// ─── Ace Data Cloud Services ───────────────────────────────

export class AceDataCloudServices {
  private bridge: McpClientBridge | null;
  tracker: ServiceTracker;

  constructor(bridge: McpClientBridge | null) {
    this.bridge = bridge;
    this.tracker = new ServiceTracker();
  }

  /** Service #1: Search — real-time crypto data */
  async search(query: string): Promise<string> {
    console.log(`🔍 [Service 1/3] Ace Data Cloud Search: "${query}"`);
    this.tracker.record('search', 0.001);

    if (this.bridge) {
      try {
        const result = await this.bridge.callTool('acedatacloud', 'ace_search', {
          query: `crypto ${query} market data latest analysis`,
        });
        return typeof result === 'string' ? result : JSON.stringify(result);
      } catch (err: any) {
        console.warn(`   MCP search failed: ${err.message?.slice(0, 80)}`);
      }
    }

    return this._demoSearch(query);
  }

  /** Service #2: Chat — AI intelligence analysis */
  async analyze(data: string): Promise<string> {
    console.log('🤖 [Service 2/3] Ace Data Cloud Chat: AI analysis');
    this.tracker.record('chat', 0.002);

    if (this.bridge) {
      try {
        const result = await this.bridge.callTool('acedatacloud', 'ace_chat', {
          messages: [
            { role: 'system', content: 'You are an elite crypto intelligence analyst. Be direct, data-driven, actionable.' },
            { role: 'user', content: `Analyze and provide key findings:\n\n${data.slice(0, 3000)}` },
          ],
          maxTokens: 1000,
        });
        return typeof result === 'string' ? result : JSON.stringify(result);
      } catch (err: any) {
        console.warn(`   MCP chat failed: ${err.message?.slice(0, 80)}`);
      }
    }

    return this._demoAnalysis(data);
  }

  /** Service #3: Images — AI visualization */
  async visualize(description: string): Promise<string | null> {
    console.log(`🎨 [Service 3/3] Ace Data Cloud Images: "${description.slice(0, 60)}..."`);
    this.tracker.record('images', 0.005);

    if (this.bridge) {
      try {
        const result = await this.bridge.callTool('acedatacloud', 'ace_images', {
          prompt: description,
          style: 'professional dark theme',
        });
        return typeof result === 'string' ? result : JSON.stringify(result);
      } catch (err: any) {
        console.warn(`   MCP images failed: ${err.message?.slice(0, 80)}`);
      }
    }

    return this._demoImage(description);
  }

  // ─── Demo/fallback implementations ──────────────────────

  private _demoSearch(query: string): string {
    return `[DEMO] Real-time data for "${query}":
- Market sentiment: Bullish (Fear & Greed: 72)
- 24h volume: $2.4B across Solana DEXs
- Top movers: SOL +3.2%, BONK +8.1%, JUP -1.5%
- DeFi TVL: $4.2B (+5.3% 7d)
- Active wallets: 1.2M daily
- Key events: Solana Breakpoint, Firedancer testnet`;
  }

  private _demoAnalysis(data: string): string {
    return `[DEMO] AI Intelligence Analysis:

**Key Findings:**
1. Bullish momentum across Solana ecosystem — SOL showing strong support
2. Meme coin activity elevated (BONK +8.1%) signaling retail interest
3. DeFi TVL growth (+5.3% 7d) indicates increasing on-chain activity
4. Daily active wallets at 1.2M suggests sustained adoption

**Sentiment:** Moderately Bullish (72/100)
**Risk Factors:** Macro uncertainty, potential profit-taking at resistance
**Actionable:** Monitor SOL/BTC pair for alt-season confirmation
**Confidence:** 78%`;
  }

  private _demoImage(description: string): string {
    return `[DEMO] AI visualization generated for: "${description.slice(0, 40)}..."
URL: https://platform.cdn.acedata.cloud/demo/intel-infographic-dark.png
(Requires live Ace Data Cloud account for real generation)`;
  }
}
