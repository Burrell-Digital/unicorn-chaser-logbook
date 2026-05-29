"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Download,
  Navigation,
  Thermometer,
  Wind,
  Waves,
  Clock,
  Trash2,
  MapPin,
  Anchor,
  BookOpen,
} from "lucide-react";
import * as XLSX from "xlsx";

type LogEntry = {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  latitude: string;
  longitude: string;
  weather: string;
  windSpeed: string;
  windDir: string;
  seaState: string;
  visibility: string;
  barometer: string;
  temperature: string;
  engineHours: string;
  notes: string;
  isPassageStart?: boolean;
  isPassageEnd?: boolean;
};

const STORAGE_KEY = "unicorn-chaser-daily-log";
const PASSAGE_KEY = "unicorn-chaser-passage-state";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatUTC(d: Date) {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function readEntries(): LogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: LogEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

type PassageState = {
  active: boolean;
  startEntryId: string | null;
  startTime: string | null;
};

function readPassage(): PassageState {
  if (typeof window === "undefined") return { active: false, startEntryId: null, startTime: null };
  try {
    const raw = window.localStorage.getItem(PASSAGE_KEY);
    return raw ? JSON.parse(raw) : { active: false, startEntryId: null, startTime: null };
  } catch {
    return { active: false, startEntryId: null, startTime: null };
  }
}

function savePassage(state: PassageState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PASSAGE_KEY, JSON.stringify(state));
}

// AIS tracking: auto-record position every hour, pulls from VesselFinder
function useAISTracker(entries: LogEntry[], setEntries: React.Dispatch<React.SetStateAction<LogEntry[]>>) {
  useEffect(() => {
    const checkAndRecord = async () => {
      const now = new Date();
      const lastEntry = entries[0];

      // Check if we need a new hourly entry
      if (lastEntry) {
        const lastTime = new Date(lastEntry.timestamp);
        const hoursSinceLast = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLast < 1) return; // Less than 1 hour since last entry
      }

      // Fetch real AIS position from our API
      let lat = "--° --.---' N";
      let lng = "--° --.---' W";
      let sog = "--";

      try {
        const res = await fetch("/api/ais-position");
        if (res.ok) {
          const data = await res.json();
          if (data.latitude !== undefined && data.longitude !== undefined) {
            const absLat = Math.abs(data.latitude);
            const latDeg = Math.floor(absLat);
            const latMin = ((absLat - latDeg) * 60).toFixed(3);
            lat = `${latDeg}° ${latMin}' ${data.latitude >= 0 ? "N" : "S"}`;

            const absLng = Math.abs(data.longitude);
            const lngDeg = Math.floor(absLng);
            const lngMin = ((absLng - lngDeg) * 60).toFixed(3);
            lng = `${lngDeg}° ${lngMin}' ${data.longitude >= 0 ? "E" : "W"}`;

            sog = data.sog ? `${data.sog.toFixed(1)} kn` : "0.0 kn";
          }
        }
      } catch {
        // Fall back to mock data
      }

      const entry: LogEntry = {
        id: generateId(),
        timestamp: now.toISOString(),
        date: `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`,
        time: `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`,
        latitude: lat,
        longitude: lng,
        weather: "--",
        windSpeed: sog,
        windDir: "--",
        seaState: "--",
        visibility: "--",
        barometer: "----",
        temperature: "--",
        engineHours: "--",
        notes: `Auto-recorded hourly AIS position (SOG: ${sog})`,
      };

      setEntries(prev => [entry, ...prev]);
    };

    // Check every 5 minutes
    const interval = setInterval(checkAndRecord, 5 * 60 * 1000);

    // Also check immediately on mount
    checkAndRecord();

    return () => clearInterval(interval);
  }, [entries, setEntries]);
}

export default function DailyLogPage() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [passage, setPassage] = useState<PassageState>({ active: false, startEntryId: null, startTime: null });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<LogEntry>>({});

  useEffect(() => {
    setEntries(readEntries());
    setPassage(readPassage());
  }, []);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  // AIS auto-tracker hook
  useAISTracker(entries, setEntries);

  const addEntry = useCallback(() => {
    const now = new Date();
    const entry: LogEntry = {
      id: generateId(),
      timestamp: now.toISOString(),
      date: `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`,
      time: `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`,
      latitude: formData.latitude || "--° --.---' N",
      longitude: formData.longitude || "--° --.---' W",
      weather: formData.weather || "--",
      windSpeed: formData.windSpeed || "--",
      windDir: formData.windDir || "--",
      seaState: formData.seaState || "--",
      visibility: formData.visibility || "--",
      barometer: formData.barometer || "----",
      temperature: formData.temperature || "--",
      engineHours: formData.engineHours || "--",
      notes: formData.notes || "",
    };

    setEntries(prev => [entry, ...prev]);
    setFormData({});
    setShowForm(false);
  }, [formData]);

  const deleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const startPassage = useCallback(() => {
    const now = new Date();
    const entry: LogEntry = {
      id: generateId(),
      timestamp: now.toISOString(),
      date: `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`,
      time: `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`,
      latitude: formData.latitude || "--° --.---' N",
      longitude: formData.longitude || "--° --.---' W",
      weather: formData.weather || "--",
      windSpeed: formData.windSpeed || "--",
      windDir: formData.windDir || "--",
      seaState: formData.seaState || "--",
      visibility: formData.visibility || "--",
      barometer: formData.barometer || "----",
      temperature: formData.temperature || "--",
      engineHours: formData.engineHours || "--",
      notes: formData.notes || "PASSAGE STARTED",
      isPassageStart: true,
    };

    const newState: PassageState = {
      active: true,
      startEntryId: entry.id,
      startTime: now.toISOString(),
    };

    setEntries(prev => [entry, ...prev]);
    setPassage(newState);
    savePassage(newState);
    setFormData({});
    setShowForm(false);
  }, [formData]);

  const endPassage = useCallback(() => {
    const now = new Date();
    const entry: LogEntry = {
      id: generateId(),
      timestamp: now.toISOString(),
      date: `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}`,
      time: `${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`,
      latitude: formData.latitude || "--° --.---' N",
      longitude: formData.longitude || "--° --.---' W",
      weather: formData.weather || "--",
      windSpeed: formData.windSpeed || "--",
      windDir: formData.windDir || "--",
      seaState: formData.seaState || "--",
      visibility: formData.visibility || "--",
      barometer: formData.barometer || "----",
      temperature: formData.temperature || "--",
      engineHours: formData.engineHours || "--",
      notes: formData.notes || "PASSAGE ENDED",
      isPassageEnd: true,
    };

    const newState: PassageState = { active: false, startEntryId: null, startTime: null };

    setEntries(prev => [entry, ...prev]);
    setPassage(newState);
    savePassage(newState);
    setFormData({});
    setShowForm(false);
  }, [formData]);

  const exportToExcel = useCallback(() => {
    const data = entries.map(e => ({
      Date: e.date,
      Time: e.time,
      Latitude: e.latitude,
      Longitude: e.longitude,
      Weather: e.weather,
      "Wind Speed": e.windSpeed,
      "Wind Dir": e.windDir,
      "Sea State": e.seaState,
      Visibility: e.visibility,
      Barometer: e.barometer,
      Temperature: e.temperature,
      "Engine Hours": e.engineHours,
      Notes: e.notes,
      "Passage Event": e.isPassageStart ? "START" : e.isPassageEnd ? "END" : "",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Log");
    XLSX.writeFile(wb, `Unicorn-Chaser-Daily-Log-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Daily Log</h2>
          <p className="text-sm text-navy/60 mt-1">Record of vessel operations and positions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-medium hover:bg-ink"
          >
            <Plus size={16} />
            New Entry
          </button>
          {passage.active ? (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold/20 text-gold border border-gold rounded-md text-sm font-medium hover:bg-gold/30"
            >
              <Anchor size={16} />
              End Passage
            </button>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gold/20 text-gold border border-gold rounded-md text-sm font-medium hover:bg-gold/30"
            >
              <Navigation size={16} />
              Start Passage
            </button>
          )}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/20 text-navy rounded-md text-sm font-medium hover:bg-cream"
          >
            <Download size={16} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Passage Status */}
      {passage.active && (
        <div className="bg-gold/10 border border-gold/30 rounded-lg px-4 py-3 flex items-center gap-3">
          <Navigation size={18} className="text-gold" />
          <span className="text-sm font-medium text-navy">
            Passage in progress — started {passage.startTime ? formatUTC(new Date(passage.startTime)) : ""}
          </span>
        </div>
      )}

      {/* New Entry Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-navy/10 shadow-sm p-6">
          <h3 className="font-serif text-xl text-navy mb-4">
            {passage.active ? "End Passage / Add Entry" : "New Log Entry"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Latitude</label>
              <input
                type="text"
                placeholder="00° 00.000' N"
                value={formData.latitude || ""}
                onChange={e => setFormData(p => ({ ...p, latitude: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Longitude</label>
              <input
                type="text"
                placeholder="00° 00.000' W"
                value={formData.longitude || ""}
                onChange={e => setFormData(p => ({ ...p, longitude: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Weather</label>
              <select
                value={formData.weather || ""}
                onChange={e => setFormData(p => ({ ...p, weather: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Select...</option>
                <option value="Clear">Clear</option>
                <option value="Partly Cloudy">Partly Cloudy</option>
                <option value="Overcast">Overcast</option>
                <option value="Light Rain">Light Rain</option>
                <option value="Heavy Rain">Heavy Rain</option>
                <option value="Fog">Fog</option>
                <option value="Squall">Squall</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Wind Speed</label>
              <input
                type="text"
                placeholder="e.g. 15 kn"
                value={formData.windSpeed || ""}
                onChange={e => setFormData(p => ({ ...p, windSpeed: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Wind Direction</label>
              <input
                type="text"
                placeholder="e.g. NE"
                value={formData.windDir || ""}
                onChange={e => setFormData(p => ({ ...p, windDir: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Sea State</label>
              <select
                value={formData.seaState || ""}
                onChange={e => setFormData(p => ({ ...p, seaState: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              >
                <option value="">Select...</option>
                <option value="Calm">Calm (0)</option>
                <option value="Light Air">Light Air (1-2)</option>
                <option value="Moderate">Moderate (3-4)</option>
                <option value="Rough">Rough (5-6)</option>
                <option value="Very Rough">Very Rough (7-8)</option>
                <option value="High">High (9+)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Visibility</label>
              <input
                type="text"
                placeholder="e.g. 10 nm"
                value={formData.visibility || ""}
                onChange={e => setFormData(p => ({ ...p, visibility: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Barometer</label>
              <input
                type="text"
                placeholder="e.g. 1013 hPa"
                value={formData.barometer || ""}
                onChange={e => setFormData(p => ({ ...p, barometer: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Temperature</label>
              <input
                type="text"
                placeholder="e.g. 22°C"
                value={formData.temperature || ""}
                onChange={e => setFormData(p => ({ ...p, temperature: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Engine Hours</label>
              <input
                type="text"
                placeholder="e.g. 1247.5"
                value={formData.engineHours || ""}
                onChange={e => setFormData(p => ({ ...p, engineHours: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Notes</label>
              <textarea
                placeholder="Enter any additional notes, observations, or events..."
                value={formData.notes || ""}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy"
            >
              Cancel
            </button>
            {passage.active ? (
              <button
                onClick={endPassage}
                className="flex items-center gap-2 px-4 py-2 bg-gold text-navy rounded-md text-sm font-semibold hover:bg-gold/90"
              >
                <Anchor size={16} />
                End Passage
              </button>
            ) : (
              <button
                onClick={startPassage}
                className="flex items-center gap-2 px-4 py-2 bg-gold text-navy rounded-md text-sm font-semibold hover:bg-gold/90"
              >
                <Navigation size={16} />
                Start Passage
              </button>
            )}
            <button
              onClick={addEntry}
              className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-semibold hover:bg-ink"
            >
              <Plus size={16} />
              Add Entry
            </button>
          </div>
        </div>
      )}

      {/* Log Entries Table */}
      <div className="bg-white rounded-lg border border-navy/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy/5 border-b border-navy/10">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Date/Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Weather</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Wind</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Sea</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Engine</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Notes</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-navy/40">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen size={32} className="text-navy/20" />
                      <p>No log entries yet. Click &ldquo;New Entry&rdquo; to add your first record.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-navy/5 hover:bg-cream/50 transition-colors ${
                      entry.isPassageStart ? "bg-gold/5 border-l-4 border-l-gold" : ""
                    } ${entry.isPassageEnd ? "bg-navy/5 border-l-4 border-l-navy" : ""}`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono text-navy">{entry.date}</div>
                      <div className="text-navy/60">{entry.time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-navy">
                        <MapPin size={12} className="text-gold" />
                        {entry.latitude}
                      </div>
                      <div className="flex items-center gap-1 text-navy/60 ml-4">
                        {entry.longitude}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-navy">
                        <Thermometer size={12} className="text-gold" />
                        {entry.weather}
                      </div>
                      <div className="text-navy/60 text-xs">{entry.temperature}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-navy">
                        <Wind size={12} className="text-gold" />
                        {entry.windSpeed}
                      </div>
                      <div className="text-navy/60 text-xs">{entry.windDir}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-navy">
                        <Waves size={12} className="text-gold" />
                        {entry.seaState}
                      </div>
                      <div className="text-navy/60 text-xs">Vis: {entry.visibility}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-navy">
                        <Clock size={12} className="text-gold" />
                        {entry.engineHours}
                      </div>
                      <div className="text-navy/60 text-xs">{entry.barometer}</div>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className={`text-navy text-xs leading-relaxed ${entry.isPassageStart ? "font-semibold text-gold" : ""} ${entry.isPassageEnd ? "font-semibold" : ""}`}>
                        {entry.notes}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-1.5 text-navy/30 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete entry"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
