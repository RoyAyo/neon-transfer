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
        for (let i = 0; i < 10; i++) {
            const amountToSwap = (0, units_1.parseUnits)("20", constants_1.WRAPPED_NEON_TOKEN.decimal);
            const balance = yield (0, helpers_1.getBalance)(provider, constants_1.MAIN_ADDRESS[i]);
            console.log("My total NEON BALANCE is ", balance);
            if (Number((0, units_1.formatUnits)(balance, constants_1.WRAPPED_NEON_TOKEN.decimal)) < 20) {
                console.log("Not enough Neon for the full process, deposit More ....");
                process.exit();
            }
            yield (0, helpers_1.wrapNeon)(wallet, amountToSwap);
            console.log("WRAPPED 20 NEON FROM it");
        }
    });
}
function unWrapNeons() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 10; i++) {
            const balance = yield (0, helpers_1.getBalance)(provider, constants_1.MAIN_ADDRESS[i], constants_1.WRAPPED_NEON_TOKEN);
            yield (0, helpers_1.unwrapNeon)(wallet, balance);
            console.log("UNWRAPPED MY REMAINING NEON ", balance);
        }
    });
}
function swap(dex, TOKEN_FROM, TOKEN_TO, amountToSwap) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, helpers_1.swapTokens)(constants_1.DEXS[0], wallet, TOKEN_FROM, TOKEN_TO, amountToSwap);
    });
}
;
function swap_Neon_To() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 10; i++) {
            const balance = yield (0, helpers_1.getBalance)(provider, constants_1.MAIN_ADDRESS[i], constants_1.WRAPPED_NEON_TOKEN);
            let noTimes = Math.floor(Number((0, units_1.formatUnits)(balance, constants_1.WRAPPED_NEON_TOKEN.decimal)));
            noTimes = noTimes < 12 ? noTimes : 12;
            for (let i = 0; i < noTimes; i++) {
                const rand = Math.floor(Math.random() * constants_1.DEXS.length); // use a random dex
                yield config_1.queues[rand].add(`${constants_1.DEXS[rand].name}:-${constants_1.MAIN_ADDRESS[i]}:-${Date.now()}`, {
                    token: constants_1.WRAPPED_NEON_TOKEN,
                    account: constants_1.MAIN_ADDRESS[i],
                    dex: constants_1.DEXS[rand],
                    amount: (0, units_1.parseUnits)("1", constants_1.WRAPPED_NEON_TOKEN.decimal),
                    done: false,
                }, { attempts: 2 });
            }
        }
    });
}
;
function swap_USDT_To(n) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 10; i++) {
            const balance = yield (0, helpers_1.getBalance)(provider, constants_1.MAIN_ADDRESS[i], constants_1.USDT_TOKEN);
            const splitBalance = balance.div(4);
            const rand = Math.floor(Math.random() * constants_1.DEXS.length); // use a random dex
            for (let j = 0; j < 3; j++) {
                yield config_1.queues[rand].add(`${constants_1.DEXS[rand].name}:-${constants_1.MAIN_ADDRESS[i]}:-${Date.now()}`, {
                    token: constants_1.USDT_TOKEN,
                    account: constants_1.MAIN_ADDRESS[i],
                    dex: constants_1.DEXS[rand],
                    amount: splitBalance,
                    done: j == 2 && n == 2,
                }, { attempts: 2 });
            }
        }
    });
}
;
