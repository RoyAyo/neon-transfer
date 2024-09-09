"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEXS = exports.ERC20_ABI = exports.NEON_MOVED_PER_SET = exports.AMOUNT_NEON_TO_START_WITH = exports.slippage = exports.swapDeadline = exports.FIXED_TOKENS_TO_APPROVE = exports.MAIN_ADDRESS = exports.USDT_TOKEN = exports.WRAPPED_NEON_TOKEN = exports.PROXY_URL = exports.NEON_PRIVATE = void 0;
const bignumber_1 = require("@ethersproject/bignumber");
const token_transfer_core_1 = require("@neonevm/token-transfer-core");
const interfaces_1 = require("../core/interfaces");
require('dotenv').config({});
exports.NEON_PRIVATE = process.env.NEON_PRIVATE;
exports.PROXY_URL = `https://devnet.neonevm.org`;
exports.WRAPPED_NEON_TOKEN = {
    name: interfaces_1.TOKENS.WNEON,
    address: "0x11adC2d986E334137b9ad0a0F290771F31e9517F",
    decimal: token_transfer_core_1.NEON_TOKEN_MINT_DECIMALS
};
exports.USDT_TOKEN = {
    name: interfaces_1.TOKENS.USDT,
    address: "0x6eEf939FC6e2B3F440dCbB72Ea81Cd63B5a519A5",
    decimal: 6
};
exports.MAIN_ADDRESS = [
    "0xDdebB445fBb4a086B33755B2C805C5732f1424E0", // MAIN.
    // "0x7206F706E5e156E6c14e355eA2e448951f6c1b3A", // WALLET 4.
    // "0xAc8Bf0e6843A3720683Bc91F3D4d3f001e1dda13", // WALLET 1,
    // "0x0176B85df3BFF7F353433946066cE69d70Da30C4", // WALLET 2,
    // "0x283DB4DC0cCcC9D80fB959a5dCF80f4C9b2602Bf", // WALLET 5
    // "0xCf93367528825705E13B31Dc02001F86C7dfe441", // Wallet 6
    // "0x45A1006A06c00Fe8964Bf1F0538e1e072F05Dea2", //WALLET 7,
    // "0xAc649BB01036775f53B0A0A09D75A79309e397Dd", // WALLET 8,
    // "0xE615E550BF5506A7A06E7b261F6a21cC0Be124B4", //WALLET 9,
    // "0x034070fB37bfE9dAD112e33e36bF75b13895C162", // WALLET 10
];
exports.FIXED_TOKENS_TO_APPROVE = "1000";
exports.swapDeadline = bignumber_1.BigNumber.from(Math.floor(Date.now() / 1000) + 60 * 20); // 10 minutes
exports.slippage = 97; // %;
exports.AMOUNT_NEON_TO_START_WITH = 20;
exports.NEON_MOVED_PER_SET = 2;
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
