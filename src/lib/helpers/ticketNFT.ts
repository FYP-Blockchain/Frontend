import { ethers } from 'ethers';
import { ensureTargetNetwork } from '@/services/walletService';
import TicketNFTArtifact from '@/lib/abis/TicketNFT.json';

const TICKET_NFT_ADDRESS = import.meta.env.VITE_TICKET_NFT_ADDRESS;
const TARGET_RPC_URL = import.meta.env.VITE_TARGET_RPC_URL || 'http://127.0.0.1:8545';

const TicketNFTABI = TicketNFTArtifact.abi;

/**
 * Get TicketNFT contract instance with user's signer
 */
export const getTicketNFTContract = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  await ensureTargetNetwork();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(TICKET_NFT_ADDRESS, TicketNFTABI, signer);
};

/**
 * Get TicketNFT contract instance with read-only provider
 */
export const getTicketNFTContractReadOnly = () => {
  const provider = new ethers.JsonRpcProvider(TARGET_RPC_URL);
  return new ethers.Contract(TICKET_NFT_ADDRESS, TicketNFTABI, provider);
};

/**
 * Check if a wallet owns a specific NFT
 */
export const checkNFTOwnership = async (tokenId: string, walletAddress: string): Promise<boolean> => {
  try {
    const contract = getTicketNFTContractReadOnly();
    const owner = await contract.ownerOf(tokenId);
    return owner.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Error checking NFT ownership:', error);
    return false;
  }
};

/**
 * Get token URI (IPFS metadata) for an NFT
 */
export const getTokenURI = async (tokenId: string): Promise<string> => {
  try {
    const contract = getTicketNFTContractReadOnly();
    return await contract.tokenURI(tokenId);
  } catch (error) {
    console.error('Error getting token URI:', error);
    throw error;
  }
};

/**
 * Get NFT metadata from IPFS
 */
export const getNFTMetadata = async (tokenId: string): Promise<any> => {
  try {
    const tokenURI = await getTokenURI(tokenId);
    const response = await fetch(tokenURI);
    return await response.json();
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    throw error;
  }
};
