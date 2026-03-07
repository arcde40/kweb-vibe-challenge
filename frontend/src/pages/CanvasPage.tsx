import { useTranslation } from "react-i18next";
import { SandboxCanvas } from "../components/SandboxCanvas";
import { ReviewPage } from "./ReviewPage";
import type { Challenge, Criteria } from "../api";

interface CanvasPageProps {
  code: string | null;
  isStreaming: boolean;
  challenge: Challenge | null;
  ticketId: string | null;
  streamError: boolean;
  generationIncomplete: boolean;
  onFinish: () => void;
  onRetryStream: () => void;
  onReviewComplete: (passed: boolean, failed: Criteria[]) => void;
}

export function CanvasPage({ code, isStreaming, challenge, ticketId, streamError, generationIncomplete, onFinish, onRetryStream, onReviewComplete }: CanvasPageProps) {
  const { t } = useTranslation();
  const criteria = challenge?.criteria ?? [];

  // Only show review after streaming has fully completed AND code exists
  const streamingDone = !isStreaming && !!code && !streamError;
  const showReview = streamingDone && criteria.length > 0;

  return (
    <div className="w-full h-screen relative bg-black/90 animate-in zoom-in-95 duration-700">
      {/* Full Screen Canvas Area */}
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

      {/* Incomplete generation warning */}
      {generationIncomplete && !isStreaming && !streamError && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/40 backdrop-blur-md shadow-lg">
          <span className="text-yellow-300 text-xs font-semibold">{t("canvas.incomplete")}</span>
        </div>
      )}

      {/* Review overlay — top-center, after streaming */}
      {showReview && (
        <ReviewPage criteria={criteria} onComplete={onReviewComplete} />
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

      {/* Floating Back Button — hidden while review or error is shown */}
      {!showReview && !streamError && (
        <button
          onClick={onFinish}
          className="absolute top-6 right-6 z-50 text-sm font-bold px-6 py-3 rounded-full bg-black/40 text-white/50 hover:bg-black/80 hover:text-white backdrop-blur-md border border-white/5 hover:border-white/20 transition-all shadow-xl"
        >
          {t("app.action.finish")}
        </button>
      )}
    </div>
  );
}