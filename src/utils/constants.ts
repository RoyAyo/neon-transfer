import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
import { NEON_TOKEN_MINT_DECIMALS } from "@neonevm/token-transfer-core";
import { IDEX, ITokens, TOKENS } from "../core/interfaces";

require('dotenv').config({});

export const PROXY_URL = process.env.env === 'dev' ? `https://devnet.neonevm.org` : `https://neon-proxy-mainnet.solana.p2p.org`;

export const WRAPPED_NEON_TOKEN: ITokens = {
  name: TOKENS.WNEON,
  address: process.env.env === 'dev' ? "0x11adC2d986E334137b9ad0a0F290771F31e9517F" : "0x202C35e517Fa803B537565c40F0a6965D7204609",
  decimal: NEON_TOKEN_MINT_DECIMALS
}

export const USDT_TOKEN: ITokens = {
  name: TOKENS.USDT,
  address: process.env.env === 'dev' ? "0x6eEf939FC6e2B3F440dCbB72Ea81Cd63B5a519A5" : "0x5f0155d08eF4aaE2B500AefB64A3419dA8bB611a",
  decimal: 6
};

export const AMOUNT_NEON_TO_START_WITH = 20;
export const DEFAULT_NEON_TO_WRAP = 10;
export const FIXED_TOKENS_TO_APPROVE = "1000";
export const JOB_RETRIES = 5;
export const NEON_AMOUNT = 0.2;
export const MANUAL_GAS_LIMIT=4_000_000;
export const NEON_MOVED_PER_SET = 2;
export const NO_OF_SETS = 1;
export const SLIPPAGE = 98; // %;
export const SWAP_DEADLINE = BigNumber.from(Math.floor(Date.now() / 1000) + 60 * 20); // 20 minutes
export const TRANSACTION_TIMEOUT = process.env.env === 'dev' ? 120000 : 200000; //400s // 6m

export const ERC20_ABI = [
    "function deposit() payable",
    "function withdraw(uint256 amount)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)"
];

export const DEXS: IDEX[] = [
  {
      name: "Moraswap",
      router: process.env.env === "dev" ? "0x491FFC6eE42FEfB4Edab9BA7D5F3e639959E081B" : "0x594e37b9f39f5d31dec4a8c1cc4fe2e254153034",
      abi: [
        "function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline)"
      ]
  },
  // {
  //   name: "IceCreamSwap",
  //   router: "0xBb5e1777A331ED93E07cF043363e48d320eb96c4",
  //   abi: [
  //     "function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint[] memory amounts)",
  //     "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline)"
  //   ]
  // },
]