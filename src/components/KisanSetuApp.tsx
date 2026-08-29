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
    if (saved && (saved === "hi" || saved === "pa" || saved === "mr" || saved === "en")) {
      setLangState(saved);
    }

    const handleExternalLang = (e: any) => {
      if (e.detail && (e.detail === "hi" || e.detail === "pa" || e.detail === "mr" || e.detail === "en")) {
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
        : lang === "pa"
        ? "ਕੀ ਤੁਸੀਂ ਆਪਣੀ ਗੇਟ ਪਰਚੀ ਰੱਦ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ?"
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
      {/* 1. TOP GOVT & UTILITY BAR (Warm Forest Green) */}
      <header className="bg-[#2a4732] text-white text-xs border-b border-[#1b3022]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-emerald-100 text-[11px] sm:text-xs">
              Dept. of Agriculture • Govt. of India
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Officer Login / Status */}
            {isOfficerLoggedIn ? (
              <div className="flex items-center gap-1 bg-emerald-900/80 border border-emerald-400/40 px-2 py-0.5 rounded text-[10px]">
                <span className="font-bold text-emerald-200">Officer S. K. Verma</span>
                <button
                  type="button"
                  onClick={handleOfficerLogout}
                  className="text-red-200 hover:text-white font-bold ml-1 cursor-pointer underline"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setOfficerLoginModal(true)}
                className="text-emerald-100 hover:text-white flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer transition text-[10px] sm:text-[11px] font-semibold"
              >
                <Icon name="shield" className="w-3 h-3 text-emerald-300" />
                <span>Officer Login</span>
              </button>
            )}

            {/* Helpline / IVR */}
            <button
              type="button"
              onClick={() => setShowIvrModal(true)}
              className="text-yellow-300 hover:underline font-bold flex items-center gap-1 text-[10px] sm:text-[11px] cursor-pointer"
            >
              <Icon name="phone-call" className="w-3 h-3 text-yellow-300" />
              <span>IVR Helpline: 1800-180-1551</span>
            </button>

            {/* Top Language Switcher */}
            <div className="hidden sm:flex items-center bg-black/20 rounded p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-1.5 py-0.5 rounded cursor-pointer font-bold ${
                  lang === "hi" ? "bg-white text-[#2a4732]" : "text-white/80"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLang("pa")}
                className={`px-1.5 py-0.5 rounded cursor-pointer font-bold ${
                  lang === "pa" ? "bg-white text-[#2a4732]" : "text-white/80"
                }`}
              >
                ਪੰਜਾਬੀ
              </button>
              <button
                type="button"
                onClick={() => setLang("mr")}
                className={`px-1.5 py-0.5 rounded cursor-pointer font-bold ${
                  lang === "mr" ? "bg-white text-[#2a4732]" : "text-white/80"
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-1.5 py-0.5 rounded cursor-pointer font-bold ${
                  lang === "en" ? "bg-white text-[#2a4732]" : "text-white/80"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN BRANDING BAR (Warm White with Clean Logo) */}
      <section className="bg-white border-b border-[#d8ccbe] sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-2">
          <div
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer shrink-0"
          >
            {/* Clean Circular Logo */}
            <img
              src={kisanSetuCircle}
              alt="KisanSetu Logo"
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0"
            />
            <div>
              <h1 className="text-sm sm:text-lg font-extrabold text-slate-900 leading-tight">
                {t.portalName}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium line-clamp-1">{t.portalSub}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Pills on Header */}
            <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 p-0.5 text-[11px] sm:text-xs">
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer font-bold ${
                  lang === "hi" ? "bg-[#4a7c59] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLang("pa")}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer font-bold ${
                  lang === "pa" ? "bg-[#4a7c59] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ਪੰਜਾਬੀ
              </button>
              <button
                type="button"
                onClick={() => setLang("mr")}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer font-bold ${
                  lang === "mr" ? "bg-[#4a7c59] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded cursor-pointer font-bold ${
                  lang === "en" ? "bg-[#4a7c59] text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                EN
              </button>
            </div>

            {/* Desktop / Tablet Gate Pass Button */}
            <button
              type="button"
              onClick={() => handleOpenBooking()}
              className="hidden sm:flex bg-[#4a7c59] hover:bg-[#3b6447] text-white px-3.5 py-2 rounded-lg text-xs font-bold items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Icon name="ticket" className="w-4 h-4 text-emerald-200" />
              <span>{t.bookSlotBtn}</span>
            </button>
          </div>
        </div>

        {/* Desktop Tabs Bar */}
        <div className="bg-slate-50 border-t border-slate-200 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto text-xs sm:text-sm font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("home")}
              className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
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
              className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
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
              className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
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
              className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "msp-rates"
                  ? "border-[#4a7c59] text-[#4a7c59] font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="calculator" className="w-4 h-4" />
              <span>{t.mspRates}</span>
            </button>

            {/* Officer Tab: Visible ONLY after officer logs in */}
            {isOfficerLoggedIn && (
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "admin"
                    ? "border-purple-700 text-purple-800 font-bold bg-white"
                    : "border-transparent text-purple-700 hover:text-purple-900"
                }`}
              >
                <Icon name="shield" className="w-4 h-4 text-purple-700" />
                <span>Mandi Officer</span>
                {adminBookings.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[10px] rounded-full font-bold">
                    {adminBookings.length}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("help")}
              className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "help"
                  ? "border-[#4a7c59] text-[#4a7c59] font-bold bg-white"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon name="help-circle" className="w-4 h-4" />
              <span>{t.help}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. WARM NOTICE MARQUEE */}
      <section className="bg-[#fdf6ee] border-b border-[#e6d8c3] px-3 sm:px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-base shrink-0">📢</span>
            <p className="text-slate-800 truncate text-[11px] sm:text-xs">
              <strong className="text-[#c86d12] font-bold">MSP Paddy 2025-26: ₹2,300/Qtl</strong> •{" "}
              {t.dryingNotice}
            </p>
          </div>
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline shrink-0">
            Toll-Free: 1800-180-1551
          </span>
        </div>
      </section>

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex-1 space-y-4 sm:space-y-6 pb-24 md:pb-8">
        {/* TAB: HOME DASHBOARD (The Beloved 4-Box Layout) */}
        {activeTab === "home" && (
          <div className="space-y-4 sm:space-y-5">
            {/* 4 Primary Numbered Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CARD 1: MANDI GATE PASS */}
              <div className="ks-card p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between border-b border-[#e6d8c3] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#ebf2ee] text-[#4a7c59] flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {t.gatePassBranch}
                        </h2>
                        <p className="text-xs text-slate-500">{t.gatePassDesc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                      Fast Entry
                    </span>
                  </div>

                  {activeToken && (
                    <div className="mt-3 bg-[#fdf6ee] border border-[#e6d8c3] p-2.5 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">
                          {t.activeToken}: <strong className="text-[#c86d12]">{activeToken.tokenId}</strong>
                        </span>
                        <span className="bg-[#4a7c59] text-white text-[9px] px-1.5 py-0.2 rounded font-bold">
                          Gate #2
                        </span>
                      </div>
                      <div className="text-slate-700 truncate text-[11px]">{activeToken.centreName}</div>
                      <div className="text-slate-600 text-[10px]">
                        Slot: <strong>{activeToken.slot}</strong> ({activeToken.date})
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f4f6f0]">
                  <button
                    type="button"
                    onClick={() => handleOpenBooking()}
                    className="w-full bg-[#4a7c59] hover:bg-[#3b6447] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Icon name="ticket" className="w-4 h-4" />
                    <span>{t.quickBookBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("my-booking")}
                    className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-[#c2a68c] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Icon name="search" className="w-4 h-4 text-[#4a7c59]" />
                    <span>{t.viewPassBtn}</span>
                  </button>
                </div>
              </div>

              {/* CARD 2: MSP PRICE & RATES */}
              <div className="ks-card p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between border-b border-[#e6d8c3] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#fdf6ee] text-[#c86d12] flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {t.mspBranch}
                        </h2>
                        <p className="text-xs text-slate-500">{t.mspDesc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-[#fdf6ee] text-[#c86d12] px-2 py-0.5 rounded-full border border-amber-200">
                      ₹2,300/Qtl
                    </span>
                  </div>

                  <div className="mt-3 bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs flex items-center justify-between">
                    <span className="font-semibold text-slate-700">100 Quantity (Quintals) =</span>
                    <span className="font-extrabold text-[#c86d12] text-sm">₹2,30,000</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f4f6f0]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("msp-rates")}
                    className="w-full bg-[#c86d12] hover:bg-[#a5590d] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Icon name="calculator" className="w-4 h-4" />
                    <span>{t.calcEarningsBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("msp-rates")}
                    className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-[#c2a68c] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Icon name="file-text" className="w-4 h-4 text-[#c86d12]" />
                    <span>{t.checkMspBtn}</span>
                  </button>
                </div>
              </div>

              {/* CARD 3: MOISTURE TESTER & PRE-CHECK */}
              <div className="ks-card p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between border-b border-[#e6d8c3] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {t.moistureBranch}
                        </h2>
                        <p className="text-xs text-slate-500">{t.moistureDesc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                      Limit: 17.0%
                    </span>
                  </div>

                  {/* Informational Pre-Check Disclaimer */}
                  <div className="mt-2.5 p-2 bg-blue-50/70 border border-blue-200/80 rounded-lg text-[10px] sm:text-[11px] text-blue-900 space-y-0.5">
                    <div className="font-bold flex items-center gap-1 text-blue-950">
                      <span>🌾</span>
                      <span>Farmer pre-check: enter reading from moisture meter.</span>
                    </div>
                    <p className="text-[10px] text-blue-700 leading-tight">
                      Official moisture verification is performed at the procurement centre.
                    </p>
                  </div>

                  {/* Meter Reading Input & Presets */}
                  <div className="mt-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-800 text-[11px] font-bold">
                      <label htmlFor="grain-moisture-input" className="flex items-center gap-1">
                        <Icon name="droplet" className="w-3.5 h-3.5 text-blue-600" />
                        <span>{t.moistureInputLabel}:</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">Max: 17.0%</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          id="grain-moisture-input"
                          type="number"
                          step="0.1"
                          min="0"
                          max="40"
                          value={inputMoisture}
                          onChange={(e) => setInputMoisture(e.target.value)}
                          placeholder="e.g. 16.5"
                          className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-sm font-mono font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#4a7c59] shadow-inner"
                        />
                        <span className="absolute right-3 top-1.5 text-xs font-black text-slate-400 font-mono">%</span>
                      </div>

                      <input
                        type="range"
                        min="10"
                        max="24"
                        step="0.5"
                        value={parseFloat(inputMoisture) || 16.5}
                        onChange={(e) => setInputMoisture(e.target.value)}
                        className="w-20 sm:w-24 accent-[#4a7c59] h-2 bg-slate-200 rounded cursor-pointer"
                        title="Fine-tune moisture reading"
                      />
                    </div>

                    {/* Quick Demo Presets */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Presets:</span>
                      {[
                        { l: "14%", v: "14.0" },
                        { l: "16.5%", v: "16.5" },
                        { l: "17% (Limit)", v: "17.0" },
                        { l: "18.5%", v: "18.5" },
                        { l: "20%", v: "20.0" },
                      ].map((p) => (
                        <button
                          key={p.v}
                          type="button"
                          onClick={() => setInputMoisture(p.v)}
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border cursor-pointer transition ${
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
                    <div className={`p-2 rounded-lg border text-xs space-y-0.5 transition ${moistureAnalysis.color}`}>
                      <div className="flex items-center justify-between font-black text-xs sm:text-sm">
                        <span>{moistureAnalysis.badge}</span>
                        <span className="font-mono text-xs">
                          {moistureAnalysis.isValid ? `${moistureAnalysis.reading?.toFixed(1)}%` : "--"}
                        </span>
                      </div>
                      <p className="text-[10px] font-medium leading-tight">{moistureAnalysis.sub}</p>
                      <p className="text-[10px] font-bold">{moistureAnalysis.actionHint}</p>
                      {moistureLastTestedAt && (
                        <div className="text-[9px] text-slate-500 pt-1 border-t border-black/10 flex justify-between">
                          <span>Source: Digital Meter Input</span>
                          <span>Checked: {moistureLastTestedAt}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* How It Works Collapsible */}
                  <div className="mt-1.5">
                    <button
                      type="button"
                      onClick={() => setShowMoistureGuide(!showMoistureGuide)}
                      className="text-[10px] text-blue-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>ℹ️</span>
                      <span>{showMoistureGuide ? "Hide testing guide ▲" : "How does moisture testing work? ▼"}</span>
                    </button>
                    {showMoistureGuide && (
                      <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-700 space-y-0.5 font-medium">
                        <p className="font-bold text-slate-900">{t.howItWorksTitle}</p>
                        <p>{t.howItWorksStep1}</p>
                        <p>{t.howItWorksStep2}</p>
                        <p>{t.howItWorksStep3}</p>
                        <p>{t.howItWorksStep4}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f4f6f0]">
                  <button
                    type="button"
                    onClick={() => {
                      const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
                      setMoistureLastTestedAt(`Today, ${timeStr}`);
                    }}
                    className="w-full bg-[#4a7c59] hover:bg-[#3b6447] text-white py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Icon name="droplet" className="w-3.5 h-3.5" />
                    <span>{t.testMoistureBtn}</span>
                  </button>

                  {moistureAnalysis.isPass ? (
                    <button
                      type="button"
                      onClick={() => handleOpenBooking()}
                      className="w-full bg-[#c86d12] hover:bg-[#a5590d] text-white py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <span>Book Pass →</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => alert("Sun-Drying Guide: Spread grain 2-3 inches thick in direct sunlight on mandi drying yard or tarpaulin for 2-4 hours to drop moisture below 17.0%.")}
                      className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 py-2 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition active:scale-95 cursor-pointer"
                    >
                      <span>Drying Tips ☀️</span>
                    </button>
                  )}
                </div>
              </div>

              {/* CARD 4: HELPLINE & ASSISTANCE */}
              <div className="ks-card p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between border-b border-[#e6d8c3] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-700 flex items-center justify-center font-bold text-sm">
                        4
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {t.supportBranch}
                        </h2>
                        <p className="text-xs text-slate-500">{t.supportDesc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-pink-50 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200">
                      Toll Free
                    </span>
                  </div>

                  <div className="mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] sm:text-[11px] text-slate-700 space-y-1">
                    <div className="font-bold text-slate-900">{t.requiredDocs}:</div>
                    <div className="grid grid-cols-2 gap-1 font-medium">
                      <span>1. {t.doc1}</span>
                      <span>2. {t.doc2}</span>
                      <span>3. {t.doc3}</span>
                      <span>4. {t.doc4}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#f4f6f0]">
                  <button
                    type="button"
                    onClick={() => setShowIvrModal(true)}
                    className="w-full bg-[#c86d12] hover:bg-[#a5590d] text-white py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    <Icon name="phone-call" className="w-4 h-4" />
                    <span>{t.callHelplineBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDocsModal(true)}
                    className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-[#c2a68c] py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <Icon name="file-text" className="w-4 h-4 text-[#c86d12]" />
                    <span>{t.viewDocsBtn}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Nearest Procurement Mandis */}
            <div className="ks-card p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#e6d8c3] pb-2">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Icon name="map-pin" className="w-4 h-4 text-[#4a7c59]" />
                    <span>{t.nearestMandisTitle}</span>
                  </h3>
                  <p className="text-xs text-slate-500">{t.nearestMandisSub}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("centres")}
                  className="text-xs font-bold text-[#4a7c59] hover:underline cursor-pointer"
                >
                  {t.viewAllMandis} ({centresData.length}) →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {centresData.slice(0, 3).map((centre) => (
                  <div
                    key={centre.id}
                    onClick={() => handleOpenBooking(centre)}
                    className="p-3 bg-slate-50 hover:bg-[#ebf2ee]/50 border border-slate-200 hover:border-[#4a7c59] rounded-xl cursor-pointer transition flex flex-col justify-between space-y-2 active:scale-98"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 truncate">{centre.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {centre.district} • {centre.distance} {t.distKm}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200">
                      <span className="text-[#2a4732] font-bold bg-[#ebf2ee] px-2 py-0.5 rounded-md border border-[#4a7c59]/30 text-[10px]">
                        {t.waitingTime}: {centre.waitTime}
                      </span>
                      <span className="font-bold text-[#4a7c59] text-xs">{t.bookSlotArrow}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
          <div className="space-y-4 max-w-4xl mx-auto">

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

        {/* TAB: HELP & CITIZEN CHARTER */}
        {activeTab === "help" && (
          <div className="space-y-4">
            {/* IVR Voice Phone Feature Banner */}
            <div className="bg-gradient-to-r from-[#2a4732] to-[#4a7c59] text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-2xl shrink-0 border border-white/20">
                  📞
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base leading-snug">
                    {lang === "hi"
                      ? "किसानसेतु 24x7 IVR फोन बुकिंग सेवा (1800-180-1551)"
                      : "KisanSetu 24x7 IVR Voice Booking Service (1800-180-1551)"}
                  </h3>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    {lang === "hi"
                      ? "बिना स्मार्टफोन व बिना इंटरनेट, साधारण कीपैड फोन से स्लॉट बुक करें व टोकन पाएं।"
                      : "Book procurement slots and receive gate pass tokens via phone call without internet."}
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

            <div className="ks-card p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 border-b border-[#e6d8c3] pb-2">
                {t.tollFreeTitle}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-[#fdf6ee] border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    {t.kisanHelpline}
                  </span>
                  <a href="tel:18001801551" className="text-base font-black text-[#c86d12] block mt-1 font-mono">
                    1800-180-1551
                  </a>
                </div>

                <div className="p-3.5 bg-[#ebf2ee] border border-[#4a7c59]/30 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    {t.kisanCallCenter}
                  </span>
                  <a href="tel:1551" className="text-base font-black text-[#4a7c59] block mt-1 font-mono">
                    1551
                  </a>
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
                </div>
              </div>
            </div>

            <div className="ks-card p-4 space-y-3 text-xs">
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

      {/* 9. WARM FOOTER */}
      <footer className="bg-[#1f2421] text-slate-300 pt-6 pb-28 md:pb-6 px-4 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <img
              src={kisanSetuCircle}
              alt="KisanSetu Logo"
              className="w-10 h-10 object-contain shrink-0"
            />
            <div>
              <p className="font-bold text-white text-sm">
                {t.portalName} <span className="text-emerald-400 font-normal">•</span> {t.footerGovt}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">{t.footerTagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 text-xs">
            <button
              type="button"
              onClick={() => setOfficerLoginModal(true)}
              className="text-slate-300 hover:text-white underline cursor-pointer font-semibold"
            >
              Mandi Officer Portal
            </button>
            <a
              href="tel:18001801551"
              className="text-amber-400 hover:text-amber-300 transition font-bold flex items-center gap-1.5"
            >
              <Icon name="phone-call" className="w-3.5 h-3.5" />
              <span>1800-180-1551 (Toll-Free)</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
