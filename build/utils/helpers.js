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
exports.addEvents = addEvents;
const bignumber_1 = require("@ethersproject/bignumber");
const contracts_1 = require("@ethersproject/contracts");
const units_1 = require("@ethersproject/units");
const constants_1 = require("./constants");
const config_1 = require("../config");
const swap_1 = require("../swap");
const main_1 = require("../main");
class TimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'TimeoutError';
    }
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function swapTokens(accountIndex_1, TOKEN_ADDRESS_FROM_1, TOKEN_ADDRESS_TO_1, dex_1, amountIn_1) {
    return __awaiter(this, arguments, void 0, function* (accountIndex, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, dex, amountIn, nonce = 0, count = 0, job) {
        const wallet = config_1.wallets[accountIndex];
        const amountOutMinInTokenFrom = amountIn.mul(constants_1.slippage).div(100);
        const amountOutMinInTokenTo = yield checkPrice(wallet, dex, TOKEN_ADDRESS_FROM, TOKEN_ADDRESS_TO, amountOutMinInTokenFrom);
        const parsedAmount = (0, units_1.formatUnits)(amountIn, TOKEN_ADDRESS_FROM.decimal);
        const path = [TOKEN_ADDRESS_FROM.address, TOKEN_ADDRESS_TO.address];
        const router = new contracts_1.Contract(dex.router, dex.abi, wallet);
        try {
            // const gasPrice = (await provider.getGasPrice()).mul(BigNumber.from(150)).div(100);
            console.log(`Transaction STARTED... Address: ${wallet.address}, Amount: ${parsedAmount} Nonce: ${nonce} From: ${TOKEN_ADDRESS_FROM.name}`);
            const tx = yield router.swapExactTokensForTokens(amountIn, amountOutMinInTokenTo, path, wallet.address, constants_1.swapDeadline, {
                nonce,
            });
            withTimeout(tx.wait(), 60000)
                .then((receipt) => {
                console.log(`swap successful: ${receipt.transactionHash}`);
                if (TOKEN_ADDRESS_FROM.address === constants_1.USDT_TOKEN.address) {
                    config_1.events[accountIndex].emit('usdt_complete', accountIndex, count);
                }
                else {
                    config_1.events[accountIndex].emit('neon_complete', nonce, accountIndex, count);
                }
                config_1.loggers[accountIndex].info(`swap successful: ${receipt.transactionHash}`);
            }).catch((error) => {
                config_1.events[accountIndex].emit('job_failed', job, error, accountIndex, nonce, count);
                config_1.loggers[accountIndex].error(`Transaction with nonce ${nonce} failed:`, error);
                console.error(error);
            });
        }
        catch (error) {
            config_1.loggers[accountIndex].error(`Transaction with nonce ${nonce} failed:`, error);
            config_1.events[accountIndex].emit('job_failed', job, error, accountIndex, nonce, count);
        }
    });
}
function withTimeout(promise, timeoutMs) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new TimeoutError(`Transaction timed out after ${timeoutMs} ms`));
        }, timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]);
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
function addEvents(event, i) {
    event.on('neon_complete', (nonce, accIndex, count) => __awaiter(this, void 0, void 0, function* () {
        console.log("Neon completed", count);
        if (count % constants_1.NEON_MOVED_PER_SET === 0) {
            console.log("SWAPPING USDT BACK");
            yield (0, swap_1.swapUSDT)(nonce + 1, accIndex, count);
        }
    }));
    event.on('usdt_complete', (accIndex, count) => __awaiter(this, void 0, void 0, function* () {
        if (count >= constants_1.NEON_MOVED_PER_SET * constants_1.NO_OF_SETS) {
            event.emit('job_complete', count);
        }
        else {
            console.log("BATCH COMPLETED...");
            delay(10000);
            const nonce = yield (0, swap_1.getTransactionCount)(accIndex);
            yield (0, main_1.main)(nonce, accIndex, count + 1);
        }
    }));
    event.on('job_complete', (accIndex, count) => __awaiter(this, void 0, void 0, function* () {
        console.log(`Total Transactions For Account: ${config_1.MAIN_ADDRESS[accIndex]} is  ${count + constants_1.NO_OF_SETS}`);
        yield (0, swap_1.unWrapNeons)(config_1.MAIN_ADDRESS[i], i);
        config_1.loggers[accIndex].info(`completed ${count + constants_1.NO_OF_SETS}`);
    }));
    event.on('job_failed', (job, error, accIndex, nonce, count) => __awaiter(this, void 0, void 0, function* () {
        console.log("Jobs FAILED: ", nonce, config_1.MAIN_ADDRESS[accIndex], count);
        if (error instanceof TimeoutError) {
            yield config_1.queues[accIndex].add(job.name, job.data);
        }
        else {
            if (error.message.split(" ")[0] === 'nonce' || error.message.split(" ")[0] === 'replacement') {
                delay(4000);
                const nonce = yield (0, swap_1.getTransactionCount)(accIndex);
                (0, main_1.main)(nonce, count);
            }
            else {
                console.error("Please restart server for address, ", config_1.MAIN_ADDRESS[accIndex]);
            }
        }
    }));
}
