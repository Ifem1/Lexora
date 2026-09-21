import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { QueryClient } from "@tanstack/react-query";
import { genLayerStudionet, genLayerLocalnet } from "@/lib/wallet/chains";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

/**
 * Lexora targets stable GenLayer Studionet (chain 61999).
 * Localnet (61127) remains available only for explicit local development.
 */
export const wagmiConfig = createConfig({
  chains: [genLayerStudionet, genLayerLocalnet],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [genLayerStudionet.id]: http("https://studio.genlayer.com/api"),
    [genLayerLocalnet.id]: http("http://localhost:4000/api"),
  },
  ssr: true,
});
