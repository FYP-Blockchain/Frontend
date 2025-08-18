import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, MapPin, Search, Filter, Users, Shield } from "lucide-react";

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Mock events data
  const events = [
    {
      id: 1,
      title: "Tech Conference 2024",
      date: "2024-03-15",
      time: "09:00 AM",
      venue: "Convention Center, NYC",
      price: "0.15 ETH",
      fiatPrice: "$299",
      image: "/api/placeholder/400/240",
      category: "conference",
      available: 250,
      total: 500,
      verified: true,
    },
    {
      id: 2,
      title: "NFT Art Gallery Opening",
      date: "2024-03-20",
      time: "07:00 PM",
      venue: "Modern Art Museum",
      price: "0.08 ETH",
      fiatPrice: "$159",
      image: "/api/placeholder/400/240",
      category: "art",
      available: 80,
      total: 150,
      verified: true,
    },
    {
      id: 3,
      title: "Blockchain Workshop",
      date: "2024-03-25",
      time: "02:00 PM",
      venue: "Tech Hub Downtown",
      price: "0.05 ETH",
      fiatPrice: "$99",
      image: "/api/placeholder/400/240",
      category: "workshop",
      available: 45,
      total: 100,
      verified: true,
    },
    {
      id: 4,
      title: "Metaverse Music Festival",
      date: "2024-04-01",
      time: "06:00 PM",
      venue: "Virtual Reality Arena",
      price: "0.25 ETH",
      fiatPrice: "$499",
      image: "/api/placeholder/400/240",
      category: "music",
      available: 1000,
      total: 2000,
      verified: true,
    },
  ];

  const categories = [
    { value: "all", label: "All Events" },
    { value: "conference", label: "Conferences" },
    { value: "art", label: "Art & Culture" },
    { value: "workshop", label: "Workshops" },
    { value: "music", label: "Music" },
  ];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Discover Events
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find and secure your tickets to amazing events with blockchain verification
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search events or venues..."
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

          {/* Category Tabs */}
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

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="bg-glass/80 backdrop-blur-glass border-glass-border hover:shadow-glass transition-all duration-300 group">
              <CardHeader className="p-0">
                <div className="relative">
                  <div className="h-48 bg-gradient-secondary rounded-t-lg flex items-center justify-center">
                    <div className="text-6xl opacity-20">🎫</div>
                  </div>
                  {event.verified && (
                    <Badge className="absolute top-3 right-3 bg-success/90 text-success-foreground">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.venue}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    {event.available} of {event.total} available
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-primary">{event.price}</div>
                    <div className="text-sm text-muted-foreground">{event.fiatPrice}</div>
                  </div>
                  <Badge variant="outline" className="border-accent text-accent">
                    {Math.round((event.available / event.total) * 100)}% Available
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
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;