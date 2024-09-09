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
exports.delay = delay;
exports.swapTokens = swapTokens;
exports.getBalance = getBalance;
exports.checkPrice = checkPrice;
exports.wrapNeon = wrapNeon;
exports.unwrapNeon = unwrapNeon;
exports.approveToken = approveToken;
exports.getAllowance = getAllowance;
const bignumber_1 = require("@ethersproject/bignumber");
const contracts_1 = require("@ethersproject/contracts");
const constants_1 = require("./constants");
const units_1 = require("@ethersproject/units");
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function swapTokens(dex_1, wallet_1, TOKEN_ADDRESS_FROM_1, TOKEN_ADDRESS_TO_1, address_1, amountIn_1) {
    return __awaiter(this, arguments, void 0, function* (dex, wallet, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, address, amountIn, n = 0) {
        // keep this data in memory instead of in data..
        const allowance = yield getAllowance(dex.router, wallet, TOKEN_ADDRESS_FROM.address);
        if (allowance.lt(amountIn)) {
            console.error("INSUFFICIENT AMOUNT ALLOWED");
            yield approveToken(dex, wallet, TOKEN_ADDRESS_FROM);
            console.log("amount approved");
        }
        const amountOutMinInTokenFrom = amountIn.mul(constants_1.slippage).div(100);
        const amountOutMinInTokenTo = yield checkPrice(dex, wallet, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, amountOutMinInTokenFrom);
        const path = [TOKEN_ADDRESS_FROM.address, TOKEN_ADDRESS_TO.address];
        const router = new contracts_1.Contract(dex.router, dex.abi, wallet);
        try {
            console.log('transaction starting...');
            const tx = yield router.swapExactTokensForTokens(amountIn, amountOutMinInTokenTo, path, address, constants_1.swapDeadline);
            const receipt = yield tx.wait();
            console.log(`swap executed! successfully, ${receipt.transactionHash}`);
            return receipt;
        }
        catch (error) {
            console.error(`Error executing trade on ${dex.name}:`, error);
            return null;
        }
    });
}
function getBalance(provider, address, contractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        if (contractAddress) {
            const tokenContract = new contracts_1.Contract(contractAddress.address, constants_1.ERC20_ABI, provider);
            const balance = yield tokenContract.balanceOf(address);
            return balance;
        }
        else {
            const balance = yield provider.getBalance(address);
            return balance;
        }
    });
}
function checkPrice(dex, wallet, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, amountIn) {
    return __awaiter(this, void 0, void 0, function* () {
        const path = [TOKEN_ADDRESS_FROM.address, TOKEN_ADDRESS_TO.address];
        const router = new contracts_1.Contract(dex.router, dex.abi, wallet);
        try {
            const amounts = yield router.getAmountsOut(amountIn, path);
            return amounts[1];
        }
        catch (error) {
            console.error(`Error getting prices from ${dex.name}:`, error);
            return bignumber_1.BigNumber.from(0);
        }
    });
}
function wrapNeon(wallet, address, amountToWrap) {
    return __awaiter(this, void 0, void 0, function* () {
        const wrapContract = new contracts_1.Contract(address, constants_1.ERC20_ABI, wallet);
        const tx = yield wrapContract.deposit({ value: amountToWrap, gasPrice: (0, units_1.parseUnits)('0.0006', 18) });
        yield tx.wait();
        console.log("Wrapped NEON successfully: ", tx.hash);
    });
}
function unwrapNeon(wallet, address, amountToUnwrap) {
    return __awaiter(this, void 0, void 0, function* () {
        const wrapContract = new contracts_1.Contract(address, constants_1.ERC20_ABI, wallet);
        const tx = yield wrapContract.withdraw({ value: amountToUnwrap, gasPrice: (0, units_1.parseUnits)('0.0006', 18) });
        yield tx.wait();
        console.log(`Unwrapped NEON successfully: ${tx.hash}`);
    });
}
function approveToken(dex, wallet, TOKEN_ADDRESS) {
    return __awaiter(this, void 0, void 0, function* () {
        const approvalAmount = (0, units_1.parseUnits)(constants_1.FIXED_TOKENS_TO_APPROVE, TOKEN_ADDRESS.decimal);
        const tokenContract = new contracts_1.Contract(TOKEN_ADDRESS.address, constants_1.ERC20_ABI, wallet);
        yield tokenContract.approve(dex.router, approvalAmount);
        console.log("approved token");
    });
}
function getAllowance(dexRouterAddress, wallet, TOKEN_ADDRESS) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenContract = new contracts_1.Contract(TOKEN_ADDRESS, constants_1.ERC20_ABI, wallet);
        const allowance = yield tokenContract.allowance(wallet.address, dexRouterAddress);
        return allowance;
    });
}
