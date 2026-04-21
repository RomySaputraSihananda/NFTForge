# NFTForge Contract

ERC-721 NFT contract with built-in marketplace and royalty support.

## Features

- Mint NFTs with custom token URI (IPFS)
- List NFTs for sale (escrow-based marketplace)
- Buy, cancel, and update listings
- ERC-2981 royalty standard (2.5%)
- Owner-only `mintTo` and admin functions
- Reentrancy protection on all state-changing functions

## Setup

```sh
yarn install
```

## Commands

| Command | Description |
|---|---|
| `yarn nx compile contracts` | Compile contracts |
| `yarn nx test contracts` | Run tests |
| `yarn nx node contracts` | Start local Hardhat node |
| `yarn nx deploy contracts` | Deploy to local node |
| `yarn nx deploy:sepolia contracts` | Deploy to Sepolia |

## Deploy to Sepolia

Set required config variables:

```sh
npx hardhat keystore set SEPOLIA_RPC_URL
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

Run deployment with custom parameters:

```sh
npx hardhat ignition deploy ignition/modules/NFTForge.ts \
  --network sepolia \
  --parameters '{"NFTForge": {"royaltyReceiver": "0xYOUR_WALLET"}}'
```

## Contract Details

| Parameter | Value |
|---|---|
| Solidity | 0.8.28 |
| Token Name | NFTForge |
| Symbol | FORGE |
| Max Supply | 10,000 |
| Mint Price | 0.01 ETH |
| Royalty | 2.5% |
| Token IDs | Start from 1 |

## Architecture

Marketplace uses an escrow pattern — when a token is listed, it transfers to the contract. On sale or cancellation, it transfers back to the buyer or seller respectively.
