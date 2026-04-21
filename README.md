# NFTForge

NFT minting and marketplace platform built on Ethereum. Users can mint ERC-721 NFTs with IPFS metadata, list them for sale, and buy from other users — all on-chain.

## Stack

- **Smart Contract** — Solidity 0.8.28, OpenZeppelin ERC-721, Hardhat 3
- **Frontend** — React, Vite, Wagmi, Viem, Tailwind CSS
- **Storage** — IPFS via Pinata
- **Monorepo** — Nx

## Project Structure

```
apps/web          — React frontend
libs/contracts    — Solidity contract, tests, deployment scripts
```

## Prerequisites

- Node.js 20+
- Yarn
- MetaMask browser extension

## Setup

```sh
yarn install
```

Copy the env file and fill in the values:

```sh
cp apps/web/.env.example apps/web/.env
```

Required env vars in `apps/web/.env`:

```
VITE_CONTRACT_ADDRESS=   # deployed contract address
VITE_RPC_URL=            # RPC endpoint (default: http://127.0.0.1:8545)
VITE_PINATA_JWT=         # Pinata JWT for IPFS upload
```

## Development

Start a local Hardhat node:

```sh
yarn nx node contracts
```

Deploy the contract to local node:

```sh
yarn nx deploy contracts
```

Start the frontend:

```sh
yarn nx serve frontend
```

## Testing

```sh
yarn nx test contracts
```

## Deploy to Sepolia

Deploy the contract:

```sh
yarn nx deploy:sepolia contracts
```

After deployment, update `apps/web/.env`:

```
VITE_CONTRACT_ADDRESS=<deployed address>
VITE_RPC_URL=<sepolia rpc url>
```

Build and deploy the frontend to Vercel or any static host:

```sh
yarn nx build frontend
```

## Contract

- **Name** — NFTForge
- **Symbol** — FORGE
- **Standard** — ERC-721 with ERC-2981 royalties
- **Max Supply** — 10,000
- **Mint Price** — 0.01 ETH
- **Royalty** — 2.5%

## License

MIT
