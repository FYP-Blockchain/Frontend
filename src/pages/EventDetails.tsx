import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchEventById } from "@/features/events/eventSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
import EventDetailsSkeleton from "@/components/ui/EventDetailsSkeleton";
import { format } from "date-fns";
import { 
  Calendar, MapPin, Users, Shield, Clock, Wallet, Share2, Heart 
} from "lucide-react";
import { RootState } from "@/app/store";

// Helper function to convert Wei to Ether
const weiToEther = (wei: string | number) => {
  if (!wei) return "0.000";
  const ether = Number(wei) / 1e18;
  return ether.toFixed(3);
};

const EventDetails = () => {
  useSmoothScrollToTop();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { currentUser } = useAppSelector((state: RootState) => state.auth);
  const { items: events, currentItem, loading, error } = useAppSelector((state: RootState) => state.events);

  const isOrganizer = currentUser?.roles?.includes('ROLE_ORGANIZER');
  const eventFromList = events.find((event: any) => event.id === id);
  useEffect(() => {
    if (!eventFromList && id) {
      dispatch(fetchEventById(id));
    }
  }, [id, eventFromList, dispatch]);

  const event = eventFromList || currentItem;

  const handlePurchaseClick = () => {
    if (isOrganizer) {
      toast.info("Organizers cannot purchase tickets.", {
        description: "Please sign in with a regular user account to proceed.",
      });
      return;
    }
    
    if (currentUser) {
      navigate(`/purchaseticket/${event.id}`);
    } else {
      navigate('/signin');
    }
  };

  if (loading && !event) {
    return <EventDetailsSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-xl font-semibold text-destructive">Failed to load event details.</h2>
          <p className="text-muted-foreground">{error.toString()}</p>
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

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/events" className="hover:text-primary">Events</Link>
            <span>/</span>
            <span className="text-primary truncate">{event.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardContent className="p-0">
                <div className="h-96 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <img
                    src={event.imageUrl || 'https://placehold.co/600x400/211138/FFFFFF?text=Event'}
                    alt={event.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {event.active && (
                    <Badge className="absolute top-4 right-4 bg-success/90 text-success-foreground">
                      <Shield className="h-3 w-3 mr-1" />
                      Blockchain Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold mb-2">{event.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm"><Heart className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm"><Share2 className="h-4 w-4" /></Button>
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
                      <div className="font-medium">{format(new Date(event.eventDate), "MMMM dd, yyyy")}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.eventStartTime), "p")} - {format(new Date(event.eventEndTime), "p")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium">{event.location || 'Online Event'}</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium">{event.totalSupply}</div>
                      <div className="text-sm text-muted-foreground">Total Tickets</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium truncate" title={event.organizerAddress}>
                        By {event.organizerAddress.substring(0, 6)}...{event.organizerAddress.substring(event.organizerAddress.length - 4)}
                      </div>
                      <div className="text-sm text-muted-foreground">Trusted organizer</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-center">Secure Your Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{weiToEther(event.priceInWei)} ETH</div>
                </div>
                <Separator className="bg-glass-border" />
                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-base font-semibold"
                  onClick={handlePurchaseClick}
                >
                  Purchase NFT Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
