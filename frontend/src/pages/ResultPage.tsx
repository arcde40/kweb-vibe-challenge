import { useTranslation } from "react-i18next";
import type { Criteria, RankingEntry } from "../api";

interface ResultPageProps {
  passed: boolean;
  failed: Criteria[];
  prompt: string;
  letterCount: number;
  ticketId: string | null;
  myRank: number | null;
  leaderboard: RankingEntry[];
  onRetry: () => void;
}

export function ResultPage({ passed, failed, prompt, letterCount, ticketId, myRank, leaderboard, onRetry }: ResultPageProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start pt-12 px-6 animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-md flex flex-col items-center gap-6 pb-12">

        {/* Result header */}
        <div className="text-center">
          <p className={`text-5xl font-black mb-1 ${passed ? "text-white" : "text-red-400"}`}>
            {passed ? t("result.passed") : t("result.failed")}
          </p>
          {passed && myRank && (
            <p className="text-white/50 text-sm">{t("result.ranked", { rank: myRank })}</p>
          )}
        </div>

        {/* Prompt + letter count + ticket */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-2">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{t("result.your_prompt")}</p>
          <p className="text-white/80 text-sm leading-relaxed">{prompt}</p>
          <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-1">
            <span className="text-white/40 text-xs">{t("result.letter_count")}</span>
            <span className="text-white font-bold text-sm">{letterCount}</span>
          </div>
          {ticketId && (
            <div className="flex items-center justify-between border-t border-white/10 pt-1">
              <span className="text-white/40 text-xs">{t("result.ticket")}</span>
              <span className="text-white/60 font-mono text-xs tracking-widest">{ticketId.slice(0, 8).toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Failed criteria */}
        {!passed && failed.length > 0 && (
          <div className="w-full flex flex-col gap-2">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{t("result.criteria_not_met")}</p>
            {failed.map((c) => (
              <div key={c.id} className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <span className="text-red-400 shrink-0">✕</span>
                <span className="text-white/70 text-sm">{c.description}</span>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">{t("result.leaderboard")}</span>
            </div>
            <ul className="divide-y divide-white/5">
              {leaderboard.map((entry) => {
                const isMe = passed && myRank === entry.rank;
                return (
                  <li key={entry.rank} className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-white/10" : ""}`}>
                    <span className={`text-sm font-bold w-6 shrink-0 ${entry.rank === 1 ? "text-yellow-400" : "text-white/40"}`}>
                      #{entry.rank}
                    </span>
                    <span className={`text-sm flex-1 ${isMe ? "text-white font-semibold" : "text-white/60"}`}>
                      {entry.username}
                      {isMe && <span className="ml-2 text-xs text-blue-400">{t("result.you")}</span>}
                    </span>
                    <span className="text-white/20 font-mono text-xs tracking-widest shrink-0">
                      {entry.ticketId.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-sm shrink-0 ${isMe ? "text-white font-bold" : "text-white/60"}`}>
                      {entry.letterCount}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <button
          onClick={onRetry}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:scale-105 transition-all"
        >
          {passed ? t("result.play_again") : t("result.try_again")}
        </button>
      </div>
    </div>
  );
}
