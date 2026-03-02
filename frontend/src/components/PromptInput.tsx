import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import {
  Send,
  Loader2,
  Wand2,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  constraints?: import("../api").ChallengeConstraints | null;
}

const ConstraintBadge = ({
  status,
  text,
}: {
  status: "pass" | "fail" | "idle";
  text: string;
}) => {
  const isPass = status === "pass";
  const isFail = status === "fail";
  const isIdle = status === "idle";

  return (
    <div
      className={`
        flex items-center gap-2 py-1 transition-all duration-300
        ${isPass ? "text-zinc-500 line-through opacity-70" : ""}
        ${isFail ? "text-red-400 animate-pulse font-semibold" : ""}
        ${isIdle ? "text-zinc-400" : ""}
      `}
    >
      {isFail && <AlertTriangle className="w-4 h-4 shrink-0" />}
      {isIdle && <Circle className="w-4 h-4 shrink-0" />}
      {isPass && <CheckCircle2 className="w-4 h-4 shrink-0" />}
      <span className="text-sm">{text}</span>
    </div>
  );
};

export function PromptInput({
  onSubmit,
  isLoading,
  constraints,
}: PromptInputProps) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;

    if (constraints) {
      // 1. Only Korean letters + basic punctuation allowed
      const kRegex = /^[가-힣ㄱ-ㅎㅏ-ㅣ\s.,!?]+$/;
      if (!kRegex.test(prompt)) return;

      // 2. Word count less than n letters
      if (prompt.replace(/\s/g, "").length > constraints.letters) return;

      // 3. Must not contain certain letters
      const foundForbidden = constraints.excludedLetters.find((letter) =>
        prompt.includes(letter),
      );
      if (foundForbidden) return;

      // 4. Must contain certain words
      const missingRequired = constraints.includedWords.find(
        (word) => !prompt.includes(word),
      );
      if (missingRequired) return;
    }

    onSubmit(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Real-time constraints calculation
  const letterCount = prompt.replace(/\s/g, "").length;
  const isLengthValid = constraints ? letterCount <= constraints.letters : true;

  const isKoreanOnly =
    prompt.length === 0 || /^[가-힣ㄱ-ㅎㅏ-ㅣ\s.,!?]+$/.test(prompt);

  const forbiddenViolations = constraints
    ? constraints.excludedLetters.filter((l) => prompt.includes(l))
    : [];

  const missingWords = constraints
    ? constraints.includedWords.filter((w) => !prompt.includes(w))
    : [];

  const isValid =
    isLengthValid &&
    isKoreanOnly &&
    forbiddenViolations.length === 0 &&
    missingWords.length === 0 &&
    prompt.trim().length > 0;

  return (
    <div className="w-full animate-in slide-in-from-bottom-8 fade-in-20 duration-500 relative">
      <div className="relative group w-full">
        {/* Stronger, more vibrant gradient glow that is always visible but gets brighter on hover */}
        <div className="absolute -inset-[3px] bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-500"></div>

        {/* Stronger glassmorphic effect with a slight tint to distinguish from the deep blue background */}
        <div className="relative flex flex-col bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden focus-within:ring-2 focus-within:ring-white/20">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2 text-cyan-400">
              <Wand2 className="h-5 w-5" />
              <h2 className="text-base font-semibold tracking-wide">
                {t("prompt.title")}
              </h2>
            </div>

            {/* Letter Counter in Top Right */}
            {constraints && (
              <div
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md backdrop-blur-sm shadow-sm transition-colors border ${
                  isLengthValid
                    ? "bg-slate-800/80 text-zinc-400 border-white/10"
                    : "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
                }`}
              >
                <span>{letterCount}</span>
                <span className="text-zinc-500 font-normal">/</span>
                <span>{constraints.letters}</span>
              </div>
            )}
          </div>

          {/* Inline Constraints Checklist */}
          {constraints && (
            <div className="px-5 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-black/10 mx-3 rounded-lg py-2 mt-1 mb-2 border border-white/5">
              {(() => {
                const status =
                  prompt.length === 0 ? "idle" : isKoreanOnly ? "pass" : "fail";
                return (
                  <ConstraintBadge
                    status={status}
                    text={t("constraint.korean_only")}
                  />
                );
              })()}
              {(() => {
                const status =
                  letterCount === 0 ? "idle" : isLengthValid ? "pass" : "fail";
                return (
                  <ConstraintBadge
                    status={status}
                    text={t("constraint.letters_current", {
                      max: constraints.letters,
                      current: letterCount,
                    })}
                  />
                );
              })()}
              {(() => {
                const status =
                  forbiddenViolations.length === 0 ? "pass" : "fail";
                return (
                  <ConstraintBadge
                    status={status}
                    text={t("constraint.forbidden", {
                      words: constraints.excludedLetters.join(", "),
                    })}
                  />
                );
              })()}
              {(() => {
                const status =
                  missingWords.length === 0
                    ? "pass"
                    : prompt.length === 0
                      ? "idle"
                      : "fail";
                return (
                  <ConstraintBadge
                    status={status}
                    text={t("constraint.required", {
                      words: constraints.includedWords.join(", "),
                    })}
                  />
                );
              })()}
            </div>
          )}

          <div className="relative w-full">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("prompt.placeholder")}
              className="w-full resize-none border-0 focus-visible:ring-0 px-5 py-3 pr-20 text-lg bg-transparent min-h-[120px] max-h-[300px] text-zinc-100 placeholder:text-zinc-500"
              disabled={isLoading}
            />
          </div>

          <div className="px-5 py-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400 flex items-center gap-2">
                {t("prompt.press")}{" "}
                <kbd className="font-mono bg-white/10 px-2 py-1 rounded-md border border-white/10 shadow-sm text-zinc-300">
                  Enter
                </kbd>{" "}
                {t("prompt.to_generate")}
              </span>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
              className={`px-8 h-10 text-base font-medium shadow-lg transition-all rounded-xl border-0 text-white ${
                isValid && !isLoading
                  ? "hover:scale-105 hover:shadow-cyan-500/50 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50 shadow-none border border-white/10"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t("prompt.generating")}
                </>
              ) : (
                <>
                  {t("prompt.submit")} <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
