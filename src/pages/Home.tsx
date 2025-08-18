import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-blockchain-tickets.jpg";
import { 
  Shield, 
  Zap, 
  Wallet, 
  QrCode, 
  Users, 
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Fraud Prevention",
      description: "Blockchain-verified tickets eliminate counterfeiting and scalping"
    },
    {
      icon: Wallet,
      title: "Secure Payments",
      description: "Pay with crypto or traditional methods - your choice, your security"
    },
    {
      icon: QrCode,
      title: "QR Check-in",
      description: "Instant verification at the door with secure QR codes"
    },
    {
      icon: Zap,
      title: "NFT Tickets",
      description: "Collectible digital tickets stored permanently in your wallet"
    }
  ];

  const stats = [
    { label: "Events Created", value: "10,000+", icon: Users },
    { label: "Tickets Sold", value: "250K+", icon: TrendingUp },
    { label: "Happy Users", value: "50K+", icon: Star },
    { label: "Zero Fraud", value: "100%", icon: Shield }
  ];

  const benefits = [
    "Blockchain verification on Ethereum & Hyperledger Fabric",
    "IPFS metadata storage for permanent records",
    "MetaMask & WalletConnect integration",
    "Traditional payment support (Visa, Mastercard, Stripe, PayPal)",
    "Real-time fraud detection",
    "Instant ticket transfers"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Blockchain NFT Tickets" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero/90" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <Badge className="mb-6 bg-glass/50 backdrop-blur-glass border-glass-border text-foreground">
            <Shield className="h-3 w-3 mr-1" />
            Blockchain-Secured Ticketing
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Revolutionizing
            </span>
            <br />
            <span className="text-foreground">Event Ticketing</span>
            <br />
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              with Blockchain
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Secure, transparent, and fraud-proof event tickets powered by NFT technology. 
            Experience the future of event access today.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/events">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                Browse Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/create-event">
              <Button variant="glass" size="lg" className="text-lg px-8 py-6">
                Create Event
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2 text-success" />
              <span>Ethereum Verified</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              <span>IPFS Secured</span>
            </div>
            <div className="flex items-center">
              <Wallet className="h-4 w-4 mr-2 text-accent" />
              <span>MetaMask Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Why Choose <span className="bg-gradient-primary bg-clip-text text-transparent">NFTickets</span>?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of event ticketing with cutting-edge blockchain technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-glass/50 backdrop-blur-glass border-glass-border hover:shadow-glass transition-all duration-300 group">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 rounded-lg bg-gradient-primary w-fit shadow-glow group-hover:shadow-accent-glow transition-all duration-300">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Built on <span className="bg-gradient-primary bg-clip-text text-transparent">Enterprise-Grade</span> Technology
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Our platform combines the security of blockchain with the convenience of traditional payments, 
                giving you the best of both worlds.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link to="/about">
                  <Button variant="hero" size="lg">
                    Learn more about our technology → NFT Tickets
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <Card className="bg-glass/80 backdrop-blur-glass border-glass-border shadow-glass">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🔗</div>
                    <h3 className="text-2xl font-bold mb-4">Blockchain Integration</h3>
                    <p className="text-muted-foreground mb-6">
                      Every ticket is minted as an NFT and stored on the blockchain, 
                      ensuring authenticity and enabling seamless transfers.
                    </p>
                    <Badge className="bg-gradient-primary text-primary-foreground">
                      Ethereum + Hyperledger Fabric
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of event organizers and attendees who trust NFTickets 
            for secure, transparent ticketing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                Start Exploring Events
              </Button>
            </Link>
            <Link to="/create-event">
              <Button variant="accent" size="lg" className="text-lg px-8 py-6">
                Create Your First Event
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;