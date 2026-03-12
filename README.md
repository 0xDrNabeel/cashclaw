<p align="center">
  <img src="cover.jpeg" alt="CashClaw - Turn Your AI Agent Into a Money-Making Machine" width="100%" />
</p>

<p align="center">
  <a href="#what-is-cashclaw">What is CashClaw?</a> &middot;
  <a href="#quick-start">Quick Start</a> &middot;
  <a href="#how-it-works">How It Works</a> &middot;
  <a href="#crypto-payments">Crypto Payments</a> &middot;
  <a href="#available-services">Services</a> &middot;
  <a href="#dashboard">Dashboard</a> &middot;
  <a href="#commands">Commands</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/cashclaw"><img src="https://img.shields.io/npm/v/cashclaw?color=crimson&label=npm" alt="npm version" /></a>
  <a href="https://github.com/0xDrNabeel/cashclaw/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="license" /></a>
  <a href="https://github.com/0xDrNabeel/cashclaw/stargazers"><img src="https://img.shields.io/github/stars/0xDrNabeel/cashclaw?style=social" alt="stars" /></a>
</p>

---

> *"I deployed CashClaw on Friday. By Monday, my agent had completed 12 missions and earned $847 in USDC."*
>
> -- Early beta tester

---

## What is CashClaw?

CashClaw is a set of **OpenClaw skills** that turn your AI agent into a freelance business operator — powered by **crypto payments**.

Your agent wakes up. Checks the pipeline. Picks up a client request. Runs an SEO audit. Writes a blog post. Generates 50 qualified leads. Creates a crypto invoice. Waits for on-chain payment. Delivers the work. Collects the money.

**You sleep. CashClaw works.**

It is not a framework. It is not a SaaS dashboard. It is a skill pack that plugs into any OpenClaw-compatible agent and gives it the ability to sell, deliver, and collect payment for digital services — autonomously.

```
No employees. No overhead. No banking restrictions.
Just an agent, a Polygon wallet, and CashClaw.
```

## Quick Start

```bash
# Install CashClaw
npm install -g cashclaw

# Initialize
cashclaw init

# Set your Polygon wallet address
# Edit ~/.cashclaw/config.json:
{
  "payment": {
    "address": "0xYourPolygonAddress..."
  }
}
```

That's it! Your agent is now ready to:
- Receive missions
- Do the work (SEO, content, leads)
- Generate crypto invoices
- Verify payments on-chain
- Deliver and get paid in USDC

## How It Works

```
+------------------+     +---------------------+     +------------------+
|                  |     |   CashClaw Skills  |     |   Crypto Engine  |
|    OpenClaw      |---->|   (7 skill packs) |---->|   (viem + RPC)   |
|    (Your Agent)  |     |                    |     |                  |
+------------------+     +---------------------+     +--------+---------+
                                                              |
                                                              v
                                                     +--------+---------+
                                                     |                  |
                                                     |    Polygon       |
                                                     |  (USDC Payments) |
                                                     |                  |
                                                     +------------------+
```

| Layer | What It Does |
|-------|-------------|
| **OpenClaw** | Your AI agent runtime |
| **CashClaw Skills** | 7 specialized skill packs (SEO, content, leads, etc.) |
| **Crypto Engine** | On-chain payment verification via viem |
| **Polygon** | Accept USDC payments directly to your wallet |

## Crypto Payments

CashClaw uses **Polygon** blockchain for payments. No banks, no middleman, no restrictions.

### Why Polygon?

- ⚡ **Fast** - ~2 second block time
- 💰 **Cheap** - ~$0.01 transaction fees
- 🌎 **Global** - Anyone can pay from anywhere
- 🔒 **Secure** - Non-custodial (you control your wallet)
- ✅ **No restrictions** - Works in Iraq, Iran, sanctioned countries

### Supported Tokens

| Token | Address | Network |
|-------|---------|---------|
| USDC | 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359 | Polygon |
| MATIC | (native) | Polygon |

### Setting Up

1. **Create a Polygon wallet** (MetaMask, Phantom set to Polygon, etc.)

2. **Get your address** (starts with 0x...)

3. **Configure CashClaw:**
```bash
# Edit ~/.cashclaw/config.json
{
  "payment": {
    "address": "0xYourPolygonAddress...",
    "network": "polygon"
  }
}
```

4. **(Optional) Get a free RPC** for better reliability:
   - https://www.alchemy.com/
   - https://www.quicknode.com/
   - https://www.infura.io/

```bash
export POLYGON_RPC=your_rpc_url
```

### Checking Payments

```bash
# Check wallet balance
node skills/cashclaw-invoicer/scripts/crypto-ops.js balance --address 0x...

# Wait for payment
node skills/cashclaw-invoicer/scripts/crypto-ops.js wait-payment --address 0x... --amount 29
```

### The Payment Flow

```
1. Client requests service
2. Agent creates mission → QUOTE stage
3. Agent generates invoice with Polygon address
4. Agent SENDS invoice to client
5. Agent MONITORS wallet for payment (on-chain)
6. Once payment confirmed → DELIVER stage
7. Agent hands over work
8. Payment complete!
```

**Critical: Payment MUST be verified on-chain BEFORE delivering work!**

## Available Services

Every service has transparent, fixed pricing. No hourly rates. No surprises.

| Service | Skill | Starter | Standard | Pro |
|---------|-------|---------|----------|-----|
| SEO Audit | `cashclaw-seo-auditor` | $9 | $29 | $59 |
| Blog Post (500w) | `cashclaw-content-writer` | $5 | -- | -- |
| Blog Post (1500w) | `cashclaw-content-writer` | -- | $12 | -- |
| Email Newsletter | `cashclaw-content-writer` | $9 | -- | -- |
| Lead Generation (25) | `cashclaw-lead-generator` | $9 | -- | -- |
| Lead Generation (50) | `cashclaw-lead-generator` | -- | $15 | -- |
| Lead Generation (100) | `cashclaw-lead-generator` | -- | -- | $25 |
| WhatsApp Setup | `cashclaw-whatsapp-manager` | $19 | -- | -- |
| WhatsApp Monthly | `cashclaw-whatsapp-manager` | -- | $49/mo | -- |
| Social Media (1 platform) | `cashclaw-social-media` | $9/wk | -- | -- |
| Social Media (3 platforms) | `cashclaw-social-media` | -- | $19/wk | -- |
| Social Media (Full) | `cashclaw-social-media` | -- | -- | $49/mo |

All prices in USDC. Payment via Polygon.

## Dashboard

CashClaw tracks everything. Check your numbers anytime:

```bash
cashclaw status
```

```
  CashClaw Dashboard
  ==================

  Today          $58    |  3 missions completed
  This Week     $247    |  9 missions completed
  This Month    $847    | 31 missions completed
  All Time    $2,340    | 84 missions completed

  Wallet Balance
  --------------
  USDC:  847.00
  MATIC: 125.50

  Active Missions
  ---------------
  MISSION-20260312-014  SEO Audit (Pro)       QUOTE     $59
  MISSION-20260312-015  Lead Gen (50)        DELIVER   $15

  Pending Payments
  ----------------
  INV-0012  $29   Waiting...   0x1234...abc
```

## Commands

```bash
# Core
cashclaw init                    # Initialize workspace
cashclaw status                  # Show dashboard
cashclaw missions                # List all missions
cashclaw mission <id>            # Show mission details

# Crypto
cashclaw invoice --amount 29     # Generate invoice
# (Use crypto-ops.js for balance checks)

# Configuration
cashclaw config                  # Show current config
```

## Project Structure

```
cashclaw/
  bin/                           # CLI entry point
  src/                           # Core engine source
  skills/
    cashclaw-core/               # Business orchestration brain
    cashclaw-seo-auditor/        # SEO audit skill
    cashclaw-content-writer/     # Content creation skill
    cashclaw-lead-generator/     # Lead research skill
    cashclaw-whatsapp-manager/   # WhatsApp automation skill
    cashclaw-social-media/       # Social media skill
    cashclaw-invoicer/          # Crypto payment skill + viem
  templates/                     # Message templates
  missions/                     # Example missions
  tests/                        # Test suite
```

## Tech Stack

- **Runtime**: OpenClaw
- **Language**: JavaScript/Node.js
- **Blockchain**: Polygon
- **Crypto**: viem + public RPC
- **Payments**: USDC (native on Polygon)

## Why Crypto?

| Feature | Crypto (CashClaw) | Traditional (Stripe) |
|---------|-------------------|---------------------|
| Setup time | 5 minutes | 1-2 weeks |
| Global | ✅ Anyone, anywhere | ❌ Many restrictions |
| Fees | ~$0.01 | 2.9% + 30¢ |
| Payout time | Instant | 2-7 days |
| Iraq/Iran | ✅ Works | ❌ Blocked |
| Control | 100% yours | Middleman |

## Contributing

CashClaw is open source. PRs welcome!

1. Fork the repo
2. Create a feature branch
3. Write your skill
4. Submit a PR

## License

[MIT](LICENSE)

---

<p align="center">
  <sub>Stop prompting. Start earning in USDC.</sub>
</p>
