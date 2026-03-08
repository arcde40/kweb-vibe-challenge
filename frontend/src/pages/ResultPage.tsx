import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import type { ScoredRankingEntry } from "../api";
import { EntryModal } from "../components/EntryModal";

interface ResultPageProps {
  prompt: string;
  letterCount: number;
  ticketId: string | null;
  myRank: number | null;
  leaderboard: ScoredRankingEntry[];
  score: number | null;
  overallFeedback: string | null;
  onSubmitName: (name: string) => Promise<void>;
  onRetry: () => void;
  fetchCode: (ticketId: string) => Promise<string | null>;
}

export function ResultPage({ prompt, letterCount, ticketId, myRank, leaderboard, score, overallFeedback, onSubmitName, onRetry, fetchCode }: ResultPageProps) {
  const { t } = useTranslation();
  const [selectedEntry, setSelectedEntry] = useState<ScoredRankingEntry | null>(null);
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

const handleSubmit = async () => {
    if (!username.trim()) return;
    setSubmitting(true);
    await onSubmitName(username.trim());
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-start pt-12 px-6 animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-md flex flex-col items-center gap-6 pb-12">

        {/* Score header */}
        <div className="text-center">
          {score !== null ? (
            <p className="text-6xl font-black text-white">
              {score}<span className="text-2xl font-medium text-white/30"> / 100</span>
            </p>
          ) : (
            <p className="text-4xl font-black text-white/40">—</p>
          )}
          {submitted && myRank && (
            <p className="text-white/50 text-sm mt-2">{t("result.ranked", { rank: myRank })}</p>
          )}
        </div>

        {/* Overall AI feedback */}
        {overallFeedback && (
          <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-2">{t("result.overall_feedback")}</p>
            <p className="text-white/80 text-sm leading-relaxed">{overallFeedback}</p>
          </div>
        )}

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

        {/* Criteria → Leaderboard transition */}
        {!submitted ? (
          <div className="w-full flex flex-col gap-4 animate-in fade-in duration-300">
            {/* Name input */}
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-white/60 text-sm font-semibold">{t("name_input.subtitle")}</p>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                placeholder={t("name_input.placeholder")}
                maxLength={50}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-white/30 transition-colors"
              />
              <button
                onClick={handleSubmit}
                disabled={submitting || !username.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {t("name_input.submit")}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Leaderboard */}
            {leaderboard.length > 0 && (
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10">
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">{t("result.leaderboard")}</span>
                </div>
                <ul className="divide-y divide-white/5">
                  {leaderboard.map((entry) => {
                    const isMe = ticketId != null && entry.ticketId === ticketId;
                    return (
                      <li
                        key={entry.rank}
                        onClick={() => setSelectedEntry(entry)}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 active:bg-white/10 ${isMe ? "bg-white/10" : ""}`}
                      >
                        <span className={`text-sm font-bold w-6 shrink-0 ${entry.rank === 1 ? "text-yellow-400" : "text-white/40"}`}>
                          #{entry.rank}
                        </span>
                        <span className={`text-sm flex-1 truncate ${isMe ? "text-white font-semibold" : "text-white/60"}`}>
                          {entry.username}
                          {isMe && <span className="ml-2 text-xs text-blue-400">{t("result.you")}</span>}
                        </span>
                        <span className="text-sm font-bold shrink-0 text-white/70">
                          {entry.score}
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
              {t("result.play_again")}
            </button>
          </div>
        )}

      </div>

      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          fetchCode={fetchCode}
        />
      )}
    </div>
  );
}
