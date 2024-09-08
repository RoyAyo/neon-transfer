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
const units_1 = require("@ethersproject/units");
const wallet_1 = require("@ethersproject/wallet");
const constants_1 = require("./utils/constants");
const helpers_1 = require("./utils/helpers");
const provider = new providers_1.JsonRpcProvider(constants_1.PROXY_URL);
const wallet = new wallet_1.Wallet(constants_1.NEON_PRIVATE, provider);
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let amountToSwap = (0, units_1.parseUnits)("30", constants_1.WRAPPED_NEON_TOKEN.decimal);
        const balance = yield (0, helpers_1.getBalance)(provider, wallet.address, constants_1.WRAPPED_NEON_TOKEN);
        console.log(`I have a balance of ${balance}`);
        yield (0, helpers_1.wrapNeon)(wallet, amountToSwap);
        console.log("Wrapped NEON INTO wneon");
        console.log("Started sending wNeon to usdt...");
        const swapRcpt = yield (0, helpers_1.swapTokens)(constants_1.DEXS[0], wallet, constants_1.WRAPPED_NEON_TOKEN, constants_1.USDT_TOKEN, amountToSwap);
        if (swapRcpt) {
            console.log("Sent wNeon to usdt..., ", swapRcpt);
            amountToSwap = (0, units_1.parseUnits)("1", constants_1.USDT_TOKEN.decimal);
            console.log("Started sending usdt to wneon...");
            const rcpt = yield (0, helpers_1.swapTokens)(constants_1.DEXS[0], wallet, constants_1.USDT_TOKEN, constants_1.WRAPPED_NEON_TOKEN, amountToSwap);
            console.log("Sent usdt..., ", rcpt);
        }
    });
})();
