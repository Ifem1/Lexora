import { defineChain } from "viem";

/**
 * Stable GenLayer Studionet used by the rebuilt Lexora deployment.
 *
 * Chain ID: 61999
 * RPC: https://studio.genlayer.com/api
 */
export const genLayerStudionet = defineChain({
  id: 61999,
  name: "GenLayer Studionet",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://studio.genlayer.com/api"],
    },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Studio Explorer",
      url: "https://explorer-studio.genlayer.com",
    },
  },
  testnet: true,
});

/**
 * GenLayer Localnet for an explicitly local Studio/GLSim instance.
 *
 * Chain ID: 61127
 */
export const genLayerLocalnet = defineChain({
  id: 61127,
  name: "GenLayer Localnet",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://localhost:4000/api"],
    },
  },
  testnet: true,
});
