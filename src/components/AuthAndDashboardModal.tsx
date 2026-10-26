import React, { useState } from 'react';
import {
  AccommodationStyle,
  ALL_INTERESTS,
  Destination,
  KARNATAKA_DESTINATIONS,
  TravelBudget,
  TravelInterest,
} from '../data/karnatakaData';
import { GeneratedItinerary, UserPreferences, validateAuthInput } from '../utils/plannerEngine';
import {
  Bookmark,
  Compass,
  History,
  LogOut,
  PlusCircle,
  Settings,
  Trash2,
} from 'lucide-react';

export interface TravelHistoryItem {
  id: string;
  destinationId: string;
  destinationName: string;
  visitedDate: string;
  durationDays: number;
  rating: number;
  notes: string;
  totalSpentINR: number;
}

export interface ClientUserAccount {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  memberSince: string;
  tier: string;
  preferences: UserPreferences;
  savedItineraries: GeneratedItinerary[];
  travelHistory: TravelHistoryItem[];
}

interface PersonalizedDashboardSectionProps {
  user: ClientUserAccount | null;
  onUserUpdated: (user: ClientUserAccount | null) => void;
  activeItinerary: GeneratedItinerary;
  onLoadItinerary: (itinerary: GeneratedItinerary) => void;
  onOpenDestinationGuide: (dest: Destination) => void;
  isLightTheme: boolean;
}

export const PersonalizedDashboardSection: React.FC<PersonalizedDashboardSectionProps> = ({
  user,
  onUserUpdated,
  activeItinerary,
  onLoadItinerary,
  onOpenDestinationGuide,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [statusBanner, setStatusBanner] = useState('');

  // History log state
  const [histDestId, setHistDestId] = useState('hampi');
  const [histDate, setHistDate] = useState('2026-09-15');
  const [histDays, setHistDays] = useState(3);
  const [histCost, setHistCost] = useState(18500);
  const [histNotes, setHistNotes] = useState('');
  const [historyFormError, setHistoryFormError] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const check = validateAuthInput(email, password, fullName, authMode === 'signup');
    if (!check.valid) {
      setAuthError(check.error || 'Invalid credentials');
      return;
    }

    const endpoint = authMode === 'signup' ? '/api/auth/signup' : '/api/auth/signin';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fullName,
        email,
        password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthError(data.error || 'Authentication failed.');
      return;
    }

    onUserUpdated(data.user);
    setEmail('');
    setPassword('');
    setFullName('');
    setStatusBanner(`Signed in as ${data.user.name}`);
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    onUserUpdated(null);
    setStatusBanner('Signed out. Sign in below to access your saved itineraries.');
  };

  const handleSaveCurrentItinerary = async () => {
    const res = await fetch('/api/user/itineraries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itinerary: activeItinerary }),
    });
    const data = await res.json();
    if (data.user) {
      onUserUpdated(data.user);
      setStatusBanner(`Saved "${activeItinerary.title}" to your trips.`);
    }
  };

  const handleDeleteSavedItinerary = async (id: string) => {
    const res = await fetch(`/api/user/itineraries/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.user) {
      onUserUpdated(data.user);
      setStatusBanner('Removed itinerary from saved trips.');
    }
  };

  const handleTogglePreferredInterest = async (interest: TravelInterest) => {
    if (!user) return;
    const current = user.preferences.preferredInterests;
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];

    const res = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferredInterests: updated }),
    });
    const data = await res.json();
    if (data.user) {
      onUserUpdated(data.user);
      setStatusBanner('Updated your travel preferences.');
    }
  };

  const handleUpdateBudgetOrStay = async (
    preferredBudget?: TravelBudget,
    preferredAccommodation?: AccommodationStyle
  ) => {
    if (!user) return;
    const res = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        preferredBudget: preferredBudget || user.preferences.preferredBudget,
        preferredAccommodation: preferredAccommodation || user.preferences.preferredAccommodation,
      }),
    });
    const data = await res.json();
    if (data.user) {
      onUserUpdated(data.user);
      setStatusBanner('Saved travel style preferences.');
    }
  };

  const handleAddTravelHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    setHistoryFormError('');
    if (!histDate) {
      setHistoryFormError('Please select the date of your trip.');
      return;
    }
    const res = await fetch('/api/user/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destinationId: histDestId,
        visitedDate: histDate,
        durationDays: histDays,
        rating: 5,
        notes: histNotes.trim() || `Completed a ${histDays}-day trip.`,
        totalSpentINR: histCost,
      }),
    });
    const data = await res.json();
    if (data.user) {
      onUserUpdated(data.user);
      setHistNotes('');
      setStatusBanner('Added trip to your Karnataka Travel Log.');
    }
  };

  const totalHistoricalSpend =
    user?.travelHistory.reduce((acc, item) => acc + item.totalSpentINR, 0) || 0;

  const bookmarkedDestinations = KARNATAKA_DESTINATIONS.filter((d) =>
    user?.preferences.bookmarkedDestinationIds.includes(d.id)
  );

  return (
    <div id="dashboard" className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--accent-text)' }}
          >
            Personal Account
          </span>
          <h2 className="text-2xl sm:text-3xl font-editorial font-normal tracking-tight text-ink mt-1">
            Saved Trips, Bookmarks & Travel Log
          </h2>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-2 rounded-xl surface-card flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full btn-primary font-bold text-xs flex items-center justify-center">
                {user.avatarInitials}
              </div>
              <div className="text-xs">
                <div className="font-semibold text-ink">{user.name}</div>
                <div className="text-caption">
                  {user.email} · {user.tier}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3.5 py-2 text-xs font-medium rounded-xl surface-subtle text-body hover:text-red-600 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {statusBanner && (
        <div
          role="status"
          className="px-4 py-3 rounded-xl badge-accent text-xs font-medium flex items-center justify-between"
        >
          <span>{statusBanner}</span>
          <button
            type="button"
            onClick={() => setStatusBanner('')}
            className="text-xs underline ml-4 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {!user ? (
        <div className="max-w-md mx-auto p-6 rounded-2xl surface-card shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-ink">
              {authMode === 'signin' ? 'Sign In to Your Account' : 'Create Traveler Account'}
            </h3>
            <div className="flex gap-1 surface-subtle p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError('');
                }}
                className={`px-2.5 py-1 text-xs rounded-md cursor-pointer ${
                  authMode === 'signin' ? 'btn-primary font-semibold' : 'text-caption'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
                className={`px-2.5 py-1 text-xs rounded-md cursor-pointer ${
                  authMode === 'signup' ? 'btn-primary font-semibold' : 'text-caption'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4" noValidate>
            {authMode === 'signup' && (
              <div>
                <label htmlFor="auth-fullname" className="block text-xs font-medium text-body mb-1">
                  Full Name
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aarav Rao"
                  className="w-full px-3.5 py-2 rounded-lg surface-subtle text-ink text-sm focus:outline-none"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-body mb-1">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@karnataka.in"
                className="w-full px-3.5 py-2 rounded-lg surface-subtle text-ink text-sm focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-body mb-1">
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 rounded-lg surface-subtle text-ink text-sm focus:outline-none"
              />
            </div>

            {authError && (
              <div role="alert" className="text-xs text-red-600 font-medium">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl btn-primary font-semibold text-xs cursor-pointer"
            >
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>

            <div className="pt-3 border-t border-hairline text-[11px] text-caption flex items-center justify-between">
              <span>Demo Account: aarav@karnataka.in</span>
              <button
                type="button"
                onClick={() => {
                  setEmail('aarav@karnataka.in');
                  setPassword('karnataka123');
                  setAuthMode('signin');
                }}
                className="underline font-medium cursor-pointer"
                style={{ color: 'var(--accent-text)' }}
              >
                Fill Demo Credentials
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column 1: Saved Itineraries & Bookmarks (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl surface-card space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
                  <h3 className="text-base font-bold text-ink">
                    Saved Trips ({user.savedItineraries.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleSaveCurrentItinerary}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg badge-accent text-xs font-semibold cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Save Active Route
                </button>
              </div>

              <div className="space-y-3">
                {user.savedItineraries.map((itin) => (
                  <div
                    key={itin.id}
                    className="p-4 rounded-xl surface-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-mono-tabular text-caption">
                        {itin.numDays} Days · {itin.routeMetrics.totalDistanceKm} km · INR{' '}
                        {itin.budgetBreakdown.totalTripCost.toLocaleString()}
                      </div>
                      <h4 className="text-sm font-bold text-ink mt-0.5">{itin.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onLoadItinerary(itin)}
                        className="px-3 py-1.5 rounded-lg btn-primary text-xs font-semibold cursor-pointer"
                      >
                        Load Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSavedItinerary(itin.id)}
                        aria-label={`Remove ${itin.title}`}
                        className="p-1.5 rounded-lg surface-card text-caption hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bookmarked Destinations */}
            <div className="p-6 rounded-2xl surface-card space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
                <h3 className="text-base font-bold text-ink">
                  Bookmarked Destinations ({bookmarkedDestinations.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {bookmarkedDestinations.map((dest) => (
                  <div
                    key={dest.id}
                    onClick={() => onOpenDestinationGuide(dest)}
                    className="p-3.5 rounded-xl surface-subtle flex items-center justify-between cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    <div>
                      <div className="text-[11px] text-caption">{dest.region}</div>
                      <div className="text-sm font-bold text-ink">{dest.name}</div>
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: 'var(--accent-text)' }}
                    >
                      Guide &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Travel History & Preferences (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl surface-card space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
                  <h3 className="text-base font-bold text-ink">Past Trips & Spend Tracker</h3>
                </div>
                <span className="text-xs font-mono-tabular font-semibold text-ink">
                  Total: INR {totalHistoricalSpend.toLocaleString()}
                </span>
              </div>

              <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                {user.travelHistory.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl surface-subtle text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-ink">
                      <span>{item.destinationName}</span>
                      <span className="font-mono-tabular">
                        INR {item.totalSpentINR.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-caption">
                      {item.visitedDate} · {item.durationDays} Days
                    </div>
                    <p className="text-body">{item.notes}</p>
                  </div>
                ))}
              </div>

              <form
                onSubmit={handleAddTravelHistory}
                className="pt-3 border-t border-hairline space-y-3"
                noValidate
              >
                <div className="text-xs font-semibold text-ink">Log a Completed Trip</div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={histDestId}
                    onChange={(e) => setHistDestId(e.target.value)}
                    aria-label="Destination visited"
                    className="rounded-lg px-2.5 py-1.5 text-xs surface-subtle text-ink"
                  >
                    {KARNATAKA_DESTINATIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={histDate}
                    onChange={(e) => setHistDate(e.target.value)}
                    aria-label="Date visited"
                    className="rounded-lg px-2.5 py-1.5 text-xs surface-subtle text-ink"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={histDays}
                    onChange={(e) => setHistDays(Number(e.target.value))}
                    aria-label="Trip duration in days"
                    placeholder="Days"
                    className="rounded-lg px-2.5 py-1.5 text-xs surface-subtle text-ink"
                  />
                  <input
                    type="number"
                    min={500}
                    step={500}
                    value={histCost}
                    onChange={(e) => setHistCost(Number(e.target.value))}
                    aria-label="Total spend in INR"
                    placeholder="Spend (INR)"
                    className="rounded-lg px-2.5 py-1.5 text-xs surface-subtle text-ink"
                  />
                </div>
                {historyFormError && (
                  <p className="text-xs text-red-600">{historyFormError}</p>
                )}
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg btn-primary text-xs font-semibold cursor-pointer"
                >
                  Add to Travel Log
                </button>
              </form>
            </div>

            {/* Preferences */}
            <div className="p-6 rounded-2xl surface-card space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" style={{ color: 'var(--accent-text)' }} />
                <h3 className="text-base font-bold text-ink">Default Travel Style</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-caption mb-1">Preferred Budget</label>
                  <select
                    value={user.preferences.preferredBudget}
                    onChange={(e) =>
                      handleUpdateBudgetOrStay(e.target.value as TravelBudget, undefined)
                    }
                    className="w-full rounded-lg px-2.5 py-1.5 surface-subtle text-ink"
                  >
                    {(['Budget', 'Mid-range', 'Premium', 'Luxury'] as TravelBudget[]).map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-caption mb-1">Preferred Stay</label>
                  <select
                    value={user.preferences.preferredAccommodation}
                    onChange={(e) =>
                      handleUpdateBudgetOrStay(undefined, e.target.value as AccommodationStyle)
                    }
                    className="w-full rounded-lg px-2.5 py-1.5 surface-subtle text-ink"
                  >
                    {(
                      ['Hostel', 'Homestay', 'Hotel', 'Resort', 'Luxury Stay'] as AccommodationStyle[]
                    ).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {ALL_INTERESTS.slice(0, 10).map((interest) => {
                  const active = user.preferences.preferredInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleTogglePreferredInterest(interest)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                        active ? 'badge-accent font-semibold' : 'surface-subtle text-caption'
                      }`}
                    >
                      {interest}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
