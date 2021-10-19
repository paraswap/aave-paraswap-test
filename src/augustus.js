// Don't edit this function directly, generate it using generate-offsets.js
function augustusFromAmountOffsetFromCalldata(calldata) {
  switch (calldata.slice(0, 10)) {
    case '0xda8567c8': // Augustus V3 multiSwap
      return 100; // 4 + 3 * 32
    case '0x58b9d179': // Augustus V4 swapOnUniswap
      return 4; // 4 + 0 * 32
    case '0x0863b7ac': // Augustus V4 swapOnUniswapFork
      return 68; // 4 + 2 * 32
    case '0x8f00eccb': // Augustus V4 multiSwap
      return 68; // 4 + 2 * 32
    case '0xec1d21dd': // Augustus V4 megaSwap
      return 68; // 4 + 2 * 32
    case '0x54840d1a': // Augustus V5 swapOnUniswap
      return 4; // 4 + 0 * 32
    case '0xf5661034': // Augustus V5 swapOnUniswapFork
      return 68; // 4 + 2 * 32
    case '0x64466805': // Augustus V5 swapOnZeroXv4
      return 68; // 4 + 2 * 32
    case '0xa94e78ef': // Augustus V5 multiSwap
      return 68; // 4 + 2 * 32
    case '0x46c67b6d': // Augustus V5 megaSwap
      return 68; // 4 + 2 * 32
    default:
      throw new Error('Unrecognized function selector for Augustus');
  }
}

module.exports = { augustusFromAmountOffsetFromCalldata };
