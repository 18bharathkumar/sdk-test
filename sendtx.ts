

import { Connection } from "@solana/web3.js";

/**
 * Send a signed transaction from a Base58-encoded string
 * @param connection Solana connection
 * @param encodedTx Base58 encoded signed transaction
 * @returns Signature string
 */

export async function sendSignedTx(
  connection: Connection,
  encodedTx: string,
): Promise<string> {
  const rawTx = Buffer.from(encodedTx, "base64");
  const sig = await connection.sendRawTransaction(rawTx, {
    skipPreflight: false,
    maxRetries: 3,
  });
  return sig;
}

// Example usage
(async () => {
  const connection = new Connection(
    "https://api.devnet.solana.com ",
    "confirmed",
  );

  
  const encodetx = "AcKP66MbQKDg4ojSNW3pxW/lBEkZNgr+kO2NaCoVL8AiZwwyiY3uihtcW7n0Nw6mvKI5AdKFkRGlUTNLMoMJCgEBAAoTur7m7vdvo7etfa2h61zWQNsPdIxGM7Ys2668C2wbi2EaUkdW6wni6Rb8uMZOsKoDbipvhS5OgHlnkFKggbRC2yLE12sJxNnfGWqvf//DV1JALsXyqrtpvWjn31VqAJY/K763PGqFb20auzdXfXhWOoLRr8txr8vdJIrsM2Kp+DZqX98KONf/gB0FD2RvPjncAat6Uc/P+rDDKTWhqcl0VgI1ZqqK2AvB3+zOfQJ/24M3OeWYAQ9DQ6vq0njEzOonzirgtJbJ4e1qhl2Y7YNdA/bdczLppQzMSHgFzMruSirH72VduicxHGKDCLFqRKmduQ5Yb0oS7/Fpx0Vp1sKKidwdbGm4AMDdpeO4jiWcFK0ZtCoe4fQ7q5ahLrZFdNLDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADJjuma/SRyuYzJulsLdAjt4OM1sUX6AQfCZELPYlI1o9Ww09fHIorLcHAvoffP4HRNR0FNZTiwr46GWQeoH4nq5KwexFkF4o2JsSZy1QQDH3HVh4OLVsLuKR0uiwwEtY4FSlNamSkhBk0k6HFg2jh8fDW13bySu4HkH6hAQQVEjQt5b2mw0JHaCksJEElhaWW8vPCHy1tVpTAXZd/hBRdVBpuIV/6rgYT7aH9jRhjANdrEOdwa6ztVmKDwAAAAAAEGp9UXGSxWjuCKhF9z0peIzwNcMUWyGrNE2AYuqUAAAAbd9uHXZaGT2cvhRs7reawctIXtX1s3kTqM9YV+/wCpBt324e51j94YQl285GzN2rYa/E2DuQ0n/r35KNihi/wTbOXo1BqdsmYD6PRL38KYRmkXUUE/nr+l9icHaxDa/AQJAwgQAAQEAAAACQIAAQwCAAAAAMqaOwAAAAARAQEBEQoUBg4PAwUEBwIBABIRDQoMCwoGAwUa+MaekeF1h8gAypo7AAAAANeCHQoAAAAAAAA="

  const sig = await sendSignedTx(connection, encodetx);

  console.log("✅ Transaction submitted:", sig);
})();