"use client";

import { useState, useEffect } from "react";
import { Users, Download } from "lucide-react";
import * as XLSX from "xlsx";

type CrewMember = {
  id: string;
  name: string;
  rank: string;
  license: string;
  nationality: string;
  dateOfBirth: string;
  joiningDate: string;
  relievingDate: string;
  contact: string;
  emergencyContact: string;
  notes: string;
};

const STORAGE_KEY = "unicorn-chaser-crew";

function readCrew(): CrewMember[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCrew(crew: CrewMember[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(crew));
}

export default function CrewPage() {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<CrewMember>>({});

  useEffect(() => {
    setCrew(readCrew());
  }, []);

  useEffect(() => {
    saveCrew(crew);
  }, [crew]);

  const addCrew = () => {
    const member: CrewMember = {
      id: `${Date.now()}`,
      name: formData.name || "",
      rank: formData.rank || "",
      license: formData.license || "",
      nationality: formData.nationality || "",
      dateOfBirth: formData.dateOfBirth || "",
      joiningDate: formData.joiningDate || "",
      relievingDate: formData.relievingDate || "",
      contact: formData.contact || "",
      emergencyContact: formData.emergencyContact || "",
      notes: formData.notes || "",
    };
    setCrew(prev => [member, ...prev]);
    setFormData({});
    setShowForm(false);
  };

  const removeCrew = (id: string) => {
    setCrew(prev => prev.filter(c => c.id !== id));
  };

  const exportToExcel = () => {
    const data = crew.map(c => ({
      Name: c.name,
      Rank: c.rank,
      License: c.license,
      Nationality: c.nationality,
      "Date of Birth": c.dateOfBirth,
      "Joining Date": c.joiningDate,
      "Relieving Date": c.relievingDate,
      Contact: c.contact,
      "Emergency Contact": c.emergencyContact,
      Notes: c.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Crew");
    XLSX.writeFile(wb, `Unicorn-Chaser-Crew-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Crew List</h2>
          <p className="text-sm text-navy/60 mt-1">Current crew members and details</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-medium hover:bg-ink">
            <Users size={16} />
            Add Crew
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/20 text-navy rounded-md text-sm font-medium hover:bg-cream">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-navy/10 shadow-sm p-6">
          <h3 className="font-serif text-xl text-navy mb-4">New Crew Member</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Full Name</label>
              <input type="text" value={formData.name || ""} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Rank</label>
              <select value={formData.rank || ""} onChange={e => setFormData(p => ({ ...p, rank: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold">
                <option value="">Select...</option>
                <option value="Captain">Captain</option>
                <option value="Chief Officer">Chief Officer</option>
                <option value="Deck Officer">Deck Officer</option>
                <option value="Chief Engineer">Chief Engineer</option>
                <option value="Engineer">Engineer</option>
                <option value="Bosun">Bosun</option>
                <option value="Deckhand">Deckhand</option>
                <option value="Chef">Chef</option>
                <option value="Steward/Stewardess">Steward/Stewardess</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">License Number</label>
              <input type="text" value={formData.license || ""} onChange={e => setFormData(p => ({ ...p, license: e.target.value }))} placeholder="STCW / Flag State" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Nationality</label>
              <input type="text" value={formData.nationality || ""} onChange={e => setFormData(p => ({ ...p, nationality: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Date of Birth</label>
              <input type="date" value={formData.dateOfBirth || ""} onChange={e => setFormData(p => ({ ...p, dateOfBirth: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Joining Date</label>
              <input type="date" value={formData.joiningDate || ""} onChange={e => setFormData(p => ({ ...p, joiningDate: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Relieving Date</label>
              <input type="date" value={formData.relievingDate || ""} onChange={e => setFormData(p => ({ ...p, relievingDate: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Contact</label>
              <input type="text" value={formData.contact || ""} onChange={e => setFormData(p => ({ ...p, contact: e.target.value }))} placeholder="Phone / Email" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Emergency Contact</label>
              <input type="text" value={formData.emergencyContact || ""} onChange={e => setFormData(p => ({ ...p, emergencyContact: e.target.value }))} placeholder="Name & Phone" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Notes</label>
              <textarea value={formData.notes || ""} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy">Cancel</button>
            <button onClick={addCrew} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-semibold hover:bg-ink">
              <Users size={16} />
              Add Member
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crew.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center py-12 text-navy/40">
            <div className="flex flex-col items-center gap-2">
              <Users size={32} className="text-navy/20" />
              <p>No crew members added yet.</p>
            </div>
          </div>
        ) : (
          crew.map(c => (
            <div key={c.id} className="bg-white rounded-lg border border-navy/10 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-lg text-navy">{c.name}</h3>
                  <p className="text-sm text-gold font-medium">{c.rank}</p>
                </div>
                <button onClick={() => removeCrew(c.id)} className="text-navy/30 hover:text-red-500 p-1">&times;</button>
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                {c.license && <div className="text-navy/70"><span className="text-navy/50">License: </span>{c.license}</div>}
                {c.nationality && <div className="text-navy/70"><span className="text-navy/50">Nationality: </span>{c.nationality}</div>}
                {c.dateOfBirth && <div className="text-navy/70"><span className="text-navy/50">DOB: </span>{c.dateOfBirth}</div>}
                {c.joiningDate && <div className="text-navy/70"><span className="text-navy/50">Joined: </span>{c.joiningDate}</div>}
                {c.relievingDate && <div className="text-navy/70"><span className="text-navy/50">Relieves: </span>{c.relievingDate}</div>}
                {c.contact && <div className="text-navy/70"><span className="text-navy/50">Contact: </span>{c.contact}</div>}
                {c.emergencyContact && <div className="text-navy/70"><span className="text-navy/50">Emergency: </span>{c.emergencyContact}</div>}
              </div>
              {c.notes && <p className="mt-3 text-xs text-navy/60 italic border-t border-navy/5 pt-2">{c.notes}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
