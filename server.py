"""
LuxeStay - Modern Luxury Hotel Booking & E-Commerce Platform Server
Standard Library Python 3 Server with SQLite DB & REST API.
"""

import http.server
import socketserver
import urllib.parse
import sqlite3
import json
import os
import sys
import mimetypes
import datetime
import uuid
import random

PORT = 8000
DB_FILE = os.path.join(os.path.dirname(__file__), "hotel_booking.db")
PUBLIC_DIR = os.path.join(os.path.dirname(__file__), "public")

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hotels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        tagline TEXT,
        description TEXT,
        property_type TEXT,
        star_rating INTEGER DEFAULT 5,
        guest_rating REAL DEFAULT 9.2,
        review_count INTEGER DEFAULT 0,
        address TEXT,
        city TEXT,
        country TEXT,
        featured INTEGER DEFAULT 0,
        price_per_night REAL NOT NULL,
        image_url TEXT,
        gallery TEXT,
        amenities TEXT,
        tags TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        room_type TEXT,
        bed_type TEXT,
        size_sqm INTEGER,
        max_guests INTEGER DEFAULT 2,
        price_per_night REAL NOT NULL,
        image_url TEXT,
        amenities TEXT,
        available_units INTEGER DEFAULT 5,
        FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_ref TEXT UNIQUE NOT NULL,
        hotel_id INTEGER NOT NULL,
        room_id INTEGER NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        special_requests TEXT,
        check_in TEXT NOT NULL,
        check_out TEXT NOT NULL,
        nights INTEGER NOT NULL,
        guests INTEGER NOT NULL,
        meal_plan TEXT DEFAULT 'Breakfast Included',
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        coupon_code TEXT,
        tax_and_fees REAL NOT NULL,
        total_price REAL NOT NULL,
        currency TEXT DEFAULT 'USD',
        payment_method TEXT DEFAULT 'Credit Card',
        payment_status TEXT DEFAULT 'PAID',
        booking_status TEXT DEFAULT 'CONFIRMED',
        created_at TEXT NOT NULL,
        FOREIGN KEY (hotel_id) REFERENCES hotels (id),
        FOREIGN KEY (room_id) REFERENCES rooms (id)
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hotel_id INTEGER NOT NULL,
        author_name TEXT NOT NULL,
        country TEXT,
        rating REAL NOT NULL,
        title TEXT,
        comment TEXT,
        stay_type TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (hotel_id) REFERENCES hotels (id) ON DELETE CASCADE
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS coupons (
        code TEXT PRIMARY KEY,
        discount_percent REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        description TEXT,
        min_spend REAL DEFAULT 0
    )
    """)

    conn.commit()

    # Seed if hotels table is empty
    cursor.execute("SELECT COUNT(*) as count FROM hotels")
    if cursor.fetchone()["count"] == 0:
        seed_data(conn)

    conn.close()

def seed_data(conn):
    cursor = conn.cursor()

    # Seed Coupons
    coupons = [
        ("LUXE20", 20.0, 0, "20% off all luxury suites & resorts", 300),
        ("SUMMER50", 0, 50.0, "$50 off bookings over $200", 200),
        ("WELCOME10", 10.0, 0, "10% Welcome gift on first booking", 0),
        ("HONEYMOON15", 15.0, 0, "15% discount for romantic couple retreats", 400),
        ("FLASH30", 30.0, 0, "30% Flash Sale VIP Special", 600)
    ]
    cursor.executemany("INSERT OR REPLACE INTO coupons VALUES (?, ?, ?, ?, ?)", coupons)

    hotels_data = [
        {
            "name": "Grand Hotel Tremezzo",
            "slug": "grand-hotel-tremezzo",
            "tagline": "Iconic Art Nouveau Palace with Floating Pool on Lake Como",
            "description": "An authentic Art Nouveau palace offering the best of Italian hospitality. Located on the shores of Lake Como, featuring a legendary floating swimming pool, private beach, lush century-old park, and world-class fine dining by Gualtiero Marchesi.",
            "property_type": "Luxury Palace Resort",
            "star_rating": 5,
            "guest_rating": 9.7,
            "review_count": 842,
            "address": "Via Regina 8",
            "city": "Lake Como",
            "country": "Italy",
            "featured": 1,
            "price_per_night": 680,
            "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Floating Lake Pool", "Private Beach", "T Spa & Sauna", "Fine Dining", "Free High-Speed WiFi", "Helipad & Private Boat", "Valet Parking", "24/7 Butler"]),
            "tags": json.dumps(["Lake View", "Historic", "Romantic", "Michelin Dining"]),
            "rooms": [
                {
                    "name": "Prestige Lake View Room",
                    "description": "Spacious room with custom Italian silk fabrics, marble bathroom, and panoramic lake balcony.",
                    "room_type": "Double / Lake View",
                    "bed_type": "1 King Bed",
                    "size_sqm": 42,
                    "max_guests": 2,
                    "price_per_night": 680,
                    "image_url": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Balcony with Lake View", "Carrara Marble Bath", "Aqua di Parma Toiletries", "Nespresso Station"])
                },
                {
                    "name": "Rooftop Grand Suite with Jacuzzi",
                    "description": "Top-floor penthouse suite featuring a private heated panoramic whirlpool, butler service, and Champagne bar.",
                    "room_type": "Luxury Penthouse Suite",
                    "bed_type": "1 Super King Bed",
                    "size_sqm": 88,
                    "max_guests": 3,
                    "price_per_night": 1250,
                    "image_url": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Private Rooftop Terrace", "Heated Whirlpool Jacuzzi", "Dedicated Butler", "Lake Como Panoramas"])
                }
            ],
            "reviews": [
                {"author": "Elena Rossi", "country": "Italy", "rating": 10.0, "title": "Pure paradise on Lake Como!", "comment": "The floating pool overlooking Bellagio is unforgettable. Service was impeccably warm and attentive.", "stay_type": "Couple Getaway"},
                {"author": "Julian Vance", "country": "United Kingdom", "rating": 9.5, "title": "Stunning heritage and dining", "comment": "The terrace breakfast is sensational. Rooms are opulent with timeless vintage charm.", "stay_type": "Anniversary"}
            ]
        },
        {
            "name": "Soneva Jani Sanctuary",
            "slug": "soneva-jani-sanctuary",
            "tagline": "Unrivalled Overwater Villas with Water Slides into Turquoise Lagoons",
            "description": "Nestled in Medhufaru lagoon in the Noonu Atoll. Overwater villas with retractable roofs to stargaze from bed, private water slides straight into turquoise waters, and organic dining.",
            "property_type": "Overwater Island Resort",
            "star_rating": 5,
            "guest_rating": 9.9,
            "review_count": 612,
            "address": "Medhufaru Island, Noonu Atoll",
            "city": "Noonu Atoll",
            "country": "Maldives",
            "featured": 1,
            "price_per_night": 1450,
            "image_url": "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Overwater Water Slide", "Retractable Stargazing Roof", "Private Infinity Pool", "Barefoot Butler", "Overwater Cinema", "Ayurvedic Spa", "Snorkeling Reef"]),
            "tags": json.dumps(["Overwater Villa", "Ultra Luxury", "Private Pool", "Lagoon"]),
            "rooms": [
                {
                    "name": "1-Bedroom Water Retreat with Slide",
                    "description": "Double-story overwater villa with private pool, sun deck, catamaran nets, and slide directly into lagoon.",
                    "room_type": "Overwater Villa",
                    "bed_type": "1 King Bed + Daybed",
                    "size_sqm": 410,
                    "max_guests": 3,
                    "price_per_night": 1450,
                    "image_url": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Lagoon Slide", "Retractable Roof", "Private Pool", "Glass Floor Panels"])
                },
                {
                    "name": "2-Bedroom Island Reserve with Pool",
                    "description": "Secluded beachfront estate wrapped in tropical foliage with vast private freshwater lagoon pool.",
                    "room_type": "Beach Sanctuary",
                    "bed_type": "2 King Beds",
                    "size_sqm": 580,
                    "max_guests": 5,
                    "price_per_night": 2200,
                    "image_url": "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Private Beach Access", "Wine Cellar", "Outdoor Rainforest Showers", "Dedicated Host"])
                }
            ],
            "reviews": [
                {"author": "Marcus Sterling", "country": "Switzerland", "rating": 10.0, "title": "Heaven on Earth", "comment": "Sliding directly into crystal clear water from our deck was unbelievable. The night sky from the bed is magical.", "stay_type": "Family Holiday"},
                {"author": "Aaliyah Khan", "country": "UAE", "rating": 9.8, "title": "Surpassed every expectation", "comment": "True barefoot luxury with unmatched marine life and world class private dining.", "stay_type": "Honeymoon"}
            ]
        },
        {
            "name": "Canaves Oia Suites",
            "slug": "canaves-oia-suites",
            "tagline": "Cliffside Caldera Caves & Sunset Infinity Pools",
            "description": "Carved into the dramatic cliffs of Oia overlooking the Aegean Sea. Minimalist Cycladic architecture, caves converted into luxury plunge suites, and breathtaking Caldera sunsets.",
            "property_type": "Cliffside Boutique Suites",
            "star_rating": 5,
            "guest_rating": 9.8,
            "review_count": 910,
            "address": "Main Street, Oia",
            "city": "Santorini",
            "country": "Greece",
            "featured": 1,
            "price_per_night": 520,
            "image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Caldera Infinity Pool", "Private Cave Plunge Pool", "Gourmet Wine Bar", "Yacht Excursions", "Sunset Cocktail Terrace", "Champagne Breakfast"]),
            "tags": json.dumps(["Santorini", "Cliffside", "Sunset Views", "Private Plunge Pool"]),
            "rooms": [
                {
                    "name": "Classic Cave Suite with Caldera View",
                    "description": "Traditional whitewashed Cycladic suite with curved stone archways, rainfall shower, and balcony facing the caldera.",
                    "room_type": "Cave Suite",
                    "bed_type": "1 Queen Bed",
                    "size_sqm": 38,
                    "max_guests": 2,
                    "price_per_night": 520,
                    "image_url": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Caldera Sea View", "Espresso Machine", "Furnished Veranda", "Rainfall Cave Shower"])
                },
                {
                    "name": "Infinity Pool Suite",
                    "description": "Ultra-luxe suite with private infinity plunge pool perched over the 300-meter drop towards the Aegean.",
                    "room_type": "Infinity Suite",
                    "bed_type": "1 King Bed",
                    "size_sqm": 60,
                    "max_guests": 2,
                    "price_per_night": 890,
                    "image_url": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Private Caldera Edge Pool", "Open-air Daybed", "Complimentary Moët & Chandon", "VIP Concierge"])
                }
            ],
            "reviews": [
                {"author": "Sophie Martin", "country": "France", "rating": 9.9, "title": "Best sunset of my life", "comment": "The private plunge pool overlooking the Aegean was surreal. Breakfast brought to our veranda each morning.", "stay_type": "Romantic Trip"},
                {"author": "David Chen", "country": "Singapore", "rating": 9.7, "title": "Unmatched hospitality", "comment": "Spotless rooms, breathtaking views, and staff who treat you like royalty.", "stay_type": "Solo Luxury"}
            ]
        },
        {
            "name": "The Ritz-Carlton Kyoto",
            "slug": "ritz-carlton-kyoto",
            "tagline": "Tranquil Zen Riverside Sanctuary in Kyoto's Cultural Heart",
            "description": "Built along the banks of the Kamogawa River in Nijobashi. Harmoniously blends centuries of Japanese craftsmanship, bonsai gardens, and modern Michelin-starred gastronomy.",
            "property_type": "Urban Luxury Resort",
            "star_rating": 5,
            "guest_rating": 9.6,
            "review_count": 750,
            "address": "Kamogawa Nijo-Ohashi Hotori, Nakagyo-ku",
            "city": "Kyoto",
            "country": "Japan",
            "featured": 1,
            "price_per_night": 590,
            "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Kamogawa River Terrace", "Michelin Star Kaiseki", "ESPA Spa & Indoor Pool", "Pierre Hermé Paris Bakery", "Zen Rock Garden", "Tea Master Experience"]),
            "tags": json.dumps(["Zen Sanctuary", "Cultural", "River View", "Fine Dining"]),
            "rooms": [
                {
                    "name": "Kamogawa River View Deluxe Room",
                    "description": "Floor-to-ceiling windows overlooking the willow-lined river with traditional Shippo-pattern latticework and cedar bath.",
                    "room_type": "Deluxe River View",
                    "bed_type": "1 King Bed or 2 Twin",
                    "size_sqm": 50,
                    "max_guests": 2,
                    "price_per_night": 590,
                    "image_url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Higashiyama Mountain & River View", "Japanese Cedar Tub", "Nespresso", "Yukata & Kimono robes"])
                },
                {
                    "name": "Suite Tsukimi with Japanese Garden",
                    "description": "Expansive suite featuring a private enclosed Zen dry-landscape rock garden, Tatami sitting area, and deep soaking Hinoki tub.",
                    "room_type": "Japanese Zen Suite",
                    "bed_type": "1 Master King Bed",
                    "size_sqm": 105,
                    "max_guests": 3,
                    "price_per_night": 1180,
                    "image_url": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Private Rock Garden", "Tatami Lounge", "Personal Butler Tea Ceremony", "Deep Hinoki Soaking Tub"])
                }
            ],
            "reviews": [
                {"author": "Kenji Takahashi", "country": "Japan", "rating": 9.8, "title": "Perfection in hospitality", "comment": "The river sound, the serene bonsai garden, and the Pierre Hermé morning pastries made this an unforgettable stay.", "stay_type": "Cultural Escape"},
                {"author": "Sarah Jenkins", "country": "Australia", "rating": 9.5, "title": "Breathtaking serene luxury", "comment": "Best hotel in Japan. The attention to detail is mindblowing.", "stay_type": "Leisure"}
            ]
        },
        {
            "name": "The Plaza Fifth Avenue",
            "slug": "the-plaza-new-york",
            "tagline": "Legendary Grandeur Across from Central Park",
            "description": "Since 1907, The Plaza has welcomed royalty, heads of state, and legendary icons. Located on Fifth Avenue and Central Park South, offering Beaux-Arts grandeur, The Palm Court, and Guerlain Spa.",
            "property_type": "Historic Grand Palace",
            "star_rating": 5,
            "guest_rating": 9.3,
            "review_count": 1280,
            "address": "Fifth Avenue at Central Park South",
            "city": "New York",
            "country": "USA",
            "featured": 1,
            "price_per_night": 740,
            "image_url": "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Central Park Views", "The Palm Court Afternoon Tea", "Guerlain Spa", "Rolls Royce House Car", "White Glove Butler", "24/7 Fitness Center"]),
            "tags": json.dumps(["Central Park", "Iconic Landmark", "Fifth Avenue", "High Society"]),
            "rooms": [
                {
                    "name": "Plaza King Room",
                    "description": "Elegantly furnished with 24-karat gold-plated fixtures, crystal chandeliers, and handcrafted Louis XV style furniture.",
                    "room_type": "Classic King",
                    "bed_type": "1 King Bed",
                    "size_sqm": 45,
                    "max_guests": 2,
                    "price_per_night": 740,
                    "image_url": "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["24K Gold Plated Fixtures", "Central Park Glimpse", "Sherle Wagner Bath", "iPad Room Controls"])
                },
                {
                    "name": "Central Park One-Bedroom Suite",
                    "description": "Dramatic unobstructed views of Central Park, high ceilings, separate parlor salon, and dedicated white-glove butler.",
                    "room_type": "Grand Park Suite",
                    "bed_type": "1 King Bed + Sleeper",
                    "size_sqm": 92,
                    "max_guests": 3,
                    "price_per_night": 1650,
                    "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Full Central Park Vista", "Private Fireplace", "In-Suite Dining Table", "Dedicated Butler"])
                }
            ],
            "reviews": [
                {"author": "Jonathan Reed", "country": "USA", "rating": 9.4, "title": "A timeless Manhattan classic", "comment": "Afternoon tea in Palm Court and gazing at Central Park in autumn is an unforgettable New York moment.", "stay_type": "City Vacation"}
            ]
        },
        {
            "name": "Burj Al Arab Jumeirah",
            "slug": "burj-al-arab-jumeirah",
            "tagline": "The World's Most Iconic Sail-Shaped Luxury Wonder",
            "description": "Standing on its own man-made island, Burj Al Arab features ultra-luxurious duplex suites with 24-karat gold interiors, private helipad, chauffeur-driven Rolls-Royces, and the stunning SAL beach club.",
            "property_type": "Ultra Luxury Resort",
            "star_rating": 5,
            "guest_rating": 9.7,
            "review_count": 1420,
            "address": "Jumeirah Beach Road",
            "city": "Dubai",
            "country": "UAE",
            "featured": 1,
            "price_per_night": 1280,
            "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Private Helipad", "SAL Beach Club Infinity Pool", "Talise Spa at 150m", "Rolls Royce Chauffeur", "24K Gold Amenities", "Underwater Seafood Restaurant"]),
            "tags": json.dumps(["Dubai Icon", "Duplex Suites", "Private Beach", "Gold Luxury"]),
            "rooms": [
                {
                    "name": "Deluxe One-Bedroom Duplex Suite",
                    "description": "Two-level palatial suite overlooking the Arabian Gulf with spiral staircase, marble whirlpool, and Hermes amenities.",
                    "room_type": "Duplex Suite",
                    "bed_type": "1 Super King Bed",
                    "size_sqm": 170,
                    "max_guests": 2,
                    "price_per_night": 1280,
                    "image_url": "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Two-story Duplex", "Arabian Gulf Panoramas", "Hermès Full Size Toiletries", "Private Bar & Butler"])
                }
            ],
            "reviews": [
                {"author": "Fatima Al-Mansoor", "country": "Kuwait", "rating": 10.0, "title": "Pure extravagance and warmth", "comment": "The level of personalization is unbelievable. The terrace pool over the ocean is breathtaking.", "stay_type": "VIP Holiday"}
            ]
        },
        {
            "name": "Amangiri Canyon Sanctuary",
            "slug": "amangiri-canyon-sanctuary",
            "tagline": "Architectural Marvel Blended into 600 Acres of Red Rock Desert",
            "description": "Tucked into a protected valley with sweeping views towards the Grand Staircase-Escalante National Monument. Minimalist concrete architecture framing ancient red rocks, private canyons, and desert silence.",
            "property_type": "Desert Wilderness Resort",
            "star_rating": 5,
            "guest_rating": 9.8,
            "review_count": 480,
            "address": "1 Kayenta Road",
            "city": "Canyon Point",
            "country": "USA",
            "featured": 1,
            "price_per_night": 1550,
            "image_url": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Rock-Framed Swimming Pool", "Navajo Healing Spa", "Hot Air Ballooning", "Private Via Ferrata", "Stargazing Deck", "Organic Southwest Dining"]),
            "tags": json.dumps(["Desert Wellness", "Architectural", "Canyon", "Ultra Secluded"]),
            "rooms": [
                {
                    "name": "Desert View Suite",
                    "description": "Minimalist suite framing pristine red sandstone vistas with private outdoor lounge and courtyard fire pit.",
                    "room_type": "Desert Suite",
                    "bed_type": "1 King Bed",
                    "size_sqm": 93,
                    "max_guests": 2,
                    "price_per_night": 1550,
                    "image_url": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Desert Panoramic Lounge", "Outdoor Fireplace", "Deep Soak Stone Tub", "Private Courtyard"])
                }
            ],
            "reviews": [
                {"author": "Liam Hemsworth", "country": "Australia", "rating": 9.9, "title": "Pure peaceful soul recharge", "comment": "The architecture blends seamlessly into the rocks. Waking up to canyon sunrise is spiritual.", "stay_type": "Wellness Retreat"}
            ]
        },
        {
            "name": "Hôtel de Crillon, Rosewood",
            "slug": "hotel-de-crillon-paris",
            "tagline": "Historic 18th Century Palace Overlooking Place de la Concorde",
            "description": "Originally commissioned by King Louis XV, Hôtel de Crillon is an emblem of French luxury. Featuring suites designed by Karl Lagerfeld, Sense Rosewood Spa, and courtyard dining.",
            "property_type": "Historic Grand Palace",
            "star_rating": 5,
            "guest_rating": 9.6,
            "review_count": 920,
            "address": "10 Place de la Concorde",
            "city": "Paris",
            "country": "France",
            "featured": 1,
            "price_per_night": 950,
            "image_url": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Place de la Concorde Views", "Karl Lagerfeld Suites", "Sense Spa & Gold Leaf Pool", "L'Ecrin Gastronomy", "Butler Concierge", "Eiffel Tower Glimpse"]),
            "tags": json.dumps(["Paris Palace", "Eiffel Tower", "Haute Couture", "Historical"]),
            "rooms": [
                {
                    "name": "Deluxe Palace Room",
                    "description": "High ceilings, custom woodwork, Parisian courtyard view, and bespoke marble bathroom.",
                    "room_type": "Deluxe Palace",
                    "bed_type": "1 King Bed",
                    "size_sqm": 45,
                    "max_guests": 2,
                    "price_per_night": 950,
                    "image_url": "https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["French Balcony", "Buly 1803 Paris Toiletries", "Underfloor Heating", "Wine Cellarette"])
                }
            ],
            "reviews": [
                {"author": "Camille Duclos", "country": "France", "rating": 9.7, "title": "Quintessential Parisian elegance", "comment": "Sitting by the fountain courtyard with champagne was divine.", "stay_type": "Weekend Break"}
            ]
        },
        {
            "name": "Four Seasons Resort Bali at Sayan",
            "slug": "four-seasons-bali-sayan",
            "tagline": "Suspended Lotus Pond & Jungle Villas Above the Ayung River",
            "description": "Arrive across a dramatic suspension bridge over the tropical valley canopy to a rooftop lotus pond. Nestled amidst sacred rainforests, lush terraced rice paddies, and tranquil riverbanks.",
            "property_type": "Jungle & Wellness Sanctuary",
            "star_rating": 5,
            "guest_rating": 9.8,
            "review_count": 890,
            "address": "Sayan, Ubud",
            "city": "Bali",
            "country": "Indonesia",
            "featured": 1,
            "price_per_night": 480,
            "image_url": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Sacred River Spa", "Rooftop Lotus Pond", "Private Plunge Pool Villas", "River Rafting", "Chakra Meditation", "Balinese Cooking Academy"]),
            "tags": json.dumps(["Jungle Sanctuary", "Private Pool", "Ayung River", "Holistic Wellness"]),
            "rooms": [
                {
                    "name": "One-Bedroom Riverfront Villa with Pool",
                    "description": "Private open-air living pavilion, plunge pool, outdoor lotus shower, and soothing sounds of the rushing Ayung River.",
                    "room_type": "Riverfront Villa",
                    "bed_type": "1 King Bed",
                    "size_sqm": 200,
                    "max_guests": 2,
                    "price_per_night": 480,
                    "image_url": "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Private Plunge Pool", "Outdoor Rainforest Shower", "Ayung River Sounds", "Sun Loungers"])
                }
            ],
            "reviews": [
                {"author": "Clara Evans", "country": "Canada", "rating": 10.0, "title": "Absolute peace and rejuvenation", "comment": "The bridge entrance takes your breath away. Falling asleep to river whispers and waking up to jungle mist.", "stay_type": "Wellness Holiday"}
            ]
        },
        {
            "name": "The Chedi Andermatt",
            "slug": "the-chedi-andermatt",
            "tagline": "Alpine Elegance Meets Asian Zen in the Heart of the Swiss Alps",
            "description": "Captivating alpine paradise surrounded by snow-capped Swiss peaks. Featuring cozy stone fireplaces, warm timber, a 2,400 m² thermal spa, and an iconic cheese tower.",
            "property_type": "Alpine Ski & Spa Resort",
            "star_rating": 5,
            "guest_rating": 9.7,
            "review_count": 630,
            "address": "Gotthardstrasse 4",
            "city": "Andermatt",
            "country": "Switzerland",
            "featured": 1,
            "price_per_night": 790,
            "image_url": "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80",
            "gallery": json.dumps([
                "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80",
                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
            ]),
            "amenities": json.dumps(["Indoor & Outdoor Thermal Pools", "Ski Butler Service", "The Cigar Library", "The Cheese Tower", "Fireplace in Every Room", "Michelin Japanese Restaurant"]),
            "tags": json.dumps(["Swiss Alps", "Ski In/Out", "Thermal Spa", "Fireplace Suite"]),
            "rooms": [
                {
                    "name": "Deluxe Alpine Room",
                    "description": "Warm alpine timber, bronze finishes, private fireplace, and Hästens king-size bed.",
                    "room_type": "Deluxe Alpine",
                    "bed_type": "1 King Bed",
                    "size_sqm": 55,
                    "max_guests": 2,
                    "price_per_night": 790,
                    "image_url": "https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=800&q=80",
                    "amenities": json.dumps(["Private Glass Fireplace", "Hästens Bed", "Heated Stone Bathroom", "Alpine Balcony"])
                }
            ],
            "reviews": [
                {"author": "Hans Zimmerman", "country": "Germany", "rating": 9.8, "title": "Sublime mountain sanctuary", "comment": "The thermal spa overlooking falling snow is unforgettable. Best ski hotel in the world.", "stay_type": "Winter Ski"}
            ]
        }
    ]

    for h in hotels_data:
        rooms = h.pop("rooms", [])
        reviews = h.pop("reviews", [])
        cursor.execute("""
            INSERT INTO hotels (name, slug, tagline, description, property_type, star_rating,
                                guest_rating, review_count, address, city, country, featured,
                                price_per_night, image_url, gallery, amenities, tags)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            h["name"], h["slug"], h["tagline"], h["description"], h["property_type"],
            h["star_rating"], h["guest_rating"], h["review_count"], h["address"],
            h["city"], h["country"], h["featured"], h["price_per_night"],
            h["image_url"], h["gallery"], h["amenities"], h["tags"]
        ))
        hotel_id = cursor.lastrowid

        for r in rooms:
            cursor.execute("""
                INSERT INTO rooms (hotel_id, name, description, room_type, bed_type,
                                   size_sqm, max_guests, price_per_night, image_url, amenities, available_units)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 6)
            """, (
                hotel_id, r["name"], r["description"], r["room_type"], r["bed_type"],
                r["size_sqm"], r["max_guests"], r["price_per_night"], r["image_url"], r["amenities"]
            ))

        for rev in reviews:
            cursor.execute("""
                INSERT INTO reviews (hotel_id, author_name, country, rating, title, comment, stay_type, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-7 days'))
            """, (
                hotel_id, rev["author"], rev["country"], rev["rating"], rev["title"], rev["comment"], rev["stay_type"]
            ))

    conn.commit()
    print("Database seeded successfully with luxury hotels, rooms, and reviews.")


class HotelBookingHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            self.handle_api_get(path, urllib.parse.parse_qs(parsed.query))
        else:
            # Fallback to static files
            super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/"):
            content_length = int(self.headers.get("Content-Length", 0))
            post_body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
            try:
                data = json.loads(post_body)
            except Exception:
                data = {}
            self.handle_api_post(path, data)
        else:
            self.send_error(404, "Endpoint not found")

    def send_json(self, status_code, data):
        response_bytes = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def handle_api_get(self, path, query):
        conn = get_db()
        cursor = conn.cursor()

        try:
            if path == "/api/hotels":
                # Filtering & Searching
                city_q = query.get("city", [""])[0].strip()
                min_price = float(query.get("minPrice", [0])[0]) if query.get("minPrice", [""])[0] else 0
                max_price = float(query.get("maxPrice", [999999])[0]) if query.get("maxPrice", [""])[0] else 999999
                min_rating = float(query.get("minRating", [0])[0]) if query.get("minRating", [""])[0] else 0
                prop_type = query.get("propertyType", [""])[0].strip()
                amenity_filter = query.get("amenity", [""])[0].strip()
                sort_by = query.get("sortBy", ["recommended"])[0]

                sql = "SELECT * FROM hotels WHERE price_per_night >= ? AND price_per_night <= ? AND guest_rating >= ?"
                params = [min_price, max_price, min_rating]

                if city_q:
                    sql += " AND (city LIKE ? OR country LIKE ? OR name LIKE ?)"
                    params.extend([f"%{city_q}%", f"%{city_q}%", f"%{city_q}%"])

                if prop_type and prop_type != "All":
                    sql += " AND property_type LIKE ?"
                    params.append(f"%{prop_type}%")

                if amenity_filter:
                    for a in amenity_filter.split(","):
                        a = a.strip()
                        if a:
                            sql += " AND amenities LIKE ?"
                            params.append(f"%{a}%")

                if sort_by == "price_asc":
                    sql += " ORDER BY price_per_night ASC"
                elif sort_by == "price_desc":
                    sql += " ORDER BY price_per_night DESC"
                elif sort_by == "rating_desc":
                    sql += " ORDER BY guest_rating DESC, review_count DESC"
                elif sort_by == "reviews_desc":
                    sql += " ORDER BY review_count DESC"
                else: # recommended / featured
                    sql += " ORDER BY featured DESC, guest_rating DESC"

                cursor.execute(sql, params)
                hotels = [dict(row) for row in cursor.fetchall()]

                # Parse JSON fields
                for h in hotels:
                    try:
                        h["gallery"] = json.loads(h["gallery"])
                    except:
                        h["gallery"] = []
                    try:
                        h["amenities"] = json.loads(h["amenities"])
                    except:
                        h["amenities"] = []
                    try:
                        h["tags"] = json.loads(h["tags"])
                    except:
                        h["tags"] = []

                self.send_json(200, {"success": True, "count": len(hotels), "hotels": hotels})

            elif path.startswith("/api/hotels/"):
                hotel_id = path.split("/api/hotels/")[1]
                if hotel_id.isdigit():
                    cursor.execute("SELECT * FROM hotels WHERE id = ?", (int(hotel_id),))
                else:
                    cursor.execute("SELECT * FROM hotels WHERE slug = ?", (hotel_id,))
                
                hotel = cursor.fetchone()
                if not hotel:
                    self.send_json(404, {"success": False, "error": "Hotel not found"})
                    return

                hotel_dict = dict(hotel)
                hotel_dict["gallery"] = json.loads(hotel_dict["gallery"]) if hotel_dict["gallery"] else []
                hotel_dict["amenities"] = json.loads(hotel_dict["amenities"]) if hotel_dict["amenities"] else []
                hotel_dict["tags"] = json.loads(hotel_dict["tags"]) if hotel_dict["tags"] else []

                # Fetch rooms
                cursor.execute("SELECT * FROM rooms WHERE hotel_id = ?", (hotel_dict["id"],))
                rooms = []
                for r in cursor.fetchall():
                    rd = dict(r)
                    rd["amenities"] = json.loads(rd["amenities"]) if rd["amenities"] else []
                    rooms.append(rd)
                hotel_dict["rooms"] = rooms

                # Fetch reviews
                cursor.execute("SELECT * FROM reviews WHERE hotel_id = ? ORDER BY id DESC", (hotel_dict["id"],))
                hotel_dict["reviews"] = [dict(rev) for rev in cursor.fetchall()]

                self.send_json(200, {"success": True, "hotel": hotel_dict})

            elif path == "/api/destinations":
                cursor.execute("""
                    SELECT city, country, image_url, MIN(price_per_night) as starting_price, COUNT(*) as hotel_count
                    FROM hotels
                    GROUP BY city, country
                    ORDER BY hotel_count DESC, starting_price ASC
                """)
                destinations = [dict(row) for row in cursor.fetchall()]
                self.send_json(200, {"success": True, "destinations": destinations})

            elif path == "/api/coupons":
                code = query.get("code", [""])[0].strip().upper()
                if code:
                    cursor.execute("SELECT * FROM coupons WHERE code = ?", (code,))
                    coupon = cursor.fetchone()
                    if coupon:
                        self.send_json(200, {"success": True, "coupon": dict(coupon)})
                    else:
                        self.send_json(404, {"success": False, "error": "Invalid or expired coupon code"})
                else:
                    cursor.execute("SELECT * FROM coupons")
                    self.send_json(200, {"success": True, "coupons": [dict(r) for r in cursor.fetchall()]})

            elif path == "/api/bookings":
                email = query.get("email", [""])[0].strip()
                ref = query.get("ref", [""])[0].strip().upper()

                if ref:
                    cursor.execute("""
                        SELECT b.*, h.name as hotel_name, h.image_url as hotel_image, h.city as hotel_city,
                               h.country as hotel_country, h.address as hotel_address, r.name as room_name, r.room_type
                        FROM bookings b
                        JOIN hotels h ON b.hotel_id = h.id
                        JOIN rooms r ON b.room_id = r.id
                        WHERE b.booking_ref = ?
                    """, (ref,))
                    booking = cursor.fetchone()
                    if booking:
                        self.send_json(200, {"success": True, "booking": dict(booking)})
                    else:
                        self.send_json(404, {"success": False, "error": "Booking not found"})
                    return

                if email:
                    cursor.execute("""
                        SELECT b.*, h.name as hotel_name, h.image_url as hotel_image, h.city as hotel_city,
                               h.country as hotel_country, r.name as room_name
                        FROM bookings b
                        JOIN hotels h ON b.hotel_id = h.id
                        JOIN rooms r ON b.room_id = r.id
                        WHERE b.email = ?
                        ORDER BY b.id DESC
                    """, (email,))
                else:
                    cursor.execute("""
                        SELECT b.*, h.name as hotel_name, h.image_url as hotel_image, h.city as hotel_city,
                               h.country as hotel_country, r.name as room_name
                        FROM bookings b
                        JOIN hotels h ON b.hotel_id = h.id
                        JOIN rooms r ON b.room_id = r.id
                        ORDER BY b.id DESC
                    """)

                bookings = [dict(b) for b in cursor.fetchall()]
                self.send_json(200, {"success": True, "bookings": bookings})

            elif path == "/api/admin/stats":
                cursor.execute("SELECT COUNT(*) as total_bookings, COALESCE(SUM(total_price), 0) as total_revenue FROM bookings WHERE booking_status != 'CANCELLED'")
                rev_row = dict(cursor.fetchone())

                cursor.execute("SELECT COUNT(*) as total_hotels, AVG(guest_rating) as avg_rating FROM hotels")
                hotel_row = dict(cursor.fetchone())

                cursor.execute("""
                    SELECT b.*, h.name as hotel_name, r.name as room_name 
                    FROM bookings b
                    JOIN hotels h ON b.hotel_id = h.id
                    JOIN rooms r ON b.room_id = r.id
                    ORDER BY b.id DESC LIMIT 5
                """)
                recent_bookings = [dict(r) for r in cursor.fetchall()]

                self.send_json(200, {
                    "success": True,
                    "stats": {
                        "total_revenue": round(rev_row["total_revenue"], 2),
                        "total_bookings": rev_row["total_bookings"],
                        "total_hotels": hotel_row["total_hotels"],
                        "avg_rating": round(hotel_row["avg_rating"] or 9.5, 1),
                        "recent_bookings": recent_bookings
                    }
                })

            else:
                self.send_json(404, {"success": False, "error": "API route not found"})
        except Exception as e:
            self.send_json(500, {"success": False, "error": str(e)})
        finally:
            conn.close()

    def handle_api_post(self, path, data):
        conn = get_db()
        cursor = conn.cursor()

        try:
            if path == "/api/bookings":
                # Create Booking
                hotel_id = int(data.get("hotel_id"))
                room_id = int(data.get("room_id"))
                first_name = data.get("first_name", "").strip()
                last_name = data.get("last_name", "").strip()
                email = data.get("email", "").strip().lower()
                phone = data.get("phone", "").strip()
                special_requests = data.get("special_requests", "").strip()
                check_in = data.get("check_in", "")
                check_out = data.get("check_out", "")
                nights = int(data.get("nights", 1))
                guests = int(data.get("guests", 1))
                meal_plan = data.get("meal_plan", "Breakfast Included")
                subtotal = float(data.get("subtotal", 0))
                discount = float(data.get("discount", 0))
                coupon_code = data.get("coupon_code", "").upper().strip()
                tax_and_fees = float(data.get("tax_and_fees", 0))
                total_price = float(data.get("total_price", subtotal + tax_and_fees - discount))
                payment_method = data.get("payment_method", "Credit Card")
                currency = data.get("currency", "USD")

                if not (first_name and last_name and email and check_in and check_out):
                    self.send_json(400, {"success": False, "error": "Please provide all required guest and date fields."})
                    return

                # Generate reference
                ref_num = random.randint(10000, 99999)
                booking_ref = f"LX-{ref_num}"
                created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                cursor.execute("""
                    INSERT INTO bookings (
                        booking_ref, hotel_id, room_id, first_name, last_name, email, phone,
                        special_requests, check_in, check_out, nights, guests, meal_plan,
                        subtotal, discount, coupon_code, tax_and_fees, total_price,
                        currency, payment_method, payment_status, booking_status, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PAID', 'CONFIRMED', ?)
                """, (
                    booking_ref, hotel_id, room_id, first_name, last_name, email, phone,
                    special_requests, check_in, check_out, nights, guests, meal_plan,
                    subtotal, discount, coupon_code, tax_and_fees, total_price,
                    currency, payment_method, created_at
                ))
                booking_id = cursor.lastrowid
                conn.commit()

                # Fetch full booking details for response
                cursor.execute("""
                    SELECT b.*, h.name as hotel_name, h.image_url as hotel_image, h.address as hotel_address,
                           h.city as hotel_city, h.country as hotel_country, r.name as room_name
                    FROM bookings b
                    JOIN hotels h ON b.hotel_id = h.id
                    JOIN rooms r ON b.room_id = r.id
                    WHERE b.id = ?
                """, (booking_id,))
                new_booking = dict(cursor.fetchone())

                self.send_json(201, {
                    "success": True,
                    "message": "Booking confirmed successfully!",
                    "booking": new_booking
                })

            elif path.startswith("/api/bookings/") and path.endswith("/cancel"):
                parts = path.split("/")
                ref = parts[3].upper()
                cursor.execute("SELECT * FROM bookings WHERE booking_ref = ?", (ref,))
                booking = cursor.fetchone()
                if not booking:
                    self.send_json(404, {"success": False, "error": "Booking not found"})
                    return

                cursor.execute("UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_ref = ?", (ref,))
                conn.commit()
                self.send_json(200, {"success": True, "message": f"Booking {ref} has been cancelled successfully. Full refund initiated."})

            elif path == "/api/reviews":
                hotel_id = int(data.get("hotel_id"))
                author = data.get("author_name", "Anonymous Guest").strip()
                country = data.get("country", "International").strip()
                rating = float(data.get("rating", 10.0))
                title = data.get("title", "").strip()
                comment = data.get("comment", "").strip()
                stay_type = data.get("stay_type", "Leisure Stay").strip()
                created_at = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

                cursor.execute("""
                    INSERT INTO reviews (hotel_id, author_name, country, rating, title, comment, stay_type, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (hotel_id, author, country, rating, title, comment, stay_type, created_at))

                # Update hotel avg rating & count
                cursor.execute("SELECT AVG(rating) as avg_r, COUNT(*) as cnt FROM reviews WHERE hotel_id = ?", (hotel_id,))
                stats = cursor.fetchone()
                cursor.execute("UPDATE hotels SET guest_rating = ?, review_count = ? WHERE id = ?",
                               (round(stats["avg_r"], 1), stats["cnt"], hotel_id))
                conn.commit()

                self.send_json(201, {"success": True, "message": "Thank you for your verified guest review!"})

            elif path == "/api/admin/hotels":
                # Create or update hotel
                name = data.get("name")
                city = data.get("city")
                country = data.get("country")
                price = float(data.get("price_per_night", 299))
                tagline = data.get("tagline", "Luxury Sanctuary")
                desc = data.get("description", "Exclusive resort experience.")
                prop_type = data.get("property_type", "Boutique Hotel")
                star_rating = int(data.get("star_rating", 5))
                image_url = data.get("image_url", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80")
                amenities = json.dumps(data.get("amenities", ["WiFi", "Pool", "Spa", "Dining"]))
                tags = json.dumps(data.get("tags", ["Luxury", "Curated"]))
                slug = name.lower().replace(" ", "-").replace("'", "")

                cursor.execute("""
                    INSERT INTO hotels (name, slug, tagline, description, property_type, star_rating,
                                        guest_rating, review_count, address, city, country, featured,
                                        price_per_night, image_url, gallery, amenities, tags)
                    VALUES (?, ?, ?, ?, ?, ?, 9.5, 1, ?, ?, ?, 1, ?, ?, ?, ?, ?)
                """, (
                    name, slug, tagline, desc, prop_type, star_rating,
                    f"Central District, {city}", city, country, price, image_url,
                    json.dumps([image_url]), amenities, tags
                ))
                new_hotel_id = cursor.lastrowid

                # Add a default room for this hotel
                cursor.execute("""
                    INSERT INTO rooms (hotel_id, name, description, room_type, bed_type,
                                       size_sqm, max_guests, price_per_night, image_url, amenities, available_units)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 5)
                """, (
                    new_hotel_id, f"Signature Suite - {name}", "Spacious luxury suite with premium comforts.",
                    "Signature Suite", "1 King Bed", 50, 2, price, image_url, amenities
                ))
                conn.commit()

                self.send_json(201, {"success": True, "message": "Hotel listed successfully!", "id": new_hotel_id})

            else:
                self.send_json(404, {"success": False, "error": "API route not found"})

        except Exception as e:
            self.send_json(500, {"success": False, "error": str(e)})
        finally:
            conn.close()

def run_server(port=PORT):
    init_db()
    os.chdir(os.path.dirname(__file__))

    # Make sure MIME types are correct for JS and CSS
    mimetypes.add_type("application/javascript", ".js")
    mimetypes.add_type("text/css", ".css")
    mimetypes.add_type("image/svg+xml", ".svg")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), HotelBookingHandler) as httpd:
        print(f"================================================================")
        print(f" LuxeStay E-Commerce Hotel Booking Platform running!")
        print(f" URL: http://localhost:{port}")
        print(f" Database: {DB_FILE}")
        print(f" Press Ctrl+C to stop.")
        print(f"================================================================")
        sys.stdout.flush()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == "__main__":
    port = PORT
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_server(port)

