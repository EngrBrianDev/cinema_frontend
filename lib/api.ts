import { seatTypeConfigs } from "@/lib/mock-data/seat-config";
import { ultraAllRowSlots } from "@/lib/mock-data/ultra-seat-layout";

type Cinema = {
  id: string;
  type: "C2" | "ULTRA";
  name: string;
};

type CinemaSeat = {
  id: string;
  seatNumber: string;
  rowLabel: string;
  occupied: boolean;
};

const cinemas: Cinema[] = [
  { id: "cinema-c2", type: "C2", name: seatTypeConfigs.c2.cinemaLabel },
  { id: "cinema-ultra", type: "ULTRA", name: seatTypeConfigs.ultra.cinemaLabel },
];

function c2Seats(): CinemaSeat[] {
  const seats: CinemaSeat[] = [];
  const occupied = new Set(["B12", "B13", "D9", "D10", "H5", "H6", "N18", "P7"]);

  for (const rowLabel of ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"]) {
    if (rowLabel === "A") {
      seats.push(
        { id: "c2-A-PWD1", seatNumber: "A-PWD1", rowLabel, occupied: false },
        { id: "c2-A-PWD2", seatNumber: "A-PWD2", rowLabel, occupied: false },
      );
    }

    for (let col = 1; col <= 17; col += 1) {
      seats.push({
        id: `c2-${rowLabel}${col}`,
        seatNumber: `${rowLabel}${col}`,
        rowLabel,
        occupied: occupied.has(`${rowLabel}${col}`),
      });
    }
  }

  for (const rowLabel of ["N", "P", "Q"]) {
    for (let col = 1; col <= 22; col += 1) {
      seats.push({
        id: `c2-${rowLabel}${col}`,
        seatNumber: `${rowLabel}${col}`,
        rowLabel,
        occupied: occupied.has(`${rowLabel}${col}`),
      });
    }
  }

  return seats;
}

function ultraSeats(): CinemaSeat[] {
  const occupied = new Set(["B8", "B7", "D6", "D5", "F4", "F3"]);

  return ultraAllRowSlots.flatMap((rowSlots) =>
    rowSlots.flatMap((slot) => {
      if (slot.kind !== "seat") {
        return [];
      }

      const rowLabel = slot.seat.key.charAt(0);

      return {
        id: `ultra-${slot.seat.key}`,
        seatNumber: slot.seat.key,
        rowLabel,
        occupied: occupied.has(slot.seat.key),
      };
    }),
  );
}

function mockResponse(path: string) {
  if (path === "/cinemas") {
    return cinemas;
  }

  if (path === "/cinemas/cinema-c2/seats") {
    return c2Seats();
  }

  if (path === "/cinemas/cinema-ultra/seats") {
    return ultraSeats();
  }

  throw new Error(`No mock API response configured for ${path}.`);
}

export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    return mockResponse(path) as T;
  }

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`);
  }

  return (await response.json()) as T;
}
