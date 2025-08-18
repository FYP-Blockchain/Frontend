import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Shield, 
  Clock, 
  Star,
  Wallet,
  CreditCard,
  Share2,
  Heart
} from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const [selectedPayment, setSelectedPayment] = useState<"crypto" | "card">("crypto");

  // Mock event data - in real app, fetch based on ID
  const event = {
    id: parseInt(id || "1"),
    title: "Tech Conference 2024",
    description: "Join us for the most innovative tech conference of the year. Featuring keynotes from industry leaders, hands-on workshops, and networking opportunities with professionals from around the globe. This conference will cover the latest trends in AI, blockchain, web3, and emerging technologies.",
    longDescription: "This comprehensive conference spans three days of intensive learning and networking. Attendees will have access to over 50 sessions, including keynote presentations, panel discussions, technical workshops, and startup pitches. The event features exhibition halls showcasing the latest technology innovations, networking lounges, and exclusive after-party events.",
    date: "2024-03-15",
    time: "09:00 AM - 06:00 PM",
    venue: "Convention Center, NYC",
    fullAddress: "123 Convention Ave, New York, NY 10001",
    price: "0.15 ETH",
    fiatPrice: "$299",
    image: "/api/placeholder/800/400",
    category: "conference",
    available: 250,
    total: 500,
    verified: true,
    rating: 4.8,
    reviews: 127,
    organizer: "TechCorp Events",
    features: [
      "NFT Certificate of Attendance",
      "Access to exclusive Discord community",
      "Recorded sessions for lifetime access",
      "Welcome kit with branded merchandise",
      "Networking app access"
    ],
    speakers: [
      { name: "Alex Johnson", role: "CTO at TechCorp", image: "/api/placeholder/100/100" },
      { name: "Sarah Chen", role: "Blockchain Researcher", image: "/api/placeholder/100/100" },
      { name: "Mike Davis", role: "AI Ethics Expert", image: "/api/placeholder/100/100" }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>Events</span>
            <span>/</span>
            <span className="text-primary">Tech Conference 2024</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardContent className="p-0">
                <div className="h-96 bg-gradient-secondary rounded-lg flex items-center justify-center relative">
                  <div className="text-8xl opacity-20">🎫</div>
                  {event.verified && (
                    <Badge className="absolute top-4 right-4 bg-success/90 text-success-foreground">
                      <Shield className="h-3 w-3 mr-1" />
                      Blockchain Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Info */}
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold mb-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {event.rating} ({event.reviews} reviews)
                      </div>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium">{event.date}</div>
                      <div className="text-sm text-muted-foreground">{event.time}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium">{event.venue}</div>
                      <div className="text-sm text-muted-foreground">{event.fullAddress}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium">{event.available} available</div>
                      <div className="text-sm text-muted-foreground">of {event.total} total tickets</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium">By {event.organizer}</div>
                      <div className="text-sm text-muted-foreground">Trusted organizer</div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-glass-border" />

                <div>
                  <h3 className="text-xl font-semibold mb-4">What's Included</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {event.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Featured Speakers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="text-center">
                        <div className="w-16 h-16 bg-gradient-secondary rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-xl">👤</span>
                        </div>
                        <div className="font-medium text-sm">{speaker.name}</div>
                        <div className="text-xs text-muted-foreground">{speaker.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Sidebar */}
          <div className="space-y-6">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-center">Secure Your Ticket</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{event.price}</div>
                  <div className="text-lg text-muted-foreground">{event.fiatPrice}</div>
                  <Badge variant="outline" className="mt-2 border-accent text-accent">
                    {Math.round((event.available / event.total) * 100)}% Available
                  </Badge>
                </div>

                <Separator className="bg-glass-border" />

                <div>
                  <h4 className="font-medium mb-3">Payment Method</h4>
                  <div className="space-y-2">
                    <Button
                      variant={selectedPayment === "crypto" ? "hero" : "glass"}
                      className="w-full justify-start"
                      onClick={() => setSelectedPayment("crypto")}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Pay with Crypto (MetaMask)
                    </Button>
                    <Button
                      variant={selectedPayment === "card" ? "hero" : "glass"}
                      className="w-full justify-start"
                      onClick={() => setSelectedPayment("card")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay with Card (Stripe)
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-base font-semibold"
                >
                  Purchase NFT Ticket
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  <div className="flex items-center justify-center mb-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Secured by blockchain technology
                  </div>
                  <p>Your ticket will be minted as an NFT and stored in your wallet</p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 text-center">Why Choose NFTickets?</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-success mr-2" />
                    <span>Fraud-proof blockchain verification</span>
                  </div>
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 text-primary mr-2" />
                    <span>Secure wallet integration</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>Collectible NFT certificates</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;