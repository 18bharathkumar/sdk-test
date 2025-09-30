import { PublicKey, SystemProgram, Connection, NonceAccount } from "@solana/web3.js";

import { LiquidityBookServices,MODE } from "@saros-finance/dlmm-sdk";

import { loadWalletFromEnv } from "./wallet";

const liquidityBookServices = new LiquidityBookServices({
    mode: MODE.DEVNET
  });

const connection = new Connection("https://api.devnet.solana.com ")

const noncePubkey = new PublicKey("FpEiWv8X8yCf3HpdYM6Ktx1MWc6iCgqB7xtkuknoYrnN");

const wallet = loadWalletFromEnv();

console.log("wallet",wallet.publicKey.toString())

const POOL_ADDRESS = "EsnucJ1pYemqEBek2yx6M1DBQEsF6rTJ4kE7jNf7mNqP"

const poolmetadata = await liquidityBookServices.fetchPoolMetadata(POOL_ADDRESS);

console.log("pool metadata",poolmetadata)

const quoteData = await liquidityBookServices.getQuote({
    amount: BigInt(1e9), 
    isExactInput: true,
    swapForY: true, 
    pair: new PublicKey(POOL_ADDRESS),
    tokenBase: new PublicKey(poolmetadata.baseMint),
    tokenQuote: new PublicKey(poolmetadata.quoteMint),
    tokenBaseDecimal: poolmetadata.extra.tokenBaseDecimal,
    tokenQuoteDecimal: poolmetadata.extra.tokenQuoteDecimal,
    slippage: 5.0 // 5% slippage
})

const { amountIn, amountOut, priceImpact, amount, otherAmountOffset } = quoteData;

console.log("amount out",amountOut);
console.log("amount In",amountIn);
console.log("price impact",priceImpact)

const transaction = await liquidityBookServices.swap({
  tokenMintX:new PublicKey(poolmetadata.baseMint),
  tokenMintY: new PublicKey(poolmetadata.quoteMint),
  amount:amount,
  otherAmountOffset:otherAmountOffset,
  swapForY:true,
  isExactInput:true,
  pair:new PublicKey(POOL_ADDRESS),
  // @ts-ignore - omit hook for pools with incompatible hook accounts
  hook: null,
  payer:wallet.publicKey

});

  const advanceIx = SystemProgram.nonceAdvance({
    noncePubkey,
    authorizedPubkey: wallet.publicKey,
  });

  
  const nonceAccountInfo = await connection.getAccountInfo(noncePubkey);

  if(nonceAccountInfo){

  const nonceData = NonceAccount.fromAccountData(nonceAccountInfo.data);

  transaction.recentBlockhash = nonceData.nonce;
  transaction.nonceInfo = {
    nonce: nonceData.nonce,
    nonceInstruction: advanceIx,
  };

  transaction.sign(wallet);

  const encodetx = transaction.serialize().toString("base64");

  console.log(encodetx);

  }









