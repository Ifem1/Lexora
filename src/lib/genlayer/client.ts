import { createClient, chains, isSuccessful } from "genlayer-js";
import { TransactionHashVariant } from "genlayer-js/types";

const configuredContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
export const CONTRACT_ADDRESS = configuredContractAddress as `0x${string}` | undefined;

function requireContractAddress(): `0x${string}` {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "NEXT_PUBLIC_CONTRACT_ADDRESS is not configured for the rebuilt Lexora deployment."
    );
  }
  return CONTRACT_ADDRESS;
}

const RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "https://studio.genlayer.com/api";

type GenLayerClientType = ReturnType<typeof createClient>;
export type GenLayerWalletProvider = NonNullable<
  Parameters<typeof createClient>[0]
>["provider"];
let _client: GenLayerClientType | null = null;

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

/**
 * Reads the latest finalized Lexora state. This keeps reloads aligned with
 * durable protocol state rather than a provisional accepted execution.
 */
export async function readContract(
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[] = []
): Promise<unknown> {
  const client = getGenLayerClient();

  return client.readContract({
    address: requireContractAddress(),
    functionName: method,
    args,
    transactionHashVariant: TransactionHashVariant.LATEST_FINAL,
  });
}

export async function writeContract(
  account: `0x${string}`,
  method: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  args: any[] = [],
  provider?: GenLayerWalletProvider,
  value: bigint = BigInt(0)
): Promise<`0x${string}`> {
  const client = createClient({
    chain: {
      ...chains.studionet,
      rpcUrls: { default: { http: [RPC_URL] as readonly string[] } },
    },
    account,
    provider,
  });

  const txHash = await client.writeContract({
    address: requireContractAddress(),
    functionName: method,
    args,
    value,
  });

  return txHash as `0x${string}`;
}

/**
 * Wait for durable GenLayer finalization and verify contract execution.
 *
 * An EVM submission receipt or an ACCEPTED consensus state is not surfaced as
 * success. The caller gets a resolved value only after FINALIZED +
 * FINISHED_WITH_RETURN.
 */
export async function waitForRuling(txHash: `0x${string}`): Promise<unknown> {
  const client = getGenLayerClient();

  const receipt = await client.waitForTransactionReceipt({
    hash: txHash as unknown as Parameters<
      typeof client.waitForTransactionReceipt
    >[0]["hash"],
    waitUntil: "finalized",
    retries: 120,
    interval: 5000,
  });

  if (!isSuccessful(receipt)) {
    const normalized = receipt as {
      statusName?: string;
      status?: string | number;
      txExecutionResultName?: string;
      txExecutionResult?: string | number;
      consensus_data?: {
        leader_receipt?: Array<{
          execution_result?: string;
          genvm_result?: { stderr?: string };
        }>;
      };
    };
    const detail =
      normalized.consensus_data?.leader_receipt?.[0]?.genvm_result?.stderr?.trim();
    const status = normalized.statusName ?? String(normalized.status ?? "UNKNOWN");
    const execution =
      normalized.txExecutionResultName ??
      String(normalized.txExecutionResult ?? "UNKNOWN");
    throw new Error(
      detail ||
        `GenLayer transaction finalized without successful execution: ${status} / ${execution}`
    );
  }

  return receipt;
}
