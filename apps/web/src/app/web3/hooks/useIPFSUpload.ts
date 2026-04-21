import { useState } from 'react';
import { NFTMetadata } from '../../types/NFT';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT as string | undefined;

export function useIPFSUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<'idle' | 'image' | 'metadata'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);

  const hasPinata = Boolean(PINATA_JWT);

  const uploadImage = async (file: File): Promise<string> => {
    if (!PINATA_JWT) throw new Error('VITE_PINATA_JWT not set in .env');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Image upload failed: ${err}`);
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  };

  const uploadMetadata = async (metadata: NFTMetadata): Promise<string> => {
    if (!PINATA_JWT) throw new Error('VITE_PINATA_JWT not set in .env');

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: { name: metadata.name },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Metadata upload failed: ${err}`);
    }

    const data = await res.json();
    return `ipfs://${data.IpfsHash}`;
  };

  const upload = async (
    file: File,
    name: string,
    description: string,
    rarity: string
  ): Promise<string> => {
    setUploading(true);
    setUploadError(null);
    try {
      setUploadStep('image');
      const imageURI = await uploadImage(file);

      setUploadStep('metadata');
      const attributes = rarity ? [{ trait_type: 'Rarity', value: rarity }] : [];
      const metadataURI = await uploadMetadata({ name, description, image: imageURI, attributes });

      setUploadStep('idle');
      return metadataURI;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Upload failed';
      setUploadError(msg);
      setUploadStep('idle');
      throw e;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, uploadStep, uploadError, hasPinata };
}
