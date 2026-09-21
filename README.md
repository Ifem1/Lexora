# Lexora — Agreement-Bound Arbitration on GenLayer

Lexora is an experimental GenLayer arbitration application built around **bilateral opt-in, native GEN escrow, validator-side evidence retrieval, one application-level appeal, and deterministic financial bounds**.

This branch is the appeal upgrade. It is intentionally **not documented as deployed or live-verified yet**. The rebuilt contract must still pass local GenVM/Direct Mode checks, Studio execution, deployment, and live transfer verification before a new contract address is published.

## Safety

Lexora is experimental software, not legal advice, a court, or a substitute for qualified counsel. AI-assisted rulings may be wrong. Legal enforceability depends on the parties' agreement and applicable law.

The application also does not treat a transaction hash, `ACCEPTED`, or `FINALIZED` alone as proof of successful contract execution. Frontend write flows wait for a receipt, inspect the GenVM execution result, then reread authoritative contract state.

## Trust Loop

```text
agreement proposal
→ exact bilateral acceptance
→ native GEN escrow funding
→ ACTIVE agreement
→ agreement-bound dispute
→ immutable evidence registry
→ EVIDENCE_LOCKED
→ validator-side public-web retrieval
→ initial closed-schema ruling
→ one application-level appeal OR appeal-window expiry
→ final ruling
→ deterministic settlement accounting
→ claimable/refundable GEN
→ live-verified outward transfer
```

A new appeal-ready dispute cannot bypass this loop. The legacy `create_case`, replaceable `submit_evidence`, direct `accept_ruling`, and `mark_settled` write paths are disabled for new execution.

## Contract Architecture

### Bilateral agreement

`propose_agreement` freezes:

- creator, counterparty and designated funder
- framework ID/version
- description, obligation, acceptance-criteria and evidence-rule commitments
- permitted remedies
- maximum exposure and required funding
- acceptance, performance and dispute windows

Only the named counterparty can accept the exact stored version/commitment. `NO_ACTION` must remain an allowed fallback for insufficient-evidence or procedural outcomes.

### Native GEN escrow

`deposit_escrow` is payable and credits escrow exclusively from native GEN attached to the transaction. The caller does not provide a deposit amount argument.

Accounting buckets are exclusive:

```text
AVAILABLE → RESERVED → CLAIMABLE → PAID
RESERVED → AVAILABLE
AVAILABLE → REFUNDABLE → REFUNDED
```

The contract checks:

```text
total_deposited
= available + reserved + claimable + refundable + paid + refunded
```

Funding supports partial top-ups up to the frozen required funding and rejects zero value, unauthorized funders, and overfunding. Exact required funding activates an accepted agreement.

### Agreement-bound disputes and reservation

`open_dispute` requires an `ACTIVE` agreement and derives claimant/respondent eligibility from the accepted parties. One unresolved monetary dispute per agreement is used in this version.

Opening a dispute moves the deterministic spendable cap from `AVAILABLE` to `RESERVED`; the same value cannot be spent by another unresolved dispute.

### Immutable evidence and lock

Agreement disputes use `submit_evidence_record`, not a replaceable case-level root. Records retain:

- evidence ID and dispute ID
- submitter
- evidence class/type
- source URL where applicable
- description/relevance claim
- commitment
- submission time
- retrieval status and observed digest
- original-vs-appeal classification

Original evidence transitions from `EVIDENCE_OPEN` to `EVIDENCE_LOCKED`. Appeal evidence is appended to a separate registry and does not mutate the original evidence root or initial ruling.

### Validator-side web retrieval

Public web evidence remains validator-retrieved with `gl.nondet.web.request`. The ruling path records structured retrieval states including fetched, empty, truncated, unavailable, and content mismatch.

Retrieved pages are treated as untrusted data. They are not allowed to redefine arbitration instructions, permitted remedies, payout recipient, maximum exposure, or the validator task. Failed/empty/mismatched retrieval is explicitly instructed not to support the submitting party.

### Closed rulings and bounded economics

Initial outcomes are closed to:

- `CLAIMANT_PREVAILS`
- `RESPONDENT_PREVAILS`
- `PARTIAL`
- `INSUFFICIENT_EVIDENCE`
- `PROCEDURAL_FAILURE`

The AI may supply a liability percentage in basis points, but the contract deterministically clamps it to `0..10000` and computes the monetary award against the minimum of:

- agreement maximum exposure
- dispute reservation
- current reserved escrow

The model cannot choose a recipient, arbitrary transfer amount, new remedy type, or balance.

### One application-level appeal

The application appeal window is 72 hours after the initial ruling in this implementation. Exactly one appeal may use one of these closed grounds:

- `MATERIAL_NEW_EVIDENCE`
- `EVIDENCE_RETRIEVAL_FAILURE`
- `MATERIAL_CONTRADICTION`
- `PROCEDURAL_ERROR`
- `MATERIAL_AGREEMENT_MISAPPLICATION`
- `MATERIAL_REMEDY_MISCALCULATION`

The original ruling remains stored separately. A revised appeal ruling is clamped to the same original economic bounds.

### Settlement

Settlement cannot be prepared until there is a final application ruling: either an appeal has completed or the application appeal window has expired.

For a final monetary award:

```text
RESERVED → CLAIMABLE
unused RESERVED → AVAILABLE
```

For a zero award, the settlement can be finalized without an outbound transfer.

**Runtime handoff:** the branch intentionally does not mark monetary value `PAID` or `REFUNDED` yet. Current GenLayer supports outward GEN transfers, but this GitHub-only phase does not prove the complete finalized-success callback/confirmation path needed to update those historical buckets safely. `execute_claimable_payout` and `execute_funder_refund` therefore remain guarded until Codex verifies and wires the smallest safe live-runtime completion path.

## Frontend Flow

The upgraded UI routes new activity through:

```text
/app/agreements/new
→ /app/agreements/[id]
   review / accept / fund / open dispute
→ /app/cases/[id]
   claim / response / ruling
→ /app/cases/[id]/lifecycle
   immutable evidence / lock / appeal / finality / settlement
```

The old `/app/cases/new` route redirects to agreement creation.

The frontend reads the rebuilt contract address from configuration; there is no hardcoded replacement deployment.

## Environment

Copy `.env.example` to `.env.local` after a genuine rebuilt deployment exists:

```bash
cp .env.example .env.local
```

Required deployment configuration:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_CHAIN_ID=61999
NEXT_PUBLIC_DEV_MODE=true
```

Leave `NEXT_PUBLIC_CONTRACT_ADDRESS` blank until Codex deploys and verifies the rebuilt contract. The frontend will fail closed instead of silently using an old address.

## Development

Frontend:

```bash
npm install
npm run test
npm run lint
npm run build
```

GenLayer Direct Mode:

```bash
pytest tests/direct/ -v
```

Recommended local contract checks before deployment:

```bash
genvm-lint check contracts/LexoraArbitration.py
pytest tests/direct/ -v
```

Network/Studio verification must separately prove:

- payable GEN deposits with real transaction receipts
- web retrieval and multi-validator consensus behavior
- transaction execution success rather than status alone
- appeal timing/finality under the target network
- outward claimable payout and funder refund success semantics
- exact `CLAIMABLE → PAID` and `REFUNDABLE → REFUNDED` bookkeeping only after transfer success

## Key Files

```text
contracts/LexoraArbitration.py
tests/direct/test_lexora_agreements.py
tests/direct/test_lexora_finality.py
src/lib/genlayer/client.ts
src/lib/genlayer/types.ts
src/lib/genlayer/arbitrationMapper.ts
src/hooks/useContract.ts
src/app/app/agreements/new/page.tsx
src/app/app/agreements/[id]/page.tsx
src/app/app/cases/[id]/page.tsx
src/app/app/cases/[id]/lifecycle/page.tsx
```

## Deployment Status

No new canonical appeal-upgrade contract address is published in this branch.

Do not reuse the old deployment address for this rebuilt state model. After Codex completes local GenVM checks, Studio deployment, and live verification, set the genuine address in `NEXT_PUBLIC_CONTRACT_ADDRESS` and document the deployment transaction/source commit together.
