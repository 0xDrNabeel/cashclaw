#!/usr/bin/env node

/**
 * CashClaw Crypto Operations
 * Handles crypto payments via Coinbase AgentKit
 * 
 * Usage:
 *   node crypto-ops.js create-wallet
 *   node crypto-ops.js fund-wallet --address 0x... --network base-sepolia
 *   node crypto-ops.js transfer --to 0x... --amount 1 --currency usdc
 *   node crypto-ops.js get-balance
 *   node crypto-ops.js get-address
 */

import pkg from "@coinbase/agentkit";
const { AgentKit, AgentKitConfig } = pkg;

// Initialize AgentKit with environment variables
async function getAgentKit() {
  const config = AgentKitConfig.withApiKey({
    apiKeyName: process.env.CDP_API_KEY_NAME,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
  });
  
  return await AgentKit.from(config);
}

// Create a new wallet
async function createWallet() {
  try {
    console.log("� Creating new wallet...");
    const agentKit = await getAgentKit();
    const wallet = await agentKit.getWallet();
    
    console.log("\n✅ Wallet created successfully!");
    console.log(`� Address: ${wallet.address}`);
    console.log(`🌐 Network: ${wallet.networkId}`);
    
    // Save to config
    const fs = await import('fs');
    const configPath = `${process.env.HOME || process.env.USERPROFILE}/.cashclaw/config.json`;
    
    let config = {};
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {}
    
    config.cryptoWallet = {
      address: wallet.address,
      network: wallet.networkId,
      createdAt: new Date().toISOString()
    };
    
    fs.mkdirSync(require('path').dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`\n💾 Saved to ${configPath}`);
    return wallet;
  } catch (error) {
    console.error("❌ Error creating wallet:", error.message);
    process.exit(1);
  }
}

// Get wallet address
async function getAddress() {
  try {
    const agentKit = await getAgentKit();
    const wallet = await agentKit.getWallet();
    console.log(`�address: ${wallet.address}`);
    console.log(`🌐 Network: ${wallet.networkId}`);
    return wallet.address;
  } catch (error) {
    console.error("❌ Error getting address:", error.message);
    process.exit(1);
  }
}

// Get wallet balance
async function getBalance() {
  try {
    const agentKit = await getAgentKit();
    const wallet = await agentKit.getWallet();
    
    console.log(`\n💰 Wallet: ${wallet.address}`);
    console.log(`🌐 Network: ${wallet.networkId}`);
    console.log("\n📊 Balances:");
    
    // Get ETH balance
    const ethBalance = await wallet.getBalance();
    console.log(`  ETH: ${ethBalance}`);
    
    // Try to get USDC balance (if available on network)
    try {
      const usdcBalance = await wallet.getBalanceOf("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"); // USDC on mainnet
      if (usdcBalance !== "0") {
        console.log(`  USDC: ${usdcBalance}`);
      }
    } catch (e) {
      // USDC might not be on testnet
    }
    
    return { eth: ethBalance };
  } catch (error) {
    console.error("❌ Error getting balance:", error.message);
    process.exit(1);
  }
}

// Transfer crypto
async function transfer(args) {
  try {
    const { to, amount, currency = 'eth' } = args;
    
    if (!to || !amount) {
      console.error("❌ Error: --to and --amount are required");
      console.log("Usage: node crypto-ops.js transfer --to 0x... --amount 1 --currency usdc");
      process.exit(1);
    }
    
    console.log(`🚀 Transferring ${amount} ${currency} to ${to}...`);
    
    const agentKit = await getAgentKit();
    const wallet = await agentKit.getWallet();
    
    let txHash;
    if (currency.toLowerCase() === 'usdc') {
      // USDC transfer
      const amountWei = BigInt(amount * 1_000_000); // USDC has 6 decimals
      txHash = await wallet.invokeAction(
        "transfer",
        {
          token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
          to: to,
          amount: amountWei.toString()
        }
      );
    } else {
      // ETH/native token transfer
      txHash = await wallet.invokeAction(
        "transfer",
        {
          to: to,
          amount: amount.toString()
        }
      );
    }
    
    console.log("\n✅ Transfer submitted!");
    console.log(`🔗 Transaction: ${txHash}`);
    console.log(`\n📋 Check at: https://basescan.org/tx/${txHash}`);
    
    return txHash;
  } catch (error) {
    console.error("❌ Error transferring:", error.message);
    process.exit(1);
  }
}

// Fund wallet with testnet ETH (from faucet)
async function fundWallet(args) {
  try {
    const { address, network = 'base-sepolia' } = args;
    
    if (!address) {
      console.error("❌ Error: --address is required");
      process.exit(1);
    }
    
    console.log(`💸 Requesting testnet ETH from faucet for ${address}...`);
    
    const agentKit = await getAgentKit();
    const wallet = await agentKit.getWallet();
    
    const txHash = await wallet.invokeAction("faucet", {});
    
    console.log("\n✅ Faucet request submitted!");
    console.log(`🔗 Transaction: ${txHash}`);
    console.log(`\n📋 Check at: https://sepolia.basescan.org/tx/${txHash}`);
    
    return txHash;
  } catch (error) {
    console.error("❌ Error funding wallet:", error.message);
    process.exit(1);
  }
}

// Parse command line arguments
function parseArgs() {
  const args = {};
  const command = process.argv[2];
  
  for (let i = 3; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith('--')) {
      const key = arg.replace('--', '');
      const value = process.argv[i + 1];
      if (value && !value.startsWith('--')) {
        args[key] = value;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  
  return { command, args };
}

// Main
async function main() {
  const { command, args } = parseArgs();
  
  // Check for required env vars
  if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_KEY_SECRET) {
    console.error("❌ Error: CDP_API_KEY_NAME and CDP_API_KEY_SECRET must be set");
    console.log("\nGet your keys at: https://docs.cdp.coinbase.com/");
    console.log("\nUsage:");
    console.log("  export CDP_API_KEY_NAME=your_key_name");
    console.log("  export CDP_API_KEY_SECRET=your_key_secret");
    console.log("  node crypto-ops.js create-wallet");
    process.exit(1);
  }
  
  switch (command) {
    case 'create-wallet':
      await createWallet();
      break;
    case 'get-address':
    case 'address':
      await getAddress();
      break;
    case 'get-balance':
    case 'balance':
      await getBalance();
      break;
    case 'transfer':
      await transfer(args);
      break;
    case 'fund-wallet':
    case 'faucet':
      await fundWallet(args);
      break;
    default:
      console.log(`
🎰 CashClaw Crypto Operations

Usage:
  node crypto-ops.js create-wallet        Create a new crypto wallet
  node crypto-ops.js get-address          Get your wallet address
  node crypto-ops.js get-balance          Check wallet balance
  node crypto-ops.js transfer --to 0x... --amount 1 --currency usdc  Transfer crypto
  node crypto-ops.js fund-wallet --address 0x...  Get testnet ETH

Options:
  --address <addr>     Wallet address
  --to <addr>          Recipient address
  --amount <num>       Amount to transfer
  --currency <usdc|eth>  Token to transfer (default: eth)
  --network <network>  Network (default: base-sepolia)

Environment:
  CDP_API_KEY_NAME     Your CDP API Key Name
  CDP_API_KEY_SECRET   Your CDP API Key Secret

Get keys at: https://docs.cdp.coinbase.com/
`);
      process.exit(1);
  }
}

main();
