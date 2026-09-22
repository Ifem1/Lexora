# Live verification

## Scope

This record covers the latest existing Studionet deployment. No architecture change or redeployment was performed for this verification run.

- Network: GenLayer Studionet (`61999`)
- Contract: `0xC3F43D4C691ABcbd014836Cd29AD1D10f04c623A`
- Deployment transaction: `0x63e6dd8c8efa71570f7b277a93ec18bb7fa00a3a02e60a52d1e6107f660067f5`
- Wallet A: `0x6eae29dcdf56510481be0dc166dd449b3b39c822`
- Wallet B: `0x080fc397e0483a468ce538cb4df7f867bf672987`

## Verified transactions

The following two-wallet agreement smoke test completed successfully with GenVM execution success and the resulting state was read back from the deployed contract:

- Agreement: `LEXORA-VERIFY-1790066869`
- Proposal: `0xcb43e18b94267c4bd45549b8e20c60e72ae6f14a6c54816d6e652a7771db6dd6`
- Acceptance: `0x42763672a96881e0df5462adf3a0264927f3d901dc182432ab7abcc2b13145a4`
- Resulting state: `ACCEPTED_PENDING_FUNDING`
- Frozen commitment: `0x9b2c8b8a0156139510111257a99a97c2767e1482f76d1a69739e990af8dbcda8`

The same agreement was then funded and disputed:

- Payable deposit: `0x328f849119c629c2ba2d94a6f62885c729281f5efb698c066d0c092e14320e82`
- Escrow after deposit: `totalDeposited=1 GEN`, `available=1 GEN`, all other buckets zero
- Dispute open: `0x58d1def3039883af745f3e8ee0be1cf80fde5009f2fd7f361077929a49fe29f5`
- Dispute: `CASE-000001`
- Claim: `0xe6dcf4f517bcfab752ee74481c1337b5b28c481a9bda1cf41c65c57f24ce77b2`
- Response: `0xe30d6598f32a27b2dca47fc70ba20c397423fafdce0294f163fe9a1c55784106`
- Public evidence: `0xba47f989e925fcff8c4fe2e050e0b4f856a49ea853559d0aa0cc4947cd7c322b`
- Respondent evidence: `0x33451a3ba01ccfd99085f0cf27f105585f505d3bf7dead8910496d1c61431dd2`
- Evidence lock: `0x259e8c16f68426e80ad8cbc8e5734c4c2877ea0a18c399a4d5127ae7ad1acad5`
- Locked evidence root: `0x33847d01dda23bb9c0ae3abb3179febceac34bc8a6d065514a3f4de80975bf2f`

## Remaining live path

The payable deposit was submitted directly through `genlayer-js` with a native `value` of `1 GEN`; no fake funding or synthetic state transition was used. A ruling was not requested for this case because the smoke-test claim commitments were deliberately simple labels rather than SHA-256 commitments of retained statements, and the contract correctly rejects a packet that cannot prove those bindings. Appeal and settlement therefore remain unclaimed for this agreement.

## Follow-up attempt

- Bad smoke-test cancellation: `0x91836c50a01b85c26d7836295446993fea447cc1db7b26ee9bb19a9e4d8482`
- Replacement dispute: `CASE-000002`, transaction `0x76bbf2e128f3977acf1439637ad255bc7ce66137d0ae7fcab5341c7cd65a2e83`
- Claim commitment: `0x7f5dc3b71655b44d9496a00f7f433b3f812c5623f8ac3fe8130979f874376151`
- Response commitment: `0xb0f56c0cd5221bd93f94480d5163c501cabd1228c833b36020161f38e26b8a45`
- Direct-SDK claim: `0x5beedab0dc3002c74de13b21807e94382c1b8a233bb661beabaec89e6cdf0e8c`
- Direct-SDK response: `0xc307178a938b6ddd8ccac14aad7dee3f9522e6d31745af81c36b93cd3ff2579e`
- Public evidence: `0x28ce0cd9715f017f0280b50af58ea6838367bab5f9b86258611615b2615f563e`
- Respondent evidence direct-SDK attempt: `0xe37e4ba9064108cce4de0049d5ad41ace110896fc92411905b06b1f1d3393b0d`

The replacement case reached `RESPONSE_WINDOW` with the correct claim and response commitments. Evidence locking was rejected because the second evidence submission was not yet reflected in the evidence snapshot; no ruling, appeal, or settlement is claimed.
