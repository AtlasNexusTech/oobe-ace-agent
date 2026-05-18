/**
 * Try init pricing_menu via SDK's AgentModule.update() — no manual pricingMenu account.
 * If the on-chain program auto-derives it, this should work.
 *
 * Usage: npx tsx init-pricing-sdk.ts
 */

import { createSapClient } from "@oobe-protocol-labs/synapse-sap-sdk";
import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as dotenv from "dotenv";
import bs58 from "bs58";

dotenv.config();

const OOBE_API_KEY = process.env.OOBE_API_KEY!;
const PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY_BASE58!;
const RPC_URL = `https://us-1-mainnet.oobeprotocol.ai?api_key=${OOBE_API_KEY}`;
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const SAP_PROGRAM_ID = new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");

async function main() {
  const keypair = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
  const wallet = new anchor.Wallet(keypair);
  const client = createSapClient(RPC_URL, wallet);

  const [agentPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sap_agent"), keypair.publicKey.toBuffer()],
    SAP_PROGRAM_ID
  );
  const [pricingMenuPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sap_pricing"), agentPda.toBuffer()],
    SAP_PROGRAM_ID
  );

  console.log("Agent PDA:", agentPda.toBase58());
  console.log("Pricing Menu PDA:", pricingMenuPda.toBase58());

  const solConn = new Connection(SOLANA_RPC, "confirmed");
  const existing = await solConn.getAccountInfo(pricingMenuPda);
  if (existing) {
    console.log(`Already exists (${existing.data.length} bytes)`);
    return;
  }
  console.log("Not found. Calling client.agent.update()...\n");

  const pricingTier = {
    tierId: "standard",
    pricePerCall: new anchor.BN(1_000_000),
    minPricePerCall: null,
    maxPricePerCall: null,
    rateLimit: 60,
    maxCallsPerSession: 1000,
    burstLimit: null,
    tokenType: { sol: {} } as any,
    tokenMint: null,
    tokenDecimals: 9,
    settlementMode: { escrow: {} } as any,
    minEscrowDeposit: new anchor.BN(10_000_000),
    batchIntervalSec: null,
    volumeCurve: null,
  };

  try {
    const sig = await client.agent.update({
      pricing: [pricingTier],
    });
    console.log(`✅ Tx: https://solscan.io/tx/${sig}`);
    const info = await solConn.getAccountInfo(pricingMenuPda);
    console.log(`   Pricing menu: ${info ? info.data.length + ' bytes' : 'NOT CREATED'}`);
  } catch (err: any) {
    console.error(`❌ ${err.message?.substring(0, 250)}`);
    if (err.logs) console.error(`   Logs:`, err.logs.slice(-5));
  }
}

main().catch(console.error);
