// packages/plugin-1inch/src/actions.ts
import {
    type Action,
    type IAgentRuntime,
    type Memory,
    type State,
    type HandlerCallback,
    elizaLogger,
    generateObject,
    ModelClass,
} from "@elizaos/core";
import { z } from "zod";
import { OneInchProviderClass } from "./provider";
import { NetworkEnum } from "@1inch/cross-chain-sdk";
  
  // Quote Action
  const getQuoteSchema = z.object({
    srcChainId: z.number(),
    dstChainId: z.number(),
    srcTokenAddress: z.string(),
    dstTokenAddress: z.string(),
    amount: z.string(),
    walletAddress: z.string().optional(),
  });
  
  export const getQuoteAction: Action = {
    name: "GET_QUOTE",
    similes: ["quote", "price", "estimate", "swap quote", "cross-chain quote"],
    description: "Get a quote for cross-chain token swap using 1inch",
    examples: [
      [
        {
          user: "{{user1}}",
          content: {
            text: "Get me a quote to swap 1000 DAI from Ethereum to native token on Gnosis chain",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "I'll get you a quote for swapping 1000 DAI from Ethereum to native token on Gnosis chain.",
            action: "GET_QUOTE",
          },
        },
      ],
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
      const keywords = ["quote", "price", "swap", "cross-chain", "1inch"];
      return keywords.some(keyword => 
        message.content.text.toLowerCase().includes(keyword)
      );
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state: State,
      _options: any,
      callback?: HandlerCallback
    ) => {
      try {
        const provider = await runtime.getProvider<OneInchProviderClass>("1inch");
        const sdk = provider.getSDK();
  
        // Extract parameters from message
        const params = await generateObject({
          runtime,
          context: `Extract swap parameters from: ${message.content.text}`,
          modelClass: ModelClass.SMALL,
          schema: getQuoteSchema,
        });
  
        const quote = await sdk.getQuote({
          srcChainId: params.srcChainId as NetworkEnum,
          dstChainId: params.dstChainId as NetworkEnum,
          srcTokenAddress: provider.formatTokenAddress(params.srcTokenAddress),
          dstTokenAddress: provider.formatTokenAddress(params.dstTokenAddress),
          amount: params.amount,
          walletAddress: params.walletAddress || provider.getConfig().walletAddress || "0x0000000000000000000000000000000000000000",
        });
  
        const response = `Quote received:
  - From: ${params.amount} tokens on chain ${params.srcChainId}
  - To: ${quote.dstAmount} tokens on chain ${params.dstChainId}
  - Estimated gas: ${quote.gasLimit}
  - Price impact: ${quote.priceImpact}%`;
  
        if (callback) {
          callback({
            text: response,
            content: { quote },
          });
        }
  
        return true;
      } catch (error) {
        elizaLogger.error("Error getting quote:", error);
        if (callback) {
          callback({
            text: `Error getting quote: ${error.message}`,
            content: { error: error.message },
          });
        }
        return false;
      }
    },
  };
  
  // Create Order Action
  const createOrderSchema = z.object({
    srcChainId: z.number(),
    dstChainId: z.number(),
    srcTokenAddress: z.string(),
    dstTokenAddress: z.string(),
    amount: z.string(),
    walletAddress: z.string(),
    preset: z.enum(["fast", "medium", "slow"]).optional(),
    takingFeeBps: z.number().optional(),
    takingFeeReceiver: z.string().optional(),
  });
  
  export const createOrderAction: Action = {
    name: "CREATE_ORDER",
    similes: ["create order", "place order", "swap", "execute swap"],
    description: "Create a cross-chain swap order using 1inch",
    examples: [
      [
        {
          user: "{{user1}}",
          content: {
            text: "Create an order to swap 1000 DAI from Ethereum to USDC on Polygon",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "I'll create a cross-chain swap order for you.",
            action: "CREATE_ORDER",
          },
        },
      ],
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
      const keywords = ["create order", "place order", "swap", "execute"];
      return keywords.some(keyword => 
        message.content.text.toLowerCase().includes(keyword)
      );
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state: State,
      _options: any,
      callback?: HandlerCallback
    ) => {
      try {
        const provider = await runtime.getProvider<OneInchProviderClass>("1inch");
        const config = provider.getConfig();
  
        if (!config.walletAddress) {
          throw new Error("Wallet address is required for creating orders");
        }
  
        const sdk = provider.getSDK();
  
        const params = await generateObject({
          runtime,
          context: `Extract order parameters from: ${message.content.text}`,
          modelClass: ModelClass.SMALL,
          schema: createOrderSchema,
        });
  
        // First get a quote
        const quote = await sdk.getQuote({
          srcChainId: params.srcChainId as NetworkEnum,
          dstChainId: params.dstChainId as NetworkEnum,
          srcTokenAddress: provider.formatTokenAddress(params.srcTokenAddress),
          dstTokenAddress: provider.formatTokenAddress(params.dstTokenAddress),
          amount: params.amount,
          walletAddress: params.walletAddress,
          enableEstimate: true,
        });
  
        // Create the order (simplified - would need proper hash lock implementation)
        const orderOptions: any = {
          walletAddress: params.walletAddress,
        };
  
        if (params.takingFeeBps && params.takingFeeReceiver) {
          orderOptions.fee = {
            takingFeeBps: params.takingFeeBps,
            takingFeeReceiver: params.takingFeeReceiver,
          };
        }
  
        const order = await sdk.createOrder(quote, orderOptions);
  
        const response = `Order created successfully:
  - Order ID: ${order.orderHash}
  - From: ${params.amount} tokens on chain ${params.srcChainId}
  - To: Expected ${quote.dstAmount} tokens on chain ${params.dstChainId}
  - Status: Pending`;
  
        if (callback) {
          callback({
            text: response,
            content: { order },
          });
        }
  
        return true;
      } catch (error) {
        elizaLogger.error("Error creating order:", error);
        if (callback) {
          callback({
            text: `Error creating order: ${error.message}`,
            content: { error: error.message },
          });
        }
        return false;
      }
    },
  };
  
  // Get Active Orders Action
  export const getActiveOrdersAction: Action = {
    name: "GET_ACTIVE_ORDERS",
    similes: ["active orders", "my orders", "pending orders", "order status"],
    description: "Get active orders from 1inch",
    examples: [
      [
        {
          user: "{{user1}}",
          content: {
            text: "Show me my active orders",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "I'll fetch your active orders from 1inch.",
            action: "GET_ACTIVE_ORDERS",
          },
        },
      ],
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
      const keywords = ["active orders", "my orders", "pending orders", "order status"];
      return keywords.some(keyword => 
        message.content.text.toLowerCase().includes(keyword)
      );
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state: State,
      _options: any,
      callback?: HandlerCallback
    ) => {
      try {
        const provider = await runtime.getProvider<OneInchProviderClass>("1inch");
        const sdk = provider.getSDK();
  
        const orders = await sdk.getActiveOrders({ page: 1, limit: 10 });
  
        const response = orders.items.length > 0 
          ? `Found ${orders.items.length} active orders:\n${orders.items.map((order, i) => 
              `${i + 1}. Order ${order.orderHash.slice(0, 10)}... - Status: ${order.status}`
            ).join('\n')}`
          : "No active orders found.";
  
        if (callback) {
          callback({
            text: response,
            content: { orders },
          });
        }
  
        return true;
      } catch (error) {
        elizaLogger.error("Error getting active orders:", error);
        if (callback) {
          callback({
            text: `Error getting active orders: ${error.message}`,
            content: { error: error.message },
          });
        }
        return false;
      }
    },
  };
  
  // Get Orders by Maker Action
  const getOrdersByMakerSchema = z.object({
    address: z.string(),
    page: z.number().optional(),
    limit: z.number().optional(),
  });
  
  export const getOrdersByMakerAction: Action = {
    name: "GET_ORDERS_BY_MAKER",
    similes: ["orders by address", "user orders", "maker orders"],
    description: "Get orders by maker address from 1inch",
    examples: [
      [
        {
          user: "{{user1}}",
          content: {
            text: "Get orders for address 0xfa80cd9b3becc0b4403b0f421384724f2810775f",
          },
        },
        {
          user: "{{agentName}}",
          content: {
            text: "I'll fetch orders for that address.",
            action: "GET_ORDERS_BY_MAKER",
          },
        },
      ],
    ],
    validate: async (runtime: IAgentRuntime, message: Memory) => {
      const keywords = ["orders for", "orders by", "maker orders", "address orders"];
      return keywords.some(keyword => 
        message.content.text.toLowerCase().includes(keyword)
      ) && /0x[a-fA-F0-9]{40}/.test(message.content.text);
    },
    handler: async (
      runtime: IAgentRuntime,
      message: Memory,
      state: State,
      _options: any,
      callback?: HandlerCallback
    ) => {
      try {
        const provider = await runtime.getProvider<OneInchProviderClass>("1inch");
        const sdk = provider.getSDK();
  
        const params = await generateObject({
          runtime,
          context: `Extract address and pagination from: ${message.content.text}`,
          modelClass: ModelClass.SMALL,
          schema: getOrdersByMakerSchema,
        });
  
        const orders = await sdk.getOrdersByMaker({
          page: params.page || 1,
          limit: params.limit || 10,
          address: params.address,
        });
  
        const response = orders.items.length > 0 
          ? `Found ${orders.items.length} orders for ${params.address}:\n${orders.items.map((order, i) => 
              `${i + 1}. Order ${order.orderHash.slice(0, 10)}... - Status: ${order.status}`
            ).join('\n')}`
          : `No orders found for address ${params.address}`;
  
        if (callback) {
          callback({
            text: response,
            content: { orders },
          });
        }
  
        return true;
      } catch (error) {
        elizaLogger.error("Error getting orders by maker:", error);
        if (callback) {
          callback({
            text: `Error getting orders by maker: ${error.message}`,
            content: { error: error.message },
          });
        }
        return false;
      }
    },
  };
