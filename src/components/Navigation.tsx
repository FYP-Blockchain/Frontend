import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Wallet, Shield } from "lucide-react";

// Declare ethereum property on window for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<any>;
    };
  }
}

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/my-tickets", label: "My Tickets" },
    { href: "/create-event", label: "Create Event" },
    { href: "/about", label: "About" },
  ];

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        alert("Wallet connected successfully!");
      } catch (err) {
        console.error(err);
      }
    } else {
      window.open("https://metamask.io/", "_blank");
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-glass bg-background/80 border-b border-glass-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-gradient-primary shadow-glow group-hover:shadow-accent-glow transition-all duration-300">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              NFTickets
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href)
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-accent bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={connectWallet}
            >
              <Wallet className="h-4 w-4 mr-2" />
              Connect Wallet
            </Button>
            <Link to="/signin">
              <Button size="sm" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                Login/Signup
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-glass backdrop-blur-glass border-glass-border">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium py-2 px-3 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="pt-4 space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full border-accent bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground"
                      onClick={connectWallet}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </Button>
                    <Link to="/signin" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-gradient-primary">
                        Login/Signup
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;