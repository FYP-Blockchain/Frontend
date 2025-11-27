import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
import StripePaymentForm from "@/components/payment/StripePaymentForm";
import {
  Calendar,
  MapPin,
  Users,
  Shield,
  Clock,
  Wallet,
  CreditCard,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  QrCode
} from "lucide-react";
import { createTicket, resetTicketState } from "@/features/ticket/ticketSlice";
import { addNFTToWallet, ensureTargetNetwork } from "@/services/walletService";
import { checkNFTOwnership } from "@/lib/helpers/ticketNFT";
import { purchaseTicketWithMetaMask } from "@/lib/helpers/ticketPurchase";
import { resetPaymentState } from "@/features/payment/paymentSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { RootState } from "@/app/store";
import { fetchEventById } from "@/features/events/eventSlice";
import { format } from "date-fns";
import EventDetailsSkeleton from "@/components/ui/EventDetailsSkeleton";
import { weiToEther } from "@/utils/formatter";
import { ethers } from "ethers";
import { getSeatsForEvent, initializeSeatsForEvent } from "@/services/api";
import { toast } from "sonner";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key');

const PurchaseTicket = () => {
  useSmoothScrollToTop();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading: ticketLoading, error: ticketError, success, ticketId } = useAppSelector(
    (state: RootState) => state.ticket
  );

  const { paymentIntentId, isPaymentSuccessful } = useAppSelector(
    (state: RootState) => state.payment
  );

  const walletAddress = useAppSelector((state: RootState) => state.wallet.address);

  const { items: events, currentItem, loading: eventLoading, error: eventError } = useAppSelector((state: RootState) => state.events);

  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState("crypto");
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoError, setCryptoError] = useState(null);
  const [cryptoSuccess, setCryptoSuccess] = useState(false);
  const [cryptoTicketId, setCryptoTicketId] = useState(null);
  const [seats, setSeats] = useState<Array<{ seatNumber: string; isAvailable: boolean }>>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);

  const eventFromList = events.find((event: any) => event.id === id);

  useEffect(() => {
    if (!eventFromList && id) {
      dispatch(fetchEventById(id));
    }
  }, [id, eventFromList, dispatch]);

  const event = eventFromList || currentItem;

  // Fetch seats from backend
  useEffect(() => {
    const fetchSeats = async () => {
      if (!event?.id || !event?.totalSupply) return;
      
      setSeatsLoading(true);
      try {
        const response = await getSeatsForEvent(event.id);
        if (response.data && response.data.length > 0) {
          setSeats(response.data);
        } else {
          // If no seats exist, try to initialize them
          console.log("No seats found, attempting to initialize...");
          try {
            await initializeSeatsForEvent(event.id, event.totalSupply);
            toast.success("Seats initialized successfully!");
            // Refetch after initialization
            const retryResponse = await getSeatsForEvent(event.id);
            setSeats(retryResponse.data || []);
          } catch (initError) {
            console.error("Failed to initialize seats:", initError);
            toast.error("Failed to initialize seats. Please try refreshing the page.");
          }
        }
      } catch (error) {
        console.error("Failed to fetch seats:", error);
        toast.error("Failed to load seat availability");
      } finally {
        setSeatsLoading(false);
      }
    };

    fetchSeats();
  }, [event?.id, event?.totalSupply]);

  const quantity = selectedSeat ? 1 : 0;
  const priceInEthString = event ? weiToEther(event.priceInWei) : "0.000";
  const priceInEth = event ? parseFloat(priceInEthString) : 0;
  const totalPrice = priceInEth * quantity;

  const handleSeatSelection = (seatNumber: string) => {
    if (selectedSeat === seatNumber) {
      setSelectedSeat(null); // Deselect if already selected
    } else {
      setSelectedSeat(seatNumber); // Select new seat
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPayment(method);
    // Only reset states if there was an error or if switching TO card payment
    if (ticketError) {
      dispatch(resetTicketState());
    }
    // Only reset payment state when switching to card payment to avoid redundant calls
    if (method === "card") {
      dispatch(resetPaymentState());
    }
  };

  const handlePurchase = () => {
    // For crypto payments, use the self-custody method
    if (selectedPayment === "crypto") {
      handleCryptoPurchase();
      return;
    }

    // For card payments, this is called after Stripe payment success
    // Clear any previous error before attempting a new purchase
    if (ticketError) {
      dispatch(resetTicketState());
    }

    if (!event) return;

    const payload = {
      publicEventId: event.id,
      seat: selectedSeat,
      initialOwner:
        walletAddress ||
        localStorage.getItem("userWallet") ||
        "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
      ...(paymentIntentId && { paymentIntentId }), // payment intent Id for stripe payments (card)
    };
    dispatch(createTicket(payload));
  };

  const handleCryptoPurchase = async () => {
    if (!walletAddress) {
      alert("Please connect your MetaMask wallet first to purchase a ticket.");
      return;
    }

    if (!selectedSeat) {
      alert("Please select a seat first.");
      return;
    }

    setCryptoLoading(true);
    setCryptoError(null);

    try {
      // Convert ETH price to Wei
      const priceInWei = ethers.parseEther(priceInEth.toString());

      const result = await purchaseTicketWithMetaMask({
        eventId: event.id.toString(),
        seat: selectedSeat,
        ticketPriceWei: priceInWei.toString(),
        organizerAddress: event.organizerAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        buyerAddress: walletAddress,
      });

      setCryptoTicketId(result.tokenId);
      setCryptoSuccess(true);

      // Refetch seats to update availability
      try {
        const response = await getSeatsForEvent(event.id);
        setSeats(response.data);
      } catch (error) {
        console.error("Failed to refresh seats:", error);
      }
      console.log('Purchase successful:', result);
    } catch (err: any) {
      console.error('Crypto purchase failed:', err);
      setCryptoError(err.message || 'Failed to purchase ticket with crypto');
    } finally {
      setCryptoLoading(false);
    }
  };

  const handleStripePaymentSuccess = (paymentId: string) => {
    // Create the ticket with payment proof
    if (!event) return;
    const payload = {
      publicEventId: event.id,
      seat: selectedSeat,
      initialOwner:
        walletAddress ||
        localStorage.getItem("userWallet") ||
        "0x2546BcD3c84621e976D8185a91A922aE77ECEc30",
      paymentIntentId: paymentId,
    };
    dispatch(createTicket(payload));

    // Reset payment state after successful ticket creation
    setTimeout(() => {
      dispatch(resetPaymentState());
    }, 1000); // Small delay to allow success screen to show
  };

  useEffect(() => {
    // Refetch seats when ticket purchase succeeds
    const refetchSeats = async () => {
      if (success && event?.id) {
        try {
          const response = await getSeatsForEvent(event.id);
          setSeats(response.data);
        } catch (error) {
          console.error("Failed to refresh seats:", error);
        }
      }
    };
    
    refetchSeats();
  }, [success, event?.id]);

  useEffect(() => {
    // Cleanup function only runs when component unmounts
    return () => {
      dispatch(resetTicketState());
      dispatch(resetPaymentState());
    };
  }, [dispatch]);

  const handleSaveToWallet = async () => {
    try {
      const ticketNFTAddress = import.meta.env.VITE_TICKET_NFT_ADDRESS;
      if (!ticketNFTAddress) {
        throw new Error('TicketNFT contract address not configured');
      }

      if (!window.ethereum) {
        throw new Error('MetaMask is not installed');
      }

      const displayTicketId = cryptoSuccess ? cryptoTicketId : ticketId;
      
      if (!displayTicketId) {
        throw new Error('No ticket ID available');
      }

      // Convert ticket ID to string and ensure it's a valid format
      const tokenIdString = displayTicketId.toString();
      console.log('Adding NFT to MetaMask - Token ID:', tokenIdString);

      // Wait a moment for blockchain to sync (especially after backend minting)
      if (!cryptoSuccess) {
        console.log('Waiting for blockchain to sync...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Verify ownership on the blockchain
      const isOwner = await checkNFTOwnership(tokenIdString, walletAddress);
      
      if (!isOwner) {
        toast.error('⚠️ Ownership verification failed. The NFT may still be processing on the blockchain. Please wait a few seconds and try again.');
        return;
      }

      // Ensure we're on the correct network
      await ensureTargetNetwork();

      // Automatically add NFT to MetaMask using wallet_watchAsset
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: ticketNFTAddress,
            tokenId: tokenIdString,
          },
        },
      });

      if (wasAdded) {
        toast.success('🎉 NFT ticket successfully added to MetaMask! Check your NFTs tab.');
      } else {
        toast.info('NFT was not added. You can manually import it later from MetaMask.');
      }

    } catch (error: any) {
      console.error('Error adding NFT to wallet:', error);
      
      // Fallback: show manual instructions if automatic add fails
      if (error.code === 4001) {
        toast.error('You rejected the request to add the NFT.');
      } else {
        const ticketNFTAddress = import.meta.env.VITE_TICKET_NFT_ADDRESS;
        const displayTicketId = cryptoSuccess ? cryptoTicketId : ticketId;
        
        toast.error(`Failed to automatically add NFT: ${error.message}`);
        
        // Copy details to clipboard as fallback
        try {
          await navigator.clipboard.writeText(`Contract: ${ticketNFTAddress}\nToken ID: ${displayTicketId}`);
          toast.info('📋 NFT details copied to clipboard for manual import.');
        } catch (e) {
          console.error('Failed to copy to clipboard:', e);
        }
      }
    }
  };

  if (eventLoading && !event) {
    return <EventDetailsSkeleton />;
  }

  if (eventError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-semibold text-destructive">Failed to load event details.</h2>
          <p className="text-muted-foreground">{eventError.toString()}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold">Event not found</h2>
      </div>
    );
  }

  if (success || cryptoSuccess) {
    const displayTicketId = cryptoSuccess ? cryptoTicketId : ticketId;
    return (
      <div className="min-h-screen bg-gradient-hero">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border text-center p-8">
              <CardContent className="space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-2">Purchase Successful!</h2>
                  <p className="text-muted-foreground">
                    Your NFT ticket has been successfully purchased and minted to your wallet.
                  </p>
                </div>

                <div className="bg-glass/30 rounded-lg p-4 border border-glass-border">
                  <h3 className="font-semibold mb-2">{event.name}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Seat: {selectedSeat}</div>
                    <div>Total Paid: {weiToEther(totalPrice * 1e18)} ETH</div>
                    <div>**Token ID**: {displayTicketId}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Your NFT Ticket</h4>
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full text-base font-semibold"
                      onClick={handleSaveToWallet}
                    >
                      <Wallet className="h-5 w-5 mr-2" />
                      Save NFT Ticket to Wallet
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Click to add this NFT to your crypto wallet.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate('/profile')}
                  >
                    View in Profile
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-primary"
                    onClick={() => navigate('/events')}
                  >
                    Browse More Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button onClick={() => navigate(-1)} className="hover:text-primary">Events</button>
            <span>/</span>
            <span className="text-primary">Purchase Ticket</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Event
            </Button>
            <h1 className="text-3xl font-bold">Purchase Tickets</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardContent className="p-0">
                <img
                  src={event.imageUrl || 'https://placehold.co/600x400/211138/FFFFFF?text=Event'}
                  alt={event.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              </CardContent>
            </Card>
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardHeader>
                <CardTitle className="text-xl">{event.name}</CardTitle>
                {event.active && (
                  <Badge className="w-fit bg-success/90 text-success-foreground">
                    <Shield className="h-3 w-3 mr-1" /> Verified Event
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-primary mr-3" />
                    <div>
                      <div className="font-medium text-sm">{format(new Date(event.eventDate), "MMMM dd, yyyy")}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(event.eventStartTime), "p")} - {format(new Date(event.eventEndTime), "p")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-primary mr-3" />
                    <div>
                      <div className="font-medium text-sm">{event.location || 'Online Event'}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-primary mr-3" />
                    <div>
                      <div className="font-medium text-sm">{seats.filter(s => s.isAvailable).length} available</div>
                    </div>
                  </div>

                
                </div>
              </CardContent>
            </Card>

            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 text-center">Secure Purchase</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-success mr-2" />
                    <span>NFT tickets are tamper-proof</span>
                  </div>
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 text-primary mr-2" />
                    <span>Blockchain verified ownership</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-success mr-2" />
                    <span>Instant transfer to your wallet</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardHeader>
                <CardTitle>Complete Your Purchase</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label className="text-base font-medium">Select Your Seat</Label>
                    <span className="text-sm text-muted-foreground">
                      Selected: {selectedSeat ? 1 : 0} / 1
                    </span>
                  </div>
                  {seatsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading seats...</div>
                  ) : seats.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No seats available</div>
                  ) : (
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-2 overflow-y-auto max-h-[300px] p-2 bg-glass/20 rounded-lg border border-glass-border">
                      {seats.map((seat) => (
                        <Button
                          key={seat.seatNumber}
                          variant={
                            selectedSeat === seat.seatNumber
                              ? "hero"
                              : seat.isAvailable
                                ? "glass"
                                : "secondary"
                          }
                          size="sm"
                          className={`font-semibold transition-transform duration-200 hover:scale-105 ${!seat.isAvailable && "opacity-50 cursor-not-allowed"
                            }`}
                          disabled={!seat.isAvailable && selectedSeat !== seat.seatNumber}
                          onClick={() => handleSeatSelection(seat.seatNumber)}
                        >
                          {seat.seatNumber}
                        </Button>
                      ))}
                    </div>
                  )}
                  {selectedSeat && (
                    <div className="mt-4 text-sm text-center text-muted-foreground">
                      Selected Seat: <span className="font-medium text-primary">{selectedSeat}</span>
                    </div>
                  )}
                  <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-primary"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-glass border border-glass-border"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-secondary opacity-50"></div>
                      <span>Occupied</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-glass-border" />

                <div className="bg-glass/30 rounded-lg p-4 border border-glass-border">
                  <h4 className="font-medium mb-3">Price Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Price per ticket:</span>
                      <span>{priceInEthString} ETH</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tickets selected:</span>
                      <span>{quantity}</span>
                    </div>
                    <Separator className="bg-glass-border" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total:</span>
                      <span>{weiToEther(totalPrice * 1e18)} ETH</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Payment Method</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <Button
                      variant={selectedPayment === "crypto" ? "hero" : "glass"}
                      className="h-22 flex-col justify-center"
                      onClick={() => handlePaymentMethodChange("crypto")}
                    >
                      <Wallet className="h-5 w-5 mb-1" />
                      <span className="text-sm">Pay with Crypto</span>
                      <span className="text-xs opacity-75">MetaMask Required</span>
                    </Button>
                    <Button
                      variant={selectedPayment === "card" ? "hero" : "glass"}
                      className="h-22 flex-col justify-center"
                      onClick={() => handlePaymentMethodChange("card")}
                    >
                      <CreditCard className="h-5 w-5 mb-1" />
                      <span className="text-sm">Pay with Card</span>
                      <span className="text-xs opacity-75">Stripe Secure</span>
                    </Button>
                  </div>
                </div>

                {selectedPayment === "card" && (
                  <div className="flex items-start gap-3 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-warning">Card Payment Notice</p>
                      <p className="text-muted-foreground mt-1">
                        NFT tickets will be held in escrow until you connect a wallet to claim them.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {(ticketError || cryptoError) && (
                  <div className="flex items-center justify-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                    <AlertCircle className="h-5 w-5" />
                    <span>{ticketError || cryptoError}</span>
                  </div>
                )}

                {selectedPayment === "card" ? (
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      onPaymentSuccess={handleStripePaymentSuccess}
                      eventId={event.id}
                      disabled={!selectedSeat}
                    />
                  </Elements>
                ) : (
                  <Button
                    variant="hero"
                    size="lg"
                    className="w-full text-base font-semibold"
                    onClick={handlePurchase}
                    disabled={ticketLoading || cryptoLoading || !selectedSeat}
                  >
                    {(ticketLoading || cryptoLoading) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {cryptoLoading ? 'Confirming Transaction...' : 'Processing Payment...'}
                      </>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Purchase NFT Ticket • {weiToEther(totalPrice * 1e18)} ETH
                      </>
                    )}
                  </Button>
                )}

                <div className="text-center text-xs text-muted-foreground">
                  <p>By purchasing, you agree to our Terms of Service and Privacy Policy.</p>
                  <p className="mt-1">All transactions are secured by blockchain technology.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTicket;