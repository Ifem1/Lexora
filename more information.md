# More information requested

This document responds to the ruling-path review requested by Joaquin on July 12, 2026.

## Review request

> Please update the ruling path so validators receive the actual claimant statement, respondent statement, and retained evidence, then cryptographically bind that packet to the case and stored commitments. Please also correct the `canRequestRuling` return handling and add a focused test for the complete ruling flow.

## Resolution

All requested changes have been implemented and verified.

### Complete validator packet

The ruling request now supplies validators with:

- The actual claimant statement, rather than its hash.
- The actual respondent statement, rather than its hash.
- The retained evidence records for the case.
- Independently fetched content from eligible HTTPS evidence URLs.
- The case, framework, procedural state, and stored commitment values.

Statements and evidence are retained after their corresponding contract transactions are accepted. The ruling request no longer substitutes hashes for statement text or submits an empty evidence list.

### Cryptographic binding

The ruling packet is protected by two SHA-256 commitments:

1. An evidence commitment is calculated from a canonical, length-prefixed representation of every retained evidence field. Evidence is sorted by evidence ID before hashing.
2. A packet commitment binds the case ID, framework ID, claimant statement, respondent statement, evidence commitment, claim hash, response hash, and evidence root.

The contract independently recomputes and verifies:

- The claimant statement hash against the stored claim commitment.
- The respondent statement hash against the stored response commitment.
- The canonical evidence hash against the stored evidence root.
- The complete packet hash against the supplied packet commitment.
- The case ID and all procedural commitment fields against contract storage.

Any altered statement, evidence field, case identifier, framework, or stored commitment causes the ruling request to be rejected before validator reasoning begins.

### Validator web access

Eligible evidence sources are fetched inside the GenLayer non-deterministic validator function using `gl.nondet.web.request`.

- Only HTTPS sources are accepted.
- Localhost and private-network targets are rejected.
- A ruling is limited to five web sources.
- Each fetched source is limited to 20,000 characters.
- Web content is explicitly treated as untrusted evidence, not as validator instructions.
- Validators independently fetch and assess the cited material under the equivalence principle.

### `canRequestRuling` handling

The frontend now reads the contract's `canRequest` response property correctly. The legacy `result` property remains supported as a compatibility fallback.

### Transaction error handling

The client now examines the leader validator's execution result. A consensus transaction that represents an agreed contract error is surfaced as a failure instead of being displayed as successful merely because its outer receipt reached `ACCEPTED`.

### Injected-wallet support

Writes use the active EIP-1193 provider supplied by wagmi. This supports injected wallets such as Rabby, OKX Wallet, MetaMask, and compatible providers without requiring the MetaMask GenLayer Snap.

## Tests and live verification

Focused automated tests verify that:

- Both plaintext statements are included.
- Retained evidence and its HTTPS source are included.
- Stored claim, response, and evidence commitments are carried into the packet.
- The evidence commitment matches the canonical evidence.
- The complete packet commitment matches all bound fields.
- Modifying retained evidence changes both the evidence and packet commitments.

The TypeScript check and optimized Next.js production build pass.

A live three-wallet Studionet flow also verified:

- Case creation by the claimant.
- Claim submission.
- Response submission by the respondent.
- Evidence commitment submission.
- Rejection of an unauthorized third-wallet evidence submission.
- Rejection of a ruling packet containing tampered evidence.
- Acceptance of the valid committed ruling packet.
- Validator-side HTTPS fetching.
- Issuance of `RULING-000001` for `CASE-000001`.

The valid ruling reached `RULING_ISSUED` with outcome `CLAIMANT_PREVAILS` and confidence `100`. Forty contract-call transactions were executed across the three test wallets. The verified contract state contained 35 cases and one ruling after the load test.

## Deployed contract

The application is wired to the current corrected Studionet contract. The earlier address below is retained only as historical context and must not be used:

`0x8cC87a0fC2ffA4E0360F0a5b38B3B0F7a14D3952` (legacy; do not reuse)
