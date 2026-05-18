import { Connection, PublicKey } from "@solana/web3.js";
import * as dotenv from "dotenv";
import { createHash } from "crypto";

dotenv.config();

async function main() {
  const conn = new Connection(`https://us-1-mainnet.oobeprotocol.ai?api_key=${process.env.OOBE_API_KEY}`);
  const programId = new PublicKey("SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ");
  const globalDisc = createHash("sha256").update("account:GlobalRegistry").digest().subarray(0, 8);
  
  // Get ALL program accounts and look for GlobalRegistry discriminator
  const accounts = await conn.getProgramAccounts(programId, {
    filters: [
      { dataSize: 300 }  // approximate, GlobalRegistry might be small
    ]
  });
  
  console.log(`Total program accounts with size ~300: ${accounts.length}`);
  
  const discHex = Buffer.from(globalDisc).toString("hex");
  console.log(`Looking for discriminator: ${discHex}`);
  
  for (const { pubkey, account } of accounts.slice(0, 20)) {
    const disc = Buffer.from(account.data.slice(0, 8)).toString("hex");
    if (disc === discHex) {
      console.log(`\n✅ FOUND GlobalRegistry: ${pubkey.toBase58()}`);
      console.log(`   Size: ${account.data.length} bytes`);
      return;
    }
  }
  console.log("\n❌ No GlobalRegistry found in first 20 accounts");
}

main();
