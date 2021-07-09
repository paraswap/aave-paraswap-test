# Aave ParaSwap adapter tests

Runs tests of ParaSwap adapters created for Aave using the Tenderly fork feature.  The adapter is deployed as part of each test, unless the relevant environment variable with its already deployed address is set.

To use, install dependencies with `yarn` and run test scripts in `scripts/` using `node`.

Required to set the following in your `.env` file or environment:

```
TENDERLY_KEY=<Tenderly API key>
TENDERLY_ACCOUNT=<Tenderly account containing the project as seen in URL>
TENDERLY_PROJECT=<Tenderly project name as seen in URL>
# Mainnet
FORK_NETWORK_ID=1
PARASWAP_LIQUIDITY_SWAP_ADAPTER_ADDRESS=0x135896DE8421be2ec868E0b811006171D9df802A
# Polygon
#FORK_NETWORK_ID=137
#PARASWAP_LIQUIDITY_SWAP_ADAPTER_ADDRESS=0x35784a624D4FfBC3594f4d16fA3801FeF063241c
```
