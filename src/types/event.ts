export interface EventResponse {
  id: string;
  name: string;
  organizerAddress: string;
  eventDate: string;
  totalSupply: number;
  priceInWei: string;
  metadataURI: string;
  active: boolean;
  description?: string;
  imageUrl?: string;
  location?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  category?: string;
  // Resale configuration
  maxResalePriceMultiplier?: number; // e.g., 150 = 150% of original price
  organizerResaleShare?: number; // in basis points (e.g., 1000 = 10%)
  resaleAllowed?: boolean;
}

export interface CreateEventRequest {
  name: string;
  eventDate: number; // Unix timestamp
  totalSupply: number;
  ticketPrice: string; // in wei
  metadataURI: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  category?: string;
  // Resale configuration
  maxResalePriceMultiplier: number;
  organizerResaleShare: number;
  resaleAllowed: boolean;
}

