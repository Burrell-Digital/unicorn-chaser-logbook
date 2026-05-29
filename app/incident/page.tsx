"use client";

import { useState, useEffect } from "react";
import { TriangleAlert, Download } from "lucide-react";
import * as XLSX from "xlsx";

type IncidentRecord = {
  id: string;
  date: string;
  time: string;
  category: string;
  severity: string;
  description: string;
  actionTaken: string;
  reportedBy: string;
  witnesses: string;
  followUp: string;
};

const STORAGE_KEY = "unicorn-chaser-incidents";

function readIncidents(): IncidentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIncidents(records: IncidentRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export default function IncidentPage() {
  const [records, setRecords] = useState<IncidentRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<IncidentRecord>>({});

  useEffect(() => {
    setRecords(readIncidents());
  }, []);

  useEffect(() => {
    saveIncidents(records);
  }, [records]);

  const addRecord = () => {
    const now = new Date();
    const record: IncidentRecord = {
      id: `${Date.now()}`,
      date: `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`,
      time: `${String(now.getUTCHours()).padStart(2, "0")}:${String(now.getUTCMinutes()).padStart(2, "0")}`,
      category: formData.category || "",
      severity: formData.severity || "Low",
      description: formData.description || "",
      actionTaken: formData.actionTaken || "",
      reportedBy: formData.reportedBy || "",
      witnesses: formData.witnesses || "",
      followUp: formData.followUp || "",
    };
    setRecords(prev => [record, ...prev]);
    setFormData({});
    setShowForm(false);
  };

  const exportToExcel = () => {
    const data = records.map(r => ({
      Date: r.date,
      Time: r.time,
      Category: r.category,
      Severity: r.severity,
      Description: r.description,
      "Action Taken": r.actionTaken,
      "Reported By": r.reportedBy,
      Witnesses: r.witnesses,
      "Follow Up": r.followUp,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Incidents");
    XLSX.writeFile(wb, `Unicorn-Chaser-Incidents-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const severityColor = (s: string) => {
    switch (s) {
      case "Critical": return "bg-red-100 text-red-800 border-red-200";
      case "High": return "bg-orange-100 text-orange-800 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-green-100 text-green-800 border-green-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Incident Reports</h2>
          <p className="text-sm text-navy/60 mt-1">Record incidents, near-misses, and safety events</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-medium hover:bg-ink">
            <TriangleAlert size={16} />
            New Report
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/20 text-navy rounded-md text-sm font-medium hover:bg-cream">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-navy/10 shadow-sm p-6">
          <h3 className="font-serif text-xl text-navy mb-4">New Incident Report</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Category</label>
              <select value={formData.category || ""} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold">
                <option value="">Select...</option>
                <option value="Safety">Safety</option>
                <option value="Environmental">Environmental</option>
                <option value="Security">Security</option>
                <option value="Collision">Collision / Allision</option>
                <option value="Injury">Injury / Medical</option>
                <option value="Equipment">Equipment Failure</option>
                <option value="Near Miss">Near Miss</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Severity</label>
              <select value={formData.severity || "Low"} onChange={e => setFormData(p => ({ ...p, severity: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Reported By</label>
              <input type="text" value={formData.reportedBy || ""} onChange={e => setFormData(p => ({ ...p, reportedBy: e.target.value }))} placeholder="Name" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Witnesses</label>
              <input type="text" value={formData.witnesses || ""} onChange={e => setFormData(p => ({ ...p, witnesses: e.target.value }))} placeholder="Names" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Description</label>
              <textarea value={formData.description || ""} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Detailed description of the incident..." className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Action Taken</label>
              <textarea value={formData.actionTaken || ""} onChange={e => setFormData(p => ({ ...p, actionTaken: e.target.value }))} rows={2} placeholder="Immediate actions taken..." className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Follow Up Required</label>
              <textarea value={formData.followUp || ""} onChange={e => setFormData(p => ({ ...p, followUp: e.target.value }))} rows={2} placeholder="Follow-up actions needed..." className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy">Cancel</button>
            <button onClick={addRecord} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-semibold hover:bg-ink">
              <TriangleAlert size={16} />
              Save Report
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Severity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Reporter</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-navy/40">
                  <div className="flex flex-col items-center gap-2">
                    <TriangleAlert size={32} className="text-navy/20" />
                    <p>No incidents recorded. (That&apos;s a good thing!)</p>
                  </div>
                </td></tr>
              ) : (
                records.map(r => (
                  <tr key={r.id} className="border-b border-navy/5 hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono text-navy">{r.date}</div>
                      <div className="text-navy/60">{r.time}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-navy/5 text-navy">{r.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${severityColor(r.severity)}`}>{r.severity}</span>
                    </td>
                    <td className="px-4 py-3 text-navy text-xs max-w-sm">{r.description}</td>
                    <td className="px-4 py-3 text-navy text-xs max-w-sm">{r.actionTaken}</td>
                    <td className="px-4 py-3 text-navy">{r.reportedBy}</td>
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
