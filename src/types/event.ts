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
}
