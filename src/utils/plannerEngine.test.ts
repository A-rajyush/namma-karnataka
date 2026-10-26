import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistance,
  calculateTripBudget,
  durationToDays,
  filterFestivalsByDateAndInterests,
  generateSmartItinerary,
  optimizeTravelRoute,
  validateAuthInput,
} from './plannerEngine';
import { KARNATAKA_DESTINATIONS } from '../data/karnatakaData';

test('durationToDays maps travel duration labels accurately', () => {
  assert.equal(durationToDays('Weekend'), 2);
  assert.equal(durationToDays('3 Days'), 3);
  assert.equal(durationToDays('5 Days'), 5);
  assert.equal(durationToDays('7 Days'), 7);
  assert.equal(durationToDays('10+ Days'), 10);
});

test('calculateHaversineDistance computes realistic road distance between Bengaluru and Mysuru', () => {
  const blr = KARNATAKA_DESTINATIONS.find((d) => d.id === 'bengaluru')!;
  const mys = KARNATAKA_DESTINATIONS.find((d) => d.id === 'mysuru')!;
  const dist = calculateHaversineDistance(blr.lat, blr.lng, mys.lat, mys.lng);
  assert.ok(dist >= 130 && dist <= 190, `Expected 130-190km, got ${dist}`);
});

test('optimizeTravelRoute orders destinations and computes positive distance & elevation', () => {
  const sample = KARNATAKA_DESTINATIONS.slice(0, 4);
  const scenicRoute = optimizeTravelRoute(sample, 'scenic');
  assert.equal(scenicRoute.orderedDestinationIds.length, 4);
  assert.ok(scenicRoute.totalDistanceKm > 200);
  assert.ok(scenicRoute.estimatedTotalDriveHours > 3);
  assert.equal(scenicRoute.scenicScore, 98);
});

test('calculateTripBudget scales accurately across Budget and Luxury tiers', () => {
  const budgetTrip = calculateTripBudget(
    {
      duration: '3 Days',
      budget: 'Budget',
      interests: ['Trekking'],
      partner: 'Solo',
      transport: 'Public Transport',
      accommodation: 'Hostel',
    },
    3,
    400
  );

  const luxuryTrip = calculateTripBudget(
    {
      duration: '3 Days',
      budget: 'Luxury',
      interests: ['Heritage', 'Coffee Plantations'],
      partner: 'Couple',
      transport: 'Car',
      accommodation: 'Luxury Stay',
    },
    3,
    400
  );

  assert.ok(budgetTrip.totalTripCost > 0);
  assert.ok(luxuryTrip.totalTripCost > budgetTrip.totalTripCost * 4);
  assert.equal(
    budgetTrip.totalTripCost,
    budgetTrip.transportCost +
      budgetTrip.accommodationCost +
      budgetTrip.foodBudget +
      budgetTrip.activityExpenses
  );
});

test('generateSmartItinerary creates complete day-wise schedule and smart recommendations', () => {
  const itinerary = generateSmartItinerary({
    duration: '5 Days',
    budget: 'Premium',
    interests: ['Coffee Plantations', 'Waterfalls', 'Heritage'],
    partner: 'Couple',
    transport: 'Car',
    accommodation: 'Resort',
    travelMonth: 'October',
    routeMode: 'scenic',
  });

  assert.equal(itinerary.numDays, 5);
  assert.equal(itinerary.dailySchedule.length, 5);
  assert.ok(itinerary.selectedDestinations.length >= 2);
  assert.ok(itinerary.dailySchedule[0].wakeUpRecommendation.length > 5);
  assert.ok(itinerary.dailySchedule[0].breakfastSuggestion.length > 5);
  assert.ok(itinerary.smartRecommendations.hiddenGems.length > 0);
});

test('filterFestivalsByDateAndInterests returns Mysuru Dasara for October', () => {
  const octFestivals = filterFestivalsByDateAndInterests('October', ['Festivals']);
  assert.ok(octFestivals.length > 0);
  assert.equal(octFestivals[0].id, 'mysuru-dasara');
});

test('validateAuthInput enforces email, password, and signup name rules', () => {
  assert.equal(validateAuthInput('invalid-email', 'secret123', 'Aarav', false).valid, false);
  assert.equal(validateAuthInput('aarav@karnataka.in', '123', 'Aarav', false).valid, false);
  assert.equal(validateAuthInput('aarav@karnataka.in', 'secret123', '', true).valid, false);
  assert.equal(validateAuthInput('aarav@karnataka.in', 'secret123', 'Aarav Rao', true).valid, true);
});
