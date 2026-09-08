"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { tools } from "@/lib/tools";

// Renders one top-level dropdown per category, matching the reference
// structure (each product line gets its own nav item). Today there's
// only one category ("Salary & Tax"), so this shows as a single
// dropdown — but adding "Investments" or "Loans" later just adds
// another category to lib/tools.ts, no nav rework needed.

export default function SiteNav() {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenCategory(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = Array.from(new Set(tools.map((t) => t.category)));

  return (
    <div className="flex items-center gap-5" ref={ref}>
      {categories.map((category) => (
        <div key={category} className="relative">
          <button
            onClick={() => setOpenCategory(openCategory === category ? null : category)}
            className="text-sm text-slate-300 hover:text-white flex items-center gap-1"
          >
            {category}
            <span
              className={`text-xs transition-transform ${openCategory === category ? "rotate-180" : ""}`}
            >
              ▾
            </span>
          </button>
          {openCategory === category && (
            <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
              {tools
                .filter((t) => t.category === category)
                .map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    onClick={() => setOpenCategory(null)}
                    className="block px-4 py-2 text-sm text-charcoal/80 hover:bg-accentTint hover:text-accent"
                  >
                    {tool.name}
                  </Link>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
