// packages/plugin-1inch/src/index.ts
import type { Plugin } from "@elizaos/core";
import { OneInchProvider } from "./provider";
import { 
  getQuoteAction, 
  createOrderAction, 
  getActiveOrdersAction,
  getOrdersByMakerAction 
} from "./actions";

export const oneInchPlugin: Plugin = {
  name: "1inch",
  description: "Plugin for 1inch cross-chain swaps and order management",
  actions: [
    getQuoteAction,
    createOrderAction,
    getActiveOrdersAction,
    getOrdersByMakerAction,
  ],
  evaluators: [],
  providers: [OneInchProvider],
  services: [],
};

export default oneInchPlugin;

// Re-export types and utilities
export * from "./provider";
export * from "./actions";

// Export NetworkEnum for convenience
export { NetworkEnum } from "@1inch/cross-chain-sdk";
