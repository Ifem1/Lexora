import { createClient, chains } from "genlayer-js";

// ─── Contract Address ─────────────────────────────────────────────────────────

export const CONTRACT_ADDRESS =
  "0x2682b8C00e2a7dA837596764eC3b3E35Ef9e801B" as const;

const RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "https://studio.genlayer.com/api";

// ─── Singleton Client ─────────────────────────────────────────────────────────

type GenLayerClientType = ReturnType<typeof createClient>;
let _client: GenLayerClientType | null = null;

/**
 * Returns a singleton GenLayer client connected to GenLayer Studio (studionet).
 * Chain ID 61999 matches NEXT_PUBLIC_CHAIN_ID and chains.studionet.
 * We pass a custom rpcUrls so the client targets the configured RPC endpoint.
 */
export function getGenLayerClient(): GenLayerClientType {
  if (_client) return _client;

  _client = createClient({
    chain: {
      ...chains.studionet,
      rpcUrls: {
        default: { http: [RPC_URL] as readonly string[] },
      },
    },
  });

  return _client;
}

// ─── Read Contract ────────────────────────────────────────────────────────────

/**
 * Call a read-only method on the arbitration contract.
 * Returns the raw result (usually a JSON string from the contract).
 */
export async function readContract(
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[] = []
): Promise<unknown> {
  const client = getGenLayerClient();

  const result = await client.readContract({
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
  });

  return result;
}

// ─── Write Contract ───────────────────────────────────────────────────────────

/**
 * Send a state-changing transaction to the arbitration contract.
 * Requires an account address — pass the wagmi wallet's account address.
 * The JSON-RPC provider (MetaMask etc.) will handle signing.
 */
export async function writeContract(
  account: `0x${string}`,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[] = []
): Promise<`0x${string}`> {
  const client = getGenLayerClient();

  const txHash = await client.writeContract({
    account: { address: account } as Parameters<
      typeof client.writeContract
    >[0]["account"],
    address: CONTRACT_ADDRESS,
    functionName: method,
    args,
    value: BigInt(0),
  });

  return txHash as `0x${string}`;
}

// ─── Wait for Ruling ──────────────────────────────────────────────────────────

/**
 * Poll until a GenLayer transaction reaches a finalized/accepted state.
 * GenLayer validator consensus can take seconds to minutes.
 */
export async function waitForRuling(txHash: `0x${string}`): Promise<unknown> {
  const client = getGenLayerClient();

  // Cast to Hash (branded type `{ length: 66 }`) as required by genlayer-js
  const receipt = await client.waitForTransactionReceipt({
    hash: txHash as unknown as Parameters<
      typeof client.waitForTransactionReceipt
    >[0]["hash"],
    retries: 120,
    interval: 5000,
  });

  return receipt;
}
