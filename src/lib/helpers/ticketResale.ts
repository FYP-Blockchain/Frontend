import { ethers } from 'ethers';
import { ensureTargetNetwork } from '@/services/walletService';
import TicketNFTArtifact from '@/lib/abis/TicketNFT.json';
import apiClient, { listForResale, confirmResalePurchase, getResaleInfo, isUserRegisteredForResale } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import type { ResaleInfo, ListForResaleRequest, BuyResaleTicketRequest } from '@/types/resale';

const TICKET_NFT_ADDRESS = import.meta.env.VITE_TICKET_NFT_ADDRESS;
const TicketNFTABI = TicketNFTArtifact.abi;

/**
 * Get TicketNFT contract instance with user's signer
 */
const getTicketNFTContract = async () => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  await ensureTargetNetwork();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  return new ethers.Contract(TICKET_NFT_ADDRESS, TicketNFTABI, signer);
};

/**
 * Check if user is registered for resale via backend API
 */
export const checkUserRegistration = async (walletAddress: string): Promise<boolean> => {
  try {
    const response = await isUserRegisteredForResale(walletAddress);
    return response.data?.isRegistered ?? false;
  } catch (error) {
    console.error('Failed to check user registration:', error);
    return false;
  }
};

/**
 * Get resale info for a ticket from the blockchain
 */
export const getTicketResaleInfo = async (tokenId: string): Promise<ResaleInfo | null> => {
  try {
    const contract = await getTicketNFTContract();
    const [isListed, resalePrice, maxResalePrice, originalPrice, organizerShare, organizer] = 
      await contract.getResaleInfo(tokenId);
    
    const owner = await contract.ownerOf(tokenId);
    
    return {
      tokenId,
      isListed,
      resalePriceWei: resalePrice.toString(),
      maxResalePriceWei: maxResalePrice.toString(),
      originalPriceWei: originalPrice.toString(),
      organizerResaleShareBps: organizerShare.toString(),
      organizerAddress: organizer,
      currentOwner: owner,
    };
  } catch (error) {
    console.error('Failed to get resale info:', error);
    return null;
  }
};

interface ListTicketParams {
  tokenId: string;
  resalePriceWei: string;
  sellerAddress: string;
}

/**
 * List a ticket for resale
 * 1. Validate with backend (updates Fabric ledger)
 * 2. Submit blockchain transaction via MetaMask
 */
export const listTicketForResale = async (params: ListTicketParams): Promise<boolean> => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  await ensureTargetNetwork();

  try {
    // Step 1: Validate and update off-chain ledger via backend
    const backendResponse = await listForResale({
      tokenId: params.tokenId,
      resalePriceWei: params.resalePriceWei,
      sellerAddress: params.sellerAddress,
    });

    const resaleInfo = backendResponse.data;
    
    // Validate resale price against max
    if (BigInt(params.resalePriceWei) > BigInt(resaleInfo.maxResalePriceWei)) {
      throw new Error(`Resale price exceeds maximum allowed: ${ethers.formatEther(resaleInfo.maxResalePriceWei)} ETH`);
    }

    // Step 2: Submit blockchain transaction
    const contract = await getTicketNFTContract();
    
    const tx = await contract.listForResale(params.tokenId, params.resalePriceWei);
    console.log('List for resale transaction submitted:', tx.hash);
    
    await tx.wait();
    console.log('List for resale transaction confirmed');

    toast.success('Ticket listed for resale successfully!');
    return true;
  } catch (error: any) {
    console.error('Failed to list ticket for resale:', error);
    
    if (error.response?.status === 403) {
      toast.error('You are not the owner of this ticket');
    } else if (error.response?.status === 400) {
      toast.error(error.response?.data || 'Invalid request');
    } else if (error.message?.includes('User must be registered')) {
      toast.error('You must be a registered platform user to resell tickets');
    } else {
      toast.error('Failed to list ticket for resale');
    }
    
    throw error;
  }
};

/**
 * Unlist a ticket from resale
 */
export const unlistTicketFromResale = async (tokenId: string, ownerAddress: string): Promise<boolean> => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  await ensureTargetNetwork();

  try {
    // Submit blockchain transaction first
    const contract = await getTicketNFTContract();
    
    const tx = await contract.unlistFromResale(tokenId);
    console.log('Unlist from resale transaction submitted:', tx.hash);
    
    await tx.wait();
    console.log('Unlist from resale transaction confirmed');

    // Update backend
    await apiClient.post('/resale/unlist', null, {
      params: { tokenId, ownerAddress }
    });

    toast.success('Ticket unlisted from resale');
    return true;
  } catch (error: any) {
    console.error('Failed to unlist ticket from resale:', error);
    toast.error('Failed to unlist ticket from resale');
    throw error;
  }
};

interface BuyResaleParams {
  tokenId: string;
  buyerAddress: string;
  resalePriceWei: string;
}

/**
 * Buy a ticket from resale marketplace
 * 1. Submit blockchain transaction via MetaMask
 * 2. Confirm with backend (updates Fabric ledger)
 */
export const buyResaleTicket = async (params: BuyResaleParams): Promise<string> => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  await ensureTargetNetwork();

  try {
    // Step 1: Submit blockchain transaction
    const contract = await getTicketNFTContract();
    
    const tx = await contract.buyResaleTicket(params.tokenId, {
      value: params.resalePriceWei,
    });
    
    console.log('Buy resale ticket transaction submitted:', tx.hash);
    const receipt = await tx.wait();
    console.log('Buy resale ticket transaction confirmed');

    // Step 2: Confirm with backend
    await confirmResalePurchase({
      tokenId: params.tokenId,
      buyerAddress: params.buyerAddress,
      transactionHash: receipt.hash,
    });

    toast.success('Ticket purchased successfully!');
    return receipt.hash;
  } catch (error: any) {
    console.error('Failed to buy resale ticket:', error);
    
    if (error.message?.includes('User must be registered')) {
      toast.error('You must be a registered platform user to buy resale tickets');
    } else if (error.message?.includes('not listed')) {
      toast.error('This ticket is no longer available for resale');
    } else if (error.message?.includes('Insufficient payment')) {
      toast.error('Insufficient payment for this ticket');
    } else {
      toast.error('Failed to purchase ticket');
    }
    
    throw error;
  }
};

/**
 * Calculate resale fee breakdown
 */
export const calculateResaleFees = (
  salePrice: bigint,
  originalPrice: bigint,
  organizerShareBps: bigint,
  platformFeeBps: bigint = 250n // 2.5%
): {
  platformFee: bigint;
  organizerShare: bigint;
  sellerPayout: bigint;
  profit: bigint;
} => {
  const platformFee = (salePrice * platformFeeBps) / 10000n;
  
  let profit = 0n;
  let organizerShare = 0n;
  
  if (salePrice > originalPrice) {
    profit = salePrice - originalPrice;
    organizerShare = (profit * organizerShareBps) / 10000n;
  }
  
  const sellerPayout = salePrice - platformFee - organizerShare;
  
  return {
    platformFee,
    organizerShare,
    sellerPayout,
    profit,
  };
};
