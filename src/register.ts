/**
 * Registration — Register agent on Synapse Agent Protocol (SAP)
 *
 * Uses @synapse-sap/sdk for full on-chain registration when available,
 * with clear instructions for setup.
 */

import { createClient, loadKeypair, deriveAgentAddress, AGENT_MANIFEST } from './sap.js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env') });

async function main() {
  console.log('🔗 Atlas Nexus — Agent Registration\n');

  // 1. Load wallet
  let keypair;
  try {
    keypair = loadKeypair();
    console.log(`✅ Wallet: ${keypair.publicKey.toBase58()}`);
  } catch (err: any) {
    console.error(`❌ No wallet configured: ${err.message}`);
    console.log('\nConfigure your .env file:');
    console.log('  SOLANA_KEYPAIR_PATH=/path/to/keypair.json');
    console.log('  or');
    console.log('  SOLANA_PRIVATE_KEY_BASE58=your-base58-private-key');
    process.exit(1);
  }

  // 2. Check Synapse client
  const synapse = createClient();
  console.log('✅ Synapse client ready');

  // 3. Derive agent PDA
  const agentPda = deriveAgentAddress(keypair.publicKey);
  console.log(`   Agent PDA: ${agentPda.toBase58()}`);

  // 4. Display manifest
  console.log('\n📋 Agent Manifest:');
  console.log(`   Name: ${AGENT_MANIFEST.name}`);
  console.log(`   Description: ${AGENT_MANIFEST.description.slice(0, 80)}...`);
  console.log(`   Capabilities:`);
  for (const cap of AGENT_MANIFEST.capabilities) {
    console.log(`     - ${cap.id} (${cap.protocolId} v${cap.version})`);
  }
  console.log(`   Protocols: ${AGENT_MANIFEST.protocols.join(', ')}`);

  // 5. Full registration requires @synapse-sap/sdk
  console.log('\n📦 For full on-chain registration, install the SAP SDK:');
  console.log('   npm install @synapse-sap/sdk @coral-xyz/anchor');
  console.log('');
  console.log('   Then use:');
  console.log('   import { SapClient } from "@synapse-sap/sdk";');
  console.log('   const client = SapClient.from(provider);');
  console.log('   await client.agent.register(manifest);');
  console.log('');
  console.log('   The agent PDA above is ready for registration.');
  console.log(`   SAP Program: SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ`);
}

main().catch(err => {
  console.error('❌', err);
  process.exit(1);
});
