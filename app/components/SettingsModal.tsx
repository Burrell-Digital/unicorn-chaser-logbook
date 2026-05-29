"use client";

import { useEffect, useState } from "react";
import { X, Save } from "lucide-react";

export type VesselDetails = {
  callSign: string;
  mmsi: string;
  homePort: string;
  loa: string;
  grossTonnage: string;
};

const EMPTY: VesselDetails = {
  callSign: "",
  mmsi: "",
  homePort: "",
  loa: "",
  grossTonnage: "",
};

const FIELDS: { key: keyof VesselDetails; label: string; placeholder: string }[] = [
  { key: "callSign", label: "Call Sign", placeholder: "e.g. ZGFR2" },
  { key: "mmsi", label: "MMSI", placeholder: "e.g. 235012345" },
  { key: "homePort", label: "Home Port", placeholder: "e.g. Southampton, UK" },
  { key: "loa", label: "LOA (metres)", placeholder: "e.g. 28.5" },
  { key: "grossTonnage", label: "Gross Tonnage", placeholder: "e.g. 95" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsModal({ open, onClose }: Props) {
  const [details, setDetails] = useState<VesselDetails>(EMPTY);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = window.localStorage.getItem("vessel");
      if (raw) {
        setDetails({ ...EMPTY, ...JSON.parse(raw) });
      } else {
        setDetails(EMPTY);
      }
    } catch {
      setDetails(EMPTY);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const update = (key: keyof VesselDetails, value: string) =>
    setDetails((d) => ({ ...d, [key]: value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    window.localStorage.setItem("vessel", JSON.stringify(details));
    window.dispatchEvent(new Event("vessel-updated"));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vessel settings"
    >
      <div
        className="bg-cream w-full max-w-lg rounded-lg shadow-2xl border border-navy/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy/10">
          <div>
            <h2 className="font-serif text-2xl text-navy leading-tight">
              Vessel Details
            </h2>
            <p className="text-xs uppercase tracking-widest text-navy/60 mt-1">
              M/Y Unicorn Chaser
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-navy/60 hover:bg-navy/5 hover:text-navy"
            aria-label="Close settings"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={save} className="p-6 space-y-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label
                htmlFor={`vessel-${f.key}`}
                className="block text-xs font-semibold uppercase tracking-widest text-navy/70 mb-1"
              >
                {f.label}
              </label>
              <input
                id={`vessel-${f.key}`}
                type="text"
                value={details[f.key]}
                onChange={(e) => update(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full px-3 py-2 bg-white border border-navy/20 rounded-md text-navy placeholder:text-navy/30 focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-navy/70 hover:text-navy"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-navy text-cream text-sm font-semibold rounded-md hover:bg-ink"
            >
              <Save size={16} />
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
