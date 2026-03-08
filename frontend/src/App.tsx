import { useState } from "react";
import { fetchChallenge, createTrial, submitScoredRanking, fetchCodeByTicketId, reviewCode, API_BASE_URL } from "./api";
import type { Challenge, ScoredRankingEntry, ScoredRankingSubmitResponse } from "./api";

import { StartPage } from "./pages/StartPage";
import { InputPage } from "./pages/InputPage";
import { CanvasPage } from "./pages/CanvasPage";
import { NameInputPage } from "./pages/NameInputPage";
import { ResultPage } from "./pages/ResultPage";

type Step = "start" | "input" | "canvas" | "name-input" | "result";

function App() {
  const [step, setStep] = useState<Step>("start");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [constraints, setConstraints] = useState<Challenge | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [rankingResponse, setRankingResponse] = useState<ScoredRankingSubmitResponse | null>(null);
  const [leaderboard, setLeaderboard] = useState<ScoredRankingEntry[]>([]);
  const [streamError, setStreamError] = useState(false);
  const [generationIncomplete, setGenerationIncomplete] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [resultScore, setResultScore] = useState<number | null>(null);
  const [overallFeedback, setOverallFeedback] = useState<string | null>(null);

  const handlePickChallenge = async () => {
    setIsLoading(true);
    try {
      const data = await fetchChallenge();
      setConstraints(data);
      setStep("input");
    } catch (error) {
      console.error("Failed to fetch challenge", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startStream = (p: string, tId?: string) => {
    setIsLoading(true);
    setIsStreaming(false);
    setGeneratedCode("");
    setStreamError(false);
    setGenerationIncomplete(false);

    let completed = false;
    let codeBuffer = "";

    const resolvedTicketId = tId ?? ticketId;
    const eventSource = new EventSource(
      `${API_BASE_URL}/ai/stream?prompt=${encodeURIComponent(p)}${resolvedTicketId ? `&ticketId=${resolvedTicketId}` : ""}`,
    );

    eventSource.onmessage = (event) => {
      setIsLoading(false);
      setIsStreaming(true);

      if (event.data === "[DONE]") {
        completed = true;
        setGenerationIncomplete(!codeBuffer.trimEnd().toLowerCase().includes("</html>"));
        setIsStreaming(false);
        eventSource.close();
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.chunk || data.chunk === "") {
          codeBuffer += data.chunk;
          setGeneratedCode((prev) => (prev || "") + data.chunk);
        }
        if (data.isDone === true) {
          completed = true;
          setGenerationIncomplete(!codeBuffer.trimEnd().toLowerCase().includes("</html>"));
          setIsStreaming(false);
          eventSource.close();
        }
      } catch {
        if (typeof event.data === "string") {
          codeBuffer += event.data;
          setGeneratedCode((prev) => (prev || "") + event.data);
        }
      }
    };

    eventSource.onerror = (error) => {
      console.log("SSE connection finished or errored", error);
      eventSource.close();
      setIsLoading(false);
      setIsStreaming(false);
      if (!completed) setStreamError(true);
    };
  };

  const handlePromptSubmit = async (p: string) => {
    setPrompt(p);
    setStep("canvas");
    if (constraints) {
      try {
        const trial = await createTrial(constraints.id);
        setTicketId(trial.ticketId);
        startStream(p, trial.ticketId);
        return;
      } catch (e) {
        console.error("Failed to create trial", e);
      }
    }
    startStream(p);
  };

  const handleRetryStream = () => {
    startStream(prompt);
  };

  const handleReviewComplete = (score: number | null = null) => {
    setResultScore(score);
    setRankingResponse(null);
    setLeaderboard([]);
    setStep("result");
  };

  const triggerAIReview = async (code: string) => {
    setIsReviewing(true);
    try {
      const result = await reviewCode(code, constraints!.id);
      setOverallFeedback(result.overallFeedback);
      handleReviewComplete(result.score);
    } catch (e) {
      console.error("AI review failed", e);
      setOverallFeedback(null);
      handleReviewComplete(null);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleNameSubmit = async (username: string) => {
    if (constraints && ticketId) {
      try {
        const result = await submitScoredRanking(constraints.id, ticketId, username, prompt, resultScore ?? 0);
        setRankingResponse(result);
        setLeaderboard(result.entries);
      } catch (e) {
        console.error("Failed to submit ranking", e);
      }
    }
  };

  const handleRetry = () => {
    setStep("start");
    setGeneratedCode(null);
    setConstraints(null);
    setPrompt("");
    setTicketId(null);
    setRankingResponse(null);
    setLeaderboard([]);
    setResultScore(null);
    setOverallFeedback(null);
  };

  return (
    <div className="min-h-screen max-w-screen flex flex-col bg-background text-foreground overflow-hidden selection:bg-primary/30 relative">
      <main className="flex-1 w-full h-screen relative z-0 mt-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        {step === "start" && (
          <StartPage onPickChallenge={handlePickChallenge} isLoading={isLoading} />
        )}
        {step === "input" && (
          <InputPage constraints={constraints} onSubmit={handlePromptSubmit} isLoading={isLoading} />
        )}
        {step === "canvas" && (
          <CanvasPage
            code={generatedCode}
            isStreaming={isStreaming}
            isReviewing={isReviewing}
            ticketId={ticketId}
            streamError={streamError}
            generationIncomplete={generationIncomplete}
            onFinish={handleRetry}
            onRetryStream={handleRetryStream}
            onRequestReview={constraints?.criteria?.length ? () => triggerAIReview(generatedCode!) : undefined}
          />
        )}
        {step === "result" && (
          <ResultPage
            prompt={prompt}
            letterCount={rankingResponse?.letterCount ?? [...prompt].filter(c => /\p{L}/u.test(c)).length}
            ticketId={ticketId}
            myRank={rankingResponse?.rank ?? null}
            leaderboard={leaderboard}
            score={resultScore}
            overallFeedback={overallFeedback}
            onSubmitName={handleNameSubmit}
            onRetry={handleRetry}
            fetchCode={fetchCodeByTicketId}
          />
        )}
      </main>
    </div>
  );
}

export default App;
