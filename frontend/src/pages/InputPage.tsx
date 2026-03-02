import { Target } from "lucide-react";
import { useTranslation } from "react-i18next";
import Markdown from "react-markdown";
import { PromptInput } from "../components/PromptInput";
import type { Challenge } from "../api";

interface InputPageProps {
  constraints: Challenge | null;
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function InputPage({ constraints, onSubmit, isLoading }: InputPageProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <div className="w-full max-w-4xl space-y-8">
        {/* Challenge Objective Card */}
        {constraints && (
          <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-indigo-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />

            <div className="relative z-10 flex-1">
              <div className="flex items-center gap-3 text-indigo-400 mb-4">
                <Target className="w-6 h-6" />
                <h3 className="font-bold tracking-widest uppercase text-sm">
                  {t("challenge.target_objective")}
                </h3>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                {constraints.title}
              </h2>
              <div className="prose prose-invert prose-sm md:prose-base mt-2 text-white/80 leading-relaxed">
                <Markdown>{constraints.description}</Markdown>
              </div>
            </div>

            {constraints.imageUrl && (
              <div className="relative z-10 w-full md:w-1/3 aspect-video md:aspect-square rounded-2xl overflow-hidden border-2 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] shrink-0">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent mix-blend-overlay z-10"></div>
                <img
                  src={constraints.imageUrl}
                  alt="Reference UI"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-2 right-2 z-20 bg-black/60 backdrop-blur-md px-2 py-1 flex items-center gap-1 rounded text-[10px] font-bold text-white/70 uppercase tracking-widest border border-white/10">
                  {t("challenge.reference")}
                </div>
              </div>
            )}
          </div>
        )}

        <PromptInput
          onSubmit={onSubmit}
          isLoading={isLoading}
          constraints={constraints?.constraint}
        />
      </div>
    </div>
  );
}