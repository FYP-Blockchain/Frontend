import { ethers } from 'ethers';
import { ensureTargetNetwork } from '@/services/walletService';
import TicketNFTArtifact from '@/lib/abis/TicketNFT.json';
import apiClient from '@/services/api';

const TICKET_NFT_ADDRESS = import.meta.env.VITE_TICKET_NFT_ADDRESS;
const TicketNFTABI = TicketNFTArtifact.abi;

interface PurchaseWithMetaMaskParams {
  eventId: string;
  seat: string;
  ticketPriceWei: string;
  organizerAddress: string;
  buyerAddress: string;
}

interface PurchaseResult {
  tokenId: string;
  transactionHash: string;
  fabricTicketId: string;
}

/**
 * Purchase ticket directly using MetaMask (crypto payment)
 * This bypasses the backend payment flow and mints NFT directly
 */
export const purchaseTicketWithMetaMask = async (
  params: PurchaseWithMetaMaskParams
): Promise<PurchaseResult> => {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed');
  }

  if (!TICKET_NFT_ADDRESS) {
    throw new Error('TicketNFT contract address is not configured. Please contact support.');
  }

  await ensureTargetNetwork();

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  let fabricTicketId: string | null = null;

  try {
    // Step 1: Create ticket on Fabric (backend)
    const fabricResponse = await apiClient.post('/ticket/prepare', {
      publicEventId: params.eventId,
      seat: params.seat,
      initialOwner: params.buyerAddress,
    });

    const { fabricTicketId: fbId, ipfsCid, commitmentHash, tokenId } = fabricResponse.data;
    fabricTicketId = fbId;

    // Step 2: Mint NFT with payment via MetaMask
    const ticketNFTContract = new ethers.Contract(
      TICKET_NFT_ADDRESS,
      TicketNFTABI,
      signer
    );

    // Convert hex string to bytes32 format (add 0x prefix if not present)
    const commitmentHashBytes = commitmentHash.startsWith('0x') 
      ? commitmentHash 
      : '0x' + commitmentHash;

    const tx = await ticketNFTContract.mintWithPayment(
      params.buyerAddress,
      tokenId,
      ipfsCid,
      commitmentHashBytes,
      params.organizerAddress,
      params.ticketPriceWei,
      {
        value: params.ticketPriceWei,
      }
    );

    console.log('Transaction submitted:', tx.hash);
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.transactionHash);

    // Step 3: Notify backend of successful minting
    await apiClient.post('/ticket/confirm', {
      fabricTicketId,
      tokenId: tokenId.toString(),
      transactionHash: receipt.hash,
      eventId: params.eventId,
    });

    return {
      tokenId: tokenId.toString(),
      transactionHash: receipt.hash,
      fabricTicketId,
    };
  } catch (error: any) {
    // Handle backend validation errors
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data || 'Invalid request';
      
      // Map backend error codes to user-friendly messages (matching TicketService errors)
      if (errorMessage.includes('TICKET_ALREADY_EXISTS')) {
        throw new Error('This seat is already taken. Please select another seat.');
      } else if (errorMessage.includes('Event is not active') || errorMessage.includes('EVENT_INACTIVE')) {
        throw new Error('This event is no longer active and cannot accept purchases.');
      } else if (errorMessage.includes('Event is sold out') || errorMessage.includes('SOLD_OUT')) {
        throw new Error('This event is completely sold out. No tickets available.');
      } else if (errorMessage.includes('Event has already occurred')) {
        throw new Error('This event has already taken place. Tickets cannot be purchased.');
      } else if (errorMessage.includes('Invalid ticket price')) {
        throw new Error('The ticket price is invalid. Please contact the event organizer.');
      } else if (errorMessage.includes('ALREADY_SOLD')) {
        throw new Error('This seat has already been sold. Please choose a different seat.');
      } else {
        throw new Error(errorMessage);
      }
    }
    
    // Handle server errors
    if (error.response?.status === 500) {
      const errorMessage = error.response?.data || 'Server error';
      
      if (errorMessage.includes('Failed to create ticket on Fabric')) {
        throw new Error('Unable to create ticket record. Please try again.');
      } else if (errorMessage.includes('Failed to prepare ticket')) {
        throw new Error('Unable to prepare ticket for purchase. Please try again.');
      } else {
        throw new Error('An unexpected error occurred. Please try again later.');
      }
    }
    
    // Handle MetaMask user rejection
    if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
      throw new Error('Transaction was cancelled. Your payment was not processed.');
    }
    
    // Handle insufficient funds in MetaMask
    if (error.code === 'INSUFFICIENT_FUNDS' || error.message?.includes('insufficient funds')) {
      throw new Error('Insufficient funds in your wallet. Please add more ETH and try again.');
    }
    
    // Handle network/connection errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
      throw new Error('Network connection error. Please check your internet and try again.');
    }
    
    // Handle other errors
    if (error.message) {
      throw new Error(error.message);
    }
    
    throw new Error('An unexpected error occurred during purchase. Please try again.');
  }
};
