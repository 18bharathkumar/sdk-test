  import {
    BIN_STEP_CONFIGS,
    MODE,
    LiquidityBookServices

  } from "@saros-finance/dlmm-sdk";
  import { Connection, Keypair, PublicKey } from "@solana/web3.js";
  import { getPriceFromId } from "@saros-finance/dlmm-sdk/utils/price";
  import axios from "axios";
  import { Metaplex } from "@metaplex-foundation/js";
  import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";

  const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=ea785adc-5ca5-46ee-8c99-9fc185fac778");

  const liquidityBookServices = new LiquidityBookServices({
    mode: MODE.MAINNET,
    options: {
      rpcUrl: "https://mainnet.helius-rpc.com/?api-key=ea785adc-5ca5-46ee-8c99-9fc185fac778"
    }
  });

  // Initialize Metaplex for token metadata
  const metaplex = Metaplex.make(connection);

  const BASE_URL = "https://api.geckoterminal.com/api/v2";

  // Helper function to fetch token metadata directly from blockchain
  async function getTokenMetadata(mintAddress: string) {
    try {
      const mint = new PublicKey(mintAddress);

      // This automatically fetches and parses the Token Metadata PDA
      const nft = await metaplex.nfts().findByMint({ mintAddress: mint });



      // nft.json is the off-chain JSON (image, description, etc.)
      const json = nft.json ?? {};

      return {
        name: nft.name,
        symbol: nft.symbol,
        image: json.image ?? "",
        description: json.description ?? ""
      };
    } catch (err) {
      console.log(`Error fetching metadata for ${mintAddress}:`, err);
      return null;
    }
  }

  interface Pool {
    pooladdress: string,
    basemint:string,
    quotemint:string,
    currentprice: number,
    onehrchange: number,
    onedaychange: number,
    totalliquidity: number,
    baseSymbol: string,
    baseLogo: string,// logo url 
    quoteSymbol: string,
    quoteLogo: string,// logo url 
    numofBase: number,
    numofQuote: number
  }



  const pairs = [
    "GNDi5xLZm26vpVyBbVL9JrDPXR88nQfcPPsmnZQQcbTh",
    "5oHzwyk2ScxDL2RNiQ7CVnYhy8d73VhvKmSmFVDNhNkZ",
    "66NfVa5x57rUArqtUg4JPN6cSnHtwyRfubSCgVJLoWPi",
    "8vZHTVMdYvcPFUoHBEbcFyfSKnjWtvbNgYpXg1aiC2uS",
  ]

  let poolsInfo: Pool[] = [];

  for await (const pair of pairs) {

    const pooldata = await liquidityBookServices.fetchPoolMetadata(pair);

    let pool: Pool = {
      pooladdress: pair,
      basemint:pooldata.baseMint,
      quotemint:pooldata.quoteMint,
      currentprice: 0,
      onehrchange: 0,
      onedaychange: 0,
      totalliquidity: 0,
      baseSymbol: "",
      baseLogo: "",
      quoteSymbol: "",
      quoteLogo: "",
      numofBase: 0,
      numofQuote: 0
    };


    const tokenBaseDecimal = pooldata.extra.tokenBaseDecimal;

    const tokenQuoteDecimal = pooldata.extra.tokenQuoteDecimal;

    const pairInfo = await liquidityBookServices.getPairAccount(new PublicKey(pair));

    const activeId = pairInfo.activeId;
    const binStep = pairInfo.binStep;

    const price = getPriceFromId(binStep, activeId, tokenBaseDecimal, tokenQuoteDecimal);


    pool.currentprice = price;

    const res1 = await axios.get(`${BASE_URL}/networks/solana/pools/${pair}/ohlcv/hour?limit=1`);

    const ohlcv1 = res1.data.data.attributes.ohlcv_list[0];

    pool.onehrchange = 100 * (ohlcv1[4] - ohlcv1[1]) / ohlcv1[1];

    const res2 = await axios.get(`${BASE_URL}/networks/solana/pools/${pair}/ohlcv/day?limit=1`);

    const ohlcv2 = res2.data.data.attributes.ohlcv_list[0];

    pool.onedaychange = 100 * (ohlcv2[4] - ohlcv2[1]) / ohlcv2[1];

    pool.baseSymbol = res1.data.meta.base.symbol;
    pool.quoteSymbol = res1.data.meta.quote.symbol;
    pool.numofBase = Number(pooldata.baseReserve) / tokenBaseDecimal;
    pool.numofQuote = Number(pooldata.quoteReserve) / tokenQuoteDecimal;

    pool.quoteLogo = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png";

    if(pool.basemint == "So11111111111111111111111111111111111111112"){
      pool.baseLogo = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
    }

    else{
    // Fetch token logos directly from blockchain metadata
    try {
      // Fetch metadata for both tokens in parallel using our custom function
      const baseMetadata = await getTokenMetadata(pooldata.baseMint);
      pool.baseLogo = baseMetadata?.image ?? "";

    } catch (error) {
      console.log("Error fetching token metadata from blockchain:", error);
      pool.baseLogo = "";
      pool.quoteLogo = "";
    }
  }

    pool.totalliquidity = pool.numofBase*pool.currentprice + pool.numofQuote;

  poolsInfo = [...poolsInfo, pool];

  }

  console.log("Final pools data:", poolsInfo);

