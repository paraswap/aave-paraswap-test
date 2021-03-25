const { ethers } = require('ethers');

function encodeParaSwapLiquiditySwapAdapterParams(
  assetToSwapTo,
  minAmountToReceive,
  swapAllBalanceOffset,
  swapCalldata,
  augustus,
  permitParams
) {
  return ethers.utils.defaultAbiCoder.encode(
    [
      'address',
      'uint256',
      'uint256',
      'bytes',
      'address',
      'tuple(uint256,uint256,uint8,bytes32,bytes32)',
    ],
    [
      assetToSwapTo,
      minAmountToReceive,
      swapAllBalanceOffset,
      swapCalldata,
      augustus,
      [
        permitParams.amount,
        permitParams.deadline,
        permitParams.v,
        permitParams.r,
        permitParams.s
      ],
    ]
  );
}

module.exports = { encodeParaSwapLiquiditySwapAdapterParams };
