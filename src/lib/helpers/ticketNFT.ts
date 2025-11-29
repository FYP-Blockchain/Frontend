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
 * Get NFT metadata via backend API (avoids CORS issues)
 */
export const getNFTMetadata = async (tokenId: string): Promise<any> => {
  try {
    // Import dynamically to avoid circular dependency
    const { getTicketMetadata } = await import('@/services/api');
    
    console.log(`[Token ${tokenId}] Fetching metadata via backend...`);
    const response = await getTicketMetadata(tokenId);
    const metadata = response.data;
    
    console.log(`[Token ${tokenId}] Full Metadata Retrieved:`, metadata);
    console.log(`[Token ${tokenId}] Available fields:`, Object.keys(metadata));
    
    // Log specific useful fields if they exist
    if (metadata.name) console.log(`  - Name: ${metadata.name}`);
    if (metadata.description) console.log(`  - Description: ${metadata.description}`);
    if (metadata.image) console.log(`  - Image: ${metadata.image}`);
    if (metadata.attributes) {
      console.log(`  - Attributes:`, metadata.attributes);
      // Log each attribute
      metadata.attributes.forEach((attr: any) => {
        console.log(`    • ${attr.trait_type}: ${attr.value}`);
      });
    }
    
    return metadata;
  } catch (error: any) {
    console.error('Error fetching NFT metadata:', error);
    // Provide more helpful error messages
    if (error.response?.status === 401) {
      throw new Error('Please log in to view ticket metadata');
    } else if (error.response?.status === 404) {
      throw new Error('Ticket not found');
    }
    throw error;
  }
};

/**
 * Get all NFT token IDs owned by a wallet address
 * Uses Transfer events to find all tokens owned by the address
 */
export const getUserNFTs = async (walletAddress: string): Promise<Array<{ tokenId: string; metadata?: any }>> => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    await ensureTargetNetwork();

    const contract = await getTicketNFTContract();
    
    console.log('Connected to contract:', TICKET_NFT_ADDRESS);
    console.log('Searching for NFTs owned by:', walletAddress);
    
    // Try multiple approaches to find NFTs
    
    // Approach 1: Check TicketMinted events (custom event for this contract)
    let tokenIds = new Set<string>();
    try {
      const mintFilter = contract.filters.TicketMinted(null, walletAddress);
      const mintEvents = await contract.queryFilter(mintFilter, 0, 'latest');
      console.log('Found TicketMinted events:', mintEvents.length);
      
      for (const event of mintEvents) {
        if ('args' in event && event.args) {
          const tokenId = event.args.tokenId;
          if (tokenId !== undefined) {
            tokenIds.add(tokenId.toString());
            console.log('Found token from TicketMinted event:', tokenId.toString());
          }
        }
      }
    } catch (e) {
      console.warn('Could not query TicketMinted events:', e);
    }
    
    // Approach 2: Check Transfer events where 'to' is the user
    try {
      const transferFilter = contract.filters.Transfer(null, walletAddress);
      const transferEvents = await contract.queryFilter(transferFilter, 0, 'latest');
      console.log('Found Transfer events:', transferEvents.length);
      
      for (const event of transferEvents) {
        if ('args' in event && event.args) {
          const tokenId = event.args.tokenId;
          if (tokenId !== undefined) {
            tokenIds.add(tokenId.toString());
            console.log('Found token from Transfer event:', tokenId.toString());
          }
        }
      }
    } catch (e) {
      console.warn('Could not query Transfer events:', e);
    }

    console.log('Total unique token IDs found:', Array.from(tokenIds));

    if (tokenIds.size === 0) {
      console.warn('No tokens found. Possible reasons:');
      console.warn('1. User has never received any NFTs on this contract');
      console.warn('2. Wrong network - ensure MetaMask is on Hardhat Localhost');
      console.warn('3. Contract address mismatch - check VITE_TICKET_NFT_ADDRESS');
      console.warn('Current contract address:', TICKET_NFT_ADDRESS);
      return [];
    }

    // Verify ownership and fetch metadata for each token
    const nfts = [];
    for (const tokenId of tokenIds) {
      try {
        // Check if user still owns this token
        const owner = await contract.ownerOf(tokenId);
        
        console.log(`Token ${tokenId} - Current owner: ${owner}`);
        
        if (owner.toLowerCase() === walletAddress.toLowerCase()) {
          console.log(`✓ User owns token ${tokenId}`);
          
          // Try to fetch metadata
          let metadata;
          try {
            console.log(`\n=== Fetching metadata for Token ${tokenId} ===`);
            metadata = await getNFTMetadata(tokenId);
            
            console.log(`\n📋 TICKET DATA AVAILABLE FOR TOKEN ${tokenId}:`);
            console.log('Full metadata object:', JSON.stringify(metadata, null, 2));
            
            // Show what data can be displayed in UI
            console.log('\n🎫 DATA YOU CAN USE FOR DISPLAY:');
            if (metadata.name) console.log(`  ✓ Event Name: "${metadata.name}"`);
            if (metadata.description) console.log(`  ✓ Description: "${metadata.description}"`);
            if (metadata.image) console.log(`  ✓ Image URL: "${metadata.image}"`);
            
            if (metadata.attributes && Array.isArray(metadata.attributes)) {
              console.log('\n  ✓ Ticket Attributes:');
              metadata.attributes.forEach((attr: any) => {
                console.log(`    - ${attr.trait_type}: ${attr.value}`);
              });
              
              // Extract useful attributes for display
              const eventName = metadata.attributes.find((a: any) => a.trait_type === 'Event')?.value;
              const seat = metadata.attributes.find((a: any) => a.trait_type === 'Seat')?.value;
              const eventDate = metadata.attributes.find((a: any) => a.trait_type === 'Event Date')?.value;
              const venue = metadata.attributes.find((a: any) => a.trait_type === 'Venue')?.value;
              
              console.log('\n  📌 SUGGESTED UI DISPLAY:');
              if (eventName) console.log(`     Event: ${eventName}`);
              if (seat) console.log(`     Seat: ${seat}`);
              if (eventDate) console.log(`     Date: ${eventDate}`);
              if (venue) console.log(`     Venue: ${venue}`);
            }
            
            console.log('='.repeat(60) + '\n');
            
          } catch (e) {
            console.warn(`Could not fetch metadata for token ${tokenId}:`, e);
          }

          nfts.push({
            tokenId: tokenId,
            metadata
          });
        } else {
          console.log(`✗ User no longer owns token ${tokenId}, current owner: ${owner}`);
        }
      } catch (error) {
        console.warn(`Error checking ownership for token ${tokenId}:`, error);
      }
    }

    console.log(`✓ Final result: Found ${nfts.length} NFT(s) owned by user`);
    console.log('NFT Details:', nfts);
    return nfts;
  } catch (error) {
    console.error('Error fetching user NFTs:', error);
    throw error;
  }
};
