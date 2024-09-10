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
exports.main = main;
exports.start = start;
const config_1 = require("./config");
const swap_1 = require("./swap");
const helpers_1 = require("./utils/helpers");
function main(nonce_1, accIndex_1) {
    return __awaiter(this, arguments, void 0, function* (nonce, accIndex, n = 1) {
        yield (0, swap_1.swapNEON)(nonce, accIndex, n);
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, swap_1.wrapNeons)();
            console.log("... ENSURING ALL TOKENS ARE APPROVED ...");
            yield (0, swap_1.ensureAllowance)();
            yield (0, helpers_1.delay)(10000); //adding delays to ensure the transaction nonce is updated...
            console.log("...TOKEN APPROVALS DONE...");
            for (let i = 0; i < config_1.MAIN_ADDRESS.length; i++) {
                const nonce = yield (0, swap_1.getTransactionCount)(i);
                main(nonce, i);
            }
        }
        catch (error) {
            console.error('APPLICATION ERROR: ', error);
        }
    });
}
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit();
});
process.on('uncaughtException', (reason, promise) => {
    console.error('Unhandled Exception at:', promise, 'reason:', reason);
    process.exit();
});
start();
