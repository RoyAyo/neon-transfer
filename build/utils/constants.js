"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEXS = exports.ERC20_ABI = exports.NO_OF_SETS = exports.NEON_MOVED_PER_SET = exports.AMOUNT_NEON_TO_START_WITH = exports.slippage = exports.swapDeadline = exports.FIXED_TOKENS_TO_APPROVE = exports.USDT_TOKEN = exports.WRAPPED_NEON_TOKEN = exports.MAIN_PROXY_URL = exports.PROXY_URL = exports.NEON_PRIVATE = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const token_transfer_core_1 = require("@neonevm/token-transfer-core");
const interfaces_1 = require("../core/interfaces");
require('dotenv').config({});
exports.NEON_PRIVATE = process.env.NEON_PRIVATE;
exports.PROXY_URL = `https://devnet.neonevm.org`;
exports.MAIN_PROXY_URL = `https://neon-proxy-mainnet.solana.p2p.org`;
exports.WRAPPED_NEON_TOKEN = {
    name: interfaces_1.TOKENS.WNEON,
    address: "0x11adC2d986E334137b9ad0a0F290771F31e9517F",
    decimal: token_transfer_core_1.NEON_TOKEN_MINT_DECIMALS
};
// export const WRAPPED_NEON_TOKEN: ITokens = {
//   name: TOKENS.WNEON,
//   address: "0x202C35e517Fa803B537565c40F0a6965D7204609",
//   decimal: NEON_TOKEN_MINT_DECIMALS
// }
exports.USDT_TOKEN = {
    name: interfaces_1.TOKENS.USDT,
    address: "0x6eEf939FC6e2B3F440dCbB72Ea81Cd63B5a519A5",
    decimal: 6
};
// export const USDT_TOKEN: ITokens = {
//   name: TOKENS.USDT,
//   address: "0x5f0155d08eF4aaE2B500AefB64A3419dA8bB611a",
//   decimal: 6
// };
exports.FIXED_TOKENS_TO_APPROVE = "1000";
exports.swapDeadline = bignumber_1.BigNumber.from(Math.floor(Date.now() / 1000) + 60 * 20); // 10 minutes
exports.slippage = 97; // %;
exports.AMOUNT_NEON_TO_START_WITH = 20;
exports.NEON_MOVED_PER_SET = 2;
exports.NO_OF_SETS = 2;
exports.ERC20_ABI = [
    "function deposit() payable",
    "function withdraw(uint256 amount)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)"
];
exports.DEXS = [
    {
        name: "Moraswap",
        router: "0x491FFC6eE42FEfB4Edab9BA7D5F3e639959E081B",
        abi: [
            "function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint[] memory amounts)",
            "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline)"
        ]
    }
];
