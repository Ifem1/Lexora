import { defineChain } from "viem";

/**
 * GenLayer Testnet (Bradbury) chain configuration for viem/wagmi.
 *
 * Chain ID: 961
 * The authoritative chain definition from genlayer-js uses this config.
 */
export const genLayerTestnet = defineChain({
  id: 961,
  name: "GenLayer Testnet",
  nativeCurrency: {
    name: "GEN",
    symbol: "GEN",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.genlayer.com"],
    },
  },
  blockExplorers: {
    default: {
      name: "GenLayer Explorer",
      url: "https://explorer.testnet.genlayer.com",
    },
  },
  testnet: true,
});

/**
 * GenLayer Localnet chain configuration for local development.
 * Connects to a locally running GenLayer node.
 */
export const genLayerLocalnet = defineChain({
  id: 61999,
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
