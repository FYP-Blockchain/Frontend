import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navigation from "./components/Navigation";
import ErrorBoundary from "./components/ErrorBoundary";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import PurchaseTicket from "./pages/PurchaseTicket";
import { UserProtectedRoute, OrganizerProtectedRoute } from './components/auth/ProtectedRoute';
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import TicketQr from "./pages/TicketQr";
import VerifyTicket from "./pages/VerifyTicket";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner richColors position="top-right" />
      <BrowserRouter>
        <ErrorBoundary>
          <div className="min-h-screen bg-background font-inter">
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/event/:id" element={<EventDetails />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />
              <Route path="/purchaseticket/:id" element={<PurchaseTicket />} />

              <Route path="/unauthorized" element={
                <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-destructive mb-4">Access Denied</h1>
                    <p className="text-xl text-muted-foreground">You do not have permission to view this page.</p>
                  </div>
                </div>
              } />
              <Route element={<OrganizerProtectedRoute />}>
                <Route path="/my-events" element={<MyEvents />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/edit-event/:id" element={<EditEvent />} />
                <Route path="/verify-ticket" element={<VerifyTicket />} />
                <Route path="/verify-ticket/:eventId" element={<VerifyTicket />} />
              </Route>
              <Route element={<UserProtectedRoute />}>
                <Route path="/my-tickets" element={
                  <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">My Tickets</h1>
                      <p className="text-xl text-muted-foreground">Coming soon - View your NFT tickets here</p>
                    </div>
                  </div>
                } />
                <Route path="/ticket-qr" element={<TicketQr />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            <Footer />
          </div>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
