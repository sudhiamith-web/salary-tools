"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { tools } from "@/lib/tools";

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = Array.from(new Set(tools.map((t) => t.category)));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-charcoal/70 flex items-center gap-1"
      >
        Tools
        <span className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
          {categories.map((category) => (
            <div key={category}>
              <p className="px-4 pt-2 pb-1 text-xs uppercase tracking-widest text-charcoal/40 font-medium">
                {category}
              </p>
              {tools
                .filter((t) => t.category === category)
                .map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2 text-sm text-charcoal/80 hover:bg-accentTint hover:text-accent"
                  >
                    {tool.name}
                  </Link>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
