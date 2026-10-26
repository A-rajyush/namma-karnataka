import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  KARNATAKA_DESTINATIONS,
  TravelBudget,
  TravelDuration,
  TravelInterest,
  TravelPartner,
  TransportationMode,
  AccommodationStyle,
} from './src/data/karnatakaData';
import {
  GeneratedItinerary,
  generateSmartItinerary,
  PlannerInput,
  UserPreferences,
  validateAuthInput,
} from './src/utils/plannerEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

export interface TravelHistoryEntry {
  id: string;
  destinationId: string;
  destinationName: string;
  visitedDate: string;
  durationDays: number;
  rating: number;
  notes: string;
  totalSpentINR: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarInitials: string;
  memberSince: string;
  tier: string;
  preferences: UserPreferences;
  savedItineraries: GeneratedItinerary[];
  travelHistory: TravelHistoryEntry[];
}

// Seed initial itinerary for the default user
const initialSeedItinerary = generateSmartItinerary({
  duration: '5 Days',
  budget: 'Premium',
  interests: ['Heritage', 'Coffee Plantations', 'Waterfalls', 'Food'],
  partner: 'Couple',
  transport: 'Car',
  accommodation: 'Resort',
  travelMonth: 'October',
  routeMode: 'scenic',
});

const usersStore = new Map<string, UserAccount>();
const demoUser: UserAccount = {
  id: 'usr-aarav-01',
  name: 'Aarav Rao',
  email: 'aarav.rao@karnataka.in',
  passwordHash: 'karnataka2026',
  avatarInitials: 'AR',
  memberSince: 'January 2025',
  tier: 'Royal Chalukya Explorer',
  preferences: {
    bookmarkedDestinationIds: ['hampi', 'coorg', 'gokarna', 'agumbe'],
    previousTripDestinationIds: ['mysuru', 'chikmagalur', 'kabini'],
    preferredBudget: 'Premium',
    preferredInterests: ['Heritage', 'Coffee Plantations', 'Waterfalls', 'Photography', 'Food'],
    preferredAccommodation: 'Resort',
  },
  savedItineraries: [initialSeedItinerary],
  travelHistory: [
    {
      id: 'hist-1',
      destinationId: 'mysuru',
      destinationName: 'Mysuru',
      visitedDate: '2025-10-14',
      durationDays: 3,
      rating: 5,
      notes: 'Witnessed the 97,000-bulb Amba Vilas Palace illumination during Nada Habba Dasara and savored Mylari Dosa at dawn.',
      totalSpentINR: 28500,
    },
    {
      id: 'hist-2',
      destinationId: 'chikmagalur',
      destinationName: 'Chikmagalur',
      visitedDate: '2026-01-19',
      durationDays: 4,
      rating: 5,
      notes: 'Summited Mullayanagiri at 6:00 AM above a sea of clouds and toured a 130-year-old Arabica estate.',
      totalSpentINR: 34200,
    },
    {
      id: 'hist-3',
      destinationId: 'kabini',
      destinationName: 'Kabini & Nagarhole',
      visitedDate: '2026-04-08',
      durationDays: 3,
      rating: 5,
      notes: 'Spotted a herd of 45 Asiatic elephants swimming across the Kabini backwaters and a leopard in Dammanakatte.',
      totalSpentINR: 52000,
    },
  ],
};

usersStore.set(demoUser.email, demoUser);
let activeSessionEmail: string | null = demoUser.email;

function sanitizeUser(user: UserAccount) {
  const { passwordHash: _pw, ...safeUser } = user;
  return safeUser;
}

// Weather cache (destinationId -> weather object)
export interface DayForecast {
  date: string;
  dayLabel: string;
  tempMaxC: number;
  tempMinC: number;
  rainChancePct: number;
  condition: string;
}

export interface DestinationWeather {
  destinationId: string;
  destinationName: string;
  currentTempC: number;
  humidityPct: number;
  windKmh: number;
  condition: string;
  uvAdvisory: string;
  updatedAt: string;
  source: 'open-meteo-live' | 'meteorological-baseline';
  forecast: DayForecast[];
}

const weatherCache = new Map<string, { timestamp: number; data: DestinationWeather }>();

function mapWmoCodeToLabel(code: number): string {
  if (code === 0) return 'Clear Golden Sky';
  if (code === 1 || code === 2) return 'Partly Crisp & Sunny';
  if (code === 3) return 'Highland Cloud Canopy';
  if (code >= 45 && code <= 48) return 'Misty Ghat Fog';
  if (code >= 51 && code <= 67) return 'Refreshing Malnad Showers';
  if (code >= 80 && code <= 82) return 'Tropical Passing Rain';
  if (code >= 95) return 'Monsoon Thunder & Mist';
  return 'Pleasant Breeze';
}

function buildBaselineWeather(destId: string): DestinationWeather {
  const dest = KARNATAKA_DESTINATIONS.find((d) => d.id === destId) || KARNATAKA_DESTINATIONS[0];
  const elevTempAdjust = Math.round((dest.elevationMeters - 500) * -0.0055);
  const baseTemp =
    dest.region === 'Karavali Coast'
      ? 30
      : dest.region === 'Deccan Heritage'
      ? 29
      : 24 + elevTempAdjust;

  const condition =
    dest.id === 'agumbe' || dest.id === 'jog-falls'
      ? 'Misty Rainforest Breeze'
      : dest.region === 'Western Ghats & Malnad'
      ? 'Cool Highland Mist'
      : dest.region === 'Karavali Coast'
      ? 'Warm Sea Breeze'
      : 'Clear Golden Sunshine';

  const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
  const forecast: DayForecast[] = dayNames.map((label, idx) => {
    const d = new Date(Date.now() + idx * 86400000);
    return {
      date: d.toISOString().slice(0, 10),
      dayLabel: label,
      tempMaxC: baseTemp + ((idx % 3) - 1),
      tempMinC: baseTemp - 7 + (idx % 2),
      rainChancePct: dest.region === 'Western Ghats & Malnad' ? 25 + idx * 5 : 10 + idx * 3,
      condition,
    };
  });

  return {
    destinationId: dest.id,
    destinationName: dest.name,
    currentTempC: baseTemp,
    humidityPct: dest.region === 'Karavali Coast' ? 76 : dest.region === 'Western Ghats & Malnad' ? 72 : 48,
    windKmh: 12 + (dest.elevationMeters % 9),
    condition,
    uvAdvisory: baseTemp >= 28 ? 'Moderate-High UV (Carry sun protection)' : 'Mild Highland UV',
    updatedAt: new Date().toISOString(),
    source: 'meteorological-baseline',
    forecast,
  };
}

async function fetchLiveWeatherForDestination(destId: string): Promise<DestinationWeather> {
  const cached = weatherCache.get(destId);
  if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
    return cached.data;
  }

  const dest = KARNATAKA_DESTINATIONS.find((d) => d.id === destId);
  if (!dest) return buildBaselineWeather('hampi');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${dest.lat}&longitude=${dest.lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata&forecast_days=5`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP ${res.status}`);
    }

    const json = (await res.json()) as any;
    const currentTempC = Math.round(json.current?.temperature_2m ?? 26);
    const humidityPct = Math.round(json.current?.relative_humidity_2m ?? 62);
    const windKmh = Math.round(json.current?.wind_speed_10m ?? 11);
    const condition = mapWmoCodeToLabel(json.current?.weather_code ?? 1);

    const times: string[] = json.daily?.time || [];
    const maxTemps: number[] = json.daily?.temperature_2m_max || [];
    const minTemps: number[] = json.daily?.temperature_2m_min || [];
    const rainProbs: number[] = json.daily?.precipitation_probability_max || [];
    const codes: number[] = json.daily?.weather_code || [];

    const dayLabels = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
    const forecast: DayForecast[] = times.slice(0, 5).map((dateStr, i) => ({
      date: dateStr,
      dayLabel: dayLabels[i] || dateStr,
      tempMaxC: Math.round(maxTemps[i] ?? currentTempC + 2),
      tempMinC: Math.round(minTemps[i] ?? currentTempC - 6),
      rainChancePct: Math.round(rainProbs[i] ?? 15),
      condition: mapWmoCodeToLabel(codes[i] ?? 1),
    }));

    const weatherData: DestinationWeather = {
      destinationId: dest.id,
      destinationName: dest.name,
      currentTempC,
      humidityPct,
      windKmh,
      condition,
      uvAdvisory:
        currentTempC >= 28 ? 'High Midday Sun — Ideal sight-seeing 6–11 AM & 4–6 PM' : 'Crisp Highland Comfort',
      updatedAt: new Date().toISOString(),
      source: 'open-meteo-live',
      forecast: forecast.length > 0 ? forecast : buildBaselineWeather(destId).forecast,
    };

    weatherCache.set(destId, { timestamp: Date.now(), data: weatherData });
    return weatherData;
  } catch {
    const fallback = buildBaselineWeather(destId);
    weatherCache.set(destId, { timestamp: Date.now(), data: fallback });
    return fallback;
  }
}

function parseNaturalLanguageToPlannerInput(message: string): {
  reply: string;
  suggestedInput: PlannerInput;
} {
  const lower = message.toLowerCase();

  let duration: TravelDuration = '5 Days';
  if (lower.includes('weekend') || lower.includes('2 day') || lower.includes('2-day')) duration = 'Weekend';
  else if (lower.includes('3 day') || lower.includes('3-day')) duration = '3 Days';
  else if (lower.includes('7 day') || lower.includes('7-day') || lower.includes('week')) duration = '7 Days';
  else if (lower.includes('10') || lower.includes('long')) duration = '10+ Days';

  let budget: TravelBudget = 'Premium';
  if (lower.includes('luxury') || lower.includes('honeymoon') || lower.includes('palace') || lower.includes('5 star')) {
    budget = 'Luxury';
  } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('backpack')) {
    budget = 'Budget';
  } else if (lower.includes('mid')) {
    budget = 'Mid-range';
  }

  let partner: TravelPartner = 'Couple';
  if (lower.includes('solo') || lower.includes('alone')) partner = 'Solo';
  else if (lower.includes('family') || lower.includes('kids') || lower.includes('parents')) partner = 'Family';
  else if (lower.includes('senior') || lower.includes('elder')) partner = 'Senior Citizens';
  else if (lower.includes('friend') || lower.includes('group')) partner = 'Friends';

  const interests: TravelInterest[] = [];
  if (lower.includes('trek') || lower.includes('hike') || lower.includes('peak') || lower.includes('kudremukh')) {
    interests.push('Trekking', 'Adventure', 'Nature');
  }
  if (lower.includes('waterfall') || lower.includes('chikmagalur') || lower.includes('jog') || lower.includes('agumbe')) {
    interests.push('Waterfalls', 'Coffee Plantations', 'Hill Stations');
  }
  if (lower.includes('honeymoon') || lower.includes('coorg') || lower.includes('romantic') || lower.includes('coffee')) {
    interests.push('Coffee Plantations', 'Hill Stations', 'Nature', 'Food');
  }
  if (lower.includes('beach') || lower.includes('gokarna') || lower.includes('udupi') || lower.includes('coast')) {
    interests.push('Beaches', 'Photography', 'Food');
  }
  if (lower.includes('temple') || lower.includes('hampi') || lower.includes('heritage') || lower.includes('badami') || lower.includes('mysuru')) {
    interests.push('Heritage', 'Culture', 'Spiritual', 'Photography');
  }
  if (lower.includes('safari') || lower.includes('tiger') || lower.includes('kabini') || lower.includes('wildlife')) {
    interests.push('Wildlife', 'Photography', 'Nature');
  }

  if (interests.length === 0) {
    interests.push('Heritage', 'Coffee Plantations', 'Waterfalls', 'Food');
  }

  const uniqueInterests = Array.from(new Set(interests));
  const accommodation: AccommodationStyle =
    budget === 'Luxury'
      ? 'Luxury Stay'
      : budget === 'Budget'
      ? 'Hostel'
      : uniqueInterests.includes('Coffee Plantations')
      ? 'Homestay'
      : 'Resort';

  const transport: TransportationMode =
    budget === 'Budget' && partner === 'Solo' ? 'Bike' : 'Car';

  const suggestedInput: PlannerInput = {
    duration,
    budget,
    interests: uniqueInterests,
    partner,
    transport,
    accommodation,
    travelMonth: 'November',
    routeMode: 'scenic',
  };

  const previewItinerary = generateSmartItinerary(suggestedInput);
  const stopsText = previewItinerary.selectedDestinations.map((d) => d.name).join(' → ');

  let reply = `I have crafted a bespoke **${duration} ${budget}** Karnataka itinerary for a **${partner}** journey along the **${stopsText}** corridor. `;

  if (lower.includes('waterfall') || lower.includes('chikmagalur')) {
    reply += `For hidden waterfalls near Chikmagalur & Malnad, I've prioritized **Jhari (Buttermilk) Falls**, **Hebbe Falls (168m)** inside Kemmanagundi, and **Onake Abbi / Jogi Gundi** in Agumbe, paired with 17th-century Arabica estate stays.`;
  } else if (lower.includes('honeymoon') || lower.includes('coorg')) {
    reply += `This romantic highland route pairs private rain-forest pool villas in **Coorg** and **Kabini** with dawn Mandalpatti cloud views, candlelit Kodava estate dinners, and sunset boat safaris.`;
  } else if (lower.includes('trek')) {
    reply += `This high-ridge adventure links **Kudremukh Peak (1,892m)**, **Mullayanagiri (1,930m)**, and the **Gokarna 5-Beach coastal cliff trail** with forest permit guidance and elevation telemetry.`;
  } else {
    reply += `It balances iconic architectural wonders with misty Western Ghats plantations, complete with daily wake-up times, regional culinary stops, and budget optimization (₹${previewItinerary.budgetBreakdown.totalTripCost.toLocaleString('en-IN')} total).`;
  }

  return { reply, suggestedInput };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // --- AUTH.JS STYLE ENDPOINTS ---
  app.get('/api/auth/session', (_req, res) => {
    if (!activeSessionEmail || !usersStore.has(activeSessionEmail)) {
      res.json({ authenticated: false, user: null });
      return;
    }
    const user = usersStore.get(activeSessionEmail)!;
    res.json({ authenticated: true, user: sanitizeUser(user) });
  });

  app.post('/api/auth/signin', (req, res) => {
    const { email, password } = req.body || {};
    const validation = validateAuthInput(email || '', password || '', 'Traveler', false);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user = usersStore.get(normalizedEmail);

    if (!user) {
      // Create account on first sign-in for smooth demo experience if valid credentials provided
      const nameFromEmail = normalizedEmail
        .split('@')[0]
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      user = {
        id: `usr-${Date.now()}`,
        name: nameFromEmail,
        email: normalizedEmail,
        passwordHash: password,
        avatarInitials: nameFromEmail
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        memberSince: 'October 2026',
        tier: 'Hoysala Voyager',
        preferences: {
          bookmarkedDestinationIds: ['hampi', 'coorg'],
          previousTripDestinationIds: ['mysuru'],
          preferredBudget: 'Mid-range',
          preferredInterests: ['Heritage', 'Nature', 'Food'],
          preferredAccommodation: 'Homestay',
        },
        savedItineraries: [initialSeedItinerary],
        travelHistory: [...demoUser.travelHistory],
      };
      usersStore.set(normalizedEmail, user);
    }

    activeSessionEmail = normalizedEmail;
    res.json({ authenticated: true, user: sanitizeUser(user) });
  });

  app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, preferredInterests, preferredBudget } = req.body || {};
    const validation = validateAuthInput(email || '', password || '', name || '', true);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanName = String(name).trim();
    const initials = cleanName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: normalizedEmail,
      passwordHash: password,
      avatarInitials: initials || 'NK',
      memberSince: 'October 2026',
      tier: 'Vijayanagara Explorer',
      preferences: {
        bookmarkedDestinationIds: ['hampi', 'coorg', 'gokarna'],
        previousTripDestinationIds: [],
        preferredBudget: (preferredBudget as TravelBudget) || 'Premium',
        preferredInterests: Array.isArray(preferredInterests) && preferredInterests.length > 0
          ? preferredInterests
          : ['Heritage', 'Coffee Plantations', 'Nature'],
        preferredAccommodation: 'Resort',
      },
      savedItineraries: [initialSeedItinerary],
      travelHistory: [],
    };

    usersStore.set(normalizedEmail, newUser);
    activeSessionEmail = normalizedEmail;
    res.json({ authenticated: true, user: sanitizeUser(newUser) });
  });

  app.post('/api/auth/signout', (_req, res) => {
    activeSessionEmail = null;
    res.json({ authenticated: false, user: null });
  });

  // --- USER PREFERENCES, SAVED ITINERARIES & TRAVEL HISTORY ---
  app.post('/api/user/preferences', (req, res) => {
    const email = activeSessionEmail || demoUser.email;
    const user = usersStore.get(email) || demoUser;
    const {
      bookmarkedDestinationIds,
      preferredBudget,
      preferredInterests,
      preferredAccommodation,
    } = req.body || {};

    if (Array.isArray(bookmarkedDestinationIds)) {
      user.preferences.bookmarkedDestinationIds = bookmarkedDestinationIds;
    }
    if (preferredBudget) {
      user.preferences.preferredBudget = preferredBudget;
    }
    if (Array.isArray(preferredInterests)) {
      user.preferences.preferredInterests = preferredInterests;
    }
    if (preferredAccommodation) {
      user.preferences.preferredAccommodation = preferredAccommodation;
    }

    activeSessionEmail = user.email;
    res.json({ user: sanitizeUser(user) });
  });

  app.post('/api/user/itineraries', (req, res) => {
    const email = activeSessionEmail || demoUser.email;
    const user = usersStore.get(email) || demoUser;
    const itinerary = req.body?.itinerary as GeneratedItinerary;
    if (!itinerary || !itinerary.id) {
      res.status(400).json({ error: 'Valid itinerary object is required.' });
      return;
    }

    const existsIdx = user.savedItineraries.findIndex((i) => i.id === itinerary.id);
    if (existsIdx >= 0) {
      user.savedItineraries[existsIdx] = itinerary;
    } else {
      user.savedItineraries.unshift(itinerary);
    }

    activeSessionEmail = user.email;
    res.json({ user: sanitizeUser(user) });
  });

  app.delete('/api/user/itineraries/:id', (req, res) => {
    const email = activeSessionEmail || demoUser.email;
    const user = usersStore.get(email) || demoUser;
    user.savedItineraries = user.savedItineraries.filter((i) => i.id !== req.params.id);
    res.json({ user: sanitizeUser(user) });
  });

  app.post('/api/user/history', (req, res) => {
    const email = activeSessionEmail || demoUser.email;
    const user = usersStore.get(email) || demoUser;
    const { destinationId, visitedDate, durationDays, rating, notes, totalSpentINR } = req.body || {};

    const dest = KARNATAKA_DESTINATIONS.find((d) => d.id === destinationId);
    if (!dest || !visitedDate) {
      res.status(400).json({ error: 'Destination and visited date are required.' });
      return;
    }

    const entry: TravelHistoryEntry = {
      id: `hist-${Date.now()}`,
      destinationId: dest.id,
      destinationName: dest.name,
      visitedDate: String(visitedDate),
      durationDays: Number(durationDays) || 3,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      notes: String(notes || `Explored ${dest.name} (${dest.region}).`),
      totalSpentINR: Number(totalSpentINR) || dest.baseDailyCostINR * 3,
    };

    user.travelHistory.unshift(entry);
    if (!user.preferences.previousTripDestinationIds.includes(dest.id)) {
      user.preferences.previousTripDestinationIds.push(dest.id);
    }

    activeSessionEmail = user.email;
    res.json({ user: sanitizeUser(user) });
  });

  // --- REAL-TIME WEATHER ENDPOINT ---
  app.get('/api/weather', async (req, res) => {
    const rawIds = String(req.query.ids || 'hampi,coorg,mysuru,gokarna,chikmagalur');
    const ids = rawIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);

    const results = await Promise.all(ids.map((id) => fetchLiveWeatherForDestination(id)));
    res.json({ weather: results });
  });

  // --- AI ITINERARY GENERATION ENDPOINT ---
  app.post('/api/ai/itinerary', async (req, res) => {
    const input = req.body?.input as PlannerInput;
    if (!input || !input.duration || !input.budget) {
      res.status(400).json({ error: 'Missing required planner inputs (duration, budget).' });
      return;
    }

    const email = activeSessionEmail || demoUser.email;
    const user = usersStore.get(email) || demoUser;
    const itinerary = generateSmartItinerary(input, user.preferences);

    if (ai) {
      try {
        const destNames = itinerary.selectedDestinations.map((d) => d.name).join(', ');
        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `Write a 2-sentence luxury editorial curator note for a ${itinerary.numDays}-day ${input.budget} Karnataka trip visiting ${destNames} for a ${input.partner} interested in ${input.interests.join(', ')}. Keep it evocative, specific to Karnataka's geography and heritage, and plain text.`,
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 500)),
        ]);
        if (response && response.text && response.text.trim().length > 20) {
          itinerary.aiPersonalizationNote = response.text.trim();
        }
      } catch {
        // Fallback already populated in itinerary.aiPersonalizationNote
      }
    }

    res.json({ itinerary });
  });

  // --- AI DESTINATION INTERACTIVE GUIDE INSIGHT ENDPOINT ---
  app.post('/api/ai/destination-guide', async (req, res) => {
    const { destinationId, userInterests, question } = req.body || {};
    const dest = KARNATAKA_DESTINATIONS.find((d) => d.id === destinationId);
    if (!dest) {
      res.status(404).json({ error: 'Destination not found.' });
      return;
    }

    const interestList = Array.isArray(userInterests) && userInterests.length > 0
      ? userInterests.join(', ')
      : dest.interests.join(', ');

    if (ai) {
      try {
        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `You are an expert Karnataka historian and luxury travel curator. Provide a concise 3-sentence personalized insider tip for ${dest.name} (${dest.region}) tailored to a traveler interested in ${interestList}. ${question ? `Specifically address: ${question}` : 'Focus on architectural secrets, local etiquette, and offbeat timing.'}`,
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 500)),
        ]);
        if (response && response.text && response.text.trim().length > 15) {
          res.json({
            destinationId: dest.id,
            aiCuratorInsight: response.text.trim(),
            source: 'gemini-3.8-flash',
          });
          return;
        }
      } catch {
        // Fall through to curated domain synthesis
      }
    }

    const synthesized = `${question ? `Regarding "${question}": ` : ''}For travelers passionate about ${interestList}, experience ${dest.name} at ${dest.guide.bestVisitingTimes.split(';')[0]} before day-trippers arrive. Pair the iconic ${dest.guide.photographySpots[0]} with an unhurried visit to ${dest.guide.hiddenAttractions[0]?.name} (${dest.guide.hiddenAttractions[0]?.description}), and conclude with authentic regional flavors at ${dest.guide.lunchSpot.split('—')[0].trim()}.`;

    res.json({
      destinationId: dest.id,
      aiCuratorInsight: synthesized,
      source: 'karnataka-curator-engine',
    });
  });

  // --- AI CONVERSATIONAL CONCIERGE ENDPOINT ---
  app.post('/api/ai/chat', async (req, res) => {
    const { message } = req.body || {};
    if (!message || !String(message).trim()) {
      res.status(400).json({ error: 'Please enter a message for the Karnataka AI Concierge.' });
      return;
    }

    const parsed = parseNaturalLanguageToPlannerInput(String(message));
    const email = activeSessionEmail || demoUser.email;
    const user = usersStore.get(email) || demoUser;
    const generatedItinerary = generateSmartItinerary(parsed.suggestedInput, user.preferences);

    let finalReply = parsed.reply.replace(/₹/g, 'INR ');
    if (ai) {
      try {
        const response = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `You are Namma Karnataka AI Concierge. The user asked: "${message}". We have prepared a ${generatedItinerary.numDays}-day ${generatedItinerary.input.budget} route visiting ${generatedItinerary.selectedDestinations.map((d) => d.name).join(' -> ')} (Estimated cost: INR ${generatedItinerary.budgetBreakdown.totalTripCost.toLocaleString('en-IN')}). Write a warm, authoritative, 3-4 sentence response highlighting the top 2 experiences, hidden gems, and local dishes on this route.`,
          }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 500)),
        ]);
        if (response && response.text && response.text.trim().length > 20) {
          finalReply = response.text.trim();
        }
      } catch {
        // Keep deterministic reply
      }
    }

    res.json({
      reply: finalReply,
      itinerary: generatedItinerary,
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Namma Karnataka Explorer server running on http://localhost:${PORT}`);
  });
}

startServer();
