import { useState } from "react";
import { fetchChallenge, API_BASE_URL } from "./api";
import type { Challenge } from "./api";
import { StartPage } from "./pages/StartPage";
import { InputPage } from "./pages/InputPage";
import { CanvasPage } from "./pages/CanvasPage";

function App() {
  const [step, setStep] = useState<"start" | "input" | "canvas">("start");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [constraints, setConstraints] = useState<Challenge | null>(null);

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

  const handlePromptSubmit = (prompt: string) => {
    setStep("canvas");
    setIsLoading(true);
    setIsStreaming(false);
    setGeneratedCode(""); // Reset code for new generation

    const eventSource = new EventSource(
      `${API_BASE_URL}/ai/stream?prompt=${encodeURIComponent(prompt)}`,
    );

    eventSource.onmessage = (event) => {
      setIsLoading(false);
      setIsStreaming(true);

      if (event.data === "[DONE]") {
        setIsStreaming(false);
        eventSource.close();
        return;
      }

      try {
        const data = JSON.parse(event.data);
        if (data.chunk || data.chunk === "") {
          setGeneratedCode((prev) => (prev || "") + data.chunk);
        }
        if (data.isDone === true) {
          setIsStreaming(false);
          eventSource.close();
        }
      } catch {
        // Fallback for raw text string streams instead of JSON
        if (typeof event.data === "string") {
          setGeneratedCode((prev) => (prev || "") + event.data);
        }
      }
    };

    eventSource.onerror = (error) => {
      console.log("SSE connection finished or errored", error);
      eventSource.close();
      setIsLoading(false);
      setIsStreaming(false);
    };
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
            onFinish={() => setStep("start")}
            challenge={constraints}
          />
        )}
      </main>
    </div>
  );
}

export default App;
