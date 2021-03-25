function augustusFromAmountOffsetFromCalldata(calldata) {
  switch (calldata.slice(0, 10)) {
    case '0xda8567c8': // Augustus V3 multiSwap
      return 4 + 32 + 2*32;
    default:
      throw new Error('Unrecognized function selector for Augustus');
  }
}

module.exports = { augustusFromAmountOffsetFromCalldata };
