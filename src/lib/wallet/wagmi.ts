import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient } from "@tanstack/react-query";
import { genLayerTestnet, genLayerLocalnet } from "@/lib/wallet/chains";

// ─── TanStack Query Client ────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time of 30 seconds — appropriate for blockchain state
      staleTime: 30_000,
      // Retry failed queries twice before surfacing the error
      retry: 2,
    },
  },
});

// ─── Wagmi Config ─────────────────────────────────────────────────────────────

/**
 * Wagmi configuration for Lexora.
 *
 * Uses the injected connector (MetaMask, Rabby, etc.) and targets
 * GenLayer Testnet as the primary chain, with localnet as a fallback
 * for local development.
 */
export const wagmiConfig = createConfig({
  chains: [genLayerTestnet, genLayerLocalnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [genLayerTestnet.id]: http("https://rpc.testnet.genlayer.com"),
    [genLayerLocalnet.id]: http("http://localhost:4000/api"),
  },
  ssr: true,
});
