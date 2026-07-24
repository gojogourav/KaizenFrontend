/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Mock Database State for Backend Server
const BACKEND_USERS: Record<string, any> = {
  'usr_demo': {
    id: 'usr_demo',
    email: 'shaktisahoo24@gmail.com',
    name: 'Shakti Sahoo',
    role: 'CUSTOMER',
    is_staff: false,
    is_superuser: false,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    company: 'Turnkey Member',
    phone: '+1 (555) 234-5678'
  },
  'usr_admin': {
    id: 'usr_admin',
    email: 'admin@kaizen.com',
    name: 'Admin User',
    role: 'ADMIN',
    is_staff: true,
    is_superuser: true,
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    company: 'Kaizen Corporate HQ',
    phone: '+1 (555) 999-0000'
  }
};

const TOKENS: Record<string, string> = {
  'demo_jwt_token_kaizen_2026': 'usr_demo'
};

const USER_FAVORITES: Record<string, string[]> = {
  'usr_demo': ['deal-1', 'deal-4']
};

const USER_BOOKINGS: Record<string, any[]> = {
  'usr_demo': [
    {
      bookingId: 'bk_88102',
      propertyId: 'deal-4',
      propertyTitle: 'Puri Beachfront Haven',
      location: 'Puri, Odisha',
      monthlyRent: '$1,950',
      status: 'PURCHASED',
      lockedAt: '2026-07-20T10:15:00Z',
      purchasedAt: '2026-07-20T10:28:00Z',
      transactionHash: 'tx_kaizen_771928301'
    }
  ]
};

const LEADS: any[] = [
  {
    id: 'lead_101',
    name: 'David Miller',
    email: 'david.m@apexcap.com',
    phone: '+1 (555) 382-9910',
    message: 'Interested in taking over 3 subleases in Florida for corporate housing.',
    propertyId: 'deal-1',
    type: 'INVESTOR_INQUIRY',
    createdAt: '2026-07-22T14:30:00Z'
  },
  {
    id: 'lead_102',
    name: 'Sophia Patel',
    email: 'spatel@zenithholdings.io',
    phone: '+1 (555) 912-4431',
    message: 'Looking for a 2-year master lease agreement on the Scottsdale Desert Oasis.',
    propertyId: 'deal-2',
    type: 'MASTER_LEASE',
    createdAt: '2026-07-23T09:15:00Z'
  }
];

let BLOGS = [
  {
    id: 'blog-1',
    title: 'Curating Kaizen Scottsdale: Inside Our Design Playbook',
    slug: 'curating-kaizen-scottsdale',
    author: 'Shakti Sahoo',
    publishDate: '2026-07-18',
    coverImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    content: 'How we integrated custom local cactus gardens, heated infinity pools, and warm neutral linens to boost Scottsdale guest satisfaction.',
    status: 'Published'
  },
  {
    id: 'blog-2',
    title: 'The Jain-Friendly Gourmet Advantage in Modern Luxury',
    slug: 'jain-friendly-gourmet-advantage',
    author: 'Elena Rostova',
    publishDate: '2026-07-14',
    coverImageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    content: 'A 5-star trip is more than just handing over a check-in code. We explore how catering to specialized dietary travelers secures top reviews.',
    status: 'Published'
  },
  {
    id: 'blog-3',
    title: 'Pensacola Coastal Living: High Amenities & Unmatched Comfort',
    slug: 'pensacola-coastal-living',
    author: 'Shakti Sahoo',
    publishDate: '2026-06-29',
    coverImageUrl: 'https://images.unsplash.com/photo-1450622238302-a223f43d35fc?auto=format&fit=crop&w=600&q=80',
    content: 'Coastal luxury requires absolute precision in design and private beach club access.',
    status: 'Draft'
  }
];

let STORIES = [
  {
    id: 'story-1',
    customerName: 'Anand Kapoor',
    location: 'Scottsdale Villa Guest',
    content: 'Finding rental homes that accommodate specialized dietary needs and custom concierge dining is challenging. Kaizen curated a flawless family experience for us in Scottsdale. The absolute gold standard.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    featured: true
  },
  {
    id: 'story-2',
    customerName: 'Marcus Roberts',
    location: 'Pensacola Retreat Guest',
    content: 'Kaizen handles designer styling, 24/7 guest check-ins, and bespoke concierge requests effortlessly. Highly recommend their collection.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    featured: true
  },
  {
    id: 'story-3',
    customerName: 'Priya Sharma',
    location: 'Puri Beachfront Guest',
    content: 'The sea view from the villa was magnificent and the 24/7 concierge service made our holiday memorable!',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    featured: false
  }
];

let PLATFORM_SETTINGS = {
  commissionRatePercent: 8.5,
  maintenanceMode: false,
  autoApproveLeases: true,
  requireCglInsurance: true,
  stripePublicKey: 'pk_test_51KaizenRealEstateKeyExample',
  contactEmail: 'concierge@kaizenestates.com',
  globalNotificationBanner: 'New Luxury Villas Added in Puri and Scottsdale - Special Summer Rates Active!'
};

// Initial deals mock dataset for backend server search
let BACKEND_DEALS = [
  {
    id: 'deal-1',
    title: 'Coastal Retreat',
    location: 'Pensacola, FL',
    bedsBaths: '3 bed, 2 bath',
    squareFeet: '1,300',
    furnished: 'Yes',
    monthlyRent: '$2,200',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$55,683',
    estOccupancy: '68%',
    adr: '$215',
    securityDeposit: '$4,400',
    concessions: '1st month free',
    availability: 'ASAP',
    estNetMonthlyProfit: '~$1,700',
    totalCashToStart: '$9,400',
    specialRequirements: 'CGL insurance + COI',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'AVAILABLE',
    description: 'Perfect short-term rental opportunity in a high-demand coastal pocket of Pensacola. Fully turnkey with pool access, private patio, and designer interiors.',
    listings: [
      { platform: 'Airbnb', url: 'https://www.airbnb.com/rooms/12345678', isActive: true },
      { platform: 'Vrbo', url: 'https://www.vrbo.com/98765432', isActive: true },
      { platform: 'Booking.com', url: 'https://www.booking.com/hotel/us/coastal-retreat-pensacola.html', isActive: true }
    ]
  },
  {
    id: 'deal-2',
    title: 'The Desert Oasis',
    location: 'Scottsdale, AZ',
    bedsBaths: '4 bed, 3 bath',
    squareFeet: '2,100',
    furnished: 'Yes',
    monthlyRent: '$3,800',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$82,100',
    estOccupancy: '72%',
    adr: '$312',
    securityDeposit: '$5,000',
    concessions: 'None',
    availability: 'Aug 1, 2026',
    estNetMonthlyProfit: '~$2,450',
    totalCashToStart: '$14,200',
    specialRequirements: 'Corporate lease addendum',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'AVAILABLE',
    description: 'Stunning property with a private heated pool area, located in Scottsdale\'s premier leisure district. High demand during peak golf & spring season.',
    listings: [
      { platform: 'Airbnb', url: 'https://www.airbnb.com/rooms/23456789', isActive: true },
      { platform: 'Direct Website', url: 'https://www.kaizenstays.com/scottsdale-oasis', isActive: true }
    ]
  },
  {
    id: 'deal-3',
    title: 'Midcentury Alpine Cabin',
    location: 'Blue Ridge, GA',
    bedsBaths: '2 bed, 2 bath',
    squareFeet: '1,150',
    furnished: 'Yes',
    monthlyRent: '$1,850',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$48,200',
    estOccupancy: '65%',
    adr: '$195',
    securityDeposit: '$3,700',
    concessions: 'Half off security deposit',
    availability: 'ASAP',
    estNetMonthlyProfit: '~$1,350',
    totalCashToStart: '$7,400',
    specialRequirements: 'None',
    imageUrl: 'https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1508333706533-1ab43ecb1606?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'AVAILABLE',
    description: 'A cozy mountain retreat experiencing high weekend occupancy. Fire pit, hot tub, and panoramic forest views.',
    listings: [
      { platform: 'Airbnb', url: 'https://www.airbnb.com/rooms/34567890', isActive: true },
      { platform: 'Vrbo', url: 'https://www.vrbo.com/87654321', isActive: true }
    ]
  },
  {
    id: 'deal-4',
    title: 'Puri Beachfront Haven',
    location: 'Puri, Odisha',
    bedsBaths: '3 bed, 3 bath',
    squareFeet: '1,800',
    furnished: 'Yes',
    monthlyRent: '$1,950',
    leaseTerm: '12 months',
    projectedAnnualRevenue: '$52,000',
    estOccupancy: '75%',
    adr: '$180',
    securityDeposit: '$3,900',
    concessions: 'Free WiFi setup',
    availability: 'ASAP',
    estNetMonthlyProfit: '~$1,600',
    totalCashToStart: '$8,200',
    specialRequirements: 'Coastal clearance certification',
    imageUrl: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'
    ],
    status: 'AVAILABLE',
    description: 'Serene coastal villa near Puri beach with golden sands view and cultural heritage access.',
    listings: [
      { platform: 'Airbnb', url: 'https://www.airbnb.com/rooms/45678901', isActive: true }
    ]
  }
];

// Auth middleware helper
function getUserIdFromReq(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  return TOKENS[token] || null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // 1. AUTHENTICATION & PROFILE SERVICES
  app.post("/api/login/", (req, res) => {
    const { email = '', username = '', password = '' } = req.body || {};
    const inputUser = (email || username || '').trim().toLowerCase();
    const isHardcodedAdmin = (inputUser === 'admin' || inputUser === 'admin@kaizen.com') && (password === 'admin123' || password === 'kaizen2026' || password === 'admin');
    const isAdmin = isHardcodedAdmin || inputUser.includes('admin');
    const userEmail = isAdmin ? 'admin@kaizen.com' : (inputUser.includes('@') ? inputUser : `${inputUser || 'shaktisahoo24'}@gmail.com`);
    
    // Find or create user
    let userId = Object.keys(BACKEND_USERS).find(id => 
      BACKEND_USERS[id].email.toLowerCase() === userEmail || (isAdmin && BACKEND_USERS[id].role === 'ADMIN')
    );

    if (!userId) {
      userId = isAdmin ? 'usr_admin' : `usr_${Date.now()}`;
      BACKEND_USERS[userId] = {
        id: userId,
        email: userEmail,
        name: isAdmin ? 'Admin User' : (userEmail.split('@')[0].replace('.', ' ') || 'Kaizen Member'),
        role: isAdmin ? 'ADMIN' : 'CUSTOMER',
        is_staff: isAdmin,
        is_superuser: isAdmin,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userEmail)}`,
        company: isAdmin ? 'Kaizen Corporate HQ' : 'Turnkey Member',
        phone: '+1 (555) 019-2831'
      };
      USER_FAVORITES[userId] = [];
      USER_BOOKINGS[userId] = [];
    } else {
      // Ensure role flags align
      if (isAdmin) {
        BACKEND_USERS[userId].role = 'ADMIN';
        BACKEND_USERS[userId].is_staff = true;
        BACKEND_USERS[userId].is_superuser = true;
        BACKEND_USERS[userId].email = 'admin@kaizen.com';
      }
    }

    const token = `jwt_kaizen_${Date.now()}_${userId}`;
    TOKENS[token] = userId;

    res.json({
      success: true,
      token,
      user: BACKEND_USERS[userId]
    });
  });

  app.post("/api/logout/", (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      delete TOKENS[token];
    }
    res.json({ success: true, message: "Logged out successfully" });
  });

  app.get("/api/me/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId || !BACKEND_USERS[userId]) {
      return res.status(401).json({ error: "Unauthorized or token expired" });
    }
    res.json({ user: BACKEND_USERS[userId] });
  });

  app.patch("/api/me/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId || !BACKEND_USERS[userId]) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    BACKEND_USERS[userId] = { ...BACKEND_USERS[userId], ...req.body };
    res.json({ success: true, user: BACKEND_USERS[userId] });
  });

  // 2. PROPERTY & DISCOVERY SERVICES
  app.get("/api/properties/", (req, res) => {
    const location = (req.query.location as string || '').toLowerCase();
    const status = (req.query.status as string || 'ALL');

    const filtered = BACKEND_DEALS.filter(deal => {
      const locMatch = !location || deal.location.toLowerCase().includes(location) || deal.title.toLowerCase().includes(location);
      const statusMatch = status === 'ALL' || deal.status === status;
      return locMatch && statusMatch;
    });

    res.json({
      count: filtered.length,
      results: filtered,
      deals: filtered
    });
  });

  app.get("/api/properties/:pk/", (req, res) => {
    const deal = BACKEND_DEALS.find(d => d.id === req.params.pk);
    if (!deal) {
      return res.status(404).json({ error: "Property not found" });
    }
    res.json(deal);
  });

  app.post("/api/properties/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Admin privileges required" });
    }

    const newDeal = {
      id: `deal-${Date.now()}`,
      title: req.body.title || 'New Luxury Villa',
      location: req.body.location || 'Miami, FL',
      bedsBaths: req.body.bedsBaths || '3 bed, 2 bath',
      squareFeet: req.body.squareFeet || '1,500',
      furnished: req.body.furnished || 'Yes',
      monthlyRent: req.body.monthlyRent || '$2,500',
      leaseTerm: req.body.leaseTerm || '12 months',
      projectedAnnualRevenue: req.body.projectedAnnualRevenue || '$60,000',
      estOccupancy: req.body.estOccupancy || '70%',
      adr: req.body.adr || '$220',
      securityDeposit: req.body.securityDeposit || '$5,000',
      concessions: req.body.concessions || 'None',
      availability: 'ASAP',
      estNetMonthlyProfit: req.body.estNetMonthlyProfit || '~$1,800',
      totalCashToStart: req.body.totalCashToStart || '$10,000',
      specialRequirements: 'Standard Lease',
      imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      images: [req.body.imageUrl || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'],
      status: 'AVAILABLE',
      description: req.body.description || 'Newly created property listing on Kaizen.',
      listings: []
    };

    BACKEND_DEALS.unshift(newDeal);
    res.json({ success: true, property: newDeal });
  });

  // SEARCH API ENDPOINT (Existing & expanded)
  app.post("/api/properties/search", (req, res) => {
    const { location = '', statusFilter = 'ALL' } = req.body || {};
    
    setTimeout(() => {
      const locQuery = (location || '').toLowerCase().trim();

      const filtered = BACKEND_DEALS.filter((deal) => {
        const matchesLoc = !locQuery || 
          deal.location.toLowerCase().includes(locQuery) ||
          deal.title.toLowerCase().includes(locQuery) ||
          deal.description.toLowerCase().includes(locQuery);

        const matchesStatus = statusFilter === 'ALL' || deal.status === statusFilter;
        return matchesLoc && matchesStatus;
      });

      res.json({
        success: true,
        query: req.body,
        count: filtered.length,
        deals: filtered
      });
    }, 350);
  });

  // 3. FAVORITES SERVICE
  app.get("/api/me/favorites/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const favIds = USER_FAVORITES[userId] || [];
    const favProperties = BACKEND_DEALS.filter(d => favIds.includes(d.id));
    res.json({
      favoriteIds: favIds,
      favorites: favProperties
    });
  });

  app.post("/api/properties/:property_id/favorite/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const propId = req.params.property_id;
    if (!USER_FAVORITES[userId]) USER_FAVORITES[userId] = [];
    if (!USER_FAVORITES[userId].includes(propId)) {
      USER_FAVORITES[userId].push(propId);
    }
    res.json({ success: true, favoriteIds: USER_FAVORITES[userId] });
  });

  app.delete("/api/properties/:property_id/favorite/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const propId = req.params.property_id;
    if (USER_FAVORITES[userId]) {
      USER_FAVORITES[userId] = USER_FAVORITES[userId].filter(id => id !== propId);
    }
    res.json({ success: true, favoriteIds: USER_FAVORITES[userId] || [] });
  });

  // 4. BOOKING & TRANSACTION SERVICE ("LOCK & PURCHASE" FLOW)
  app.post("/api/properties/:property_id/lock/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: Please login to lock properties" });
    }
    const propId = req.params.property_id;
    const deal = BACKEND_DEALS.find(d => d.id === propId);
    if (!deal) {
      return res.status(404).json({ error: "Property not found" });
    }

    const bookingId = `bk_${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 60 * 1000); // 15 min lock duration

    const bookingRecord = {
      bookingId,
      propertyId: deal.id,
      propertyTitle: deal.title,
      location: deal.location,
      monthlyRent: deal.monthlyRent,
      securityDeposit: deal.securityDeposit,
      status: 'LOCKED',
      lockedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      lockDurationSeconds: 900
    };

    if (!USER_BOOKINGS[userId]) USER_BOOKINGS[userId] = [];
    USER_BOOKINGS[userId].unshift(bookingRecord);

    // Temporarily mark deal status as UNDER REVIEW
    deal.status = 'UNDER REVIEW';

    res.json({
      success: true,
      booking: bookingRecord
    });
  });

  app.post("/api/bookings/:booking_id/purchase/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const bookingId = req.params.booking_id;
    const bookings = USER_BOOKINGS[userId] || [];
    const booking = bookings.find(b => b.bookingId === bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking session not found" });
    }

    booking.status = 'PURCHASED';
    booking.purchasedAt = new Date().toISOString();
    booking.transactionHash = `tx_kaizen_${Math.random().toString(36).substring(2, 11)}`;

    // Update property status permanently to UNDER CONTRACT
    const deal = BACKEND_DEALS.find(d => d.id === booking.propertyId);
    if (deal) {
      deal.status = 'UNDER CONTRACT';
    }

    res.json({
      success: true,
      booking,
      message: "Property lease successfully secured!"
    });
  });

  app.post("/api/bookings/:booking_id/cancel/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const bookingId = req.params.booking_id;
    const bookings = USER_BOOKINGS[userId] || [];
    const booking = bookings.find(b => b.bookingId === bookingId);

    if (!booking) {
      return res.status(404).json({ error: "Booking session not found" });
    }

    booking.status = 'CANCELLED';

    // Revert deal status to AVAILABLE
    const deal = BACKEND_DEALS.find(d => d.id === booking.propertyId);
    if (deal && deal.status === 'UNDER REVIEW') {
      deal.status = 'AVAILABLE';
    }

    res.json({
      success: true,
      booking,
      message: "Property lock cancelled"
    });
  });

  app.get("/api/me/bookings/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({
      bookings: USER_BOOKINGS[userId] || []
    });
  });

  // 5. DASHBOARD & LEAD SERVICES
  app.get("/api/me/dashboard/", (req, res) => {
    const userId = getUserIdFromReq(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const bookings = USER_BOOKINGS[userId] || [];
    const favs = USER_FAVORITES[userId] || [];

    res.json({
      user: BACKEND_USERS[userId],
      stats: {
        activeLeases: bookings.filter(b => b.status === 'PURCHASED').length,
        savedFavorites: favs.length,
        pendingLocks: bookings.filter(b => b.status === 'LOCKED').length,
        projectedMonthlyProfit: `$${(bookings.filter(b => b.status === 'PURCHASED').length * 1800).toLocaleString()}`,
        portfolioValue: `$${((bookings.filter(b => b.status === 'PURCHASED').length + 1) * 450000).toLocaleString()}`
      },
      recentBookings: bookings
    });
  });

  app.get("/api/me/summary/", (req, res) => {
    res.json({
      totalPropertiesAvailable: BACKEND_DEALS.filter(d => d.status === 'AVAILABLE').length,
      averageYield: '19.2%',
      platformUptime: '99.98%',
      activeInvestors: 1420
    });
  });

  app.post("/api/leads/", (req, res) => {
    const { name, email, phone, message, propertyId, type = 'GENERAL' } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const lead = {
      id: `lead_${Date.now()}`,
      name,
      email,
      phone: phone || '',
      message: message || '',
      propertyId: propertyId || null,
      type,
      createdAt: new Date().toISOString()
    };

    LEADS.push(lead);

    res.json({
      success: true,
      leadId: lead.id,
      message: "Lead inquiry submitted successfully to Kaizen platform."
    });
  });

  app.get("/api/leads/", (_req, res) => {
    res.json({ count: LEADS.length, leads: LEADS });
  });

  app.delete("/api/leads/:id/", (req, res) => {
    const leadId = req.params.id;
    const idx = LEADS.findIndex(l => l.id === leadId);
    if (idx !== -1) {
      LEADS.splice(idx, 1);
    }
    res.json({ success: true, message: "Lead removed" });
  });

  // 6. BLOG MANAGEMENT APIs
  app.get("/api/blogs/", (_req, res) => {
    res.json({ blogs: BLOGS });
  });

  app.post("/api/blogs/", (req, res) => {
    const { title, slug, author, coverImageUrl, content, status } = req.body || {};
    const newBlog = {
      id: `blog-${Date.now()}`,
      title: title || 'Untitled Post',
      slug: slug || (title || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      author: author || 'Kaizen Admin',
      publishDate: new Date().toISOString().split('T')[0],
      coverImageUrl: coverImageUrl || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      content: content || '',
      status: status || 'Published'
    };
    BLOGS.unshift(newBlog);
    res.json({ success: true, blog: newBlog });
  });

  app.put("/api/blogs/:id/", (req, res) => {
    const id = req.params.id;
    const idx = BLOGS.findIndex(b => b.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    BLOGS[idx] = { ...BLOGS[idx], ...req.body };
    res.json({ success: true, blog: BLOGS[idx] });
  });

  app.delete("/api/blogs/:id/", (req, res) => {
    const id = req.params.id;
    BLOGS = BLOGS.filter(b => b.id !== id);
    res.json({ success: true, message: "Blog post deleted" });
  });

  // 7. STORY / TESTIMONIAL MANAGEMENT APIs
  app.get("/api/stories/", (_req, res) => {
    res.json({ stories: STORIES });
  });

  app.post("/api/stories/", (req, res) => {
    const { customerName, location, content, imageUrl, featured } = req.body || {};
    const newStory = {
      id: `story-${Date.now()}`,
      customerName: customerName || 'Valued Guest',
      location: location || 'Kaizen Luxury Villa',
      content: content || '',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      featured: featured !== undefined ? featured : true
    };
    STORIES.unshift(newStory);
    res.json({ success: true, story: newStory });
  });

  app.put("/api/stories/:id/", (req, res) => {
    const id = req.params.id;
    const idx = STORIES.findIndex(s => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: "Story not found" });
    }
    STORIES[idx] = { ...STORIES[idx], ...req.body };
    res.json({ success: true, story: STORIES[idx] });
  });

  app.delete("/api/stories/:id/", (req, res) => {
    const id = req.params.id;
    STORIES = STORIES.filter(s => s.id !== id);
    res.json({ success: true, message: "Story deleted" });
  });

  // 8. PLATFORM SETTINGS APIs
  app.get("/api/settings/", (_req, res) => {
    res.json({ settings: PLATFORM_SETTINGS });
  });

  app.post("/api/settings/", (req, res) => {
    PLATFORM_SETTINGS = { ...PLATFORM_SETTINGS, ...req.body };
    res.json({ success: true, settings: PLATFORM_SETTINGS });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
