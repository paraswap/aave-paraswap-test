function augustusFromAmountOffsetFromCalldata(calldata) {
  switch (calldata.slice(0, 10)) {
    case '0xda8567c8': // Augustus V3 multiSwap
      return 4 + 32 + 2*32;
    case '0x58b9d179': // Augustus V4 swapOnUniswap
      return 4;
    case '0x0863b7ac': // Augustus V4 swapOnUniswapFork
      return 4 + 2*32;
    case '0x8f00eccb': // Augustus V4 multiSwap
      return 4 + 32 + 32;
    case '0xec1d21dd': // Augustus V4 megaSwap
      return 4 + 32 + 32;
    default:
      throw new Error('Unrecognized function selector for Augustus');
  }
}

module.exports = { augustusFromAmountOffsetFromCalldata };
