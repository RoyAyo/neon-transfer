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
exports.swap_Neon_To = swap_Neon_To;
exports.swap_USDT_To = swap_USDT_To;
const providers_1 = require("@ethersproject/providers");
const units_1 = require("@ethersproject/units");
const wallet_1 = require("@ethersproject/wallet");
const constants_1 = require("../utils/constants");
const helpers_1 = require("../utils/helpers");
const config_1 = require("../config");
const provider = new providers_1.JsonRpcProvider(constants_1.PROXY_URL);
const wallet = new wallet_1.Wallet(constants_1.NEON_PRIVATE, provider);
function wrapNeons() {
    return __awaiter(this, void 0, void 0, function* () {
        const skip = Array(constants_1.MAIN_ADDRESS.length).fill(0);
        for (let i = 0; i < constants_1.MAIN_ADDRESS.length; i++) {
            const amountToSwap = (0, units_1.parseUnits)(String(constants_1.AMOUNT_NEON_TO_START_WITH), constants_1.WRAPPED_NEON_TOKEN.decimal);
            const balance = yield (0, helpers_1.getBalance)(provider, constants_1.MAIN_ADDRESS[i]);
            console.log(`My total NEON BALANCE for address ${constants_1.MAIN_ADDRESS[i]} is ${(0, units_1.formatUnits)(balance, constants_1.WRAPPED_NEON_TOKEN.decimal)}`);
            if (Number((0, units_1.formatUnits)(balance, constants_1.WRAPPED_NEON_TOKEN.decimal)) < constants_1.AMOUNT_NEON_TO_START_WITH) {
                console.log(`Not enough Neon for the full process in ${constants_1.MAIN_ADDRESS[i]}, deposit More ....`);
                skip[i] = 1;
                continue;
            }
            else {
                yield (0, helpers_1.wrapNeon)(wallet, constants_1.MAIN_ADDRESS[i], amountToSwap);
            }
        }
        return skip;
    });
}
function unWrapNeons(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const balance = yield (0, helpers_1.getBalance)(provider, address, constants_1.WRAPPED_NEON_TOKEN);
        yield (0, helpers_1.unwrapNeon)(wallet, address, balance);
        console.log("UNWRAPPED MY REMAINING NEON ", balance);
        console.log("process ended...");
    });
}
function swap(dex, TOKEN_FROM, TOKEN_TO, address, amountToSwap, nonce) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, helpers_1.swapTokens)(constants_1.DEXS[0], wallet, TOKEN_FROM, TOKEN_TO, address, amountToSwap, nonce);
    });
}
;
function swap_Neon_To(skip_1) {
    return __awaiter(this, arguments, void 0, function* (skip, n = 0) {
        const txcount = yield wallet.getTransactionCount();
        let nonce = txcount;
        for (let i = 0; i < constants_1.MAIN_ADDRESS.length; i++) {
            if (skip[i] === 1) {
                continue;
            }
            const balance = yield (0, helpers_1.getBalance)(provider, constants_1.MAIN_ADDRESS[i], constants_1.WRAPPED_NEON_TOKEN);
            let noTimes = Math.floor(Number((0, units_1.formatUnits)(balance, constants_1.WRAPPED_NEON_TOKEN.decimal)));
            noTimes = noTimes < 6 ? noTimes : 6;
            for (let j = 0; j < noTimes; j++) {
                const rand = Math.floor(Math.random() * constants_1.DEXS.length); // use a random dex
                nonce = (n + 1) * (j + txcount) + (n > 0 ? 1 : 0);
                yield config_1.queues[rand].add(`${constants_1.MAIN_ADDRESS[i]}`, {
                    token: constants_1.WRAPPED_NEON_TOKEN,
                    account: constants_1.MAIN_ADDRESS[i],
                    dex: constants_1.DEXS[rand],
                    amount: 1,
                    count: n,
                    i: j,
                    nonce,
                });
            }
        }
        return nonce;
    });
}
;
function swap_USDT_To(skip_1) {
    return __awaiter(this, arguments, void 0, function* (skip, nonce = 0, n = 0) {
        for (let i = 0; i < constants_1.MAIN_ADDRESS.length; i++) {
            if (skip[i] === 1) {
                continue;
            }
            const balance = yield (0, helpers_1.getBalance)(provider, constants_1.MAIN_ADDRESS[i], constants_1.USDT_TOKEN);
            const rand = Math.floor(Math.random() * constants_1.DEXS.length); // use a random dex
            yield config_1.queues[rand].add(`${constants_1.MAIN_ADDRESS[i]}`, {
                token: constants_1.USDT_TOKEN,
                account: constants_1.MAIN_ADDRESS[i],
                dex: constants_1.DEXS[rand],
                amount: (0, units_1.formatUnits)(balance, constants_1.USDT_TOKEN.decimal),
                count: n,
                i,
                nonce: nonce + 1,
            });
        }
    });
}
;
