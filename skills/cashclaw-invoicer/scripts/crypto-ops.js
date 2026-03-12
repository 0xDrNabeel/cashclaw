#!/usr/bin/env node

/**
 * CashClaw Crypto Operations
 * Uses viem + public RPC to check balances on-chain
 * No external API keys needed!
 */

import { createPublicClient, http, parseEther, parseUnits } from 'viem';
import { getAddress } from 'viem';

// Polygon Mainnet
const POLYGON_CHAIN = {
  id: 137,
  name: 'Polygon',
  network: 'polygon',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://polygon-rpc.com'] },
    public: { http: ['https://polygon-rpc.com'] },
  },
  blockExplorers: {
    default: { name: 'Polygonscan', url: 'https://polygonscan.com' },
  },
};

// Native USDC on Polygon (NOT bridged!)
const USDC_ADDRESS = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359';

// ERC20 ABI (minimal)
const ERC20_ABI = [
  { name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }], stateMutability: 'view' },
  { name: 'decimals', type: 'function', inputs: [], outputs: [{ name: '', type: 'uint8' }], stateMutability: 'view' },
  { name: 'symbol', type: 'function', inputs: [], outputs: [{ name: '', type: 'string' }], stateMutability: 'view' },
];

// Polygon Mainnet
// IMPORTANT: Free public RPCs are often rate-limited. 
// Get a free RPC key from: https://www.alchemy.com/, https://www.quicknode.com/, or https://www.infura.io/
// Or use: https://polygon-rpc.com (may work occasionally)

const DEFAULT_RPC = process.env.POLYGON_RPC || 'https://polygon-rpc.com';

// Create public client
const client = createPublicClient({
  chain: POLYGON_CHAIN,
  transport: http(DEFAULT_RPC),
});

/**
 * Get native MATIC balance
 */
async function getMaticBalance(address) {
  try {
    const balance = await client.getBalance({ address });
    return balance;
  } catch (error) {
    console.error('Error getting MATIC balance:', error.message);
    return null;
  }
}

/**
 * Get USDC balance
 */
async function getUsdcBalance(address) {
  try {
    const balance = await client.readContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address],
    });
    return balance;
  } catch (error) {
    console.error('Error getting USDC balance:', error.message);
    return null;
  }
}

/**
 * Get all balances
 */
async function getBalances(walletAddress) {
  console.log(`\n🔍 Checking balances for: ${walletAddress}`);
  console.log(`🌐 Network: Polygon (https://polygon-rpc.com)\n`);

  const [maticBalance, usdcBalance] = await Promise.all([
    getMaticBalance(walletAddress),
    getUsdcBalance(walletAddress),
  ]);

  console.log(`💰 MATIC: ${maticBalance ? Number(maticBalance) / 1e18 : 'error'}`);
  console.log(`🪙 USDC:  ${usdcBalance ? Number(usdcBalance) / 1e6 : 'error'}`);

  return { matic: maticBalance, usdc: usdcBalance };
}

/**
 * Wait for payment - monitors wallet until expected amount received
 */
async function waitForPayment(walletAddress, expectedUsdc, pollIntervalMs = 10000, timeoutMs = 300000) {
  console.log(`\n⏳ Waiting for payment of ${expectedUsdc} USDC...`);
  console.log(`👛 Monitoring: ${walletAddress}`);
  console.log(`⏱️  Checking every ${pollIntervalMs/1000}s for up to ${timeoutMs/1000}s\n`);

  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const balance = await getUsdcBalance(walletAddress);
    
    if (balance !== null) {
      const balanceUsdc = Number(balance) / 1e6;
      console.log(`[${new Date().toISOString()}] Balance: ${balanceUsdc} USDC`);
      
      if (balanceUsdc >= expectedUsdc) {
        console.log(`\n✅ PAYMENT RECEIVED! ${balanceUsdc} USDC\n`);
        return { received: true, balance: balanceUsdc };
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
  }

  console.log(`\n❌ Payment timeout after ${timeoutMs/1000}s\n`);
  return { received: false, balance: 0 };
}

/**
 * Validate address format
 */
function isValidAddress(address) {
  try {
    getAddress(address);
    return true;
  } catch {
    return false;
  }
}

// CLI
function parseArgs() {
  const args = {};
  let command = null;
  
  for (let i = 2; i < process.argv.length; i++) {
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
    } else if (!command) {
      command = arg;
    }
  }
  
  return { command, args };
}

async function main() {
  const { command, args } = parseArgs();
  
  switch (command) {
    case 'balance':
    case 'balances': {
      const address = args.address || args.a;
      if (!address) {
        console.error('Error: --address required');
        console.log('Usage: node crypto-ops.js balance --address 0x...');
        process.exit(1);
      }
      if (!isValidAddress(address)) {
        console.error('Error: Invalid Ethereum address');
        process.exit(1);
      }
      await getBalances(address);
      break;
    }
    
    case 'wait-payment': {
      const address = args.address || args.a;
      const amount = parseFloat(args.amount || args.amount);
      
      if (!address || !amount) {
        console.error('Error: --address and --amount required');
        console.log('Usage: node crypto-ops.js wait-payment --address 0x... --amount 29');
        process.exit(1);
      }
      if (!isValidAddress(address)) {
        console.error('Error: Invalid Ethereum address');
        process.exit(1);
      }
      
      await waitForPayment(address, amount);
      break;
    }
    
    case 'usdc-address':
      console.log(USDC_ADDRESS);
      break;
    
    default:
      console.log(`
🎰 CashClaw Crypto Operations (viem + Polygon RPC)

No API keys needed! Uses public RPC: https://polygon-rpc.com

Commands:
  node crypto-ops.js balance --address 0x...     Check wallet balances (MATIC + USDC)
  node crypto-ops.js wait-payment --address 0x... --amount 29   Monitor for payment
  node crypto-ops.js usdc-address               Show USDC contract address

Options:
  --address, -a   Wallet address to check
  --amount        Expected USDC amount for payment monitoring

Environment:
  None required! Uses public Polygon RPC

USDC Contract (Native on Polygon):
  ${USDC_ADDRESS}

Examples:
  # Check balance
  node crypto-ops.js balance --address 0x5E617C88ffD66e56194bEa0DdcD64352AaD1e44c

  # Wait for 29 USDC payment
  node crypto-ops.js wait-payment --address 0x5E617C88ffD66e56194bEa0DdcD64352AaD1e44c --amount 29
`);
  }
}

main();
