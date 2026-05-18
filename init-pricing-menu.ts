/**
 * Initialize pricing_menu for Scout via agent.updateAgent() instruction builder.
 * Properly uses the SDK's instruction builder + manual transaction send.
 *
 * Usage: npx tsx init-pricing-menu.ts
 */

import { createSapClient } from "@oobe-protocol-labs/synapse-sap-sdk";
import { Keypair, PublicKey, Transaction, Connection, sendAndConfirmTransaction } from "@solana/web3.js";
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

  const [agentPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sap_agent"), keypair.publicKey.toBuffer()],
    SAP_PROGRAM_ID
  );
  const [pricingMenuPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sap_pricing"), agentPda.toBuffer()],
    SAP_PROGRAM_ID
  );

  console.log("Agent:  ", agentPda.toBase58());
  console.log("Pricing:", pricingMenuPda.toBase58());
  console.log("Wallet: ", keypair.publicKey.toBase58());

  const solConn = new Connection(SOLANA_RPC, "confirmed");
  const existing = await solConn.getAccountInfo(pricingMenuPda);
  if (existing) {
    console.log(`\n⚠️  Already exists (${existing.data.length} bytes)`);
    return;
  }

  console.log("\nCreating pricing_menu via update_agent...\n");

  const client = createSapClient(RPC_URL, wallet);

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

  // Use the raw instruction builder (returns TransactionInstruction)
  const ix = await client.agent.updateAgent({
    signer: keypair,
    wallet: keypair.publicKey,
    agent: agentPda,
    pricingMenu: pricingMenuPda,
    name: null,
    description: null,
    capabilities: null,
    pricing: [pricingTier],
    protocols: null,
    agentId: null,
    agentUri: null,
    x402Endpoint: null,
  });

  const { blockhash, lastValidBlockHeight } = await solConn.getLatestBlockhash();
  const tx = new Transaction({ blockhash, lastValidBlockHeight, feePayer: keypair.publicKey }).add(ix);

  try {
    const sig = await sendAndConfirmTransaction(solConn, tx, [keypair], {
      commitment: "confirmed",
      skipPreflight: false,
    });
    console.log(`✅ Created!`);
    console.log(`   Tx: https://solscan.io/tx/${sig}`);

    const info = await solConn.getAccountInfo(pricingMenuPda);
    console.log(`   Pricing menu: ${info?.data.length} bytes`);
  } catch (err: any) {
    console.error(`❌ ${err.message?.substring(0, 300)}`);
    if (err.logs) {
      console.error(`   Logs: ${err.logs.slice(-5).join(" | ")}`);
    }
  }
}

main().catch(console.error);
