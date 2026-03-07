import { useState } from "react";
import { useTranslation } from "react-i18next";

interface NameInputPageProps {
  onSubmit: (name: string) => void;
}

export function NameInputPage({ onSubmit }: NameInputPageProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center px-6 bg-black/90 animate-in fade-in duration-300">
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-4xl font-black text-white mb-2">{t("name_input.heading")}</p>
          <p className="text-white/50 text-sm">{t("name_input.subtitle")}</p>
        </div>

        <input
          autoFocus
          type="text"
          maxLength={50}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("name_input.placeholder")}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 text-center text-lg font-semibold focus:outline-none focus:border-blue-400 transition-colors"
        />

        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-lg hover:scale-105 transition-all disabled:opacity-40 disabled:hover:scale-100"
        >
          {t("name_input.submit")}
        </button>
      </form>
    </div>
  );
}
