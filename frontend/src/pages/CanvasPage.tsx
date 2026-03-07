import { useTranslation } from "react-i18next";
import { SandboxCanvas } from "../components/SandboxCanvas";
import { ReviewPage } from "./ReviewPage";
import type { Challenge, Criteria } from "../api";

interface CanvasPageProps {
  code: string | null;
  isStreaming: boolean;
  challenge: Challenge | null;
  ticketId: string | null;
  onFinish: () => void;
  onReviewComplete: (passed: boolean, failed: Criteria[]) => void;
}

export function CanvasPage({ code, isStreaming, challenge, ticketId, onFinish, onReviewComplete }: CanvasPageProps) {
  const { t } = useTranslation();
  const criteria = challenge?.criteria ?? [];

  // Only show review after streaming has fully completed AND code exists
  const streamingDone = !isStreaming && !!code;
  const showReview = streamingDone && criteria.length > 0;

  return (
    <div className="w-full h-screen relative bg-black/90 animate-in zoom-in-95 duration-700">
      {/* Full Screen Canvas Area */}
      <div className="w-full h-full overflow-hidden">
        <SandboxCanvas code={code} isStreaming={isStreaming} />
      </div>

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

      {/* Floating Back Button — hidden while review is shown */}
      {!showReview && (
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