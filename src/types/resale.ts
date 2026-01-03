export interface ResaleInfo {
  tokenId: string;
  isListed: boolean;
  resalePriceWei: string;
  maxResalePriceWei: string;
  originalPriceWei: string;
  organizerResaleShareBps: string;
  organizerAddress: string;
  eventId?: string;
  seat?: string;
  currentOwner?: string;
}

export interface ResaleListing {
  tokenId: string;
  eventId: string;
  seat: string;
  resalePriceWei: string;
  originalPriceWei: string;
  maxResalePriceWei: string;
  sellerAddress: string;
  sellerUsername: string;
  eventName?: string;
  eventDate?: string;
  isListed: boolean;
}

export interface ListForResaleRequest {
  tokenId: string;
  resalePriceWei: string;
  sellerAddress: string;
}

export interface BuyResaleTicketRequest {
  tokenId: string;
  buyerAddress: string;
  transactionHash: string;
}
