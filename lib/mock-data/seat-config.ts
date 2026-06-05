export type SeatType = "ultra" | "c2";

export interface SeatTypeConfig {
  id: SeatType;
  label: string;
  cinemaLabel: string;
  venue: string;
  pricePerSeat: number;
  rows: number;
  cols: number;
  rowLabels: string[];
  reserved: number[];
  /** Column index after which a center aisle is rendered (Ultra only). */
  aisleAfterCol?: number;
}

export const seatTypeConfigs: Record<SeatType, SeatTypeConfig> = {
  c2: {
    id: "c2",
    label: "C2 Seat",
    cinemaLabel: "CINEMA 2",
    venue: "Uptown Mall BGC",
    pricePerSeat: 350,
    rows: 10,
    cols: 12,
    rowLabels: "ABCDEFGHIJ".split(""),
    reserved: [12, 13, 24, 25, 45, 46, 47, 68, 69, 70, 71, 82, 83, 100, 101, 115],
  },
  ultra: {
    id: "ultra",
    label: "Ultra Seat",
    cinemaLabel: "ULTRA SCREEN",
    venue: "Uptown Mall BGC — Premium Hall",
    pricePerSeat: 650,
    rows: 8,
    cols: 10,
    rowLabels: "ABCDEFGH".split(""),
    // colIndex 0=col10 … colIndex 9=col1; reserved: B8,B7 / D6,D5 / F4,F3
    reserved: [12, 13, 34, 35, 56, 57],
  },
};
