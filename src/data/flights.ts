import type { Flight } from "@/types";

export const flights: Flight[] = [
  {
    id: "f1",
    flightNumber: "AC873",
    airline: "Air Canada",
    originCode: "FCO",
    originCity: "Rome",
    originCountry: "Italy",
    destinationCode: "YUL",
    destinationCity: "Montreal",
    destinationCountry: "Canada",
    departureDate: "2026-10-14",
    departureTime: "13:30",
    arrivalTime: "16:25",
  },
  {
    id: "f2",
    flightNumber: "BA117",
    airline: "British Airways",
    originCode: "LHR",
    originCity: "London",
    originCountry: "United Kingdom",
    destinationCode: "JFK",
    destinationCity: "New York",
    destinationCountry: "United States",
    departureDate: "2026-10-20",
    departureTime: "10:15",
    arrivalTime: "13:05",
  },
  {
    id: "f3",
    flightNumber: "AF1380",
    airline: "Air France",
    originCode: "CDG",
    originCity: "Paris",
    originCountry: "France",
    destinationCode: "LIS",
    destinationCity: "Lisbon",
    destinationCountry: "Portugal",
    departureDate: "2026-10-18",
    departureTime: "08:20",
    arrivalTime: "10:05",
  },
  {
    id: "f4",
    flightNumber: "LH441",
    airline: "Lufthansa",
    originCode: "FRA",
    originCity: "Frankfurt",
    originCountry: "Germany",
    destinationCode: "ORD",
    destinationCity: "Chicago",
    destinationCountry: "United States",
    departureDate: "2026-10-22",
    departureTime: "11:40",
    arrivalTime: "14:20",
  },
  {
    id: "f5",
    flightNumber: "EK203",
    airline: "Emirates",
    originCode: "DXB",
    originCity: "Dubai",
    originCountry: "United Arab Emirates",
    destinationCode: "JFK",
    destinationCity: "New York",
    destinationCountry: "United States",
    departureDate: "2026-11-02",
    departureTime: "03:15",
    arrivalTime: "08:35",
  },
  {
    id: "f6",
    flightNumber: "IB6250",
    airline: "Iberia",
    originCode: "EZE",
    originCity: "Buenos Aires",
    originCountry: "Argentina",
    destinationCode: "MAD",
    destinationCity: "Madrid",
    destinationCountry: "Spain",
    departureDate: "2026-08-02",
    departureTime: "23:10",
    arrivalTime: "10:40",
  },
];

export function getFlights(): Flight[] {
  return flights;
}

export function getFlightById(id: string): Flight | undefined {
  return flights.find((flight) => flight.id === id);
}

export interface FlightSearchParams {
  origin?: string;
  destination?: string;
  flightNumber?: string;
  date?: string;
}

export function searchFlights(params: FlightSearchParams): Flight[] {
  const origin = params.origin?.trim().toLowerCase();
  const destination = params.destination?.trim().toLowerCase();
  const flightNumber = params.flightNumber?.trim().toLowerCase();
  const date = params.date?.trim();

  return flights.filter((flight) => {
    if (
      flightNumber &&
      !flight.flightNumber.toLowerCase().includes(flightNumber)
    ) {
      return false;
    }
    if (
      origin &&
      !`${flight.originCity} ${flight.originCode}`
        .toLowerCase()
        .includes(origin)
    ) {
      return false;
    }
    if (
      destination &&
      !`${flight.destinationCity} ${flight.destinationCode}`
        .toLowerCase()
        .includes(destination)
    ) {
      return false;
    }
    if (date && flight.departureDate !== date) {
      return false;
    }
    return true;
  });
}
