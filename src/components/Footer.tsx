import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  ExternalLink, 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Wallet,
  Hexagon,
  Link as ChainLink,
  CheckCircle
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gradient-secondary border-t border-glass-border">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Project Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Hexagon className="h-6 w-6 text-primary-glow" />
              <h3 className="text-lg font-semibold text-foreground">NFTickets</h3>
            </div>
            <p className="text-foreground text-base leading-relaxed mb-3">
              Redefining event ticketing with NFTs, smart contracts, and secure blockchain payments.
            </p>
            <p className="text-muted-foreground text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-accent" />
              Powered by Ethereum, Hyperledger Fabric, and IPFS.
            </p>
            
            {/* NFT Verified Badge */}
            <div className="flex items-center gap-2 mt-4 p-3 bg-glass/30 rounded-lg border border-glass-border backdrop-blur-glass">
              <CheckCircle className="h-5 w-5 text-success fill-success/20" />
              <span className="text-sm text-foreground font-medium">NFT Verified</span>
              <span className="text-xs text-muted-foreground">Tamper-proof ticketing</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <ChainLink className="h-5 w-5 text-primary-glow" />
              <h4 className="text-base font-semibold text-foreground">Navigation</h4>
            </div>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/privacy" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <a 
                  href="https://etherscan.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-accent transition-colors duration-300 text-sm flex items-center gap-1 group"
                >
                  Smart Contract Explorer
                  <ExternalLink className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-primary-glow" />
              <h4 className="text-base font-semibold text-foreground">Support</h4>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <a 
                href="mailto:support@blockchaintickets.com" 
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                support@blockchaintickets.com
              </a>
              <a 
                href="tel:+94760010340" 
                className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                +94 760010340
              </a>
            </div>

            {/* Help Links */}
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/help" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link 
                  to="/kyc" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  KYC Verification
                </Link>
              </li>
              <li>
                <Link 
                  to="/fraud-prevention" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  Fraud Prevention
                </Link>
              </li>
              <li>
                <Link 
                  to="/secure-payments" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 text-sm"
                >
                  Secure Payments
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Community & Blockchain Features */}
        <div className="mt-12 pt-8 border-t border-glass-border">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Social & Community */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-foreground">Join Our Community</h4>
              <div className="flex items-center gap-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-glass/50 rounded-lg border border-glass-border hover:bg-glass hover:shadow-glow transition-all duration-300"
                >
                  <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-glass/50 rounded-lg border border-glass-border hover:bg-glass hover:shadow-glow transition-all duration-300"
                >
                  <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-foreground">Stay Updated</h4>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your email"
                  className="bg-glass/50 border-glass-border focus:border-primary"
                />
                <Button variant="hero" size="default">
                  Subscribe
                </Button>
              </div>
            </div>

            {/* Connect Wallet */}
            <div className="space-y-4">
              <h4 className="text-base font-semibold text-foreground">Connect Wallet</h4>
              <Button variant="glass" className="w-full justify-center gap-2">
                <Wallet className="h-4 w-4" />
                MetaMask / WalletConnect
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-glass-border bg-background/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2024 Blockchain Smart Ticketing System. All Rights Reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Secured by Blockchain Technology</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;