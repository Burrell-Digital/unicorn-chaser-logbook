"use client";

import { useEffect, useState } from "react";
import { Anchor, Radio, Hash, Calendar, Clock } from "lucide-react";

type VesselInfo = {
  callSign: string;
  mmsi: string;
};

const PLACEHOLDER: VesselInfo = { callSign: "—", mmsi: "—" };

function readVessel(): VesselInfo {
  if (typeof window === "undefined") return PLACEHOLDER;
  try {
    const raw = window.localStorage.getItem("vessel");
    if (!raw) return PLACEHOLDER;
    const parsed = JSON.parse(raw);
    return {
      callSign: parsed.callSign?.trim() || "—",
      mmsi: parsed.mmsi?.trim() || "—",
    };
  } catch {
    return PLACEHOLDER;
  }
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export default function VesselHeader() {
  const [vessel, setVessel] = useState<VesselInfo>(PLACEHOLDER);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setVessel(readVessel());
    setNow(new Date());

    const timer = setInterval(() => setNow(new Date()), 1000);
    const refresh = () => setVessel(readVessel());

    window.addEventListener("vessel-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      clearInterval(timer);
      window.removeEventListener("vessel-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const dateStr = now
    ? `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`
    : "—";
  const timeStr = now
    ? `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} UTC`
    : "—";

  return (
    <header className="bg-white border-b border-navy/10 px-4 sm:px-6 lg:px-10 py-3 pl-16 lg:pl-10">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
        <div className="flex items-center gap-2">
          <Anchor size={16} className="text-gold" />
          <span className="text-xs uppercase tracking-widest text-navy/60">
            Vessel
          </span>
          <span className="font-serif text-lg leading-none text-navy">
            Unicorn Chaser
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Radio size={14} className="text-gold" />
          <span className="text-xs uppercase tracking-widest text-navy/60">
            Call Sign
          </span>
          <span className="text-sm font-medium text-navy font-mono">
            {vessel.callSign}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Hash size={14} className="text-gold" />
          <span className="text-xs uppercase tracking-widest text-navy/60">
            MMSI
          </span>
          <span className="text-sm font-medium text-navy font-mono">
            {vessel.mmsi}
          </span>
        </div>

        <div className="flex items-center gap-2 lg:ml-auto">
          <Calendar size={14} className="text-gold" />
          <span className="text-xs uppercase tracking-widest text-navy/60">
            Date
          </span>
          <span className="text-sm font-medium text-navy font-mono">
            {dateStr}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gold" />
          <span className="text-xs uppercase tracking-widest text-navy/60">
            Time
          </span>
          <span className="text-sm font-medium text-navy font-mono">
            {timeStr}
          </span>
        </div>
      </div>
    </header>
  );
}
