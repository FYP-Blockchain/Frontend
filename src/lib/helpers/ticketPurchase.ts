import { ethers } from 'ethers';
import { ensureTargetNetwork } from '@/services/walletService';
import TicketNFTArtifact from '@/lib/abis/TicketNFT.json';
import apiClient from '@/services/api';
import { toast } from '@/components/ui/sonner';

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

    const { fabricTicketId: fbId, ipfsCid, commitmentHash, tokenId, seat } = fabricResponse.data;
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
      ipfsCid: ipfsCid,
      seat: seat,
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
        toast.error('This seat is already taken. Please select another seat.');
      } else if (errorMessage.includes('Event is not active') || errorMessage.includes('EVENT_INACTIVE')) {
        toast.error('This event is no longer active and cannot accept purchases.');
      } else if (errorMessage.includes('Event is sold out') || errorMessage.includes('SOLD_OUT')) {
        toast.error('This event is completely sold out. No tickets available.');
      } else if (errorMessage.includes('Event has already occurred')) {
        toast.error('This event has already taken place. Tickets cannot be purchased.');
      } else if (errorMessage.includes('Invalid ticket price')) {
        toast.error('The ticket price is invalid. Please contact the event organizer.');
      } else if (errorMessage.includes('ALREADY_SOLD')) {
        toast.error('This seat has already been sold. Please choose a different seat.');
      } else {
        toast.error(errorMessage);
      }
    } else {
      toast.error('An unexpected error occurred. Please try again later.');
    }

    throw error; // Re-throw the error after displaying the snackbar
  }
};
