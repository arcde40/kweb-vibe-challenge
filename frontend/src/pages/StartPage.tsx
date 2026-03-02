import {Loader2, Sparkles, Globe, Moon, Sun} from "lucide-react";
import {useTranslation} from "react-i18next";
import {useTheme} from "../components/theme-provider";
import kwebLogo from "../assets/kweblogo.png";

interface StartPageProps {
    onPickChallenge: () => void;
    isLoading: boolean;
}

export function StartPage({onPickChallenge, isLoading}: StartPageProps) {
    const {t, i18n} = useTranslation();
    const {theme, setTheme} = useTheme();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === "en" ? "ko" : "en");
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div
            className="w-full h-screen flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Top Right Action Buttons (Language & Theme) */}
            <div className="absolute top-6 right-6 flex items-center gap-3">
                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-md hover:bg-muted text-foreground transition-all shadow-sm"
                >
                    <Globe className="w-4 h-4"/>
                    <span className="text-sm font-bold uppercase tracking-wider">
            {i18n.language === "en" ? "EN" : "KR"}
          </span>
                </button>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-md hover:bg-muted text-foreground transition-all shadow-sm"
                >
                    {theme === "dark" ? (
                        <Sun className="w-5 h-5"/>
                    ) : (
                        <Moon className="w-5 h-5"/>
                    )}
                </button>
            </div>

            <div className="text-center mb-12 mt-12">
                <img
                    src={kwebLogo}
                    alt="KWEB Logo"
                    className="w-28 h-28 mx-auto mb-6 animate-wiggle dark:invert"
                />
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-tight">
                    {t("app.title.code")}{" "}
                    <span
                        className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400">
            {t("app.title.vibe")}
          </span>
                </h1>{t("app.subtitle").split('\n').map((line) => (
                <p className="text-muted-foreground text-xl md:text-2xl max-w-2xl mx-auto font-medium">
                    {line}
                </p>))}

            </div>

            <button
                onClick={onPickChallenge}
                disabled={isLoading}
                className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-bold text-2xl text-white shadow-[0_0_40px_rgba(79,70,229,0.4)] hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:hover:scale-100 flex items-center gap-4 overflow-hidden"
            >
                <div
                    className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"/>
                {isLoading ? (
                    <>
                        <Loader2 className="w-8 h-8 animate-spin relative z-10"/>
                        <span className="relative z-10">{t("app.action.fetching")}</span>
                    </>
                ) : (
                    <>
                        <Sparkles className="w-8 h-8 relative z-10"/>
                        <span className="relative z-10">{t("app.action.pick")}</span>
                    </>
                )}
            </button>
        </div>
    );
}