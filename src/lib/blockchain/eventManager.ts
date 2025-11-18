import { BrowserProvider, Contract, Interface, TransactionReceipt } from "ethers";
import EventManagerArtifact from "@/lib/abis/EventManager.json";
import { ensureTargetNetwork } from "@/services/walletService";

const EventManagerABI = EventManagerArtifact.abi;
const eventManagerAddress = import.meta.env.VITE_EVENT_MANAGER_ADDRESS;

if (!eventManagerAddress) {
  console.warn("VITE_EVENT_MANAGER_ADDRESS is not defined. Self-custody deployment will fail until it is set.");
}

export const getEventManagerContract = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is required to sign this transaction.");
  }

  await ensureTargetNetwork();
  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(eventManagerAddress, EventManagerABI, signer);
  return { contract, signer };
};

export const extractEventIdFromReceipt = (receipt: TransactionReceipt) => {
  const iface = new Interface(EventManagerABI);
  for (const log of receipt.logs) {
    try {
      const parsedLog = iface.parseLog(log);
      if (parsedLog && parsedLog.name === "EventCreated") {
        const eventId = parsedLog.args?.eventId;
        return eventId ? eventId.toString() : null;
      }
    } catch (err) {
      // Ignore logs that do not belong to EventManager
    }
  }
  return null;
};

export const updateEventOnChain = async (
  eventId: string,
  name: string,
  eventTimestamp: bigint,
  metadataURI: string,
  totalSupply: bigint,
  priceInWei: bigint
) => {
  const { contract } = await getEventManagerContract();
  const tx = await contract.updateEventDetails(
    BigInt(eventId),
    name,
    eventTimestamp,
    metadataURI,
    totalSupply,
    priceInWei
  );
  return await tx.wait();
};

export const deactivateEventOnChain = async (eventId: string) => {
  const { contract } = await getEventManagerContract();
  const tx = await contract.deactivateEvent(BigInt(eventId));
  return await tx.wait();
};
