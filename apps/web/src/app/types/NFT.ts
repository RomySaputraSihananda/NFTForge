export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: NFTAttribute[];
}

export interface NFTListing {
  seller: string;
  price: bigint;
  active: boolean;
}

export interface NFT {
  id: number;
  tokenURI: string;
  owner: string;        // on-chain owner (contract address if listed)
  metadata: NFTMetadata | null;
  listing?: NFTListing; // present and active = listed for sale
}
