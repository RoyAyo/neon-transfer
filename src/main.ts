import { SPLToken } from '@neonevm/token-transfer-core';
import { transferSolanaToNeon, transferNeonToSolana } from './neon';
import { transferERC20TokenToSolana, transferSPLTokenToNeonEvm } from './transfer';

import tokensData from "./utils/token-list.json";

const main = async () => {
  try {
    
    const chainId = parseInt(`0xe9ac0ce`);
    const supportedTokens = ['USDT', 'USDC'];
    const tokens = (tokensData?.tokens as SPLToken[] ?? []).filter(t => t.chainId === chainId).filter(t => supportedTokens.includes(t.symbol));
    
    await runTransfers(tokens);
  } catch (error) {
    console.error("Error...", error);
  }
};

const runTransfers = async (tokens: SPLToken[]) => {
  // await transferNeonToSolana(1);

  // await transferSolanaToNeon(0.5);

  // await transferERC20TokenToSolana(tokens[0], 0.1);

  await transferSPLTokenToNeonEvm(tokens[0], 0.1);

  console.log("completed");
}

main();

console.log("started");