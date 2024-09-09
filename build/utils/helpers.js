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
const config_1 = require("../config");
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function swapTokens(wallet_1, dex_1, TOKEN_ADDRESS_FROM_1, TOKEN_ADDRESS_TO_1, address_1, amountIn_1) {
    return __awaiter(this, arguments, void 0, function* (wallet, dex, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, address, amountIn, nonce = 0, accIndex = 0, count = 0) {
        const amountOutMinInTokenFrom = amountIn.mul(constants_1.slippage).div(100);
        const amountOutMinInTokenTo = yield checkPrice(wallet, dex, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, amountOutMinInTokenFrom);
        const path = [TOKEN_ADDRESS_FROM.address, TOKEN_ADDRESS_TO.address];
        const router = new contracts_1.Contract(dex.router, dex.abi, wallet);
        try {
            const gasPrice = (yield config_1.provider.getGasPrice()); //.mul(BigNumber.from(120)).div(100);
            console.log(`Transaction STARTED... Address: ${address}, Nonce: ${nonce} From: ${TOKEN_ADDRESS_FROM.name}`);
            const tx = yield router.swapExactTokensForTokens(amountIn, amountOutMinInTokenTo, path, address, constants_1.swapDeadline, {
                nonce,
                gasLimit: 1000000,
                gasPrice,
            });
            tx.wait().then((receipt) => {
                console.log(`swap successful: ${receipt.transactionHash}`);
                config_1.events[accIndex].emit('neon_complete', nonce, count);
                config_1.loggers[accIndex].info(`swap successful: ${receipt.transactionHash}`);
            }).catch((error) => {
                config_1.events[accIndex].emit('job_failed');
                config_1.loggers[accIndex].error(`Transaction with nonce ${nonce} failed:`, error);
            });
        }
        catch (error) {
            console.error(`Error executing trade on ${dex.name}:`, error);
            throw Error;
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
function checkPrice(wallet, dex, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, amountIn) {
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
function wrapNeon(wallet, amountToWrap) {
    return __awaiter(this, void 0, void 0, function* () {
        const wrapContract = new contracts_1.Contract(constants_1.WRAPPED_NEON_TOKEN.address, constants_1.ERC20_ABI, wallet);
        try {
            console.log("Wrapping Neon ...");
            const tx = yield wrapContract.deposit({
                value: amountToWrap
            });
            yield tx.wait();
            console.log("Wrapped NEON successfully: ", tx.hash);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function unwrapNeon(wallet, amountToUnwrap, nonce) {
    return __awaiter(this, void 0, void 0, function* () {
        const wrapContract = new contracts_1.Contract(constants_1.WRAPPED_NEON_TOKEN.address, constants_1.ERC20_ABI, wallet);
        // const gasPrice = (await provider.getGasPrice()).mul(BigNumber.from(2000)).div(100);
        try {
            console.log("Unwrapping Neon...");
            const tx = yield wrapContract.withdraw(amountToUnwrap);
            yield tx.wait();
            console.log(`Unwrapped NEON successfully: ${tx.hash}`);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function approveToken(wallet, dex, TOKEN_ADDRESS) {
    return __awaiter(this, void 0, void 0, function* () {
        const approvalAmount = (0, units_1.parseUnits)(constants_1.FIXED_TOKENS_TO_APPROVE, TOKEN_ADDRESS.decimal);
        const tokenContract = new contracts_1.Contract(TOKEN_ADDRESS.address, constants_1.ERC20_ABI, wallet);
        yield tokenContract.approve(dex.router, approvalAmount);
    });
}
function getAllowance(wallet, dexRouterAddress, TOKEN_ADDRESS) {
    return __awaiter(this, void 0, void 0, function* () {
        const tokenContract = new contracts_1.Contract(TOKEN_ADDRESS, constants_1.ERC20_ABI, wallet);
        const allowance = yield tokenContract.allowance(wallet.address, dexRouterAddress);
        return allowance;
    });
}
