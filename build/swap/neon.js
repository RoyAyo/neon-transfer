"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const providers_1 = require("@ethersproject/providers");
const wallet_1 = require("@ethersproject/wallet");
const bignumber_1 = require("@ethersproject/bignumber");
const contracts_1 = require("@ethersproject/contracts");
const units_1 = require("@ethersproject/units");
require('dotenv').config({});
const NEON_PRIVATE = process.env.NEON_PRIVATE;
const WRAPPED_NEON = "0x11adC2d986E334137b9ad0a0F290771F31e9517F";
const USDT_TOKEN = "0x6eEf939FC6e2B3F440dCbB72Ea81Cd63B5a519A5";
const wrapAbi = [
    "function deposit() payable"
];
const MORASWAP_DEX = {
    name: "Moraswap",
    router: "0x491FFC6eE42FEfB4Edab9BA7D5F3e639959E081B",
    abi: [
        "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
        "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)"
    ]
};
function wrapNeon(amountToWrap) {
    return __awaiter(this, void 0, void 0, function* () {
        const wrapContract = new contracts_1.Contract(WRAPPED_NEON, wrapAbi, neonWallet);
        const tx = yield wrapContract.deposit({ value: amountToWrap });
        yield tx.wait();
        console.log("Wrapped NEON successfully");
    });
}
const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];
const proxyUrl = `https://devnet.neonevm.org`;
const provider = new providers_1.JsonRpcProvider(proxyUrl);
const neonWallet = new wallet_1.Wallet(NEON_PRIVATE, provider);
function checkPrice(amountIn) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = [WRAPPED_NEON, USDT_TOKEN];
        const router = new contracts_1.Contract(MORASWAP_DEX.router, MORASWAP_DEX.abi, neonWallet);
        try {
            const amounts = yield router.getAmountsOut(amountIn, path);
            console.log(amounts);
            return amounts[1];
        }
        catch (error) {
            console.error(`Error getting prices from ${MORASWAP_DEX.name}:`, error);
            return bignumber_1.BigNumber.from(0);
        }
    });
}
function swapTokens(amountIn, amountOutMin) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = [WRAPPED_NEON, USDT_TOKEN];
        const router = new contracts_1.Contract(MORASWAP_DEX.router, MORASWAP_DEX.abi, neonWallet);
        const deadline = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes from now
        try {
            const tx = yield router.swapExactTokensForTokens(amountIn, amountOutMin, path, neonWallet.address, deadline);
            yield tx.wait(); // Wait for the transaction to be mined
            console.log(`${MORASWAP_DEX.name} swap executed!`);
        }
        catch (error) {
            console.error(`Error executing trade on ${MORASWAP_DEX.name}:`, error);
        }
    });
}
function getBalance() {
    return __awaiter(this, void 0, void 0, function* () {
        // const tokenContract = new Contract(WRAPPED_NEON, erc20Abi, provider);
        // const balance = await tokenContract.balanceOf(neonWallet.address);
        const balance = yield provider.getBalance(neonWallet.address);
        // const price = await provider.getEtherPrice();
        console.log(provider);
        console.log((0, units_1.formatUnits)(balance, 18));
        // console.log(price);
    });
}
const amountIn = (0, units_1.parseUnits)("10", 18);
const minAmount = amountIn.mul(98).div(100);
// swapTokens(amountIn, minAmount);
// checkPrice(amountIn);
// getBalance();
wrapNeon(amountIn);
