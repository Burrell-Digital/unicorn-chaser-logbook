"use client";

import { useState, useEffect } from "react";
import { Ship, Download } from "lucide-react";
import * as XLSX from "xlsx";

type DeckRecord = {
  id: string;
  date: string;
  time: string;
  watchkeeper: string;
  activity: string;
  visitors: string;
  mooringDetails: string;
  securityRounds: string;
  notes: string;
};

const STORAGE_KEY = "unicorn-chaser-deck";

function readDeckRecords(): DeckRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDeckRecords(records: DeckRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function DeckLogPage() {
  const [records, setRecords] = useState<DeckRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<DeckRecord>>({});

  useEffect(() => {
    setRecords(readDeckRecords());
  }, []);

  useEffect(() => {
    saveDeckRecords(records);
  }, [records]);

  const addRecord = () => {
    const now = new Date();
    const record: DeckRecord = {
      id: `${Date.now()}`,
      date: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`,
      time: `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`,
      watchkeeper: formData.watchkeeper || "",
      activity: formData.activity || "",
      visitors: formData.visitors || "",
      mooringDetails: formData.mooringDetails || "",
      securityRounds: formData.securityRounds || "",
      notes: formData.notes || "",
    };
    setRecords(prev => [record, ...prev]);
    setFormData({});
    setShowForm(false);
  };

  const exportToExcel = () => {
    const data = records.map(r => ({
      Date: r.date,
      Time: r.time,
      Watchkeeper: r.watchkeeper,
      Activity: r.activity,
      Visitors: r.visitors,
      Mooring: r.mooringDetails,
      Security: r.securityRounds,
      Notes: r.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deck Log");
    XLSX.writeFile(wb, `Unicorn-Chaser-Deck-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Deck Log</h2>
          <p className="text-sm text-navy/60 mt-1">Watchkeeping, visitors, mooring, and security records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-medium hover:bg-ink">
            <Ship size={16} />
            New Entry
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/20 text-navy rounded-md text-sm font-medium hover:bg-cream">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-navy/10 shadow-sm p-6">
          <h3 className="font-serif text-xl text-navy mb-4">New Deck Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Watchkeeper</label>
              <input type="text" value={formData.watchkeeper || ""} onChange={e => setFormData(p => ({ ...p, watchkeeper: e.target.value }))} placeholder="Name" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Activity</label>
              <input type="text" value={formData.activity || ""} onChange={e => setFormData(p => ({ ...p, activity: e.target.value }))} placeholder="e.g. Arrival, Departure, Anchoring" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Visitors</label>
              <input type="text" value={formData.visitors || ""} onChange={e => setFormData(p => ({ ...p, visitors: e.target.value }))} placeholder="Names & purpose" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Mooring Details</label>
              <input type="text" value={formData.mooringDetails || ""} onChange={e => setFormData(p => ({ ...p, mooringDetails: e.target.value }))} placeholder="Berth, anchor, mooring buoy" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Security Rounds</label>
              <textarea value={formData.securityRounds || ""} onChange={e => setFormData(p => ({ ...p, securityRounds: e.target.value }))} rows={2} placeholder="Details of security rounds conducted" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">General Notes</label>
              <textarea value={formData.notes || ""} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy">Cancel</button>
            <button onClick={addRecord} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-semibold hover:bg-ink">
              <Ship size={16} />
              Save Entry
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-navy/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy/5 border-b border-navy/10">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Date/Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Watchkeeper</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Activity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Visitors</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Mooring</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Security</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-navy/40">
                  <div className="flex flex-col items-center gap-2">
                    <Ship size={32} className="text-navy/20" />
                    <p>No deck records yet.</p>
                  </div>
                </td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id} className="border-b border-navy/5 hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono text-navy">{r.date}</div>
                      <div className="text-navy/60">{r.time}</div>
                    </td>
                    <td className="px-4 py-3 text-navy">{r.watchkeeper}</td>
                    <td className="px-4 py-3 text-navy">{r.activity}</td>
                    <td className="px-4 py-3 text-navy text-xs">{r.visitors}</td>
                    <td className="px-4 py-3 text-navy text-xs">{r.mooringDetails}</td>
                    <td className="px-4 py-3 text-navy text-xs max-w-xs">{r.securityRounds}</td>
                    <td className="px-4 py-3 text-navy text-xs max-w-xs">{r.notes}</td>
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
