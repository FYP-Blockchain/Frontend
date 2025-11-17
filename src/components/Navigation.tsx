import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout } from "@/features/auth/authSlice";
import { setWalletAddress, clearWalletAddress } from "@/features/wallet/walletReducer";
import {
  requestConnectedAccount,
  fetchExistingAccount,
  subscribeAccountChanges,
  unsubscribeAccountChanges,
  disconnectWalletSession,
  isMetaMaskAvailable,
  ensureTargetNetwork,
} from "@/services/walletService";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, Wallet, Shield, User, LogOut } from "lucide-react";
import { RootState } from "@/app/store";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const walletAddress = useAppSelector((state: RootState) => state.wallet.address)

  const isOrganizer = currentUser?.roles?.includes('ROLE_ORGANIZER');
  const isUser = currentUser?.roles?.includes('ROLE_USER');

  useEffect(() => {
    let isMounted = true;
    fetchExistingAccount().then((account) => {
      if (account && isMounted) {
        dispatch(setWalletAddress(account));
      }
    });

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        dispatch(setWalletAddress(accounts[0]));
        toast.dismiss();
        toast.info(`Wallet switched: ${accounts[0].substring(0, 6)}...${accounts[0].slice(-4)}`);
      } else {
        dispatch(clearWalletAddress());
        toast.dismiss();
        toast.info("Wallet disconnected.");
      }
    };

    subscribeAccountChanges(handleAccountsChanged);

    return () => {
      isMounted = false;
      unsubscribeAccountChanges(handleAccountsChanged);
    };
  }, [dispatch]);

  const handleLogout = async () => {
    dispatch(logout());
    dispatch(clearWalletAddress());
    await disconnectWalletSession();
    toast.success("You have been logged out.");
    navigate("/");
  };
  
  const connectWallet = async () => {
    if (!isMetaMaskAvailable()) {
      toast.info("MetaMask not found.", {
        description: "Please install the MetaMask browser extension.",
        action: {
          label: "Install",
          onClick: () => window.open("https://metamask.io/", "_blank"),
        },
      });
      return;
    }

    try {
      const account = await requestConnectedAccount();
      await ensureTargetNetwork();
      dispatch(setWalletAddress(account));
      toast.success("Wallet connected successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect wallet.");
    }
  };

  const handleDisconnectWallet = async () => {
    await disconnectWalletSession();
    dispatch(clearWalletAddress());
    toast.info("Wallet disconnected.");
  };

  const navItems = [
    { href: "/", label: "Home" },
    // Only show "Events" if the user is NOT an organizer
    ...(!isOrganizer ? [{ href: "/events", label: "Events" }] : []),
    ...(isUser ? [{ href: "/my-tickets", label: "My Tickets" }] : []),
    ...(isOrganizer ? [{ href: "/create-event", label: "Create Event" }] : []),
    ...(isOrganizer ? [{ href: "/my-events", label: "My Events" }] : []),
    { href: "/about", label: "About" },
  ];
  
  const isActive = (path: string) => location.pathname === path;

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
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {walletAddress ? (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {walletAddress.substring(0,6)}...{walletAddress.slice(-4)}
                </Badge>
                <Button onClick={handleDisconnectWallet} variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button onClick={connectWallet} variant="outline" size="sm" className="border-accent bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
            
            
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass">
                    <User className="h-4 w-4 mr-2" />
                    {currentUser.username}
                    {isOrganizer && <Badge variant="secondary" className="ml-2">Organizer</Badge>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* <DropdownMenuItem onClick={() => navigate('/profile')}>Profile</DropdownMenuItem> */}
                  {isUser && <DropdownMenuItem onClick={() => navigate('/my-tickets')}>My Tickets</DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/signin">
                <Button size="sm" className="bg-gradient-primary hover:shadow-glow transition-all duration-300">
                  Login / Signup
                </Button>
              </Link>
            )}
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
                  <div className="pt-4 space-y-3 border-t border-glass-border">
                    {currentUser ? (
                      <>
                        <div className="flex items-center px-3 py-2">
                           <User className="h-5 w-5 mr-3 text-primary" />
                           <div>
                              <p className="font-semibold">{currentUser.username}</p>
                              {isOrganizer && <Badge variant="secondary">Organizer</Badge>}
                           </div>
                        </div>
                        <Button onClick={handleLogout} variant="outline" className="w-full justify-start text-destructive">
                           <LogOut className="h-4 w-4 mr-2" />
                           Logout
                        </Button>
                      </>
                    ) : (
                       <Link to="/signin" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-gradient-primary">
                          Login / Signup
                        </Button>
                      </Link>
                    )}
                    {walletAddress ? (
                      <Button onClick={handleDisconnectWallet} variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
                        Disconnect Wallet
                      </Button>
                    ) : (
                      <Button onClick={connectWallet} variant="outline" className="w-full border-accent bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground">
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet
                      </Button>
                    )}
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
