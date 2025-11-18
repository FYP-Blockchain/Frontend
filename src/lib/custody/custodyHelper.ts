import { EventResponse } from "@/types/event";

export const isSelfCustodyEvent = (
  event: EventResponse | null | undefined,
  connectedWallet?: string | null
): boolean => {
  if (!event?.organizerAddress || !connectedWallet) {
    return false;
  }
  return event.organizerAddress.toLowerCase() === connectedWallet.toLowerCase();
};

export const normalizeAddress = (address?: string | null): string => {
  return address ? address.toLowerCase() : "";
};
