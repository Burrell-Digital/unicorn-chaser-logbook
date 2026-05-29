"use client";

import { useState, useEffect } from "react";
import { Package, Download } from "lucide-react";
import * as XLSX from "xlsx";

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  quantity: string;
  unit: string;
  location: string;
  minLevel: string;
  supplier: string;
  lastOrdered: string;
  notes: string;
};

const STORAGE_KEY = "unicorn-chaser-inventory";

function readInventory(): InventoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveInventory(items: InventoryItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});

  useEffect(() => {
    setItems(readInventory());
  }, []);

  useEffect(() => {
    saveInventory(items);
  }, [items]);

  const addItem = () => {
    const item: InventoryItem = {
      id: `${Date.now()}`,
      name: formData.name || "",
      category: formData.category || "",
      quantity: formData.quantity || "",
      unit: formData.unit || "",
      location: formData.location || "",
      minLevel: formData.minLevel || "",
      supplier: formData.supplier || "",
      lastOrdered: formData.lastOrdered || "",
      notes: formData.notes || "",
    };
    setItems(prev => [item, ...prev]);
    setFormData({});
    setShowForm(false);
  };

  const exportToExcel = () => {
    const data = items.map(i => ({
      Name: i.name,
      Category: i.category,
      Quantity: i.quantity,
      Unit: i.unit,
      Location: i.location,
      "Min Level": i.minLevel,
      Supplier: i.supplier,
      "Last Ordered": i.lastOrdered,
      Notes: i.notes,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `Unicorn-Chaser-Inventory-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-navy">Inventory</h2>
          <p className="text-sm text-navy/60 mt-1">Provisions, supplies, and equipment tracking</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-medium hover:bg-ink">
            <Package size={16} />
            Add Item
          </button>
          <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-white border border-navy/20 text-navy rounded-md text-sm font-medium hover:bg-cream">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-navy/10 shadow-sm p-6">
          <h3 className="font-serif text-xl text-navy mb-4">New Inventory Item</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Item Name</label>
              <input type="text" value={formData.name || ""} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Category</label>
              <select value={formData.category || ""} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold">
                <option value="">Select...</option>
                <option value="Provisions">Provisions</option>
                <option value="Beverages">Beverages</option>
                <option value="Cleaning">Cleaning Supplies</option>
                <option value="Safety">Safety Equipment</option>
                <option value="Engine">Engine Parts</option>
                <option value="Electrical">Electrical</option>
                <option value="Deck">Deck Equipment</option>
                <option value="Galley">Galley</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Quantity</label>
              <input type="text" value={formData.quantity || ""} onChange={e => setFormData(p => ({ ...p, quantity: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Unit</label>
              <input type="text" value={formData.unit || ""} onChange={e => setFormData(p => ({ ...p, unit: e.target.value }))} placeholder="e.g. kg, litres, each" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Location</label>
              <input type="text" value={formData.location || ""} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="e.g. Forward Store" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Minimum Level</label>
              <input type="text" value={formData.minLevel || ""} onChange={e => setFormData(p => ({ ...p, minLevel: e.target.value }))} placeholder="Reorder threshold" className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Supplier</label>
              <input type="text" value={formData.supplier || ""} onChange={e => setFormData(p => ({ ...p, supplier: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Last Ordered</label>
              <input type="date" value={formData.lastOrdered || ""} onChange={e => setFormData(p => ({ ...p, lastOrdered: e.target.value }))} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1">Notes</label>
              <textarea value={formData.notes || ""} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full px-3 py-2 bg-cream border border-navy/20 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gold" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy">Cancel</button>
            <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 bg-navy text-cream rounded-md text-sm font-semibold hover:bg-ink">
              <Package size={16} />
              Add Item
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-navy/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-navy/5 border-b border-navy/10">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Item</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Unit</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Min Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Supplier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-navy/70">Last Ordered</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-navy/40">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={32} className="text-navy/20" />
                    <p>No inventory items yet.</p>
                  </div>
                </td></tr>
              ) : (
                items.map(i => (
                  <tr key={i.id} className="border-b border-navy/5 hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-navy">{i.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-navy/5 text-navy">{i.category}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-navy">{i.quantity}</td>
                    <td className="px-4 py-3 text-navy">{i.unit}</td>
                    <td className="px-4 py-3 text-navy">{i.location}</td>
                    <td className="px-4 py-3 font-mono text-navy">{i.minLevel}</td>
                    <td className="px-4 py-3 text-navy">{i.supplier}</td>
                    <td className="px-4 py-3 font-mono text-navy">{i.lastOrdered}</td>
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
