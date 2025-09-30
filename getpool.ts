import {
  BIN_STEP_CONFIGS,
  MODE,
  LiquidityBookServices
} from "@saros-finance/dlmm-sdk";
import { Connection, Keypair } from "@solana/web3.js";
import { loadWalletFromEnv } from "./wallet";

import { PublicKey } from "@solana/web3.js";

const liquidityBookServices = new LiquidityBookServices({
  mode: MODE.DEVNET
});

const pool = await liquidityBookServices.fetchPoolAddresses();

console.log("length",pool.length)


for await (const pair of pool) {

  if (pair) {
    const pooldata = await liquidityBookServices.fetchPoolMetadata(pair);

    if (Number(pooldata.baseReserve) > 0 && Number(pooldata.quoteReserve) > 0 && (pooldata.baseMint == "So11111111111111111111111111111111111111112" || pooldata.quoteMint == "So11111111111111111111111111111111111111112")) {
      console.log(pooldata);
    }

  }
}

"https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png"


