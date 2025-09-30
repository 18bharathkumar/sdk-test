# 🏊 Saros DLMM Pool Creation Guide

## 📖 Overview

This project demonstrates how to create a liquidity pool on the Saros Decentralized Liquidity Market Maker (DLMM) protocol. The pool allows users to trade between your custom token (MY_TOKEN) and SOL, earning fees from every trade.

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run the pool creation script
bun run test.ts

# View registered tokens
bun run get-registered-tokens.ts
```

---

## 🏗️ Pool Creation Script (`test.ts`)

### **What This Script Does**

The `test.ts` script creates a new liquidity pool between two tokens on the Saros protocol. Think of it as opening a new trading store where people can buy and sell your tokens.

### **Key Components**

#### **1. Token Configuration**

```typescript
const MY_TOKEN = {
  id: "Moti07",
  mintAddress: "823dshUxb3RNf1NXVX28smC7VGHaTusESJJX3GpKW2R9",
  symbol: "Token-mntLe6A4...",
  name: "Token-mntLe6A4...",
  decimals: 6,
  addressSPL: "823dshUxb3RNf1NXVX28smC7VGHaTusESJJX3GpKW2R9",
}

const USDC_TOKEN = {
  id: "sol",
  mintAddress: "So11111111111111111111111111111111111111112", // SOL
  name: "sol",
  decimals: 6,
  addressSPL: "So11111111111111111111111111111111111111112",
};
```

**What Each Field Means:**
- **`id`**: Unique identifier for your token
- **`mintAddress`**: The actual token address on Solana blockchain
- **`symbol`**: Short name for your token (like "BTC" for Bitcoin)
- **`name`**: Full name of your token
- **`decimals`**: How many decimal places your token supports (6 = 0.000001 precision)
- **`addressSPL`**: Associated token account address for your wallet

#### **2. Pool Parameters**

```typescript
const binStep = BIN_STEP_CONFIGS?.[3]?.binStep ?? 0; // Bin step 5
const ratePrice = 1; // 1:1 ratio
```

**`binStep`**: This is the **MOST IMPORTANT** parameter that determines your pool's price precision and fee structure.

**`ratePrice`**: The starting price ratio between your tokens (1:1 means 1 MY_TOKEN = 1 SOL).

---

## 🎯 Understanding Bin Steps

### **What is a Bin Step?**

A **bin step** is like the "resolution" of your price chart. It determines how finely your pool can track price changes.

### **Available Bin Steps**

```typescript
// From config.ts - these are your options:
BIN_STEP_CONFIGS = [
  { binStep: 1,   feeParameters: {...} },  // 0.01% price changes
  { binStep: 2,   feeParameters: {...} },  // 0.02% price changes  
  { binStep: 5,   feeParameters: {...} },  // 0.05% price changes ← YOUR CHOICE
  { binStep: 10,  feeParameters: {...} },  // 0.10% price changes
  { binStep: 20,  feeParameters: {...} },  // 0.20% price changes
  { binStep: 50,  feeParameters: {...} },  // 0.50% price changes
  { binStep: 100, feeParameters: {...} },  // 1.00% price changes
  { binStep: 200, feeParameters: {...} },  // 2.00% price changes
  { binStep: 250, feeParameters: {...} },  // 2.50% price changes
]
```

### **Your Choice: Bin Step 5**

```typescript
const binStep = BIN_STEP_CONFIGS?.[3]?.binStep ?? 0; // Index 3 = binStep 5
```

**What Bin Step 5 Means:**
- **Price Precision**: 0.05% increments
- **Price Range**: Your pool can handle prices from 0.9980 to 1.0020 SOL per MY_TOKEN
- **Fee Structure**: Based on the binStep 5 configuration

---

## 💰 Fee Structure for Each Bin Step

### **Bin Step 1 (Ultra High Precision)**
```typescript
{
  binStep: 1,
  feeParameters: {
    baseFactor: 10000,           // 0.1% base fee
    filterPeriod: 10,            // Update fees every 10 blocks
    decayPeriod: 120,            // Fee decay over 120 blocks
    reductionFactor: 5000,       // Fee reduction logic
    variableFeeControl: 2000000, // High dynamic fee control
    maxVolatilityAccumulator: 100000, // Low volatility tolerance
    protocolShare: 2000          // 0.2% protocol fee
  }
}
// Total Fee: ~0.12% (0.1% + 0.02%)
// Best for: High-frequency trading, stable pairs
```

### **Bin Step 5 (Your Choice - High Precision)**
```typescript
{
  binStep: 5,
  feeParameters: {
    baseFactor: 10000,           // 0.1% base fee
    filterPeriod: 30,            // Update fees every 30 blocks
    decayPeriod: 600,            // Fee decay over 600 blocks
    reductionFactor: 5000,       // Fee reduction logic
    variableFeeControl: 120000,  // Medium dynamic fee control
    maxVolatilityAccumulator: 300000, // Medium volatility tolerance
    protocolShare: 2000          // 0.2% protocol fee
  }
}
// Total Fee: ~0.12% (0.1% + 0.02%)
// Best for: Active trading, moderate volatility
```

### **Bin Step 10 (Medium Precision)**
```typescript
{
  binStep: 10,
  feeParameters: {
    baseFactor: 10000,           // 0.1% base fee
    filterPeriod: 30,            // Update fees every 30 blocks
    decayPeriod: 600,            // Fee decay over 600 blocks
    reductionFactor: 5000,       // Fee reduction logic
    variableFeeControl: 40000,   // Lower dynamic fee control
    maxVolatilityAccumulator: 350000, // Higher volatility tolerance
    protocolShare: 2000          // 0.2% protocol fee
  }
}
// Total Fee: ~0.12% (0.1% + 0.02%)
// Best for: Less active trading, higher volatility
```

### **Bin Step 100+ (Low Precision)**
```typescript
{
  binStep: 100,
  feeParameters: {
    baseFactor: 10000,           // 0.1% base fee
    filterPeriod: 300,           // Update fees every 300 blocks
    decayPeriod: 1200,           // Fee decay over 1200 blocks
    reductionFactor: 5000,       // Fee reduction logic
    variableFeeControl: 7500,    // Low dynamic fee control
    maxVolatilityAccumulator: 150000, // High volatility tolerance
    protocolShare: 2000          // 0.2% protocol fee
  }
}
// Total Fee: ~0.12% (0.1% + 0.02%)
// Best for: Long-term holding, very high volatility
```

---

## 🎯 How to Choose the Right Bin Step

### **Choose Bin Step 1-5 If:**
- ✅ You want **maximum precision** (tiny price movements)
- ✅ Your tokens are **stable** (not volatile)
- ✅ You expect **high trading volume**
- ✅ You want **low impermanent loss**
- ❌ But be aware: **easier to go out of range**

### **Choose Bin Step 10-20 If:**
- ✅ You want **good precision** (small price movements)
- ✅ Your tokens have **moderate volatility**
- ✅ You expect **medium trading volume**
- ✅ You want **balanced risk/reward**
- ✅ **Recommended for most users**

### **Choose Bin Step 50+ If:**
- ✅ You want **low precision** (large price movements)
- ✅ Your tokens are **very volatile**
- ✅ You expect **low trading volume**
- ✅ You want **maximum range coverage**
- ❌ But be aware: **higher impermanent loss**

---

## 📊 Price Calculation Examples

### **Bin Step 5 (Your Choice)**

```typescript
// Your starting price: 1 MY_TOKEN = 1.0000 SOL
// Bin step 5 = 0.05% increments

// Price levels going UP:
Bin 8388608: 1.0000 SOL per MY_TOKEN (your starting price)
Bin 8388609: 1.0005 SOL per MY_TOKEN (+0.05%)
Bin 8388610: 1.0010 SOL per MY_TOKEN (+0.10%)
Bin 8388611: 1.0015 SOL per MY_TOKEN (+0.15%)
Bin 8388612: 1.0020 SOL per MY_TOKEN (+0.20%)

// Price levels going DOWN:
Bin 8388607: 0.9995 SOL per MY_TOKEN (-0.05%)
Bin 8388606: 0.9990 SOL per MY_TOKEN (-0.10%)
Bin 8388605: 0.9985 SOL per MY_TOKEN (-0.15%)
Bin 8388604: 0.9980 SOL per MY_TOKEN (-0.20%)
```

### **Comparison with Other Bin Steps**

```typescript
// Bin Step 1 (Ultra High Precision):
// Price changes: 0.01% increments
// Range: 0.9990 to 1.0010 SOL per MY_TOKEN
// Precision: Very high, but narrow range

// Bin Step 5 (Your Choice - High Precision):
// Price changes: 0.05% increments  
// Range: 0.9980 to 1.0020 SOL per MY_TOKEN
// Precision: High, good range

// Bin Step 10 (Medium Precision):
// Price changes: 0.10% increments
// Range: 0.9960 to 1.0040 SOL per MY_TOKEN
// Precision: Medium, wider range

// Bin Step 100 (Low Precision):
// Price changes: 1.00% increments
// Range: 0.9000 to 1.1000 SOL per MY_TOKEN
// Precision: Low, very wide range
```

---

## 🚀 Pool Creation Process

### **Step 1: Initialize Services**
```typescript
const liquidityBookServices = new LiquidityBookServices({
  mode: MODE.DEVNET,  // Using devnet for testing
});
```

### **Step 2: Set Pool Parameters**
```typescript
const binStep = BIN_STEP_CONFIGS?.[3]?.binStep ?? 0; // Bin step 5
const ratePrice = 1; // 1:1 ratio
```

### **Step 3: Create the Pool**
```typescript
const { tx, pair } = await liquidityBookServices.createPairWithConfig({
  tokenBase: {
    mintAddress: tokenX.mintAddress,  // MY_TOKEN
    decimal: tokenX.decimals,         // 6 decimals
  },
  tokenQuote: {
    mintAddress: tokenY.mintAddress,  // SOL
    decimal: tokenY.decimals,         // 6 decimals
  },
  ratePrice,    // 1:1 ratio
  binStep,      // 5 (0.05% precision)
  payer,        // Your wallet
});
```

### **Step 4: Execute Transaction**
```typescript
// Sign and send the transaction
const signedTransaction = await signTransaction(transaction, wallet);
const signature = await connection.sendTransaction(signedTransaction, [wallet]);
```

---

## 🔍 What Happens After Pool Creation

### **1. Pool Infrastructure Created**
- ✅ **Pair Account**: Your main pool
- ✅ **Bin Step Config**: Rules for bin step 5
- ✅ **Quote Asset Badge**: SOL registration
- ✅ **Bin Arrays**: Storage for price levels

### **2. Price Structure Established**
- 🎯 **Active Bin**: 8388608 (1.0000 SOL per MY_TOKEN)
- 📊 **Price Range**: 0.9980 to 1.0020 SOL per MY_TOKEN
- 🔢 **Total Bins**: 512 price levels available

### **3. Pool Status**
- 🟢 **Status**: ACTIVE
- 💰 **Fees**: 0.12% per trade (0.1% + 0.02%)
- 🛒 **Trading**: Ready to accept orders
- 📈 **Liquidity**: Empty (needs to be added)

---

## 💡 Pro Tips

### **1. Choose Bin Step Based on Volatility**
```typescript
// Low volatility tokens (stablecoins):
// Use bin step 1-5 for maximum precision

// Medium volatility tokens (major cryptos):
// Use bin step 10-20 for balanced approach

// High volatility tokens (meme coins):
// Use bin step 50+ for maximum range
```

### **2. Consider Your Trading Volume**
```typescript
// High volume = Lower bin step (more precision)
// Low volume = Higher bin step (wider range)
```

### **3. Think About Impermanent Loss**
```typescript
// Lower bin step = Less impermanent loss, but easier to go out of range
// Higher bin step = More impermanent loss, but harder to go out of range
```

---

## 🚨 Common Mistakes to Avoid

### **1. Choosing Wrong Bin Step**
```typescript
// ❌ Don't use bin step 1 for volatile tokens
// ❌ Don't use bin step 100 for stable tokens
// ✅ Choose based on your token's characteristics
```

### **2. Setting Wrong Initial Price**
```typescript
// ❌ Don't set ratePrice = 1 if market price is 0.5
// ✅ Set ratePrice close to current market price
```

### **3. Not Understanding Range Limits**
```typescript
// ❌ Don't expect pool to work outside your bin range
// ✅ Understand that prices can go above/below your range
```

---

## 📚 Additional Resources

### **Scripts in This Project**
- **`test.ts`**: Create a new pool
- **`get-registered-tokens.ts`**: View all registered tokens and pools

### **Key Concepts to Learn**
- **Impermanent Loss**: How price changes affect your investment
- **Liquidity Provision**: How to add liquidity to your pool
- **Range Management**: How to adjust your pool's price range
- **Fee Optimization**: How to maximize your earnings

### **Next Steps**
1. **Add Liquidity**: Put tokens into your pool to start earning
2. **Monitor Performance**: Track your pool's trading activity
3. **Adjust Range**: Modify your pool's price range as needed
4. **Scale Up**: Create multiple pools with different strategies

---

## 🎉 Congratulations!

You've successfully created a professional-grade liquidity pool on Saros! This pool will:
- ✅ **Automatically adjust prices** based on market demand
- ✅ **Collect fees** from every single trade
- ✅ **Work 24/7** without you doing anything
- ✅ **Profit from market volatility** instead of being hurt by it

You're now running your own **mini trading exchange** that makes money while you sleep! 🚀💰

---

## 📞 Need Help?

If you have questions about:
- Pool creation
- Bin step selection
- Liquidity management
- Fee optimization

Check the Saros documentation or reach out to the community! 🆘
