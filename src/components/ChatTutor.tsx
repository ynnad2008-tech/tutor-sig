import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Send,
  Sparkles,
  Paperclip,
  X,
  RotateCcw,
  Copy,
  Check,
  MapPin,
  Compass,
  Layers,
  Calculator,
  ShieldCheck,
  FileImage,
  ArrowRight,
  Download,
  Volume2,
  VolumeX,
  ArrowDown,
  UploadCloud,
  Maximize2,
  Code,
  Terminal,
  CalendarDays,
} from "lucide-react";
import { ChatMessage, SoftwareTool } from "../types";
import { chatWithTutor } from "../services/aiService";
import { CronogramaDiplomado } from "./CronogramaDiplomado";

interface ChatTutorProps {
  selectedSoftware: SoftwareTool | "General";
  onResetRef?: React.MutableRefObject<(() => void) | null>;
}

const QUICK_STARTERS = [
  {
    icon: MapPin,
    title: "MAGNA-SIRGAS Origen Nacional (9377)",
    prompt:
      "¿Cómo configuro y transformo mis capas al sistema oficial MAGNA-SIRGAS Origen Nacional (EPSG: 9377) según la Resolución 471 de 2020 del IGAC?",
  },
  {
    icon: Layers,
    title: "Diagnóstico de usos del suelo para POT/PBOT",
    prompt:
      "¿Cómo estructurar un diagnóstico de usos del suelo y coberturas para un Plan de Ordenamiento Territorial (POT/PBOT), y qué análisis de superposición debo aplicar para detectar conflictos de uso?",
  },
  {
    icon: Compass,
    title: "Accesibilidad y equipamientos urbanos",
    prompt:
      "¿Qué secuencia de geoprocesamiento (Buffer, Spatial Join, análisis de redes) uso para evaluar la accesibilidad y cobertura de equipamientos urbanos en un municipio?",
  },
  {
    icon: Calculator,
    title: "Índice de Vegetación (NDVI) en Sentinel-2",
    prompt:
      "Explícame paso a paso cómo calcular el NDVI con imágenes Sentinel-2 en la Calculadora Ráster y cómo interpretar los valores en un estudio territorial y ambiental.",
  },
  {
    icon: ShieldCheck,
    title: "Amenazas y aptitud del suelo para proyectos",
    prompt:
      "¿Cómo integrar pendientes, geología y coberturas en un análisis de amenaza por movimientos en masa y aptitud del suelo para localizar un proyecto arquitectónico o urbanístico?",
  },
  {
    icon: Sparkles,
    title: "Rondas hídricas y servicios públicos (EMPOPASTO)",
    prompt:
      "¿Cómo delimitar rondas hídricas y analizar la cobertura de redes de acueducto para identificar sectores urbanos con déficit de servicio, usando herramientas de geoprocesamiento?",
  },
];

const FOLLOW_UP_SUGGESTIONS = [
  "¿Cuáles son los errores metodológicos más frecuentes en este procedimiento?",
  "¿Qué fuentes oficiales de datos abiertos en Colombia puedo consultar para este análisis?",
  "¿Cómo puedo validar la topología o precisión antes de exportar el resultado?",
];

// Helper to render code blocks with copy button
const CodeBlock: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "código";

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-100 shadow-md not-prose">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 border-b border-slate-700 text-[11px] text-slate-300 font-mono">
        <span className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Terminal className="w-3.5 h-3.5 text-[#F3B229]" />
          {language}
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copiar bloque de código"
          className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-700/60 hover:bg-slate-700 transition"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-300 font-medium">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copiar código</span>
            </>
          )}
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-xs font-mono leading-relaxed text-slate-100">
        <code>{codeText}</code>
      </div>
    </div>
  );
};

export const ChatTutor: React.FC<ChatTutorProps> = ({
  selectedSoftware,
  onResetRef,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "model",
      content: `¡Hola! Soy **Tutor-SIG**, tu copiloto de Inteligencia Artificial para **Sistemas de Información Geográfica, Teledetección y Cartografía** en la **Universidad CESMAG**.

Estoy aquí para orientarte paso a paso en **SIG aplicado a la Arquitectura, el Ordenamiento Territorial y la Gestión Ambiental**, con **ArcGIS Pro y ArcGIS Online** como herramientas principales (y QGIS, Google Earth Engine o Python como apoyo).

---

💡 **¿En qué te puedo orientar hoy?**
* **Geodesia y Cartografía:** Transformaciones a **MAGNA-SIRGAS Origen Nacional (EPSG: 9377)** y proyecciones.
* **Geoprocesamientos:** Buffers, intersecciones, cruces topológicos y modelado de datos en cuencas o coberturas.
* **Teledetección e Índices:** Cálculo de **NDVI, NDWI, NBR** en Sentinel-2 y Landsat.
* **Revisión de Mapas y Entregables:** Puedes adjuntar o **pegar (Ctrl+V) / arrastrar** una captura o mapa con el botón 📎 para recibir retroalimentación técnica y cartográfica.

*Escribe tu consulta abajo, selecciona una temática sugerida o arrastra tu mapa para comenzar.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    base64: string;
    mime: string;
    name: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showCronograma, setShowCronograma] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading, scrollToBottom]);

  // Handle scroll to show/hide "Scroll to bottom" button
  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 180);
  };

  const executeReset = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
    }
    setMessages([
      {
        id: "welcome-reset",
        role: "model",
        content: `¡Sesión reiniciada! ¿En qué consulta de **SIG, Teledetección o Cartografía** te puedo orientar hoy?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInput("");
    setSelectedImage(null);
    setShowResetConfirm(false);
  };

  const handleResetChat = () => {
    if (messages.length > 1) {
      setShowResetConfirm(true);
    } else {
      executeReset();
    }
  };

  // Expose reset to parent if needed
  if (onResetRef) {
    onResetRef.current = handleResetChat;
  }

  // Process image file
  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("La imagen no debe superar los 8MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({
        base64: reader.result as string,
        mime: file.type || "image/png",
        name: file.name || "captura-cartografica.png",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  // Direct paste support (Ctrl+V screenshot into textarea)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          processImageFile(file);
          break;
        }
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || input.trim();
    if (!messageText && !selectedImage) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText || "Por favor analiza la imagen / captura adjunta.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      software: selectedSoftware !== "General" ? selectedSoftware : undefined,
      imageBase64: selectedImage?.base64,
      imageMime: selectedImage?.mime,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const text = await chatWithTutor(
        newMessages.map((m) => ({
          role: m.role,
          content: m.content,
          imageBase64: m.imageBase64,
          imageMime: m.imageMime,
        })),
        { software: selectedSoftware }
      );

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `⚠️ Inconveniente temporal con el servicio de IA: ${
          error?.message || "Por favor reintenta tu consulta en unos segundos."
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    // Find the last user message to retry
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    // Filter out the trailing error model message
    const validHistory = messages.filter(
      (m, idx) => !(idx === messages.length - 1 && m.role === "model" && m.content.startsWith("⚠️"))
    );

    setMessages(validHistory);
    setIsLoading(true);

    try {
      const text = await chatWithTutor(
        validHistory.map((m) => ({
          role: m.role,
          content: m.content,
          imageBase64: m.imageBase64,
          imageMime: m.imageMime,
        })),
        { software: selectedSoftware }
      );

      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error: any) {
      console.error("Retry error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: `⚠️ Inconveniente temporal con el servicio de IA: ${
          error?.message || "Por favor reintenta tu consulta en unos segundos."
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text-To-Speech for accessibility
  const toggleSpeech = (text: string, id: string) => {
    if (!("speechSynthesis" in window)) {
      alert("Tu navegador no soporta síntesis de voz.");
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Strip markdown tags for clean speech
    const cleanText = text
      .replace(/[*_#`~[\]]/g, "")
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "es-CO";
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Export session transcript as Markdown
  const handleExportSession = () => {
    const header = `# Tutor-SIG - Guía de Estudio y Consulta Académica\n**Institución:** Universidad CESMAG\n**Fecha:** ${new Date().toLocaleDateString(
      "es-CO",
      { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    )}\n**Software:** ${selectedSoftware}\n**Autor intelectual:** geógr. Dany Benavides Bolaños\n\n---\n\n`;

    const body = messages
      .map((m) => {
        const author = m.role === "user" ? "### 👤 Estudiante" : "### 🧭 Tutor-SIG (Universidad CESMAG)";
        return `${author} *[${m.timestamp}]*\n\n${m.content}\n\n---\n`;
      })
      .join("\n");

    const blob = new Blob([header + body], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Tutor-SIG-Apuntes-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const isInitialState = messages.length === 1;

  return (
    <div
      id="chat-tutor-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 py-4 flex flex-col justify-between h-[calc(100vh-120px)]"
    >
      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-2 sm:inset-4 z-50 bg-[#003057]/90 backdrop-blur-xs border-3 border-dashed border-[#F3B229] rounded-3xl flex flex-col items-center justify-center p-6 text-white text-center shadow-2xl animate-fadeIn">
          <UploadCloud className="w-16 h-16 text-[#F3B229] mb-3 animate-bounce" />
          <h3 className="text-lg font-bold">Suelta tu mapa o captura aquí</h3>
          <p className="text-sm text-slate-200 mt-1 max-w-md">
            Tutor-SIG evaluará la composición cartográfica, escalas, coordenadas y elementos del software.
          </p>
        </div>
      )}

      {/* Confirmation Modal for Resetting Active Chat */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-scaleIn">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#C8102E] flex items-center justify-center flex-shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">¿Reiniciar la sesión de consulta?</h3>
                <p className="text-xs text-slate-500">Se limpiará el historial actual de preguntas y respuestas.</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              💡 <em>Tip de usabilidad:</em> Puedes descargar tus apuntes antes de reiniciar con el botón <strong>Exportar apuntes (.md)</strong>.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancelar
              </button>
              <button
                onClick={executeReset}
                className="px-4 py-2 text-xs font-bold bg-[#C8102E] text-white hover:bg-red-700 rounded-xl transition shadow-xs"
              >
                Sí, reiniciar consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cronograma del Diplomado Modal */}
      <CronogramaDiplomado open={showCronograma} onClose={() => setShowCronograma(false)} />

      {/* Lightbox Modal for Uploaded Screenshots */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <button
              onClick={() => setPreviewModalImage(null)}
              className="absolute top-3 right-3 z-10 bg-slate-800/80 text-white p-2 rounded-full hover:bg-red-600 transition"
              title="Cerrar vista previa"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewModalImage}
              alt="Vista ampliada del mapa"
              className="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}

      {/* Top Utility Bar for Exporting and Status */}
      {!isInitialState && (
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200/80 text-[11px] text-slate-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#003057] flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#C8102E]" />
              {selectedSoftware !== "General" ? `Enfoque: ${selectedSoftware}` : "Enfoque General SIG"}
            </span>
            <span>•</span>
            <span>{messages.length - 1} interacción(es)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="cronograma-btn"
              onClick={() => setShowCronograma(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#003057] hover:border-[#003057] transition font-semibold shadow-2xs hover:shadow-xs"
              title="Ver el cronograma del diplomado"
              aria-label="Ver el cronograma del diplomado"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#F3B229]" />
              <span>Cronograma</span>
            </button>

            <button
              id="export-chat-btn"
              onClick={handleExportSession}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#003057] hover:border-[#003057] transition font-semibold shadow-2xs hover:shadow-xs"
              title="Descargar historial de consulta en Markdown"
            >
              <Download className="w-3.5 h-3.5 text-[#C8102E]" />
              <span>Exportar apuntes (.md)</span>
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Messages Container */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pr-1 space-y-4 pb-4 scrollbar-thin"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
            >
              {/* Sender label & timestamp */}
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-1 px-1">
                {!isUser && (
                  <span className="w-2 h-2 rounded-full bg-[#C8102E]"></span>
                )}
                <span className="font-bold text-slate-700">
                  {isUser ? "Estudiante" : "Tutor-SIG"}
                </span>
                {msg.software && (
                  <span className="text-[10px] bg-blue-100 text-[#003057] px-1.5 py-0.2 rounded font-semibold">
                    {msg.software}
                  </span>
                )}
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Box */}
              <div
                className={`rounded-2xl p-4 sm:p-5 max-w-[95%] sm:max-w-[88%] text-xs sm:text-sm leading-relaxed transition-all shadow-2xs ${
                  isUser
                    ? "bg-[#003057] text-white rounded-br-xs"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs"
                }`}
              >
                {/* Attached Image Preview in User Bubble */}
                {msg.imageBase64 && (
                  <div className="relative group mb-3 rounded-xl overflow-hidden border border-white/20 max-w-sm cursor-pointer">
                    <img
                      src={msg.imageBase64}
                      alt="Elemento adjunto por el estudiante"
                      className="w-full h-auto object-cover max-h-60"
                      onClick={() => setPreviewModalImage(msg.imageBase64!)}
                    />
                    <div
                      onClick={() => setPreviewModalImage(msg.imageBase64!)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Ampliar mapa</span>
                    </div>
                  </div>
                )}

                {/* Markdown Content with Code Block Renderer */}
                <div
                  className={`prose prose-xs sm:prose-sm max-w-none break-words ${
                    isUser
                      ? "prose-invert prose-p:text-white prose-strong:text-white"
                      : "prose-slate prose-headings:text-[#003057] prose-headings:font-bold prose-a:text-[#C8102E] prose-strong:text-slate-900"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, className, children, ...props }) {
                        const isInline = !className && typeof children === "string" && !children.includes("\n");
                        if (isInline) {
                          return (
                            <code
                              className="bg-slate-100 text-[#003057] font-semibold px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                      },
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {/* Assistant Footer with Speech, Retry & Copy buttons */}
                {!isUser && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Universidad CESMAG • Tutoría Formativa
                    </span>

                    <div className="flex items-center gap-1.5">
                      {/* Retry Button if Error Message */}
                      {msg.content.startsWith("⚠️") && (
                        <button
                          onClick={handleRetry}
                          disabled={isLoading}
                          className="flex items-center gap-1 bg-[#C8102E] text-white hover:bg-red-700 px-2.5 py-1 rounded-md font-bold transition shadow-2xs text-[11px]"
                          title="Reintentar consulta"
                          aria-label="Reintentar consulta con el tutor"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reintentar</span>
                        </button>
                      )}

                      {/* Audio listen button */}
                      {!msg.content.startsWith("⚠️") && (
                        <button
                          onClick={() => toggleSpeech(msg.content, msg.id)}
                          className={`flex items-center gap-1 text-slate-500 hover:text-[#003057] transition font-medium px-2 py-1 rounded hover:bg-slate-100 ${
                            speakingId === msg.id ? "bg-amber-50 text-[#C8102E] font-bold" : ""
                          }`}
                          title={speakingId === msg.id ? "Detener lectura de voz" : "Escuchar explicación"}
                          aria-label="Escuchar explicación en audio"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-[#C8102E]" />
                              <span className="text-[#C8102E]">Detener</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Escuchar</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Copy response text */}
                      <button
                        onClick={() => copyToClipboard(msg.content, msg.id)}
                        className="flex items-center gap-1 text-slate-500 hover:text-[#003057] transition font-medium px-2 py-1 rounded hover:bg-slate-100"
                        title="Copiar respuesta"
                        aria-label="Copiar respuesta al portapapeles"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="hidden sm:inline">Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Follow-up Quick Chips (Shown after assistant answers) */}
        {!isInitialState && !isLoading && (
          <div className="pt-2 flex flex-wrap gap-2 animate-fadeIn">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 w-full sm:w-auto">
              <Sparkles className="w-3 h-3 text-[#C8102E]" /> Preguntas complementarias:
            </span>
            {FOLLOW_UP_SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(suggestion)}
                className="text-[11px] text-slate-700 bg-white hover:bg-blue-50 border border-slate-200 hover:border-[#003057] px-2.5 py-1 rounded-full transition shadow-2xs font-medium text-left"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1">
              <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-ping"></span>
              <span className="font-bold text-slate-700">Tutor-SIG</span>
              <span>•</span>
              <span>Estructurando respuesta...</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs p-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-[#003057] rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-[#C8102E] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#F3B229] rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Analizando parámetros y preparando guía técnica...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Starters Grid (Only shown when chat is fresh) */}
        {isInitialState && !isLoading && (
          <div className="pt-2 pb-2">
            <div className="text-xs font-bold text-[#003057] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C8102E]" />
              Consultas y Laboratorios Frecuentes:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {QUICK_STARTERS.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    id={`quick-starter-${idx}`}
                    onClick={() => handleSendMessage(item.prompt)}
                    className="text-left p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-[#003057] hover:bg-slate-50/80 shadow-2xs hover:shadow-xs transition group flex flex-col justify-between min-h-[44px]"
                  >
                    <div className="flex items-start gap-2.5 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#003057] group-hover:bg-[#003057] group-hover:text-white flex items-center justify-center flex-shrink-0 transition">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#003057] leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-[#C8102E] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Consultar <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Acceso directo al cronograma oficial del diplomado */}
            <button
              id="cronograma-starter-btn"
              onClick={() => setShowCronograma(true)}
              className="mt-3 w-full flex items-center justify-center gap-2 text-[11px] font-bold text-[#003057] bg-white border border-slate-200 hover:border-[#F3B229] hover:bg-amber-50/40 rounded-xl px-3 py-2 transition shadow-2xs"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#F3B229]" />
              Ver cronograma del diplomado (ago – nov 2026)
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute right-6 bottom-24 z-30 bg-[#003057] text-white p-2.5 rounded-full shadow-lg hover:bg-[#C8102E] transition animate-bounce flex items-center justify-center"
          title="Desplazarse al mensaje más reciente"
          aria-label="Ir al final de la conversación"
        >
          <ArrowDown className="w-4 h-4" />
        </button>
      )}

      {/* Input Workspace Bar */}
      <div className="pt-2 flex-shrink-0">
        {/* Attached image preview banner */}
        {selectedImage && (
          <div className="mb-2 bg-slate-100 border border-slate-200 rounded-xl p-2 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2 overflow-hidden">
              <img
                src={selectedImage.base64}
                alt="Vista previa"
                className="w-10 h-10 object-cover rounded-lg border border-slate-300 cursor-pointer"
                onClick={() => setPreviewModalImage(selectedImage.base64)}
              />
              <div className="truncate">
                <span className="text-xs font-bold text-slate-800 block truncate">
                  {selectedImage.name}
                </span>
                <span className="text-[10px] text-slate-500">
                  Listo para evaluar elementos cartográficos y software
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
              title="Eliminar imagen adjunta"
              aria-label="Eliminar imagen adjunta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Text Input Card with Paste support */}
        <div className="bg-white border-2 border-slate-200 focus-within:border-[#003057] rounded-2xl p-2 sm:p-2.5 shadow-sm transition-all">
          <div className="flex items-end gap-2">
            {/* Hidden File Input for Maps / Screenshots */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
              id="file-upload-input"
            />

            {/* Attach Image Button */}
            <button
              type="button"
              id="attach-file-btn"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-500 hover:text-[#003057] hover:bg-slate-100 rounded-xl transition flex-shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Adjuntar mapa o captura de software (PNG/JPG) o presiona Ctrl+V para pegar"
              aria-label="Adjuntar captura de mapa o interfaz de software"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              id="chat-textarea-input"
              rows={1}
              value={input}
              onChange={handleTextareaInput}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Haz tu consulta en SIG, teledetección o pega una captura con Ctrl+V..."
              aria-label="Escribe tu consulta para Tutor-SIG"
              className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-none max-h-40 py-1.5"
            />

            {/* Send Button */}
            <button
              id="send-message-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || (!input.trim() && !selectedImage)}
              className="p-2 bg-[#003057] hover:bg-[#C8102E] disabled:opacity-40 disabled:hover:bg-[#003057] text-white rounded-xl transition flex-shrink-0 shadow-xs min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              title="Enviar mensaje"
              aria-label="Enviar consulta"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Academic Integrity & Usability Hints */}
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600 px-2">
          <span>
            💡 <kbd className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">Enter</kbd> para enviar • <kbd className="bg-slate-200 px-1 py-0.5 rounded text-[10px] font-mono">Ctrl+V</kbd> para pegar capturas de pantalla.
          </span>
          <span className="font-semibold text-[#003057] hidden sm:inline">
            Universidad CESMAG • Tutor-SIG
          </span>
        </div>
      </div>
    </div>
  );
};
