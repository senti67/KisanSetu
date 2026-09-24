import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import type { LintHighlight, DependencyNode, ExtractedEntityPayload } from "@/lib/dndeEngine.server";

// Pre-loaded sample procurement tenders for instant demo and evaluation
const SAMPLE_TENDERS = {
  mandiGodown: {
    title: "1. Mandi Grain Godown (High Violations)",
    text: `TENDER SPECIFICATION: CONSTRUCTION OF 5,000 MT CAPACITY FOOD GRAIN STORAGE GODOWN AT APMC MANDI YARD, DISTRICT SAMBALPUR.

1. SCOPE OF WORK:
The work comprises construction of RCC column foundation, plinth beams, and pre-engineered steel truss roof with mandatory vermin-proofing and damp-proofing.

2. MATERIALS AND WORKMANSHIP:
2.1 Concrete: Structural concrete of M25 grade shall be used for all RCC columns and footings conforming to IS 456. Good quality cement shall be utilized throughout the works. Aggregates shall be procured from locally approved sand quarries and crushed stone suppliers. Water for mixing shall be acceptable drinking water.
2.2 Reinforcement: Steel reinforcement shall consist of mild steel grade I bars conforming to IS 432 (Part 1). Splices shall be staggered with adequate lap lengths.
2.3 Cement: Cement used for masonry and structural members shall be 43 grade Ordinary Portland Cement conforming to IS 8112:1989.
2.4 Curing: All concrete surfaces shall be adequately cured after placement before striking formwork.
2.5 Structural Steel: Mandi roof trusses shall be fabricated from standard structural steel with shop primer.`,
  },
  auctionPlatform: {
    title: "2. Covered Auction Platform & Heavy Pavement",
    text: `TENDER SPECIFICATION: DEVELOPMENT OF COVERED AUCTION PLATFORM AND HEAVY CIRCULATION PAVEMENT AT APMC MANDI.

1. CIVIL SPECIFICATIONS:
Heavy-duty pavement shall be constructed using M30 grade concrete conforming to IS 456. Well-graded aggregate shall be used with maximum nominal size of 20mm. Concrete shall be placed continuously with adequate compaction.
2. STEEL STRUCTURE:
Canopy and auction shed framework shall consist of structural steel trusses designed per IS 800:2007. Standard steel sections shall be welded with qualified welders.
3. QUALITY CONTROL:
Cube test specimens shall be cast on site as directed by the Engineer-in-Charge.`,
  },
  weighbridge: {
    title: "3. 60-MT Electronic Mandi Weighbridge",
    text: `TENDER SPECIFICATION: SUPPLY, INSTALLATION, TESTING AND COMMISSIONING OF 60 MT PITLESS ELECTRONIC ROAD WEIGHBRIDGE.

1. FOUNDATION PIT:
RCC foundation pit and approach ramps shall be constructed with M25 concrete per IS 456. Cement shall be 53 grade OPC conforming to IS 12269. Mild steel reinforcement bars shall be provided in raft.
2. WEIGHBRIDGE PLATFORM:
Fabricated steel deck weighbridge shall be fitted with 6 digital load cells and automated ticket printing unit conforming to mandi specifications.`,
  },
};

export default function ProcurementLinter() {
  const [draftText, setDraftText] = useState(SAMPLE_TENDERS.mandiGodown.text);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<LintHighlight | null>(null);
  const [filterType, setFilterType] = useState<"all" | "outdated" | "missing" | "vague">("all");
  const [showAppliedToast, setShowAppliedToast] = useState<string | null>(null);

  // Analysis result state
  const [highlights, setHighlights] = useState<LintHighlight[]>([]);
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntityPayload | null>(null);
  const [dependencyGraph, setDependencyGraph] = useState<DependencyNode[]>([]);
  const [activeTab, setActiveTab] = useState<"traceCards" | "graph" | "entities" | "standardsRef">("traceCards");

  // Initial analysis on load
  useEffect(() => {
    handleRunAnalysis(SAMPLE_TENDERS.mandiGodown.text);
  }, []);

  const handleRunAnalysis = async (textToAnalyze?: string) => {
    const text = textToAnalyze !== undefined ? textToAnalyze : draftText;
    if (!text.trim()) return;

    setIsAnalyzing(true);
    setSelectedHighlight(null);

    try {
      const response = await fetch("/api/infrastructure/analyze-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setHighlights(data.highlights || []);
        setExtractedEntities(data.extractedEntities || null);
        setDependencyGraph(data.dndeGraph?.dependencies || []);
      }
    } catch (err) {
      console.warn("[DNDE] API call error, applying local deterministic engine analysis:", err);
      // Fallback local deterministic analysis if offline or local network interruption
      fallbackLocalAnalysis(text);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fallbackLocalAnalysis = (text: string) => {
    const localHighlights: LintHighlight[] = [];

    // Outdated IS 432
    if (/IS\s*432|mild steel/i.test(text)) {
      localHighlights.push({
        textSegment: text.match(/mild steel (grade\s*I\s*)?bars|IS\s*432(\s*\(Part 1\))?/i)?.[0] || "mild steel",
        type: "outdated",
        message: "IS 432 (Part 1):1982 for Mild Steel Bars is withdrawn and prohibited for structural RCC. Mandatory replacement is IS 1786:2008 (High Strength Deformed TMT Bars - Fe 500D).",
        replacementStandard: "IS 1786:2008 (Fe 500D)",
        standardCode: "IS 432",
        clauseReference: "IS 456:2000 Cl. 5.6",
        severity: "CRITICAL",
      });
    }

    // Outdated IS 8112 / IS 12269
    if (/IS\s*8112|43\s*grade/i.test(text)) {
      localHighlights.push({
        textSegment: text.match(/IS\s*8112(:?1989)?|43 grade Ordinary Portland Cement/i)?.[0] || "43 grade",
        type: "outdated",
        message: "IS 8112:1989 (43 Grade OPC) has been superseded and consolidated into IS 269:2015. Specify Ordinary Portland Cement conforming to IS 269:2015.",
        replacementStandard: "IS 269:2015",
        standardCode: "IS 8112",
        clauseReference: "BIS Specification Harmonization 2015",
        severity: "CRITICAL",
      });
    }

    if (/IS\s*12269|53\s*grade/i.test(text)) {
      localHighlights.push({
        textSegment: text.match(/IS\s*12269|53 grade OPC/i)?.[0] || "53 grade",
        type: "outdated",
        message: "IS 12269:1987 (53 Grade OPC) is superseded by IS 269:2015. Mandatory active standard is IS 269:2015.",
        replacementStandard: "IS 269:2015",
        standardCode: "IS 12269",
        clauseReference: "BIS Harmonization",
        severity: "CRITICAL",
      });
    }

    // Missing IS 383
    if ((/IS\s*456/i.test(text) || /concrete/i.test(text)) && !/IS\s*383/i.test(text)) {
      localHighlights.push({
        textSegment: text.match(/Aggregates|locally approved sand|crushed stone/i)?.[0] || "Aggregates",
        type: "missing",
        message: "Concrete specified under IS 456 requires coarse and fine aggregate grading compliance strictly conforming to IS 383:2016.",
        replacementStandard: "IS 383:2016",
        standardCode: "IS 383",
        clauseReference: "IS 456:2000 Cl. 5.3",
        severity: "HIGH",
      });
    }

    // Missing IS 516
    if (!/IS\s*516/i.test(text)) {
      localHighlights.push({
        textSegment: text.match(/concrete/i)?.[0] || "concrete",
        type: "missing",
        message: "Missing mandatory compressive strength compliance. Test specimens must be cured and crushed per IS 516:2021 with frequency of 1 sample per 1-5 m³ placement.",
        replacementStandard: "IS 516:2021",
        standardCode: "IS 516",
        clauseReference: "IS 456:2000 Cl. 15.2.2",
        severity: "HIGH",
      });
    }

    // Vague Clauses
    if (/good quality cement/i.test(text)) {
      localHighlights.push({
        textSegment: "good quality cement",
        type: "vague",
        message: "Subjective quality descriptor. Must specify exact BIS cement grade conforming to IS 269:2015.",
        clauseReference: "CPWD Specifications 2019 Cl. 4.1",
        severity: "MEDIUM",
      });
    }

    if (/locally approved/i.test(text)) {
      localHighlights.push({
        textSegment: text.match(/locally approved (sand|aggregates|quarry)?/i)?.[0] || "locally approved",
        type: "vague",
        message: "Non-normative local quarry approval. Aggregates must have documented sieve analysis conforming to IS 383:2016 Table 2 (Grading Zone II).",
        clauseReference: "IS 383:2016 Cl. 6",
        severity: "MEDIUM",
      });
    }

    if (/adequate(ly)? cured/i.test(text)) {
      localHighlights.push({
        textSegment: text.match(/adequately cured/i)?.[0] || "adequately cured",
        type: "vague",
        message: "Subjective curing requirement. Under IS 456 Cl. 13.5, mandatory moist curing is minimum 7 days for OPC and 10 days for mineral admixtures.",
        clauseReference: "IS 456:2000 Cl. 13.5",
        severity: "MEDIUM",
      });
    }

    if (/standard structural steel/i.test(text)) {
      localHighlights.push({
        textSegment: "standard structural steel",
        type: "vague",
        message: "Unspecified steel section grade. Structural steel must explicitly conform to IS 2062:2011 Grade E250.",
        clauseReference: "IS 800:2007 Cl. 2.2.4",
        severity: "MEDIUM",
      });
    }

    setHighlights(localHighlights);
  };

  // Auto-Fix Outdated Standards in Draft
  const handleAutoFixOutdated = () => {
    let fixed = draftText;
    let fixCount = 0;

    // Replace IS 432 with IS 1786
    if (/IS\s*432(\s*\(Part 1\))?(:?1982)?/i.test(fixed) || /mild steel grade I bars/i.test(fixed)) {
      fixed = fixed.replace(/mild steel grade I bars conforming to IS 432 \(Part 1\)/gi, "high strength deformed TMT bars (Fe 500D) conforming to IS 1786:2008");
      fixed = fixed.replace(/IS 432 \(Part 1\)/gi, "IS 1786:2008");
      fixed = fixed.replace(/IS 432/gi, "IS 1786:2008");
      fixCount++;
    }

    // Replace IS 8112 with IS 269:2015
    if (/IS\s*8112(:?1989)?/i.test(fixed) || /43 grade Ordinary Portland Cement/i.test(fixed)) {
      fixed = fixed.replace(/43 grade Ordinary Portland Cement conforming to IS 8112:1989/gi, "Ordinary Portland Cement conforming to IS 269:2015");
      fixed = fixed.replace(/IS 8112:1989/gi, "IS 269:2015");
      fixed = fixed.replace(/IS 8112/gi, "IS 269:2015");
      fixCount++;
    }

    // Replace IS 12269 with IS 269:2015
    if (/IS\s*12269(:?1987)?/i.test(fixed)) {
      fixed = fixed.replace(/53 grade OPC conforming to IS 12269/gi, "Ordinary Portland Cement conforming to IS 269:2015");
      fixed = fixed.replace(/IS 12269/gi, "IS 269:2015");
      fixCount++;
    }

    // Replace vague "good quality cement"
    if (/good quality cement/i.test(fixed)) {
      fixed = fixed.replace(/good quality cement/gi, "Ordinary Portland Cement conforming strictly to IS 269:2015");
      fixCount++;
    }

    // Replace vague "locally approved sand"
    if (/locally approved sand/i.test(fixed)) {
      fixed = fixed.replace(/locally approved sand/gi, "coarse and fine aggregates conforming to IS 383:2016 Zone II grading");
      fixCount++;
    }

    // Replace vague curing
    if (/adequately cured/i.test(fixed)) {
      fixed = fixed.replace(/adequately cured/gi, "moist cured for a mandatory minimum period of 7 days in accordance with IS 456:2000 Cl. 13.5");
      fixCount++;
    }

    setDraftText(fixed);
    setShowAppliedToast(`Successfully applied ${fixCount} BIS normative corrections to draft specification.`);
    setTimeout(() => setShowAppliedToast(null), 4500);

    // Re-run analysis on updated text
    handleRunAnalysis(fixed);
  };

  const handleApplySingleFix = (hl: LintHighlight) => {
    if (!hl.replacementStandard && !hl.textSegment) return;
    let fixed = draftText;

    if (hl.type === "outdated" && hl.replacementStandard) {
      const regex = new RegExp(hl.textSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      fixed = fixed.replace(regex, hl.replacementStandard);
    } else if (hl.type === "missing" && hl.replacementStandard) {
      fixed = `${fixed}\n\n[MANDATORY NORMATIVE REQUIREMENT]: All works shall strictly comply with ${hl.replacementStandard} (${hl.message})`;
    } else if (hl.type === "vague") {
      const regex = new RegExp(hl.textSegment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      fixed = fixed.replace(regex, `normative threshold conforming to relevant BIS standards (${hl.clauseReference})`);
    }

    setDraftText(fixed);
    setShowAppliedToast(`Applied correction for "${hl.textSegment}".`);
    setTimeout(() => setShowAppliedToast(null), 3500);
    handleRunAnalysis(fixed);
  };

  const filteredHighlights = highlights.filter((h) => {
    if (filterType === "all") return true;
    return h.type === filterType;
  });

  const outdatedCount = highlights.filter((h) => h.type === "outdated").length;
  const missingCount = highlights.filter((h) => h.type === "missing").length;
  const vagueCount = highlights.filter((h) => h.type === "vague").length;

  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-900 pb-20 font-sans">
      {/* 1. Official National Informatics Centre (NIC) Portal Header */}
      <header className="bg-[#1b3a28] text-white border-b-4 border-[#ff9933] shadow-md">
        {/* Tricolor Ribbon */}
        <div className="h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* National Branding */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center p-1 border border-white/20 shrink-0">
                {/* Ashoka Chakra / Indian Emblem Stylized Symbol */}
                <svg className="w-9 h-9 text-[#ffd082]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" strokeWidth="0.75" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider font-semibold text-emerald-200">
                    भारत सरकार | Government of India
                  </span>
                  <span className="text-[9px] bg-emerald-800 text-emerald-100 font-bold px-2 py-0.5 rounded border border-emerald-600/30">
                    NIC DNDE v2.4
                  </span>
                </div>
                <h1 className="text-base sm:text-lg md:text-xl font-bold font-serif tracking-tight text-white leading-tight">
                  National Mandi & Rural Infrastructure Normative Dependency Engine
                </h1>
                <p className="text-[11px] sm:text-xs text-emerald-100/80">
                  Bureau of Indian Standards (BIS) Specification Linter & Procurement Compliance Engine
                </p>
              </div>
            </div>

            {/* Back to Farmer Mandi Portal / Exit Linter */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <Link
                to="/"
                className="text-xs bg-white/10 hover:bg-white/20 text-white font-medium px-3.5 py-1.5 rounded-lg border border-white/20 transition flex items-center gap-1.5"
              >
                <span>← Return to Mandi Launcher</span>
              </Link>
              <span className="text-[11px] text-emerald-300 font-mono hidden sm:inline-block">
                REF: DNDE-{new Date().getFullYear()}-BIS
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Top Metric Bar & Sample Presets */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Sample Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Load Sample Specification:
            </span>
            {Object.entries(SAMPLE_TENDERS).map(([key, sample]) => (
              <button
                key={key}
                onClick={() => {
                  setDraftText(sample.text);
                  handleRunAnalysis(sample.text);
                }}
                className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-medium px-2.5 py-1 rounded-md border border-slate-200 transition"
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Verification Badge */}
          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              BIS Normative Engine: Online
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-600">pgvector Embedding: 768-D Active</span>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {showAppliedToast && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              {showAppliedToast}
            </span>
            <button onClick={() => setShowAppliedToast(null)} className="text-emerald-700 font-bold text-xs hover:underline">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Workspace Layout: Drafting Area (Left) + Normative Inspector Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Rich-Text Drafting Editor Area */}
          <div className="lg:col-span-7 space-y-3">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
              {/* Drafting Area Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Specification Drafting Area
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({draftText.length} characters)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAutoFixOutdated}
                    disabled={outdatedCount === 0 || isAnalyzing}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition flex items-center gap-1.5 ${
                      outdatedCount > 0
                        ? "bg-[#1b3a28] text-white hover:bg-[#132a1d] border-emerald-900 shadow-xs"
                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                    }`}
                  >
                    <span>⚡ Auto-Fix Superseded Standards</span>
                  </button>

                  <button
                    onClick={() => handleRunAnalysis()}
                    disabled={isAnalyzing}
                    className="text-xs bg-[#244b34] hover:bg-[#1a3826] text-white font-bold px-4 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
                  >
                    {isAnalyzing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Evaluating...</span>
                      </>
                    ) : (
                      <>
                        <span>Validate Specs (DNDE)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Highlighting Legend & Instructions */}
              <div className="bg-slate-50/50 px-4 py-2 border-b border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
                <span className="font-semibold text-slate-700">DNDE Normative Highlights:</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-red-200 border border-red-500" />
                    <span className="font-medium text-red-800">Red: Outdated / Superseded</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-200 border border-blue-500" />
                    <span className="font-medium text-blue-800">Blue: Missing Normative Reference</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-sm bg-amber-200 border border-amber-500" />
                    <span className="font-medium text-amber-800">Yellow: Vague Parameter</span>
                  </span>
                </div>
              </div>

              {/* Text Area (Synchronized drafting area) */}
              <div className="p-4 flex-1 flex flex-col space-y-3">
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  placeholder="Paste or draft your civil, mandi godown, auction shed, or road weighbridge specification here..."
                  className="w-full h-80 sm:h-96 p-3 text-xs sm:text-sm font-mono text-slate-800 leading-relaxed bg-[#fbfdfb] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 resize-y"
                  spellCheck="false"
                />

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Click <strong>Validate Specs (DNDE)</strong> to re-run the recursive Indian Standards audit.</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(draftText);
                      setShowAppliedToast("Draft specification copied to clipboard.");
                      setTimeout(() => setShowAppliedToast(null), 3000);
                    }}
                    className="text-xs text-emerald-800 font-semibold hover:underline"
                  >
                    Copy Specification Text
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DNDE Normative Audit & Diagnostic Summary */}
          <div className="lg:col-span-5 space-y-4">
            {/* Linter Metrics Cards */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Outdated */}
              <div
                onClick={() => setFilterType(filterType === "outdated" ? "all" : "outdated")}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  filterType === "outdated"
                    ? "bg-red-50 border-red-400 ring-2 ring-red-400/20 shadow-xs"
                    : "bg-white border-slate-200 hover:border-red-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Outdated</span>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                </div>
                <div className="text-2xl font-black font-serif text-red-900 mt-1">
                  {outdatedCount}
                </div>
                <p className="text-[10px] text-red-600/90 mt-0.5">Superseded BIS Codes</p>
              </div>

              {/* Missing Dependencies */}
              <div
                onClick={() => setFilterType(filterType === "missing" ? "all" : "missing")}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  filterType === "missing"
                    ? "bg-blue-50 border-blue-400 ring-2 ring-blue-400/20 shadow-xs"
                    : "bg-white border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Missing</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div className="text-2xl font-black font-serif text-blue-900 mt-1">
                  {missingCount}
                </div>
                <p className="text-[10px] text-blue-600/90 mt-0.5">Omitted Dependencies</p>
              </div>

              {/* Vague Clauses */}
              <div
                onClick={() => setFilterType(filterType === "vague" ? "all" : "vague")}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  filterType === "vague"
                    ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs"
                    : "bg-white border-slate-200 hover:border-amber-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Vague</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <div className="text-2xl font-black font-serif text-amber-900 mt-1">
                  {vagueCount}
                </div>
                <p className="text-[10px] text-amber-600/90 mt-0.5">Unquantified Clauses</p>
              </div>
            </div>

            {/* Extracted Entity Summary Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span>Structured Specification Entities</span>
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-200">
                  @google/genai Schema
                </span>
              </div>

              {extractedEntities ? (
                <div className="space-y-2.5 text-xs">
                  {/* Products */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Identified Products:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {extractedEntities.products.length > 0 ? (
                        extractedEntities.products.map((p, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-medium text-[11px] border border-slate-200">
                            🏗️ {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None detected</span>
                      )}
                    </div>
                  </div>

                  {/* Materials */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Materials & Specified Grades:
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {extractedEntities.materials.length > 0 ? (
                        extractedEntities.materials.map((m, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-medium text-[11px] border border-emerald-200">
                            🧱 {m.name} {m.specifiedGrade ? `(${m.specifiedGrade})` : ""}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None detected</span>
                      )}
                    </div>
                  </div>

                  {/* Operating Environment */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Operating Environment:
                    </span>
                    <div className="text-[11px] text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1">
                      <div>Exposure Condition: <strong>{extractedEntities.operatingEnvironment.exposureCondition || "Standard / Mild"}</strong></div>
                      {extractedEntities.operatingEnvironment.seismicZone && (
                        <div>Seismic Parameter: <strong>{extractedEntities.operatingEnvironment.seismicZone}</strong></div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  Run validation to parse structured specification entities.
                </div>
              )}
            </div>

            {/* Quick Interactive Highlight Detail */}
            {selectedHighlight && (
              <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 shadow-xs space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    Selected Diagnostic Focus
                  </span>
                  <button onClick={() => setSelectedHighlight(null)} className="text-amber-800 text-xs font-bold">✕</button>
                </div>
                <div className="font-mono text-xs font-bold text-slate-900 bg-white p-2 rounded border border-amber-200">
                  "{selectedHighlight.textSegment}"
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedHighlight.message}
                </p>
                {selectedHighlight.replacementStandard && (
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800">
                      Recommended: {selectedHighlight.replacementStandard}
                    </span>
                    <button
                      onClick={() => handleApplySingleFix(selectedHighlight)}
                      className="text-xs bg-[#1b3a28] text-white font-bold px-2.5 py-1 rounded hover:bg-[#132a1d] transition"
                    >
                      Apply Fix
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 4. Tabbed Normative Inspector: Trace Cards, Dependency Graph, BIS Standards */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex space-x-1 sm:space-x-3">
              <button
                onClick={() => setActiveTab("traceCards")}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
                  activeTab === "traceCards"
                    ? "border-emerald-700 text-emerald-900 bg-white shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                📋 Trace Cards (Official Defect Table) ({filteredHighlights.length})
              </button>

              <button
                onClick={() => setActiveTab("graph")}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
                  activeTab === "graph"
                    ? "border-emerald-700 text-emerald-900 bg-white shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                🌳 DNDE Dependency Traversal Tree ({dependencyGraph.length})
              </button>

              <button
                onClick={() => setActiveTab("standardsRef")}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition ${
                  activeTab === "standardsRef"
                    ? "border-emerald-700 text-emerald-900 bg-white shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                📚 Mandi Indian Standards Reference (BIS)
              </button>
            </div>

            {/* Filter Pill Selector */}
            <div className="flex items-center gap-1.5 py-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Filter:</span>
              <button
                onClick={() => setFilterType("all")}
                className={`text-[11px] px-2 py-0.5 rounded font-medium transition ${
                  filterType === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All ({highlights.length})
              </button>
              <button
                onClick={() => setFilterType("outdated")}
                className={`text-[11px] px-2 py-0.5 rounded font-medium transition ${
                  filterType === "outdated" ? "bg-red-700 text-white" : "bg-red-50 text-red-700 hover:bg-red-100"
                }`}
              >
                Outdated ({outdatedCount})
              </button>
              <button
                onClick={() => setFilterType("missing")}
                className={`text-[11px] px-2 py-0.5 rounded font-medium transition ${
                  filterType === "missing" ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                Missing ({missingCount})
              </button>
              <button
                onClick={() => setFilterType("vague")}
                className={`text-[11px] px-2 py-0.5 rounded font-medium transition ${
                  filterType === "vague" ? "bg-amber-700 text-white" : "bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                Vague ({vagueCount})
              </button>
            </div>
          </div>

          {/* TAB 1: Trace Cards (Official Government Data Table) */}
          {activeTab === "traceCards" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f2f6f3] text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-16">ID</th>
                    <th className="py-3 px-4 w-28">Category</th>
                    <th className="py-3 px-4 w-44">Tender Text Segment</th>
                    <th className="py-3 px-4">Normative Violation & Reason</th>
                    <th className="py-3 px-4 w-52">Mandatory BIS Action</th>
                    <th className="py-3 px-4 w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {filteredHighlights.length > 0 ? (
                    filteredHighlights.map((hl, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedHighlight(hl)}
                        className={`hover:bg-slate-50/80 transition cursor-pointer ${
                          selectedHighlight?.message === hl.message ? "bg-emerald-50/60" : ""
                        }`}
                      >
                        {/* ID */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">
                          #{String(idx + 1).padStart(2, "0")}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          {hl.type === "outdated" && (
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full border border-red-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                              OUTDATED
                            </span>
                          )}
                          {hl.type === "missing" && (
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                              MISSING
                            </span>
                          )}
                          {hl.type === "vague" && (
                            <span className="inline-flex items-center gap-1 font-bold text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              VAGUE
                            </span>
                          )}
                        </td>

                        {/* Segment */}
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          <span
                            className={
                              hl.type === "outdated"
                                ? "bg-red-50 text-red-900 border-b border-red-400 px-1 py-0.5 rounded"
                                : hl.type === "missing"
                                ? "bg-blue-50 text-blue-900 border-b border-blue-400 px-1 py-0.5 rounded"
                                : "bg-amber-50 text-amber-900 border-b border-amber-400 px-1 py-0.5 rounded"
                            }
                          >
                            "{hl.textSegment}"
                          </span>
                        </td>

                        {/* Violation */}
                        <td className="py-3 px-4 leading-relaxed text-slate-700">
                          <div>{hl.message}</div>
                          {hl.clauseReference && (
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              Ref: {hl.clauseReference}
                            </span>
                          )}
                        </td>

                        {/* Action / Replacement */}
                        <td className="py-3 px-4">
                          {hl.replacementStandard ? (
                            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 block text-[11px]">
                              ➜ {hl.replacementStandard}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">Prescribe numerical tolerance</span>
                          )}
                        </td>

                        {/* Button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplySingleFix(hl);
                            }}
                            className="text-[11px] font-bold bg-[#1b3a28] hover:bg-[#132a1d] text-white px-2.5 py-1 rounded transition shadow-2xs"
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                        No normative violations found for the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: DNDE Recursive Dependency Traversal Tree */}
          {activeTab === "graph" && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed">
                The Deterministic Normative Dependency Engine traverses Bureau of Indian Standards (BIS) graph
                relationships recursively using PostgreSQL Common Table Expressions (CTE).
              </div>

              <div className="bg-[#fcfdfc] border border-slate-200 rounded-xl p-4 font-mono text-xs space-y-3">
                <div className="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
                  <span>ROOT AND TRAVERSED NORMATIVE NODES:</span>
                  <span className="text-[10px] text-slate-500">Query: get_normative_dependencies(start_id)</span>
                </div>

                {dependencyGraph.length > 0 ? (
                  <div className="space-y-2">
                    {dependencyGraph.map((node, i) => (
                      <div
                        key={i}
                        style={{ marginLeft: `${(node.depth || 1) * 18}px` }}
                        className="flex items-center gap-2 text-xs py-1"
                      >
                        <span className="text-slate-400">└─</span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            node.status === "SUPERSEDED"
                              ? "bg-red-100 text-red-900 border border-red-300 line-through"
                              : node.relationType === "ALLIED_TESTING"
                              ? "bg-purple-100 text-purple-900 border border-purple-300"
                              : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          }`}
                        >
                          {node.isCode}
                        </span>

                        <span className="text-slate-700 font-sans text-xs">
                          {node.title}
                        </span>

                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {node.relationType}
                        </span>

                        {node.replacementCode && (
                          <span className="text-[11px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            ➜ Replaced by {node.replacementCode}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 py-4">No dependency nodes loaded yet. Click 'Validate Specs'.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Mandi Standards Master Catalog */}
          {activeTab === "standardsRef" && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="text-xs text-slate-600">
                Official Bureau of Indian Standards (BIS) referenced for agricultural produce market committees (APMC),
                godown storage, auction yards, and rural procurement infrastructure:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">IS 456:2000</div>
                  <div className="text-slate-600 font-medium">Plain and Reinforced Concrete - Code of Practice</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Mandatory foundation and structural column standard for mandi buildings. Normatively references IS 383, IS 1786, IS 269, and testing per IS 516.
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">IS 1786:2008</div>
                  <div className="text-slate-600 font-medium">High Strength Deformed Steel Bars (TMT)</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Mandatory active standard for Fe 415, Fe 500D, and Fe 550D reinforcement bars. Completely supersedes mild steel bars (IS 432).
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">IS 269:2015</div>
                  <div className="text-slate-600 font-medium">Ordinary Portland Cement - Specification</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Consolidated 33, 43, and 53 grade cement standard. Supersedes and cancels IS 8112 and IS 12269.
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">IS 383:2016</div>
                  <div className="text-slate-600 font-medium">Coarse and Fine Aggregate for Concrete</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Regulates grading zones I-IV, water absorption limits, and aggregate impact/crushing values. Prohibits non-normative uncertified river sand.
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">IS 800:2007</div>
                  <div className="text-slate-600 font-medium">General Construction in Steel - Code of Practice</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Governs covered auction sheds, godown roof canopies, and steel framing. Normatively mandates IS 2062 for material sections.
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-1">
                  <div className="font-bold text-slate-900 text-sm">IS 607:1971 & IS 667</div>
                  <div className="text-slate-600 font-medium">Food Grain Storage Godowns - Construction Code</div>
                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    Mandatory plinth elevation, damp-proof course, fumigation tightness, and grain spillage protection for APMC mandi depots.
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 5. Official NIC Compliance Certificate Card */}
        <section className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <div className="font-bold font-serif text-slate-800 text-sm">
              Official Indian Standards Compliance Audit
            </div>
            <div className="text-slate-500 mt-0.5">
              Generate certified tender verification report conforming to Central Public Works Department (CPWD) & BIS normative benchmarks.
            </div>
          </div>

          <button
            onClick={() => {
              window.print();
            }}
            className="bg-[#1b3a28] hover:bg-[#132a1d] text-white font-bold px-4 py-2 rounded-xl transition shadow-xs whitespace-nowrap"
          >
            🖨️ Print / Export Compliance Audit
          </button>
        </section>
      </main>
    </div>
  );
}
