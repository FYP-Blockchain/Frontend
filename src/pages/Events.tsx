import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchAllEvents } from "@/features/events/eventSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Search, Filter, Users, Shield } from "lucide-react";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
import EventCardSkeleton from "@/components/ui/EventCardSkeleton";
import { format } from "date-fns";


const weiToEther = (wei: string | number) => {
  const ether = Number(wei) / 1e18;
  return ether.toFixed(3); 
};

const Events = () => {
  useSmoothScrollToTop();
  const dispatch = useAppDispatch();
  const { items: events, loading, error } = useAppSelector((state) => state.events);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

  const categories = [
    { value: "all", label: "All Events" },
    { value: "Music", label: "Music" },
    { value: "Conference", label: "Conferences" },
    { value: "Art", label: "Art & Culture" },
    { value: "Workshop", label: "Workshops" },
    { value: "Sports", label: "Sports" },
    { value: "Festival", label: "Festivals" },
  ];

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || event.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Discover Events
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find and secure your tickets to amazing events with blockchain verification
          </p>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-glass/50 backdrop-blur-glass border-glass-border"
              />
            </div>
            <Button variant="glass" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "hero" : "glass"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="text-sm"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <EventCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!loading && error && (
           <div className="text-center py-12">
             <div className="text-6xl mb-4">😢</div>
             <h3 className="text-xl font-semibold mb-2 text-destructive">Failed to Load Events</h3>
             <p className="text-muted-foreground">
               There was an error connecting to the server. Please try again later.
             </p>
           </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event: any) => (
                <Card
                  key={event.id}
                  className="bg-glass/80 backdrop-blur-glass border-glass-border hover:shadow-glass transition-all duration-300 group"
                >
                  <CardHeader className="p-0">
                    <div className="relative w-full">
                      <img
                        src={event.imageUrl || 'https://placehold.co/600x400/211138/FFFFFF?text=Event'}
                        alt={event.name}
                        className="w-full rounded-t-lg object-cover"
                        style={{ aspectRatio: "16/9" }}
                      />
                      {event.active && (
                        <Badge className="absolute top-3 right-3 bg-success/90 text-success-foreground">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors truncate">
                      {event.name}
                    </h3>
                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(event.eventDate), "MMMM dd, yyyy")}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location || 'Online'}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        {event.totalSupply} Tickets Available
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-primary">{weiToEther(event.priceInWei)} ETH</div>
                        {/* You can add a fiat price conversion here if needed */}
                      </div>
                      <Badge variant="outline" className="border-accent text-accent">
                        {event.category}
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Link to={`/event/${event.id}`} className="w-full">
                      <Button variant="hero" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
