import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  ShoppingCart,
  AlertCircle,
  Wallet,
  Tag,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { RootState } from "@/app/store";
import { fetchEventById } from "@/features/events/eventSlice";
import { format } from "date-fns";
import { weiToEther } from "@/utils/formatter";
import { getResaleListingsForEvent } from "@/services/api";
import { buyResaleTicket, calculateResaleFees } from "@/lib/helpers/ticketResale";
import { toast } from "sonner";
import type { ResaleListing } from "@/types/resale";
import { ethers } from "ethers";

const ResaleMarketplace = () => {
  useSmoothScrollToTop();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const walletAddress = useAppSelector((state: RootState) => state.wallet.address);
  const { currentItem: event, loading: eventLoading } = useAppSelector(
    (state: RootState) => state.events
  );

  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [buyingTokenId, setBuyingTokenId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
      fetchListings();
    }
  }, [id, dispatch]);

  const fetchListings = async () => {
    if (!id) return;
    
    setLoadingListings(true);
    try {
      const response = await getResaleListingsForEvent(id);
      setListings(response.data || []);
    } catch (error) {
      console.error("Failed to fetch resale listings:", error);
      toast.error("Failed to load resale listings");
    } finally {
      setLoadingListings(false);
    }
  };

  const handleBuyTicket = async (listing: ResaleListing) => {
    if (!walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    setBuyingTokenId(listing.tokenId);
    
    try {
      await buyResaleTicket({
        tokenId: listing.tokenId,
        buyerAddress: walletAddress,
        resalePriceWei: listing.resalePriceWei,
      });
      
      // Refresh listings
      await fetchListings();
      
      toast.success("Ticket purchased successfully! Check your wallet.");
    } catch (error) {
      console.error("Failed to buy ticket:", error);
    } finally {
      setBuyingTokenId(null);
    }
  };

  const getFeeBreakdown = (listing: ResaleListing) => {
    const salePrice = BigInt(listing.resalePriceWei);
    const originalPrice = BigInt(listing.originalPriceWei);
    const organizerShareBps = 1000n; // Assuming 10%, should come from event config
    
    return calculateResaleFees(salePrice, originalPrice, organizerShareBps);
  };

  if (eventLoading || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/events/${id}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Event
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              Resale Marketplace
            </Badge>
          </div>

          <h1 className="text-3xl font-bold mb-2">{event.name} - Resale Tickets</h1>
          
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {format(new Date(event.eventDate), "PPP")}
            </div>
            {event.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {event.location}
              </div>
            )}
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-1" />
              Original Price: {weiToEther(event.priceInWei)} ETH
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="mb-8 bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-500">Resale Marketplace</h3>
                <p className="text-sm text-muted-foreground">
                  These tickets are being resold by other users. Prices may differ from the original.
                  A portion of any profit above the original price goes to the event organizer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listings */}
        {loadingListings ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardContent className="py-12 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Tickets Available</h3>
              <p className="text-muted-foreground">
                There are currently no tickets listed for resale for this event.
              </p>
              <Button
                variant="default"
                className="mt-4"
                onClick={() => navigate(`/purchaseticket/${id}`)}
              >
                Buy Original Tickets
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const fees = getFeeBreakdown(listing);
              const priceInEth = ethers.formatEther(listing.resalePriceWei);
              const originalPriceInEth = ethers.formatEther(listing.originalPriceWei);
              const isPriceHigher = BigInt(listing.resalePriceWei) > BigInt(listing.originalPriceWei);
              
              return (
                <Card
                  key={listing.tokenId}
                  className="bg-glass/80 backdrop-blur-glass border-glass-border hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">Seat {listing.seat}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Token ID: {listing.tokenId}
                        </p>
                      </div>
                      {isPriceHigher && (
                        <Badge variant="secondary" className="bg-orange-500/20 text-orange-500">
                          +{((Number(priceInEth) / Number(originalPriceInEth) - 1) * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Resale Price</span>
                        <span className="font-bold text-lg">{priceInEth} ETH</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Original Price</span>
                        <span>{originalPriceInEth} ETH</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Platform Fee (2.5%)</span>
                        <span>{ethers.formatEther(fees.platformFee)} ETH</span>
                      </div>
                      {fees.organizerShare > 0n && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Organizer Share</span>
                          <span>{ethers.formatEther(fees.organizerShare)} ETH</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Seller Receives</span>
                        <span>{ethers.formatEther(fees.sellerPayout)} ETH</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-xs text-muted-foreground">
                      <p>Seller: {listing.sellerUsername || listing.sellerAddress.slice(0, 8) + '...'}</p>
                    </div>

                    <Button
                      className="w-full"
                      variant="hero"
                      onClick={() => handleBuyTicket(listing)}
                      disabled={
                        buyingTokenId === listing.tokenId ||
                        listing.sellerAddress.toLowerCase() === walletAddress?.toLowerCase()
                      }
                    >
                      {buyingTokenId === listing.tokenId ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : listing.sellerAddress.toLowerCase() === walletAddress?.toLowerCase() ? (
                        "Your Listing"
                      ) : (
                        <>
                          <Wallet className="h-4 w-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResaleMarketplace;
