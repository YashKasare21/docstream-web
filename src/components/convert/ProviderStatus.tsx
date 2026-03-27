"use client";

import { useEffect, useState } from "react";
import { Cpu, Zap, Brain, AlertCircle } from "lucide-react";

interface Provider {
  name: string;
  model: string;
  available: boolean;
  priority: number;
}

interface ProvidersResponse {
  providers: Provider[];
  active: string | null;
}

const ICONS: Record<string, React.ReactNode> = {
  Gemini: <Brain className="w-3 h-3" />,
  Groq: <Zap className="w-3 h-3" />,
  Ollama: <Cpu className="w-3 h-3" />,
};

export default function ProviderStatus() {
  const [data, setData] = useState<ProvidersResponse | null>(null);

  useEffect(() => {
    fetch("/api/v2/providers")
      .then((r) => r.json())
      .then((d: ProvidersResponse) => setData(d))
      .catch(() => {});
  }, []);

  if (!data || !data.active) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <AlertCircle className="w-3 h-3" />
        <span>No AI provider</span>
      </div>
    );
  }

  const activeProvider = data.providers.find((p) => p.name === data.active);

  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/[0.04] border border-white/[0.06] rounded-full px-2.5 py-1">
      <span className="text-green-400">{ICONS[data.active]}</span>
      <span>{data.active}</span>
      <span className="text-slate-600">·</span>
      <span className="text-slate-500">{activeProvider?.model}</span>
    </div>
  );
}
