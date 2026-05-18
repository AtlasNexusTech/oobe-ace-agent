import { Connection, PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { createHash } from "crypto";

dotenv.config();

async function main() {
  const conn = new Connection(`https://us-1-mainnet.oobeprotocol.ai?api_key=${process.env.OOBE_API_KEY}`);
  const dthfm8 = new PublicKey("Dthfm8EFGEMMxS6chRyV12Pr5CMjdBKZ2rCUhNaYNRFs");
  
  const agentDisc = createHash("sha256").update("account:Agent").digest().subarray(0, 8);
  const stakeDisc = createHash("sha256").update("account:StakeReceipt").digest().subarray(0, 8);
  
  console.log("Agent discriminator:", Buffer.from(agentDisc).toString("hex"));
  console.log("StakeReceipt discriminator:", Buffer.from(stakeDisc).toString("hex"));
  
  const info = await conn.getAccountInfo(dthfm8);
  if (info) {
    const disc = Buffer.from(info.data.slice(0, 8)).toString("hex");
    console.log("\nDthfm8 discriminator:", disc);
    console.log("Is Agent?", disc === Buffer.from(agentDisc).toString("hex"));
    console.log("Is StakeReceipt?", disc === Buffer.from(stakeDisc).toString("hex"));
  }
}

main();
