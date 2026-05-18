/**
 * Publish remaining 4 Seedance tools (t2v already done).
 * Usage: npx tsx publish-seedance-batch.ts
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

const TOOLS = [
  {
    name: "seedance-i2v",
    description:
      "AI image-to-video generation via Seedance 2.0 (ByteDance). x402 payment required. Animates static images into video with prompt guidance. Reference images via @image1, @image2 in prompt.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Animation prompt, reference images with @image1, @image2" },
        image_urls: { type: "array", items: { type: "string" }, description: "Source image URLs to animate" },
        aspect_ratio: { type: "string", default: "16:9" },
        duration: { type: "number", default: 5 },
        quality: { type: "string", default: "high", enum: ["basic", "high"] },
      },
      required: ["prompt", "image_urls"],
    },
    outputSchema: { type: "object", properties: { video_url: { type: "string" }, request_id: { type: "string" } } },
    paramsCount: 5, requiredParams: 2,
  },
  {
    name: "seedance-character",
    description:
      "AI character sheet creation via Seedance 2.0 (ByteDance). x402 payment required ($0.18/sheet). Generates 4K character reference sheet from 1-3 photos for consistent character appearance across video generations.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Character outfit/style description" },
        image_urls: { type: "array", items: { type: "string" }, description: "1-3 reference photos", maxItems: 3, minItems: 1 },
      },
      required: ["prompt", "image_urls"],
    },
    outputSchema: { type: "object", properties: { character_id: { type: "string" }, sheet_url: { type: "string" } } },
    paramsCount: 2, requiredParams: 2,
  },
  {
    name: "seedance-omni",
    description:
      "AI omni-reference video generation via Seedance 2.0 (ByteDance). x402 payment required. Generates video conditioned on any mix of images, videos, and audio for maximum creative control.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string" },
        image_urls: { type: "array", items: { type: "string" } },
        video_urls: { type: "array", items: { type: "string" } },
        audio_urls: { type: "array", items: { type: "string" } },
        aspect_ratio: { type: "string", default: "16:9" },
        duration: { type: "number", default: 5 },
      },
      required: ["prompt"],
    },
    outputSchema: { type: "object", properties: { video_url: { type: "string" }, request_id: { type: "string" } } },
    paramsCount: 6, requiredParams: 1,
  },
  {
    name: "seedance-edit",
    description:
      "AI video editing via Seedance 2.0 (ByteDance). x402 payment required. Edit existing videos using natural language prompts and reference images for transformations, style transfer, and enhancements.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Edit instruction" },
        video_url: { type: "string", description: "Source video URL to edit" },
        image_urls: { type: "array", items: { type: "string" }, description: "Optional reference images" },
      },
      required: ["prompt", "video_url"],
    },
    outputSchema: { type: "object", properties: { edited_video_url: { type: "string" }, request_id: { type: "string" } } },
    paramsCount: 3, requiredParams: 2,
  },
];

async function main() {
  const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
  const wallet = new anchor.Wallet(keypair);
  const client = createSapClient(RPC_URL, wallet);

  for (const tool of TOOLS) {
    console.log(`📦 ${tool.name}...`);
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
      const sig = await sendAndConfirmTransaction(solConn, tx, [keypair], { commitment: "confirmed", skipPreflight: false });
      console.log(`   ✅ https://solscan.io/tx/${sig.substring(0, 20)}...`);
    } catch (err: any) {
      console.error(`   ❌ ${err.message?.substring(0, 100)}`);
    }
    console.log("");
  }
  console.log("✅ Done");
}

main().catch(console.error);
