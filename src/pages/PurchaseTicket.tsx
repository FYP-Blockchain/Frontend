import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Shield, 
  Clock,
  Wallet,
  CreditCard,
  Plus,
  Minus,
  ArrowLeft,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const PurchaseTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<"crypto" | "card">("crypto");
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);

  // Mock event data - in real app, fetch based on ID
  const event = {
    id: parseInt(id || "1"),
    title: "Tech Conference 2024",
    date: "2024-03-15",
    time: "09:00 AM - 06:00 PM",
    venue: "Convention Center, NYC",
    fullAddress: "123 Convention Ave, New York, NY 10001",
    price: 0.15, // ETH
    fiatPrice: 299, // USD
    available: 250,
    total: 500,
    verified: true,
    organizer: "TechCorp Events"
  };

  const totalPrice = event.price * quantity;
  const totalFiatPrice = event.fiatPrice * quantity;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= Math.min(10, event.available)) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPurchaseComplete(true);
    }, 3000);
  };

  if (purchaseComplete) {
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
                    Your NFT tickets have been successfully purchased and minted to your wallet.
                  </p>
                </div>

                <div className="bg-glass/30 rounded-lg p-4 border border-glass-border">
                  <h3 className="font-semibold mb-2">{event.title}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Quantity: {quantity} ticket{quantity > 1 ? 's' : ''}</div>
                    <div>Total Paid: {totalPrice.toFixed(3)} ETH (${totalFiatPrice})</div>
                    <div>Transaction ID: 0x1234...5678</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-center">
                    <h4 className="font-medium mb-2">Your QR Code</h4>
                    <div className="w-32 h-32 bg-gradient-secondary mx-auto rounded-lg flex items-center justify-center">
                      <div className="text-4xl">📱</div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Show this QR code at the event entrance
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <button onClick={() => navigate(-1)} className="hover:text-primary">
              Events
            </button>
            <span>/</span>
            <span className="text-primary">Purchase Ticket</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
            <h1 className="text-3xl font-bold">Purchase Tickets</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="space-y-6">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                {event.verified && (
                  <Badge className="w-fit bg-success/90 text-success-foreground">
                    <Shield className="h-3 w-3 mr-1" />
                    Verified Event
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

            {/* Trust Indicators */}
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

          {/* Purchase Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardHeader>
                <CardTitle>Complete Your Purchase</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Quantity Selection */}
                <div>
                  <Label className="text-base font-medium">Ticket Quantity</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 1 && val <= Math.min(10, event.available)) {
                            setQuantity(val);
                          }
                        }}
                        className="w-20 text-center bg-glass/50 border-glass-border"
                        min={1}
                        max={Math.min(10, event.available)}
                      />
                      <span className="text-sm text-muted-foreground">
                        (max {Math.min(10, event.available)})
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= Math.min(10, event.available)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="bg-glass-border" />

                {/* Price Calculation */}
                <div className="bg-glass/30 rounded-lg p-4 border border-glass-border">
                  <h4 className="font-medium mb-3">Price Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Price per ticket:</span>
                      <span>{event.price} ETH (${event.fiatPrice})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quantity:</span>
                      <span>{quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gas fees (estimated):</span>
                      <span>~0.003 ETH (~$5)</span>
                    </div>
                    <Separator className="bg-glass-border" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total:</span>
                      <span>{totalPrice.toFixed(3)} ETH (${totalFiatPrice + 5})</span>
                    </div>
                  </div>
                </div>

                <Separator className="bg-glass-border" />

                {/* Payment Method */}
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

                {/* Warning for card payments */}
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

                {/* Purchase Button */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full text-base font-semibold"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      {selectedPayment === "crypto" ? (
                        <Wallet className="h-4 w-4 mr-2" />
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      Purchase {quantity} NFT Ticket{quantity > 1 ? 's' : ''} • {totalPrice.toFixed(3)} ETH
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