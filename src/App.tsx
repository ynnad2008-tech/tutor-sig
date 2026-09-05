import React, { useState, useRef } from "react";
import { Header } from "./components/Header";
import { ChatTutor } from "./components/ChatTutor";
import { SoftwareTool } from "./types";
import { ShieldCheck, ExternalLink } from "lucide-react";

export default function App() {
  const [selectedSoftware, setSelectedSoftware] = useState<SoftwareTool | "General">("General");
  const resetChatRef = useRef<(() => void) | null>(null);

  const handleResetChat = () => {
    if (resetChatRef.current) {
      resetChatRef.current();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-[#C8102E] selection:text-white">
      {/* Clean Institutional Header */}
      <Header
        selectedSoftware={selectedSoftware}
        setSelectedSoftware={setSelectedSoftware}
        onResetChat={handleResetChat}
      />

      {/* Main Agent Chat Workspace */}
      <main className="flex-1 w-full flex flex-col min-h-0">
        <ChatTutor
          selectedSoftware={selectedSoftware}
          onResetRef={resetChatRef}
        />
      </main>

      {/* Minimal Institutional Footer */}
      <footer className="bg-[#003057] text-slate-300 text-xs border-t-2 border-[#C8102E] py-2.5 flex-shrink-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#003057] font-extrabold text-[10px]">M</span>
            </div>
            <span className="text-slate-300 text-[11px]">
              <strong className="text-white font-semibold">Tutor-SIG</strong> • Universidad Mariana | Autor:{" "}
              <strong className="text-slate-200">Geógr. Dany Benavides Bolaños</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Orientación Pedagógica Formativa
            </span>
            <span>•</span>
            <a
              href="https://www.umariana.edu.co"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F3B229] hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>umariana.edu.co</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
