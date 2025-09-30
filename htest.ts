import {LiquidityBookServices, MODE} from "@saros-finance/dlmm-sdk";
import { PublicKey } from "@solana/web3.js";
import { getIdFromPrice,getPriceFromId} from "@saros-finance/dlmm-sdk/utils/price";

const liquidityBookServices = new LiquidityBookServices({
    mode: MODE.DEVNET,
});

const pairInfo = await liquidityBookServices.getPairAccount(new PublicKey("4GZjVyf1YqNK9FHiVjQg9CnLw1Fwx5F9AP8ph1xiEjKE"));

const { binStep, tokenMintX, tokenMintY, tokenXDecimal, tokenYDecimal, activeId } = pairInfo;

console.log("binstep :",binStep);
console.log("active bin id",activeId);
console.log("pair info",pairInfo);


const PriceLow = getPriceFromId(binStep,activeId+800,6,9);
const PriceHigh = getPriceFromId(binStep,activeId+863,6,9);
const currentprice = getPriceFromId(binStep,activeId,6,9)

const Range = PriceHigh - PriceLow;

  console.log("PriceLow",PriceLow);
  console.log("PriceHigh",PriceHigh);
  console.log("currentPrice",currentprice)

  console.log("Range",Range);
  
  