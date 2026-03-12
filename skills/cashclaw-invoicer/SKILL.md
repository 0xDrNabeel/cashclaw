---
name: cashclaw-invoicer
description: Handles crypto invoice creation, on-chain payment verification, and automated reminders via viem + public Polygon RPC. Accepts USDC payments directly to wallet. No API keys, no middleman.
metadata:
  {
    "openclaw":
      {
        "emoji": "\u0001F4B3",
        "requires": { "bins": ["node"], "env": [] },
        "install":
          [
            {
              "id": "npm",
              "kind": "node",
              "package": "viem",
              "label": "Install viem for on-chain operations"
            }
          ]
      }
  }
---

# CashClaw Invoicer - Crypto Edition

You handle all payment operations for CashClaw using cryptocurrency. You verify payments on-chain before delivering work. 

**Critical: Payment MUST be verified in QUOTE stage, BEFORE transitioning to DELIVER.**

## Payment Flow (MUST FOLLOW THIS EXACT ORDER)

```
┌─────────┐    ┌─────────┐    ┌──────────────────┐    ┌─────────┐
│  INTAKE │ -> │  QUOTE  │ -> │ VERIFY PAYMENT   │ -> │ DELIVER│
└─────────┘    └─────────┘    │ (on-chain check) │    └─────────┘
                              └──────────────────┘
```

### STAGE 1: QUOTE (Generate Invoice + Wait for Payment)

1. Calculate final amount from mission details
2. Generate invoice with your Polygon wallet address
3. **Send invoice to client and WAIT for payment**
4. **Monitor wallet for incoming USDC using crypto-ops.js**
5. **Only when payment confirmed ON-CHAIN → transition to DELIVER**

### STAGE 2: DELIVER (Only After Payment Verified!)

1. Confirm payment was received (balance increased)
2. Transition mission to DELIVER
3. Hand over deliverables
4. Log in ledger

**NEVER deliver work without verifying payment on-chain!**

## Prerequisites

1. **Wallet**: You need a Polygon wallet (MetaMask, Phantom set to Polygon, etc.)
2. **Your payment address**: Set in config

## Supported Tokens

| Token | Symbol | Contract Address | Network |
|-------|--------|-----------------|---------|
| USDC | USDC | 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 | Polygon |
| MATIC | MATIC | (native) | Polygon |

## Configuration

Set your Polygon wallet address:

```bash
# Add to ~/.cashclaw/config.json
{
  "payment": {
    "address": "0xYourPolygonAddress...",
    "network": "polygon"
  }
}
```

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
  "status": "pending_payment",
  "created_at": "2026-03-12"
}
```

### Creating Invoice in QUOTE Stage

When mission is in QUOTE stage:

1. **Generate invoice** with payment details
2. **Send to client**:
```
Subject: Invoice #001 - {Service}

Dear {client_name},

Please find the invoice details below:

Service: {service_description}
Amount: {amount} USDC

Payment Address: {your_polygon_address}
Network: Polygon (NOT Ethereum!)
Token: USDC

Payment Instructions:
1. Send exactly {amount} USDC to the address above
2. Network must be Polygon (Chain ID 137)
3. After sending, reply with the transaction hash

I will deliver the work immediately after payment is confirmed on-chain.

Thank you!
```

3. **Monitor for payment** (see below)

## Payment Monitoring

### Using crypto-ops.js Script

```bash
# Check balance anytime
node scripts/crypto-ops.js balance --address 0xYourAddress

# Wait for payment (polls every 10s, timeout 5min)
node scripts/crypto-ops.js wait-payment --address 0xYourAddress --amount 29
```

### Manual Payment Verification

1. Check your USDC balance:
```bash
node scripts/crypto-ops.js balance --address YOUR_ADDRESS
```

2. Compare to expected amount
3. If balance >= invoice amount, payment confirmed!

### On-Chain Verification Process

```
Client sends USDC → Wait for 1-2 block confirmations → Check balance → If match: DELIVER
```

## Payment Status States

| Status | Meaning | Action |
|--------|---------|--------|
| pending_payment | Invoice sent, waiting | Monitor wallet |
| payment_received | On-chain confirmed | Transition to DELIVER |
| completed | Work delivered | Log and archive |

## The Critical Rule

**QUOTE → VERIFY → DELIVER**

- In QUOTE stage: Send invoice AND wait for payment
- Do NOT move to DELIVER until payment confirmed on-chain
- Use `crypto-ops.js balance` or `wait-payment` to verify
- Only after balance increases by expected amount → DELIVER

## Sending Payment Reminders

### Day 0: Invoice Sent

```
Subject: Invoice #{number} - Payment Request

Hi {name},

Please find your invoice for {service}.

Amount: {amount} USDC
Payment Address: {wallet_address}
Network: Polygon (Chain ID 137)
Token: USDC (0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359)

Once payment is confirmed on-chain, I will deliver your work immediately.

Thank you!
```

### Day 3: Gentle Reminder

```
Subject: Friendly reminder: Invoice #{number}

Hi {name},

Just a quick reminder that invoice #{number} for {amount} USDC is still pending.

Payment Address: {wallet_address}
Network: Polygon

If you have already sent payment, please reply with the transaction hash so I can verify.

Thanks!
```

### Day 7: Follow-up

```
Subject: Invoice #{number} - Payment reminder

Hi {name},

Following up on invoice #{number} for {amount} USDC.

Please send payment to:
{wallet_address}
Network: Polygon

If there are any issues, please let me know.

Best regards
```

## Ledger Entry Format

```json
{"ts":"2026-03-12T12:00:00Z","event":"invoice_created","mission_id":"MISSION-20260312-001","amount":29,"currency":"USDC","status":"pending_payment"}
{"ts":"2026-03-12T12:30:00Z","event":"payment_verified","mission_id":"MISSION-20260312-001","amount":29,"currency":"USDC","balance_before":"0","balance_after":"29000000","tx_hash":"0x...","status":"payment_received"}
{"ts":"2026-03-12T12:35:00Z","event":"deliver","mission_id":"MISSION-20260312-001","status":"completed"}
```

## Example Commands

```bash
# Check wallet balance
node scripts/crypto-ops.js balance --address 0xYourAddress

# Wait for payment
node scripts/crypto-ops.js wait-payment --address 0xYourAddress --amount 29

# Get USDC contract address
node scripts/crypto-ops.js usdc-address
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Client sent on wrong network | Ask them to resend on Polygon (Chain ID 137) |
| Client sent wrong token | Request USDC on Polygon |
| Balance not updating | Wait for block confirmation (~2s) |
| Using bridged USDC | Use native USDC: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 |

## Contract Address (IMPORTANT!)

**Use ONLY this native USDC address on Polygon:**

```
0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
```

NOT the old bridged address!
