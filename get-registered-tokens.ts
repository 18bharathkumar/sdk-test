import {
  MODE,
  LiquidityBookServices,
} from "@saros-finance/dlmm-sdk";
import { PublicKey } from "@solana/web3.js";

// Initialize Saros services
const liquidityBookServices = new LiquidityBookServices({
  mode: MODE.DEVNET,
});

// Function to get all registered tokens and pools
const getAllRegisteredTokens = async () => {
  try {
    console.log("🔍 Fetching all registered tokens from Saros protocol...");
    
    // 1. Get all pool addresses
    const poolAddresses = await liquidityBookServices.fetchPoolAddresses();
    console.log(`✅ Found ${poolAddresses.length} pools`);
    
    if (poolAddresses.length === 0) {
      console.log("❌ No pools found. Protocol might be empty or not initialized.");
      return { allTokens: [], poolDetails: [] };
    }
    
    // 2. Get metadata for each pool
    const allTokens = new Set<string>();
    const poolDetails = [];
    const tokenDetails = new Map<string, { symbol: string, decimals: number, pools: string[] }>();
    
    console.log("📊 Fetching pool metadata...");
    
    for (let i = 0; i < 2; i++) {
      const poolAddress = poolAddresses[i];
      try {
        console.log(`\n🔄 Processing pool ${i + 1}/${poolAddresses.length}: ${poolAddress}`);
        
        const metadata = await liquidityBookServices.fetchPoolMetadata(poolAddress);
        
        // Add tokens to set to avoid duplicates
        allTokens.add(metadata.baseMint);
        allTokens.add(metadata.quoteMint);
        
        // Store pool details
        poolDetails.push({
          poolAddress,
          baseToken: metadata.baseMint,
          quoteToken: metadata.quoteMint,
          tradeFee: metadata.tradeFee,
          baseReserve: metadata.baseReserve,
          quoteReserve: metadata.quoteReserve,
          baseDecimal: metadata.extra.tokenBaseDecimal,
          quoteDecimal: metadata.extra.tokenQuoteDecimal
        });
        
        // Track token usage across pools
        if (!tokenDetails.has(metadata.baseMint)) {
          tokenDetails.set(metadata.baseMint, {
            symbol: `Token-${metadata.baseMint.slice(0, 8)}...`,
            decimals: metadata.extra.tokenBaseDecimal,
            pools: []
          });
        }
        if (!tokenDetails.has(metadata.quoteMint)) {
          tokenDetails.set(metadata.quoteMint, {
            symbol: `Token-${metadata.quoteMint.slice(0, 8)}...`,
            decimals: metadata.extra.tokenQuoteDecimal,
            pools: []
          });
        }
        
        tokenDetails.get(metadata.baseMint)!.pools.push(poolAddress);
        tokenDetails.get(metadata.quoteMint)!.pools.push(poolAddress);
        
      } catch (error) {
        console.log(`❌ Error fetching metadata for pool ${poolAddress}:`, error);
      }
    }
    
    // 3. Display results
    console.log("\n" + "=".repeat(80));
    console.log("🎯 SAROS PROTOCOL - REGISTERED TOKENS SUMMARY");
    console.log("=".repeat(80));
    
    console.log(`\n📈 Total Pools: ${poolAddresses.length}`);
    console.log(`🪙 Total Unique Tokens: ${allTokens.size}`);
    
    console.log("\n" + "-".repeat(80));
    console.log("🔍 ALL REGISTERED TOKENS");
    console.log("-".repeat(80));
    
    Array.from(allTokens).forEach((token, index) => {
      const details = tokenDetails.get(token);
      const poolCount = details?.pools.length || 0;
      console.log(`${(index + 1).toString().padStart(3, ' ')}. ${token}`);
      console.log(`    📊 Used in ${poolCount} pool(s)`);
      console.log(`    🔢 Decimals: ${details?.decimals || 'Unknown'}`);
    });
    
    console.log("\n" + "-".repeat(80));
    console.log("🏊 POOL DETAILS");
    console.log("-".repeat(80));
    
    poolDetails.forEach((pool, index) => {
      console.log(`\n${(index + 1).toString().padStart(3, ' ')}. Pool: ${pool.poolAddress}`);
      console.log(`   🪙 Base Token: ${pool.baseToken}`);
      console.log(`   🪙 Quote Token: ${pool.quoteToken}`);
      console.log(`   💰 Trade Fee: ${pool.tradeFee.toFixed(4)}%`);
      console.log(`   📊 Base Reserve: ${pool.baseReserve}`);
      console.log(`   📊 Quote Reserve: ${pool.quoteReserve}`);
      console.log(`   🔢 Base Decimals: ${pool.baseDecimal}`);
      console.log(`   🔢 Quote Decimals: ${pool.quoteDecimal}`);
    });
    
    // 4. Save to file (optional)
    const summary = {
      totalPools: poolAddresses.length,
      totalTokens: allTokens.size,
      tokens: Array.from(allTokens),
      pools: poolDetails,
      tokenDetails: Object.fromEntries(tokenDetails)
    };
    
    console.log("\n" + "=".repeat(80));
    console.log("💾 SUMMARY DATA");
    console.log("=".repeat(80));
    console.log(JSON.stringify(summary, null, 2));
    
    return { allTokens: Array.from(allTokens), poolDetails, tokenDetails };
    
  } catch (error) {
    console.error("❌ Error fetching registered tokens:", error);
    throw error;
  }
};

// Function to check if a specific token is registered
const isTokenRegistered = async (tokenMint: string) => {
  try {
    console.log(`🔍 Checking if token ${tokenMint} is registered...`);
    
    const poolAddresses = await liquidityBookServices.fetchPoolAddresses();
    const foundPools = [];
    
    for (const poolAddress of poolAddresses) {
      try {
        const metadata = await liquidityBookServices.fetchPoolMetadata(poolAddress);
        
        if (metadata.baseMint === tokenMint || metadata.quoteMint === tokenMint) {
          const role = metadata.baseMint === tokenMint ? "Base Token" : "Quote Token";
          foundPools.push({
            poolAddress,
            role,
            pairToken: metadata.baseMint === tokenMint ? metadata.quoteMint : metadata.baseMint,
            tradeFee: metadata.tradeFee
          });
        }
      } catch (error) {
        // Skip pools with errors
      }
    }
    
    if (foundPools.length > 0) {
      console.log(`✅ Token ${tokenMint} is registered in ${foundPools.length} pool(s):`);
      foundPools.forEach((pool, index) => {
        console.log(`   ${index + 1}. Pool: ${pool.poolAddress}`);
        console.log(`      Role: ${pool.role}`);
        console.log(`      Paired with: ${pool.pairToken}`);
        console.log(`      Trade Fee: ${pool.tradeFee.toFixed(4)}%`);
      });
      return true;
    } else {
      console.log(`❌ Token ${tokenMint} is NOT registered in any pool`);
      return false;
    }
    
  } catch (error) {
    console.error("❌ Error checking token registration:", error);
    return false;
  }
};

// Function to get token statistics
const getTokenStatistics = async () => {
  try {
    const poolAddresses = await liquidityBookServices.fetchPoolAddresses();
    const tokenStats = new Map<string, { pools: number, totalVolume: number, fees: number }>();
    
    for (const poolAddress of poolAddresses) {
      try {
        const metadata = await liquidityBookServices.fetchPoolMetadata(poolAddress);
        
        // Update base token stats
        if (!tokenStats.has(metadata.baseMint)) {
          tokenStats.set(metadata.baseMint, { pools: 0, totalVolume: 0, fees: 0 });
        }
        const baseStats = tokenStats.get(metadata.baseMint)!;
        baseStats.pools += 1;
        baseStats.fees += metadata.tradeFee;
        
        // Update quote token stats
        if (!tokenStats.has(metadata.quoteMint)) {
          tokenStats.set(metadata.quoteMint, { pools: 0, totalVolume: 0, fees: 0 });
        }
        const quoteStats = tokenStats.get(metadata.quoteMint)!;
        quoteStats.pools += 1;
        quoteStats.fees += metadata.tradeFee;
        
      } catch (error) {
        // Skip pools with errors
      }
    }
    
    console.log("\n📊 TOKEN STATISTICS");
    console.log("-".repeat(50));
    
    Array.from(tokenStats.entries())
      .sort((a, b) => b[1].pools - a[1].pools)
      .forEach(([token, stats]) => {
        console.log(`\n🪙 ${token}`);
        console.log(`   📊 Pools: ${stats.pools}`);
        console.log(`   💰 Avg Fee: ${(stats.fees / stats.pools).toFixed(4)}%`);
      });
    
    return tokenStats;
    
  } catch (error) {
    console.error("❌ Error getting token statistics:", error);
    return new Map();
  }
};

// Main execution function
const main = async () => {
  try {
    console.log("🚀 Starting Saros Protocol Token Discovery...");
    console.log("Network:", MODE.DEVNET);
    console.log("Program ID:", liquidityBookServices.getDexProgramId());
    
    // Get all registered tokens
    const result = await getAllRegisteredTokens();
    
    // Get token statistics
    await getTokenStatistics();
    
    // Example: Check if a specific token is registered
    console.log("\n" + "=".repeat(80));
    console.log("🔍 CHECKING SPECIFIC TOKENS");
    console.log("=".repeat(80));
    
    // Check some common tokens
    const tokensToCheck = [
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
      "So11111111111111111111111111111111111111112",     // SOL
      "4Gs9NLW8CTnk39NkMAJdvFnAEmC8ZStkXhfajKgx6Vwp"  // Your MY_TOKEN
    ];
    
    for (const token of tokensToCheck) {
      await isTokenRegistered(token);
      console.log(""); // Empty line for readability
    }
    
    console.log("✅ Token discovery completed successfully!");
    
  } catch (error) {
    console.error("❌ Main execution failed:", error);
  }
};

// Export functions for use in other files
export {
  getAllRegisteredTokens,
  isTokenRegistered,
  getTokenStatistics
};

// Run the script if this file is executed directly
if (require.main === module) {
  main();
}
