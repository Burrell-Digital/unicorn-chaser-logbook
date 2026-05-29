"use client";

import { useState, useEffect } from "react";
import { ClipboardList, Download } from "lucide-react";
import * as XLSX from "xlsx";

type MaintenanceRecord = {
  id: string;
  date: string;
  item: string;
  category: string;
  description: string;
  completedBy: string;
  nextDue: string;
  hoursAtService: string;
  notes: string;
};

const STORAGE_KEY = "unicorn-chaser-maintenance";

function readMaintenance(): MaintenanceRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMaintenance(records: MaintenanceRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<MaintenanceRecord>>({});

  useEffect(() => {
    setRecords(readMaintenance());
  }, []);

  useEffect(() => {
    saveMaintenance(records);
  }, [records]);

  const addRecord = () => {
    const now = new Date();
    const record: MaintenanceRecord = {
      id: `${Date.now()}`,
      date: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`,
      item: formData.item || "",
      category: formData.category || "",
      description: formData.description || "",
      completedBy: formData.completedBy || "",
      nextDue: formData.nextDue || "",
      hoursAtService: formData.hoursAtService || "",
      notes: formData.notes || "",
    };
    setRecords(prev => [record, ...prev]);
    setFormData({});
    setShowForm(false);
  };

  const exportToExcel = () => {
    const data = records.map(r => ({
      Date: r.date,
      Item: r.item,
      Category: r.category,
      Description: r.description,
      "Completed By": r.completedBy,
      "Next Due": r.nextDue,
      "Hours at Service": r.hoursAtService,
      Notes: r.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Maintenance");
    XLSX.writeFile(wb, `Unicorn-Chaser-Maintenance-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Maintenance Log</h2>
          <p className="text-sm text-navy/60 mt-1">Service records and scheduled maintenance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-medium hover:bg-ink">
            <ClipboardList size={16} />
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
          <h3 className="font-serif text-xl text-navy mb-4">New Maintenance Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Item</label>
              <input type="text" value={formData.item || ""} onChange={e => setFormData(p => ({ ...p, item: e.target.value }))} placeholder="e.g. Port Main Engine" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Category</label>
              <select value={formData.category || ""} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold">
                <option value="">Select...</option>
                <option value="Engine">Engine</option>
                <option value="Hull">Hull</option>
                <option value="Electrical">Electrical</option>
                <option value="Navigation">Navigation</option>
                <option value="Safety">Safety Equipment</option>
                <option value="HVAC">HVAC</option>
                <option value="Hydraulics">Hydraulics</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Completed By</label>
              <input type="text" value={formData.completedBy || ""} onChange={e => setFormData(p => ({ ...p, completedBy: e.target.value }))} placeholder="Name / Company" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Next Due</label>
              <input type="date" value={formData.nextDue || ""} onChange={e => setFormData(p => ({ ...p, nextDue: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Hours at Service</label>
              <input type="text" value={formData.hoursAtService || ""} onChange={e => setFormData(p => ({ ...p, hoursAtService: e.target.value }))} placeholder="Engine hours" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Description</label>
              <textarea value={formData.description || ""} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Work performed..." className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Notes</label>
              <textarea value={formData.notes || ""} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2} placeholder="Additional notes..." className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy">Cancel</button>
            <button onClick={addRecord} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-semibold hover:bg-ink">
              <ClipboardList size={16} />
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Next Due</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-navy/40">
                  <div className="flex flex-col items-center gap-2">
                    <ClipboardList size={32} className="text-navy/20" />
                    <p>No maintenance records yet.</p>
                  </div>
                </td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id} className="border-b border-navy/5 hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-navy">{r.date}</td>
                    <td className="px-4 py-3 font-medium text-navy">{r.item}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-navy/5 text-navy">{r.category}</span>
                    </td>
                    <td className="px-4 py-3 text-navy text-xs max-w-sm">{r.description}</td>
                    <td className="px-4 py-3 text-navy">{r.completedBy}</td>
                    <td className="px-4 py-3 font-mono text-navy">{r.nextDue}</td>
                    <td className="px-4 py-3 font-mono text-navy">{r.hoursAtService}</td>
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
