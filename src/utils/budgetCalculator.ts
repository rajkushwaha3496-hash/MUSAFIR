import type {
  DestinationBudget,
  StudentBudgetBreakdown,
  TravelMode,
} from '../types.ts';

export function estimateRoundTripTransport(
  distanceKm: number | null | undefined,
  mode: TravelMode = 'Train'
): number {
  if (mode === 'Walking') return 0;
  if (mode === 'Local public transport') return 120;

  if (distanceKm === null || distanceKm === undefined || Number.isNaN(distanceKm)) {
    // Regional student rail/bus estimate when starting city is not specified
    if (mode === 'Bus') return 600;
    if (mode === 'Shared transport') return 500;
    return 450;
  }

  // Approximate road/rail route factor ~1.25x straight-line Haversine distance, round trip (x2)
  const routeKmRoundTrip = Math.max(20, distanceKm * 1.25 * 2);

  if (mode === 'Train') {
    // Sleeper / 2S Indian Railways student average ~₹0.48 per km
    return Math.max(160, Math.round(routeKmRoundTrip * 0.48));
  }
  if (mode === 'Bus') {
    // State Roadways / Ordinary & Express bus ~₹0.90 per km
    return Math.max(140, Math.round(routeKmRoundTrip * 0.9));
  }
  // Shared jeep / carpool split among students ~₹1.15 per km per seat
  return Math.max(120, Math.round(routeKmRoundTrip * 1.15));
}

export function calculateStudentBudgetBreakdown(params: {
  budget: DestinationBudget;
  days: number;
  travelers: number;
  distanceKm?: number | null;
  travelMode?: TravelMode;
}): StudentBudgetBreakdown {
  const days = Math.max(1, Math.min(15, Math.round(params.days || 2)));
  const nights = Math.max(0, days - 1);
  const travelers = Math.max(1, Math.min(20, Math.round(params.travelers || 1)));

  const roundTripTransportInr = estimateRoundTripTransport(
    params.distanceKm,
    params.travelMode ?? 'Train'
  );
  const stayTotalInr = params.budget.stayPerNightInr * nights;
  const foodTotalInr = params.budget.foodPerDayInr * days;
  const localTransportTotalInr = params.budget.localTransportPerDayInr * days;
  const sightseeingEntryInr = params.budget.entryFeeInr * Math.min(days, 3);

  const subtotal =
    roundTripTransportInr +
    stayTotalInr +
    foodTotalInr +
    localTransportTotalInr +
    sightseeingEntryInr;

  const emergencyReserveInr = Math.max(100, Math.round(subtotal * 0.1));
  const perPersonTotalInr = subtotal + emergencyReserveInr;
  const groupTotalInr = perPersonTotalInr * travelers;

  return {
    roundTripTransportInr,
    stayTotalInr,
    foodTotalInr,
    localTransportTotalInr,
    sightseeingEntryInr,
    emergencyReserveInr,
    groupTotalInr,
    perPersonTotalInr,
    nights,
    days,
    travelers,
    isEstimate: true,
  };
}
