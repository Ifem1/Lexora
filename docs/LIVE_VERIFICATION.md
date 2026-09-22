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

## Remaining live path

Funding, dispute, evidence, validator ruling, appeal, and settlement were not claimed in this record because the available CLI path does not expose a native GEN transaction-value option for the payable method. No fake funding or synthetic state transition was used.
