import { Keypair } from "@solana/web3.js";
const WALLET_U8_ARRAY = "[112,159,188,124,255,115,124,22,14,118,12,189,87,153,187,143,210,233,226,210,188,11,153,157,98,146,194,101,250,143,26,105,186,190,230,238,247,111,163,183,173,125,173,161,235,92,214,64,219,15,116,140,70,51,182,44,219,174,188,11,108,27,139,97]";


export const loadWalletFromU8Array = (u8Array: any): Keypair => {
  try {
    // Convert u8 array to Uint8Array
    const uint8Array = new Uint8Array(u8Array);
    
    // Create keypair from the byte array
    const keypair = Keypair.fromSecretKey(uint8Array);
    
    console.log("Wallet loaded successfully:", keypair.publicKey.toString());
    return keypair;
  } catch (error) {
    throw new Error(`Failed to load wallet from u8 array: ${error}`);
  }
};

export const loadWalletFromEnv = () => {
  const wallet = loadWalletFromU8Array(JSON.parse(WALLET_U8_ARRAY));
  console.log(wallet.publicKey.toString());
  return wallet;
};

loadWalletFromEnv();