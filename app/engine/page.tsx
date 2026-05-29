"use client";

import { useState, useEffect } from "react";
import { Wrench, Gauge, Download } from "lucide-react";
import * as XLSX from "xlsx";

type EngineRecord = {
  id: string;
  date: string;
  time: string;
  engineHours: string;
  rpm: string;
  oilPressure: string;
  coolantTemp: string;
  fuelLevel: string;
  batteryVoltage: string;
  notes: string;
};

const STORAGE_KEY = "unicorn-chaser-engine";

function readEngineRecords(): EngineRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEngineRecords(records: EngineRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function EngineLogPage() {
  const [records, setRecords] = useState<EngineRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<EngineRecord>>({});

  useEffect(() => {
    setRecords(readEngineRecords());
  }, []);

  useEffect(() => {
    saveEngineRecords(records);
  }, [records]);

  const addRecord = () => {
    const now = new Date();
    const record: EngineRecord = {
      id: `${Date.now()}`,
      date: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`,
      time: `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`,
      engineHours: formData.engineHours || "",
      rpm: formData.rpm || "",
      oilPressure: formData.oilPressure || "",
      coolantTemp: formData.coolantTemp || "",
      fuelLevel: formData.fuelLevel || "",
      batteryVoltage: formData.batteryVoltage || "",
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
      "Engine Hours": r.engineHours,
      RPM: r.rpm,
      "Oil Pressure": r.oilPressure,
      "Coolant Temp": r.coolantTemp,
      "Fuel Level": r.fuelLevel,
      "Battery Voltage": r.batteryVoltage,
      Notes: r.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Engine Log");
    XLSX.writeFile(wb, `Unicorn-Chaser-Engine-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Engine Log</h2>
          <p className="text-sm text-navy/60 mt-1">Engine hours, performance, and maintenance records</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-medium hover:bg-ink">
            <Gauge size={16} />
            New Record
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/20 text-navy rounded-md text-sm font-medium hover:bg-cream">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-navy/10 shadow-sm p-6">
          <h3 className="font-serif text-xl text-navy mb-4">New Engine Record</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Engine Hours</label>
              <input type="text" value={formData.engineHours || ""} onChange={e => setFormData(p => ({ ...p, engineHours: e.target.value }))} placeholder="e.g. 1247.5" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">RPM</label>
              <input type="text" value={formData.rpm || ""} onChange={e => setFormData(p => ({ ...p, rpm: e.target.value }))} placeholder="e.g. 1800" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Oil Pressure</label>
              <input type="text" value={formData.oilPressure || ""} onChange={e => setFormData(p => ({ ...p, oilPressure: e.target.value }))} placeholder="e.g. 45 psi" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Coolant Temp</label>
              <input type="text" value={formData.coolantTemp || ""} onChange={e => setFormData(p => ({ ...p, coolantTemp: e.target.value }))} placeholder="e.g. 82°C" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Fuel Level</label>
              <input type="text" value={formData.fuelLevel || ""} onChange={e => setFormData(p => ({ ...p, fuelLevel: e.target.value }))} placeholder="e.g. 65%" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Battery Voltage</label>
              <input type="text" value={formData.batteryVoltage || ""} onChange={e => setFormData(p => ({ ...p, batteryVoltage: e.target.value }))} placeholder="e.g. 13.8V" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Notes</label>
              <textarea value={formData.notes || ""} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy">Cancel</button>
            <button onClick={addRecord} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-semibold hover:bg-ink">
              <Wrench size={16} />
              Save Record
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Engine Hrs</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">RPM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Oil Press</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Coolant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Fuel</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Battery</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-navy/40">
                  <div className="flex flex-col items-center gap-2">
                    <Gauge size={32} className="text-navy/20" />
                    <p>No engine records yet.</p>
                  </div>
                </td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id} className="border-b border-navy/5 hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono text-navy">{r.date}</div>
                      <div className="text-navy/60">{r.time}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-navy">{r.engineHours}</td>
                    <td className="px-4 py-3 font-mono text-navy">{r.rpm}</td>
                    <td className="px-4 py-3 text-navy">{r.oilPressure}</td>
                    <td className="px-4 py-3 text-navy">{r.coolantTemp}</td>
                    <td className="px-4 py-3 text-navy">{r.fuelLevel}</td>
                    <td className="px-4 py-3 text-navy">{r.batteryVoltage}</td>
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
