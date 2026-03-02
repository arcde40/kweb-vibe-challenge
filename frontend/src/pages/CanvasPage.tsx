import { useTranslation } from "react-i18next";
import { SandboxCanvas } from "../components/SandboxCanvas";

interface CanvasPageProps {
  code: string | null;
  isStreaming: boolean;
  onFinish: () => void;
}

export function CanvasPage({ code, isStreaming, onFinish }: CanvasPageProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full h-screen relative bg-black/90 animate-in zoom-in-95 duration-700">
      {/* Full Screen Canvas Area */}
      <div className="w-full h-full overflow-hidden">
        <SandboxCanvas
          code={code}
          isStreaming={isStreaming}
        />
      </div>

      {/* Floating Back Button */}
      <button
        onClick={onFinish}
        className="absolute top-6 right-6 z-50 text-sm font-bold px-6 py-3 rounded-full bg-black/40 text-white/50 hover:bg-black/80 hover:text-white backdrop-blur-md border border-white/5 hover:border-white/20 transition-all shadow-xl"
      >
        {t("app.action.finish")}
      </button>
    </div>
  );
}