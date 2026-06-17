export interface UltraSeatCell {
  key: string;
  label: string;
}

export type UltraSlot =
  | { kind: "blank" }
  | { kind: "aisle"; size: "large" | "small" }
  | { kind: "seat"; seat: UltraSeatCell };

/** 20-column track: extL×2 | gap | 10,9 | aisle | 8,7 | gap | 6,5 | gap | 4,3 | aisle | 2,1 | gap | extR×2 */
function standardRowSlots(row: string): UltraSlot[] {
  return [
    { kind: "blank" },
    { kind: "blank" },
    { kind: "aisle", size: "small" },
    { kind: "seat", seat: { key: `${row}10`, label: `${row}10` } },
    { kind: "seat", seat: { key: `${row}9`, label: `${row}9` } },
    { kind: "aisle", size: "large" },
    { kind: "seat", seat: { key: `${row}8`, label: `${row}8` } },
    { kind: "seat", seat: { key: `${row}7`, label: `${row}7` } },
    { kind: "aisle", size: "small" },
    { kind: "seat", seat: { key: `${row}6`, label: `${row}6` } },
    { kind: "seat", seat: { key: `${row}5`, label: `${row}5` } },
    { kind: "aisle", size: "small" },
    { kind: "seat", seat: { key: `${row}4`, label: `${row}4` } },
    { kind: "seat", seat: { key: `${row}3`, label: `${row}3` } },
    { kind: "aisle", size: "large" },
    { kind: "seat", seat: { key: `${row}2`, label: `${row}2` } },
    { kind: "seat", seat: { key: `${row}1`, label: `${row}1` } },
    { kind: "aisle", size: "small" },
    { kind: "blank" },
    { kind: "blank" },
  ];
}

export const ultraStandardRowSlots: UltraSlot[][] = "ABCDEFG".split("").map(standardRowSlots);

/**
 * Row H — H12 H11 H10 G9 H10 H9 H8 H7 H6 H5 H4 H3 H2 H1
 * Left ext (H12/H11) + right ext (H2/H1) share the same columns as A–G blanks.
 */
export const ultraRowHSlots: UltraSlot[] = [
  { kind: "seat", seat: { key: "H14", label: "H14" } },
  { kind: "seat", seat: { key: "H13", label: "H13" } },
  { kind: "aisle", size: "small" },
  { kind: "seat", seat: { key: "H12", label: "H12" } },
  { kind: "seat", seat: { key: "H11", label: "H11" } },
  { kind: "aisle", size: "large" },
  { kind: "seat", seat: { key: "H10", label: "H10" } },
  { kind: "seat", seat: { key: "H9", label: "H9" } },
  { kind: "aisle", size: "small" },
  { kind: "seat", seat: { key: "H8", label: "H8" } },
  { kind: "seat", seat: { key: "H7", label: "H7" } },
  { kind: "aisle", size: "small" },
  { kind: "seat", seat: { key: "H6", label: "H6" } },
  { kind: "seat", seat: { key: "H5", label: "H5" } },
  { kind: "aisle", size: "large" },
  { kind: "seat", seat: { key: "H4", label: "H4" } },
  { kind: "seat", seat: { key: "H3", label: "H3" } },
  { kind: "aisle", size: "small" },
  { kind: "seat", seat: { key: "H2", label: "H2" } },
  { kind: "seat", seat: { key: "H1", label: "H1" } },
];

export const ultraAllRowSlots = [...ultraStandardRowSlots, ultraRowHSlots];

export const ultraReservedSeatKeys = new Set<string>();
