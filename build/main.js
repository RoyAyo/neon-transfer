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
exports.test = test;
const swap_1 = require("./swap");
function main() {
    return __awaiter(this, arguments, void 0, function* (n = 1) {
        const nonce = yield (0, swap_1.getTransactionCounts)();
        console.log(nonce);
        yield (0, swap_1.swapNEON)(nonce, n);
        yield (0, swap_1.swapUSDT)(nonce, n);
    });
}
main();
function test() {
    return __awaiter(this, void 0, void 0, function* () {
        const nonce = yield (0, swap_1.getTransactionCounts)();
        console.log(nonce);
        // await wrapNeons();
        // await unWrapNeons(MAIN_ADDRESS[0], 0);
    });
}
// test();
