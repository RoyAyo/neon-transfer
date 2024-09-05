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
exports.toSigner = toSigner;
exports.sendSolanaTransaction = sendSolanaTransaction;
exports.sendNeonTransactionEthers = sendNeonTransactionEthers;
function toSigner({ publicKey, secretKey }) {
    return { publicKey, secretKey };
}
function sendSolanaTransaction(connection_1, transaction_1, signers_1) {
    return __awaiter(this, arguments, void 0, function* (connection, transaction, signers, confirm = false, options) {
        transaction.recentBlockhash = (yield connection.getLatestBlockhash()).blockhash;
        transaction.sign(...signers);
        const signature = yield connection.sendRawTransaction(transaction.serialize(), options);
        if (confirm) {
            const { blockhash, lastValidBlockHeight } = yield connection.getLatestBlockhash();
            yield connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
        }
        return signature;
    });
}
function sendNeonTransactionEthers(transaction, signer) {
    return __awaiter(this, void 0, void 0, function* () {
        const receipt = yield signer.sendTransaction(transaction);
        return receipt.hash;
    });
}
