import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
import {
  Wallet,
  Tag,
  TrendingUp,
  AlertCircle,
  Loader2,
  DollarSign,
  Percent,
  CheckCircle,
  XCircle,
  QrCode,
} from "lucide-react";
import { useAppSelector } from "@/app/hooks";
import { RootState } from "@/app/store";
import { weiToEther } from "@/utils/formatter";
import { getUserNFTs } from "@/lib/helpers/ticketNFT";
import { getTicketResaleInfo, listTicketForResale, unlistTicketFromResale, calculateResaleFees, checkUserRegistration } from "@/lib/helpers/ticketResale";
import { getTicketMetadata } from "@/services/api";
import { toast } from "sonner";
import { ethers } from "ethers";
import type { ResaleInfo } from "@/types/resale";

interface TicketWithResaleInfo {
  tokenId: string;
  eventName?: string;
  seat?: string;
  resaleInfo: ResaleInfo | null;
  metadata?: any;
}

const MyResaleListings = () => {
  useSmoothScrollToTop();
  const navigate = useNavigate();

  const walletAddress = useAppSelector((state: RootState) => state.wallet.address);
  const currentUser = useAppSelector((state: RootState) => state.auth.currentUser);

  const [tickets, setTickets] = useState<TicketWithResaleInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);
  
  // Dialog state
  const [selectedTicket, setSelectedTicket] = useState<TicketWithResaleInfo | null>(null);
  const [resalePrice, setResalePrice] = useState("");
  const [isListing, setIsListing] = useState(false);
  const [isUnlisting, setIsUnlisting] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      checkRegistration();
      fetchTickets();
    }
  }, [walletAddress]);

  const checkRegistration = async () => {
    if (!walletAddress) return;
    
    setCheckingRegistration(true);
    try {
      const registered = await checkUserRegistration(walletAddress);
      setIsRegistered(registered);
    } catch (error) {
      console.error("Failed to check registration:", error);
    } finally {
      setCheckingRegistration(false);
    }
  };

  const fetchTickets = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const nfts = await getUserNFTs(walletAddress);
      
      const ticketsWithInfo: TicketWithResaleInfo[] = await Promise.all(
        nfts.map(async (nft: any) => {
          const resaleInfo = await getTicketResaleInfo(nft.tokenId);
          
          let metadata = null;
          try {
            const metadataResponse = await getTicketMetadata(nft.tokenId);
            metadata = metadataResponse.data;
          } catch (e) {
            console.warn("Failed to fetch metadata for token:", nft.tokenId);
          }
          
          return {
            tokenId: nft.tokenId,
            eventName: metadata?.eventName,
            seat: metadata?.seat,
            resaleInfo,
            metadata,
          };
        })
      );
      
      setTickets(ticketsWithInfo);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      toast.error("Failed to load your tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenListDialog = (ticket: TicketWithResaleInfo) => {
    setSelectedTicket(ticket);
    setResalePrice("");
  };

  const handleListForResale = async () => {
    if (!selectedTicket || !walletAddress || !resalePrice) return;
    
    const priceWei = ethers.parseEther(resalePrice);
    const maxPriceWei = BigInt(selectedTicket.resaleInfo?.maxResalePriceWei || "0");
    
    if (priceWei > maxPriceWei) {
      toast.error(`Price exceeds maximum allowed: ${ethers.formatEther(maxPriceWei)} ETH`);
      return;
    }
    
    setIsListing(true);
    try {
      await listTicketForResale({
        tokenId: selectedTicket.tokenId,
        resalePriceWei: priceWei.toString(),
        sellerAddress: walletAddress,
      });
      
      setSelectedTicket(null);
      await fetchTickets();
    } catch (error) {
      console.error("Failed to list ticket:", error);
    } finally {
      setIsListing(false);
    }
  };

  const handleUnlist = async (tokenId: string) => {
    if (!walletAddress) return;
    
    setIsUnlisting(true);
    try {
      await unlistTicketFromResale(tokenId, walletAddress);
      await fetchTickets();
    } catch (error) {
      console.error("Failed to unlist ticket:", error);
    } finally {
      setIsUnlisting(false);
    }
  };

  if (!walletAddress || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Please connect your wallet and sign in to manage your tickets.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (checkingRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Registration Required</h3>
            <p className="text-muted-foreground mb-4">
              You need to be registered on the platform to resell tickets. 
              This ensures all resale activity is secure and compliant.
            </p>
            <p className="text-sm text-muted-foreground">
              Wallet: {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Please contact support to get registered for resale.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary" className="bg-green-500/20 text-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Registered for Resale
            </Badge>
          </div>

          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">
            Manage your NFT tickets and list them for resale
          </p>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-500">Resale Guidelines</h3>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>• You can only list tickets at or below the maximum resale price</li>
                  <li>• A portion of profit above original price goes to the event organizer</li>
                  <li>• Platform fee of 2.5% applies to all resales</li>
                  <li>• You can unlist your ticket at any time before it's sold</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : tickets.length === 0 ? (
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardContent className="py-12 text-center">
              <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Tickets Found</h3>
              <p className="text-muted-foreground">
                You don't have any NFT tickets in your wallet.
              </p>
              <Button
                variant="default"
                className="mt-4"
                onClick={() => navigate("/events")}
              >
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => {
              const isListed = ticket.resaleInfo?.isListed || false;
              const maxPrice = ticket.resaleInfo?.maxResalePriceWei || "0";
              const originalPrice = ticket.resaleInfo?.originalPriceWei || "0";
              
              return (
                <Card
                  key={ticket.tokenId}
                  className="bg-glass/80 backdrop-blur-glass border-glass-border"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {ticket.eventName || `Ticket #${ticket.tokenId}`}
                        </CardTitle>
                        {ticket.seat && (
                          <CardDescription>Seat: {ticket.seat}</CardDescription>
                        )}
                      </div>
                      {isListed ? (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-500">
                          Listed
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Listed</Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Token ID</span>
                        <span className="font-mono">{ticket.tokenId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Original Price</span>
                        <span>{weiToEther(originalPrice)} ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Resale Price</span>
                        <span className="text-orange-500">{weiToEther(maxPrice)} ETH</span>
                      </div>
                      {isListed && ticket.resaleInfo?.resalePriceWei && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Listed At</span>
                          <span className="font-bold text-green-500">
                            {weiToEther(ticket.resaleInfo.resalePriceWei)} ETH
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* Generate QR Button */}
                    <Button
                      className="w-full mb-2"
                      variant="outline"
                      onClick={() => navigate(`/ticket-qr?tokenId=${ticket.tokenId}`)}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate QR Code
                    </Button>

                    {isListed ? (
                      <Button
                        className="w-full"
                        variant="destructive"
                        onClick={() => handleUnlist(ticket.tokenId)}
                        disabled={isUnlisting}
                      >
                        {isUnlisting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Unlisting...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Remove Listing
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        variant="hero"
                        onClick={() => handleOpenListDialog(ticket)}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        List for Resale
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* List for Resale Dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>List Ticket for Resale</DialogTitle>
              <DialogDescription>
                Set your resale price for this ticket. Remember, the maximum allowed price is{" "}
                {selectedTicket?.resaleInfo?.maxResalePriceWei 
                  ? weiToEther(selectedTicket.resaleInfo.maxResalePriceWei) 
                  : "N/A"}{" "}
                ETH.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Ticket Details</Label>
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  <p><strong>Token ID:</strong> {selectedTicket?.tokenId}</p>
                  <p><strong>Event:</strong> {selectedTicket?.eventName || "Unknown"}</p>
                  <p><strong>Seat:</strong> {selectedTicket?.seat || "N/A"}</p>
                  <p><strong>Original Price:</strong> {weiToEther(selectedTicket?.resaleInfo?.originalPriceWei || "0")} ETH</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resalePrice">Resale Price (ETH)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="resalePrice"
                    type="number"
                    step="0.001"
                    min="0"
                    max={selectedTicket?.resaleInfo?.maxResalePriceWei 
                      ? ethers.formatEther(selectedTicket.resaleInfo.maxResalePriceWei)
                      : undefined}
                    placeholder="0.00"
                    value={resalePrice}
                    onChange={(e) => setResalePrice(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Max allowed: {weiToEther(selectedTicket?.resaleInfo?.maxResalePriceWei || "0")} ETH
                </p>
              </div>

              {resalePrice && selectedTicket?.resaleInfo && (
                <div className="bg-muted p-3 rounded-md text-sm space-y-1">
                  <p className="font-semibold flex items-center">
                    <Percent className="h-4 w-4 mr-1" />
                    Fee Breakdown
                  </p>
                  {(() => {
                    const priceWei = ethers.parseEther(resalePrice || "0");
                    const originalPriceWei = BigInt(selectedTicket.resaleInfo.originalPriceWei);
                    const organizerShareBps = BigInt(selectedTicket.resaleInfo.organizerResaleShareBps);
                    const fees = calculateResaleFees(priceWei, originalPriceWei, organizerShareBps);
                    
                    return (
                      <>
                        <p>Platform Fee (2.5%): {ethers.formatEther(fees.platformFee)} ETH</p>
                        {fees.organizerShare > 0n && (
                          <p>Organizer Share: {ethers.formatEther(fees.organizerShare)} ETH</p>
                        )}
                        <p className="font-bold">You Receive: {ethers.formatEther(fees.sellerPayout)} ETH</p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={handleListForResale}
                disabled={isListing || !resalePrice}
              >
                {isListing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Listing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    List for Resale
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MyResaleListings;
