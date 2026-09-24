"use client";

import { useState } from "react";

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export default function Tabs({
  items,
  defaultId,
}: {
  items: TabItem[];
  defaultId?: string;
}) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const activeItem = items.find((i) => i.id === active) ?? items[0];

  return (
    <div>
      <div
        role="tablist"
        className="flex flex-wrap gap-1 border-b border-slate-200 mb-8"
      >
        {items.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={active === item.id}
            onClick={() => setActive(item.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-md border-b-2 -mb-px transition-colors ${
              active === item.id
                ? "border-accent text-accent bg-accentTint"
                : "border-transparent text-charcoal/60 hover:text-ink hover:bg-paperDark"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{activeItem?.content}</div>
    </div>
  );
}
