"use client";

import { useState, useEffect } from "react";
import { Compass, Anchor, Navigation, Download } from "lucide-react";
import * as XLSX from "xlsx";

type PassageRecord = {
  id: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  departurePort: string;
  arrivalPort: string;
  startPosition: string;
  endPosition: string;
  distance: string;
  duration: string;
  notes: string;
};

const STORAGE_KEY = "unicorn-chaser-passages";

function readPassages(): PassageRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePassages(passages: PassageRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(passages));
}

export default function VoyagePage() {
  const [passages, setPassages] = useState<PassageRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PassageRecord>>({});

  useEffect(() => {
    setPassages(readPassages());
  }, []);

  useEffect(() => {
    savePassages(passages);
  }, [passages]);

  const addPassage = () => {
    const p: PassageRecord = {
      id: `${Date.now()}`,
      startDate: formData.startDate || "",
      startTime: formData.startTime || "",
      endDate: formData.endDate || "",
      endTime: formData.endTime || "",
      departurePort: formData.departurePort || "",
      arrivalPort: formData.arrivalPort || "",
      startPosition: formData.startPosition || "",
      endPosition: formData.endPosition || "",
      distance: formData.distance || "",
      duration: formData.duration || "",
      notes: formData.notes || "",
    };
    setPassages(prev => [p, ...prev]);
    setFormData({});
    setShowForm(false);
  };

  const exportToExcel = () => {
    const data = passages.map(p => ({
      "Start Date": p.startDate,
      "Start Time": p.startTime,
      "End Date": p.endDate,
      "End Time": p.endTime,
      "Departure": p.departurePort,
      "Arrival": p.arrivalPort,
      "From": p.startPosition,
      "To": p.endPosition,
      "Distance": p.distance,
      "Duration": p.duration,
      Notes: p.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Passages");
    XLSX.writeFile(wb, `Unicorn-Chaser-Passages-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Voyage Info</h2>
          <p className="text-sm text-navy/60 mt-1">Record of passages and voyages</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-medium hover:bg-ink"
          >
            <Navigation size={16} />
            Record Passage
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/20 text-navy rounded-md text-sm font-medium hover:bg-cream"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-navy/10 shadow-sm p-6">
          <h3 className="font-serif text-xl text-navy mb-4">New Passage</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Departure Port</label>
              <input
                type="text"
                value={formData.departurePort || ""}
                onChange={e => setFormData(p => ({ ...p, departurePort: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Arrival Port</label>
              <input
                type="text"
                value={formData.arrivalPort || ""}
                onChange={e => setFormData(p => ({ ...p, arrivalPort: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Distance (nm)</label>
              <input
                type="text"
                value={formData.distance || ""}
                onChange={e => setFormData(p => ({ ...p, distance: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime || ""}
                onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Start Position</label>
              <input
                type="text"
                value={formData.startPosition || ""}
                onChange={e => setFormData(p => ({ ...p, startPosition: e.target.value }))}
                placeholder="Lat / Lon"
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime || ""}
                onChange={e => setFormData(p => ({ ...p, endTime: e.target.value }))}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">End Position</label>
              <input
                type="text"
                value={formData.endPosition || ""}
                onChange={e => setFormData(p => ({ ...p, endPosition: e.target.value }))}
                placeholder="Lat / Lon"
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration || ""}
                onChange={e => setFormData(p => ({ ...p, duration: e.target.value }))}
                placeholder="e.g. 6h 30m"
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Notes</label>
              <textarea
                value={formData.notes || ""}
                onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy">Cancel</button>
            <button onClick={addPassage} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-semibold hover:bg-ink">
              <Anchor size={16} />
              Save Passage
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-navy/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy/5 border-b border-navy/10">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Departure</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Arrival</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">From</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">To</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Distance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Duration</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Notes</th>
              </tr>
            </thead>
            <tbody>
              {passages.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-navy/40">
                  <div className="flex flex-col items-center gap-2">
                    <Compass size={32} className="text-navy/20" />
                    <p>No passages recorded yet.</p>
                  </div>
                </td></tr>
              ) : (
                passages.map(p => (
                  <tr key={p.id} className="border-b border-navy/5 hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-navy">{p.departurePort}</div>
                      <div className="text-navy/60 text-xs">{p.startDate} {p.startTime}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-navy">{p.arrivalPort}</div>
                      <div className="text-navy/60 text-xs">{p.endDate} {p.endTime}</div>
                    </td>
                    <td className="px-4 py-3 text-navy text-xs">{p.startPosition}</td>
                    <td className="px-4 py-3 text-navy text-xs">{p.endPosition}</td>
                    <td className="px-4 py-3 text-navy font-mono">{p.distance}</td>
                    <td className="px-4 py-3 text-navy">{p.duration}</td>
                    <td className="px-4 py-3 text-navy text-xs max-w-xs">{p.notes}</td>
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
