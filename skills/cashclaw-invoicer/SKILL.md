---
name: cashclaw-invoicer
description: Handles invoice creation, payment tracking, and automated reminders via Polygon crypto. Accepts USDC and MATIC payments directly to wallet. No middleman, global, instant.
metadata:
  {
    "openclaw":
      {
        "emoji": "\U0001F4B3",
        "requires": { "bins": ["node", "polygon-agent"] },
        "install":
          [
            {
              "id": "npm",
              "kind": "node",
              "package": "@polygonlabs/agent-cli",
              "bins": ["polygon-agent"],
              "label": "Install Polygon Agent CLI"
            }
          ]
      }
  }
---

# CashClaw Invoicer - Crypto Edition

You handle all payment operations for CashClaw using cryptocurrency. You create invoices, generate payment addresses, track on-chain payments, and send automated reminders. Every satoshi earned must be tracked accurately.

**Why Crypto?**
- ⚡ Instant settlements (2-3 seconds)
- 🌎 Global (no borders, no banks)
- 💰 Very low fees (~$0.01 per transaction)
- 🔒 Non-custodial (you control the wallet)
- 🚫 No restrictions (works in Iraq, Iran, etc.)

## Prerequisites

1. **Polygon Agent CLI** installed:
   ```bash
   npm install -g @polygonlabs/agent-cli
   ```

2. **Set up wallet**:
   ```bash
   polygon-agent setup
   ```

3. **Get your wallet address**:
   ```bash
   polygon-agent wallet --address
   ```

## Supported Tokens

| Token | Symbol | Network | Address |
|-------|--------|---------|---------|
| USDC | USDC | Polygon | 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 |
| MATIC | MATIC | Polygon (native) | - |

## Invoice Creation

### Invoice Data Structure

```json
{
  "mission_id": "MISSION-20260312-001",
  "client": {
    "name": "Acme Corp",
    "wallet": "0x..."
  },
  "items": [
    {
      "description": "SEO Audit - Standard Tier",
      "amount": 29
    }
  ],
  "total_usdc": 29,
  "payment_address": "0xYourWalletAddress...",
  "status": "pending",
  "created_at": "2026-03-12"
}
```

### Creating an Invoice

1. Get your wallet address:
   ```bash
   polygon-agent wallet --address
   ```

2. Create invoice with payment details:
   - Include your Polygon wallet address
   - Specify amount in USDC
   - Set clear payment terms

3. Send invoice to client:
```
Subject: Invoice #001 - SEO Audit

Dear {client_name},

Thank you for your business! Please find the invoice details below:

Service: SEO Audit - Standard Tier
Amount: 29 USDC

Payment Address: 0x....................................
Network: Polygon (MATIC)

You can pay using:
- Phantom Wallet
- MetaMask
- Any Polygon-compatible wallet

Once payment is confirmed on-chain, I will deliver the work immediately.

Thank you!
```

## Payment Tracking

### Check Payment Status

```bash
# Check your balance
polygon-agent balances
```

### On-Chain Confirmation

Payment is confirmed when:
1. Transaction shows on Polygon scanner
2. Balance increases by expected amount

Example scanner: https://polygonscan.com/address/YOUR_WALLET

### Ledger Entry Format

Log every invoice event:

```json
{"ts":"2026-03-12T12:00:00Z","event":"invoice_created","mission_id":"MISSION-20260312-001","amount":29,"currency":"USDC","status":"pending"}
{"ts":"2026-03-12T12:30:00Z","event":"payment_received","mission_id":"MISSION-20260312-001","amount":29,"currency":"USDC","tx_hash":"0x...","confirmed":true}
```

## Payment Reminder Flow

### Day 0: Invoice Sent

```
Subject: Invoice #{number} - Payment Request

Hi {name},

Please find your invoice for {service}.

Amount: {amount} USDC
Payment Address: {your_wallet_address}
Network: Polygon

Pay using any Polygon wallet (Phantom, MetaMask, etc.)

Thank you for your business!
```

### Day 3: Gentle Reminder

Only send if payment not received.

```
Subject: Friendly reminder: Invoice #{number}

Hi {name},

Just a quick reminder that invoice #{number} for {amount} USDC is still pending.

Payment Address: {wallet_address}
Network: Polygon

If you have already sent payment, please ignore this message.

Thanks!
```

### Day 7: Follow-up

```
Subject: Invoice #{number} - Payment reminder

Hi {name},

This is a follow-up regarding invoice #{number} for {amount} USDC.

Please send payment to:
{wallet_address}
Network: Polygon

If there are any issues with payment, please let me know.

Best regards
```

### Day 14: Final Notice

```
Subject: Final notice: Invoice #{number}

Hi {name},

This is our final reminder regarding invoice #{number} for {amount} USDC, which is now 14 days past due.

Please complete payment at your earliest convenience:
{wallet_address}
Network: Polygon

If we do not receive payment or hear from you within 48 hours, we may need to pause any ongoing services.

Regards,
```

### Reminder Rules

1. Never send more than 1 reminder per day
2. Stop reminders once payment is confirmed on-chain
3. If client responds, handle personally
4. After Day 14 with no response, escalate to operator

## Receiving Payments

### Getting Your Address

```bash
polygon-agent wallet --address
```

### Sharing with Clients

Send clients your:
- Wallet address
- Network: Polygon (not Ethereum!)
- Token: USDC

### Confirming Payment

```bash
# Check balance
polygon-agent balances

# View recent transactions
polygon-agent transaction-history
```

## Sending Payments (Payouts)

If you need to pay others:

```bash
# Send USDC
polygon-agent send-token --symbol USDC --amount 10 --to 0x...

# Send MATIC
polygon-agent send-native --amount 1 --to 0x...
```

## Token Swaps

Need MATIC for gas? Swap USDC:

```bash
polygon-agent swap --from USDC --to MATIC --amount 10
```

## Multi-Currency Support

| Currency | Code | Example |
|----------|------|---------|
| US Dollar (USDC) | USDC | 29 USDC |
| MATIC | MATIC | 50 MATIC |

Always confirm with client which token they prefer for payment.

## Error Handling

| Issue | Solution |
|-------|----------|
| Client sent to wrong network | Ask them to resend from Polygon network |
| Client sent wrong token | Request correct token or convert manually |
| Transaction pending | Wait for on-chain confirmation (usually ~2-3 sec) |
| Low balance for gas | Use `polygon-agent swap` to get MATIC |

## Example Commands

```bash
# Get your payment address
polygon-agent wallet --address

# Check incoming payments
polygon-agent balances

# Send payment to someone
polygon-agent send-token --symbol USDC --amount 5 --to 0x...

# Swap tokens
polygon-agent swap --from USDC --to MATIC --amount 10
```

## Integration with CashClaw Core

When a mission reaches DELIVER stage:

1. Calculate final amount from mission details
2. Generate invoice with your Polygon address
3. Send to client via email/DM
4. Monitor for payment via `polygon-agent balances`
5. Once confirmed, mark mission complete
6. Log in ledger
