/**
 * Scout v2 — Fund agent wallet FIRST, then register.
 * Anchor init deducts PDA rent from the wallet signer, not fee payer.
 *
 * Usage: npx tsx migrate-scout-v2.ts
 */

import { createSapClient } from "@oobe-protocol-labs/synapse-sap-sdk";
import { Keypair, PublicKey, Transaction, Connection, sendAndConfirmTransaction, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import * as dotenv from "dotenv";
import bs58 from "bs58";

dotenv.config();

const OOBE_API_KEY = process.env.OOBE_API_KEY!;
const PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY_BASE58!;
const RPC_URL = `https://us-1-mainnet.oobeprotocol.ai?api_key=${OOBE_API_KEY}`;
const SOLANA_RPC = "https://api.mainnet-beta.solana.com";
const SAP_PROGRAM_ID = new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");
const GLOBAL_REGISTRY = new PublicKey("9odFrYBBZq6UQC6aGyzMPNXWJQn55kMtfigzhLg6S6L5");

async function main() {
  const funder = Keypair.fromSecretKey(bs58.decode(PRIVATE_KEY));
  const solConn = new Connection(SOLANA_RPC, "confirmed");

  const agentWallet = Keypair.generate();
  const agentPubkey = agentWallet.publicKey;

  const [agentPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sap_agent"), agentPubkey.toBuffer()], SAP_PROGRAM_ID
  );
  const [statsPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sap_stats"), agentPda.toBuffer()], SAP_PROGRAM_ID
  );
  const [pricingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sap_pricing"), agentPda.toBuffer()], SAP_PROGRAM_ID
  );

  console.log("=== Scout v2 Registration ===");
  console.log("Agent wallet:", agentPubkey.toBase58());
  console.log("Agent PDA:   ", agentPda.toBase58());
  console.log("Pricing PDA: ", pricingPda.toBase58());

  const funderBal = await solConn.getBalance(funder.publicKey);
  console.log("Funder:      ", (funderBal / 1e9).toFixed(6), "SOL\n");

  const existing = await solConn.getAccountInfo(agentPda);
  if (existing) {
    console.log("❌ Already exists!");
    return;
  }

  // TX 1: Fund agent wallet (0.05 SOL should cover register rent)
  const FUND_AMOUNT = 50_000_000; // 0.05 SOL
  console.log(`TX 1: Funding agent wallet with ${(FUND_AMOUNT / 1e9).toFixed(3)} SOL...`);
  let { blockhash, lastValidBlockHeight } = await solConn.getLatestBlockhash();
  const fundTx = new Transaction({ blockhash, lastValidBlockHeight, feePayer: funder.publicKey })
    .add(SystemProgram.transfer({
      fromPubkey: funder.publicKey,
      toPubkey: agentPubkey,
      lamports: FUND_AMOUNT,
    }));

  try {
    const sig = await sendAndConfirmTransaction(solConn, fundTx, [funder], {
      commitment: "confirmed", skipPreflight: false,
    });
    console.log(`   ✅ Funded: https://solscan.io/tx/${sig}`);
  } catch (err: any) {
    console.error(`   ❌ ${err.message?.substring(0, 200)}`);
    return;
  }

  // TX 2: Register agent (agent wallet pays its own rent)
  console.log("\nTX 2: Registering agent...");
  const client = createSapClient(RPC_URL, new anchor.Wallet(agentWallet));

  const pricingTier = {
    tierId: "standard",
    pricePerCall: new anchor.BN(1_000_000),
    minPricePerCall: null, maxPricePerCall: null,
    rateLimit: 60, maxCallsPerSession: 1000, burstLimit: null,
    tokenType: { sol: {} } as any, tokenMint: null, tokenDecimals: 9,
    settlementMode: { escrow: {} } as any, minEscrowDeposit: new anchor.BN(10_000_000),
    batchIntervalSec: null, volumeCurve: null,
  };

  const registerIx = await (client.program as any).methods
    .registerAgent(
      "Scout",
      "Autonomous market intelligence agent — ATLAS NEXUS by Athenaios",
      [],
      [pricingTier],
      ["x402"],
      "nexus-scout-v2",
      null, null
    )
    .accounts({
      wallet: agentPubkey,
      agent: agentPda,
      agentStats: statsPda,
      globalRegistry: GLOBAL_REGISTRY,
      systemProgram: SystemProgram.programId,
    })
    .instruction();

  ({ blockhash, lastValidBlockHeight } = await solConn.getLatestBlockhash());
  const regTx = new Transaction({ blockhash, lastValidBlockHeight, feePayer: agentPubkey })
    .add(registerIx);

  try {
    const sig2 = await sendAndConfirmTransaction(solConn, regTx, [agentWallet], {
      commitment: "confirmed", skipPreflight: false,
    });
    console.log(`   ✅ Registered: https://solscan.io/tx/${sig2}`);

    const pInfo = await solConn.getAccountInfo(pricingPda);
    console.log(`   Pricing menu: ${pInfo ? '✅ ' + pInfo.data.length + ' bytes' : '❌ NOT CREATED'}`);

    const agentBal = await solConn.getBalance(agentPubkey);
    console.log(`   Remaining: ${(agentBal / 1e9).toFixed(6)} SOL`);
  } catch (err: any) {
    console.error(`   ❌ ${err.message?.substring(0, 300)}`);
    if (err.logs) console.error(`   ${err.logs.slice(-3).join(" | ")}`);
    return;
  }

  console.log(`\n=== SAVE PRIVATE KEY ===`);
  console.log(bs58.encode(agentWallet.secretKey));
}

main().catch(console.error);
