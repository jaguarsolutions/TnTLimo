# TNT Pricing Update — Hybrid Model

**For Claude Code.** Most of the prior implementation work is already deployed. This is a focused rate change only.

## What's already done (verified on tn-t-limo.vercel.app)

- Booking Summary total updates in real time — no lag.
- Point-to-Point uses `base + 25 included miles + per-mile` (the engine exists).
- Hourly Charter rates: $100 / $120 / $155 / $185 per hour with 3-hr min on sedan/SUV, 4-hr on van/sprinter — **already match Hybrid**, no change needed.
- Service radius is 150 miles.
- "Unlimited miles within Greater LA & Orange County" copy is on the Hourly card.
- Route line shows a single arrow.

## What still needs to change

Two things:

### 1. Switch Point-to-Point to the Hybrid numbers

Today's deployed P2P:

| Vehicle | Base | Includes | Per-mile after |
|---|---|---|---|
| Sedan | $95 | 25 mi | $2.50 |
| SUV | $110 | 25 mi | $3.00 |
| Van | $145 | 25 mi | $4.00 |
| Sprinter | $185 | 25 mi | $5.00 |

Replace with **Hybrid**:

| Vehicle | Base | Includes | Per-mile after |
|---|---|---|---|
| Sedan | **$85** | **14 mi** | **$3.00** |
| SUV | **$95** | **14 mi** | **$3.50** |
| Van | **$120** | **14 mi** | **$4.00** |
| Sprinter | **$185** | **14 mi** | **$5.00** |

### 2. Run Airport Transfers through the same engine

Today the Airport flow uses per-airport flat rates (LAX $128, SNA $105, SAN $280, etc.) that are separate from the P2P math. Unify them: airport quotes should compute as `P2P quote at the given distance + $10 airport service fee`, with the same vehicle rates as P2P. Keep the Meet & Greet ($30) and Round-Trip (×2) options as-is.

Effect on common routes (Sedan):

| Route | Distance | Current flat | New (Hybrid + $10) |
|---|---|---|---|
| SNA → Anaheim | 14 mi | $105 | **$95** |
| LAX → Anaheim | 35 mi | $128 | **$158** |
| SAN → Anaheim | 95 mi | $280 | **$280** |

Note: LAX goes **up** $30 under the unified model. If ownership wants to keep LAX cheaper than the formula would produce, leave it as a per-route override and use the engine for the rest. Just decide before shipping.

## Implementation

### Find the existing pricing engine

```bash
rg -n "INCLUDED_MILES|perMile|quotePointToPoint|VEHICLES.*sedan" --type ts --type tsx
```

You should find a config object like:

```typescript
const VEHICLES = {
  sedan:    { base: 95,  perMile: 2.5, ... },
  suv:      { base: 110, perMile: 3.0, ... },
  van:      { base: 145, perMile: 4.0, ... },
  sprinter: { base: 185, perMile: 5.0, ... },
};
const INCLUDED_MILES = 25;
```

### Change to

```typescript
const VEHICLES = {
  sedan:    { base: 85,  perMile: 3.0, ... },
  suv:      { base: 95,  perMile: 3.5, ... },
  van:      { base: 120, perMile: 4.0, ... },
  sprinter: { base: 185, perMile: 5.0, ... },
};
const INCLUDED_MILES = 14;
```

Hourly rates (`hourlyRate`, `hourlyMinHours`) and the airport service fee ($10), meet & greet ($30), and service radius (150 mi) stay the same.

### Airport unification

Find where the Airport flow looks up a per-airport price (probably a flat-rate object keyed by airport code). Replace with a call to the existing P2P quote function plus the $10 airport service fee. The airport selection still determines the route's origin/destination for distance lookup; only the math changes.

### Update vehicle card copy

The cards currently read `$95 base · includes 25 mi`. After the change they'll read `$85 base · includes 14 mi`, etc. The copy template doesn't need to change — the values come from config.

## Tests

Update test expectations to:

```typescript
// Point-to-Point
expect(quotePointToPoint("sedan",   7)).toBe(85);
expect(quotePointToPoint("sedan",  14)).toBe(85);
expect(quotePointToPoint("sedan",  35)).toBe(148);  // 85 + 21×3
expect(quotePointToPoint("sedan", 120)).toBe(403);  // 85 + 106×3
expect(quotePointToPoint("suv",   35)).toBe(169);   // 95 + 21×3.50 = 168.50 → 169
expect(quotePointToPoint("van",   35)).toBe(204);   // 120 + 21×4
expect(quotePointToPoint("sprinter", 35)).toBe(290); // 185 + 21×5
expect(quotePointToPoint("sprinter",120)).toBe(715); // 185 + 106×5

// Airport (unified through P2P + $10 fee)
expect(quoteAirport({ vehicle: "sedan", miles: 14 })).toBe(95);   // SNA-equivalent
expect(quoteAirport({ vehicle: "sedan", miles: 35 })).toBe(158);  // LAX-equivalent
expect(quoteAirport({ vehicle: "sedan", miles: 35, roundTrip: true })).toBe(316);
expect(quoteAirport({ vehicle: "sedan", miles: 35, meetGreet: true })).toBe(188);
expect(quoteAirport({ vehicle: "sprinter", miles: 95 })).toBe(600);

// Hourly (unchanged — verify still passes)
expect(quoteHourly("1-4",   2)).toBe(300);
expect(quoteHourly("11-14", 6)).toBe(1110);
```

## Acceptance — manual pass

Walk through the live wizard and verify:

| Scenario | Expected (before tip) |
|---|---|
| P2P · Disneyland → Knott's Berry Farm (~7 mi) · Sedan | **$85** |
| P2P · Disneyland → Huntington Beach Pier (~22 mi) · Sedan | **$109** (85 + 8×3) |
| P2P · San Diego → LA (~120 mi) · Sedan | **$403** |
| P2P · 120 mi · Sprinter | **$715** |
| Airport · SNA → Anaheim · Sedan | **$95** |
| Airport · LAX → Anaheim · Sedan | **$158** |
| Airport · LAX → Anaheim · Sedan, round trip | **$316** |
| Airport · LAX → Anaheim · Sedan + Meet & Greet | **$188** |
| Airport · SAN → Anaheim · Sprinter | **$600** |
| Hourly · 1–4 pax, 4 hr | **$400** (unchanged) |
| Hourly · 11–14 pax, 6 hr | **$1,110** (unchanged) |

Open a draft PR titled `feat(pricing): adopt Hybrid model — 14-mi included base`.
