import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import mascot from "@/assets/kisan-mitra.png";

const QUICK_ASKS = [
  "गेट पास कैसे बुक करें?",
  "आज का MSP भाव",
  "नमी 17% क्या है?",
  "कौन से कागज चाहिए?",
  "पैसा कब आएगा?",
];

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
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: (err) =>
      setError(err.message || "सहायक अभी उपलब्ध नहीं है। कृपया 1800-180-1551 पर कॉल करें।"),
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

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Kisan Mitra सहायक खोलें"
          className="no-print fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-ksborder bg-white py-1.5 pl-1.5 pr-4 shadow-lg transition hover:shadow-xl"
        >
          <img
            src={mascot}
            alt="Kisan Mitra"
            width={512}
            height={512}
            className="h-11 w-11 rounded-full bg-ksbrand-light object-contain"
          />
          <span className="text-left leading-tight">
            <span className="block text-[11px] font-black text-ksbrand">Kisan Mitra</span>
            <span className="block text-[10px] font-bold text-slate-500">पूछिए / Ask me</span>
          </span>
        </button>
      )}

      {open && (
        <div className="no-print fixed bottom-4 right-4 z-50 flex h-[70vh] max-h-[520px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-ksborder bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-2 bg-ksbrand px-3 py-2 text-white">
            <img
              src={mascot}
              alt="Kisan Mitra"
              width={512}
              height={512}
              className="h-9 w-9 rounded-full bg-white/90 object-contain"
            />
            <div className="flex-1 leading-tight">
              <p className="text-xs font-black">Kisan Mitra</p>
              <p className="text-[10px] font-semibold text-ksbrand-light">
                मैं आपकी क्या मदद करूं?
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="बंद करें"
              className="rounded-md px-2 py-1 text-sm font-black hover:bg-white/15"
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
              <p className="text-base font-black">नमस्ते! मैं किसान मित्र हूँ।</p>
              <p className="text-xs font-semibold text-ksbrand-light">
                गेट पास, MSP भाव, नमी और कागजात — कुछ भी पूछिए।
              </p>
              <button
                type="button"
                onClick={() => setGreeted(true)}
                className="mt-1 w-full rounded-lg bg-ksaccent px-4 py-2.5 text-sm font-black text-white transition hover:bg-ksaccent-hover"
              >
                शुरू करें / GET STARTED
              </button>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-ksbg px-3 py-3">
                {messages.length === 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ASKS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => ask(q)}
                        className="rounded-full border border-ksborder bg-white px-3 py-1.5 text-[11px] font-bold text-ksbrand-dark transition hover:bg-ksbrand-light"
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
                      <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-ksbrand px-3 py-2 text-xs font-bold text-white">
                        {text}
                      </p>
                    </div>
                  ) : (
                    <div
                      key={message.id}
                      className="max-w-[92%] text-xs leading-relaxed font-medium text-slate-800 [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-1.5 [&_strong]:font-black"
                    >
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  );
                })}

                {status === "submitted" && (
                  <p className="animate-pulse text-xs font-bold text-ksbrand">सोच रहा हूँ...</p>
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
                  placeholder="अपना सवाल लिखें..."
                  className="min-w-0 flex-1 rounded-lg border border-ksborder bg-ksbg px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:border-ksbrand"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="rounded-lg bg-ksbrand px-3 py-2 text-xs font-black text-white transition hover:bg-ksbrand-hover disabled:opacity-50"
                >
                  भेजें
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
}
