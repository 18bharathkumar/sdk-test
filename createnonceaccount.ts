import {
    Connection,
    SystemProgram,
    Transaction,
    Keypair,
    NonceAccount,
    NONCE_ACCOUNT_LENGTH,
    sendAndConfirmTransaction,
    PublicKey,
    LAMPORTS_PER_SOL,
  } from "@solana/web3.js";
  
  import { loadWalletFromEnv } from "./wallet";
  
  const user = loadWalletFromEnv();
  console.log("User:", user.publicKey.toBase58());
  
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
  async function createNonceAccount() {
    // generate new nonce account keypair
    const nonceAccount = Keypair.generate();
  
    // calculate minimum lamports for rent exemption
    const lamports = await connection.getMinimumBalanceForRentExemption(NONCE_ACCOUNT_LENGTH);
  
    // create + initialize nonce account in a single transaction
    const tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: user.publicKey,
        newAccountPubkey: nonceAccount.publicKey,
        lamports,
        space: NONCE_ACCOUNT_LENGTH,
        programId: SystemProgram.programId,
      }),
      SystemProgram.nonceInitialize({
        noncePubkey: nonceAccount.publicKey,
        authorizedPubkey: user.publicKey,
      }),
    );
  
    // send and confirm
    await sendAndConfirmTransaction(connection, tx, [user, nonceAccount]);
  
    console.log("✅ Nonce account created:", nonceAccount.publicKey.toBase58());
  
    // fetch and log nonce account info
    const nonceInfo = await connection.getAccountInfo(nonceAccount.publicKey);
    if (!nonceInfo) throw new Error("Nonce account info not found!");
  
    const nonceData = NonceAccount.fromAccountData(nonceInfo.data);
    const balance = await connection.getBalance(nonceAccount.publicKey);
  
    console.log("💰 Nonce account balance:", balance / LAMPORTS_PER_SOL, "SOL");
    console.log("🆔 Durable nonce:", nonceData.nonce);
    console.log("🔑 Authorized Pubkey:", nonceData.authorizedPubkey.toBase58());
  
    return nonceAccount.publicKey;
  }
  
  // run
  createNonceAccount()
    .then(() => console.log("success"))
    .catch((err) => console.error("failed:", err));