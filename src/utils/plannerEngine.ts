import {
  AccommodationStyle,
  Destination,
  KARNATAKA_DESTINATIONS,
  KARNATAKA_FESTIVALS,
  KarnatakaFestival,
  RouteOptimizeMode,
  TransportationMode,
  TravelBudget,
  TravelDuration,
  TravelInterest,
  TravelPartner,
} from '../data/karnatakaData';

export interface PlannerInput {
  duration: TravelDuration;
  budget: TravelBudget;
  interests: TravelInterest[];
  partner: TravelPartner;
  transport: TransportationMode;
  accommodation: AccommodationStyle;
  travelMonth?: string;
  routeMode?: RouteOptimizeMode;
  startingCity?: string;
}

export interface UserPreferences {
  bookmarkedDestinationIds: string[];
  previousTripDestinationIds: string[];
  preferredBudget: TravelBudget;
  preferredInterests: TravelInterest[];
  preferredAccommodation: AccommodationStyle;
}

export interface DailyScheduleItem {
  day: number;
  title: string;
  destinationId: string;
  destinationName: string;
  region: string;
  elevationMeters: number;
  wakeUpRecommendation: string;
  breakfastSuggestion: string;
  sightseeingPlan: string;
  travelRouteInfo: string;
  distanceKmFromPrev: number;
  estimatedDriveHours: number;
  lunchRecommendation: string;
  afternoonActivities: string;
  eveningExperience: string;
  localFoodSuggestion: string;
  shoppingRecommendation: string;
}

export interface BudgetBreakdown {
  transportCost: number;
  accommodationCost: number;
  foodBudget: number;
  activityExpenses: number;
  totalTripCost: number;
  dailyAverage: number;
  perPersonEstimate: number;
  currency: 'INR';
  budgetTierNote: string;
}

export interface RouteMetrics {
  mode: RouteOptimizeMode;
  orderedDestinationIds: string[];
  totalDistanceKm: number;
  estimatedTotalDriveHours: number;
  scenicScore: number; // 1-100
  comfortScore: number; // 1-100
  elevationGainMeters: number;
  routeSummary: string;
}

export interface SmartRecommendations {
  bestSeason: string;
  weatherInsights: string;
  localEvents: string[];
  hiddenGems: { name: string; destinationName: string; description: string }[];
  offbeatPlaces: string[];
  crowdPredictions: string;
  photographySpots: string[];
  trekDifficulty: string;
  safetyGuidance: string[];
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  subtitle: string;
  createdAt: string;
  input: PlannerInput;
  numDays: number;
  selectedDestinations: Destination[];
  dailySchedule: DailyScheduleItem[];
  budgetBreakdown: BudgetBreakdown;
  routeMetrics: RouteMetrics;
  smartRecommendations: SmartRecommendations;
  matchingFestivals: KarnatakaFestival[];
  aiPersonalizationNote: string;
}

export function durationToDays(duration: TravelDuration): number {
  switch (duration) {
    case 'Weekend':
      return 2;
    case '3 Days':
      return 3;
    case '5 Days':
      return 5;
    case '7 Days':
      return 7;
    case '10+ Days':
      return 10;
    default:
      return 5;
  }
}

export function calculateHaversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply by 1.28 road-winding factor for Karnataka Western Ghats / state highways
  return Math.round(R * c * 1.28);
}

export function scoreDestinationForUser(
  dest: Destination,
  input: PlannerInput,
  userPrefs?: UserPreferences
): number {
  let score = 10;

  // Match explicit interests
  for (const interest of input.interests) {
    if (dest.interests.includes(interest)) {
      score += 18;
    }
  }

  // Match user profile learned interests
  if (userPrefs) {
    if (userPrefs.bookmarkedDestinationIds.includes(dest.id)) {
      score += 22;
    }
    for (const prefInterest of userPrefs.preferredInterests) {
      if (dest.interests.includes(prefInterest)) {
        score += 6;
      }
    }
  }

  // Partner suitability adjustments
  if (input.partner === 'Senior Citizens') {
    if (dest.trekDifficulty === 'Easy Walk') score += 15;
    if (dest.trekDifficulty === 'Challenging Summit') score -= 20;
  } else if (input.partner === 'Couple') {
    if (dest.interests.includes('Coffee Plantations') || dest.interests.includes('Beaches') || dest.archetype === 'palace') {
      score += 12;
    }
  } else if (input.partner === 'Friends' || input.partner === 'Solo') {
    if (dest.interests.includes('Trekking') || dest.interests.includes('Adventure')) {
      score += 10;
    }
  } else if (input.partner === 'Family') {
    if (dest.interests.includes('Wildlife') || dest.interests.includes('Heritage') || dest.interests.includes('Waterfalls')) {
      score += 12;
    }
  }

  // Budget alignment
  if (input.budget === 'Luxury' && dest.baseDailyCostINR >= 4500) score += 10;
  if (input.budget === 'Budget' && dest.baseDailyCostINR <= 3600) score += 10;

  return score;
}

export function optimizeTravelRoute(
  destinations: Destination[],
  mode: RouteOptimizeMode = 'scenic'
): RouteMetrics {
  if (destinations.length === 0) {
    return {
      mode,
      orderedDestinationIds: [],
      totalDistanceKm: 0,
      estimatedTotalDriveHours: 0,
      scenicScore: 90,
      comfortScore: 90,
      elevationGainMeters: 0,
      routeSummary: 'Select destinations to compute route telemetry.',
    };
  }

  const pool = [...destinations];
  const ordered: Destination[] = [];

  // Start at Bengaluru if included, otherwise southernmost or northernmost based on mode
  const blrIdx = pool.findIndex((d) => d.id === 'bengaluru');
  if (blrIdx >= 0) {
    ordered.push(pool.splice(blrIdx, 1)[0]);
  } else if (mode === 'scenic') {
    // Prefer starting from Western Ghats or highest elevation
    pool.sort((a, b) => b.elevationMeters - a.elevationMeters);
    ordered.push(pool.shift()!);
  } else {
    pool.sort((a, b) => a.lat - b.lat);
    ordered.push(pool.shift()!);
  }

  // Nearest-neighbor with mode weighting
  while (pool.length > 0) {
    const current = ordered[ordered.length - 1];
    let bestIdx = 0;
    let bestMetric = Infinity;

    for (let i = 0; i < pool.length; i++) {
      const candidate = pool[i];
      const dist = calculateHaversineDistance(
        current.lat,
        current.lng,
        candidate.lat,
        candidate.lng
      );

      let metric = dist;
      if (mode === 'scenic') {
        // Reward Western Ghats / Coast / Waterfall transitions
        const scenicBonus =
          candidate.region === 'Western Ghats & Malnad' || candidate.region === 'Karavali Coast'
            ? 0.72
            : 0.95;
        metric = dist * scenicBonus;
      } else if (mode === 'comfort') {
        // Penalize extreme elevation swings in a single day
        const elevDelta = Math.abs(candidate.elevationMeters - current.elevationMeters);
        metric = dist + elevDelta * 0.15;
      } else if (mode === 'cost') {
        metric = dist + candidate.baseDailyCostINR * 0.02;
      }

      if (metric < bestMetric) {
        bestMetric = metric;
        bestIdx = i;
      }
    }

    ordered.push(pool.splice(bestIdx, 1)[0]);
  }

  let totalDistanceKm = 0;
  let elevationGainMeters = 0;

  for (let i = 1; i < ordered.length; i++) {
    const prev = ordered[i - 1];
    const curr = ordered[i];
    totalDistanceKm += calculateHaversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    elevationGainMeters += Math.abs(curr.elevationMeters - prev.elevationMeters);
  }
  elevationGainMeters += ordered.length * 160;

  // Add local sightseeing circuit distance per stop (approx 45 km per destination)
  totalDistanceKm += ordered.length * 45;

  const avgSpeedKmh = mode === 'time' ? 54 : mode === 'scenic' ? 42 : 48;
  const estimatedTotalDriveHours = Number((totalDistanceKm / avgSpeedKmh).toFixed(1));

  const scenicScore =
    mode === 'scenic' ? 98 : mode === 'comfort' ? 91 : mode === 'time' ? 84 : 86;
  const comfortScore =
    mode === 'comfort' ? 97 : mode === 'scenic' ? 90 : mode === 'time' ? 85 : 88;

  const modeLabels: Record<RouteOptimizeMode, string> = {
    scenic: 'Western Ghats & Heritage Panorama Corridor',
    time: 'Express National Highway (NH-48 / NH-75) Priority',
    cost: 'Fuel & Regional Transit Optimized Circuit',
    comfort: 'Gradual Elevation & Smooth Ghat Gradient Loop',
  };

  return {
    mode,
    orderedDestinationIds: ordered.map((d) => d.id),
    totalDistanceKm,
    estimatedTotalDriveHours,
    scenicScore,
    comfortScore,
    elevationGainMeters,
    routeSummary: `${modeLabels[mode]} connecting ${ordered.map((d) => d.name).join(' → ')}`,
  };
}

export function calculateTripBudget(
  input: PlannerInput,
  numDays: number,
  totalDistanceKm: number
): BudgetBreakdown {
  const budgetMultipliers: Record<TravelBudget, number> = {
    Budget: 0.65,
    'Mid-range': 1.0,
    Premium: 1.65,
    Luxury: 2.75,
  };

  const accommodationBasePerNight: Record<AccommodationStyle, number> = {
    Hostel: 950,
    Homestay: 2800,
    Hotel: 4500,
    Resort: 8200,
    'Luxury Stay': 16500,
  };

  const transportRatePerKm: Record<TransportationMode, number> = {
    'Public Transport': 3.5,
    Bike: 5.5,
    Car: 14.0,
    Taxi: 18.5,
  };

  const partnerMultiplier: Record<TravelPartner, { rooms: number; heads: number }> = {
    Solo: { rooms: 1, heads: 1 },
    Couple: { rooms: 1, heads: 2 },
    Family: { rooms: 2, heads: 4 },
    Friends: { rooms: 2, heads: 4 },
    'Senior Citizens': { rooms: 1, heads: 2 },
  };

  const mult = budgetMultipliers[input.budget];
  const group = partnerMultiplier[input.partner];

  const transportCost = Math.round(
    totalDistanceKm * transportRatePerKm[input.transport] * (input.transport === 'Public Transport' ? group.heads : 1) +
      numDays * 450 * mult
  );

  const accommodationCost = Math.round(
    numDays * accommodationBasePerNight[input.accommodation] * mult * group.rooms
  );

  const dailyFoodPerPerson = Math.round(850 * mult);
  const foodBudget = Math.round(numDays * dailyFoodPerPerson * group.heads);

  const dailyActivityPerPerson = Math.round(650 * mult);
  const activityExpenses = Math.round(numDays * dailyActivityPerPerson * group.heads);

  const totalTripCost = transportCost + accommodationCost + foodBudget + activityExpenses;
  const dailyAverage = Math.round(totalTripCost / Math.max(1, numDays));
  const perPersonEstimate = Math.round(totalTripCost / Math.max(1, group.heads));

  const tierNotes: Record<TravelBudget, string> = {
    Budget: 'KSRTC Airavat / bike trails, authentic Darshinis & heritage homestays',
    'Mid-range': 'Curated plantation homestays, private sedan/SUV & guided monument walks',
    Premium: 'Boutique heritage resorts, private naturalist safaris & signature regional dining',
    Luxury: 'Palace suites, Evolve Back / Serai private pool villas & bespoke chauffeur experiences',
  };

  return {
    transportCost,
    accommodationCost,
    foodBudget,
    activityExpenses,
    totalTripCost,
    dailyAverage,
    perPersonEstimate,
    currency: 'INR',
    budgetTierNote: tierNotes[input.budget],
  };
}

export function filterFestivalsByDateAndInterests(
  monthName?: string,
  interests: TravelInterest[] = []
): KarnatakaFestival[] {
  return KARNATAKA_FESTIVALS.filter((fest) => {
    const monthMatch =
      !monthName ||
      monthName === 'All Months' ||
      fest.month.toLowerCase() === monthName.toLowerCase();
    const interestMatch =
      interests.length === 0 ||
      fest.interests.some((i) => interests.includes(i)) ||
      interests.includes('Festivals') ||
      interests.includes('Culture');
    return monthMatch || interestMatch;
  }).sort((a, b) => {
    const aMonthMatch = monthName && a.month.toLowerCase() === monthName.toLowerCase() ? 1 : 0;
    const bMonthMatch = monthName && b.month.toLowerCase() === monthName.toLowerCase() ? 1 : 0;
    return bMonthMatch - aMonthMatch;
  });
}

export function generateSmartItinerary(
  input: PlannerInput,
  userPrefs?: UserPreferences
): GeneratedItinerary {
  const numDays = durationToDays(input.duration);
  const routeMode = input.routeMode || 'scenic';

  // Determine how many distinct destinations to include
  const targetStopCount =
    numDays <= 2 ? 2 : numDays === 3 ? 2 : numDays === 5 ? 3 : numDays === 7 ? 4 : 5;

  const scored = KARNATAKA_DESTINATIONS.map((dest) => ({
    dest,
    score: scoreDestinationForUser(dest, input, userPrefs),
  })).sort((a, b) => b.score - a.score);

  const chosenUnordered = scored.slice(0, targetStopCount).map((s) => s.dest);
  const routeMetrics = optimizeTravelRoute(chosenUnordered, routeMode);

  const orderedDestinations = routeMetrics.orderedDestinationIds
    .map((id) => KARNATAKA_DESTINATIONS.find((d) => d.id === id)!)
    .filter(Boolean);

  // Build day-by-day schedule across numDays
  const dailySchedule: DailyScheduleItem[] = [];
  for (let dayIdx = 0; dayIdx < numDays; dayIdx++) {
    const destIdx = Math.min(
      orderedDestinations.length - 1,
      Math.floor((dayIdx * orderedDestinations.length) / numDays)
    );
    const prevDestIdx =
      dayIdx === 0
        ? -1
        : Math.min(
            orderedDestinations.length - 1,
            Math.floor(((dayIdx - 1) * orderedDestinations.length) / numDays)
          );

    const dest = orderedDestinations[destIdx];
    const isTransitionDay = prevDestIdx !== destIdx;
    const prevDest = prevDestIdx >= 0 ? orderedDestinations[prevDestIdx] : null;

    const distanceKmFromPrev =
      isTransitionDay && prevDest
        ? calculateHaversineDistance(prevDest.lat, prevDest.lng, dest.lat, dest.lng)
        : 38;
    const estimatedDriveHours = Number((distanceKmFromPrev / 46).toFixed(1));

    const dayVariant = dayIdx > 0 && prevDestIdx === destIdx;

    dailySchedule.push({
      day: dayIdx + 1,
      title: dayVariant
        ? `Day ${dayIdx + 1}: Deep Exploration & Hidden Trails of ${dest.name}`
        : `Day ${dayIdx + 1}: ${dest.name} — ${dest.tagline.split('&')[0].trim()}`,
      destinationId: dest.id,
      destinationName: dest.name,
      region: dest.region,
      elevationMeters: dest.elevationMeters,
      wakeUpRecommendation: dayVariant
        ? `06:15 AM — Golden hour photography at ${dest.guide.photographySpots[1] || dest.guide.photographySpots[0]}`
        : `05:45 AM — Dawn awakening for ${dest.guide.photographySpots[0]}`,
      breakfastSuggestion: dest.guide.breakfastSpot,
      sightseeingPlan: dayVariant
        ? `Discover offbeat gem: ${dest.guide.hiddenAttractions[0]?.name} — ${dest.guide.hiddenAttractions[0]?.description}`
        : dest.guide.morningActivity,
      travelRouteInfo:
        dayIdx === 0
          ? `Arrive at ${dest.name} (${dest.elevationMeters}m elevation) via ${input.transport}`
          : isTransitionDay && prevDest
          ? `Scenic ${distanceKmFromPrev} km transit (${estimatedDriveHours} hrs) from ${prevDest.name} to ${dest.name} via ${input.transport}`
          : `Local ${distanceKmFromPrev} km circuit around ${dest.name} foothills & sanctuaries`,
      distanceKmFromPrev,
      estimatedDriveHours,
      lunchRecommendation: dest.guide.lunchSpot,
      afternoonActivities: dayVariant
        ? `Explore ${dest.guide.hiddenAttractions[1]?.name || dest.guide.afternoonActivity}`
        : dest.guide.afternoonActivity,
      eveningExperience: dest.guide.eveningExperience,
      localFoodSuggestion: dest.guide.dinnerSpot,
      shoppingRecommendation: dest.guide.shoppingHighlight,
    });
  }

  const budgetBreakdown = calculateTripBudget(input, numDays, routeMetrics.totalDistanceKm);
  const matchingFestivals = filterFestivalsByDateAndInterests(input.travelMonth, input.interests);

  const hiddenGems = orderedDestinations.flatMap((d) =>
    d.guide.hiddenAttractions.map((h) => ({
      name: h.name,
      destinationName: d.name,
      description: h.description,
    }))
  );

  const smartRecommendations: SmartRecommendations = {
    bestSeason: orderedDestinations[0]?.bestSeason || 'Winter (Oct–Feb)',
    weatherInsights: `Elevations span from ${Math.min(
      ...orderedDestinations.map((d) => d.elevationMeters)
    )}m to ${Math.max(
      ...orderedDestinations.map((d) => d.elevationMeters)
    )}m. Expect cool highland mornings in the Western Ghats and warm golden afternoons across heritage plateaus.`,
    localEvents: matchingFestivals.slice(0, 3).map((f) => `${f.name} (${f.month} · ${f.locationName})`),
    hiddenGems: hiddenGems.slice(0, 4),
    offbeatPlaces: KARNATAKA_DESTINATIONS.filter((d) => d.isHiddenGem)
      .slice(0, 4)
      .map((d) => `${d.name} (${d.region})`),
    crowdPredictions: orderedDestinations.some((d) => d.crowdLevel.includes('High'))
      ? 'Moderate-to-High on weekends at marquee monuments; start morning sightseeing before 7:30 AM for serene access.'
      : 'Low-to-Moderate crowd density across your selected offbeat and nature corridors.',
    photographySpots: orderedDestinations.flatMap((d) => d.guide.photographySpots).slice(0, 5),
    trekDifficulty:
      input.partner === 'Senior Citizens'
        ? 'Easy Walk (Paved temple courtyards & gentle estate verandas)'
        : orderedDestinations.some((d) => d.trekDifficulty === 'Challenging Summit')
        ? 'Moderate to Challenging Summit (High-altitude shola ridges included)'
        : 'Easy to Moderate Trails (Scenic viewpoints & coastal paths)',
    safetyGuidance: orderedDestinations.map((d) => `${d.name}: ${d.guide.safetyNote}`),
  };

  const interestSummary =
    input.interests.length > 0 ? input.interests.slice(0, 3).join(', ') : 'Heritage & Nature';

  return {
    id: `itinerary-${Date.now()}`,
    title: `${numDays}-Day ${input.budget} Karnataka Odyssey: ${orderedDestinations
      .map((d) => d.name.split(' ')[0])
      .join(' · ')}`,
    subtitle: `Crafted for a ${input.partner} journey by ${input.transport} focusing on ${interestSummary}`,
    createdAt: new Date().toISOString(),
    input,
    numDays,
    selectedDestinations: orderedDestinations,
    dailySchedule,
    budgetBreakdown,
    routeMetrics,
    smartRecommendations,
    matchingFestivals,
    aiPersonalizationNote: `Optimized for ${input.partner.toLowerCase()} travelers preferring ${input.accommodation.toLowerCase()} stays and ${routeMode} routing across ${orderedDestinations.length} signature Karnataka regions.`,
  };
}

export function validateAuthInput(
  email: string,
  password: string,
  name: string,
  isSignUp: boolean
): { valid: boolean; error?: string } {
  const trimmedEmail = email.trim();
  if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long.' };
  }
  if (isSignUp && (!name || name.trim().length < 2)) {
    return { valid: false, error: 'Please enter your full name (at least 2 characters).' };
  }
  return { valid: true };
}
