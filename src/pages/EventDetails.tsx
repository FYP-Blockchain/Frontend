import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Shield, 
  Clock, 
  Star,
  Wallet,
  CreditCard,
  Share2,
  Heart
} from "lucide-react";

// Events data (copy from Events.tsx or import from shared file)
const events = [
  {
    id: 1,
    title: "Abhi Music Concert (අභී)",
    description: "Experience an unforgettable evening filled with soulful melodies, electrifying performances, and live music by talented artists. Enjoy a night of music, dance, and entertainment in a vibrant atmosphere with fans from across the country.",
    //longDescription: "The Abhi Music Concert is a full-evening live event featuring multiple performances by renowned musicians and emerging artists. Attendees will enjoy a carefully curated lineup of songs spanning various genres, interactive segments with performers, and opportunities to meet and greet artists backstage. The concert promises a memorable musical journey with stunning visual effects, high-quality sound, and a festive environment for all music lovers.",
    date: "2025-11-01",
    time: "06:00 PM",
    venue: "Cinnamon Lakeside - A/C Marquee",
    fullAddress: "Cinnamon Lakeside, Colombo, Sri Lanka",
    price: "0.25 ETH",
    fiatPrice: "$499",
    image: "https://storage.googleapis.com/oneticket/32228206-83472ffb-eec6-4989-ae5c-04d0baa506c2.jpg",
    category: "Music",
    available: 1000,
    total: 2000,
    verified: true,
    rating: 4.8,
    reviews: 127,
    organizer: "TechCorp Events",
    features: [
      "NFT Certificate of Attendance",
      "Access to exclusive Discord community",
      "Recorded sessions for lifetime access",
      "Welcome kit with branded merchandise",
      "Networking app access"
    ],
    speakers: [
      { name: "Gayumi Srisara", role: "CTO at TechCorp", image: "/api/placeholder/100/100" },
      { name: "Malshi Gimnadhi", role: "Blockchain Researcher", image: "/api/placeholder/100/100" },
      
    ]
  },
  {
    id: 2,
    title: "BailaMo Live in Concert",
    description: "Get ready for a night of nonstop baila beats, energetic rhythms, and unforgettable live performances. Dance, sing, and celebrate with the best of Sri Lanka’s baila music all in one grand concert.",
    //longDescription: "BailaMo Live in Concert brings together the most iconic baila bands and performers for an electrifying night of music and dance. From timeless classics to modern baila hits, the event promises to keep the crowd on their feet with infectious rhythms and sing-along favorites. Attendees will enjoy a vibrant atmosphere with live bands, dazzling stage effects, and interactive segments that capture the true spirit of baila. Whether you're a lifelong fan or new to the genre, this concert guarantees a night full of energy, joy, and unforgettable memories.",
    date: "2025-10-20",
    time: "07:00 PM",
    venue: "Modern Art Museum",
    fullAddress: "123 Art St, Colombo, Sri Lanka",
    price: "0.08 ETH",
    fiatPrice: "$159",
    image: "https://assets.mytickets.lk/images/events/Baila%20Mo/BAILAMO%20Web%20Dimension-1754027767722.png",
    category: "Art",
    available: 80,
    total: 150,
    verified: true,
    rating: 4.5,
    reviews: 60,
    organizer: "ArtLive Events",
    features: [
      "VIP Seating",
      "Live Meet & Greet",
      "Complimentary drinks"
    ],
    speakers: [
      { name: "Adithya Adikari", role: "Performer", image: "/api/placeholder/100/100" }
    ]
  },
  {
  id: 3,
  title: "Inspiring the Next Billionaire",
  description: "A powerful workshop designed to inspire and equip future entrepreneurs with the mindset, skills, and strategies needed to build impactful businesses and achieve financial success.",
  //longDescription: "Inspiring the Next Billionaire is a transformative workshop bringing together visionary speakers, successful entrepreneurs, and industry experts. This event focuses on innovation, leadership, and financial literacy, offering attendees insights into startup building, investment opportunities, and the entrepreneurial journey. Participants will gain practical knowledge through interactive sessions, case studies, and networking opportunities with like-minded professionals. Whether you're an aspiring startup founder or looking to scale your business, this workshop is the perfect platform to unlock your potential and take the next step toward success.",
  date: "2025-09-25",
  time: "02:00 PM",
  venue: "Tech Hub Downtown",
  fullAddress: "45 Innovation Drive, Colombo, Sri Lanka",
  price: "0.05 ETH",
  fiatPrice: "$99",
  image: "https://assets.mytickets.lk/images/events/BNI%20INSPIRE/WhatsApp%20Image%202025-07-25%20at%2019.14.29-1753451654571.jpeg",
  category: "Workshop",
  available: 45,
  total: 100,
  verified: true,
  rating: 4.8,
  reviews: 120,
  organizer: "BNI Inspire",
  features: [
    "Networking Opportunities",
    "Certificate of Participation",
    "Exclusive Q&A Sessions"
  ],
  speakers: [
    { name: "John Perera", role: "Keynote Speaker", image: "/api/placeholder/100/100" },
    { name: "Nadeesha Fernando", role: "Entrepreneurship Coach", image: "/api/placeholder/100/100" }
  ]
},
{
  id: 4,
  title: "අවදියේ ආදරය - Awadiye Adaraya",
  description: "Experience a soulful evening filled with romance, music, and heartfelt performances. Awadiye Adaraya brings together beloved artists to celebrate the beauty of love through unforgettable melodies.",
  //longDescription: "Awadiye Adaraya is a grand musical concert dedicated to timeless love songs that have touched hearts for generations. This magical night will feature a lineup of celebrated Sri Lankan artists performing classic and contemporary romantic hits in a breathtaking setting. With powerful vocals, live orchestration, and immersive stage lighting, the event promises to transport the audience into a world of passion and emotion. From soulful ballads to modern love anthems, every performance will capture the spirit of love, making it a perfect evening for couples, families, and music lovers alike.",
  date: "2025-09-01",
  time: "06:00 PM",
  venue: "Virtual Reality Arena",
  fullAddress: "45 Virtual Ave, Colombo, Sri Lanka",
  price: "0.25 ETH",
  fiatPrice: "$499",
  image: "https://assets.mytickets.lk/images/events/%E0%B6%85%E0%B7%80%E0%B6%AF%E0%B7%92%E0%B6%BA%E0%B7%9A%20%E0%B6%86%E0%B6%AF%E0%B6%BB%E0%B6%BA/1x1%20poster%20new%20(1)-1751368278560.jpg",
  category: "Music",
  available: 1100,
  total: 2000,
  verified: true,
  rating: 4.8,
  reviews: 120,
  organizer: "Love Songs Entertainment",
  features: [
    "VIP Couple Packages",
    "Romantic Dinner Experience",
    "Exclusive Backstage Access"
  ],
  speakers: [
    { name: "Kasun Kalhara", role: "Performer", image: "/api/placeholder/100/100" },
    { name: "Umaria Sinhawansa", role: "Performer", image: "/api/placeholder/100/100" }
  ]
},

{
    id: 5,
    title: "Tech Conference 2024",
    description: "Join the leading minds in technology at Tech Conference 2024, featuring inspiring keynotes, cutting-edge workshops, and unparalleled networking opportunities with global innovators.",
    //longDescription: "Tech Conference 2024 brings together industry leaders, tech professionals, and innovators to explore the future of technology. This full-day event will feature keynote speeches, expert-led workshops, interactive panel discussions, and startup showcases. Attendees will gain insights into the latest advancements in AI, blockchain, Web3, cloud computing, and emerging technologies. With networking lounges, exhibition booths, and exclusive opportunities to connect with visionaries, this conference is a must-attend for anyone passionate about shaping the digital future.",
    date: "2025-10-15",
    time: "09:00 AM",
    venue: "Elphinstone Theatre",
    fullAddress: "Elphinstone Theatre, Colombo, Sri Lanka",
    price: "0.15 ETH",
    fiatPrice: "$299",
    image: "https://assets.mytickets.lk/images/events/Photo%20Tecno%202025%20/WhatsApp%20Image%202025-07-14%20at%2008.44.36_b7c067b5%20tk%20(1)-1752481415826.jpg",
    category: "Conference",
    available: 200,
    total: 500,
    verified: true,
    rating: 4.7,
    reviews: 120,
    organizer: "Global Tech Events",
    features: [
      "Keynote Sessions",
      "Hands-on Workshops",
      "Networking Lounges",
      "Exhibition Booths"
    ],
    speakers: [
      { name: "Dr. Ayesha Fernando", role: "AI Researcher", image: "/api/placeholder/100/100" },
      { name: "Michael Chen", role: "Blockchain Expert", image: "/api/placeholder/100/100" },
      { name: "Samantha Perera", role: "Web3 Innovator", image: "/api/placeholder/100/100" }
    ]
},
{
  id: 6,
  title: "Yugaswara (යුගාස්වර)",
  description: "Experience the magic of Yugaswara – a spectacular evening of soulful music, mesmerizing melodies, and unforgettable live performances that celebrate Sri Lankan artistry.",
  //longDescription: "Yugaswara (යුගාස්වර) is more than just a concert – it is a grand musical journey that unites generations through timeless classics and contemporary hits. This event will feature leading artists, breathtaking stage performances, and a rich blend of traditional and modern musical arrangements. With powerful vocals, live orchestra, and dazzling stage effects, the audience is set to enjoy an unforgettable night filled with passion, harmony, and cultural pride. Whether you are a true music lover or simply looking for an inspiring evening, Yugaswara promises an extraordinary experience.",
  date: "2025-10-18",
  time: "07:00 PM",
  venue: "Holly Cross Auditorium Gampaha",
  fullAddress: "Holy Cross College Auditorium, Gampaha, Sri Lanka",
  price: "0.15 ETH",
  fiatPrice: "$299",
  image: "https://assets.mytickets.lk/images/events/Yugaswara%20(%20%E0%B6%BA%E0%B7%94%E0%B6%9C%E0%B7%8F%E0%B7%83%E0%B7%8A%E0%B7%80%E0%B6%BB%20)/WhatsApp%20Image%202025-07-15%20at%2014.33.37-1752742471051.jpeg",
  category: "Music",
  available: 155,
  total: 500,
  verified: true,
  rating: 4.8,
  reviews: 120,
  organizer: "Cultural Harmony Events",
  features: [
    "VIP Seating",
    "Backstage Access",
    "Complimentary Refreshments"
  ],
  speakers: [
    { name: "Kasun Kalhara", role: "Lead Performer", image: "/api/placeholder/100/100" },
    { name: "Umaria Sinhawansa", role: "Performer", image: "/api/placeholder/100/100" },
    { name: "Sanuka Wickramasinghe", role: "Performer", image: "/api/placeholder/100/100" }
  ]
},

{
  id: 7,
  title: "The Nalin Show",
  description: "Experience an unforgettable evening with Nalin, as he brings his greatest hits and soulful melodies to the grand stage of BMICH, Colombo. A night filled with music, emotions, and timeless classics awaits.",
  //longDescription: "The Nalin Show is more than just a concert – it’s a journey through decades of musical excellence. Fans will be treated to an extraordinary live performance featuring Nalin’s most iconic songs, heartwarming ballads, and uplifting anthems. With stunning stage effects, a world-class sound system, and a magical atmosphere at BMICH, this event promises to captivate every music lover. Whether you’re a longtime admirer of Nalin or experiencing his artistry for the first time, this show guarantees an evening of unforgettable memories, emotional connections, and pure musical bliss.",
  date: "2025-09-15",
  time: "06:00 PM",
  venue: "BMICH - COLOMBO",
  fullAddress: "Bauddhaloka Mawatha, Colombo 07, Sri Lanka",
  price: "0.10 ETH",
  fiatPrice: "$299",
  image: "https://assets.mytickets.lk/images/events/The%20Nalin%20Show/WhatsApp%20Image%202025-07-26%20at%2009.17.41-1753504938028.jpeg",
  category: "Music",
  available: 215,
  total: 500,
  verified: true,
  rating: 4.8,
  reviews: 120,
  organizer: "Nalinda Productions",
  features: [
    "VIP Seating",
    "Exclusive Backstage Pass",
    "Complimentary Welcome Drink"
  ],
  speakers: [
    { name: "Nalin", role: "Main Artist", image: "/api/placeholder/100/100" }
  ]
}

];

const EventDetails = () => {
  const { id } = useParams();
  const [selectedPayment, setSelectedPayment] = useState<"crypto" | "card">("crypto");

  // Find event by ID
  const event = events.find(e => e.id === parseInt(id || "1"));

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <span>Events</span>
            <span>/</span>
            <span className="text-primary">{event.title}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardContent className="p-0">
                <div className="h-96 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {event.verified && (
                    <Badge className="absolute top-4 right-4 bg-success/90 text-success-foreground">
                      <Shield className="h-3 w-3 mr-1" />
                      Blockchain Verified
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Info */}
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl font-bold mb-2">{event.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        {event.rating} ({event.reviews} reviews)
                      </div>
                      <Badge variant="outline">{event.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
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
                      <div className="font-medium">{event.date}</div>
                      <div className="text-sm text-muted-foreground">{event.time}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium">{event.venue}</div>
                      <div className="text-sm text-muted-foreground">{event.fullAddress}</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium">{event.available} available</div>
                      <div className="text-sm text-muted-foreground">of {event.total} total tickets</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-primary mr-3" />
                    <div>
                      <div className="font-medium">By {event.organizer}</div>
                      <div className="text-sm text-muted-foreground">Trusted organizer</div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-glass-border" />

                <div>
                  <h3 className="text-xl font-semibold mb-4">What's Included</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {event.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-primary rounded-full mr-3" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4">Featured Speakers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {event.speakers.map((speaker, index) => (
                      <div key={index} className="text-center">
                        <div className="w-16 h-16 bg-gradient-secondary rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-xl">👤</span>
                        </div>
                        <div className="font-medium text-sm">{speaker.name}</div>
                        <div className="text-xs text-muted-foreground">{speaker.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Sidebar */}
          <div className="space-y-6">
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border sticky top-24">
              <CardHeader>
                <CardTitle className="text-center">Secure Your Ticket</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{event.price}</div>
                  <div className="text-lg text-muted-foreground">{event.fiatPrice}</div>
                  <Badge variant="outline" className="mt-2 border-accent text-accent">
                    {Math.round((event.available / event.total) * 100)}% Available
                  </Badge>
                </div>

                <Separator className="bg-glass-border" />

                <div>
                  <h4 className="font-medium mb-3">Payment Method</h4>
                  <div className="space-y-2">
                    <Button
                      variant={selectedPayment === "crypto" ? "hero" : "glass"}
                      className="w-full justify-start"
                      onClick={() => setSelectedPayment("crypto")}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Pay with Crypto (MetaMask)
                    </Button>
                    <Button
                      variant={selectedPayment === "card" ? "hero" : "glass"}
                      className="w-full justify-start"
                      onClick={() => setSelectedPayment("card")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay with Card (Stripe)
                    </Button>
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full text-base font-semibold"
                >
                  Purchase NFT Ticket
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  <div className="flex items-center justify-center mb-1">
                    <Shield className="h-3 w-3 mr-1" />
                    Secured by blockchain technology
                  </div>
                  <p>Your ticket will be minted as an NFT and stored in your wallet</p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="bg-glass/80 backdrop-blur-glass border-glass-border">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3 text-center">Why Choose NFTickets?</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 text-success mr-2" />
                    <span>Fraud-proof blockchain verification</span>
                  </div>
                  <div className="flex items-center">
                    <Wallet className="h-4 w-4 text-primary mr-2" />
                    <span>Secure wallet integration</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-2" />
                    <span>Collectible NFT certificates</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
