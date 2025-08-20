import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
import { 
  Shield, 
  Zap, 
  Wallet, 
  QrCode, 
  Link as LinkIcon,
  CheckCircle,
  Layers,
  Lock,
  Globe,
  Users,
  ArrowRight
} from "lucide-react";

const About = () => {
  useSmoothScrollToTop();
  const features = [
    {
      icon: Shield,
      title: "NFT Tickets",
      description: "Each ticket is a unique NFT stored on the blockchain, making it impossible to counterfeit or duplicate.",
      benefits: [
        "Unique digital ownership",
        "Immutable proof of purchase",
        "Collectible memorabilia",
        "Secure transferability"
      ]
    },
    {
      icon: Lock,
      title: "Blockchain Verification",
      description: "Every transaction is recorded on Ethereum and Hyperledger Fabric for maximum security and transparency.",
      benefits: [
        "Fraud-proof verification",
        "Transparent transaction history",
        "Decentralized security",
        "Smart contract automation"
      ]
    },
    {
      icon: Wallet,
      title: "Secure Payments",
      description: "Multiple payment options including cryptocurrency and traditional methods for maximum flexibility.",
      benefits: [
        "MetaMask & WalletConnect",
        "Visa, Mastercard support",
        "Stripe & PayPal integration",
        "Secure payment processing"
      ]
    }
  ];

  const technologies = [
    {
      name: "Ethereum",
      description: "Primary blockchain for NFT minting and transactions",
      icon: "⚡"
    },
    {
      name: "Hyperledger Fabric",
      description: "Enterprise blockchain for enhanced security",
      icon: "🔗"
    },
    {
      name: "IPFS",
      description: "Distributed storage for ticket metadata",
      icon: "🌐"
    },
    {
      name: "MetaMask",
      description: "Web3 wallet integration for crypto payments",
      icon: "🦊"
    },
    {
      name: "Smart Contracts",
      description: "Automated ticket validation and transfers",
      icon: "📋"
    },
    {
      name: "QR Verification",
      description: "Instant ticket validation at events",
      icon: "📱"
    }
  ];

  const advantages = [
    "Zero counterfeit tickets guaranteed",
    "Instant verification at event entrances",
    "Secure ticket transfers between users",
    "Immutable attendance records",
    "Reduced operational costs for organizers",
    "Enhanced fan engagement through collectibles"
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-glass/50 backdrop-blur-glass border-glass-border text-foreground">
            <Shield className="h-3 w-3 mr-1" />
            About Our Technology
          </Badge>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Next-Generation
            </span>
            <br />
            <span className="text-foreground">Event Ticketing</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover how blockchain technology, NFTs, and smart contracts are revolutionizing 
            the way we create, distribute, and verify event tickets.
          </p>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="bg-glass/80 backdrop-blur-glass border-glass-border hover:shadow-glass transition-all duration-300">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-lg bg-gradient-primary w-fit shadow-glow">
                  <feature.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-success mr-2 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Technology Stack */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Powered by <span className="bg-gradient-primary bg-clip-text text-transparent">Cutting-Edge</span> Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform combines multiple blockchain technologies for maximum security and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, index) => (
              <Card key={index} className="bg-glass/50 backdrop-blur-glass border-glass-border hover:bg-glass/70 transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{tech.icon}</div>
                    <div>
                      <h3 className="font-semibold text-lg">{tech.name}</h3>
                      <p className="text-sm text-muted-foreground">{tech.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to secure, fraud-proof ticketing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">🎟️</div>
                <h3 className="font-semibold mb-2">1. Event Creation</h3>
                <p className="text-sm text-muted-foreground">
                  Organizers create events and set ticket parameters
                </p>
              </CardContent>
            </Card>

            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">⛓️</div>
                <h3 className="font-semibold mb-2">2. NFT Minting</h3>
                <p className="text-sm text-muted-foreground">
                  Tickets are minted as NFTs on the blockchain
                </p>
              </CardContent>
            </Card>

            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">💳</div>
                <h3 className="font-semibold mb-2">3. Secure Purchase</h3>
                <p className="text-sm text-muted-foreground">
                  Users buy tickets with crypto or traditional payments
                </p>
              </CardContent>
            </Card>

            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border text-center">
              <CardContent className="p-6">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="font-semibold mb-2">4. Event Access</h3>
                <p className="text-sm text-muted-foreground">
                  QR codes provide instant verification at the venue
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Advantages */}
        <div className="mb-16">
          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Why Choose Blockchain Ticketing?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {advantages.map((advantage, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-success mr-3 flex-shrink-0" />
                    <span>{advantage}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-secondary rounded-2xl p-12">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the revolution in event ticketing. Secure, transparent, and fraud-proof.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                Explore Events
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/create-event">
              <Button variant="glass" size="lg" className="text-lg px-8 py-6">
                Create Your Event
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;