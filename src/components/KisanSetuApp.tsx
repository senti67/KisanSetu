import React, { useState, useEffect, useMemo } from "react";
import { TRANSLATIONS } from "@/data/translations";
import { INITIAL_CENTRES, MSP_RATES } from "@/data/centres";
import kisanSetuCircle from "@/assets/kisansetu-circle.png";
import { IvrPhoneModal } from "./IvrPhoneModal";
import {
  getProcurementCenters,
  createProcurementBooking,
  cancelBooking as apiCancelBooking,
  getBooking,
  getAllBookings,
  updateBookingStatus,
  type ProcurementCenter,
  type BookingToken,
} from "@/lib/procurementApi";

const Icon = ({ name, className = "w-4 h-4" }: { name: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />,
    "map-pin": (
      <g>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </g>
    ),
    ticket: (
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    ),
    calculator: (
      <g>
        <rect width="16" height="20" x="4" y="2" rx="2" />
        <line x1="8" x2="16" y1="6" y2="6" />
        <line x1="16" x2="16" y1="14" y2="18" />
        <path d="M16 10h.01" />
        <path d="M12 10h.01" />
        <path d="M8 10h.01" />
        <path d="M12 14h.01" />
        <path d="M8 14h.01" />
        <path d="M12 18h.01" />
        <path d="M8 18h.01" />
      </g>
    ),
    "help-circle": (
      <g>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </g>
    ),
    shield: (
      <g>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </g>
    ),
    "log-out": (
      <g>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </g>
    ),
    "log-in": (
      <g>
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" x2="3" y1="12" y2="12" />
      </g>
    ),
    refresh: (
      <g>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </g>
    ),
    "phone-call": (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    search: (
      <g>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </g>
    ),
    mic: (
      <g>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </g>
    ),
    printer: (
      <g>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect width="12" height="8" x="6" y="14" />
        <path d="M6 9V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v5" />
      </g>
    ),
    droplet: (
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    copy: (
      <g>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </g>
    ),
    navigation: <polygon points="3 11 22 2 13 21 11 13 3 11" />,
    "file-text": (
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />
    ),
    "arrow-right": <path d="M5 12h14 M12 5l7 7-7 7" />,
    clock: (
      <g>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </g>
    ),
    "check-circle": (
      <g>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </g>
    ),
    info: (
      <g>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" x2="12" y1="16" y2="12" />
        <line x1="12" x2="12.01" y1="8" y2="8" />
      </g>
    ),
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};

const SVGBarcode = ({ value }: { value: string }) => {
  const bars = useMemo(() => {
    const pattern = [1, 0, 1, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1];
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      pattern.push(charCode % 2, 1, charCode % 3 > 0 ? 1 : 0, 0);
    }
    pattern.push(1, 0, 1, 1, 0, 1);
    return pattern;
  }, [value]);

  return (
    <svg viewBox="0 0 160 40" className="w-full h-9 bg-white p-1 rounded border border-[#c2a68c]">
      <g fill="#1f2421">
        {bars.map((bit, idx) =>
          bit ? <rect key={idx} x={idx * 3 + 4} y="4" width="2" height="32" /> : null
        )}
      </g>
    </svg>
  );
};

export default function KisanSetuApp() {
  const [lang, setLangState] = useState<string>("hi");
  const [activeTab, setActiveTab] = useState<string>("home");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [sortBy, setSortBy] = useState("distance");

  // Procurement Centres State
  const [centresData, setCentresData] = useState<ProcurementCenter[]>(INITIAL_CENTRES);
  const [isLoadingCentres, setIsLoadingCentres] = useState<boolean>(false);
  const [centresError, setCentresError] = useState<string | null>(null);

  // Active Token / Booking State (Null until user books a pass)
  const [activeToken, setActiveToken] = useState<BookingToken | null>(null);

  // Admin / Mandi Officer State
  const [isOfficerLoggedIn, setIsOfficerLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem("kisansetu_officer_logged") === "true";
  });
  const [officerLoginModal, setOfficerLoginModal] = useState<boolean>(false);
  const [officerIdInput, setOfficerIdInput] = useState<string>("");
  const [officerPinInput, setOfficerPinInput] = useState<string>("");
  const [officerLoginError, setOfficerLoginError] = useState<string | null>(null);

  // Admin Bookings List & Filter State
  const [adminBookings, setAdminBookings] = useState<BookingToken[]>([]);
  const [isLoadingAdminBookings, setIsLoadingAdminBookings] = useState<boolean>(false);
  const [adminSearch, setAdminSearch] = useState<string>("");
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>("All");
  const [verifyTokenInput, setVerifyTokenInput] = useState<string>("");
  const [verifiedTokenResult, setVerifiedTokenResult] = useState<BookingToken | null>(null);

  // Cancellation / Rejection Reason Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState<boolean>(false);
  const [rejectTargetTokenId, setRejectTargetTokenId] = useState<string | null>(null);
  const [rejectSelectedReason, setRejectSelectedReason] = useState<string>("High Moisture Content (>17.0% limit)");
  const [rejectCustomNotes, setRejectCustomNotes] = useState<string>("");

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCentreForBooking, setSelectedCentreForBooking] = useState<ProcurementCenter | null>(null);
  const [bookingStep, setBookingStep] = useState(1);
  const [modalMandiSearch, setModalMandiSearch] = useState<string>("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Booking Form Fields
  const [formName, setFormName] = useState("");
  const [formMobile, setFormMobile] = useState("");
  const [formAadhaar, setFormAadhaar] = useState("");
  const [formCrop, setFormCrop] = useState("Paddy (Grade A)");
  const [formQuantity, setFormQuantity] = useState("50");
  const [formDate, setFormDate] = useState("2026-08-27");
  const [formSlot, setFormSlot] = useState("08:00 AM - 10:00 AM");

  // UI helpers
  const [isListening, setIsListening] = useState(false);
  const [copiedNotify, setCopiedNotify] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showIvrModal, setShowIvrModal] = useState<boolean>(false);

  // Calculator & Moisture Tester
  const [calcCrop, setCalcCrop] = useState(MSP_RATES[0]);
  const [calcQuantity, setCalcQuantity] = useState(60);
  const [inputMoisture, setInputMoisture] = useState<string>("16.5");
  const [moistureLastTestedAt, setMoistureLastTestedAt] = useState<string | null>("Today, 09:30 AM");
  const [showMoistureGuide, setShowMoistureGuide] = useState<boolean>(false);

  // GPS Location Finder State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatusMsg, setLocationStatusMsg] = useState<string | null>(null);

  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatusMsg("Geolocation is not supported by your device browser.");
      return;
    }
    setIsLocating(true);
    setLocationStatusMsg("Detecting your live GPS location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserCoords(coords);
        setIsLocating(false);
        setSortBy("distance");
        setLocationStatusMsg(
          `📍 Live GPS Active: ${coords.lat.toFixed(3)}°N, ${coords.lng.toFixed(3)}°E (Mandis sorted by nearest distance)`
        );
      },
      (err) => {
        console.warn("Location error:", err);
        setIsLocating(false);
        if (err.code === 1) {
          setLocationStatusMsg("Location permission was denied. Please allow location in your browser bar.");
        } else {
          setLocationStatusMsg("Could not fetch GPS location. Showing default distances.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const setLang = (newLang: string) => {
    setLangState(newLang);
    localStorage.setItem("kisansetu_lang", newLang);
    window.dispatchEvent(new CustomEvent("kisansetu_lang_change", { detail: newLang }));
  };

  // Sync language with localStorage & external events
  useEffect(() => {
    const saved = localStorage.getItem("kisansetu_lang");
    if (saved && (saved === "hi" || saved === "or" || saved === "mr" || saved === "en" || saved === "pa")) {
      setLangState(saved);
    }

    const handleExternalLang = (e: any) => {
      if (e.detail && (e.detail === "hi" || e.detail === "or" || e.detail === "mr" || e.detail === "en" || e.detail === "pa")) {
        setLangState(e.detail);
      }
    };

    window.addEventListener("kisansetu_lang_change", handleExternalLang);
    return () => window.removeEventListener("kisansetu_lang_change", handleExternalLang);
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.hi || TRANSLATIONS.en;

  // Load procurement centres & initial active booking
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCentres(true);
    setCentresError(null);

    getProcurementCenters()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCentresData(data);
        }
      })
      .catch((err) => {
        console.warn("Could not load procurement centres from API:", err);
        if (isMounted) {
          setCentresError(err.message || "Failed to load live mandi data");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingCentres(false);
      });

    // Load latest active bookings dynamically from registry
    // Load latest active bookings dynamically from registry for Admin
    getAllBookings()
      .then((bookings) => {
        if (isMounted && Array.isArray(bookings) && bookings.length > 0) {
          setAdminBookings(bookings);
        }
      })
      .catch(() => {});

    // Restore user's personal pass only if they previously booked one
    const savedUserTokenId = typeof window !== "undefined" ? localStorage.getItem("kisansetu_user_token_id") : null;
    if (savedUserTokenId) {
      getBooking(savedUserTokenId)
        .then((b) => {
          if (isMounted && b && b.status !== "Cancelled") {
            setActiveToken(b);
          } else if (isMounted) {
            localStorage.removeItem("kisansetu_user_token_id");
            setActiveToken(null);
          }
        })
        .catch(() => {
          if (isMounted) {
            localStorage.removeItem("kisansetu_user_token_id");
            setActiveToken(null);
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch all bookings for Admin
  const refreshAdminBookings = () => {
    setIsLoadingAdminBookings(true);
    getAllBookings()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAdminBookings(data);
          const savedTokenId = typeof window !== "undefined" ? localStorage.getItem("kisansetu_user_token_id") : null;
          if (savedTokenId) {
            const userPass = data.find((b) => b.tokenId === savedTokenId && b.status !== "Cancelled");
            if (userPass) setActiveToken(userPass);
          }
        }
      })
      .catch((err) => console.warn("Failed to load admin bookings:", err))
      .finally(() => setIsLoadingAdminBookings(false));
  };

  useEffect(() => {
    if (activeTab === "admin" || activeTab === "my-booking") {
      refreshAdminBookings();
    }
  }, [activeTab]);

  const handleOfficerLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!officerIdInput.trim()) {
      setOfficerLoginError("Officer ID is required");
      return;
    }
    setIsOfficerLoggedIn(true);
    sessionStorage.setItem("kisansetu_officer_logged", "true");
    setOfficerLoginModal(false);
    setActiveTab("admin");
    refreshAdminBookings();
  };

  const handleOfficerLogout = () => {
    setIsOfficerLoggedIn(false);
    sessionStorage.removeItem("kisansetu_officer_logged");
    setActiveTab("home");
  };

  const handleUpdateStatus = async (
    tokenId: string,
    newStatus: BookingToken["status"],
    reason?: string
  ) => {
    try {
      await updateBookingStatus(tokenId, newStatus, reason);
      setAdminBookings((prev) =>
        prev.map((b) =>
          b.tokenId === tokenId ? { ...b, status: newStatus, cancellationReason: reason } : b
        )
      );
      if (verifiedTokenResult && verifiedTokenResult.tokenId === tokenId) {
        setVerifiedTokenResult({
          ...verifiedTokenResult,
          status: newStatus,
          cancellationReason: reason,
        });
      }
      if (activeToken && activeToken.tokenId === tokenId) {
        setActiveToken({ ...activeToken, status: newStatus, cancellationReason: reason });
      }
    } catch (err: any) {
      alert("Failed to update status: " + (err.message || "Network error"));
    }
  };

  const handlePromptReject = (tokenId: string) => {
    setRejectTargetTokenId(tokenId);
    setRejectSelectedReason("High Moisture Content (>17.0% limit)");
    setRejectCustomNotes("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectTargetTokenId) return;
    const finalReason = rejectCustomNotes.trim()
      ? `${rejectSelectedReason} — ${rejectCustomNotes.trim()}`
      : rejectSelectedReason;
    await handleUpdateStatus(rejectTargetTokenId, "Cancelled", finalReason);
    setRejectModalOpen(false);
    setRejectTargetTokenId(null);
  };

  const handleVerifySearch = () => {
    if (!verifyTokenInput.trim()) return;
    const found = adminBookings.find(
      (b) =>
        b.tokenId.toLowerCase() === verifyTokenInput.trim().toLowerCase() ||
        b.mobile.includes(verifyTokenInput.trim())
    );
    if (found) {
      setVerifiedTokenResult(found);
    } else {
      getBooking(verifyTokenInput.trim())
        .then((b) => setVerifiedTokenResult(b))
        .catch(() => alert("Token not found in live registry: " + verifyTokenInput));
    }
  };

  const filteredCentres = useMemo(() => {
    const listWithDistances = centresData.map((c) => {
      const displayDistance =
        userCoords && c.lat && c.lng
          ? calculateDistanceKm(userCoords.lat, userCoords.lng, c.lat, c.lng)
          : c.distance;
      return {
        ...c,
        displayDistance,
      };
    });

    const result = listWithDistances.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        c.name.toLowerCase().includes(q) ||
        c.district.toLowerCase().includes(q) ||
        c.tehsil.toLowerCase().includes(q);

      const matchCrop =
        selectedCrop === "All" ||
        c.crops.some((cr) => cr.toLowerCase().includes(selectedCrop.toLowerCase()));
      return matchSearch && matchCrop;
    });

    return result.sort((a, b) => {
      if (sortBy === "distance") return a.displayDistance - b.displayDistance;
      if (sortBy === "slots") return b.availableSlots - a.availableSlots;
      if (sortBy === "wait") return parseInt(a.waitTime, 10) - parseInt(b.waitTime, 10);
      return 0;
    });
  }, [centresData, searchQuery, selectedCrop, sortBy, userCoords]);

  const filteredAdminBookings = useMemo(() => {
    return adminBookings.filter((b) => {
      const q = adminSearch.toLowerCase().trim();
      const matchQuery =
        q === "" ||
        b.tokenId.toLowerCase().includes(q) ||
        b.farmerName.toLowerCase().includes(q) ||
        b.mobile.includes(q) ||
        b.centreName.toLowerCase().includes(q) ||
        b.crop.toLowerCase().includes(q);

      const matchStatus = adminStatusFilter === "All" || b.status === adminStatusFilter;
      return matchQuery && matchStatus;
    });
  }, [adminBookings, adminSearch, adminStatusFilter]);

  const adminStats = useMemo(() => {
    const totalBookings = adminBookings.length;
    const gateInCount = adminBookings.filter((b) => b.status === "Gate In").length;
    const totalQtl = adminBookings.reduce(
      (sum, b) => sum + (parseFloat(b.quantity) || 0),
      0
    );
    const totalPayout = adminBookings.reduce((sum, b) => {
      const cleaned = (b.estimatedPayout || "0").replace(/,/g, "");
      return sum + (parseFloat(cleaned) || 0);
    }, 0);

    return { totalBookings, gateInCount, totalQtl, totalPayout };
  }, [adminBookings]);

  const triggerVoiceSearch = () => {
    const windowWithSpeech = window as any;
    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang =
          lang === "hi"
            ? "hi-IN"
            : lang === "pa"
            ? "pa-IN"
            : lang === "mr"
            ? "mr-IN"
            : "en-US";
        recognition.interimResults = false;

        setIsListening(true);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSearchQuery(transcript.replace(/\.$/, ""));
          setIsListening(false);
          setActiveTab("centres");
        };

        recognition.onerror = () => {
          setIsListening(false);
          setSearchQuery("Karnal");
          setActiveTab("centres");
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } catch {
        setIsListening(false);
        setSearchQuery("Karnal");
        setActiveTab("centres");
      }
    } else {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setSearchQuery("Karnal");
        setActiveTab("centres");
      }, 1000);
    }
  };

  const handleOpenBooking = (centre: ProcurementCenter | null = null) => {
    if (activeToken && activeToken.status !== "Cancelled" && activeToken.status !== "Completed") {
      const confirmView = window.confirm(
        lang === "hi"
          ? `आपके पास पहले से सक्रिय टोकन ${activeToken.tokenId} (${activeToken.centreName}) मौजूद है। नया पास बुक करने के लिए कृपया पहले मौजूदा पास रद्द करें। क्या आप अपना पास देखना चाहते हैं?`
          : `You already hold active Gate Pass ${activeToken.tokenId} for ${activeToken.centreName}. Please cancel your existing pass before booking a new one. View your active pass now?`
      );
      if (confirmView) {
        setActiveTab("my-booking");
        return;
      }
    }

    const targetCentre = centre || centresData[0] || INITIAL_CENTRES[0];
    setSelectedCentreForBooking(targetCentre);
    setBookingStep(1);
    setModalMandiSearch("");
    setBookingError(null);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);
    setIsSubmittingBooking(true);

    try {
      const payload = {
        farmerName: formName.trim() || "Kisan",
        mobile: formMobile.trim() || "9876543210",
        aadhaar4: formAadhaar.trim() || "1234",
        centreId: selectedCentreForBooking?.id || "c1",
        centreName: selectedCentreForBooking?.name || "Karnal Main Grain Mandi (Gate 2)",
        district: selectedCentreForBooking?.district || "Karnal",
        date: formDate,
        slot: formSlot,
        crop: formCrop,
        quantity: formQuantity || "50",
      };

      const createdToken = await createProcurementBooking(payload);
      setActiveToken(createdToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("kisansetu_user_token_id", createdToken.tokenId);
      }

      if (selectedCentreForBooking) {
        setCentresData((prev) =>
          prev.map((c) =>
            c.id === selectedCentreForBooking.id
              ? { ...c, availableSlots: Math.max(0, c.availableSlots - 1) }
              : c
          )
        );
      }

      setBookingModalOpen(false);
      setActiveTab("my-booking");
    } catch (err: any) {
      console.error("Booking error:", err);
      setBookingError(err.message || "Failed to issue pass. Please check your network and try again.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleCancelPass = async () => {
    if (!activeToken) return;
    const confirmCancel = window.confirm(
      lang === "hi"
        ? "क्या आप वाकई अपना गेट पास रद्द करना चाहते हैं?"
        : lang === "or"
        ? "ଆପଣ କଣ ପ୍ରକୃତରେ ନିଜ ଗେଟ୍ ପାସ୍ ବାତିଲ କରିବାକୁ ଚାହୁଁଛନ୍ତି?"
        : lang === "mr"
        ? "तुम्हाला आपला गेट पास रद्द करायचा आहे का?"
        : "Are you sure you want to cancel this gate pass?"
    );
    if (!confirmCancel) return;

    try {
      await apiCancelBooking(activeToken.tokenId);
    } catch (err) {
      console.warn("Cancel request error:", err);
    }

    getProcurementCenters().then((data) => {
      if (Array.isArray(data) && data.length > 0) setCentresData(data);
    });

    if (typeof window !== "undefined") {
      localStorage.removeItem("kisansetu_user_token_id");
    }
    setActiveToken(null);
  };

  const copyTokenToClipboard = () => {
    if (!activeToken) return;
    const text = `KisanSetu Gate Pass: ${activeToken.tokenId} | ${activeToken.centreName} | Date: ${activeToken.date} | Slot: ${activeToken.slot} | Payout: ₹${activeToken.estimatedPayout}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }

    setCopiedNotify(true);
    setTimeout(() => setCopiedNotify(false), 2000);
  };

  const shareOnWhatsApp = () => {
    if (!activeToken) return;
    const msg = `🌾 *KisanSetu Mandi E-Gate Pass*\n🎫 *Token:* ${activeToken.tokenId}\n👤 *Farmer:* ${activeToken.farmerName}\n🏢 *Mandi:* ${activeToken.centreName}\n⏱️ *Slot:* ${activeToken.slot} (${activeToken.date})\n🌾 *Crop:* ${activeToken.crop} (${activeToken.quantity} Qtl)\n💰 *Est. MSP Payout:* ₹${activeToken.estimatedPayout}\n✅ *Status:* ${activeToken.status}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const moistureAnalysis = useMemo(() => {
    const raw = (inputMoisture ?? "").toString().trim();
    if (!raw) {
      return {
        isValid: false,
        reading: 0,
        status: "EMPTY" as const,
        badge: "Enter Meter Reading",
        sub: t.moistureMeterHint || "Enter moisture % from your grain meter",
        actionHint: "Please enter a moisture value",
        color: "text-slate-700 bg-slate-100 border-slate-300",
        isPass: false,
        source: "manual_meter_input" as const,
        limit: 17.0,
      };
    }

    const val = parseFloat(raw);
    if (isNaN(val) || val < 0 || val > 50) {
      return {
        isValid: false,
        reading: 0,
        status: "INVALID" as const,
        badge: "Invalid Number",
        sub: "Please enter a valid percentage between 0.0% and 40.0%",
        actionHint: "Check grain moisture meter display",
        color: "text-red-900 bg-red-50 border-red-300",
        isPass: false,
        source: "manual_meter_input" as const,
        limit: 17.0,
      };
    }

    // EXACT THRESHOLD: 17.0% MUST PASS, >17.0% REQUIRES DRYING
    if (val <= 17.0) {
      return {
        isValid: true,
        reading: val,
        status: "PASS" as const,
        badge: `${t.passStatus || "PASS"} — 0% Deduction`,
        sub: `${t.passSub || "Within 17.0% limit • 0% deduction"} (${val.toFixed(1)}%)`,
        actionHint: `✓ ${t.passAction || "Proceed to procurement"}`,
        color: "text-emerald-900 bg-emerald-50 border-emerald-400",
        isPass: true,
        source: "manual_meter_input" as const,
        limit: 17.0,
      };
    } else {
      return {
        isValid: true,
        reading: val,
        status: "DRYING_REQUIRED" as const,
        badge: `${t.rejectStatus || "REJECTED"} — Sun Drying Required`,
        sub: `${t.rejectSub || "Exceeds 17.0% limit"} (${val.toFixed(1)}%)`,
        actionHint: `⚠️ ${t.rejectAction || "Dry the grain and test again"}`,
        color: "text-red-900 bg-red-50 border-red-400",
        isPass: false,
        source: "manual_meter_input" as const,
        limit: 17.0,
      };
    }
  }, [inputMoisture, t]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f0] text-[#1f2421]">
      {/* 1. CLEAN FARMER-FIRST HEADER */}
      <header className="bg-white border-b border-[#d8ccbe] sticky top-0 z-30 shadow-xs">
        <div className="w-full max-w-[96%] xl:max-w-[95%] 2xl:max-w-[1780px] mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-3">
          {/* Left: Branding & Prototype Badge */}
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0"
          >
            <img
              src={kisanSetuCircle}
              alt="KisanSetu Logo"
              className="w-10 h-10 sm:w-11 sm:h-11 object-contain shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg md:text-xl font-black font-serif text-slate-900 leading-tight">
                  {t.portalName}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {t.prototypeTag || "GovTech Prototype"}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {t.digitalMandiAccess || "Digital Mandi Access"}
              </p>
            </div>
          </div>

          {/* Right: Language Selector, Help & Subtle Officer Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 p-0.5 text-xs font-medium">
              {[
                { code: "hi", label: "हिन्दी" },
                { code: "or", label: "ଓଡ଼ିଆ" },
                { code: "mr", label: "मराठी" },
                { code: "en", label: "EN" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code as any)}
                  className={`px-2 py-1 rounded-md cursor-pointer font-bold transition text-xs ${
                    lang === item.code
                      ? "bg-[#4a7c59] text-white shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Help Button */}
            <button
              type="button"
              onClick={() => setActiveTab("help")}
              className="hidden sm:flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#4a7c59] px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#4a7c59]/40 bg-slate-50 hover:bg-[#ebf2ee] transition cursor-pointer"
            >
              <Icon name="help-circle" className="w-3.5 h-3.5 text-[#4a7c59]" />
              <span>{t.help}</span>
            </button>

            {/* Subtle Officer Login (does not compete with farmer actions) */}
            {isOfficerLoggedIn ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-md">
                <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0"></span>
                <span className="font-bold hidden sm:inline">Officer S. K. Verma</span>
                <button
                  type="button"
                  onClick={handleOfficerLogout}
                  className="text-red-600 hover:text-red-700 font-bold underline cursor-pointer text-xs ml-1"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setOfficerLoginModal(true)}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:underline cursor-pointer px-2 py-1 flex items-center gap-1 whitespace-nowrap"
                title="Mandi Officer Portal Login"
              >
                <Icon name="shield" className="w-3 h-3 text-slate-400" />
                <span>{t.officerPortalSubtle || "Officer Login"}</span>
              </button>
            )}

            {/* Desktop Gate Pass Button */}
            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="hidden lg:flex bg-[#4a7c59] hover:bg-[#3b6447] text-white px-3.5 py-2 rounded-lg text-xs font-bold items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Icon name="ticket" className="w-4 h-4 text-emerald-200" />
              <span>{t.bookSlotBtn}</span>
            </button>
          </div>
        </div>

        {/* Desktop Tabs Bar */}
        <div className="bg-slate-50 border-t border-slate-200 hidden md:block">
          <div className="w-full max-w-[96%] xl:max-w-[95%] 2xl:max-w-[1780px] mx-auto px-3 sm:px-6 flex space-x-1.5 overflow-x-auto text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "home"
                  ? "border-[#4a7c59] text-[#4a7c59] font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="home" className="w-4 h-4 text-[#4a7c59]" />
              <span>{t.home}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("centres")}
              className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "centres"
                  ? "border-[#4a7c59] text-[#4a7c59] font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="map-pin" className="w-4 h-4" />
              <span>{t.centres}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("my-booking")}
              className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "my-booking"
                  ? "border-[#4a7c59] text-[#4a7c59] font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="ticket" className="w-4 h-4" />
              <span>{t.myBooking}</span>
              {activeToken && (
                <span className="w-2 h-2 rounded-full bg-[#c86d12] animate-ping"></span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("msp-rates")}
              className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "msp-rates"
                  ? "border-[#4a7c59] text-[#4a7c59] font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="calculator" className="w-4 h-4" />
              <span>{t.mspRates}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("moisture")}
              className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "moisture"
                  ? "border-blue-600 text-blue-700 font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="droplet" className="w-4 h-4 text-blue-600" />
              <span>{t.moistureTab || "Moisture Check"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("help")}
              className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "help"
                  ? "border-[#4a7c59] text-[#4a7c59] font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="help-circle" className="w-4 h-4" />
              <span>{t.help}</span>
            </button>

            {/* Officer Tab: Visible ONLY after officer logs in */}
            {isOfficerLoggedIn && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`py-2.5 px-3.5 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "admin"
                    ? "border-purple-700 text-purple-800 font-bold bg-white"
                    : "border-transparent text-purple-700 hover:text-purple-900"
                }`}
              >
                <Icon name="shield" className="w-4 h-4 text-purple-700" />
                <span>Mandi Officer</span>
                {adminBookings.length > 0 && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] rounded-full font-bold">
                    {adminBookings.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. MAIN CONTENT CONTAINER */}
      <main className="w-full max-w-[96%] xl:max-w-[95%] 2xl:max-w-[1780px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex-1 space-y-3.5 sm:space-y-4 pb-16 md:pb-6">
        {/* TAB: HOME LAUNCHER (Farmer-First Clean Gateway) */}
        {activeTab === "home" && (
          <div className="space-y-6 sm:space-y-8">
            {/* 1. HERO SECTION */}
            <section className="bg-gradient-to-b from-[#ebf2ee]/80 via-[#f4f6f0]/40 to-white border border-[#d8ccbe] rounded-2xl p-6 sm:p-8 md:p-10 shadow-xs space-y-4">
              <div className="max-w-3xl space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white border border-[#4a7c59]/30 text-[#2a4732] text-xs font-bold shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{t.digitalMandiAccess || "Digital Mandi Access"}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold font-serif text-slate-900 tracking-tight leading-tight">
                  {t.heroHeadline || "Your Mandi, Made Simple"}
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-slate-600 font-normal leading-relaxed pt-1">
                  {t.heroSub || "Book your mandi slot, check important crop information, and prepare for procurement before you leave home."}
                </p>
              </div>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  className="bg-[#4a7c59] hover:bg-[#3b6447] text-white px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold flex items-center gap-2.5 shadow-sm transition active:scale-95 cursor-pointer"
                >
                  <Icon name="ticket" className="w-5 h-5 text-emerald-200" />
                  <span>{t.heroBookCta || "Book Mandi Slot"}</span>
                  <span className="text-emerald-200 text-lg leading-none">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("my-booking")}
                  className="bg-white hover:bg-slate-50 text-slate-800 border-2 border-[#c2a68c] px-6 py-3.5 rounded-xl text-sm sm:text-base font-bold flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Icon name="search" className="w-4 h-4 text-[#4a7c59]" />
                  <span>{t.heroCheckPassCta || "Check My Pass"}</span>
                  {activeToken && (
                    <span className="w-2 h-2 rounded-full bg-[#c86d12] animate-ping"></span>
                  )}
                </button>
              </div>

              {/* Feature-Phone Accessibility Banner */}
              <div className="pt-2 border-t border-[#e6d8c3]/60 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                <span className="text-slate-700 font-medium">
                  📱 {t.heroIvrHint || "Don't have a smartphone? Use KisanSetu IVR."}
                </span>
                <button
                  type="button"
                  onClick={() => setShowIvrModal(true)}
                  className="inline-flex items-center gap-1.5 font-bold text-[#c86d12] hover:text-[#a5590d] cursor-pointer bg-amber-50 hover:bg-amber-100/80 px-3 py-1 rounded-lg border border-amber-200 transition"
                >
                  <span>📞</span>
                  <span>{t.heroIvrBtn || "Prototype IVR"}</span>
                  <span>→</span>
                </button>
              </div>
            </section>

            {/* 2. THE FOUR FEATURE CARDS (Doors into Workflows) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold font-serif text-slate-900">
                    What would you like to do?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Select a service below to start your mandi workflow.
                  </p>
                </div>
              </div>

              {/* Grid: Mandi Gate Pass is Primary & Prominent */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CARD 1: MANDI GATE PASS (PRIMARY - Spans full width on tablet/desktop or featured top) */}
                <div
                  onClick={() => handleOpenBooking()}
                  className="md:col-span-3 ks-card p-6 sm:p-7 relative overflow-hidden bg-[#f2f7f4] border-2 border-[#4a7c59]/50 hover:border-[#4a7c59] rounded-2xl cursor-pointer transition shadow-sm hover:shadow-md group"
                >
                  {/* Decorative agricultural texture: Wheat stalks and field contours */}
                  <div
                    className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
                    aria-hidden="true"
                    style={{
                      WebkitMaskImage:
                        "radial-gradient(ellipse 75% 85% at 85% 65%, black 25%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                      maskImage:
                        "radial-gradient(ellipse 75% 85% at 85% 65%, black 25%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                    }}
                  >
                    <svg
                      className="absolute right-0 bottom-0 w-80 sm:w-96 h-full opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-300 text-[#2a4732]"
                      viewBox="0 0 380 180"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {/* Field Contours */}
                      <path
                        d="M-20 170 C60 140 160 165 260 135 C320 115 370 140 400 135"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeDasharray="4 2"
                      />
                      <path
                        d="M-40 140 C50 110 170 145 280 105 C330 85 370 105 400 95"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M-20 105 C70 80 190 115 300 75 C340 60 380 80 400 70"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeDasharray="6 3"
                      />
                      <path
                        d="M20 70 C100 45 210 80 320 45 C350 35 380 50 400 42"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                      {/* Elegant Primary Wheat Ear */}
                      <path
                        d="M360 190 C345 130 315 75 270 25"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {/* Wheat grains & awns */}
                      <path d="M270 25 C260 15 252 5 258 -5 C264 5 273 15 270 25 Z" fill="currentColor" />
                      <path d="M258 -5 L245 -22" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M272 23 C282 13 290 3 284 -7 C278 3 269 13 272 23 Z" fill="currentColor" />
                      <path d="M284 -7 L297 -24" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M278 45 C266 35 256 26 261 16 C268 25 280 35 278 45 Z" fill="currentColor" />
                      <path d="M261 16 L246 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M283 41 C295 32 305 23 300 13 C293 22 281 31 283 41 Z" fill="currentColor" />
                      <path d="M300 13 L317 -1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M289 67 C276 57 264 50 268 39 C276 48 290 57 289 67 Z" fill="currentColor" />
                      <path d="M268 39 L251 27" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M296 62 C309 53 321 46 317 35 C309 44 295 52 296 62 Z" fill="currentColor" />
                      <path d="M317 35 L336 23" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M303 91 C289 82 276 76 280 65 C288 73 304 81 303 91 Z" fill="currentColor" />
                      <path d="M280 65 L262 55" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M312 85 C326 77 339 71 336 60 C327 68 311 75 312 85 Z" fill="currentColor" />
                      <path d="M336 60 L356 50" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M320 117 C305 109 291 104 295 93 C303 100 321 107 320 117 Z" fill="currentColor" />
                      <path d="M295 93 L277 84" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M331 110 C346 103 360 98 358 87 C349 94 330 100 331 110 Z" fill="currentColor" />
                      <path d="M358 87 L379 79" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      {/* Secondary delicate stalk */}
                      <path
                        d="M375 200 C365 155 350 115 320 80"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <circle cx="330" cy="95" r="4" fill="currentColor" />
                      <circle cx="345" cy="115" r="4" fill="currentColor" />
                      <circle cx="318" cy="78" r="3.5" fill="currentColor" />
                      <circle cx="308" cy="65" r="3" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#4a7c59] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition">
                        <Icon name="ticket" className="w-7 h-7 text-emerald-100" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-[#2a4732] text-white px-2.5 py-0.5 rounded-full">
                            Primary Service
                          </span>
                          <span className="text-xs text-emerald-800 font-semibold">
                            Fast Entry • Gate #2
                          </span>
                        </div>
                        <h4 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 font-serif">
                          {t.card1Title || "Mandi Gate Pass"}
                        </h4>
                        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                          {t.card1Desc || "Book your mandi slot before you leave home and get your digital gate pass."}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                      <span className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#4a7c59] group-hover:bg-[#3b6447] text-white py-3 px-6 rounded-xl font-bold text-sm sm:text-base shadow-xs transition active:scale-95">
                        <span>{t.card1Cta || "Book Slot →"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: MSP RATES */}
                <div
                  onClick={() => setActiveTab("msp-rates")}
                  className="ks-card p-6 relative overflow-hidden bg-[#fdf9f0] border border-[#e8ded1] hover:border-[#c86d12] rounded-2xl cursor-pointer transition shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
                >
                  {/* Decorative agricultural texture: Upward market bars, Rupee watermark & grain motifs */}
                  <div
                    className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
                    aria-hidden="true"
                    style={{
                      WebkitMaskImage:
                        "radial-gradient(ellipse 75% 75% at 85% 85%, black 20%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                      maskImage:
                        "radial-gradient(ellipse 75% 75% at 85% 85%, black 20%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                    }}
                  >
                    <svg
                      className="absolute right-0 bottom-0 w-44 h-44 opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-300 text-[#c86d12]"
                      viewBox="0 0 180 180"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="140" cy="60" r="55" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
                      <circle cx="140" cy="60" r="38" stroke="currentColor" strokeWidth="1" />
                      <circle cx="140" cy="60" r="20" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
                      <path
                        d="M128 44 H154 M128 52 H150 M128 44 C142 44 146 60 134 68 L152 86"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 170 C45 165 75 145 105 130 C135 115 155 85 180 75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M20 180 C55 175 90 155 120 140 C145 128 165 105 185 95"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeDasharray="4 2"
                      />
                      <rect x="75" y="135" width="12" height="45" rx="3" fill="currentColor" />
                      <rect x="95" y="115" width="12" height="65" rx="3" fill="currentColor" />
                      <rect x="115" y="90" width="12" height="90" rx="3" fill="currentColor" />
                      <rect x="135" y="65" width="12" height="115" rx="3" fill="currentColor" />
                      <path d="M81 125 C77 120 78 112 81 108 C84 112 85 120 81 125 Z" fill="currentColor" />
                      <path d="M101 105 C97 100 98 92 101 88 C104 92 105 100 101 105 Z" fill="currentColor" />
                      <path d="M121 80 C117 75 118 67 121 63 C124 67 125 75 121 80 Z" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#c86d12] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Icon name="calculator" className="w-6 h-6 text-[#c86d12]" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                        {t.card2Title || "MSP Rates"}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {t.card2Desc || "Check the applicable support price for your crop and estimate your procurement value."}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 pt-2 border-t border-[#f0e4d6] flex items-center justify-between text-xs sm:text-sm font-bold text-[#c86d12] group-hover:translate-x-1 transition">
                    <span>{t.card2Cta || "Check Rates →"}</span>
                    <span>→</span>
                  </div>
                </div>

                {/* CARD 3: MOISTURE PRE-CHECK */}
                <div
                  onClick={() => setActiveTab("moisture")}
                  className="ks-card p-6 relative overflow-hidden bg-[#f0f6fa] border border-[#d9e6f2] hover:border-blue-500 rounded-2xl cursor-pointer transition shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
                >
                  {/* Decorative agricultural texture: Concentric ripple rings, droplet outlines & leaf veins */}
                  <div
                    className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
                    aria-hidden="true"
                    style={{
                      WebkitMaskImage:
                        "radial-gradient(ellipse 75% 75% at 85% 85%, black 20%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                      maskImage:
                        "radial-gradient(ellipse 75% 75% at 85% 85%, black 20%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                    }}
                  >
                    <svg
                      className="absolute right-0 bottom-0 w-44 h-44 opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-300 text-blue-600"
                      viewBox="0 0 180 180"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <ellipse cx="130" cy="125" rx="20" ry="12" stroke="currentColor" strokeWidth="1.2" />
                      <ellipse cx="130" cy="125" rx="42" ry="24" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" />
                      <ellipse cx="130" cy="125" rx="68" ry="38" stroke="currentColor" strokeWidth="1" />
                      <ellipse cx="130" cy="125" rx="96" ry="54" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 3" />
                      <ellipse cx="130" cy="125" rx="125" ry="70" stroke="currentColor" strokeWidth="0.6" />
                      <path
                        d="M130 55 C112 85 104 105 104 120 C104 135 116 146 130 146 C144 146 156 135 156 120 C156 105 148 85 130 55 Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M120 105 C116 112 115 119 116 126"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M162 42 C154 55 150 63 150 70 C150 77 155 82 162 82 C169 82 174 77 174 70 C174 63 170 55 162 42 Z"
                        fill="currentColor"
                      />
                      <circle cx="98" cy="65" r="4" fill="currentColor" />
                      <circle cx="85" cy="90" r="3" fill="currentColor" />
                      <path
                        d="M50 175 C70 140 100 110 140 90"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path d="M80 142 C92 136 100 128 102 122" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M104 121 C118 117 126 109 128 103" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Icon name="droplet" className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                        {t.card3Title || "Moisture Pre-Check"}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {t.card3Desc || "Check your grain's moisture reading before travelling to the mandi."}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 pt-2 border-t border-[#dce8f5] flex items-center justify-between text-xs sm:text-sm font-bold text-blue-700 group-hover:translate-x-1 transition">
                    <span>{t.card3Cta || "Check Moisture →"}</span>
                    <span>→</span>
                  </div>
                </div>

                {/* CARD 4: HELP & ASSISTANCE */}
                <div
                  onClick={() => setActiveTab("help")}
                  className="ks-card p-6 relative overflow-hidden bg-[#fdf2f4] border border-[#fae0e4] hover:border-[#4a7c59] rounded-2xl cursor-pointer transition shadow-xs hover:shadow-md flex flex-col justify-between space-y-4 group"
                >
                  {/* Decorative agricultural texture: Headset, communication waves, advisory document & laurel */}
                  <div
                    className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
                    aria-hidden="true"
                    style={{
                      WebkitMaskImage:
                        "radial-gradient(ellipse 75% 75% at 85% 85%, black 20%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                      maskImage:
                        "radial-gradient(ellipse 75% 75% at 85% 85%, black 20%, rgba(0,0,0,0.5) 55%, transparent 85%)",
                    }}
                  >
                    <svg
                      className="absolute right-0 bottom-0 w-44 h-44 opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-300 text-rose-600"
                      viewBox="0 0 180 180"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="130" cy="110" r="62" stroke="currentColor" strokeWidth="0.8" strokeDasharray="5 3" />
                      <circle cx="130" cy="110" r="46" stroke="currentColor" strokeWidth="1" />
                      <circle cx="130" cy="110" r="30" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 2" />
                      <path
                        d="M102 110 A28 28 0 0 1 158 110"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <rect x="97" y="104" width="8" height="16" rx="4" fill="currentColor" />
                      <rect x="155" y="104" width="8" height="16" rx="4" fill="currentColor" />
                      <path
                        d="M101 115 C101 127 112 134 122 134"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <circle cx="125" cy="134" r="3" fill="currentColor" />
                      <path
                        d="M50 160 L50 85 C50 80 54 76 59 76 L90 76 L108 94 L108 160 Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path d="M90 76 L90 94 L108 94" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M60 102 H85 M60 114 H95 M60 126 H90 M60 138 H80" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                      <path d="M125 155 C118 150 116 142 120 138 C125 142 128 150 125 155 Z" fill="currentColor" />
                      <path d="M140 152 C135 146 135 138 140 135 C144 140 145 148 140 152 Z" fill="currentColor" />
                      <path d="M152 144 C148 138 150 130 155 128 C158 133 157 141 152 144 Z" fill="currentColor" />
                    </svg>
                  </div>

                  {/* Card Content */}
                  <div className="relative z-10 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#4a7c59] flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                      <Icon name="help-circle" className="w-6 h-6 text-[#4a7c59]" />
                    </div>
                    <div>
                      <h4 className="text-base sm:text-lg font-bold text-slate-900 font-serif">
                        {t.card4Title || "Help & Assistance"}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {t.card4Desc || "Get help with booking, required documents, mandi visits, and KisanSetu services."}
                      </p>
                    </div>
                  </div>

                  <div className="relative z-10 pt-2 border-t border-[#fad4da] flex items-center justify-between text-xs sm:text-sm font-bold text-[#4a7c59] group-hover:translate-x-1 transition">
                    <span>{t.card4Cta || "Get Help →"}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. HOW KISANSETU WORKS SECTION */}
            <section className="ks-card p-6 sm:p-8 bg-white rounded-2xl space-y-6">
              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-lg sm:text-xl font-extrabold font-serif text-slate-900">
                  {t.howItWorks || "How KisanSetu Works"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  Follow these 4 simple steps to complete your mandi visit with zero hassle.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Step 1 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-[#4a7c59] text-white text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <span className="text-2xl">🌾</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">
                    {t.step1Title || "1. Choose your crop"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.step1Desc || "Select your crop type and harvest quantity"}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-[#4a7c59] text-white text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <span className="text-2xl">📍</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">
                    {t.step2Title || "2. Select mandi & slot"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.step2Desc || "Pick nearest centre and a 2-hour arrival window"}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-[#4a7c59] text-white text-xs font-black flex items-center justify-center">
                      3
                    </span>
                    <span className="text-2xl">🎫</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">
                    {t.step3Title || "3. Get your digital pass"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.step3Desc || "Receive barcode token on mobile via SMS or print"}
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-full bg-[#4a7c59] text-white text-xs font-black flex items-center justify-center">
                      4
                    </span>
                    <span className="text-2xl">🚛</span>
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900">
                    {t.step4Title || "4. Arrive during your slot"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t.step4Desc || "Fast entry at Gate #2 with zero line delay"}
                  </p>
                </div>
              </div>

              {/* Visual Flow summary */}
              <div className="p-3 bg-[#ebf2ee]/60 border border-[#4a7c59]/20 rounded-xl text-center text-xs sm:text-sm font-semibold text-[#2a4732] flex items-center justify-center gap-2 flex-wrap">
                <span>🌾 Crop</span>
                <span className="text-slate-400">→</span>
                <span>📍 Mandi</span>
                <span className="text-slate-400">→</span>
                <span>⏱️ Slot</span>
                <span className="text-slate-400">→</span>
                <span>🎫 Gate Pass</span>
                <span className="text-slate-400">→</span>
                <span>🚛 Mandi Visit</span>
              </div>
            </section>

            {/* 4. IVR / FEATURE PHONE SECTION */}
            <section className="bg-gradient-to-r from-[#2a4732] to-[#3b6447] text-white p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0 border border-white/20">
                  📞
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg sm:text-xl font-black font-serif">
                    {t.ivrSectionTitle || "Don't have a smartphone?"}
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-100 max-w-xl leading-relaxed">
                    {t.ivrSectionSub || "You can access KisanSetu through the IVR service using a basic phone."}
                  </p>
                  <p className="text-[11px] text-emerald-200/80 pt-1">
                    {t.ivrSectionNote || "Free prototype dial-in simulation for keypad phones. 1800-180-1551 is the Government Kisan Call Centre."}
                  </p>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setShowIvrModal(true)}
                  className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95 whitespace-nowrap"
                >
                  <span>📞</span>
                  <span>{t.ivrSectionCta || "Call KisanSetu (Prototype IVR)"}</span>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB: CENTRES / MANDIS */}
        {activeTab === "centres" && (
          <div className="space-y-4">
            {/* GPS Location Finder Banner */}
            <div className="bg-[#ebf2ee] border border-[#4a7c59]/40 p-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${userCoords ? "bg-emerald-600" : "bg-[#4a7c59] animate-pulse"}`}></span>
                <div>
                  <span className="font-extrabold text-[#2a4732]">📍 Live GPS Mandi Finder: </span>
                  <span className="text-slate-800 font-medium">
                    {locationStatusMsg || (userCoords ? `Current GPS: ${userCoords.lat.toFixed(3)}°N, ${userCoords.lng.toFixed(3)}°E` : "Find and sort mandis closest to your current location")}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={isLocating}
                className="w-full sm:w-auto bg-[#4a7c59] hover:bg-[#3b6447] text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer ml-auto shrink-0"
              >
                <Icon name="navigation" className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Locating..." : "📍 Detect My Location (निकटतम खोजें)"}</span>
              </button>
            </div>

            <div className="ks-card p-3 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-[#c2a68c]/70 rounded-lg text-xs sm:text-sm text-slate-900 font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-[#c2a68c]/70 rounded-lg text-xs sm:text-sm font-semibold text-slate-900"
                >
                  <option value="All">{t.allCrops}</option>
                  <option value="Paddy">Paddy (धान)</option>
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                  <option value="Chana">Chana (चना)</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-2 px-3 bg-slate-50 border border-[#c2a68c]/70 rounded-lg text-xs sm:text-sm font-semibold text-slate-900"
                >
                  <option value="distance">{t.sortByDistance}</option>
                  <option value="wait">{t.sortByWait}</option>
                  <option value="slots">{t.sortBySlots}</option>
                </select>
              </div>
            </div>

            <div className="ks-card overflow-hidden divide-y divide-slate-100">
              {filteredCentres.map((centre: any) => (
                <div
                  key={centre.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#ebf2ee]/30 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-extrabold text-slate-900">{centre.name}</h3>
                      <span className="text-[10px] bg-[#ebf2ee] text-[#2a4732] px-2 py-0.5 rounded-full font-bold">
                        {centre.district}
                      </span>
                      {centre.displayDistance !== undefined && centre.displayDistance <= 15 && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
                          Nearest Mandi
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 space-x-2 flex flex-wrap items-center">
                      <span>
                        {t.tehsilLabel}: <strong>{centre.tehsil}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        {t.distanceLabel}:{" "}
                        <strong className="text-[#2a4732] font-mono">
                          {centre.displayDistance !== undefined ? centre.displayDistance : centre.distance} {t.distKm}
                        </strong>
                      </span>
                      <span>•</span>
                      <a
                        href={
                          centre.lat && centre.lng
                            ? `https://www.google.com/maps/dir/?api=1&destination=${centre.lat},${centre.lng}`
                            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                centre.name + " " + centre.district
                              )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4a7c59] font-bold underline inline-flex items-center gap-0.5 hover:text-[#3b6447]"
                        title="Get live GPS driving directions in Google Maps"
                      >
                        <Icon name="navigation" className="w-3 h-3" />
                        <span>{t.mapNav || "Directions"}</span>
                      </a>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {centre.crops.map((crop, idx) => (
                        <span
                          key={idx}
                          className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200"
                        >
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                    <div className="text-left sm:text-right text-xs">
                      <div className="font-bold text-[#2a4732] bg-[#ebf2ee] px-2 py-0.5 rounded border border-[#4a7c59]/30">
                        {t.waitingTime}: {centre.waitTime}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {t.sortBySlots}: <strong className="text-[#4a7c59]">{centre.availableSlots}</strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenBooking(centre)}
                      disabled={centre.availableSlots === 0}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 ${
                        centre.availableSlots > 0
                          ? "bg-[#4a7c59] hover:bg-[#3b6447] text-white"
                          : "bg-slate-200 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {centre.availableSlots > 0 ? t.bookSlotBtn : t.fullSlots}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: GATE PASS TOKEN & QUEUE */}
        {activeTab === "my-booking" && (
          <div className="space-y-5 max-w-6xl mx-auto">

            {activeToken ? (
              <div className="space-y-3">
                {activeToken.status === "Cancelled" ? (
                  <div className="bg-red-50 border-2 border-red-400 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-900 shadow-xs">
                    <span className="text-xl shrink-0">❌</span>
                    <div className="space-y-1.5 w-full">
                      <div className="font-extrabold text-sm text-red-950">
                        Gate Pass Rejected / Cancelled by Mandi Gate
                      </div>
                      <div className="bg-white border border-red-200 p-2.5 rounded-lg text-red-800 font-semibold text-xs">
                        <strong>Official Reason:</strong>{" "}
                        {activeToken.cancellationReason || "Cancelled by Mandi Gate Officer / Farmer Request"}
                      </div>
                      <p className="text-[11px] text-slate-600">
                        If your pass was rejected due to moisture (&gt;17.0%) or dirt (&gt;2.0%), please sun-dry and clean your crop before generating a fresh pass.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#ebf2ee] border border-[#4a7c59]/40 p-3 rounded-xl flex items-center justify-between text-xs shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#4a7c59] animate-pulse"></span>
                      <span className="font-bold text-[#2a4732]">{t.liveGateStatus}:</span>
                      <span className="text-slate-800 font-semibold">
                        {activeToken.queuePos} {t.trucksAhead}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-[#4a7c59]/30">
                      {t.estGateEntry}
                    </span>
                  </div>
                )}

                <div
                  id="printable-token"
                  className={`bg-white border-2 ${
                    activeToken.status === "Cancelled" ? "border-red-400" : "border-[#4a7c59]"
                  } rounded-2xl p-5 space-y-4 shadow-sm`}
                >
                  <div className="flex items-start justify-between border-b border-[#e6d8c3] pb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={kisanSetuCircle}
                        alt="KisanSetu Logo"
                        className="w-12 h-12 object-contain shrink-0"
                      />
                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase text-white px-2 py-0.5 rounded-full ${
                            activeToken.status === "Cancelled"
                              ? "bg-red-700"
                              : activeToken.status === "Gate In"
                              ? "bg-blue-700"
                              : activeToken.status === "Weighed"
                              ? "bg-amber-700"
                              : activeToken.status === "Completed"
                              ? "bg-purple-700"
                              : "bg-[#4a7c59]"
                          }`}
                        >
                          {activeToken.status === "Cancelled" ? "CANCELLED / REJECTED" : t.digitalGatePass}
                        </span>
                        <h2 className="text-xl font-black text-slate-900 mt-1 tracking-tight font-mono">
                          {activeToken.tokenId}
                        </h2>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Issued: {activeToken.issuedAt}
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#f4f6f0] border border-[#c2a68c] p-2 rounded-lg text-center max-w-[140px]">
                      <SVGBarcode value={activeToken.tokenId} />
                      <span className="text-[8px] font-mono text-slate-600 block mt-1 font-bold">
                        {t.gateScannerCode}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-[#f4f6f0] rounded-xl border border-[#d8ccbe]">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {t.farmerName}
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5 text-sm">
                        {activeToken.farmerName}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#f4f6f0] rounded-xl border border-[#d8ccbe]">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {t.centerLabel}
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5 leading-tight truncate">
                        {activeToken.centreName}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#ebf2ee] rounded-xl border border-[#4a7c59]/30 col-span-2 sm:col-span-1">
                      <span className="text-[10px] uppercase font-bold text-[#2a4732] block">
                        {t.gateEntryTime}
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {activeToken.slot}
                      </span>
                      <span className="text-[#4a7c59] text-[11px] font-semibold">{activeToken.date}</span>
                    </div>

                    <div className="p-2.5 bg-[#f4f6f0] rounded-xl border border-[#d8ccbe]">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {t.cropType}
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {activeToken.crop}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#f4f6f0] rounded-xl border border-[#d8ccbe]">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {t.qtlLabel}
                      </span>
                      <span className="font-bold text-slate-900 block mt-0.5">
                        {activeToken.quantity} {t.enterQuintal}
                      </span>
                    </div>

                    <div className="p-2.5 bg-[#fdf6ee] rounded-xl border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-[#c86d12] block">
                        {t.estPayout}
                      </span>
                      <span className="font-black text-[#c86d12] block mt-0.5 text-sm font-mono">
                        ₹{activeToken.estimatedPayout}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#e6d8c3] text-xs text-slate-700 font-medium">
                    📌 <strong>{t.passInstructions}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 no-print text-xs">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="bg-[#4a7c59] hover:bg-[#3b6447] text-white py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <Icon name="printer" className="w-4 h-4" />
                    <span>{t.printToken}</span>
                  </button>

                  <button
                    type="button"
                    onClick={shareOnWhatsApp}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyTokenToClipboard}
                    className="bg-white hover:bg-slate-50 border border-[#c2a68c] text-slate-800 py-2.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                  >
                    <Icon name="copy" className="w-4 h-4" />
                    <span>{copiedNotify ? t.copied : t.copyPass}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelPass}
                    className="text-red-700 hover:text-red-900 font-bold py-2.5 px-3 rounded-lg border border-red-200 bg-red-50 cursor-pointer active:scale-95"
                  >
                    {t.cancelBooking}
                  </button>
                </div>
              </div>
            ) : (
              <div className="ks-card p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#ebf2ee] text-[#4a7c59] flex items-center justify-center mx-auto text-xl font-bold">
                  📄
                </div>
                <h3 className="text-base font-bold text-slate-900">{t.noTokenYet}</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">{t.noTokenSub}</p>
                <button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  className="bg-[#4a7c59] hover:bg-[#3b6447] text-white px-5 py-2.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-95"
                >
                  <Icon name="ticket" className="w-4 h-4" />
                  <span>{t.bookNowAction}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: MSP RATES & CALCULATOR */}
        {activeTab === "msp-rates" && (
          <div className="space-y-4">
            <div className="ks-card p-4 sm:p-5 space-y-4">
              <div className="border-b border-[#e6d8c3] pb-2">
                <h3 className="text-base font-bold text-slate-900">{t.calcTitle}</h3>
                <p className="text-xs text-slate-500">{t.calcSub}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.cropType}</label>
                  <select
                    value={calcCrop.crop}
                    onChange={(e) => {
                      const c = MSP_RATES.find((m) => m.crop === e.target.value);
                      if (c) setCalcCrop(c);
                    }}
                    className="w-full p-2 bg-white border border-[#c2a68c]/70 rounded-lg font-bold text-slate-900 text-xs"
                  >
                    {MSP_RATES.map((m, idx) => (
                      <option key={idx} value={m.crop}>
                        {m.crop} — ₹{m.msp} / {m.unit}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.enterQuintal}</label>
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(Math.max(1, parseInt(e.target.value, 10) || 0))}
                    className="w-full p-2 bg-white border border-[#c2a68c]/70 rounded-lg font-bold text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="bg-[#4a7c59] text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div>
                  <span className="text-xs text-emerald-100 font-bold">{t.estPayout}</span>
                  <div className="text-2xl font-black text-yellow-300 font-mono">
                    ₹{(calcQuantity * calcCrop.msp).toLocaleString("en-IN")}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenBooking()}
                  className="bg-white text-[#2a4732] hover:bg-slate-100 px-4 py-2 rounded-lg text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  {t.bookSlotArrow}
                </button>
              </div>

              {/* 3 Core Crop MSP Benchmarks & 100 Qtl Estimate */}
              <div className="bg-[#fdf6ee] border border-[#e6d8c3] p-3 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Quick Benchmark Estimate:</span>
                  <span className="font-extrabold text-[#c86d12] font-mono">100 Qtl (Common Paddy) = ₹2,30,000</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-[#e6d8c3]">
                    <p className="text-[11px] text-slate-500 font-medium">Paddy (Common)</p>
                    <p className="text-xs sm:text-sm font-black text-[#c86d12] font-mono">₹2,300 / Qtl</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#e6d8c3]">
                    <p className="text-[11px] text-slate-500 font-medium">Paddy (Grade A)</p>
                    <p className="text-xs sm:text-sm font-black text-[#c86d12] font-mono">₹2,320 / Qtl</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-[#e6d8c3]">
                    <p className="text-[11px] text-slate-500 font-medium">Wheat (Rabi)</p>
                    <p className="text-xs sm:text-sm font-black text-[#c86d12] font-mono">₹2,425 / Qtl</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="ks-card overflow-hidden">
              <div className="px-4 py-3 border-b border-[#e6d8c3] bg-slate-50">
                <h3 className="text-sm font-bold text-slate-900">{t.mspTableTitle}</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                      <th className="p-3">{t.cropHeader}</th>
                      <th className="p-3">{t.seasonHeader}</th>
                      <th className="p-3">{t.mspHeader}</th>
                      <th className="p-3">{t.changeHeader}</th>
                      <th className="p-3">{t.statusHeader}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {MSP_RATES.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#ebf2ee]/30">
                        <td className="p-3 font-bold text-slate-900">{item.crop}</td>
                        <td className="p-3 text-slate-600">{item.season}</td>
                        <td className="p-3 font-black text-[#c86d12] text-sm font-mono">
                          ₹{item.msp} / {item.unit}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">{item.change}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-bold">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MANDI OFFICER / ADMIN PORTAL */}
        {activeTab === "admin" && (
          <div className="space-y-4">
            <div className="ks-card p-4 sm:p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e6d8c3] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-800 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    🛡️
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Mandi Officer Control Center
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Officer: <strong className="text-purple-800">S. K. Verma</strong> (ID: MANDI-701) • District Karnal
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={refreshAdminBookings}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                  >
                    <Icon name="refresh" className={`w-3.5 h-3.5 ${isLoadingAdminBookings ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOfficerLogout}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
                  >
                    <Icon name="log-out" className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Total Gate Passes
                  </span>
                  <span className="text-xl font-black text-purple-900 block mt-0.5">
                    {adminStats.totalBookings}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Trucks Inside Yard
                  </span>
                  <span className="text-xl font-black text-blue-900 block mt-0.5">
                    {adminStats.gateInCount}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Total Quantity (Qtl)
                  </span>
                  <span className="text-xl font-black text-[#4a7c59] block mt-0.5">
                    {adminStats.totalQtl} Qtl
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Estimated DBT Payout
                  </span>
                  <span className="text-xl font-black text-[#c86d12] block mt-0.5 font-mono">
                    ₹{adminStats.totalPayout.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Gate Scanner / Verification Widget */}
            <div className="ks-card p-4 space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-[#e6d8c3] pb-2">
                <span>🔍</span>
                <span>Gate Scanner & Token Verification</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={verifyTokenInput}
                  onChange={(e) => setVerifyTokenInput(e.target.value)}
                  placeholder="Enter Token ID (e.g. KS-8942) or Farmer Mobile..."
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 uppercase font-mono"
                />
                <button
                  type="button"
                  onClick={handleVerifySearch}
                  className="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer active:scale-95"
                >
                  Verify Token
                </button>
              </div>

              {verifiedTokenResult && (
                <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-xl space-y-2 text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-black text-sm text-purple-900 font-mono">
                        {verifiedTokenResult.tokenId}
                      </span>
                      <span className="text-slate-700 ml-2 font-bold">
                        {verifiedTokenResult.farmerName} ({verifiedTokenResult.mobile})
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        verifiedTokenResult.status === "Confirmed"
                          ? "bg-emerald-100 text-emerald-800"
                          : verifiedTokenResult.status === "Gate In"
                          ? "bg-blue-100 text-blue-800"
                          : verifiedTokenResult.status === "Weighed"
                          ? "bg-amber-100 text-amber-800"
                          : verifiedTokenResult.status === "Completed"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {verifiedTokenResult.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                    <div>
                      Mandi: <strong>{verifiedTokenResult.centreName}</strong>
                    </div>
                    <div>
                      Slot: <strong>{verifiedTokenResult.slot}</strong>
                    </div>
                    <div>
                      Crop: <strong>{verifiedTokenResult.crop} ({verifiedTokenResult.quantity} Qtl)</strong>
                    </div>
                    <div>
                      Payout: <strong className="text-[#c86d12]">₹{verifiedTokenResult.estimatedPayout}</strong>
                    </div>
                  </div>

                  {verifiedTokenResult.status === "Cancelled" && (
                    <div className="p-2.5 bg-red-50 border border-red-300 rounded-lg text-xs flex items-start gap-2">
                      <span className="text-red-700 font-bold text-sm">⚠️</span>
                      <div>
                        <div className="font-bold text-red-900">Gate Pass Rejection Reason:</div>
                        <div className="text-[11px] text-red-700 mt-0.5 font-medium">
                          {verifiedTokenResult.cancellationReason || "Rejected by Mandi Gate Officer"}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap gap-2 items-center">
                    <span className="font-bold text-slate-600 text-[11px]">Update Status:</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(verifiedTokenResult.tokenId, "Gate In")}
                      className="px-2.5 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-bold text-[11px] cursor-pointer"
                    >
                      ✓ Mark Gate-In
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(verifiedTokenResult.tokenId, "Weighed")}
                      className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-md font-bold text-[11px] cursor-pointer"
                    >
                      ⚖️ Mark Weighed & Passed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(verifiedTokenResult.tokenId, "Completed")}
                      className="px-2.5 py-1 bg-[#4a7c59] hover:bg-[#3b6447] text-white rounded-md font-bold text-[11px] cursor-pointer"
                    >
                      💰 DBT Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePromptReject(verifiedTokenResult.tokenId)}
                      className="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded-md font-bold text-[11px] cursor-pointer"
                    >
                      ✕ Reject / Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Live Bookings Table */}
            <div className="ks-card p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e6d8c3] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Live Gate Pass Registry ({filteredAdminBookings.length} records)
                  </h3>
                  <p className="text-xs text-slate-500">Real-time bookings from Web and IVR telephony</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Search farmer / token..."
                    className="p-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900"
                  />
                  <select
                    value={adminStatusFilter}
                    onChange={(e) => setAdminStatusFilter(e.target.value)}
                    className="p-1.5 px-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  >
                    <option value="All">All Status</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Gate In">Gate In</option>
                    <option value="Weighed">Weighed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                      <th className="p-2.5">Token ID</th>
                      <th className="p-2.5">Farmer & Contact</th>
                      <th className="p-2.5">Mandi Centre</th>
                      <th className="p-2.5">Date & Slot</th>
                      <th className="p-2.5">Crop & Qtl</th>
                      <th className="p-2.5">Est. Payout</th>
                      <th className="p-2.5">Status & Reason</th>
                      <th className="p-2.5 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAdminBookings.map((b) => (
                      <tr key={b.tokenId} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-bold text-[#4a7c59]">
                          {b.tokenId}
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{b.farmerName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {b.mobile} • Aadhaar: ****{b.aadhaar4}
                          </div>
                        </td>
                        <td className="p-2.5 text-slate-700 font-medium max-w-[150px] truncate">
                          {b.centreName}
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{b.slot}</div>
                          <div className="text-[10px] text-slate-500">{b.date}</div>
                        </td>
                        <td className="p-2.5 font-bold text-slate-900">
                          {b.crop} ({b.quantity} Qtl)
                        </td>
                        <td className="p-2.5 font-bold text-[#c86d12] text-xs font-mono">
                          ₹{b.estimatedPayout}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              b.status === "Confirmed"
                                ? "bg-emerald-100 text-emerald-800"
                                : b.status === "Gate In"
                                ? "bg-blue-100 text-blue-800"
                                : b.status === "Weighed"
                                ? "bg-amber-100 text-amber-800"
                                : b.status === "Completed"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {b.status}
                          </span>
                          {b.status === "Cancelled" && (
                            <div className="text-[10px] text-red-700 font-semibold max-w-[200px] leading-tight mt-1 bg-red-50 p-1 rounded border border-red-200">
                              Reason: {b.cancellationReason || "Rejected by Gate Officer"}
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 text-right space-x-1 whitespace-nowrap">
                          {b.status === "Confirmed" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(b.tokenId, "Gate In")}
                                className="px-2 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Gate In
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePromptReject(b.tokenId)}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {b.status === "Gate In" && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(b.tokenId, "Weighed")}
                                className="px-2 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Weigh & Pass
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePromptReject(b.tokenId)}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 border border-red-300 rounded text-[10px] font-bold cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {b.status === "Weighed" && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(b.tokenId, "Completed")}
                              className="px-2 py-1 bg-[#4a7c59] hover:bg-[#3b6447] text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              DBT Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MOISTURE PRE-CHECK & QUALITY STANDARDS */}
        {activeTab === "moisture" && (
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-white border border-[#d8ccbe] rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e6d8c3] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xl">
                    💧
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-serif">
                      {t.moisturePageTitle || "Grain Moisture Pre-Check & Quality Standards"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t.moisturePageSub || "Verify your grain moisture before travelling to prevent mandi rejection or distress price cuts."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                    Official Limit: ≤ 17.0%
                  </span>
                </div>
              </div>

              {/* Informational Pre-Check Disclaimer */}
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-950 flex items-start gap-2">
                <span className="text-base leading-none">🌾</span>
                <div>
                  <p className="font-bold">
                    Farmer pre-check: enter reading from your grain moisture tester meter.
                  </p>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    Official moisture verification is performed at the APMC procurement centre weighbridge. Grain tested below 17.0% qualifies for 100% fair MSP without deductions.
                  </p>
                </div>
              </div>

              {/* Meter Reading Input & Presets */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex justify-between items-center text-slate-800 font-bold text-xs sm:text-sm">
                  <label htmlFor="grain-moisture-dedicated-input" className="flex items-center gap-1.5">
                    <Icon name="droplet" className="w-4 h-4 text-blue-600" />
                    <span>{t.moistureInputLabel || "Enter Moisture Reading (%)"}:</span>
                  </label>
                  <span className="text-xs text-slate-500 font-mono">Government Limit: ≤ 17.0%</span>
                </div>

                <div className="space-y-1.5">
                  <div className="relative max-w-md">
                    <input
                      id="grain-moisture-dedicated-input"
                      type="number"
                      step="0.1"
                      min="0"
                      max="40"
                      value={inputMoisture}
                      onChange={(e) => setInputMoisture(e.target.value)}
                      placeholder="Enter moisture reading (e.g. 15.5)"
                      className="w-full bg-white border border-slate-300 hover:border-slate-400 focus:border-[#4a7c59] rounded-xl py-2.5 px-3.5 pr-12 text-base font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4a7c59]/20 shadow-xs transition"
                    />
                    <span className="absolute right-4 top-3 text-sm font-bold text-slate-400 font-mono">%</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Type the percentage shown on your digital grain tester. (Official MSP procurement standard: <strong>≤ 17.0%</strong>)
                  </p>
                </div>

                {/* Quick Demo Presets */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-xs text-slate-500 font-bold uppercase">Quick Presets:</span>
                  {[
                    { l: "14.0% (Dry)", v: "14.0" },
                    { l: "16.5% (Good)", v: "16.5" },
                    { l: "17.0% (Limit)", v: "17.0" },
                    { l: "18.5% (Drying Needed)", v: "18.5" },
                    { l: "20.0% (High Moisture)", v: "20.0" },
                  ].map((p) => (
                    <button
                      key={p.v}
                      type="button"
                      onClick={() => setInputMoisture(p.v)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border cursor-pointer transition ${
                        inputMoisture === p.v
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {p.l}
                    </button>
                  ))}
                </div>

                {/* Dynamic Result Box */}
                <div className={`p-4 rounded-xl border space-y-1.5 transition ${moistureAnalysis.color}`}>
                  <div className="flex items-center justify-between font-black text-sm sm:text-base">
                    <span>{moistureAnalysis.badge}</span>
                    <span className="font-mono text-base sm:text-lg">
                      {moistureAnalysis.isValid ? `${moistureAnalysis.reading?.toFixed(1)}%` : "--"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-medium">{moistureAnalysis.sub}</p>
                  <p className="text-xs sm:text-sm font-bold">{moistureAnalysis.actionHint}</p>
                  {moistureLastTestedAt && (
                    <div className="text-[11px] text-slate-500 pt-2 border-t border-black/10 flex justify-between">
                      <span>Source: Digital Meter Reading</span>
                      <span>Verified: {moistureLastTestedAt}</span>
                    </div>
                  )}
                </div>

                {/* Action CTA */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
                      setMoistureLastTestedAt(`Today, ${timeStr}`);
                    }}
                    className="bg-[#4a7c59] hover:bg-[#3b6447] text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Icon name="droplet" className="w-4 h-4" />
                    <span>{t.testMoistureBtn}</span>
                  </button>

                  {moistureAnalysis.isPass ? (
                    <button
                      type="button"
                      onClick={() => handleOpenBooking()}
                      className="bg-[#c86d12] hover:bg-[#a5590d] text-white py-2.5 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <span>Proceed to Book Mandi Slot →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => alert("Sun-Drying Guide: Spread grain 2-3 inches thick in direct sunlight on mandi drying yard or tarpaulin for 2-4 hours to drop moisture below 17.0%.")}
                      className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <span>Sun-Drying Guide ☀️</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quality Standards & Testing Guide */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card A: Mandi Standards */}
              <div className="ks-card p-4 sm:p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-[#e6d8c3] pb-2 flex items-center gap-1.5">
                  <span>⚖️</span>
                  <span>Mandi Acceptance & Quality Standards</span>
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <p className="text-[11px] text-slate-500 font-medium">Moisture</p>
                    <p className="font-extrabold text-[#2a4732] text-sm">≤ 17.0%</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">Standard</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <p className="text-[11px] text-slate-500 font-medium">Refuse / Dirt</p>
                    <p className="font-extrabold text-[#2a4732] text-sm">≤ 2.0%</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">Clean Grain</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <p className="text-[11px] text-slate-500 font-medium">DBT Payout</p>
                    <p className="font-extrabold text-[#2a4732] text-sm">48–72h</p>
                    <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">Bank Credit</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Grain meeting these three standards is eligible for instant weighbridge clearance and direct MSP credit to the farmer's linked Aadhaar bank account.
                </p>
              </div>

              {/* Card B: How Testing Works */}
              <div className="ks-card p-4 sm:p-5 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 border-b border-[#e6d8c3] pb-2 flex items-center gap-1.5">
                  <span>ℹ️</span>
                  <span>{t.howItWorksTitle || "How Moisture Testing Works:"}</span>
                </h3>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#4a7c59]">1.</span>
                    <span>{t.howItWorksStep1 || "Take a representative grain sample from multiple sacks."}</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#4a7c59]">2.</span>
                    <span>{t.howItWorksStep2 || "Measure with a calibrated digital grain moisture tester."}</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#4a7c59]">3.</span>
                    <span>{t.howItWorksStep3 || "Enter reading in KisanSetu before visiting the mandi."}</span>
                  </div>
                  <div className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="font-bold text-[#4a7c59]">4.</span>
                    <span>{t.howItWorksStep4 || "If ≤ 17.0%, proceed to book gate pass for immediate entry."}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: HELP & CITIZEN CHARTER */}
        {activeTab === "help" && (
          <div className="space-y-4">
            {/* 1. Required Documents Checklist */}
            <div className="ks-card p-5 space-y-3 bg-white">
              <div className="flex items-center justify-between border-b border-[#e6d8c3] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#4a7c59] flex items-center justify-center font-bold">
                    <Icon name="file-text" className="w-5 h-5 text-[#4a7c59]" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base font-serif">
                      {t.requiredDocs || "Documents Required at Gate Entry"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Keep these 4 items ready when arriving at the mandi gate.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Mandatory Checklist
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">✓</span>
                    <span>1. {t.doc1}</span>
                  </div>
                  <p className="text-slate-600 pl-7">{t.doc1Sub || "Original Aadhaar Card for identity verification"}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">✓</span>
                    <span>2. {t.doc2}</span>
                  </div>
                  <p className="text-slate-600 pl-7">{t.doc2Sub || "Passbook for Direct Bank Transfer (DBT)"}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">✓</span>
                    <span>3. {t.doc3}</span>
                  </div>
                  <p className="text-slate-600 pl-7">{t.doc3Sub || "Land Registration / Khasra document"}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">✓</span>
                    <span>4. {t.doc4}</span>
                  </div>
                  <p className="text-slate-600 pl-7">{t.doc4Sub || "Token generated from KisanSetu portal"}</p>
                </div>
              </div>
            </div>

            {/* 2. Mandi Standards & Payment Rules */}
            <div className="ks-card p-5 space-y-3 bg-white">
              <h3 className="font-extrabold text-slate-900 text-base font-serif border-b border-[#e6d8c3] pb-2 flex items-center gap-2">
                <span>⚖️</span>
                <span>Mandi Acceptance & Payment Standards</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-0.5">
                  <p className="text-slate-500 font-medium">Grain Moisture</p>
                  <p className="text-base font-black text-[#2a4732]">≤ 17.0%</p>
                  <p className="text-[10px] text-emerald-800 font-semibold">100% MSP Payout</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-0.5">
                  <p className="text-slate-500 font-medium">Dirt / Foreign Matter</p>
                  <p className="text-base font-black text-[#2a4732]">≤ 2.0%</p>
                  <p className="text-[10px] text-emerald-800 font-semibold">Permissible Refuse</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl space-y-0.5">
                  <p className="text-slate-500 font-medium">DBT Direct Transfer</p>
                  <p className="text-base font-black text-[#2a4732]">48–72 Hours</p>
                  <p className="text-[10px] text-emerald-800 font-semibold">To Aadhaar Linked A/C</p>
                </div>
              </div>
            </div>

            {/* 3. Prototype IVR Voice Phone Feature Banner */}
            <div className="bg-gradient-to-r from-[#2a4732] to-[#4a7c59] text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0 border border-white/20">
                  📞
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base leading-snug">
                    {lang === "hi"
                      ? "किसानसेतु 24x7 IVR फोन बुकिंग सिम्युलेटर"
                      : "KisanSetu 24x7 IVR Voice Booking Simulator"}
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    {lang === "hi"
                      ? "बिना स्मार्टफोन व बिना इंटरनेट, साधारण कीपैड फोन से स्लॉट बुक करें व टोकन पाएं।"
                      : "Simulate booking procurement slots via feature-phone keypad telephony without internet."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIvrModal(true)}
                className="w-full sm:w-auto bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95 whitespace-nowrap"
              >
                <span>📞</span>
                <span>{lang === "hi" ? "लाइव IVR सिम्युलेटर खोलें" : "Open Live IVR Simulator"}</span>
              </button>
            </div>

            {/* 4. Toll-Free Helplines with Clear Attribution */}
            <div className="ks-card p-5 space-y-3">
              <div className="border-b border-[#e6d8c3] pb-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {t.tollFreeTitle || "Official Helplines & Support"}
                </h3>
                <p className="text-[11px] text-slate-500">
                  1800-180-1551 is the Government of India Kisan Call Centre helpline.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-[#fdf6ee] border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    Govt. Kisan Call Centre (KCC)
                  </span>
                  <a href="tel:18001801551" className="text-base font-black text-[#c86d12] block mt-1 font-mono">
                    1800-180-1551
                  </a>
                  <span className="text-[10px] text-slate-500 block mt-0.5">6 AM – 10 PM • All 7 Days</span>
                </div>

                <div className="p-3.5 bg-[#ebf2ee] border border-[#4a7c59]/30 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    KCC Short Code
                  </span>
                  <a href="tel:1551" className="text-base font-black text-[#4a7c59] block mt-1 font-mono">
                    1551
                  </a>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Toll-Free from any mobile</span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    {t.whatsappSupport}
                  </span>
                  <a
                    href="https://wa.me/919416000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base font-black text-slate-800 block mt-1 font-mono"
                  >
                    +91 94160 00000
                  </a>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Digital Assistance</span>
                </div>
              </div>
            </div>

            {/* 5. FAQs */}
            <div className="ks-card p-5 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-slate-900 border-b border-[#e6d8c3] pb-2">
                {t.faqTitle}
              </h3>

              <div className="p-3 bg-slate-50 border-l-4 border-[#4a7c59] rounded-r-lg space-y-0.5">
                <h4 className="font-bold text-slate-900">{t.faq1Q}</h4>
                <p className="text-slate-600">{t.faq1A}</p>
              </div>

              <div className="p-3 bg-slate-50 border-l-4 border-[#4a7c59] rounded-r-lg space-y-0.5">
                <h4 className="font-bold text-slate-900">{t.faq2Q}</h4>
                <p className="text-slate-600">{t.faq2A}</p>
              </div>

              <div className="p-3 bg-slate-50 border-l-4 border-[#4a7c59] rounded-r-lg space-y-0.5">
                <h4 className="font-bold text-slate-900">{t.faq3Q}</h4>
                <p className="text-slate-600">{t.faq3A}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 5. MOBILE STICKY BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#d8ccbe] shadow-lg py-1.5 px-2 flex items-center justify-around text-center">
        <button
          type="button"
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition flex-1 ${
            activeTab === "home" ? "text-[#4a7c59] font-black" : "text-slate-500 font-semibold"
          }`}
        >
          <Icon name="home" className={`w-5 h-5 ${activeTab === "home" ? "text-[#4a7c59]" : "text-slate-500"}`} />
          <span className="text-[10px] mt-0.5">{t.home}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("centres")}
          className={`flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition flex-1 ${
            activeTab === "centres" ? "text-[#4a7c59] font-black" : "text-slate-500 font-semibold"
          }`}
        >
          <Icon name="map-pin" className={`w-5 h-5 ${activeTab === "centres" ? "text-[#4a7c59]" : "text-slate-500"}`} />
          <span className="text-[10px] mt-0.5">{t.centres}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("my-booking")}
          className={`flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition flex-1 relative ${
            activeTab === "my-booking" ? "text-[#4a7c59] font-black" : "text-slate-500 font-semibold"
          }`}
        >
          <Icon name="ticket" className={`w-5 h-5 ${activeTab === "my-booking" ? "text-[#4a7c59]" : "text-slate-500"}`} />
          <span className="text-[10px] mt-0.5">{t.myBooking}</span>
          {activeToken && (
            <span className="absolute top-0.5 right-4 w-2 h-2 rounded-full bg-[#c86d12] animate-ping"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("msp-rates")}
          className={`flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition flex-1 ${
            activeTab === "msp-rates" ? "text-[#4a7c59] font-black" : "text-slate-500 font-semibold"
          }`}
        >
          <Icon name="calculator" className={`w-5 h-5 ${activeTab === "msp-rates" ? "text-[#4a7c59]" : "text-slate-500"}`} />
          <span className="text-[10px] mt-0.5">{t.mspRates}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("moisture")}
          className={`flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition flex-1 ${
            activeTab === "moisture" ? "text-blue-700 font-black" : "text-slate-500 font-semibold"
          }`}
        >
          <Icon name="droplet" className={`w-5 h-5 ${activeTab === "moisture" ? "text-blue-700" : "text-slate-500"}`} />
          <span className="text-[10px] mt-0.5">{t.moistureTab || "Moisture"}</span>
        </button>

        {isOfficerLoggedIn && (
          <button
            type="button"
            onClick={() => setActiveTab("admin")}
            className={`flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition flex-1 ${
              activeTab === "admin" ? "text-purple-900 font-black" : "text-purple-600 font-semibold"
            }`}
          >
            <Icon name="shield" className={`w-5 h-5 ${activeTab === "admin" ? "text-purple-900" : "text-purple-600"}`} />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab("help")}
          className={`flex flex-col items-center justify-center p-1 rounded-lg cursor-pointer transition flex-1 ${
            activeTab === "help" ? "text-[#4a7c59] font-black" : "text-slate-500 font-semibold"
          }`}
        >
          <Icon name="help-circle" className={`w-5 h-5 ${activeTab === "help" ? "text-[#4a7c59]" : "text-slate-500"}`} />
          <span className="text-[10px] mt-0.5">{t.help}</span>
        </button>
      </div>

      {/* 6. OFFICER LOGIN MODAL */}
      {officerLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-slate-300 w-full max-w-sm rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#2a4732] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Icon name="shield" className="w-5 h-5 text-yellow-300" />
                <span>Mandi Officer Portal Login</span>
              </div>
              <button
                type="button"
                onClick={() => setOfficerLoginModal(false)}
                className="text-white font-bold text-base px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOfficerLogin} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <p className="text-slate-600 font-medium text-[11px]">
                Authorized government access for Mandi Secretaries, Gate Officers, and Weighbridge Operators.
              </p>

              {officerLoginError && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded font-bold">
                  {officerLoginError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Officer / Employee ID
                </label>
                <input
                  type="text"
                  required
                  value={officerIdInput}
                  onChange={(e) => setOfficerIdInput(e.target.value)}
                  placeholder="e.g. MANDI-701"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Security PIN / Password
                </label>
                <input
                  type="password"
                  required
                  value={officerPinInput}
                  onChange={(e) => setOfficerPinInput(e.target.value)}
                  placeholder="Enter PIN / Password"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#4a7c59] hover:bg-[#3b6447] text-white py-2.5 rounded-lg font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Icon name="log-in" className="w-4 h-4" />
                  <span>Secure Login</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. REQUIRED DOCS MODAL */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white border border-slate-300 w-full max-w-md rounded-t-2xl sm:rounded-xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-[#2a4732] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Icon name="file-text" className="w-4 h-4 text-yellow-300" />
                <span>{t.requiredDocsHeader}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="text-white font-bold text-base px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-[#4a7c59] text-white font-bold flex items-center justify-center text-xs">
                  1
                </span>
                <div>
                  <div className="font-bold text-slate-900">{t.doc1}</div>
                  <div className="text-[10px] text-slate-500">{t.doc1Sub}</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-[#4a7c59] text-white font-bold flex items-center justify-center text-xs">
                  2
                </span>
                <div>
                  <div className="font-bold text-slate-900">{t.doc2}</div>
                  <div className="text-[10px] text-slate-500">{t.doc2Sub}</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-[#4a7c59] text-white font-bold flex items-center justify-center text-xs">
                  3
                </span>
                <div>
                  <div className="font-bold text-slate-900">{t.doc3}</div>
                  <div className="text-[10px] text-slate-500">{t.doc3Sub}</div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                <span className="w-6 h-6 rounded bg-[#4a7c59] text-white font-bold flex items-center justify-center text-xs">
                  4
                </span>
                <div>
                  <div className="font-bold text-slate-900">{t.doc4}</div>
                  <div className="text-[10px] text-slate-500">{t.doc4Sub}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDocsModal(false)}
                className="w-full bg-[#4a7c59] hover:bg-[#3b6447] text-white py-2.5 rounded-lg font-bold text-xs mt-2 cursor-pointer active:scale-95"
              >
                {t.understoodBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION / CANCELLATION REASON MODAL */}
      {rejectModalOpen && rejectTargetTokenId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white border border-slate-300 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-red-700 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚠️</span>
                <div>
                  <h3 className="font-extrabold text-sm">Mandi Gate Rejection & Cancellation</h3>
                  <p className="text-[10px] text-red-100 font-mono">Token: {rejectTargetTokenId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="text-white font-bold text-base px-2 cursor-pointer hover:bg-white/10 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="p-4 sm:p-5 space-y-3.5 text-xs">
              <p className="text-slate-700 font-semibold text-xs">
                Please specify the official reason for rejecting or cancelling this gate pass. The reason will be recorded in the registry and displayed to the farmer.
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Official Rejection Category *
                </label>
                <select
                  value={rejectSelectedReason}
                  onChange={(e) => setRejectSelectedReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-xs"
                >
                  <option value="High Moisture Content (>17.0% limit)">
                    🌾 High Moisture Content (&gt;17.0% limit) (अत्यधिक नमी)
                  </option>
                  <option value="Excessive Foreign Matter / Impurities (>2.0%)">
                    🍂 Excessive Impurities / Dirt (&gt;2.0%) (अशुद्धियां/कचरा)
                  </option>
                  <option value="Document Discrepancy (Aadhaar / Land Record mismatch)">
                    📑 Document Discrepancy (Aadhaar/Khasra mismatch) (दस्तावेज़ में त्रुटि)
                  </option>
                  <option value="Late Arrival / Expired Arrival Window (>2 hours)">
                    ⏱️ Expired / Late Arrival (&gt;2 hours) (समय समाप्त)
                  </option>
                  <option value="Farmer Requested Cancellation">
                    👤 Farmer Requested Cancellation (किसान के अनुरोध पर)
                  </option>
                  <option value="Unregistered / Prohibited Crop Variety">
                    🚫 Non-FAQ Crop / Unregistered Variety (अमान्य किस्म)
                  </option>
                  <option value="Other / Custom Reason">
                    ✍️ Other Specific Reason (अन्य कारण)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Inspector Notes / Moisture Reading (Optional)
                </label>
                <input
                  type="text"
                  value={rejectCustomNotes}
                  onChange={(e) => setRejectCustomNotes(e.target.value)}
                  placeholder="e.g. Moisture measured 18.5% at gate. Sun-drying advised."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-medium"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-red-700 hover:bg-red-800 text-white py-2.5 rounded-lg font-bold shadow-xs cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Confirm Rejection ✕</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. IVR PHONE SIMULATOR MODAL */}
      <IvrPhoneModal
        isOpen={showIvrModal}
        onClose={() => setShowIvrModal(false)}
        onBookingSuccess={(newBooking) => {
          setActiveToken(newBooking);
          if (typeof window !== "undefined") {
            localStorage.setItem("kisansetu_user_token_id", newBooking.tokenId);
          }
          setCentresData((prev) =>
            prev.map((c) =>
              c.name === newBooking.centreName || c.id === newBooking.centreId
                ? { ...c, availableSlots: Math.max(0, c.availableSlots - 1) }
                : c
            )
          );
          setAdminBookings((prev) => [
            newBooking,
            ...prev.filter((b) => b.tokenId !== newBooking.tokenId),
          ]);
          refreshAdminBookings();
        }}
      />

      {/* 9. 3-STEP BOOKING MODAL */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-3">
          <div className="bg-white border border-slate-300 w-full max-w-lg rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#4a7c59] text-white px-4 py-3 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded-full tracking-wide">
                  {t.stepLabel} {bookingStep} {t.ofLabel} 3: {
                    bookingStep === 1
                      ? (lang === "hi" ? "मंडी चुनें" : "Select Mandi")
                      : bookingStep === 2
                      ? (lang === "hi" ? "किसान व फसल विवरण" : "Farmer & Crop Details")
                      : (lang === "hi" ? "तारीख व समय स्लॉट" : "Date & Time Slot")
                  }
                </span>
                <h3 className="text-xs sm:text-sm font-bold mt-0.5 truncate">
                  {selectedCentreForBooking ? selectedCentreForBooking.name : "KisanSetu Gate Pass Booking"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setBookingModalOpen(false)}
                className="text-white font-bold text-base px-1.5 py-0.5 hover:bg-white/10 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {bookingError && (
              <div className="m-3 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-semibold shrink-0">
                {bookingError}
              </div>
            )}

            <div className="p-4 overflow-y-auto flex-1 text-xs">
              {/* STEP 1: CHOOSE MANDI */}
              {bookingStep === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-slate-900 text-xs sm:text-sm">
                      {lang === "hi" ? "1. अपने नज़दीकी खरीद केंद्र (मंडी) का चयन करें:" : "1. Select your nearest procurement mandi:"}
                    </label>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {filteredCentres.length} Mandis
                    </span>
                  </div>

                  {/* Search inside modal */}
                  <div className="relative">
                    <Icon name="search" className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={modalMandiSearch}
                      onChange={(e) => setModalMandiSearch(e.target.value)}
                      placeholder={lang === "hi" ? "मंडी या जिले का नाम खोजें..." : "Search mandi or district..."}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4a7c59]"
                    />
                  </div>

                  {/* Scrollable Mandi List */}
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {filteredCentres
                      .filter((c: any) => {
                        const q = modalMandiSearch.toLowerCase().trim();
                        return (
                          q === "" ||
                          c.name.toLowerCase().includes(q) ||
                          c.district.toLowerCase().includes(q) ||
                          c.tehsil.toLowerCase().includes(q)
                        );
                      })
                      .map((centre: any) => {
                        const isSelected = selectedCentreForBooking?.id === centre.id;
                        return (
                          <div
                            key={centre.id}
                            onClick={() => {
                              setSelectedCentreForBooking(centre);
                              if (centre.crops && centre.crops.length > 0 && !centre.crops.includes(formCrop)) {
                                setFormCrop(centre.crops[0]);
                              }
                            }}
                            className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-2 ${
                              isSelected
                                ? "bg-[#ebf2ee] border-[#4a7c59] ring-2 ring-[#4a7c59]/30 shadow-xs"
                                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                            }`}
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected ? "border-[#4a7c59] bg-[#4a7c59]" : "border-slate-400"
                                }`}>
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                                </span>
                                <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight">
                                  {centre.name}
                                </h4>
                                <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded">
                                  {centre.district}
                                </span>
                                {centre.displayDistance !== undefined && centre.displayDistance <= 15 && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-1 rounded font-bold">
                                    Nearest
                                  </span>
                                )}
                              </div>

                              <div className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap pl-5">
                                <span>📍 {centre.displayDistance !== undefined ? centre.displayDistance : centre.distance} km</span>
                                <span>•</span>
                                <span>⏱️ Wait: <strong>{centre.waitTime}</strong></span>
                                <span>•</span>
                                <span>🟢 <strong>{centre.availableSlots}</strong> slots left</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedCentreForBooking) {
                        setBookingError("Please select a mandi to proceed");
                        return;
                      }
                      setBookingError(null);
                      setBookingStep(2);
                    }}
                    className="w-full bg-[#4a7c59] hover:bg-[#3b6447] text-white py-2.5 rounded-lg font-bold transition shadow-xs mt-2 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>{lang === "hi" ? "अगला: किसान विवरण भरें →" : "Next: Farmer Details →"}</span>
                  </button>
                </div>
              )}

              {/* STEP 2: FARMER & CROP DETAILS */}
              {bookingStep === 2 && selectedCentreForBooking && (
                <div className="space-y-3">
                  {/* Selected Mandi Capsule with Change Option */}
                  <div className="p-2 bg-[#ebf2ee] border border-[#4a7c59]/30 rounded-lg flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 truncate">
                      <span>🏢</span>
                      <strong className="text-[#2a4732] truncate">{selectedCentreForBooking.name}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="text-[10px] text-[#4a7c59] font-bold underline shrink-0 cursor-pointer ml-2"
                    >
                      {lang === "hi" ? "मंडी बदलें" : "Change Mandi"}
                    </button>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {t.farmerName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        {t.mobileNo} *
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        required
                        maxLength={10}
                        pattern="[0-9]{10}"
                        value={formMobile}
                        onChange={(e) => setFormMobile(e.target.value.replace(/\D/g, ""))}
                        placeholder={t.mobilePlaceholder}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        {t.aadhaarLast4} *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        maxLength={4}
                        pattern="[0-9]{4}"
                        value={formAadhaar}
                        onChange={(e) => setFormAadhaar(e.target.value.replace(/\D/g, ""))}
                        placeholder={t.aadhaarPlaceholder}
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 text-xs font-bold font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {t.cropType} *
                    </label>
                    <select
                      value={formCrop}
                      onChange={(e) => setFormCrop(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold text-xs"
                    >
                      {selectedCentreForBooking.crops.map((c: string, i: number) => (
                        <option key={i} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {t.qtlLabel} *
                    </label>
                    <input
                      type="number"
                      inputMode="numeric"
                      required
                      min="1"
                      max="500"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 text-sm font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setBookingStep(1)}
                      className="w-1/3 bg-slate-100 border border-slate-300 text-slate-700 py-2.5 rounded-lg font-bold cursor-pointer hover:bg-slate-200"
                    >
                      ← {t.back}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (!formName.trim() || !formMobile.trim() || !formAadhaar.trim()) {
                          setBookingError("Please fill all required fields");
                          return;
                        }
                        if (formMobile.trim().length !== 10) {
                          setBookingError("Please enter a valid 10-digit mobile number");
                          return;
                        }
                        setBookingError(null);
                        setBookingStep(3);
                      }}
                      className="w-2/3 bg-[#4a7c59] hover:bg-[#3b6447] text-white py-2.5 rounded-lg font-bold transition shadow-xs cursor-pointer active:scale-95"
                    >
                      {t.selectSlot} (Next) →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DATE & TIME SLOT SELECTION */}
              {bookingStep === 3 && selectedCentreForBooking && (
                <form onSubmit={handleConfirmBooking} className="space-y-3">
                  {/* Summary Header */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2a4732] truncate">{selectedCentreForBooking.name}</span>
                      <span className="font-mono font-bold text-slate-700">{formQuantity} Qtl {formCrop}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {formName} • {formMobile}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {t.dateLabel} *
                    </label>
                    <select
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900 text-xs"
                    >
                      <option value="2026-08-27">{t.tomorrow} (27 Aug 2026)</option>
                      <option value="2026-08-28">{t.dayAfter} (28 Aug 2026)</option>
                      <option value="2026-08-29">{t.saturday} (29 Aug 2026)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      {t.slotLabel} *
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] sm:text-[11px]">
                      {[
                        "07:00 AM - 09:00 AM",
                        "09:00 AM - 11:00 AM",
                        "11:00 AM - 01:00 PM",
                        "02:00 PM - 04:00 PM",
                      ].map((slotStr) => (
                        <button
                          key={slotStr}
                          type="button"
                          onClick={() => setFormSlot(slotStr)}
                          className={`p-2 rounded-lg border text-left font-bold cursor-pointer transition ${
                            formSlot === slotStr
                              ? "bg-[#4a7c59] text-white border-[#4a7c59] shadow-xs"
                              : "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100"
                          }`}
                        >
                          {slotStr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs flex justify-between font-bold">
                    <span className="text-amber-900">{t.estPayout}:</span>
                    <span className="text-[#c86d12] text-sm font-mono font-black">
                      ₹
                      {(
                        (parseFloat(formQuantity || "0") || 0) *
                        (MSP_RATES.find((m) =>
                          m.crop.toLowerCase().includes(formCrop.toLowerCase())
                        )?.msp || 2300)
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={isSubmittingBooking}
                      onClick={() => setBookingStep(2)}
                      className="w-1/3 bg-slate-100 border border-slate-300 text-slate-700 py-2.5 rounded-lg font-bold cursor-pointer hover:bg-slate-200"
                    >
                      ← {t.back}
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmittingBooking}
                      className="w-2/3 bg-[#4a7c59] hover:bg-[#3b6447] disabled:opacity-50 text-white py-2.5 rounded-lg font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      {isSubmittingBooking ? (
                        <span>Processing...</span>
                      ) : (
                        <span>{t.confirmBooking} ✓</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 9. WARM FARMER-FIRST FOOTER */}
      <footer className="bg-[#1f2421] text-slate-300 pt-8 pb-28 md:pb-8 px-4 text-xs border-t border-slate-800">
        <div className="w-full max-w-[96%] xl:max-w-[95%] 2xl:max-w-[1780px] mx-auto px-3 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            {/* Branding & Prototype Notice */}
            <div className="flex items-center gap-3.5">
              <img
                src={kisanSetuCircle}
                alt="KisanSetu Logo"
                className="w-11 h-11 object-contain shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-white text-base">
                    {t.portalName}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full">
                    {t.prototypeTag || "GovTech Prototype"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t.digitalMandiAccess || "Digital Mandi Access"} • Designed for Indian Farmers & APMC Mandis
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              <button
                type="button"
                onClick={() => setActiveTab("home")}
                className="hover:text-white transition cursor-pointer"
              >
                {t.home}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("centres")}
                className="hover:text-white transition cursor-pointer"
              >
                {t.centres}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("msp-rates")}
                className="hover:text-white transition cursor-pointer"
              >
                {t.mspRates}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("moisture")}
                className="hover:text-white transition cursor-pointer"
              >
                {t.moistureTab || "Moisture Check"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("help")}
                className="hover:text-white transition cursor-pointer"
              >
                {t.help}
              </button>
              <button
                type="button"
                onClick={() => setOfficerLoginModal(true)}
                className="text-slate-300 hover:text-white underline cursor-pointer font-semibold ml-2"
              >
                Mandi Officer Login
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400 text-center sm:text-left">
            <p>
              GovTech Innovation Prototype • Not an official Government of India production deployment.
            </p>
            <p className="flex items-center gap-1.5 justify-center sm:justify-start">
              <span>📞 Govt. Kisan Call Centre:</span>
              <a href="tel:18001801551" className="text-amber-400 hover:text-amber-300 font-bold font-mono">
                1800-180-1551
              </a>
              <span className="text-slate-500">(Toll-Free, 6 AM – 10 PM)</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
