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
exports.wrapNeons = wrapNeons;
exports.unWrapNeons = unWrapNeons;
exports.swap = swap;
exports.getTransactionCounts = getTransactionCounts;
exports.swapNEON = swapNEON;
exports.swapUSDT = swapUSDT;
const units_1 = require("@ethersproject/units");
const config_1 = require("../config");
const constants_1 = require("../utils/constants");
const helpers_1 = require("../utils/helpers");
function wrapNeons() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < config_1.MAIN_ADDRESS.length; i++) {
            const amountToSwap = (0, units_1.parseUnits)(String(constants_1.AMOUNT_NEON_TO_START_WITH), constants_1.WRAPPED_NEON_TOKEN.decimal);
            const balance = yield (0, helpers_1.getBalance)(config_1.provider, config_1.MAIN_ADDRESS[i]);
            console.log(`My total NEON BALANCE for address ${config_1.MAIN_ADDRESS[i]} is ${(0, units_1.formatUnits)(balance, constants_1.WRAPPED_NEON_TOKEN.decimal)}`);
            if (Number((0, units_1.formatUnits)(balance, constants_1.WRAPPED_NEON_TOKEN.decimal)) < constants_1.AMOUNT_NEON_TO_START_WITH) {
                console.log(`Not enough Neon for the full process in ${config_1.MAIN_ADDRESS[i]}, deposit More ....`);
                continue;
            }
            else {
                yield (0, helpers_1.wrapNeon)(config_1.provider, config_1.wallets[i], config_1.MAIN_ADDRESS[i], amountToSwap);
            }
        }
    });
}
function unWrapNeons(address, accIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance = yield (0, helpers_1.getBalance)(config_1.provider, address, constants_1.WRAPPED_NEON_TOKEN);
        console.log(balance);
        if (balance.gt(0)) {
            yield (0, helpers_1.unwrapNeon)(config_1.provider, config_1.wallets[accIndex], address, balance);
            console.log("UNWRAPPED MY REMAINING NEON ", balance);
            console.log("process ended...");
        }
    });
}
function swap(wallet, dex, TOKEN_FROM, TOKEN_TO, address, amountToSwap, nonce) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, helpers_1.swapTokens)(wallet, dex, TOKEN_FROM, TOKEN_TO, address, amountToSwap, nonce);
    });
}
;
function getTransactionCounts() {
    return __awaiter(this, void 0, void 0, function* () {
        const txCounts = [];
        for (let i = 0; i < config_1.MAIN_ADDRESS.length; i++) {
            const nonce = yield config_1.provider.getTransactionCount(config_1.MAIN_ADDRESS[i], "pending");
            const balance = yield (0, helpers_1.getBalance)(config_1.provider, config_1.MAIN_ADDRESS[i], constants_1.WRAPPED_NEON_TOKEN);
            txCounts.push({
                nonce,
                balance
            });
        }
        return txCounts;
    });
}
function swapNEON(account_1) {
    return __awaiter(this, arguments, void 0, function* (account, n = 1) {
        for (let i = 0; i < config_1.MAIN_ADDRESS.length; i++) {
            if (account[i].balance.lte(0)) {
                continue;
            }
            let noTimes = Math.floor(Number((0, units_1.formatUnits)(account[i].balance, constants_1.WRAPPED_NEON_TOKEN.decimal)));
            noTimes = noTimes < constants_1.NEON_MOVED_PER_SET ? noTimes : constants_1.NEON_MOVED_PER_SET;
            for (let j = 0; j < noTimes; j++) {
                yield config_1.queues[i].add(`${config_1.MAIN_ADDRESS[i]}-neon-job`, {
                    token: constants_1.WRAPPED_NEON_TOKEN,
                    account: config_1.MAIN_ADDRESS[i],
                    amount: 1,
                    count: n + j,
                    accountIndex: i,
                    nonce: account[i].nonce + j,
                });
            }
        }
    });
}
;
function swapUSDT(account_1) {
    return __awaiter(this, arguments, void 0, function* (account, n = 1) {
        for (let i = 0; i < config_1.MAIN_ADDRESS.length; i++) {
            if (account[i].balance.lte(0)) {
                continue;
            }
            const balance = yield (0, helpers_1.getBalance)(config_1.provider, config_1.MAIN_ADDRESS[i], constants_1.USDT_TOKEN);
            yield config_1.queues[i].add(`${config_1.MAIN_ADDRESS[i]}-usdt-job`, {
                token: constants_1.USDT_TOKEN,
                account: config_1.MAIN_ADDRESS[i],
                amount: (0, units_1.formatUnits)(balance, constants_1.USDT_TOKEN.decimal),
                count: n + constants_1.NEON_MOVED_PER_SET,
                accountIndex: i,
                nonce: account[i].nonce + constants_1.NEON_MOVED_PER_SET,
            });
        }
    });
}
;
