import { useState } from "react";
import type { Criteria } from "../api";

interface ReviewPanelProps {
  criteria: Criteria[];
  isStreaming: boolean;
}

export function ReviewPanel({ criteria, isStreaming }: ReviewPanelProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);

  if (isStreaming || criteria.length === 0) return null;

  const toggle = (id: number) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="absolute top-6 left-6 z-50 flex flex-col max-w-xs">
      <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center gap-2 px-4 py-3 text-white/80 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
          <span className="text-sm font-semibold flex-1 text-left">Self Review</span>
          <svg
            className={`w-3 h-3 transition-transform ${collapsed ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Criteria list */}
        {!collapsed && (
          <ul className="px-4 pb-4 flex flex-col gap-2">
            {criteria.map((c) => (
              <li key={c.id}>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={!!checked[c.id]}
                    onChange={() => toggle(c.id)}
                    className="mt-0.5 w-4 h-4 accent-emerald-400 shrink-0 cursor-pointer"
                  />
                  <span
                    className={`text-xs leading-relaxed transition-colors ${
                      checked[c.id] ? "line-through text-white/30" : "text-white/70 group-hover:text-white/90"
                    }`}
                  >
                    {c.description}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}