require('dotenv').config({});

export const NEON_PRIVATE = process.env.NEON_PRIVATE;
export const PROXY_URL = `https://devnet.neonevm.org`;

export const WRAPPED_NEON = "0x11adC2d986E334137b9ad0a0F290771F31e9517F"
export const USDT_TOKEN = "0x6eEf939FC6e2B3F440dCbB72Ea81Cd63B5a519A5";

export const swapDeadline = Math.floor(Date.now() / 1000) + 60 * 20; // 10 minutes
export const slippage = [ 98, 100 ]; // 98%;

export const ERC20_ABI = [
    "function deposit() payable",
    "function withdraw(uint256 amount)",
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

export const MORASWAP_DEX = {
    name: "Moraswap",
    router: "0x491FFC6eE42FEfB4Edab9BA7D5F3e639959E081B",
    abi: [
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
      "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)"
    ]
};