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
exports.getTransactionCount = getTransactionCount;
exports.swapNEON = swapNEON;
exports.swapUSDT = swapUSDT;
exports.ensureAllowance = ensureAllowance;
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
                yield (0, helpers_1.wrapNeon)(config_1.wallets[i], amountToSwap);
            }
        }
    });
}
function unWrapNeons(address, accIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance = yield (0, helpers_1.getBalance)(config_1.provider, address, constants_1.WRAPPED_NEON_TOKEN);
        console.log(balance);
        if (balance.gt(0)) {
            yield (0, helpers_1.unwrapNeon)(config_1.wallets[accIndex], balance);
            console.log("UNWRAPPED MY REMAINING NEON ", balance);
        }
    });
}
function swap(accountIndex, TOKEN_FROM, TOKEN_TO, dex, amountToSwap, nonce, count, job) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, helpers_1.swapTokens)(accountIndex, TOKEN_FROM, TOKEN_TO, dex, amountToSwap, nonce, count, job);
    });
}
;
function getTransactionCount(accIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const nonce = yield config_1.provider.getTransactionCount(config_1.MAIN_ADDRESS[accIndex], 'latest');
        const balance = yield (0, helpers_1.getBalance)(config_1.provider, config_1.MAIN_ADDRESS[accIndex], constants_1.WRAPPED_NEON_TOKEN);
        return {
            nonce,
            balance
        };
    });
}
function swapNEON(account_1, accIndex_1) {
    return __awaiter(this, arguments, void 0, function* (account, accIndex, n = 1) {
        if (account.balance.lte(0)) {
            config_1.loggers[accIndex].error("Not Enough Wrapped Neon To Transact");
            console.error(`${config_1.MAIN_ADDRESS[accIndex]} has 0 wNeon and cannot continue...`);
            return;
        }
        let noTimes = Math.floor(Number((0, units_1.formatUnits)(account.balance, constants_1.WRAPPED_NEON_TOKEN.decimal)));
        noTimes = noTimes < constants_1.NEON_MOVED_PER_SET ? noTimes : constants_1.NEON_MOVED_PER_SET;
        for (let j = 0; j < noTimes; j++) {
            config_1.queues[accIndex].add(`${config_1.MAIN_ADDRESS[accIndex]}-neon-job`, {
                token: constants_1.WRAPPED_NEON_TOKEN,
                amount: 1,
                count: n + j,
                accountIndex: accIndex,
                nonce: account.nonce + j,
            });
        }
    });
}
;
function swapUSDT(nonce, accIndex, count) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance = yield (0, helpers_1.getBalance)(config_1.provider, config_1.MAIN_ADDRESS[accIndex], constants_1.USDT_TOKEN);
        if (Number((0, units_1.formatUnits)(balance, constants_1.USDT_TOKEN.decimal)) <= 0) {
            console.log("USDT TOO SMALL FOR TRANSFER");
            ;
            return;
        }
        console.log("MOVING USDT WITH BALANCE ", (0, units_1.formatUnits)(balance, 6), " back");
        config_1.queues[accIndex].add(`${config_1.MAIN_ADDRESS[accIndex]}-usdt-job`, {
            token: constants_1.USDT_TOKEN,
            amount: (0, units_1.formatUnits)(balance, constants_1.USDT_TOKEN.decimal),
            count,
            accountIndex: accIndex,
            nonce: nonce,
        });
    });
}
;
function ensureAllowance() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < config_1.MAIN_ADDRESS.length; i++) {
            try {
                const allowance_NEON = yield (0, helpers_1.getAllowance)(config_1.wallets[i], constants_1.DEXS[0].router, constants_1.WRAPPED_NEON_TOKEN.address);
                const allowance_USDT = yield (0, helpers_1.getAllowance)(config_1.wallets[i], constants_1.DEXS[0].router, constants_1.USDT_TOKEN.address);
                const minAmount_Neon = (0, units_1.parseUnits)("100", constants_1.WRAPPED_NEON_TOKEN.decimal);
                const minAmount_USDT = (0, units_1.parseUnits)("100", constants_1.USDT_TOKEN.decimal);
                if (allowance_NEON.lt(minAmount_Neon)) {
                    console.error("INSUFFICIENT AMOUNT OF NEON ALLOWED FOR ADDRESS ", config_1.MAIN_ADDRESS[i]);
                    yield (0, helpers_1.approveToken)(config_1.wallets[i], constants_1.DEXS[0], constants_1.WRAPPED_NEON_TOKEN);
                    console.log(`APPROVED MORE TOKENS`);
                }
                if (allowance_USDT.lt(minAmount_USDT)) {
                    console.error("INSUFFICIENT AMOUNT OF USDT ALLOWED FOR ADDRESS ", config_1.MAIN_ADDRESS[i]);
                    yield (0, helpers_1.approveToken)(config_1.wallets[i], constants_1.DEXS[0], constants_1.USDT_TOKEN);
                    console.log(`APPROVED MORE TOKENS`);
                }
            }
            catch (error) {
                console.error("Unable to run approval for ", config_1.MAIN_ADDRESS[i]);
            }
        }
    });
}
