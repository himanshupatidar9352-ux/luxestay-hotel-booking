// LuxeStay Client Data and Fallback Catalog
window.LUXE_DATA = {
  currencies: {
    USD: { symbol: "$", rate: 1.0, name: "US Dollar" },
    EUR: { symbol: "€", rate: 0.92, name: "Euro" },
    GBP: { symbol: "£", rate: 0.79, name: "British Pound" },
    INR: { symbol: "₹", rate: 86.5, name: "Indian Rupee" }
  },
  destinations: [
    { city: "Lake Como", country: "Italy", count: "3 Resorts", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80", tag: "Lakeside Romance" },
    { city: "Noonu Atoll", country: "Maldives", count: "4 Overwater Villas", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=600&q=80", tag: "Tropical Lagoon" },
    { city: "Santorini", country: "Greece", count: "5 Cliffside Suites", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=600&q=80", tag: "Aegean Sunset" },
    { city: "Kyoto", country: "Japan", count: "2 Zen Sanctuaries", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80", tag: "Cultural Heritage" },
    { city: "New York", country: "USA", count: "6 Grand Palaces", image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80", tag: "Manhattan Luxury" },
    { city: "Swiss Alps", country: "Switzerland", count: "3 Alpine Spas", image: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=600&q=80", tag: "Ski & Thermal" }
  ],
  popularCoupons: [
    { code: "LUXE20", discount_percent: 20, discount_amount: 0, description: "20% off all luxury suites & resorts" },
    { code: "SUMMER50", discount_percent: 0, discount_amount: 50, description: "$50 off bookings over $200" },
    { code: "WELCOME10", discount_percent: 10, discount_amount: 0, description: "10% Welcome gift on first booking" }
  ],
  fallbackHotels: [
    {
      id: 1,
      name: "Grand Hotel Tremezzo",
      slug: "grand-hotel-tremezzo",
      tagline: "Iconic Art Nouveau Palace with Floating Pool on Lake Como",
      description: "An authentic Art Nouveau palace offering the best of Italian hospitality. Located on the shores of Lake Como, featuring a legendary floating swimming pool, private beach, lush century-old park, and world-class fine dining by Gualtiero Marchesi.",
      property_type: "Historic Palace & Grandeur",
      star_rating: 5,
      guest_rating: 9.7,
      review_count: 842,
      address: "Via Regina 8",
      city: "Lake Como",
      country: "Italy",
      price_per_night: 680,
      image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Floating Lake Pool", "Private Beach", "T Spa & Sauna", "Fine Dining", "Free High-Speed WiFi", "24/7 Butler"],
      rooms: [
        {
          id: 101,
          name: "Prestige Lake View Room",
          description: "Custom Italian silk fabrics, marble bathroom, and panoramic lake balcony.",
          room_type: "Double / Lake View",
          bed_type: "1 King Bed",
          size_sqm: 42,
          max_guests: 2,
          price_per_night: 680,
          image_url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
          amenities: ["Balcony with Lake View", "Carrara Marble Bath", "Nespresso Station"]
        },
        {
          id: 102,
          name: "Rooftop Grand Suite with Jacuzzi",
          description: "Top-floor penthouse suite featuring a private heated panoramic whirlpool, butler service, and Champagne bar.",
          room_type: "Luxury Penthouse Suite",
          bed_type: "1 Super King Bed",
          size_sqm: 88,
          max_guests: 3,
          price_per_night: 1250,
          image_url: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
          amenities: ["Private Rooftop Terrace", "Heated Whirlpool Jacuzzi", "Dedicated Butler"]
        }
      ],
      reviews: [
        { author_name: "Elena Rossi", country: "Italy", rating: 10.0, title: "Pure paradise on Lake Como!", comment: "The floating pool overlooking Bellagio is unforgettable.", stay_type: "Couple Getaway" }
      ]
    },
    {
      id: 2,
      name: "Soneva Jani Sanctuary",
      slug: "soneva-jani-sanctuary",
      tagline: "Unrivalled Overwater Villas with Water Slides into Turquoise Lagoons",
      description: "Nestled in Medhufaru lagoon in the Noonu Atoll. Overwater villas with retractable roofs to stargaze from bed, private water slides straight into turquoise waters.",
      property_type: "Overwater Island Villa",
      star_rating: 5,
      guest_rating: 9.9,
      review_count: 612,
      address: "Medhufaru Island",
      city: "Noonu Atoll",
      country: "Maldives",
      price_per_night: 1450,
      image_url: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Overwater Water Slide", "Retractable Stargazing Roof", "Private Infinity Pool", "Barefoot Butler", "Overwater Cinema"],
      rooms: [
        {
          id: 201,
          name: "1-Bedroom Water Retreat with Slide",
          description: "Double-story overwater villa with private pool, sun deck, catamaran nets, and slide directly into lagoon.",
          room_type: "Overwater Villa",
          bed_type: "1 King Bed + Daybed",
          size_sqm: 410,
          max_guests: 3,
          price_per_night: 1450,
          image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
          amenities: ["Lagoon Slide", "Retractable Roof", "Private Pool"]
        }
      ],
      reviews: [
        { author_name: "Marcus Sterling", country: "Switzerland", rating: 10.0, title: "Heaven on Earth", comment: "Sliding directly into crystal clear water from our deck was unbelievable.", stay_type: "Family Holiday" }
      ]
    },
    {
      id: 3,
      name: "Canaves Oia Suites",
      slug: "canaves-oia-suites",
      tagline: "Cliffside Caldera Caves & Sunset Infinity Pools",
      description: "Carved into the dramatic cliffs of Oia overlooking the Aegean Sea. Minimalist Cycladic architecture, caves converted into luxury plunge suites, and breathtaking Caldera sunsets.",
      property_type: "Cliffside & Caldera",
      star_rating: 5,
      guest_rating: 9.8,
      review_count: 910,
      address: "Main Street, Oia",
      city: "Santorini",
      country: "Greece",
      price_per_night: 520,
      image_url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Caldera Infinity Pool", "Private Cave Plunge Pool", "Gourmet Wine Bar", "Yacht Excursions", "Sunset Cocktail Terrace"],
      rooms: [
        {
          id: 301,
          name: "Classic Cave Suite with Caldera View",
          description: "Curved stone archways, rainfall shower, and balcony facing the caldera.",
          room_type: "Cave Suite",
          bed_type: "1 Queen Bed",
          size_sqm: 38,
          max_guests: 2,
          price_per_night: 520,
          image_url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
          amenities: ["Caldera Sea View", "Espresso Machine", "Furnished Veranda"]
        }
      ],
      reviews: [
        { author_name: "Sophie Martin", country: "France", rating: 9.9, title: "Best sunset of my life", comment: "The private plunge pool was surreal.", stay_type: "Romantic Trip" }
      ]
    },
    {
      id: 4,
      name: "The Ritz-Carlton Kyoto",
      slug: "ritz-carlton-kyoto",
      tagline: "Tranquil Zen Riverside Sanctuary in Kyoto's Cultural Heart",
      description: "Built along the banks of the Kamogawa River in Nijobashi. Harmoniously blends centuries of Japanese craftsmanship, bonsai gardens, and modern Michelin-starred gastronomy.",
      property_type: "Jungle & Desert Wellness",
      star_rating: 5,
      guest_rating: 9.6,
      review_count: 750,
      address: "Kamogawa Nijo-Ohashi Hotori",
      city: "Kyoto",
      country: "Japan",
      price_per_night: 590,
      image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Kamogawa River Terrace", "Michelin Star Kaiseki", "ESPA Spa & Indoor Pool", "Zen Rock Garden", "Tea Master"],
      rooms: [
        {
          id: 401,
          name: "Kamogawa River View Deluxe Room",
          description: "Floor-to-ceiling windows overlooking the willow-lined river with cedar bath.",
          room_type: "Deluxe River View",
          bed_type: "1 King Bed",
          size_sqm: 50,
          max_guests: 2,
          price_per_night: 590,
          image_url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
          amenities: ["Higashiyama Mountain View", "Japanese Cedar Tub", "Yukata robes"]
        }
      ],
      reviews: [
        { author_name: "Kenji Takahashi", country: "Japan", rating: 9.8, title: "Perfection in hospitality", comment: "The bonsai garden and morning pastries were sensational.", stay_type: "Cultural Escape" }
      ]
    },
    {
      id: 5,
      name: "The Plaza Fifth Avenue",
      slug: "the-plaza-new-york",
      tagline: "Legendary Grandeur Across from Central Park",
      description: "Since 1907, The Plaza has welcomed royalty, heads of state, and legendary icons. Located on Fifth Avenue and Central Park South.",
      property_type: "Historic Palace & Grandeur",
      star_rating: 5,
      guest_rating: 9.3,
      review_count: 1280,
      address: "Fifth Avenue at Central Park South",
      city: "New York",
      country: "USA",
      price_per_night: 740,
      image_url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Central Park Views", "The Palm Court Afternoon Tea", "Guerlain Spa", "Rolls Royce House Car", "White Glove Butler"],
      rooms: [
        {
          id: 501,
          name: "Plaza King Room",
          description: "24-karat gold-plated fixtures, crystal chandeliers, and handcrafted Louis XV style furniture.",
          room_type: "Classic King",
          bed_type: "1 King Bed",
          size_sqm: 45,
          max_guests: 2,
          price_per_night: 740,
          image_url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
          amenities: ["24K Gold Plated Fixtures", "Central Park Glimpse", "Sherle Wagner Bath"]
        }
      ],
      reviews: [
        { author_name: "Jonathan Reed", country: "USA", rating: 9.4, title: "A Manhattan classic", comment: "Afternoon tea in Palm Court was memorable.", stay_type: "City Vacation" }
      ]
    },
    {
      id: 6,
      name: "The Chedi Andermatt",
      slug: "the-chedi-andermatt",
      tagline: "Alpine Elegance Meets Asian Zen in the Heart of the Swiss Alps",
      description: "Surrounded by snow-capped Swiss peaks. Cozy stone fireplaces, warm timber, a 2,400 m² thermal spa, and an iconic cheese tower.",
      property_type: "Alpine Chalet & Ski",
      star_rating: 5,
      guest_rating: 9.7,
      review_count: 630,
      address: "Gotthardstrasse 4",
      city: "Swiss Alps",
      country: "Switzerland",
      price_per_night: 790,
      image_url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80"
      ],
      amenities: ["Thermal Pools", "Ski Butler Service", "The Cigar Library", "The Cheese Tower", "Fireplace in Every Room"],
      rooms: [
        {
          id: 601,
          name: "Deluxe Alpine Room",
          description: "Warm alpine timber, private fireplace, and Hästens king-size bed.",
          room_type: "Deluxe Alpine",
          bed_type: "1 King Bed",
          size_sqm: 55,
          max_guests: 2,
          price_per_night: 790,
          image_url: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
          amenities: ["Private Glass Fireplace", "Hästens Bed", "Alpine Balcony"]
        }
      ],
      reviews: [
        { author_name: "Hans Zimmerman", country: "Germany", rating: 9.8, title: "Sublime mountain sanctuary", comment: "The thermal spa overlooking snow is magical.", stay_type: "Winter Ski" }
      ]
    }
  ]
};

