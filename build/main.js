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
const swap_1 = require("./swap");
function main() {
    return __awaiter(this, arguments, void 0, function* (n = 1) {
        const nonce = yield (0, swap_1.getTransactionCounts)();
        // await swapNEON(nonce, n);
    });
}
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        // WRAP NEONS
        // await wrapNeons();
        // console.log("... ENSURING ALL TOKENS ARE APPROVED ...");
        // await ensureAllowance();
        // await delay(20000); //adding delays to ensure the transaction nonce is updated...
        // console.log("...DONE...");
        yield main();
    });
}
start();
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit();
});
