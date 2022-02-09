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

function encodeParaSwapData(
  buyCalldata,
  augustus
) {
  return ethers.utils.defaultAbiCoder.encode(
    ['bytes', 'address'], [buyCalldata, augustus]
  );
}

function encodeParaSwapRepayAdapterParams(
  debtAsset,
  debtRepayAmount,
  buyAllBalanceOffset,
  rateMode,
  buyCalldata,
  augustus,
  permitParams
) {
  return ethers.utils.defaultAbiCoder.encode(
    [
      'address',
      'uint256',
      'uint256',
      'uint256',
      'bytes',
      'tuple(uint256,uint256,uint8,bytes32,bytes32)',
    ],
    [
      debtAsset,
      debtRepayAmount,
      buyAllBalanceOffset,
      rateMode,
      encodeParaSwapData(buyCalldata, augustus),
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

module.exports = {
  encodeParaSwapLiquiditySwapAdapterParams,
  encodeParaSwapData,
  encodeParaSwapRepayAdapterParams,
};
