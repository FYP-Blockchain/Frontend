import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
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
import { addNFTToWallet } from "@/services/walletService";
import { checkNFTOwnership } from "@/lib/helpers/ticketNFT";
import { purchaseTicketWithMetaMask } from "@/lib/helpers/ticketPurchase";
import { useSelector as useWalletSelector } from "react-redux";
import { ethers } from "ethers";

// Function to generate 50 seats with A1, B1 format
const generateSeats = () => {
  const seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 10;
  let availableCount = 0;
  for (const row of rows) {
    for (let i = 1; i <= seatsPerRow; i++) {
      const seatNumber = `${row}${i}`;
      // For demonstration, seats are available in a pattern
      const isAvailable = availableCount < 25;
      seats.push({
        number: seatNumber,
        isAvailable: isAvailable,
      });
      availableCount++;
    }
  }
  return seats;
};

const allSeats = generateSeats();

const PurchaseTicket = () => {
  useSmoothScrollToTop();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading, error, success, ticketId } = useSelector(
    (state) => state.ticket
  );

  const walletAddress = useWalletSelector((state) => state.wallet.address);

  const [selectedSeat, setSelectedSeat] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState("crypto");
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoError, setCryptoError] = useState(null);
  const [cryptoSuccess, setCryptoSuccess] = useState(false);
  const [cryptoTicketId, setCryptoTicketId] = useState(null);

  const event = {
    id: parseInt(id || "1"),
    title: "Tech Conference 2024",
    date: "2024-03-15",
    time: "09:00 AM - 06:00 PM",
    venue: "Convention Center, NYC",
    fullAddress: "123 Convention Ave, New York, NY 10001",
    price: 0.15, // ETH
    fiatPrice: 299, // USD
    available: 25, // Updated based on mock data
    total: 50, // Updated based on mock data
    verified: true,
    organizer: "TechCorp Events",
  };

  const quantity = selectedSeat ? 1 : 0;
  const totalPrice = event.price * quantity;
  const totalFiatPrice = event.fiatPrice * quantity;

  const handleSeatSelection = (seatNumber) => {
    if (selectedSeat === seatNumber) {
      setSelectedSeat(null); // Deselect if already selected
    } else {
      setSelectedSeat(seatNumber); // Select new seat
    }
  };

  const handlePurchase = () => {
    if (!walletAddress) {
      alert("Please connect your MetaMask wallet first to purchase a ticket.");
      return;
    }

    if (!selectedSeat) {
      alert("Please select a seat first.");
      return;
    }

    if (selectedPayment === "crypto") {
      handleCryptoPurchase();
    } else {
      handleCardPurchase();
    }
  };

  const handleCardPurchase = () => {
    // Clear any previous error before attempting a new purchase
    if (error) {
      dispatch(resetTicketState());
    }

    const payload = {
      publicEventId: event.id,
      seat: selectedSeat,
      initialOwner: walletAddress,
    };
    dispatch(createTicket(payload));
  };

  const handleCryptoPurchase = async () => {
    setCryptoLoading(true);
    setCryptoError(null);

    try {
      // Convert ETH price to Wei
      const priceInWei = ethers.parseEther(event.price.toString());

      const result = await purchaseTicketWithMetaMask({
        eventId: event.id.toString(),
        seat: selectedSeat,
        ticketPriceWei: priceInWei.toString(),
        organizerAddress: event.organizerAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // TODO: Get from event
        buyerAddress: walletAddress,
      });

      setCryptoTicketId(result.tokenId);
      setCryptoSuccess(true);
      console.log('Purchase successful:', result);
    } catch (err) {
      console.error('Crypto purchase failed:', err);
      setCryptoError(err.message || 'Failed to purchase ticket with crypto');
    } finally {
      setCryptoLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(resetTicketState());
    };
  }, [dispatch]);

  const handleSaveToWallet = async () => {
    try {
      const ticketNFTAddress = import.meta.env.VITE_TICKET_NFT_ADDRESS;
      if (!ticketNFTAddress) {
        throw new Error('TicketNFT contract address not configured');
      }

      const displayTicketId = cryptoSuccess ? cryptoTicketId : ticketId;
      
      if (!displayTicketId) {
        throw new Error('No ticket ID available');
      }

      // Convert ticket ID to string and ensure it's a valid format
      const tokenIdString = displayTicketId.toString();
      console.log('Checking ownership for token ID:', tokenIdString);

      // Wait a moment for blockchain to sync (especially after backend minting)
      if (!cryptoSuccess) {
        console.log('Waiting for blockchain to sync...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // First, verify ownership on the blockchain
      const isOwner = await checkNFTOwnership(tokenIdString, walletAddress);
      
      if (!isOwner) {
        alert('⚠️ Ownership verification failed.\n\nThe NFT may still be processing on the blockchain. This can happen if:\n\n1. The transaction is still pending\n2. The backend minting failed\n3. The blockchain needs more time to sync\n\nPlease wait a few seconds and try again. If the problem persists, contact support with this ticket ID: ' + tokenIdString);
        return;
      }

      // Copy details to clipboard for convenience
      try {
        await navigator.clipboard.writeText(`${ticketNFTAddress}\n${tokenIdString}`);
      } catch (e) {
        // Clipboard copy is optional, ignore errors
      }

      // Show confirmation dialog and offer to open MetaMask
      const userConfirmed = window.confirm(
        `✅ NFT Ownership Verified!\n\n` +
        `Your ticket NFT is confirmed on the blockchain.\n\n` +
        `Contract: ${ticketNFTAddress}\n` +
        `Token ID: ${tokenIdString}\n\n` +
        `📋 Details copied to clipboard!\n\n` +
        `To view in MetaMask:\n` +
        `1. Click OK to open MetaMask\n` +
        `2. Go to NFTs tab\n` +
        `3. Click "Import NFT"\n` +
        `4. Paste the contract address (from clipboard)\n` +
        `5. Enter token ID: ${tokenIdString}\n\n` +
        `Click OK to open MetaMask, or Cancel to dismiss.`
      );

      if (userConfirmed && window.ethereum) {
        // Open MetaMask by requesting accounts
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Show follow-up reminder after MetaMask opens
          setTimeout(() => {
            alert(
              `MetaMask is now open!\n\n` +
              `📍 Next steps:\n` +
              `1. Click on the "NFTs" tab\n` +
              `2. Click "Import NFT"\n` +
              `3. Paste contract address:\n   ${ticketNFTAddress}\n` +
              `4. Enter token ID:\n   ${tokenIdString}\n\n` +
              `💡 Details are in your clipboard - just paste!`
            );
          }, 500);
        } catch (error) {
          console.error('Error opening MetaMask:', error);
        }
      }

    } catch (error) {
      console.error('Error verifying NFT:', error);
      alert(`Failed to verify NFT: ${error.message}`);
    }
  };

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
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Seat: {selectedSeat}</div>
                    <div>Total Paid: {totalPrice.toFixed(3)} ETH (${totalFiatPrice})</div>
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
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                {event.verified && (
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
                      <div className="font-medium text-sm">{event.date}</div>
                      <div className="text-xs text-muted-foreground">{event.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-primary mr-3" />
                    <div>
                      <div className="font-medium text-sm">{event.venue}</div>
                      <div className="text-xs text-muted-foreground">{event.fullAddress}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-primary mr-3" />
                    <div>
                      <div className="font-medium text-sm">{event.available} available</div>
                      <div className="text-xs text-muted-foreground">of {event.total} total tickets</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-primary mr-3" />
                    <div>
                      <div className="font-medium text-sm">By {event.organizer}</div>
                      <div className="text-xs text-muted-foreground">Trusted organizer</div>
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
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-2 overflow-y-auto max-h-[300px] p-2 bg-glass/20 rounded-lg border border-glass-border">
                    {allSeats.map((seat) => (
                      <Button
                        key={seat.number}
                        variant={
                          selectedSeat === seat.number
                            ? "hero"
                            : seat.isAvailable
                            ? "glass"
                            : "secondary"
                        }
                        size="sm"
                        className={`font-semibold transition-transform duration-200 hover:scale-105 ${
                          !seat.isAvailable && "opacity-50 cursor-not-allowed"
                        }`}
                        disabled={!seat.isAvailable && selectedSeat !== seat.number}
                        onClick={() => handleSeatSelection(seat.number)}
                      >
                        {seat.number}
                      </Button>
                    ))}
                  </div>
                  {selectedSeat && (
                    <div className="mt-4 text-sm text-center text-muted-foreground">
                      Selected Seat: <span className="font-medium text-primary">{selectedSeat}</span>
                    </div>
                  )}
                </div>

                <Separator className="bg-glass-border" />

                <div className="bg-glass/30 rounded-lg p-4 border border-glass-border">
                  <h4 className="font-medium mb-3">Price Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Price per ticket:</span>
                      <span>{event.price} ETH (${event.fiatPrice})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tickets selected:</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gas fees (estimated):</span>
                      <span>{quantity > 0 ? "~0.003 ETH (~$5)" : "N/A"}</span>
                    </div>
                    <Separator className="bg-glass-border" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total:</span>
                      <span>{totalPrice.toFixed(3)} ETH (${totalFiatPrice + (quantity > 0 ? 5 : 0)})</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Payment Method</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <Button
                      variant={selectedPayment === "crypto" ? "hero" : "glass"}
                      className="h-16 flex-col justify-center"
                      onClick={() => setSelectedPayment("crypto")}
                    >
                      <Wallet className="h-5 w-5 mb-1" />
                      <span className="text-sm">Pay with Crypto</span>
                      <span className="text-xs opacity-75">MetaMask Required</span>
                    </Button>
                    <Button
                      variant={selectedPayment === "card" ? "hero" : "glass"}
                      className="h-16 flex-col justify-center"
                      onClick={() => setSelectedPayment("card")}
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
                {(error || cryptoError) && (
                  <div className="flex items-center justify-center gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                    <AlertCircle className="h-5 w-5" />
                    <span>{error || cryptoError}</span>
                  </div>
                )}
                
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full text-base font-semibold"
                  onClick={handlePurchase}
                  disabled={loading || cryptoLoading || !selectedSeat}
                >
                  {(loading || cryptoLoading) ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {cryptoLoading ? 'Confirming Transaction...' : 'Processing Payment...'}
                    </>
                  ) : (
                    <>
                      {selectedPayment === "crypto" ? (
                        <Wallet className="h-4 w-4 mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Purchase NFT Ticket • {totalPrice.toFixed(3)} ETH
                    </>
                  )}
                </Button>

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