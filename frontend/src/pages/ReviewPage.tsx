import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Criteria } from "../api";

interface ReviewPageProps {
  criteria: Criteria[];
  onComplete: (passed: boolean, failed: Criteria[]) => void;
}

export function ReviewPage({ criteria, onComplete }: ReviewPageProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Criteria[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const current = criteria[index];
  const total = criteria.length;

  const answer = (yes: boolean) => {
    const newFailed = yes ? failed : [...failed, current];
    if (index + 1 >= total) {
      onComplete(newFailed.length === 0, newFailed);
    } else {
      setFailed(newFailed);
      setIndex(index + 1);
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center pt-10 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-lg mx-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Header row — always visible */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 text-white/40 text-xs font-semibold uppercase tracking-widest">
            <span>{t("review.title")}</span>
            {collapsed && <span className="text-white/20">{index + 1} / {total}</span>}
          </div>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="text-white/40 hover:text-white/80 transition-colors"
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Collapsible body */}
        {!collapsed && (
          <div className="px-6 pb-6 flex flex-col gap-5">
            {/* Progress bar */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden -mt-1">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-300"
                style={{ width: `${(index / total) * 100}%` }}
              />
            </div>

            <div className="flex justify-end text-white/30 text-xs font-semibold">
              {index + 1} / {total}
            </div>

            {/* Criterion */}
            <p className="text-white text-lg font-medium leading-relaxed text-center min-h-[3rem]">
              {current.description}
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => answer(false)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/40 hover:text-red-100 transition-all"
              >
                {t("review.no")}
              </button>
              <button
                onClick={() => answer(true)}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/40 hover:text-emerald-100 transition-all"
              >
                {t("review.yes")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}