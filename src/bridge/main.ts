import { SPLToken } from '@neonevm/token-transfer-core';
import { transferSolanaToNeon, transferNeonToSolana } from './bridge/neon';
import { transferERC20TokenToSolana, transferSPLTokenToNeonEvm } from './bridge/transfer';

import tokensData from "./bridge/utils/token-list.json";

const main = async () => {
  try {
    
    const chainId = parseInt(`0xe9ac0ce`);
    const supportedTokens = ['USDT', 'USDC'];
    const tokens = (tokensData?.tokens as SPLToken[] ?? []).filter(t => t.chainId === chainId).filter(t => supportedTokens.includes(t.symbol));
    console.log(tokens);
  } catch (error) {
    console.error("Error...", error);
  }
};