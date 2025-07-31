// packages/plugin-1inch/src/provider.ts
import type { Provider, IAgentRuntime } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { SDK, NetworkEnum } from "@1inch/cross-chain-sdk";

export interface OneInchConfig {
  authKey: string;
  baseUrl?: string;
  walletAddress?: string;
  privateKey?: string;
}

export class OneInchProviderClass {
  private sdk: SDK;
  private config: OneInchConfig;

  constructor(runtime: IAgentRuntime) {
    this.config = {
      authKey: runtime.getSetting("ONEINCH_AUTH_KEY") || "",
      baseUrl: runtime.getSetting("ONEINCH_BASE_URL") || "https://api.1inch.dev/fusion-plus",
      walletAddress: runtime.getSetting("ONEINCH_WALLET_ADDRESS"),
      privateKey: runtime.getSetting("ONEINCH_PRIVATE_KEY"),
    };

    if (!this.config.authKey) {
      throw new Error("ONEINCH_AUTH_KEY is required");
    }

    this.sdk = new SDK({
      url: this.config.baseUrl,
      authKey: this.config.authKey,
    });

    elizaLogger.info("1inch provider initialized");
  }

  getSDK(): SDK {
    return this.sdk;
  }

  getConfig(): OneInchConfig {
    return this.config;
  }

  // Helper method to validate network
  isValidNetwork(chainId: number): boolean {
    return Object.values(NetworkEnum).includes(chainId as NetworkEnum);
  }

  // Helper method to format token address
  formatTokenAddress(address: string): string {
    if (address.toLowerCase() === "eth" || address.toLowerCase() === "native") {
      return "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
    }
    return address;
  }
}

export const OneInchProvider: Provider = {
  get: async (runtime: IAgentRuntime) => {
    return new OneInchProviderClass(runtime);
  },
};
