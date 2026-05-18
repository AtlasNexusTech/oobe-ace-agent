/**
 * Publish 5 Seedance 2.0 tools for AtlasNexusScout on SAP mainnet.
 *
 * ToolCategory: Custom=9 (AI video generation)
 * ToolHttpMethod: Post=1
 *
 * Usage: npx tsx publish-seedance.ts --dry-run   (preview)
 *        npx tsx publish-seedance.ts              (execute)
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

const CATEGORY = { Custom: 9 } as const;
const METHOD = { Post: 1 } as const;

function sha256(data: string): number[] {
  return Array.from(createHash("sha256").update(data).digest());
}

interface ToolDef {
  name: string;
  description: string;
  inputSchema: object;
  outputSchema: object;
  paramsCount: number;
  requiredParams: number;
}

const TOOLS: ToolDef[] = [
  {
    name: "seedance-t2v",
    description:
      "AI text-to-video generation via Seedance 2.0 (ByteDance). x402 payment required. Generates cinematic video from natural language prompt. Supports aspect ratio, duration, and quality controls.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Video description prompt" },
        aspect_ratio: { type: "string", default: "16:9", enum: ["16:9", "9:16", "4:3", "3:4"] },
        duration: { type: "number", default: 5, description: "Video duration in seconds" },
        quality: { type: "string", default: "high", enum: ["basic", "high"] },
      },
      required: ["prompt"],
    },
    outputSchema: {
      type: "object",
      properties: {
        video_url: { type: "string", description: "Generated video URL" },
        request_id: { type: "string" },
        duration: { type: "number" },
      },
    },
    paramsCount: 4,
    requiredParams: 1,
  },
  {
    name: "seedance-i2v",
    description:
      "AI image-to-video generation via Seedance 2.0 (ByteDance). x402 payment required. Animates static images into video with prompt guidance. Reference images via @image1, @image2 in prompt.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Animation prompt, reference images with @image1, @image2" },
        image_urls: {
          type: "array",
          items: { type: "string" },
          description: "Source image URLs to animate",
        },
        aspect_ratio: { type: "string", default: "16:9" },
        duration: { type: "number", default: 5 },
        quality: { type: "string", default: "high", enum: ["basic", "high"] },
      },
      required: ["prompt", "image_urls"],
    },
    outputSchema: {
      type: "object",
      properties: {
        video_url: { type: "string" },
        request_id: { type: "string" },
      },
    },
    paramsCount: 5,
    requiredParams: 2,
  },
  {
    name: "seedance-character",
    description:
      "AI character sheet creation via Seedance 2.0 (ByteDance). x402 payment required ($0.18/sheet). Generates 4K character reference sheet from 1-3 photos for consistent character appearance across video generations.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Character outfit/style description" },
        image_urls: {
          type: "array",
          items: { type: "string" },
          description: "1-3 reference photos of the character",
          maxItems: 3,
          minItems: 1,
        },
      },
      required: ["prompt", "image_urls"],
    },
    outputSchema: {
      type: "object",
      properties: {
        character_id: { type: "string", description: "Character ID for use in @character:<id>" },
        sheet_url: { type: "string", description: "4K character sheet image URL" },
      },
    },
    paramsCount: 2,
    requiredParams: 2,
  },
  {
    name: "seedance-omni",
    description:
      "AI omni-reference video generation via Seedance 2.0 (ByteDance). x402 payment required. Generates video conditioned on any mix of images, videos, and audio for maximum creative control.",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Generation prompt" },
        image_urls: {
          type: "array",
          items: { type: "string" },
          description: "Reference image URLs",
        },
        video_urls: {
          type: "array",
          items: { type: "string" },
          description: "Reference video URLs",
        },
        audio_urls: {
          type: "array",
          items: { type: "string" },
          description: "Reference audio URLs",
        },
        aspect_ratio: { type: "string", default: "16:9" },
        duration: { type: "number", default: 5 },
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
    paramsCount: 6,
    requiredParams: 1,
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
        image_urls: {
          type: "array",
          items: { type: "string" },
          description: "Optional reference images for edit guidance",
        },
      },
      required: ["prompt", "video_url"],
    },
    outputSchema: {
      type: "object",
      properties: {
        edited_video_url: { type: "string" },
        request_id: { type: "string" },
      },
    },
    paramsCount: 3,
    requiredParams: 2,
  },
];

const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  if (!PRIVATE_KEY) throw new Error("SOLANA_PRIVATE_KEY_BASE58 not set in .env");
  if (!OOBE_API_KEY) throw new Error("OOBE_API_KEY not set in .env");

  const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
  const wallet = new anchor.Wallet(keypair);

  console.log(`🎬 AtlasNexusScout — Publishing ${TOOLS.length} Seedance 2.0 tools`);
  console.log(`   Wallet: ${keypair.publicKey.toBase58()}`);
  console.log(`   Agent PDA: ${AGENT_PDA.toBase58()}`);
  if (DRY_RUN) console.log(`   ⚠️  DRY RUN — no transactions`);
  console.log("");

  const client = createSapClient(RPC_URL, wallet);

  for (const tool of TOOLS) {
    console.log(`📦 Publishing: ${tool.name}...`);

    const inputSchemaStr = JSON.stringify(tool.inputSchema);
    const outputSchemaStr = JSON.stringify(tool.outputSchema);

    const [toolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("sap_tool"), AGENT_PDA.toBuffer(), Buffer.from(sha256(tool.name))],
      client.programId
    );

    console.log(`   Tool PDA: ${toolPda.toBase58()}`);
    console.log(`   Category: Custom(9), Method: POST`);

    if (DRY_RUN) {
      console.log(`   ⏭️  Skipped (dry-run)`);
      console.log("");
      continue;
    }

    try {
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
        httpMethod: METHOD.Post,
        category: CATEGORY.Custom,
        paramsCount: tool.paramsCount,
        requiredParams: tool.requiredParams,
        isCompound: false,
      });

      const solConn = new Connection(SOLANA_RPC, "confirmed");
      const { blockhash, lastValidBlockHeight } = await solConn.getLatestBlockhash();
      const tx = new Transaction({
        blockhash,
        lastValidBlockHeight,
        feePayer: keypair.publicKey,
      }).add(ix);

      const sig = await sendAndConfirmTransaction(solConn, tx, [keypair], {
        commitment: "confirmed",
        skipPreflight: false,
      });

      console.log(`   ✅ Published!`);
      console.log(`   Tx: https://solscan.io/tx/${sig}`);
      console.log("");
    } catch (err: any) {
      const msg = err.message || String(err);
      console.error(`   ❌ Failed: ${msg.substring(0, 120)}`);
      if (err.logs) {
        console.error(`   Logs: ${err.logs.slice(-3).join(" | ")}`);
      }
      console.log("");
    }
  }

  console.log(
    `✅ ${DRY_RUN ? "Dry run complete" : "Done!"}`
  );
}

main().catch(console.error);
