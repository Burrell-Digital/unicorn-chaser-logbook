"use client";

import { useEffect, useState } from "react";
import { Navigation } from "lucide-react";

type AISPosition = {
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
  timestamp: string;
};

type AISData = {
  position: AISPosition | null;
  loaded: boolean;
  error: string | null;
  lastFetched: string | null;
};

const AIS_CACHE_KEY = "unicorn-chaser-ais-cache";

function readCachedPosition(): AISPosition | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AIS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCachedPosition(pos: AISPosition) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AIS_CACHE_KEY, JSON.stringify(pos));
}

export default function AISPositionTracker() {
  const [ais, setAis] = useState<AISData>(() => ({
    position: readCachedPosition(),
    loaded: false,
    error: null,
    lastFetched: null,
  }));

  const fetchPosition = async () => {
    try {
      const res = await fetch("/api/ais-position");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.latitude !== undefined && data.longitude !== undefined) {
        const pos: AISPosition = {
          latitude: data.latitude,
          longitude: data.longitude,
          sog: data.sog || 0,
          cog: data.cog || 0,
          timestamp: data.timestamp || new Date().toISOString(),
        };
        writeCachedPosition(pos);
        setAis({
          position: pos,
          loaded: true,
          error: null,
          lastFetched: new Date().toISOString(),
        });
      } else {
        console.log("AIS: no position data", data);
        setAis((prev) => ({
          ...prev,
          loaded: true,
          error: "No position available",
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("AIS fetch error:", msg);
      setAis((prev) => ({
        ...prev,
        loaded: true,
        error: msg,
      }));
    }
  };

  useEffect(() => {
    fetchPosition();
    const interval = setInterval(fetchPosition, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Emit custom event for other components
  useEffect(() => {
    if (ais.position) {
      window.dispatchEvent(
        new CustomEvent("ais-position-update", {
          detail: ais.position,
        })
      );
    }
  }, [ais.position]);

  if (!ais.loaded && !ais.position) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-navy/5 text-xs text-navy/60 animate-pulse">
        <Navigation size={12} className="animate-spin" />
        Loading AIS...
      </div>
    );
  }

  if (ais.position) {
    return (
      <div className="flex items-center gap-1 text-xs text-navy flex-wrap">
        <Navigation size={12} className="text-gold" />
        <span className="font-mono">
          {typeof ais.position.latitude === "number"
            ? Math.abs(ais.position.latitude).toFixed(4)
            : ais.position.latitude}
          &deg;{ais.position.latitude >= 0 ? "N" : "S"},&nbsp;
          {typeof ais.position.longitude === "number"
            ? Math.abs(ais.position.longitude).toFixed(4)
            : ais.position.longitude}
          &deg;{ais.position.longitude >= 0 ? "E" : "W"}
        </span>
        {ais.position.sog > 0 && (
          <span className="text-navy/60 ml-1">
            | {ais.position.sog.toFixed(1)} kn
          </span>
        )}
        <span className="text-navy/40 ml-1 text-[10px]">
          {ais.lastFetched
            ? new Date(ais.lastFetched).toLocaleTimeString("en-GB", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "UTC",
              }) + " UTC"
            : ""}
        </span>
      </div>
    );
  }

  return (
    <div className="text-xs text-navy/40">
      AIS: {ais.error || "pending"}
    </div>
  );
}
