import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RankingEntry } from "../api";

const CSP_META = `<meta http-equiv="Content-Security-Policy" content="default-src 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'none';">`;

function injectCSP(code: string): string {
  if (code.includes("<head>")) return code.replace("<head>", `<head>${CSP_META}`);
  if (code.includes("<html>")) return code.replace("<html>", `<html><head>${CSP_META}</head>`);
  return `${CSP_META}${code}`;
}

interface EntryModalProps {
  entry: RankingEntry;
  onClose: () => void;
  fetchCode: (ticketId: string) => Promise<string | null>;
}

export function EntryModal({ entry, onClose, fetchCode }: EntryModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchCode(entry.ticketId).then((result) => {
      if (result) setCode(result);
      else setNotFound(true);
      setLoading(false);
    });
  }, [entry.ticketId]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 h-[85vh] flex flex-col bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-bold text-sm">#{entry.rank}</span>
            <span className="text-white font-semibold text-sm">{entry.username}</span>
            <span className="text-white/30 font-mono text-xs">{entry.ticketId.slice(0, 8).toUpperCase()}</span>
            <span className="text-white/50 text-xs">{entry.letterCount} {t("result.letter_count")}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Prompt */}
        <div className="px-5 py-3 border-b border-white/10 shrink-0 bg-white/5">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{t("result.your_prompt")}</p>
          <p className="text-white/80 text-sm leading-relaxed">{entry.prompt}</p>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative bg-white overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
            </div>
          )}
          {notFound && !loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
              <p className="text-white/40 text-sm">Code not available</p>
            </div>
          )}
          {code && (
            <iframe
              title="Entry Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-modals"
              srcDoc={injectCSP(code)}
            />
          )}
        </div>
      </div>
    </div>
  );
}