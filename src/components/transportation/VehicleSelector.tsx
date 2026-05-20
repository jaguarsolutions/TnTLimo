"use client";

import Image from "next/image";
import type { Vehicle } from "@/lib/pricing/engine";
import { SITE_IMAGES } from "@/lib/siteImages";

interface VehicleSelectorProps {
  label?: string;
  description?: string;
  vehicles: Vehicle[];
  selectedId: string;
  onSelect: (vehicleId: string) => void;
}

const VEHICLE_IMAGE_BY_ID: Record<string, string> = {
  sedan: SITE_IMAGES.blackSedan,
  suv: SITE_IMAGES.blackSuv,
  van: SITE_IMAGES.blackVan,
  sprinter: SITE_IMAGES.blackSprinter,
};

function SelectedBadge() {
  return (
    <span className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gold text-ink shadow-sm" aria-hidden="true">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

export default function VehicleSelector({
  label = "Vehicle",
  description,
  vehicles,
  selectedId,
  onSelect,
}: VehicleSelectorProps) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</span>
        {description ? <p className="text-sm text-muted">{description}</p> : null}
      </div>

      {vehicles.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={label}>
          {vehicles.map((vehicle) => {
            const selected = selectedId === vehicle.id;
            return (
              <button
                key={vehicle.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelect(vehicle.id)}
                className={`relative flex items-start justify-between gap-3 text-left p-4 rounded-2xl border-2 transition cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream ${
                  selected ? "border-gold bg-gold/5" : "border-border bg-white hover:border-ink/40"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-2xl bg-sand">
                    <Image
                      src={VEHICLE_IMAGE_BY_ID[vehicle.id] ?? SITE_IMAGES.blackSedan}
                      alt={`${vehicle.name} vehicle`}
                      fill
                      sizes="96px"
                      loading="eager"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{vehicle.name}</span>
                    <span className="block text-xs text-muted mt-1">Up to {vehicle.maxPassengers} passengers · {vehicle.maxLuggage} bags</span>
                    <p className="mt-2 text-sm text-muted">${vehicle.perMile}/mile · ${vehicle.minimumFare} minimum</p>
                    {vehicle.description ? (
                      <span className="block text-xs text-muted/85 mt-1 leading-snug">{vehicle.description}</span>
                    ) : null}
                  </div>
                </div>
                {selected && <SelectedBadge />}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 rounded-2xl border border-sunset/20 bg-sunset/10 p-4 text-sm text-ink">
          We don’t currently have a vehicle matching that passenger count. Please adjust your group size or contact us for a custom quote.
        </p>
      )}
    </div>
  );
}
