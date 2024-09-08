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
exports.provider = void 0;
exports.swap = swap;
exports.swap_Neon_To = swap_Neon_To;
exports.swap_USDT_To = swap_USDT_To;
const providers_1 = require("@ethersproject/providers");
const units_1 = require("@ethersproject/units");
const wallet_1 = require("@ethersproject/wallet");
const constants_1 = require("../utils/constants");
const helpers_1 = require("../utils/helpers");
const config_1 = require("../config");
exports.provider = new providers_1.JsonRpcProvider(constants_1.PROXY_URL);
const wallet = new wallet_1.Wallet(constants_1.NEON_PRIVATE, exports.provider);
function swap(dex, TOKEN_FROM, TOKEN_TO, amountToSwap) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, helpers_1.swapTokens)(constants_1.DEXS[0], wallet, TOKEN_FROM, TOKEN_TO, amountToSwap);
    });
}
;
function swap_Neon_To() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 10; i++) {
            const balance = yield (0, helpers_1.getBalance)(exports.provider, constants_1.MAIN_ADDRESS[i], constants_1.WRAPPED_NEON_TOKEN);
            let noTimes = Math.floor(Number((0, units_1.formatUnits)(balance, constants_1.WRAPPED_NEON_TOKEN.decimal)));
            noTimes = noTimes < 12 ? noTimes : 12;
            for (let i = 0; i < noTimes; i++) {
                const rand = Math.floor(Math.random() * constants_1.DEXS.length); // use a random dex
                yield config_1.queues[i].add(`${constants_1.DEXS[rand].name}:-${constants_1.MAIN_ADDRESS[i]}:-${Date.now()}`, {
                    token: constants_1.WRAPPED_NEON_TOKEN,
                    account: constants_1.MAIN_ADDRESS[i],
                    dex: constants_1.DEXS[rand],
                    amount: (0, units_1.parseUnits)("1", constants_1.WRAPPED_NEON_TOKEN.decimal),
                }, { attempts: 2 });
            }
        }
    });
}
;
function swap_USDT_To() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < 10; i++) {
            const balance = yield (0, helpers_1.getBalance)(exports.provider, constants_1.MAIN_ADDRESS[i], constants_1.USDT_TOKEN);
            const splitBalance = balance.div(4);
            const rand = Math.floor(Math.random() * constants_1.DEXS.length); // use a random dex
            for (let i = 0; i < 3; i++) {
                yield config_1.queues[i].add(`${constants_1.DEXS[rand].name}:-${constants_1.MAIN_ADDRESS[i]}:-${Date.now()}`, {
                    token: constants_1.USDT_TOKEN,
                    account: constants_1.MAIN_ADDRESS[i],
                    dex: constants_1.DEXS[rand],
                    amount: splitBalance,
                }, { attempts: 2 });
            }
        }
    });
}
;
