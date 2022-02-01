const { ethers } = require('ethers');

const AugustusSwapperV3_ABI = require('../abi/AugustusSwapperV3.json');
const AugustusSwapperV4_ABI = require('../abi/AugustusSwapperV4.json');
const AugustusSwapperV5_ABI = require('../abi/AugustusSwapperV5.json');

const v3 = {
  name: 'Augustus V3',
  iface: new ethers.utils.Interface(AugustusSwapperV3_ABI),
};
const v4 = {
  name: 'Augustus V4',
  iface: new ethers.utils.Interface(AugustusSwapperV4_ABI),
};
const v5 = {
  name: 'Augustus V5',
  iface: new ethers.utils.Interface(AugustusSwapperV5_ABI),
};

const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const NULL_BYTES16 = '0x00000000000000000000000000000000';
const NULL_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const UINT256_MAX = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const summary = [];

function printEncode(cfg, fnName, side, args) {
  const encoded = cfg.iface.encodeFunctionData(fnName, args);
  const offset = (encoded.indexOf(UINT256_MAX.slice(2)) - 2) / 2;
  const calc = `4 + ${(offset - 4) / 32} * 32`;
  console.log(
    `${cfg.name} - ${fnName}:`,
    encoded,
    `offset is ${offset} = ${calc}`,
  );
  summary.push({
    selector: encoded.slice(0, 10),
    comment: `${cfg.name} ${fnName}`,
    offset,
    calc,
    side,
  });
}

printEncode(v3, 'multiSwap', 'SELL', [
  {
    fromToken: NULL_ADDRESS,
    toToken: NULL_ADDRESS,
    fromAmount: UINT256_MAX,
    toAmount: 0,
    expectedAmount: 0,
    beneficiary: NULL_ADDRESS,
    referrer: '',
    path: [],
  },
]);
printEncode(v4, 'swapOnUniswap', 'SELL', [
  UINT256_MAX,
  0,
  [],
  0,
]);
printEncode(v4, 'swapOnUniswapFork', 'SELL', [
  NULL_ADDRESS,
  NULL_BYTES32,
  UINT256_MAX,
  0,
  [],
  0,
]);
printEncode(v4, 'multiSwap', 'SELL', [
  {
    fromToken: NULL_ADDRESS,
    fromAmount: UINT256_MAX,
    toAmount: 0,
    expectedAmount: 0,
    beneficiary: NULL_ADDRESS,
    referrer: '',
    useReduxToken: false,
    path: [],
  },
]);
printEncode(v4, 'megaSwap', 'SELL', [
  {
    fromToken: NULL_ADDRESS,
    fromAmount: UINT256_MAX,
    toAmount: 0,
    expectedAmount: 0,
    beneficiary: NULL_ADDRESS,
    referrer: '',
    useReduxToken: false,
    path: [],
  },
]);
printEncode(v5, 'swapOnUniswap', 'SELL', [
  UINT256_MAX,
  0,
  [],
]);
printEncode(v5, 'buyOnUniswap', 'BUY', [
  0,
  UINT256_MAX,
  [],
]);
printEncode(v5, 'swapOnUniswapFork', 'SELL', [
  NULL_ADDRESS,
  NULL_BYTES32,
  UINT256_MAX,
  0,
  [],
]);
printEncode(v5, 'buyOnUniswapFork', 'BUY', [
  NULL_ADDRESS,
  NULL_BYTES32,
  0,
  UINT256_MAX,
  [],
]);
printEncode(v5, 'swapOnZeroXv4', 'SELL', [
  NULL_ADDRESS,
  NULL_ADDRESS,
  UINT256_MAX,
  0,
  NULL_ADDRESS,
  '0x',
]);
printEncode(v5, 'multiSwap', 'SELL', [
  {
    fromToken: NULL_ADDRESS,
    fromAmount: UINT256_MAX,
    toAmount: 0,
    expectedAmount: 0,
    beneficiary: NULL_ADDRESS,
    path: [],
    partner: NULL_ADDRESS,
    feePercent: 0,
    permit: '0x',
    deadline: 0,
    uuid: NULL_BYTES16,
  },
]);
printEncode(v5, 'megaSwap', 'SELL', [
  {
    fromToken: NULL_ADDRESS,
    fromAmount: UINT256_MAX,
    toAmount: 0,
    expectedAmount: 0,
    beneficiary: NULL_ADDRESS,
    path: [],
    partner: NULL_ADDRESS,
    feePercent: 0,
    permit: '0x',
    deadline: 0,
    uuid: NULL_BYTES16,
  },
]);
printEncode(v5, 'buy', 'BUY', [
  {
    adapter: NULL_ADDRESS,
    fromToken: NULL_ADDRESS,
    toToken: NULL_ADDRESS,
    fromAmount: NULL_ADDRESS,
    toAmount: UINT256_MAX,
    beneficiary: NULL_ADDRESS,
    route: [],
    partner: NULL_ADDRESS,
    feePercent: 0,
    permit: '0x',
    deadline: 0,
    uuid: NULL_BYTES16,
  },
]);

console.log('');
console.log('function augustusFromAmountOffsetFromCalldata(calldata) {');
console.log('  switch (calldata.slice(0, 10)) {');
summary.forEach(({ selector, comment, offset, calc, side }) => {
  if (side === 'SELL') {
    console.log(`    case '${selector}': // ${comment}`);
    console.log(`      return ${offset}; // ${calc}`);
  }
});
console.log('    default:');
console.log("      throw new Error('Unrecognized function selector for Augustus');");
console.log('  }');
console.log('}');
console.log('');
console.log('function augustusToAmountOffsetFromCalldata(calldata) {');
console.log('  switch (calldata.slice(0, 10)) {');
summary.forEach(({ selector, comment, offset, calc, side }) => {
  if (side === 'BUY') {
    console.log(`    case '${selector}': // ${comment}`);
    console.log(`      return ${offset}; // ${calc}`);
  }
});
console.log('    default:');
console.log("      throw new Error('Unrecognized function selector for Augustus');");
console.log('  }');
console.log('}');
