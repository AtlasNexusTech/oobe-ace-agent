/**
 * Publish 1 seedance tool as test, then remaining 4 if successful.
 * Usage: npx tsx publish-seedance-test.ts
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
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

function sha256(data: string): number[] {
  return Array.from(createHash("sha256").update(data).digest());
}

const tool = {
  name: "seedance-t2v",
  description:
    "AI text-to-video generation via Seedance 2.0 (ByteDance). x402 payment required. Generates cinematic video from natural language prompt. Supports aspect ratio, duration, and quality controls.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: { type: "string", description: "Video description prompt" },
      aspect_ratio: { type: "string", default: "16:9", enum: ["16:9", "9:16", "4:3", "3:4"] },
      duration: { type: "number", default: 5 },
      quality: { type: "string", default: "high", enum: ["basic", "high"] },
    },
    required: ["prompt"],
  },
  outputSchema: {
    type: "object",
    properties: {
      video_url: { type: "string" },
      request_id: { type: "string" },
    },
  },
  paramsCount: 4,
  requiredParams: 1,
};

async function main() {
  const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
  const wallet = new anchor.Wallet(keypair);

  console.log(`🧪 Test: publishing seedance-t2v only`);
  console.log(`   Wallet: ${keypair.publicKey.toBase58()}`);
  console.log(`   Agent: ${AGENT_PDA.toBase58()}`);

  const client = createSapClient(RPC_URL, wallet);
  const inputSchemaStr = JSON.stringify(tool.inputSchema);
  const outputSchemaStr = JSON.stringify(tool.outputSchema);

  const [toolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sap_tool"), AGENT_PDA.toBuffer(), Buffer.from(sha256(tool.name))],
    client.programId
  );
  console.log(`   Tool PDA: ${toolPda.toBase58()}`);

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
    httpMethod: 1,
    category: 9,
    paramsCount: tool.paramsCount,
    requiredParams: tool.requiredParams,
    isCompound: false,
  });

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
    console.error(`   ❌ Failed: ${err.message?.substring(0, 200)}`);
    if (err.logs) console.error(`   Logs: ${err.logs.slice(-5).join(" | ")}`);
  }
}

main().catch(console.error);
