import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
import { NEON_TOKEN_MINT_DECIMALS } from "@neonevm/token-transfer-core";
import { IDEX, ITokens, TOKENS } from "../core/interfaces";

require('dotenv').config({});

export const NEON_PRIVATE = process.env.NEON_PRIVATE;
export const PROXY_URL = `https://devnet.neonevm.org`;
export const MAIN_PROXY_URL = `https://neon-proxy-mainnet.solana.p2p.org`;

export const WRAPPED_NEON_TOKEN: ITokens = {
  name: TOKENS.WNEON,
  address: "0x11adC2d986E334137b9ad0a0F290771F31e9517F",
  decimal: NEON_TOKEN_MINT_DECIMALS
}
// export const WRAPPED_NEON_TOKEN: ITokens = {
//   name: TOKENS.WNEON,
//   address: "0x202C35e517Fa803B537565c40F0a6965D7204609",
//   decimal: NEON_TOKEN_MINT_DECIMALS
// }

export const USDT_TOKEN: ITokens = {
  name: TOKENS.USDT,
  address: "0x6eEf939FC6e2B3F440dCbB72Ea81Cd63B5a519A5",
  decimal: 6
};
// export const USDT_TOKEN: ITokens = {
//   name: TOKENS.USDT,
//   address: "0x5f0155d08eF4aaE2B500AefB64A3419dA8bB611a",
//   decimal: 6
// };

export const FIXED_TOKENS_TO_APPROVE = "1000";
export const swapDeadline = BigNumber.from(Math.floor(Date.now() / 1000) + 60 * 20); // 10 minutes
export const slippage = 97; // %;
export const AMOUNT_NEON_TO_START_WITH = 20;
export const NEON_MOVED_PER_SET = 2;
export const NO_OF_SETS = 2;

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