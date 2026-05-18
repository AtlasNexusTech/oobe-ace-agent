import { Connection, PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { createHash } from "crypto";

dotenv.config();

async function main() {
  const conn = new Connection(`https://us-1-mainnet.oobeprotocol.ai?api_key=${process.env.OOBE_API_KEY}`);
  const programId = new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");
  const wallet = new PublicKey("45Y2ShED3GyPQEhfaPq68Z6GAmdDtVh5Qrt9WjCDCadt");
  const agentDisc = createHash("sha256").update("account:AgentAccount").digest().subarray(0, 8);
  const agentDiscHex = Buffer.from(agentDisc).toString("hex");
  
  // Try different seed combinations for AgentAccount PDA
  const seedSets = [
    [Buffer.from("agent"), wallet.toBuffer()],
    [Buffer.from("agent_account"), wallet.toBuffer()],
    [Buffer.from("agent"), wallet.toBuffer(), Buffer.from([255])],
    [Buffer.from("agent"), wallet.toBuffer(), Buffer.from([254])],
    [Buffer.from("agent"), wallet.toBuffer(), Buffer.from([253])],
    [Buffer.from("agent"), wallet.toBuffer(), Buffer.from([252])],
    [Buffer.from("agent"), wallet.toBuffer(), Buffer.from([251])],
    [Buffer.from("agent"), wallet.toBuffer(), Buffer.from([250])],
  ];

  for (const seeds of seedSets) {
    const [pda, bump] = PublicKey.findProgramAddressSync(seeds, programId);
    const info = await conn.getAccountInfo(pda);
    if (info) {
      const disc = Buffer.from(info.data.slice(0, 8)).toString("hex");
      const isAgent = disc === agentDiscHex;
      console.log(`PDA: ${pda.toBase58()} (bump: ${bump}, ${info.data.length}B, ${isAgent ? '✅ AGENT' : '❌ ' + disc})`);
    } else {
      // Only log if we found one
    }
  }
  
  // Also try the exact seeds from the existing AgentStake
  // AgentStake seed = ["agent_stake", agent_pda] so agent_pda is encoded in the stake
  // Let's try to find by checking all agent PDAs
  console.log("\n--- All AgentAccount PDAs for this wallet ---");
  
  // Try all bumps 0-255
  for (let bump = 255; bump >= 0; bump--) {
    const [pda] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent"), wallet.toBuffer(), Buffer.from([bump])],
      programId
    );
    const info = await conn.getAccountInfo(pda);
    if (info) {
      const disc = Buffer.from(info.data.slice(0, 8)).toString("hex");
      const isAgent = disc === agentDiscHex;
      if (isAgent) {
        console.log(`✅ AGENT FOUND: ${pda.toBase58()} (bump: ${bump})`);
        break;
      }
    }
    if (bump % 25 === 0) process.stderr.write(`.`);
  }
}

main();
