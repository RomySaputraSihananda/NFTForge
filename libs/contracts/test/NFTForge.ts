import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { getAddress, parseEther } from "viem";

describe("NFTForge", async function () {
  const { viem } = await network.connect();
  const BASE_URI    = "ipfs://QmBaseHash/";
  const TOKEN_URI   = "ipfs://QmTokenHash/1.json";
  const MINT_PRICE  = parseEther("0.01");
  const SALE_PRICE  = parseEther("0.1");
  const ROYALTY_BPS = 250n;

  async function deploy() {
    const [owner, user1, user2] = await viem.getWalletClients();
    const contract = await viem.deployContract("NFTForge", [
      BASE_URI,
      owner.account.address, 
    ]);
    return { contract, owner, user1, user2 };
  }

  async function deployAndMint() {
    const ctx = await deploy();
    const asUser1 = await viem.getContractAt("NFTForge", ctx.contract.address, {
      client: { wallet: ctx.user1 },
    });
    await asUser1.write.mint([TOKEN_URI], { value: MINT_PRICE });
    return { ...ctx, asUser1 };
  }


  it("Should have correct name and symbol", async function () {
    const { contract } = await deploy();
    assert.equal(await contract.read.name(), "NFTForge");
    assert.equal(await contract.read.symbol(), "SNFT");
  });

  it("Should have zero total supply after deploy", async function () {
    const { contract } = await deploy();
    assert.equal(await contract.read.totalSupply(), 0n);
  });

  it("Token IDs start from 1", async function () {
    const { contract, user1 } = await deploy();
    const asUser1 = await viem.getContractAt("NFTForge", contract.address, { client: { wallet: user1 } });
    await asUser1.write.mint([TOKEN_URI], { value: MINT_PRICE });
    assert.equal(await contract.read.ownerOf([1n]), getAddress(user1.account.address));
  });

  

  it("Should mint an NFT with correct payment", async function () {
    const { contract, user1 } = await deploy();
    const asUser1 = await viem.getContractAt("NFTForge", contract.address, { client: { wallet: user1 } });

    await viem.assertions.emitWithArgs(
      asUser1.write.mint([TOKEN_URI], { value: MINT_PRICE }),
      contract,
      "Minted",
      [getAddress(user1.account.address), 1n, TOKEN_URI],
    );

    assert.equal(await contract.read.totalSupply(), 1n);
    assert.equal(await contract.read.ownerOf([1n]), getAddress(user1.account.address));
    assert.equal(await contract.read.tokenURI([1n]), TOKEN_URI);
  });

  it("Should revert on empty tokenURI", async function () {
    const { contract, user1 } = await deploy();
    const asUser1 = await viem.getContractAt("NFTForge", contract.address, { client: { wallet: user1 } });
    await assert.rejects(asUser1.write.mint([""], { value: MINT_PRICE }), /EmptyTokenURI/);
  });

  it("Should revert if payment is insufficient", async function () {
    const { contract, user1 } = await deploy();
    const asUser1 = await viem.getContractAt("NFTForge", contract.address, { client: { wallet: user1 } });
    await assert.rejects(asUser1.write.mint([TOKEN_URI], { value: parseEther("0.001") }), /InsufficientPayment/);
  });

  it("Owner can mintTo without payment", async function () {
    const { contract, user2 } = await deploy();
    await contract.write.mintTo([user2.account.address, TOKEN_URI]);
    assert.equal(await contract.read.ownerOf([1n]), getAddress(user2.account.address));
  });

  it("Non-owner cannot call mintTo", async function () {
    const { contract, user1, user2 } = await deploy();
    const asUser1 = await viem.getContractAt("NFTForge", contract.address, { client: { wallet: user1 } });
    await assert.rejects(
      asUser1.write.mintTo([user2.account.address, TOKEN_URI]),
      /OwnableUnauthorizedAccount/,
    );
  });

  

  it("Owner can list NFT for sale", async function () {
    const { contract, user1, asUser1 } = await deployAndMint();
    await viem.assertions.emitWithArgs(
      asUser1.write.listForSale([1n, SALE_PRICE]),
      contract,
      "Listed",
      [1n, getAddress(user1.account.address), SALE_PRICE],
    );
    const listing = await contract.read.listings([1n]) as [`0x${string}`, bigint, boolean];
    assert.equal(listing[2], true);
    assert.equal(listing[1], SALE_PRICE);
  });

  it("NFT transferred to contract on listing", async function () {
    const { contract, asUser1 } = await deployAndMint();
    await asUser1.write.listForSale([1n, SALE_PRICE]);
    assert.equal(await contract.read.ownerOf([1n]), getAddress(contract.address));
  });

  it("Can update listing price", async function () {
    const { contract, asUser1 } = await deployAndMint();
    await asUser1.write.listForSale([1n, SALE_PRICE]);
    const newPrice = parseEther("0.2");
    await asUser1.write.updateListing([1n, newPrice]);
    const listing = await contract.read.listings([1n]) as [`0x${string}`, bigint, boolean];
    assert.equal(listing[1], newPrice);
  });

  it("Buyer can buy listed NFT", async function () {
    const { contract, user1, user2, asUser1 } = await deployAndMint();
    await asUser1.write.listForSale([1n, SALE_PRICE]);

    const asUser2 = await viem.getContractAt("NFTForge", contract.address, { client: { wallet: user2 } });
    await viem.assertions.emitWithArgs(
      asUser2.write.buyNFT([1n], { value: SALE_PRICE }),
      contract,
      "Sale",
      [1n, getAddress(user1.account.address), getAddress(user2.account.address), SALE_PRICE],
    );

    assert.equal(await contract.read.ownerOf([1n]), getAddress(user2.account.address));
  });

  it("Royalty is sent to royaltyReceiver on sale", async function () {
    const { contract, owner, user1, user2, asUser1 } = await deployAndMint();
    await asUser1.write.listForSale([1n, SALE_PRICE]);

    const publicClient = await viem.getPublicClient();
    const ownerBalBefore = await publicClient.getBalance({ address: owner.account.address });

    const asUser2 = await viem.getContractAt("NFTForge", contract.address, { client: { wallet: user2 } });
    await asUser2.write.buyNFT([1n], { value: SALE_PRICE });

    const ownerBalAfter = await publicClient.getBalance({ address: owner.account.address });
    const expectedRoyalty = (SALE_PRICE * ROYALTY_BPS) / 10_000n;

    
    assert.ok(ownerBalAfter >= ownerBalBefore + expectedRoyalty - parseEther("0.001"));
  });

  it("Seller can cancel listing and get NFT back", async function () {
    const { contract, user1, asUser1 } = await deployAndMint();
    await asUser1.write.listForSale([1n, SALE_PRICE]);
    await asUser1.write.cancelListing([1n]);
    assert.equal(await contract.read.ownerOf([1n]), getAddress(user1.account.address));
  });

  it("Cannot list price = 0", async function () {
    const { asUser1 } = await deployAndMint();
    await assert.rejects(asUser1.write.listForSale([1n, 0n]), /InvalidPrice/);
  });

  

  it("Owner can burn their NFT", async function () {
    const { contract, asUser1 } = await deployAndMint();
    await asUser1.write.burn([1n]);
    assert.equal(await contract.read.totalSupply(), 1n); 
    await assert.rejects(contract.read.ownerOf([1n]), /ERC721NonexistentToken/);
  });

  it("Cannot burn a listed NFT", async function () {
    const { asUser1 } = await deployAndMint();
    await asUser1.write.listForSale([1n, SALE_PRICE]);
    await assert.rejects(asUser1.write.burn([1n]), /TokenIsListed/);
  });

  

  it("EIP-2981 royaltyInfo returns correct values", async function () {
    const { contract, owner } = await deploy();
    const [receiver, amount] = await contract.read.royaltyInfo([1n, SALE_PRICE]) as [`0x${string}`, bigint];
    assert.equal(receiver, getAddress(owner.account.address));
    assert.equal(amount, (SALE_PRICE * ROYALTY_BPS) / 10_000n);
  });

  

  it("Owner can withdraw contract balance", async function () {
    const { contract, user1 } = await deploy();
    const asUser1 = await viem.getContractAt("NFTForge", contract.address, { client: { wallet: user1 } });
    await asUser1.write.mint([TOKEN_URI], { value: MINT_PRICE });

    const publicClient = await viem.getPublicClient();
    const balanceBefore = await publicClient.getBalance({ address: contract.address });
    assert.equal(balanceBefore, MINT_PRICE);

    const ownerAddr = (await viem.getWalletClients())[0].account.address;
    await viem.assertions.emitWithArgs(
      contract.write.withdraw(),
      contract,
      "Withdrawn",
      [getAddress(ownerAddr), MINT_PRICE],
    );
    const balanceAfter = await publicClient.getBalance({ address: contract.address });
    assert.equal(balanceAfter, 0n);
  });

  it("Owner can update royaltyReceiver", async function () {
    const { contract, user2 } = await deploy();
    await contract.write.setRoyaltyReceiver([user2.account.address]);
    assert.equal(await contract.read.royaltyReceiver(), getAddress(user2.account.address));
  });
});
