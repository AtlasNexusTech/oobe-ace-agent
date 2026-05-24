# Security Policy — oobe-ace-agent

## Private Key Management

**⚠️ Never store private keys in `.env` files in production.**

The agent's private key grants full transaction authority. If the host server is compromised, the key can be extracted regardless of on-chain spending caps (the attacker can drain funds slowly under the daily limit, or perform malicious signatures).

### Recommended: MPC or Off-chain Multisig

For production deployments, upgrade from single-key auth to one of:

1. **MPC (Multi-Party Computation)** — Split the key across independent parties. No single server holds the full key. Providers: Lit Protocol, Fireblocks, Turnkey.

2. **Off-chain Multisig Co-signer** — Require a second service (e.g., a cloud function behind strict IAM) to co-sign every transaction before broadcasting. The co-signer validates payload structure and destination addresses.

3. **HSM / Cloud Secrets Vault** — Store the key in a Hardware Security Module (AWS KMS, GCP Cloud HSM) or a dynamic secrets manager (AWS Secrets Manager, GCP Secret Manager) with:
   - Strict RBAC — only the agent runtime role can access
   - Audit logging — every key access is recorded
   - Automatic rotation — keys expire and rotate on schedule

### Development-only `.env`

For local development only, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

The `.env` file is gitignored. Never commit real keys.

## Secret Scanning

This repo has TruffleHog secret scanning enabled on every push, PR, and weekly schedule (`[.github/workflows/trufflehog.yml](.github/workflows/trufflehog.yml)`).

If a secret is accidentally committed:
1. **Rotate the key immediately** (the commit history is public)
2. Rewrite git history with `git filter-branch` or `bfg`
3. Force-push after confirming the key is revoked

## Reporting a Vulnerability

Email: atlasnexus.ops@proton.me
DO NOT open a public issue for security vulnerabilities.
