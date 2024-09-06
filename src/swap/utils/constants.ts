import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
import { NEON_TOKEN_MINT_DECIMALS } from "@neonevm/token-transfer-core";
import { IDEX } from "../../core/interfaces";

require('dotenv').config({});

export const NEON_PRIVATE = process.env.NEON_PRIVATE;
export const PROXY_URL = `https://devnet.neonevm.org`;

export const WRAPPED_NEON_TOKEN = {
  address: "0x11adC2d986E334137b9ad0a0F290771F31e9517F",
  decimal: NEON_TOKEN_MINT_DECIMALS
}
export const USDT_TOKEN = {
  address: "0x6eEf939FC6e2B3F440dCbB72Ea81Cd63B5a519A5",
  decimal: 6
};


export const FIXED_TOKENS_TO_APPROVE = "1000";
export const swapDeadline = BigNumber.from(Math.floor(Date.now() / 1000) + 60 * 20); // 10 minutes
export const slippage = 97; // %;

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
      router: "0x491FFC6eE42FEfB4Edab9BA7D5F3e639959E081B",
      abi: [
        "function getAmountsOut(uint256 amountIn, address[] memory path) public view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to, uint256 deadline)"
      ]
  }
]