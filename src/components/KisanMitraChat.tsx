import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import mascot from "@/assets/kisan-mitra.png";

const CHAT_TRANSLATIONS: Record<
  string,
  {
    subTitle: string;
    greeting: string;
    greetingDesc: string;
    startBtn: string;
    placeholder: string;
    sendBtn: string;
    thinking: string;
    quickAsks: string[];
    fallbackError: string;
  }
> = {
  hi: {
    subTitle: "मैं आपकी क्या मदद करूं?",
    greeting: "नमस्ते! मैं किसान मित्र हूँ।",
    greetingDesc: "गेट पास, MSP भाव, नमी और कागजात — कुछ भी पूछिए।",
    startBtn: "शुरू करें / GET STARTED",
    placeholder: "अपना सवाल लिखें...",
    sendBtn: "भेजें",
    thinking: "सोच रहा हूँ...",
    quickAsks: [
      "गेट पास कैसे बुक करें?",
      "आज का MSP भाव",
      "नमी 17% क्या है?",
      "कौन से कागज चाहिए?",
      "पैसा कब आएगा?",
    ],
    fallbackError: "सहायक अभी उपलब्ध नहीं है। कृपया 1800-180-1551 पर कॉल करें।",
  },
  pa: {
    subTitle: "ਮੈਂ ਤੁਹਾਡੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    greeting: "ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕਿਸਾਨ ਮਿੱਤਰ ਹਾਂ।",
    greetingDesc: "ਗੇਟ ਪਰਚੀ, MSP ਰੇਟ, ਨਮੀ ਅਤੇ ਕਾਗਜ਼ — ਕੁਝ ਵੀ ਪੁੱਛੋ।",
    startBtn: "ਸ਼ੁਰੂ ਕਰੋ / START",
    placeholder: "ਆਪਣਾ ਸਵਾਲ ਲਿਖੋ...",
    sendBtn: "ਭੇਜੋ",
    thinking: "ਸੋਚ ਰਿਹਾ ਹਾਂ...",
    quickAsks: [
      "ਗੇਟ ਪਰਚੀ ਕਿਵੇਂ ਬੁੱਕ ਕਰੀਏ?",
      "ਅੱਜ ਦਾ MSP ਰੇਟ",
      "ਨਮੀ 17% ਕੀ ਹੈ?",
      "ਕਿਹੜੇ ਕਾਗਜ਼ ਚਾਹੀਦੇ ਹਨ?",
      "ਪੈਸਾ ਕਦੋਂ ਆਵੇਗਾ?",
    ],
    fallbackError: "ਮਦਦਗਾਰ ਇਸ ਵੇਲੇ ਉਪਲਬਧ ਨਹੀਂ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ 1800-180-1551 'ਤੇ ਕਾਲ ਕਰੋ।",
  },
  mr: {
    subTitle: "मी आपली काय मदत करू शकतो?",
    greeting: "नमस्ते! मी किसान मित्र आहे.",
    greetingDesc: "गेट पास, हमीभाव दर, ओलावा आणि कागदपत्रे — काहीही विचारा.",
    startBtn: "सुरू करा / START",
    placeholder: "आपला प्रश्न येथे लिहा...",
    sendBtn: "पाठवा",
    thinking: "विचार करत आहे...",
    quickAsks: [
      "गेट पास कसा बुक करावा?",
      "आजचा हमीभाव दर",
      "ओलावा 17% काय आहे?",
      "कोणती कागदपत्रे लागतात?",
      "पैसे कधी येतील?",
    ],
    fallbackError: "सहाय्यक सध्या उपलब्ध नाही. कृपया 1800-180-1551 वर कॉल करा.",
  },
  en: {
    subTitle: "How can I help you?",
    greeting: "Namaste! I am Kisan Mitra.",
    greetingDesc: "Ask me anything about Gate Pass booking, MSP rates, moisture limits, and required documents.",
    startBtn: "Get Started",
    placeholder: "Type your question...",
    sendBtn: "Send",
    thinking: "Thinking...",
    quickAsks: [
      "How to book Gate Pass?",
      "Today's MSP Rates",
      "What is 17% Moisture?",
      "Which documents are required?",
      "When will payment arrive?",
    ],
    fallbackError: "Assistant is currently unavailable. Please call 1800-180-1551.",
  },
};

function messageText(message: UIMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("")
    .trim();
}

export default function KisanMitraChat() {
  const [open, setOpen] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<string>("hi");

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync language with portal
  useEffect(() => {
    const saved = localStorage.getItem("kisansetu_lang");
    if (saved && (saved === "hi" || saved === "pa" || saved === "mr" || saved === "en")) {
      setLang(saved);
    }

    const handleLangChange = (e: any) => {
      if (e.detail && (e.detail === "hi" || e.detail === "pa" || e.detail === "mr" || e.detail === "en")) {
        setLang(e.detail);
      }
    };

    window.addEventListener("kisansetu_lang_change", handleLangChange);
    return () => window.removeEventListener("kisansetu_lang_change", handleLangChange);
  }, []);

  const ct = CHAT_TRANSLATIONS[lang] || CHAT_TRANSLATIONS.hi;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        headers: { "x-language": lang },
      }),
    [lang]
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (err) => setError(err.message || ct.fallbackError),
  });

  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (open && greeted) inputRef.current?.focus();
  }, [open, greeted, status]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const ask = (text: string) => {
    if (!text.trim() || busy) return;
    setError(null);
    setInput("");
    void sendMessage({ text: text.trim() });
  };

  const changeLanguage = (newLang: string) => {
    setLang(newLang);
    localStorage.setItem("kisansetu_lang", newLang);
    window.dispatchEvent(new CustomEvent("kisansetu_lang_change", { detail: newLang }));
  };

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Kisan Mitra सहायक खोलें"
          className="no-print fixed bottom-18 sm:bottom-6 right-3.5 sm:right-6 z-40 flex items-center gap-2 rounded-full border border-[#4a7c59]/40 bg-white py-1.5 pl-1.5 pr-3.5 shadow-xl hover:shadow-2xl transition hover:scale-105 cursor-pointer active:scale-95"
        >
          <img
            src={mascot}
            alt="Kisan Mitra"
            width={512}
            height={512}
            className="h-9 w-9 sm:h-11 sm:w-11 rounded-full bg-emerald-50 object-contain p-0.5 border border-emerald-200"
          />
          <span className="text-left leading-tight">
            <span className="block text-[11px] sm:text-xs font-black text-[#2a4732]">Kisan Mitra AI</span>
            <span className="block text-[9px] sm:text-[10px] font-bold text-[#c86d12]">
              {lang === "hi"
                ? "पूछिए / Ask me"
                : lang === "pa"
                ? "ਪੁੱਛੋ / Ask me"
                : lang === "mr"
                ? "विचारा / Ask me"
                : "Ask Assistant"}
            </span>
          </span>
        </button>
      )}

      {open && (
        <div className="no-print fixed bottom-18 sm:bottom-6 right-2 sm:right-6 z-50 flex h-[76vh] max-h-[520px] w-[calc(100vw-1rem)] sm:w-96 max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 bg-[#2a4732] px-3 py-2.5 text-white">
            <img
              src={mascot}
              alt="Kisan Mitra"
              width={512}
              height={512}
              className="h-9 w-9 rounded-full bg-white/90 object-contain"
            />
            <div className="flex-1 leading-tight">
              <p className="text-xs font-black">Kisan Mitra AI</p>
              <p className="text-[10px] font-semibold text-ksbrand-light">{ct.subTitle}</p>
            </div>

            {/* In-chat language picker */}
            <div className="flex items-center bg-black/20 rounded p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => changeLanguage("hi")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  lang === "hi" ? "bg-white text-ksbrand font-bold" : "text-white/80"
                }`}
              >
                हि
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("pa")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  lang === "pa" ? "bg-white text-ksbrand font-bold" : "text-white/80"
                }`}
              >
                ਪੰ
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("mr")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  lang === "mr" ? "bg-white text-ksbrand font-bold" : "text-white/80"
                }`}
              >
                म
              </button>
              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${
                  lang === "en" ? "bg-white text-ksbrand font-bold" : "text-white/80"
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="बंद करें"
              className="rounded-md px-1.5 py-1 text-sm font-black hover:bg-white/15 cursor-pointer"
            >
              ✕
            </button>
          </div>

          {!greeted ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-ksbrand-dark px-5 text-center text-white">
              <img
                src={mascot}
                alt="Kisan Mitra"
                width={512}
                height={512}
                className="h-24 w-24 rounded-2xl bg-white object-contain p-1"
              />
              <p className="text-base font-black">{ct.greeting}</p>
              <p className="text-xs font-semibold text-ksbrand-light">{ct.greetingDesc}</p>
              <button
                type="button"
                onClick={() => setGreeted(true)}
                className="mt-1 w-full rounded-lg bg-ksaccent px-4 py-2.5 text-sm font-black text-white transition hover:bg-ksaccent-hover cursor-pointer"
              >
                {ct.startBtn}
              </button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ksbg px-3 py-3">
                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {ct.quickAsks.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => ask(q)}
                        className="rounded-full border border-ksborder bg-white px-3 py-1.5 text-[11px] font-bold text-ksbrand-dark transition hover:bg-ksbrand-light cursor-pointer shadow-xs"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {messages.map((message) => {
                  const text = messageText(message);
                  if (!text) return null;
                  return message.role === "user" ? (
                    <div key={message.id} className="flex justify-end">
                      <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-ksbrand px-3 py-2 text-xs font-bold text-white shadow-xs">
                        {text}
                      </p>
                    </div>
                  ) : (
                    <div
                      key={message.id}
                      className="max-w-[92%] text-xs leading-relaxed font-medium text-slate-800 bg-white p-3 rounded-2xl rounded-bl-sm border border-ksborder/60 shadow-xs [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-1.5 [&_strong]:font-black"
                    >
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  );
                })}

                {status === "submitted" && (
                  <p className="animate-pulse text-xs font-bold text-ksbrand">{ct.thinking}</p>
                )}
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] font-bold text-red-700">
                    {error}
                  </p>
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  ask(input);
                }}
                className="flex items-center gap-2 border-t border-ksborder bg-white p-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={ct.placeholder}
                  className="min-w-0 flex-1 rounded-lg border border-ksborder bg-ksbg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-ksbrand"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="rounded-lg bg-ksbrand px-3 py-2 text-xs font-black text-white transition hover:bg-ksbrand-hover disabled:opacity-50 cursor-pointer"
                >
                  {ct.sendBtn}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
