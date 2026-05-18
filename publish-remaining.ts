/**
 * Publish remaining 2 AceDataCloud tools (search, chat).
 * Images already published: 2JDr6Rwa1wL3MZ4gWeQ1TY6k2G6Cqtn1KhxgwHG6yrcg6DgFArj67v5ASwSs33C7jp46XzceCzPsJ6EzoKyXSGp3
 */

import { createSapClient } from "@oobe-protocol-labs/synapse-sap-sdk";
import { Keypair, PublicKey, Transaction, Connection, sendAndConfirmTransaction } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as dotenv from "dotenv";
import bs58 from "bs58";
import { createHash } from "crypto";

dotenv.config();

const OOBE_API_KEY = process.env.OOBE_API_KEY!;
const PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY_BASE58!;
const AGENT_PDA = new PublicKey("FHTLFvsLijuvknHJSKwjfLGXFCV8a2X1cvMHJUEuTeer");
const GLOBAL_REGISTRY = new PublicKey("9odFrYBBZq6UQC6aGyzMPNXWJQn55kMtfigzhLg6S6L5");
const RPC_URL = `https://us-1-mainnet.oobeprotocol.ai?api_key=${OOBE_API_KEY}`;
// Fallback: use public Solana RPC if OOBE RPC is unstable
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

function sha256(data: string): number[] {
  return Array.from(createHash("sha256").update(data).digest());
}

const TOOLS = [
  {
    name: "acedatacloud-search",
    description: "Real-time web search via AceDataCloud — x402 payment required. Returns structured search results for crypto, DeFi, and market intelligence queries.",
    category: 5,  // Data
    inputSchema: { type: "object", properties: { query: { type: "string" }, max_results: { type: "number", default: 5 } }, required: ["query"] },
    outputSchema: { type: "object", properties: { results: { type: "array" } } },
    paramsCount: 2, requiredParams: 1,
  },
  {
    name: "acedatacloud-chat",
    description: "AI-powered intelligence analysis via AceDataCloud Chat (GPT-4o-mini). x402 micropayment per request. Delivers structured analysis with confidence scoring.",
    category: 8,  // Analytics
    inputSchema: { type: "object", properties: { prompt: { type: "string" }, context: { type: "string" } }, required: ["prompt"] },
    outputSchema: { type: "object", properties: { analysis: { type: "string" }, confidence: { type: "number" } } },
    paramsCount: 2, requiredParams: 1,
  },
];

async function main() {
  const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
  const wallet = new anchor.Wallet(keypair);
  const client = createSapClient(RPC_URL, wallet);

  for (const tool of TOOLS) {
    console.log(`📦 Publishing: ${tool.name}...`);
    const inputSchemaStr = JSON.stringify(tool.inputSchema);
    const outputSchemaStr = JSON.stringify(tool.outputSchema);

    const [toolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sap_tool"), AGENT_PDA.toBuffer(), Buffer.from(sha256(tool.name))],
      client.programId
    );

    const ix = await client.tools.publishTool({
      wallet: keypair.publicKey,
      agent: AGENT_PDA,
      tool: toolPda,
      globalRegistry: GLOBAL_REGISTRY,
      signer: keypair,
      toolName: tool.name,
      toolNameHash: sha256(tool.name),
      protocolHash: sha256("x402"),
      descriptionHash: sha256(tool.description),
      inputSchemaHash: sha256(inputSchemaStr),
      outputSchemaHash: sha256(outputSchemaStr),
      httpMethod: 1,  // POST
      category: tool.category,
      paramsCount: tool.paramsCount,
      requiredParams: tool.requiredParams,
      isCompound: false,
    });

    // Use Solana public RPC for reliable send/confirm
    const solConn = new Connection(SOLANA_RPC, "confirmed");
    const { blockhash, lastValidBlockHeight } = await solConn.getLatestBlockhash();
    const tx = new Transaction({ blockhash, lastValidBlockHeight, feePayer: keypair.publicKey }).add(ix);
    
    try {
      const sig = await sendAndConfirmTransaction(solConn, tx, [keypair], {
        commitment: "confirmed",
        skipPreflight: false,
      });
      console.log(`   ✅ Published! Tx: https://solscan.io/tx/${sig}`);
    } catch (err: any) {
      // Check if it actually went through despite ws error
      console.error(`   ⚠️  ${err.message?.substring(0, 80)}`);
    }
    console.log("");
  }
}

main().catch(console.error);
