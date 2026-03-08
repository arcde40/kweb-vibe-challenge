import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { SandboxCanvas } from "../components/SandboxCanvas";
import { useEffect, useState } from "react";

interface CanvasPageProps {
  code: string | null;
  isStreaming: boolean;
  isReviewing: boolean;
  ticketId: string | null;
  streamError: boolean;
  generationIncomplete: boolean;
  onFinish: () => void;
  onRetryStream: () => void;
  onRequestReview?: () => void;
}

export function CanvasPage({ code, isStreaming, isReviewing, ticketId, streamError, generationIncomplete, onFinish, onRetryStream, onRequestReview }: CanvasPageProps) {
  const { t } = useTranslation();
  const [reviewReady, setReviewReady] = useState(false);

  useEffect(() => {
    if (!isStreaming && code && !streamError) {
      const timer = setTimeout(() => setReviewReady(true), 1500);
      return () => clearTimeout(timer);
    }
    setReviewReady(false);
  }, [isStreaming, code, streamError]);

  const showControls = !isStreaming && !isReviewing && !streamError;

  return (
    <div className="w-full h-screen relative bg-black/90 animate-in zoom-in-95 duration-700">
      <div className="w-full h-full overflow-hidden">
        <SandboxCanvas code={code} isStreaming={isStreaming} />
      </div>

      {/* Stream error overlay */}
      {streamError && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-black/80 border border-white/10 rounded-2xl px-8 py-6 flex flex-col items-center gap-4 shadow-2xl">
            <p className="text-white/70 text-sm">{t("canvas.stream_error")}</p>
            <div className="flex gap-3">
              <button
                onClick={onRetryStream}
                className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-all"
              >
                {t("canvas.retry")}
              </button>
              <button
                onClick={onFinish}
                className="px-6 py-2 rounded-full bg-white/10 text-white/60 text-sm font-bold hover:bg-white/20 transition-all"
              >
                {t("app.action.finish")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI reviewing overlay */}
      {isReviewing && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-4">
            <Sparkles className="w-10 h-10 text-primary drop-shadow-[0_0_20px_rgba(99,102,241,0.9)] animate-pulse" />
            <p className="text-white/70 text-sm font-medium">{t("canvas.reviewing")}</p>
          </div>
        </div>
      )}

      {/* Incomplete generation warning */}
      {generationIncomplete && !isStreaming && !streamError && !isReviewing && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-md shadow-lg">
          <span className="text-yellow-300 text-xs font-semibold">{t("canvas.incomplete")}</span>
        </div>
      )}

      {/* Ticket badge */}
      {ticketId && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg">
          <span className="text-white/40 text-xs">Ticket</span>
          <span className="text-white font-mono text-xs font-bold tracking-widest">
            {ticketId.slice(0, 8).toUpperCase()}
          </span>
        </div>
      )}

      {/* Action buttons */}
      {showControls && (
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={onFinish}
            className="text-sm font-bold px-5 py-2.5 rounded-full bg-black/40 text-white/50 hover:bg-black/80 hover:text-white backdrop-blur-md border border-white/5 hover:border-white/20 transition-all shadow-xl"
          >
            {t("app.action.finish")}
          </button>
          {onRequestReview && reviewReady && (
            <button
              onClick={onRequestReview}
              className="flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:scale-105 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              {t("canvas.submit_review")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
