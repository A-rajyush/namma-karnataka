import React, { useEffect, useState } from 'react';
import { Destination, TravelInterest } from '../data/karnatakaData';
import { DestinationArtwork } from './DestinationArtwork';
import {
  Bookmark,
  Camera,
  Clock,
  CloudSun,
  Compass,
  ShieldCheck,
  Utensils,
  X,
} from 'lucide-react';

export interface WeatherForecastDay {
  date: string;
  dayLabel: string;
  tempMaxC: number;
  tempMinC: number;
  rainChancePct: number;
  condition: string;
}

export interface DestinationWeatherInfo {
  destinationId: string;
  destinationName: string;
  currentTempC: number;
  humidityPct: number;
  windKmh: number;
  condition: string;
  uvAdvisory: string;
  forecast: WeatherForecastDay[];
}

interface InteractiveDestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  weather?: DestinationWeatherInfo;
  isBookmarked: boolean;
  onToggleBookmark: (destId: string) => void;
  userInterests: TravelInterest[];
  onAddToActiveItinerary: (dest: Destination) => void;
}

export const InteractiveDestinationModal: React.FC<InteractiveDestinationModalProps> = ({
  destination,
  onClose,
  weather,
  isBookmarked,
  onToggleBookmark,
  userInterests,
  onAddToActiveItinerary,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customs' | 'hidden' | 'weather'>(
    'overview'
  );
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (!destination) return;
    setActiveTab('overview');
    setAiInsight('');
  }, [destination]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (destination) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [destination, onClose]);

  if (!destination) return null;

  const handleRequestAiCuratorInsight = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/ai/destination-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationId: destination.id,
          interests: userInterests,
        }),
      });
      const data = await res.json();
      if (data.aiCuratorInsight) {
        setAiInsight(data.aiCuratorInsight);
      }
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="destination-guide-modal-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl surface-card shadow-2xl">
        {/* Header Hero Banner */}
        <div className="relative h-64 w-full">
          <DestinationArtwork
            destinationId={destination.id}
            archetype={destination.archetype}
            accentHex={destination.accentHex}
            title={destination.name}
            overlayGradient={true}
            className="w-full h-full"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close destination guide"
            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-black/65 text-white hover:bg-black/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-5 left-6 right-6 z-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs text-stone-200 font-medium">
                {destination.region} · {destination.elevationMeters}m Elevation ·{' '}
                {destination.bestSeason}
              </div>
              <h2
                id="destination-guide-modal-title"
                className="text-3xl md:text-4xl font-editorial font-normal text-white mt-1"
              >
                {destination.name}{' '}
                <span className="text-lg font-sans font-normal text-stone-200 ml-1">
                  ({destination.kannadaName})
                </span>
              </h2>
              <p className="text-sm text-stone-200 mt-1 max-w-xl">{destination.tagline}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleBookmark(destination.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-white text-stone-900 border-white'
                    : 'bg-black/60 text-white border-white/25 hover:bg-black/80'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>

              <button
                type="button"
                onClick={() => onAddToActiveItinerary(destination)}
                className="px-4 py-2 text-xs font-semibold rounded-xl btn-primary transition-colors cursor-pointer shadow-sm"
              >
                Include in Trip Plan
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-hairline flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2" role="tablist">
            {(
              [
                { id: 'overview', label: 'History & Culture' },
                { id: 'customs', label: 'Etiquette & Timing' },
                { id: 'hidden', label: 'Quiet Detours & Photo Spots' },
                { id: 'weather', label: '5-Day Weather' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 px-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-current text-ink'
                    : 'border-transparent text-caption hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRequestAiCuratorInsight}
            disabled={loadingAi}
            className="mb-2 px-3 py-1.5 text-xs font-semibold rounded-lg badge-accent hover:opacity-85 transition-opacity cursor-pointer"
          >
            {loadingAi ? 'Loading Field Note...' : 'Generate Personalized Note'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {aiInsight && (
            <div className="p-4 rounded-xl surface-subtle text-sm text-ink leading-relaxed">
              <div
                className="text-xs font-semibold mb-1"
                style={{ color: 'var(--accent-text)' }}
              >
                Tailored Field Note for Your Interests ({userInterests.slice(0, 3).join(', ')})
              </div>
              <p className="text-body">{aiInsight}</p>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl surface-subtle space-y-2">
                  <h3 className="text-sm font-bold text-ink">Historical Context</h3>
                  <p className="text-sm text-body leading-relaxed">
                    {destination.guide.history}
                  </p>
                </div>
                <div className="p-5 rounded-xl surface-subtle space-y-2">
                  <h3 className="text-sm font-bold text-ink">Living Culture & Traditions</h3>
                  <p className="text-sm text-body leading-relaxed">
                    {destination.guide.culture}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl surface-subtle space-y-1.5">
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Breakfast Stop</span>
                  </div>
                  <p className="text-xs text-body leading-relaxed">
                    {destination.guide.breakfastSpot}
                  </p>
                </div>
                <div className="p-4 rounded-xl surface-subtle space-y-1.5">
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Regional Lunch</span>
                  </div>
                  <p className="text-xs text-body leading-relaxed">
                    {destination.guide.lunchSpot}
                  </p>
                </div>
                <div className="p-4 rounded-xl surface-subtle space-y-1.5">
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold"
                    style={{ color: 'var(--accent-text)' }}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Evening Dining</span>
                  </div>
                  <p className="text-xs text-body leading-relaxed">
                    {destination.guide.dinnerSpot}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customs' && (
            <div className="space-y-4">
              <div className="p-5 rounded-xl surface-subtle space-y-2">
                <div
                  className="flex items-center gap-2 text-xs font-semibold"
                  style={{ color: 'var(--accent-text)' }}
                >
                  <Clock className="w-4 h-4" />
                  <span>Best Visiting Hours & Seasons</span>
                </div>
                <p className="text-sm text-body leading-relaxed">
                  {destination.guide.bestVisitingTimes}
                </p>
              </div>

              <div className="p-5 rounded-xl surface-subtle space-y-3">
                <h3 className="text-sm font-bold text-ink">Local Customs & Etiquette</h3>
                <ul className="space-y-2 text-sm text-body">
                  {destination.guide.localCustoms.map((custom, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span
                        className="font-mono-tabular text-xs font-bold mt-0.5"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        0{i + 1}
                      </span>
                      <span>{custom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl surface-subtle flex items-start gap-3">
                <ShieldCheck
                  className="w-4 h-4 shrink-0 mt-0.5"
                  style={{ color: 'var(--accent-text)' }}
                />
                <div className="text-xs text-body leading-relaxed">
                  <strong className="text-ink">Traveler Note:</strong>{' '}
                  {destination.guide.safetyNote}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hidden' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {destination.guide.hiddenAttractions.map((gem, idx) => (
                  <div key={idx} className="p-5 rounded-xl surface-subtle space-y-1.5">
                    <div
                      className="text-xs font-semibold flex items-center gap-1.5"
                      style={{ color: 'var(--accent-text)' }}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Quiet Detour 0{idx + 1}</span>
                    </div>
                    <h4 className="text-base font-bold text-ink">{gem.name}</h4>
                    <p className="text-xs text-body leading-relaxed">{gem.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-xl surface-subtle space-y-3">
                <div
                  className="flex items-center gap-2 text-xs font-semibold"
                  style={{ color: 'var(--accent-text)' }}
                >
                  <Camera className="w-4 h-4" />
                  <span>Recommended Vantage Points</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {destination.guide.photographySpots.map((spot, i) => (
                    <div key={i} className="p-3 rounded-lg surface-card text-xs font-medium text-ink">
                      {spot}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'weather' && (
            <div className="space-y-4">
              {weather ? (
                <>
                  <div className="p-5 rounded-xl surface-subtle flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-caption">Current Conditions</div>
                      <div className="text-2xl font-bold font-mono-tabular text-ink mt-0.5">
                        {weather.currentTempC}°C — {weather.condition}
                      </div>
                      <div className="text-xs text-body mt-1">{weather.uvAdvisory}</div>
                    </div>
                    <div className="flex gap-6 text-xs font-mono-tabular text-body">
                      <div>
                        <span className="text-caption block">Humidity</span>
                        <strong className="text-ink">{weather.humidityPct}%</strong>
                      </div>
                      <div>
                        <span className="text-caption block">Wind</span>
                        <strong className="text-ink">{weather.windKmh} km/h</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {weather.forecast.map((f) => (
                      <div key={f.date} className="p-3.5 rounded-xl surface-subtle text-xs space-y-1">
                        <div className="font-semibold text-ink">{f.dayLabel}</div>
                        <div className="text-caption">{f.condition}</div>
                        <div className="font-mono-tabular font-bold text-ink pt-1">
                          {f.tempMaxC}° / {f.tempMinC}°C
                        </div>
                        <div className="text-[11px] text-caption">
                          Rain: {f.rainChancePct}%
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="p-6 rounded-xl surface-subtle text-sm text-body">
                  Weather forecast is loading for {destination.name}...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
