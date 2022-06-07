require("dotenv").config();
const { ethers } = require("ethers");
const { ParaSwap } = require("paraswap");
const { TenderlyFork } = require("../src/tenderly");
const { encodeParaSwapLiquiditySwapAdapterParams } = require("../src/adapters");
const {
  AAVE_ADDRESSES_PROVIDER,
  AUGUSTUS_REGISTRY,
  WETH,
  DAI,
} = require("../src/addresses");

const IERC20_ARTIFACT = require("../artifacts/IERC20.json");
const IWETH_ARTIFACT = require("../artifacts/IWETH.json");
const ILendingPoolAddressesProvider_ARTIFACT = require("../artifacts/ILendingPoolAddressesProvider.json");
const ILendingPool_ARTIFACT = require("../artifacts/ILendingPool.json");
const ParaSwapLiquiditySwapAdapter_ARTIFACT = require("../artifacts/ParaSwapLiquiditySwapAdapter_v3.json");

const FORK_NETWORK_ID = process.env.FORK_NETWORK_ID || "1";
const PARASWAP_API = process.env.PARASWAP_API || "https://apiv5.paraswap.io";
const PARASWAP_LIQUIDITY_SWAP_ADAPTER_ADDRESS =
  process.env.PARASWAP_LIQUIDITY_SWAP_ADAPTER_ADDRESS;

async function main() {
  // Create a new random account signer
  let signer = ethers.Wallet.createRandom();
  console.log("Created wallet for address", signer.address);

  // Build a swap on ParaSwap
  const amount_to_swap = ethers.utils.parseEther("5");
  const paraswap = new ParaSwap(parseInt(FORK_NETWORK_ID), PARASWAP_API);
  const priceRoute = await paraswap.getRate(
    WETH[FORK_NETWORK_ID],
    DAI[FORK_NETWORK_ID],
    amount_to_swap.toString(),
    signer.address,
    "SELL",
    { partner: "aave" }
  );
  const { others, ...priceRouteNoOthers } = priceRoute;
  console.log("priceRoute:", JSON.stringify(priceRouteNoOthers, null, 2));
  if (priceRoute.message) throw new Error("Error getting priceRoute");
  const priceWithSlippage = ethers.BigNumber.from(priceRoute.destAmount)
    .mul(99)
    .div(100)
    .toString();
  const txParams = await paraswap.buildTx(
    WETH[FORK_NETWORK_ID],
    DAI[FORK_NETWORK_ID],
    priceRoute.srcAmount,
    priceWithSlippage,
    priceRoute,
    signer.address,
    "aave",
    undefined,
    undefined,
    undefined,
    { ignoreChecks: true }
  );
  console.log("txParams:", txParams);
  if (txParams.message) throw new Error("Error getting txParams");

  // Create a fork on Tenderly
  const fork = new TenderlyFork();
  await fork.init();
  console.log("Created fork ID", fork.fork_id);

  // Connect the signer to the fork
  const provider = new ethers.providers.JsonRpcProvider(
    fork.get_rpc_url(),
    parseInt(FORK_NETWORK_ID)
  );
  signer = signer.connect(provider);

  // Fund the account with fake ETH
  await fork.fund_account(signer.address);
  console.log(
    "Balance was set to",
    ethers.utils.formatEther(await signer.getBalance()),
    "ETH"
  );

  let adapter;
  if (PARASWAP_LIQUIDITY_SWAP_ADAPTER_ADDRESS) {
    adapter = new ethers.Contract(
      PARASWAP_LIQUIDITY_SWAP_ADAPTER_ADDRESS,
      ParaSwapLiquiditySwapAdapter_ARTIFACT.abi,
      signer
    );
    console.log("Using adapter at", adapter.address);
  } else {
    // Deploy the adapter
    console.log("Deploying ParaSwapLiquiditySwapAdapter...");
    const adapterFactory = new ethers.ContractFactory(
      ParaSwapLiquiditySwapAdapter_ARTIFACT.abi,
      ParaSwapLiquiditySwapAdapter_ARTIFACT.bytecode,
      signer
    );
    adapter = await adapterFactory.deploy(
      AAVE_ADDRESSES_PROVIDER[FORK_NETWORK_ID],
      AUGUSTUS_REGISTRY[FORK_NETWORK_ID],
      signer.address
    );
    await adapter.deployTransaction.wait();
    console.log("Deployed adapter at", adapter.address);
  }

  // Deposit ETH to get WETH
  console.log("Depositing to WETH...");
  const deposit_amount = ethers.utils.parseEther("10");
  const weth = new ethers.Contract(
    WETH[FORK_NETWORK_ID],
    IWETH_ARTIFACT.abi,
    signer
  );
  await (await weth.deposit({ value: deposit_amount })).wait();
  console.log(
    "Deposited",
    ethers.utils.formatEther(deposit_amount),
    "ETH as WETH"
  );

  // Set allowance on LendingPool
  console.log("Setting allowance for LendingPool...");
  const addresses_provider = new ethers.Contract(
    AAVE_ADDRESSES_PROVIDER[FORK_NETWORK_ID],
    ILendingPoolAddressesProvider_ARTIFACT.abi,
    signer
  );
  const lending_pool_address = await addresses_provider.getLendingPool();
  await (await weth.approve(lending_pool_address, deposit_amount)).wait();
  console.log("Allowance set successfully");

  // Deposit WETH in Aave AToken
  console.log("Depositing to AToken...");
  const lending_pool = new ethers.Contract(
    lending_pool_address,
    ILendingPool_ARTIFACT.abi,
    signer
  );
  await (
    await lending_pool.deposit(
      WETH[FORK_NETWORK_ID],
      deposit_amount,
      signer.address,
      0
    )
  ).wait();
  const aWETH_address = (
    await lending_pool.getReserveData(WETH[FORK_NETWORK_ID])
  ).aTokenAddress;
  const aWETH = new ethers.Contract(aWETH_address, IERC20_ARTIFACT.abi, signer);
  const aWETH_balance_before = await aWETH.balanceOf(signer.address);
  console.log(
    "Successfully deposited",
    ethers.utils.formatEther(aWETH_balance_before),
    "WETH in AToken"
  );

  // Approve adapter to spend ATokens (including flashloan premium)
  console.log("Setting allowance for adapter...");
  await (
    await aWETH.approve(
      adapter.address,
      ethers.BigNumber.from(priceRoute.srcAmount).mul(10009).div(10000)
    )
  ).wait();
  console.log("Allowance set successfully");

  // Perform the swap on the adapter
  console.log("Performing swap using flashLoan...");
  const params = encodeParaSwapLiquiditySwapAdapterParams(
    DAI[FORK_NETWORK_ID],
    priceWithSlippage,
    0,
    txParams.data,
    txParams.to,
    {
      amount: 0,
      deadline: 0,
      v: 0,
      r: "0x0000000000000000000000000000000000000000000000000000000000000000",
      s: "0x0000000000000000000000000000000000000000000000000000000000000000",
    }
  );
  await (
    await lending_pool.flashLoan(
      adapter.address,
      [WETH[FORK_NETWORK_ID]],
      [priceRoute.srcAmount],
      [0],
      signer.address,
      params,
      0,
      { gasLimit: 5000000 }
    )
  ).wait();
  console.log("Swap performed successfully!");
  const aDAI_address = (await lending_pool.getReserveData(DAI[FORK_NETWORK_ID]))
    .aTokenAddress;
  const aDAI = new ethers.Contract(aDAI_address, IERC20_ARTIFACT.abi, signer);
  const aWETH_balance_after = await aWETH.balanceOf(signer.address);
  const aDAI_balance_after = await aDAI.balanceOf(signer.address);
  console.log(
    "Final balances",
    ethers.utils.formatEther(aWETH_balance_after),
    "aWETH",
    ethers.utils.formatUnits(aDAI_balance_after, 18),
    "aDAI"
  );
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
