import React, { useState, useEffect, useRef } from "react";

interface IvrPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess?: (booking: any) => void;
}

export const IvrPhoneModal: React.FC<IvrPhoneModalProps> = ({
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const [callActive, setCallActive] = useState<boolean>(false);
  const [callId, setCallId] = useState<string>("");
  const [phoneInput, setPhoneInput] = useState<string>("9876543210");
  const [currentPrompt, setCurrentPrompt] = useState<string>("");
  const [stage, setStage] = useState<string>("LANGUAGE");
  const [callHistory, setCallHistory] = useState<Array<{ sender: "ivr" | "user"; text: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [keypadBuffer, setKeypadBuffer] = useState<string>("");
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [latestBooking, setLatestBooking] = useState<any>(null);

  const historyEndRef = useRef<HTMLDivElement>(null);

  // Scroll to latest message
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [callHistory]);

  // Audio tone synthesizer for DTMF keypad click
  const playTone = (freq1: number, freq2: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = freq1;
      osc2.frequency.value = freq2;
      gain.gain.value = 0.08;

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      setTimeout(() => {
        osc1.stop();
        osc2.stop();
        ctx.close();
      }, 120);
    } catch {
      // AudioContext unavailable
    }
  };

  // Text-To-Speech reader
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const clean = text.replace(/[*#]/g, "").replace(/\n/g, ". ");
      const utterance = new SpeechSynthesisUtterance(clean);
      const isHindi = /[\u0900-\u097F]/.test(text);
      utterance.lang = isHindi ? "hi-IN" : "en-IN";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {
      // TTS error
    }
  };

  // Start Inbound Call
  const startCall = async () => {
    const newCallId = `call-${Date.now()}`;
    setCallId(newCallId);
    setCallActive(true);
    setIsLoading(true);
    setCallHistory([]);
    setLatestBooking(null);

    try {
      const res = await fetch("/api/procurement/ivr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId: newCallId,
          phone: phoneInput || "9876543210",
        }),
      });
      const data = await res.json();
      if (data && data.promptText) {
        setCurrentPrompt(data.promptText);
        setStage(data.session?.stage || "LANGUAGE");
        setCallHistory([{ sender: "ivr", text: data.promptText }]);
        speakText(data.promptText);
      }
    } catch (err: any) {
      const fallbackMsg =
        "किसानसेतु राष्ट्रीय खरीद हेल्पलाइन 1800-180-1551 में आपका स्वागत है। \nहिन्दी के लिए 1 दबाएं। For English press 2.";
      setCurrentPrompt(fallbackMsg);
      setCallHistory([{ sender: "ivr", text: fallbackMsg }]);
      speakText(fallbackMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Keypad DTMF Input
  const sendKeypadInput = async (digit: string) => {
    if (!callActive || isLoading) return;

    // Play DTMF dual-tone
    playTone(697, 1209);

    const newBuffer = keypadBuffer + digit;
    setKeypadBuffer(newBuffer);

    // If input is quantity or phone, user presses '#' to submit
    const isMultiDigitStage = stage === "BOOKING_ENTER_QUANTITY" || stage === "PHONE_INPUT";

    if (digit === "#" || !isMultiDigitStage) {
      const inputToSend = isMultiDigitStage ? newBuffer.replace(/#/g, "") : digit;
      setKeypadBuffer("");
      setCallHistory((prev) => [...prev, { sender: "user", text: `Keypad: [ ${inputToSend} ]` }]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/procurement/ivr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callId,
            phone: phoneInput,
            digits: inputToSend,
          }),
        });
        const data = await res.json();
        if (data && data.promptText) {
          setCurrentPrompt(data.promptText);
          setStage(data.session?.stage || "MAIN_MENU");
          setCallHistory((prev) => [...prev, { sender: "ivr", text: data.promptText }]);
          speakText(data.promptText);

          if (data.booking) {
            setLatestBooking(data.booking);
            if (onBookingSuccess) onBookingSuccess(data.booking);
          }
        }
      } catch (err: any) {
        setCallHistory((prev) => [
          ...prev,
          { sender: "ivr", text: "सर्वर से संपर्क नहीं हो सका। कृपया 1 दबाएं।" },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const hangUp = () => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCallActive(false);
    setKeypadBuffer("");
    setCurrentPrompt("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#2a4732] px-4 py-3 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📞</span>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base leading-tight">
                KisanSetu IVR Phone Simulator
              </h2>
              <p className="text-[11px] text-emerald-200">Toll-Free Dial-in: 1800-180-1551</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              hangUp();
              onClose();
            }}
            className="text-white/80 hover:text-white font-bold text-lg cursor-pointer px-2"
          >
            ✕
          </button>
        </div>

        {/* Call Stage Status Bar */}
        <div className="bg-slate-800/90 px-4 py-2 border-b border-slate-700 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                callActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
              }`}
            ></span>
            <span className="font-semibold">
              {callActive ? `Call Connected • ${stage}` : "Ready to Dial"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setTtsEnabled(!ttsEnabled);
              if (ttsEnabled && typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
              }
            }}
            className="text-[11px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 cursor-pointer text-slate-300"
          >
            {ttsEnabled ? "🔊 Voice: ON" : "🔇 Voice: Muted"}
          </button>
        </div>

        {/* Dialogue / Voice Transcript Screen */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-2.5 bg-slate-950 text-xs min-h-[160px] max-h-[220px]">
          {!callActive && (
            <div className="text-center py-6 text-slate-400 space-y-2">
              <div className="text-3xl">🌾</div>
              <p className="font-semibold text-slate-300">
                Simulate a rural farmer calling KisanSetu IVR from a basic keypad phone.
              </p>
              <p className="text-[11px] text-slate-500">
                Select your simulated mobile number below and click <strong>"Start Call"</strong>.
              </p>
            </div>
          )}

          {callHistory.map((item, idx) => (
            <div
              key={idx}
              className={`flex ${item.sender === "ivr" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-2.5 whitespace-pre-line leading-relaxed ${
                  item.sender === "ivr"
                    ? "bg-slate-800 text-emerald-300 border border-slate-700 shadow-xs"
                    : "bg-[#4a7c59] text-white font-bold text-right"
                }`}
              >
                {item.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 rounded-xl p-2 animate-pulse text-[11px]">
                🔊 IVR is speaking / processing input...
              </div>
            </div>
          )}

          <div ref={historyEndRef} />
        </div>

        {/* Live Token Alert Banner */}
        {latestBooking && (
          <div className="bg-emerald-950 border-t border-b border-emerald-600 px-3 py-2 text-emerald-200 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold text-yellow-300">🎉 Token Issued: {latestBooking.tokenId}</span>
              <span className="block text-[10px] text-emerald-300">
                {latestBooking.centreName} • {latestBooking.slot} • Payout: ₹{latestBooking.estimatedPayout}
              </span>
            </div>
            <span className="bg-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold text-white">
              In "My Pass"
            </span>
          </div>
        )}

        {/* Keypad & Controls */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          {/* Phone Number Input (When disconnected) */}
          {!callActive ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Caller Phone Number (Aadhaar Registered):
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-center font-mono font-bold text-yellow-300 tracking-wider"
                />
              </div>

              <button
                type="button"
                onClick={startCall}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-sm"
              >
                <span className="text-lg">📞</span>
                <span>Dial 1800-180-1551 (Start IVR Call)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Multi-digit buffer preview */}
              {keypadBuffer && (
                <div className="text-center text-yellow-300 font-mono text-xs font-bold bg-slate-800 py-1 rounded border border-slate-700">
                  Dialing: {keypadBuffer} {stage === "BOOKING_ENTER_QUANTITY" && "(Press # to Submit)"}
                </div>
              )}

              {/* 3x4 DTMF Telephone Keypad */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { d: "1", sub: "Hindi / Book" },
                  { d: "2", sub: "English / View" },
                  { d: "3", sub: "Slots" },
                  { d: "4", sub: "Mandi" },
                  { d: "5", sub: "Cancel" },
                  { d: "6", sub: "Help" },
                  { d: "7", sub: "PRS" },
                  { d: "8", sub: "TUV" },
                  { d: "9", sub: "Repeat" },
                  { d: "*", sub: "Language" },
                  { d: "0", sub: "+" },
                  { d: "#", sub: "Enter" },
                ].map((btn) => (
                  <button
                    key={btn.d}
                    type="button"
                    onClick={() => sendKeypadInput(btn.d)}
                    className="bg-slate-800 hover:bg-slate-700 active:bg-emerald-800 border border-slate-700 rounded-xl py-2 flex flex-col items-center justify-center transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <span className="text-base sm:text-lg font-black leading-none">{btn.d}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 leading-none">{btn.sub}</span>
                  </button>
                ))}
              </div>

              {/* Hang Up Action */}
              <button
                type="button"
                onClick={hangUp}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-xs"
              >
                <span>📵</span>
                <span>End Call (फोन काटें)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
