import { Connection, PublicKey } from "@solana/web3.js";
import { LiquidityBookServices, MODE } from "@saros-finance/dlmm-sdk";
import { getPriceFromId } from "@saros-finance/dlmm-sdk/utils/price";

const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_ENDPOINT);
const POOL_ADDRESS = "GNDi5xLZm26vpVyBbVL9JrDPXR88nQfcPPsmnZQQcbTh";
const poolAddress = new PublicKey(POOL_ADDRESS);

const liquidityBookServices = new LiquidityBookServices({ mode: MODE.MAINNET });

export function startPriceWatcher() {
  async function fetchCurrentPrice() {
    try {
      const pairInfo = await liquidityBookServices.getPairAccount(poolAddress);
      const pairMetadata = await liquidityBookServices.fetchPoolMetadata(POOL_ADDRESS);

      const tokenBaseDecimal = pairMetadata.extra.tokenBaseDecimal;
      const tokenQuoteDecimal = pairMetadata.extra.tokenQuoteDecimal;
      const activeBinId = pairInfo.activeId;

      let currentPrice = getPriceFromId(pairInfo.binStep, activeBinId, tokenBaseDecimal, tokenQuoteDecimal);
      currentPrice = Number(currentPrice.toFixed(6));

      console.log("current price",currentPrice)

    } catch (err) {
      console.error("Failed to fetch current price:", err);
    }
  }

  connection.onAccountChange(poolAddress, () => {
    fetchCurrentPrice();
  }, "confirmed");

  fetchCurrentPrice();
}
