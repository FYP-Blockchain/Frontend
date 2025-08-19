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
      title: "Abhi Music Concert (අභී)",
      date: "2025-11-01",
      time: "06:00 PM",
      venue: "Cinnamon Lakeside - A/C Marquee",
      price: "0.25 ETH",
      fiatPrice: "$499",
      image: "https://storage.googleapis.com/oneticket/32228206-83472ffb-eec6-4989-ae5c-04d0baa506c2.jpg",
      category: "music",
      available: 1000,
      total: 2000,
      verified: true,
    },
    
    {
      id: 2,
      title: "BailaMo Live in Concert",
      date: "2025-10-20",
      time: "07:00 PM",
      venue: "Modern Art Museum",
      price: "0.08 ETH",
      fiatPrice: "$159",
      image: "https://assets.mytickets.lk/images/events/Baila%20Mo/BAILAMO%20Web%20Dimension-1754027767722.png",
      category: "art",
      available: 80,
      total: 150,
      verified: true,
    },
    {
      id: 3,
      title: "Inspiring the Next Billionaire",
      date: "2025-09-25",
      time: "02:00 PM",
      venue: "Tech Hub Downtown",
      price: "0.05 ETH",
      fiatPrice: "$99",
      image: "https://assets.mytickets.lk/images/events/BNI%20INSPIRE/WhatsApp%20Image%202025-07-25%20at%2019.14.29-1753451654571.jpeg",
      category: "workshop",
      available: 45,
      total: 100,
      verified: true,
    },
    {
      id: 4,
      title: " අවදියේ ආදරය - Awadiye Adaraya",
      date: "2025-09-01",
      time: "06:00 PM",
      venue: "Virtual Reality Arena",
      price: "0.25 ETH",
      fiatPrice: "$499",
      image: "https://assets.mytickets.lk/images/events/%E0%B6%85%E0%B7%80%E0%B6%AF%E0%B7%92%E0%B6%BA%E0%B7%9A%20%E0%B6%86%E0%B6%AF%E0%B6%BB%E0%B6%BA/1x1%20poster%20new%20(1)-1751368278560.jpg",
      category: "music",
      available: 1100,
      total: 2000,
      verified: true,
    },

    

    
    {
      id: 5,
      title: "Tech Conference 2024",
      date: "2025-10-15",
      time: "09:00 AM",
      venue: "Elphinstone Theatre",
      price: "0.15 ETH",
      fiatPrice: "$299",
      image: "https://assets.mytickets.lk/images/events/Photo%20Tecno%202025%20/WhatsApp%20Image%202025-07-14%20at%2008.44.36_b7c067b5%20tk%20(1)-1752481415826.jpg",
      category: "conference",
      available: 200,
      total: 500,
      verified: true,
    },

    {
      id: 6,
      title: "Yugaswara ( යුගාස්වර )",
      date: "2025-10-18",
      time: "07:00 PM",
      venue: "Holly Cross Auditorium Gampaha",
      price: "0.15 ETH",
      fiatPrice: "$299",
      image: "https://assets.mytickets.lk/images/events/Yugaswara%20(%20%E0%B6%BA%E0%B7%94%E0%B6%9C%E0%B7%8F%E0%B7%83%E0%B7%8A%E0%B7%80%E0%B6%BB%20)/WhatsApp%20Image%202025-07-15%20at%2014.33.37-1752742471051.jpeg",
      category: "music",
      available: 155,
      total: 500,
      verified: true,
    },

    {
      id: 7,
      title: "The Nalin Show",
      date: "2025-09-15",
      time: "06:00 PM",
      venue: "BMICH - COLOMBO",
      price: "0.10 ETH",
      fiatPrice: "$299",
      image: "https://assets.mytickets.lk/images/events/The%20Nalin%20Show/WhatsApp%20Image%202025-07-26%20at%2009.17.41-1753504938028.jpeg",
      category: "music",
      available: 215,
      total: 500,
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
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;
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
            <Card
              key={event.id}
              className="bg-glass/80 backdrop-blur-glass border-glass-border hover:shadow-glass transition-all duration-300 group"
            >
              
              <CardHeader className="p-0">
  <div className="relative w-full">
    <img
      src={event.image}
      alt={event.title}
      className="w-full rounded-t-lg object-cover max-h-[48rem]" // much larger max height
      style={{ aspectRatio: "16/9" }} // keeps a balanced proportion
    />
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