import React, { useState } from 'react';
import {
  AccommodationStyle,
  ALL_INTERESTS,
  Destination,
  KARNATAKA_DESTINATIONS,
  RouteOptimizeMode,
  TransportationMode,
  TravelBudget,
  TravelDuration,
  TravelInterest,
  TravelPartner,
} from '../data/karnatakaData';
import { GeneratedItinerary, PlannerInput } from '../utils/plannerEngine';
import { DestinationWeatherInfo } from './InteractiveDestinationModal';
import { DestinationArtwork } from './DestinationArtwork';
import {
  Bookmark,
  Camera,
  CloudSun,
  Coffee,
  Compass,
  Navigation,
  Sun,
} from 'lucide-react';

interface AITripPlannerProps {
  activeItinerary: GeneratedItinerary;
  onUpdateItinerary: (itinerary: GeneratedItinerary) => void;
  weatherMap: Record<string, DestinationWeatherInfo>;
  onOpenDestinationGuide: (dest: Destination) => void;
  onSaveToDashboard: () => void;
  isLightTheme: boolean;
}

const DURATIONS: TravelDuration[] = ['Weekend', '3 Days', '5 Days', '7 Days', '10+ Days'];
const BUDGETS: TravelBudget[] = ['Budget', 'Mid-range', 'Premium', 'Luxury'];
const PARTNERS: TravelPartner[] = ['Solo', 'Couple', 'Family', 'Friends', 'Senior Citizens'];
const TRANSPORTS: TransportationMode[] = ['Bike', 'Car', 'Public Transport', 'Taxi'];
const ACCOMMODATIONS: AccommodationStyle[] = [
  'Hostel',
  'Homestay',
  'Hotel',
  'Resort',
  'Luxury Stay',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const AITripPlanner: React.FC<AITripPlannerProps> = ({
  activeItinerary,
  onUpdateItinerary,
  weatherMap,
  onOpenDestinationGuide,
  onSaveToDashboard,
}) => {
  const [duration, setDuration] = useState<TravelDuration>(activeItinerary.input.duration);
  const [budget, setBudget] = useState<TravelBudget>(activeItinerary.input.budget);
  const [interests, setInterests] = useState<TravelInterest[]>(activeItinerary.input.interests);
  const [partner, setPartner] = useState<TravelPartner>(activeItinerary.input.partner);
  const [transport, setTransport] = useState<TransportationMode>(
    activeItinerary.input.transport || 'Car'
  );
  const [accommodation, setAccommodation] = useState<AccommodationStyle>(
    activeItinerary.input.accommodation
  );
  const [routeMode, setRouteMode] = useState<RouteOptimizeMode>(
    activeItinerary.input.routeMode || 'scenic'
  );
  const [travelMonth, setTravelMonth] = useState<string>(
    activeItinerary.input.travelMonth || 'November'
  );
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const toggleInterest = (interest: TravelInterest) => {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.length > 1
          ? prev.filter((i) => i !== interest)
          : prev
        : [...prev, interest]
    );
  };

  const handleSynthesize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const payload: PlannerInput = {
        duration,
        budget,
        interests,
        partner,
        transport,
        accommodation,
        routeMode,
        travelMonth,
      };
      const res = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        const nextItinerary: GeneratedItinerary = data.itinerary || data;
        if (nextItinerary && nextItinerary.dailySchedule) {
          onUpdateItinerary(nextItinerary);
          setSelectedDay(1);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveClick = () => {
    onSaveToDashboard();
    setSaveMessage('Saved to Trips');
    setTimeout(() => setSaveMessage(null), 2500);
  };

  const schedule = activeItinerary.dailySchedule || [];
  const currentDayPlan = schedule.find((d) => d.day === selectedDay) || schedule[0];
  const currentDest = KARNATAKA_DESTINATIONS.find((d) => d.id === currentDayPlan?.destinationId);
  const currentWeather = currentDest ? weatherMap[currentDest.id] : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left 4 Columns: Trip Preferences Form */}
      <form
        onSubmit={handleSynthesize}
        className="lg:col-span-4 rounded-2xl surface-card p-6 space-y-5 shadow-xs"
        data-testid="planner-form"
      >
        <div className="border-b border-hairline pb-4">
          <h3 className="text-lg font-bold tracking-tight text-ink">Trip Preferences</h3>
          <p className="text-xs text-caption mt-0.5">
            Select your pace, travel style, and interests.
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-semibold text-body mb-2">Trip Length</label>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 gap-1.5">
            {DURATIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDuration(item)}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  duration === item
                    ? 'btn-primary font-semibold shadow-xs'
                    : 'surface-subtle text-body hover:opacity-80'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Tier */}
        <div>
          <label className="block text-xs font-semibold text-body mb-2">Comfort & Budget</label>
          <div className="grid grid-cols-2 gap-1.5">
            {BUDGETS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setBudget(item)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  budget === item
                    ? 'btn-primary font-semibold shadow-xs'
                    : 'surface-subtle text-body hover:opacity-80'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Interests Multi-Select */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-body">
              Interests ({interests.length} selected)
            </label>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
            {ALL_INTERESTS.map((interest) => {
              const active = interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    active
                      ? 'badge-accent font-semibold border border-current/25'
                      : 'surface-subtle text-caption hover:text-ink'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* Travel Partner & Month */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-body mb-1.5">Traveling With</label>
            <select
              value={partner}
              onChange={(e) => setPartner(e.target.value as TravelPartner)}
              className="w-full rounded-lg px-3 py-2 text-xs font-medium surface-subtle text-ink focus:outline-none"
            >
              {PARTNERS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-body mb-1.5">Month</label>
            <select
              value={travelMonth}
              onChange={(e) => setTravelMonth(e.target.value)}
              className="w-full rounded-lg px-3 py-2 text-xs font-medium surface-subtle text-ink focus:outline-none"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transport & Stay */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-body mb-1.5">Transport</label>
            <select
              value={transport}
              onChange={(e) => setTransport(e.target.value as TransportationMode)}
              className="w-full rounded-lg px-3 py-2 text-xs font-medium surface-subtle text-ink focus:outline-none"
            >
              {TRANSPORTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-body mb-1.5">Stay Style</label>
            <select
              value={accommodation}
              onChange={(e) => setAccommodation(e.target.value as AccommodationStyle)}
              className="w-full rounded-lg px-3 py-2 text-xs font-medium surface-subtle text-ink focus:outline-none"
            >
              {ACCOMMODATIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Route Pacing */}
        <div>
          <label className="block text-xs font-semibold text-body mb-1.5">Route Preference</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'scenic', label: 'Scenic Ghats' },
                { id: 'fastest', label: 'Direct Roads' },
                { id: 'comfort', label: 'Relaxed Pace' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setRouteMode(opt.id)}
                className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  routeMode === opt.id
                    ? 'badge-accent font-semibold border border-current/25'
                    : 'surface-subtle text-caption'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          data-testid="generate-itinerary-btn"
          className="w-full py-3 px-4 rounded-xl btn-primary disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          {isGenerating ? 'Building Your Route...' : 'Update Itinerary'}
        </button>
      </form>

      {/* Right 8 Columns: Generated Itinerary Output */}
      <div className="lg:col-span-8 rounded-2xl surface-card p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Top Summary Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-hairline pb-5">
          <div>
            <div
              className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: 'var(--accent-text)' }}
            >
              <span>{activeItinerary.numDays}-Day Road Trip</span>
              <span>•</span>
              <span>{activeItinerary.routeMetrics.totalDistanceKm} km Total Drive</span>
              <span>•</span>
              <span>{activeItinerary.routeMetrics.elevationGainMeters}m Elevation Change</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-editorial font-normal tracking-tight text-ink mt-1">
              {activeItinerary.title}
            </h3>
            <p className="text-xs sm:text-sm text-body mt-1.5 max-w-2xl leading-relaxed">
              {activeItinerary.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSaveClick}
              data-testid="save-itinerary-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-xs font-semibold transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              {saveMessage || 'Save Trip'}
            </button>
          </div>
        </div>

        {/* Key Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl surface-subtle">
            <span className="text-[11px] text-caption block">Estimated Total</span>
            <span className="text-base font-bold font-mono-tabular text-ink mt-0.5 block">
              INR {activeItinerary.budgetBreakdown.totalTripCost.toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 rounded-xl surface-subtle">
            <span className="text-[11px] text-caption block">Daily Average</span>
            <span className="text-base font-bold font-mono-tabular text-ink mt-0.5 block">
              INR {activeItinerary.budgetBreakdown.dailyAverage.toLocaleString()}
            </span>
          </div>
          <div className="p-3.5 rounded-xl surface-subtle">
            <span className="text-[11px] text-caption block">Road Distance</span>
            <span className="text-base font-bold font-mono-tabular text-ink mt-0.5 block">
              {activeItinerary.routeMetrics.totalDistanceKm} km
            </span>
          </div>
          <div className="p-3.5 rounded-xl surface-subtle">
            <span className="text-[11px] text-caption block">Ideal Season</span>
            <span className="text-sm font-semibold text-ink mt-0.5 block truncate">
              {activeItinerary.smartRecommendations.bestSeason}
            </span>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {schedule.map((dayItem) => {
            const active = dayItem.day === selectedDay;
            return (
              <button
                key={dayItem.day}
                type="button"
                onClick={() => setSelectedDay(dayItem.day)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'btn-primary shadow-xs'
                    : 'surface-subtle text-body hover:text-ink'
                }`}
              >
                Day {dayItem.day}: {dayItem.destinationName}
              </button>
            );
          })}
        </div>

        {/* Active Day Card with Destination Photography & Schedule */}
        {currentDayPlan && (
          <div className="rounded-2xl surface-subtle overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12">
              {/* Destination Image Column */}
              <div className="md:col-span-5 relative min-h-[240px] group">
                <DestinationArtwork
                  destinationId={currentDayPlan.destinationId}
                  archetype={currentDest?.archetype || 'mountains'}
                  title={currentDayPlan.destinationName}
                  overlayGradient={true}
                  className="w-full h-full min-h-[240px]"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-medium text-stone-200 block">
                      {currentDayPlan.region} • {currentDayPlan.elevationMeters}m
                    </span>
                    <h4 className="text-xl font-bold text-white">
                      {currentDayPlan.destinationName}
                    </h4>
                  </div>
                  {currentDest && (
                    <button
                      type="button"
                      onClick={() => onOpenDestinationGuide(currentDest)}
                      className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-stone-900 text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-sm"
                    >
                      Read Guide
                    </button>
                  )}
                </div>
              </div>

              {/* Day Schedule Column */}
              <div className="md:col-span-7 p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-3">
                  <div
                    className="flex items-center gap-2 text-xs font-semibold"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{currentDayPlan.travelRouteInfo}</span>
                  </div>
                  {currentWeather && (
                    <div className="flex items-center gap-1.5 text-xs font-mono-tabular text-body">
                      <CloudSun className="w-3.5 h-3.5" />
                      <span>
                        {currentWeather.currentTempC}°C • {currentWeather.condition}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
                      Morning Start
                    </span>
                    <p className="text-body leading-relaxed">
                      {currentDayPlan.wakeUpRecommendation}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
                      Breakfast Stop
                    </span>
                    <p className="text-body leading-relaxed">
                      {currentDayPlan.breakfastSuggestion}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
                      Daytime Exploration
                    </span>
                    <p className="text-body leading-relaxed">
                      {currentDayPlan.sightseeingPlan}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-ink flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" style={{ color: 'var(--accent-text)' }} />
                      Evening & Sunset
                    </span>
                    <p className="text-body leading-relaxed">
                      {currentDayPlan.eveningExperience}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-hairline flex flex-wrap items-center justify-between gap-2 text-xs text-body">
                  <span>
                    <strong className="text-ink">Regional Specialty:</strong>{' '}
                    {currentDayPlan.localFoodSuggestion}
                  </span>
                  <span className="font-mono-tabular font-semibold text-ink">
                    Est. INR {activeItinerary.budgetBreakdown.dailyAverage.toLocaleString()}/day
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Local Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="p-4 rounded-xl surface-subtle">
            <span className="text-xs font-semibold text-ink block mb-1">
              Weather & Packing Notes
            </span>
            <p className="text-xs text-body leading-relaxed">
              {activeItinerary.smartRecommendations.weatherInsights}
            </p>
          </div>
          <div className="p-4 rounded-xl surface-subtle">
            <span className="text-xs font-semibold text-ink block mb-1">
              Quiet Detours Nearby
            </span>
            <p className="text-xs text-body leading-relaxed">
              {activeItinerary.smartRecommendations.hiddenGems
                .slice(0, 2)
                .map((g) => `${g.name} (${g.destinationName})`)
                .join(' • ')}
            </p>
          </div>
          <div className="p-4 rounded-xl surface-subtle">
            <span className="text-xs font-semibold text-ink block mb-1">
              Local Timing Advice
            </span>
            <p className="text-xs text-body leading-relaxed">
              {activeItinerary.smartRecommendations.crowdPredictions}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
