import { PublicKey, Transaction, Keypair, Connection } from "@solana/web3.js";
import { LiquidityBookServices } from "@saros-finance/dlmm-sdk";
import BN from "bn.js";
import { getIdFromPrice,getPriceFromId} from "@saros-finance/dlmm-sdk/utils/price";
import { getMint,TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";


export async function createPositionByRange({
  poolAddress,
  lowerPrice,
  upperPrice,
  payer,
  liquidityBookServices,
  connection,
}: {
  poolAddress: PublicKey;
  lowerPrice: number;
  upperPrice: number;
  amountX?: number;
  amountY?: number;
  payer: PublicKey;
  liquidityBookServices: LiquidityBookServices;
  connection: Connection;
}): Promise<{ transaction: Transaction; position: string; positionMint: PublicKey; positionMintKeypair: Keypair }> {
  

  const pairInfo = await liquidityBookServices.getPairAccount(poolAddress);

  const activeId = pairInfo.activeId;

  const relativeBinIdLeft = 0;
  const relativeBinIdRight = 63;

  console.log("left",relativeBinIdLeft);
  console.log("right",relativeBinIdRight);
  

const binArrayIndex = Math.floor(activeId/256);

  // 7. Generate a new Keypair for the position mint (NFT)
  const positionMint = Keypair.generate();

  // 8. Prepare a transaction
  const transaction = new Transaction();

  

  // 10. Call createPosition and add the instruction
  const { position } = await liquidityBookServices.createPosition({
    payer,
    relativeBinIdLeft,
    relativeBinIdRight,
    pair: poolAddress,
    binArrayIndex,
    positionMint: positionMint.publicKey,
    transaction,
  });

  // 11. Return transaction and addresses
  return {
    transaction,
    position,
    positionMint: positionMint.publicKey,
    positionMintKeypair: positionMint, // Also return the keypair for signing
  };
}


