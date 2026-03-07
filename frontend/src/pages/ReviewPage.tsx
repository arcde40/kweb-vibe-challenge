import { useState } from "react";
import type { Criteria } from "../api";

interface ReviewPageProps {
  criteria: Criteria[];
  onComplete: (passed: boolean, failed: Criteria[]) => void;
}

export function ReviewPage({ criteria, onComplete }: ReviewPageProps) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Criteria[]>([]);

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
      <div className="pointer-events-auto w-full max-w-lg mx-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-5 animate-in fade-in slide-in-from-top-4 duration-300">
        {/* Progress */}
        <div className="flex items-center justify-between text-white/40 text-xs font-semibold uppercase tracking-widest">
          <span>Self Review</span>
          <span>{index + 1} / {total}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
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
            No
          </button>
          <button
            onClick={() => answer(true)}
            className="flex-1 py-3 rounded-xl font-bold text-sm bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/40 hover:text-emerald-100 transition-all"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
