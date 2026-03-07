import {useRef} from "react";
import {Maximize2, MonitorPlay, Sparkles} from "lucide-react";
import {Card} from "./ui/card";
import {useTranslation} from "react-i18next";

interface SandboxCanvasProps {
    code: string | null;
    isStreaming?: boolean;
}

const CSP_META = `<meta http-equiv="Content-Security-Policy" content="default-src 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src 'none';">`;

function injectCSP(code: string): string {
    if (code.includes("<head>")) return code.replace("<head>", `<head>${CSP_META}`);
    if (code.includes("<html>")) return code.replace("<html>", `<html><head>${CSP_META}</head>`);
    return `${CSP_META}${code}`;
}

export function SandboxCanvas({
                                  code,
                                  isStreaming = false,
                              }: SandboxCanvasProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const {t} = useTranslation();

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            iframeRef.current?.parentElement?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <Card className="flex flex-col h-full border-border/50 overflow-hidden shadow-lg backdrop-blur-sm bg-card/50">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/20">
                <div className="flex items-center gap-2 text-foreground/80">
                    <MonitorPlay className="h-4 w-4"/>
                    <span className="text-sm font-medium">{t("canvas.title")}</span>
                </div>
                <button
                    onClick={toggleFullscreen}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    title="Toggle Fullscreen"
                >
                    <Maximize2 className="h-4 w-4"/>
                </button>
            </div>

            <div className="relative flex-1 bg-white dark:bg-zinc-950 overflow-hidden">
                {/* Streaming overlay — always mounted, fades in/out */}
                <div
                    className={`absolute inset-0 bg-black/75 overflow-hidden z-20 flex flex-col justify-end backdrop-blur-md transition-opacity duration-500 ${isStreaming || !code ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                    {/* Centered icon */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-32 h-32 rounded-full bg-primary/10 animate-ping"
                                     style={{animationDuration: "1.8s"}}/>
                                <div className="absolute w-20 h-20 rounded-full bg-primary/15 animate-pulse"/>
                                <Sparkles
                                    className="relative w-10 h-10 text-primary drop-shadow-[0_0_20px_rgba(99,102,241,0.9)]"/>
                            </div>
                            <div className="flex gap-1.5">
                                {[0, 150, 300].map((delay) => (
                                    <span key={delay} className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
                                          style={{animationDelay: `${delay}ms`}}/>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Fading text container at the bottom */}
                    <div
                        className="absolute inset-x-0 bottom-0 top-1/2 p-6 md:p-8 font-mono text-xs md:text-sm text-green-400/50 shadow-inner flex flex-col justify-end opacity-60"
                        style={{
                            maskImage:
                                "linear-gradient(to bottom, transparent 0%, black 60%, black 100%)",
                            WebkitMaskImage:
                                "linear-gradient(to bottom, transparent 0%, black 60%, black 100%)",
                        }}
                    >
                        <div className="whitespace-pre-wrap break-words mt-auto">
                            {code}
                            <span
                                className="inline-block w-2 h-4 md:h-5 bg-green-400 ml-1 align-middle animate-pulse shadow-[0_0_8px_#4ade80]"/>
                        </div>
                    </div>
                </div>

                <iframe
                    ref={iframeRef}
                    title="Sandbox"
                    className={`w-full h-full border-0 bg-white ${
                        isStreaming
                            ? "opacity-50 blur-sm scale-[0.98]"
                            : "opacity-100 scale-100"
                    } transition-all duration-700 ease-in-out origin-center`}
                    sandbox="allow-scripts allow-modals"
                    srcDoc={code ? injectCSP(code) : undefined}
                />
            </div>
        </Card>
    );
}
