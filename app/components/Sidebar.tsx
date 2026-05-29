"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  BookOpen,
  Compass,
  Wrench,
  Ship,
  TriangleAlert,
  ClipboardList,
  Users,
  Package,
  Settings,
  Menu,
  X,
} from "lucide-react";
import SettingsModal from "./SettingsModal";

type NavItem = {
  href: string;
  label: string;
  icon: typeof BookOpen;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    title: "Log Entries",
    items: [
      { href: "/", label: "Daily Log", icon: BookOpen },
      { href: "/voyage", label: "Voyage Info", icon: Compass },
      { href: "/engine", label: "Engine Log", icon: Wrench },
      { href: "/deck", label: "Deck Log", icon: Ship },
    ],
  },
  {
    title: "Reports",
    items: [
      { href: "/incident", label: "Incident", icon: TriangleAlert },
      { href: "/maintenance", label: "Maintenance", icon: ClipboardList },
    ],
  },
  {
    title: "Records",
    items: [
      { href: "/crew", label: "Crew List", icon: Users },
      { href: "/inventory", label: "Inventory", icon: Package },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const close = () => setMobileOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden fixed top-3 left-3 z-40 p-2 rounded-md bg-navy text-cream shadow-md hover:bg-ink"
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="lg:hidden fixed inset-0 bg-navy/50 z-20"
          onClick={close}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-30 w-64 bg-navy text-cream flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 py-6 border-b border-cream/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cream/5 border border-gold/40 flex items-center justify-center">
            <Anchor className="text-gold" size={20} />
          </div>
          <div>
            <h1 className="font-serif text-xl leading-tight text-cream">
              Unicorn Chaser
            </h1>
            <p className="text-xs text-gold/80 tracking-widest uppercase">
              Electronic Log Book
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          {NAV.map((sec) => (
            <div key={sec.title} className="mb-6">
              <h2 className="px-6 mb-2 text-xs font-semibold uppercase tracking-widest text-gold/70">
                {sec.title}
              </h2>
              <ul>
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className={
                          active
                            ? "flex items-center gap-3 px-6 py-2.5 text-sm bg-cream/10 text-gold border-l-4 border-gold"
                            : "flex items-center gap-3 px-6 py-2.5 text-sm text-cream/85 hover:bg-cream/5 hover:text-gold border-l-4 border-transparent"
                        }
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-cream/10 p-4">
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(true);
              close();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-cream/85 hover:bg-cream/10 hover:text-gold"
          >
            <Settings size={18} />
            <span>Vessel Settings</span>
          </button>
          <p className="mt-3 px-3 text-[10px] uppercase tracking-widest text-cream/40">
            Logbook · v0.1
          </p>
        </div>
      </aside>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
