/**
 * Published rates from tnttours.org (Best of LA, Universal transport, private tiers).
 * Confirm current pricing when rates change.
 */
export const GROUP_OVER_12_CALL_TEXT =
  "Groups over 12 guests: please call for pricing.";

export const SITE_PRICING = {
  /** Full-day Best of LA & Hollywood tour — per person */
  fullDayTour: { adult: 89, child: 79 },
  /** Universal Studios roundtrip — transportation only, total per group (not per person) */
  universalRoundTripTransport: [
    { guests: "1–4", price: 260 },
    { guests: "5–6", price: 360 },
    { guests: "7–8", price: 460 },
    { guests: "9–10", price: 560 },
    { guests: "11–12", price: 660 },
  ],
  /** 6–7 hour private tour — total per group (not per person) */
  privateTour6to7Hr: [
    { guests: "1–4", price: 590 },
    { guests: "5–8", price: 690 },
    { guests: "9–10", price: 790 },
    { guests: "11–12", price: 890 },
  ],
} as const;

export function formatAdultChildPrice(adult: number, child: number) {
  return `Adults $${adult} · Children $${child}`;
}
