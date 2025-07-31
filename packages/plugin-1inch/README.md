# @elizaos/plugin-1inch

1inch cross-chain swap plugin for Eliza that enables cross-chain token swaps and order management.

## Setup

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

```env
ONEINCH_AUTH_KEY=your_1inch_api_key
ONEINCH_BASE_URL=https://api.1inch.dev/fusion-plus # Optional
ONEINCH_WALLET_ADDRESS=your_wallet_address # Optional
ONEINCH_PRIVATE_KEY=your_private_key # Optional
```

3. Add the plugin to your character configuration:

```json
{
    "plugins": ["@elizaos/plugin-1inch"],
    "settings": {
        "secrets": {
            "ONEINCH_AUTH_KEY": "your_1inch_api_key",
            "ONEINCH_WALLET_ADDRESS": "your_wallet_address",
            "ONEINCH_PRIVATE_KEY": "your_private_key"
        }
    }
}
```

## Available Actions

The plugin provides the following actions:

-   `GET_QUOTE`: Get a quote for cross-chain token swap
-   `CREATE_ORDER`: Create a cross-chain swap order
-   `GET_ACTIVE_ORDERS`: Get active orders
-   `GET_ORDERS_BY_MAKER`: Get orders by maker address

## Usage Examples

1. Get a quote:

```
Get me a quote to swap 1000 DAI from Ethereum to native token on Gnosis chain
```

2. Create an order:

```
Create an order to swap 1000 DAI from Ethereum to USDC on Polygon
```

3. Check active orders:

```
Show me my active orders
```

4. Get orders by address:

```
Get orders for address 0xfa80cd9b3becc0b4403b0f421384724f2810775f
```

## Development

1. Build the plugin:

```bash
pnpm build
```

2. Run in development mode:

```bash
pnpm dev
```

## Dependencies

-   @elizaos/core
-   @1inch/cross-chain-sdk
-   web3
-   zod

## Supported Networks

The plugin supports all networks available in the 1inch Cross-Chain SDK.

## Troubleshooting

1. If actions are not being triggered:

    - Verify 1inch API key configuration
    - Check network settings
    - Ensure character configuration includes the plugin

2. Common errors:
    - "Cannot find package": Make sure dependencies are installed
    - "API key not found": Check ONEINCH_AUTH_KEY environment variable
    - "Network error": Verify network configuration

## License

MIT
