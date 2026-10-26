import React, { useEffect, useState, useMemo } from 'react';
import {
  KARNATAKA_DESTINATIONS,
  KARNATAKA_FESTIVALS,
  KARNATAKA_DISHES,
  Destination,
  TravelInterest,
} from './data/karnatakaData';
import {
  generateSmartItinerary,
  GeneratedItinerary,
  filterFestivalsByDateAndInterests,
} from './utils/plannerEngine';
import { DestinationArtwork } from './components/DestinationArtwork';
import { Karnataka3DScene } from './components/Karnataka3DScene';
import { KarnatakaGoogleMap, QuotaErrorModal } from './components/KarnatakaGoogleMap';
import { AITripPlanner } from './components/AITripPlanner';
import {
  InteractiveDestinationModal,
  DestinationWeatherInfo,
} from './components/InteractiveDestinationModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import {
  PersonalizedDashboardSection,
  ClientUserAccount,
} from './components/AuthAndDashboardModal';
import {
  ArrowRight,
  Check,
  CloudSun,
  Compass,
  Globe,
  Layers,
  Map as MapIcon,
  MessageSquare,
  Moon,
  ShieldCheck,
  Star,
  Sun,
} from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'We used Namma Karnataka to plan a 7-day drive from Chikmagalur through Agumbe down to Gokarna. Having realistic ghat driving times next to family-run coffee estate stays made the whole trip feel effortless.',
    author: 'Arjun & Meera Nair',
    role: 'Architects • Bengaluru to Karavali Coast',
    metric: '640 km Route • 4 Stops',
  },
  {
    quote:
      'The destination guides for Hampi, Badami, and Pattadakal saved us hours of research. Knowing which temple courtyards catch the early morning light—and where to stop for Jolada Rotti—changed how we experienced the Deccan.',
    author: 'Dr. Vikramaditya Rao',
    role: 'Historian • Deccan Heritage Circuit',
    metric: '5-Day Heritage Plan',
  },
  {
    quote:
      'Being able to switch between the Google Map for road directions and the 3D elevation view helped us pick a comfortable pace for my parents across Mysuru, Coorg, and Kabini.',
    author: 'Priya Deshmukh',
    role: 'Product Lead • Family Wildlife & Plantation Trip',
    metric: 'INR 68,500 Planned Budget',
  },
];

const PRICING_PLANS = [
  {
    id: 'explorer',
    name: 'Explorer',
    tagline: 'Everything you need to plan weekend road trips and regional circuits across Karnataka.',
    monthlyINR: 0,
    annualINR: 0,
    badge: 'Free Forever',
    highlighted: false,
    cta: 'Start Planning Free',
    features: [
      'Custom day-by-day route builder across all 16 regions',
      'Interactive Google Maps & 3D elevation relief view',
      'Live local weather & 5-day destination forecasts',
      'Up to 5 saved trips in your personal account',
      'Complete cultural, festival & regional food guides',
    ],
  },
  {
    id: 'sahyadri-pro',
    name: 'Sahyadri Pass',
    tagline: 'For frequent travelers who want unlimited route variations, offline guides, and trail notes.',
    monthlyINR: 799,
    annualINR: 599,
    badge: 'Most Popular',
    highlighted: true,
    cta: 'Choose Sahyadri Pass',
    features: [
      'Unlimited custom itinerary variations & detours',
      'Monsoon ghat road advisories & elevation pacing',
      'Unlimited saved trips, spend tracking & export',
      'Early-morning safari & heritage walk timing guides',
      'Shareable trip plans for family & group travel',
    ],
  },
  {
    id: 'concierge',
    name: 'Private Charter',
    tagline: 'Bespoke estate stays, local naturalists, and dedicated regional trip coordination.',
    monthlyINR: 2499,
    annualINR: 1999,
    badge: 'Bespoke',
    highlighted: false,
    cta: 'Inquire About Charter',
    features: [
      'Everything in Sahyadri Pass for up to 10 travelers',
      'Direct holds at heritage bungalows & coffee estates',
      'Chauffeur routing & EV charging stop planning',
      'Dedicated Karnataka regional travel desk support',
      'Private ASI heritage scholar & naturalist walks',
    ],
  },
];

export default function App() {
  // Default to warm editorial Light Mode; toggleable to Dark Mode
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isLightTheme = theme === 'light';

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    } else {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    }
  }, [theme]);

  // Active itinerary state initialized with a 5-day signature corridor
  const [activeItinerary, setActiveItinerary] = useState<GeneratedItinerary>(() =>
    generateSmartItinerary({
      duration: '5 Days',
      budget: 'Premium',
      interests: ['Heritage', 'Coffee Plantations', 'Nature', 'Waterfalls'],
      partner: 'Couple',
      transport: 'Car',
      accommodation: 'Resort',
      routeMode: 'scenic',
      travelMonth: 'November',
    })
  );

  // Map view mode: default to 'google' so the live Google Map is immediately visible
  const [mapMode, setMapMode] = useState<'google' | '3d'>('google');
  const [selectedMapDestId, setSelectedMapDestId] = useState<string>('hampi');
  const [heroShowcaseDestId, setHeroShowcaseDestId] = useState<string>('hampi');

  // Destination filter state
  const [regionFilter, setRegionFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalDestination, setModalDestination] = useState<Destination | null>(null);

  // Festival filter state
  const [festivalMonthFilter, setFestivalMonthFilter] = useState<string>('All');

  // Pricing billing cycle state
  const [annualBilling, setAnnualBilling] = useState<boolean>(true);
  const [selectedPlanNotice, setSelectedPlanNotice] = useState<string | null>(null);

  // Weather & Auth state
  const [weatherMap, setWeatherMap] = useState<Record<string, DestinationWeatherInfo>>({});
  const [user, setUser] = useState<ClientUserAccount | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Fetch initial Auth session & live Weather
  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    const allIds = KARNATAKA_DESTINATIONS.map((d) => d.id).join(',');
    fetch(`/api/weather?ids=${encodeURIComponent(allIds)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.weather) {
          setWeatherMap(data.weather);
        }
      })
      .catch(() => {});
  }, []);

  const activeRouteIds = useMemo(() => {
    if (activeItinerary?.routeMetrics?.orderedDestinationIds?.length) {
      return activeItinerary.routeMetrics.orderedDestinationIds;
    }
    const unique: string[] = [];
    for (const dayItem of activeItinerary?.dailySchedule || []) {
      if (!unique.includes(dayItem.destinationId)) {
        unique.push(dayItem.destinationId);
      }
    }
    return unique;
  }, [activeItinerary]);

  const filteredDestinations = useMemo(() => {
    return KARNATAKA_DESTINATIONS.filter((dest) => {
      const matchesRegion =
        regionFilter === 'All' || dest.region.toLowerCase().includes(regionFilter.toLowerCase());
      const matchesQuery =
        !searchQuery.trim() ||
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.interests.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRegion && matchesQuery;
    });
  }, [regionFilter, searchQuery]);

  const filteredFestivals = useMemo(() => {
    if (festivalMonthFilter === 'All') {
      return KARNATAKA_FESTIVALS;
    }
    return filterFestivalsByDateAndInterests(festivalMonthFilter, activeItinerary.input.interests);
  }, [festivalMonthFilter, activeItinerary.input.interests]);

  const heroDest =
    KARNATAKA_DESTINATIONS.find((d) => d.id === heroShowcaseDestId) || KARNATAKA_DESTINATIONS[0];
  const heroWeather = weatherMap[heroDest.id];

  const handleSaveCurrentItineraryToDashboard = async () => {
    try {
      const res = await fetch('/api/user/itineraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itinerary: activeItinerary }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch {
      // handled gracefully
    }
  };

  const handleToggleBookmark = async (destId: string) => {
    if (!user) return;
    const currentFavs = user.preferences.bookmarkedDestinationIds || [];
    const exists = currentFavs.includes(destId);
    const updatedFavs = exists
      ? currentFavs.filter((id) => id !== destId)
      : [...currentFavs, destId];

    try {
      const res = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...user.preferences,
          bookmarkedDestinationIds: updatedFavs,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch {
      // ignore
    }
  };

  const handleAddDestinationToItinerary = (dest: Destination) => {
    const combinedInterests: TravelInterest[] = Array.from(
      new Set([...activeItinerary.input.interests, ...dest.interests.slice(0, 2)])
    );
    const updated = generateSmartItinerary({
      ...activeItinerary.input,
      interests: combinedInterests,
    });
    setActiveItinerary(updated);
    setSelectedMapDestId(dest.id);
    setModalDestination(null);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen app-bg transition-colors duration-200 ${isLightTheme ? 'theme-light' : 'theme-dark'}`}>
      {/* Google Maps Demo Key Quota Modal Guard */}
      <QuotaErrorModal />

      {/* 3-Zone Sticky Navigation Bar */}
      <header
        className="sticky top-0 z-40 h-16 border-b border-hairline backdrop-blur-md transition-colors"
        style={{
          backgroundColor: isLightTheme
            ? 'rgba(250, 249, 245, 0.9)'
            : 'rgba(14, 16, 15, 0.9)',
        }}
      >
        <div className="max-w-[1320px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg btn-primary flex items-center justify-center font-editorial text-lg font-normal">
              N
            </div>
            <div>
              <span className="font-bold tracking-tight text-sm sm:text-base text-ink block leading-none">
                Namma Karnataka
              </span>
              <span className="text-[11px] text-caption block mt-0.5">
                Regional Travel & Route Guide
              </span>
            </div>
          </div>

          {/* Zone 2: Primary Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-body">
            <button
              type="button"
              onClick={() => scrollToSection('destinations-section')}
              className="hover:text-ink transition-colors cursor-pointer whitespace-nowrap"
            >
              Destinations
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('planner-section')}
              className="hover:text-ink transition-colors cursor-pointer whitespace-nowrap"
            >
              Trip Planner
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('map-section')}
              className="hover:text-ink transition-colors cursor-pointer whitespace-nowrap"
            >
              Route Map
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features-section')}
              className="hover:text-ink transition-colors cursor-pointer whitespace-nowrap"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('pricing-section')}
              className="hover:text-ink transition-colors cursor-pointer whitespace-nowrap"
            >
              Membership
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('workspace-section')}
              className="hover:text-ink transition-colors cursor-pointer whitespace-nowrap"
            >
              Saved Trips ({user?.savedItineraries?.length || 0})
            </button>
          </nav>

          {/* Zone 3: Primary Action & Theme Controls */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              data-testid="open-ai-chat-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium surface-card hover:opacity-85 transition-opacity cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
              <span className="hidden sm:inline">Ask Concierge</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme(isLightTheme ? 'dark' : 'light')}
              aria-label="Toggle color theme"
              data-testid="theme-toggle-btn"
              className="p-2 rounded-lg surface-card hover:opacity-85 transition-opacity cursor-pointer"
              title={isLightTheme ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLightTheme ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('planner-section')}
              className="px-4 py-1.5 rounded-lg btn-primary text-xs font-semibold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
            >
              Plan a Trip
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main>
        {/* 1. Editorial Split Hero Section */}
        <section className="border-b border-hairline py-14 lg:py-20">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left 6 Columns: Editorial Headline & Value Prop */}
              <div className="lg:col-span-6 space-y-6">
                <div
                  className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase"
                  style={{ color: 'var(--accent-text)' }}
                >
                  <span>Curated Karnataka Road Trips & Field Guides</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-editorial font-normal tracking-tight text-ink leading-[1.06]">
                  Discover Karnataka, planned around your pace.
                </h1>

                <p className="text-base sm:text-lg text-body max-w-xl leading-relaxed">
                  From the 14th-century granite temples of Hampi to misty Arabica estates in Coorg
                  and the quiet coves of Gokarna—build a day-by-day itinerary with realistic ghat
                  drive times, live weather, and local dining stops.
                </p>

                {/* Primary & Secondary CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => scrollToSection('planner-section')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl btn-primary text-sm font-semibold transition-all cursor-pointer shadow-xs"
                  >
                    <span>Plan My Trip</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('destinations-section')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold surface-card hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    <Compass className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
                    <span>Explore 16 Destinations</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('map-section')}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium surface-subtle hover:opacity-85 transition-opacity cursor-pointer"
                  >
                    <MapIcon className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
                    <span>View Route Map</span>
                  </button>
                </div>

                {/* Clean Editorial Proof Strip */}
                <div className="pt-6 border-t border-hairline grid grid-cols-3 gap-6 max-w-md">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono-tabular text-ink">
                      16
                    </div>
                    <div className="text-xs text-caption mt-0.5">Regional Hubs</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono-tabular text-ink">
                      1,930m
                    </div>
                    <div className="text-xs text-caption mt-0.5">Western Ghats Peak</div>
                  </div>
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-mono-tabular text-ink">
                      Live
                    </div>
                    <div className="text-xs text-caption mt-0.5">Google Maps & Weather</div>
                  </div>
                </div>
              </div>

              {/* Right 6 Columns: Featured Destination Editorial Card */}
              <div className="lg:col-span-6">
                <div className="rounded-2xl surface-card overflow-hidden shadow-md">
                  <div className="relative h-72 sm:h-80 w-full group">
                    <DestinationArtwork
                      destinationId={heroDest.id}
                      archetype={heroDest.archetype}
                      title={heroDest.name}
                      overlayGradient={true}
                      className="w-full h-full"
                    />
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-semibold text-stone-900 shadow-xs">
                        {heroDest.region} · {heroDest.elevationMeters}m
                      </span>
                      {heroWeather && (
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-xs font-mono-tabular font-semibold text-stone-900 flex items-center gap-1.5 shadow-xs">
                          <CloudSun className="w-3.5 h-3.5 text-emerald-700" />
                          {heroWeather.currentTempC}°C
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                      <div>
                        <div className="text-xs text-stone-200 font-medium">
                          {heroDest.kannadaName}
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-editorial font-normal text-white">
                          {heroDest.name}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setModalDestination(heroDest)}
                        className="px-3.5 py-2 rounded-xl bg-white text-stone-900 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                      >
                        Read Field Guide
                      </button>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-4">
                    <p className="text-sm text-body leading-relaxed">{heroDest.tagline}</p>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-hairline text-xs">
                      <div>
                        <span className="text-[11px] text-caption block">Best Months</span>
                        <span className="font-semibold text-ink mt-0.5 block">
                          {heroDest.bestSeason}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-caption block">Typical Daily Spend</span>
                        <span className="font-mono-tabular font-semibold text-ink mt-0.5 block">
                          INR {heroDest.baseDailyCostINR.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-caption block">Coordinates</span>
                        <span className="font-mono-tabular font-semibold text-ink mt-0.5 block">
                          {heroDest.lat.toFixed(1)}°N, {heroDest.lng.toFixed(1)}°E
                        </span>
                      </div>
                    </div>

                    {/* Quick Destination Switcher */}
                    <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                      {['hampi', 'coorg', 'mysuru', 'gokarna', 'chikmagalur', 'jog-falls'].map(
                        (id) => {
                          const d = KARNATAKA_DESTINATIONS.find((item) => item.id === id);
                          if (!d) return null;
                          const active = heroShowcaseDestId === id;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => setHeroShowcaseDestId(id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                active
                                  ? 'btn-primary font-semibold'
                                  : 'surface-subtle text-body hover:text-ink'
                              }`}
                            >
                              {d.name}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Interactive Destination Atlas (16 Destinations with Clean Editorial Cards) */}
        <section id="destinations-section" className="py-16 lg:py-20 border-b border-hairline">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Where to Go
                </span>
                <h2 className="text-3xl sm:text-4xl font-editorial font-normal tracking-tight text-ink mt-1">
                  16 Signature Karnataka Destinations
                </h2>
                <p className="text-sm text-body mt-1">
                  Click any destination to read its history, local customs, dining spots, and 5-day
                  weather forecast.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Hampi, Coorg, waterfalls..."
                  className="px-3.5 py-2 rounded-xl text-xs surface-card text-ink placeholder:text-caption focus:outline-none"
                />
                {['All', 'Malnad', 'Karavali', 'Bayaluseeme', 'Mysuru', 'Deccan'].map((region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setRegionFilter(region)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      regionFilter === region
                        ? 'btn-primary font-semibold'
                        : 'surface-card text-body hover:text-ink'
                    }`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDestinations.map((dest) => {
                const weather = weatherMap[dest.id];
                return (
                  <article
                    key={dest.id}
                    onClick={() => setModalDestination(dest)}
                    data-testid={`destination-card-${dest.id}`}
                    className="group rounded-2xl surface-card overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                  >
                    <div>
                      <div className="relative h-48 w-full overflow-hidden">
                        <DestinationArtwork
                          destinationId={dest.id}
                          archetype={dest.archetype}
                          title={dest.name}
                          overlayGradient={false}
                          className="w-full h-full"
                        />
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-medium text-stone-900 shadow-xs">
                            {dest.region}
                          </span>
                          {weather && (
                            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-mono-tabular font-semibold text-stone-900 shadow-xs">
                              {weather.currentTempC}°C
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="text-base font-bold text-ink tracking-tight">
                            {dest.name}
                          </h3>
                          <span className="text-xs text-caption shrink-0">
                            {dest.kannadaName}
                          </span>
                        </div>
                        <p className="text-xs text-body line-clamp-2 leading-relaxed">
                          {dest.tagline}
                        </p>
                        <div className="text-[11px] text-caption pt-1">
                          {dest.elevationMeters}m elevation · Best in {dest.bestSeason}
                        </div>
                      </div>
                    </div>

                    <div className="px-4 sm:px-5 py-3 border-t border-hairline flex items-center justify-between text-xs">
                      <span className="font-mono-tabular font-semibold text-ink">
                        INR {dest.baseDailyCostINR.toLocaleString()}/day
                      </span>
                      <span
                        className="font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        Read Guide <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Interactive Google Maps & 3D Karnataka Relief Section */}
        <section id="map-section" className="py-16 lg:py-20 border-b border-hairline">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Interactive Map
                </span>
                <h2 className="text-3xl sm:text-4xl font-editorial font-normal tracking-tight text-ink mt-1">
                  Explore Routes on Google Maps & 3D Terrain
                </h2>
                <p className="text-sm text-body mt-1 max-w-2xl">
                  Inspect road connections, terrain contours, and all 16 stops on Google Maps, or
                  switch to the 3D elevation model of Karnataka.
                </p>
              </div>

              {/* Switcher between Google Maps Platform and 3D WebGL Relief */}
              <div className="inline-flex items-center p-1 rounded-xl surface-subtle">
                <button
                  type="button"
                  onClick={() => setMapMode('google')}
                  data-testid="switch-google-map-btn"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    mapMode === 'google'
                      ? 'btn-primary shadow-xs'
                      : 'text-body hover:text-ink'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Google Maps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode('3d')}
                  data-testid="switch-3d-map-btn"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    mapMode === '3d'
                      ? 'btn-primary shadow-xs'
                      : 'text-body hover:text-ink'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>3D Elevation Relief</span>
                </button>
              </div>
            </div>

            {/* Map Viewport Container */}
            <div className="h-[540px] w-full">
              {mapMode === 'google' ? (
                <KarnatakaGoogleMap
                  selectedDestinationId={selectedMapDestId}
                  onSelectDestination={(id) => setSelectedMapDestId(id)}
                  onOpenDestinationGuide={(id) => {
                    const found = KARNATAKA_DESTINATIONS.find((d) => d.id === id);
                    if (found) setModalDestination(found);
                  }}
                  activeRouteIds={activeRouteIds}
                  theme={theme}
                />
              ) : (
                <div className="relative w-full h-full rounded-2xl overflow-hidden surface-card">
                  <Karnataka3DScene
                    selectedDestinationId={selectedMapDestId}
                    onSelectDestination={(id) => {
                      setSelectedMapDestId(id);
                      const found = KARNATAKA_DESTINATIONS.find((d) => d.id === id);
                      if (found) setModalDestination(found);
                    }}
                    activeRouteIds={activeRouteIds}
                    theme={theme}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. Trip Planner Engine Section */}
        <section id="planner-section" className="py-16 lg:py-20 border-b border-hairline">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent-text)' }}
              >
                Custom Itinerary Builder
              </span>
              <h2 className="text-3xl sm:text-4xl font-editorial font-normal tracking-tight text-ink mt-1">
                Build your day-by-day Karnataka route
              </h2>
              <p className="text-sm text-body mt-1">
                Adjust your trip length, comfort tier, travel group, and interests to generate a
                practical schedule with morning, afternoon, and dining recommendations.
              </p>
            </div>

            <AITripPlanner
              activeItinerary={activeItinerary}
              onUpdateItinerary={(itinerary) => {
                setActiveItinerary(itinerary);
                if (itinerary.dailySchedule?.[0]) {
                  setSelectedMapDestId(itinerary.dailySchedule[0].destinationId);
                }
              }}
              weatherMap={weatherMap}
              onOpenDestinationGuide={(dest) => setModalDestination(dest)}
              onSaveToDashboard={handleSaveCurrentItineraryToDashboard}
              isLightTheme={isLightTheme}
            />
          </div>
        </section>

        {/* 5. How It Works (Clean Editorial Bento Grid) */}
        <section id="features-section" className="py-16 lg:py-20 border-b border-hairline">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent-text)' }}
              >
                Thoughtful Planning
              </span>
              <h2 className="text-3xl sm:text-4xl font-editorial font-normal tracking-tight text-ink">
                Designed for real road conditions in Karnataka
              </h2>
              <p className="text-sm text-body leading-relaxed">
                Whether you are crossing the 14 hairpin bends of Agumbe or timing sunrise at Hampi’s
                Vittala Temple, every detail is grounded in local geography.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl surface-card p-6 space-y-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl badge-accent flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-ink">
                  Realistic Western Ghats Drive Times
                </h3>
                <p className="text-xs sm:text-sm text-body leading-relaxed">
                  Accounts for mountain gradients and winding Malnad state highways rather than
                  straight-line distances, keeping daily drives comfortable.
                </p>
              </div>

              <div className="rounded-2xl surface-card p-6 space-y-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl badge-accent flex items-center justify-center">
                  <CloudSun className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-ink">
                  Live Regional Weather & Best Seasons
                </h3>
                <p className="text-xs sm:text-sm text-body leading-relaxed">
                  Checks current temperatures and 5-day rain forecasts across coastal Karavali,
                  misty hill stations, and the dry Deccan plateau.
                </p>
              </div>

              <div className="rounded-2xl surface-card p-6 space-y-3 shadow-xs">
                <div className="w-9 h-9 rounded-xl badge-accent flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-ink">
                  Authentic Dining & Cultural Etiquette
                </h3>
                <p className="text-xs sm:text-sm text-body leading-relaxed">
                  Recommends heritage tiffin rooms, Kodava homestays, temple dress codes, and forest
                  checkpost timings for every stop.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Upcoming Festivals & Regional Cuisine Section */}
        <section className="py-16 lg:py-20 border-b border-hairline">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* Festivals Header + Filter */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    Cultural Calendar
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-editorial font-normal tracking-tight text-ink mt-1">
                    Festivals & Regional Gatherings
                  </h2>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {['All', 'October', 'November', 'January', 'February', 'March'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFestivalMonthFilter(m)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        festivalMonthFilter === m
                          ? 'btn-primary font-semibold'
                          : 'surface-card text-body'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredFestivals.slice(0, 6).map((fest) => (
                  <div key={fest.id} className="rounded-2xl surface-card p-5 space-y-3 shadow-xs">
                    <div
                      className="flex items-center justify-between text-xs font-semibold"
                      style={{ color: 'var(--accent-text)' }}
                    >
                      <span>{fest.month}</span>
                      <span>{fest.locationName}</span>
                    </div>
                    <h3 className="text-base font-bold text-ink">{fest.name}</h3>
                    <p className="text-xs text-body leading-relaxed">{fest.description}</p>
                    <div className="pt-2 border-t border-hairline text-xs text-body">
                      <strong className="text-ink">Don’t Miss:</strong> {fest.ritualHighlight}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Cuisine Strip */}
            <div className="space-y-5">
              <div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Regional Kitchens
                </span>
                <h3 className="text-2xl sm:text-3xl font-editorial font-normal tracking-tight text-ink mt-1">
                  Six Iconic Dishes Across Karnataka
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {KARNATAKA_DISHES.map((dish) => (
                  <div
                    key={dish.id}
                    className="rounded-2xl surface-card overflow-hidden flex items-center gap-4 p-4 shadow-xs"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                      <DestinationArtwork
                        destinationId={dish.originCity.toLowerCase().split(',')[0].trim()}
                        archetype="cuisine"
                        title={dish.name}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="min-w-0">
                      <div
                        className="text-[11px] font-semibold"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        {dish.originCity} · {dish.dietary}
                      </div>
                      <h4 className="text-sm font-bold text-ink truncate mt-0.5">{dish.name}</h4>
                      <p className="text-xs text-body line-clamp-2 mt-1 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 7. Personalized Traveler Workspace */}
        <section id="workspace-section" className="py-16 lg:py-20 border-b border-hairline">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
            <PersonalizedDashboardSection
              user={user}
              onUserUpdated={setUser}
              activeItinerary={activeItinerary}
              onLoadItinerary={(itinerary) => {
                setActiveItinerary(itinerary);
                scrollToSection('planner-section');
              }}
              onOpenDestinationGuide={(dest) => setModalDestination(dest)}
              isLightTheme={isLightTheme}
            />
          </div>
        </section>

        {/* 8. Traveler Stories & Reviews */}
        <section className="py-16 lg:py-20 border-b border-hairline">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="max-w-2xl">
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent-text)' }}
              >
                Traveler Stories
              </span>
              <h2 className="text-3xl sm:text-4xl font-editorial font-normal tracking-tight text-ink mt-1">
                Notes from recent journeys across the state
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((item) => (
                <div
                  key={item.author}
                  className="rounded-2xl surface-card p-6 flex flex-col justify-between space-y-6 shadow-xs"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-1"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-mono-tabular text-caption">
                        {item.metric}
                      </span>
                    </div>
                    <p className="text-sm text-body leading-relaxed">&ldquo;{item.quote}&rdquo;</p>
                  </div>

                  <div className="pt-4 border-t border-hairline">
                    <div className="text-sm font-bold text-ink">{item.author}</div>
                    <div className="text-xs text-caption mt-0.5">{item.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Membership / Pricing Section */}
        <section id="pricing-section" className="py-16 lg:py-20 border-b border-hairline">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="max-w-xl">
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--accent-text)' }}
                >
                  Membership
                </span>
                <h2 className="text-3xl sm:text-4xl font-editorial font-normal tracking-tight text-ink mt-1">
                  Simple plans for solo travelers and families
                </h2>
                <p className="text-sm text-body mt-1">
                  Plan your itinerary for free, or upgrade for offline ghat maps and private
                  estate coordination.
                </p>
              </div>

              <div className="inline-flex items-center p-1 rounded-xl surface-subtle">
                <button
                  type="button"
                  onClick={() => setAnnualBilling(true)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    annualBilling ? 'btn-primary' : 'text-body'
                  }`}
                >
                  Annual (Save 25%)
                </button>
                <button
                  type="button"
                  onClick={() => setAnnualBilling(false)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    !annualBilling ? 'btn-primary' : 'text-body'
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {selectedPlanNotice && (
              <div className="p-4 rounded-xl badge-accent text-xs font-medium flex items-center justify-between">
                <span>{selectedPlanNotice}</span>
                <button
                  type="button"
                  onClick={() => setSelectedPlanNotice(null)}
                  className="underline font-semibold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING_PLANS.map((plan) => {
                const price = annualBilling ? plan.annualINR : plan.monthlyINR;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-2xl surface-card p-6 sm:p-7 flex flex-col justify-between transition-all ${
                      plan.highlighted
                        ? 'ring-2 ring-[#0F5338] shadow-md'
                        : 'shadow-xs'
                    }`}
                  >
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-ink">{plan.name}</h3>
                        <span className="px-2.5 py-0.5 rounded-full badge-accent text-[11px] font-semibold">
                          {plan.badge}
                        </span>
                      </div>

                      <p className="text-xs text-body leading-relaxed">{plan.tagline}</p>

                      <div className="pt-2 border-t border-hairline">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold font-mono-tabular text-ink">
                            {price === 0 ? 'Free' : `INR ${price.toLocaleString()}`}
                          </span>
                          {price > 0 && (
                            <span className="text-xs text-caption font-mono-tabular">/ month</span>
                          )}
                        </div>
                      </div>

                      <ul className="space-y-2.5 pt-2 text-xs">
                        {plan.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2 text-body">
                            <Check
                              className="w-4 h-4 shrink-0 mt-0.5"
                              style={{ color: 'var(--accent-text)' }}
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanNotice(
                          `${plan.name} selected. You can now customize and save your route below.`
                        );
                        scrollToSection('planner-section');
                      }}
                      className={`mt-8 w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        plan.highlighted
                          ? 'btn-primary'
                          : 'surface-subtle text-ink hover:opacity-85'
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* 10. Clean Multi-Column Footer */}
      <footer className="py-14 text-xs surface-subtle border-t border-hairline">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg btn-primary flex items-center justify-center font-editorial text-base">
                  N
                </div>
                <span className="font-bold text-sm text-ink">Namma Karnataka Explorer</span>
              </div>
              <p className="text-xs text-body max-w-sm leading-relaxed">
                Thoughtful route planning and cultural field guides across Karnataka’s UNESCO
                monuments, Western Ghats coffee estates, and Arabian Sea coast.
              </p>
              <div className="text-[11px] font-mono-tabular text-caption">
                Bengaluru, Karnataka · 12.97°N, 77.59°E
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="font-bold text-ink text-xs">Explore</div>
              <ul className="space-y-2 text-body">
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('destinations-section')}
                    className="hover:text-ink transition-colors cursor-pointer"
                  >
                    16 Destinations
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('planner-section')}
                    className="hover:text-ink transition-colors cursor-pointer"
                  >
                    Itinerary Builder
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => scrollToSection('map-section')}
                    className="hover:text-ink transition-colors cursor-pointer"
                  >
                    Google Maps & 3D
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="hover:text-ink transition-colors cursor-pointer"
                  >
                    Trip Assistant
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="font-bold text-ink text-xs">Popular Circuits</div>
              <ul className="space-y-2 text-body">
                <li>Hampi, Badami & Pattadakal</li>
                <li>Coorg & Chikmagalur Estates</li>
                <li>Gokarna, Udupi & Karavali Coast</li>
                <li>Kabini & Bandipur Wildlife</li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <div className="font-bold text-ink text-xs">Maps & Data</div>
              <ul className="space-y-2 text-body">
                <li>
                  <a
                    href="https://maps.google.com/help/terms_maps/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink transition-colors"
                  >
                    Google Maps Terms
                  </a>
                </li>
                <li>
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-ink transition-colors"
                  >
                    Google Privacy Policy
                  </a>
                </li>
                <li>Open-Meteo Weather Feed</li>
                <li>Karnataka Tourism Archives</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-caption">
            <div>© {new Date().getFullYear()} Namma Karnataka Explorer. All rights reserved.</div>
            <div>
              Integrates Google Maps features subject to Google Maps End User Additional Terms of
              Service and Google Privacy Policy.
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Destination Guide Modal */}
      <InteractiveDestinationModal
        destination={modalDestination}
        onClose={() => setModalDestination(null)}
        weather={modalDestination ? weatherMap[modalDestination.id] : undefined}
        isBookmarked={
          modalDestination
            ? Boolean(user?.preferences?.bookmarkedDestinationIds?.includes(modalDestination.id))
            : false
        }
        onToggleBookmark={handleToggleBookmark}
        userInterests={activeItinerary.input.interests}
        onAddToActiveItinerary={handleAddDestinationToItinerary}
      />

      {/* Conversational Trip Assistant Drawer */}
      <AIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onApplyItinerary={(itinerary) => {
          setActiveItinerary(itinerary);
          setIsChatOpen(false);
          scrollToSection('planner-section');
        }}
      />
    </div>
  );
};
