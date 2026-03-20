"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/context";
import { useAuthStore } from "@/stores/authStore";
import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
  Save,
  Key,
  Globe,
  User,
  ShieldCheck,
  Database,
  Settings as SettingsIcon,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Download,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function SettingsPage() {
  const { user, profile, fetchProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState("keys");

  const [profileData, setProfileData] = useState({
    username: "",
    full_name: "",
    institution: "",
    bio: "",
  });
  
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showCoreKey, setShowCoreKey] = useState(false);

  const [geminiKey, setGeminiKey] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("nl_gemini_key") || ""
      : "",
  );
  const [coreKey, setCoreKey] = useState(() =>
    typeof window !== "undefined"
      ? localStorage.getItem("nl_core_key") || ""
      : "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [sources, setSources] = useState(() => {
    if (typeof window === "undefined")
      return {
        ss: true,
        oa: true,
        arxiv: true,
        pm: true,
        core: true,
        cr: true,
        epmc: true,
        doaj: true,
        upw: true,
      };
    const storedSources = localStorage.getItem("nl_sources");
    if (storedSources) {
      try {
        return JSON.parse(storedSources);
      } catch (e) {
        console.error("Failed to parse sources from localStorage");
      }
    }
    return {
      ss: true,
      oa: true,
      arxiv: true,
      pm: true,
      core: true,
      cr: true,
      epmc: true,
      doaj: true,
      upw: true,
    };
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        username: profile.username || "",
        full_name: profile.full_name || "",
        institution: profile.institution || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!profile || profileData.username === profile.username) {
        setUsernameStatus("idle");
        return;
      }
      
      const val = profileData.username.trim();
      if (!val || val.length < 3 || /[^a-zA-Z0-9_.]/.test(val)) {
        setUsernameStatus("invalid");
        return;
      }

      setUsernameStatus("checking");
      try {
        const q = query(collection(db, "users"), where("username", "==", val));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setUsernameStatus("taken");
        } else {
          setUsernameStatus("available");
        }
      } catch (err) {
        console.error(err);
        setUsernameStatus("idle");
      }
    };

    const timeout = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeout);
  }, [profileData.username, profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    if (usernameStatus === "invalid" || usernameStatus === "taken") {
      setSaveMessage({ text: "Please choose a valid & unique username", type: "error" });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }
    
    setIsSaving(true);
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, { ...profileData, updated_at: new Date().toISOString() });
      await fetchProfile(user.uid);
      
      setSaveMessage({ text: "Profile updated successfully", type: "success" });
    } catch (err) {
      console.error(err);
      setSaveMessage({ text: "Failed to update profile", type: "error" });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSaveKeys = () => {
    setIsSaving(true);
    localStorage.setItem("nl_gemini_key", geminiKey);
    localStorage.setItem("nl_core_key", coreKey);

    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage({
        text: "API keys updated successfully",
        type: "success",
      });
      setTimeout(() => setSaveMessage(null), 3000);
    }, 800);
  };

  const toggleSource = (id: keyof typeof sources) => {
    const newSources = { ...sources, [id]: !sources[id] };
    setSources(newSources);
    localStorage.setItem("nl_sources", JSON.stringify(newSources));
  };

  const tabs = [
    { id: "keys", label: "API Keys", icon: Key },
    { id: "sources", label: "Sources", icon: Globe },
    { id: "account", label: "Account", icon: ShieldCheck },
  ];

  const sourceDetails = [
    {
      id: "ss",
      name: "Semantic Scholar",
      desc: "200M+ papers, all disciplines",
      color: "var(--src-ss)",
    },
    {
      id: "oa",
      name: "OpenAlex",
      desc: "250M+ works, fully open index",
      color: "var(--src-oa)",
    },
    {
      id: "arxiv",
      name: "arXiv",
      desc: "2.3M+ preprints in CS, Physics, Math",
      color: "var(--src-arxiv)",
    },
    {
      id: "pm",
      name: "PubMed",
      desc: "36M+ biomedical citations",
      color: "var(--src-pm)",
    },
    {
      id: "core",
      name: "CORE",
      desc: "World's largest open access collection",
      color: "var(--src-core)",
    },
    {
      id: "cr",
      name: "Crossref",
      desc: "150M+ scholarly works, DOI metadata",
      color: "var(--src-cr)",
    },
    {
      id: "epmc",
      name: "Europe PMC",
      desc: "42M+ abstracts, life sciences focus",
      color: "var(--src-epmc)",
    },
    {
      id: "doaj",
      name: "DOAJ",
      desc: "9M+ articles from open access journals",
      color: "var(--src-doaj)",
    },
    {
      id: "upw",
      name: "Unpaywall",
      desc: "PDF enrichment pass for DOIs",
      color: "var(--src-upw)",
    },
  ];

  return (
    <>
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h2 className="text-[28px] font-semibold text-[var(--text-primary)] tracking-tight mb-2">
            Settings
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)]">
            Configure your research environment and API integrations.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-56 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-[var(--r-md)] text-[13px] font-medium transition-all whitespace-nowrap",
                    activeTab === tab.id
                      ? "bg-[var(--bg-active)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                  )}
                >
                  <tab.icon
                    className={cn(
                      "w-4 h-4",
                      activeTab === tab.id
                        ? "text-[var(--accent)]"
                        : "text-[var(--text-tertiary)]",
                    )}
                  />
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide">
            <div className="min-w-full">
              <AnimatePresence mode="wait">
                {activeTab === "keys" && (
                  <motion.div
                    key="keys"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    <section className="space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                          API Keys
                        </h3>
                        <p className="text-[13px] text-[var(--text-secondary)]">
                          Your keys are stored locally in your browser and never
                          sent to our servers.
                        </p>
                      </div>

                      <div className="space-y-8">
                        {/* GEMINI KEY */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                              Gemini API Key
                            </label>
                            <a
                              href="https://aistudio.google.com/app/apikey"
                              target="_blank"
                              className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                            >
                              Get free key <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="relative">
                            <input
                              type={showGeminiKey ? "text" : "password"}
                              value={geminiKey}
                              onChange={(e) => setGeminiKey(e.target.value)}
                              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] pl-4 pr-12 py-3 text-[14px] font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
                              placeholder="AIzaSy..."
                            />
                            <button
                              onClick={() => setShowGeminiKey(!showGeminiKey)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                            >
                              {showGeminiKey ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* CORE KEY */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest">
                              CORE API Key (Optional)
                            </label>
                            <a
                              href="https://core.ac.uk/services/api"
                              target="_blank"
                              className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
                            >
                              Get free key <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="relative">
                            <input
                              type={showCoreKey ? "text" : "password"}
                              value={coreKey}
                              onChange={(e) => setCoreKey(e.target.value)}
                              className="w-full bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] pl-4 pr-12 py-3 text-[14px] font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-all"
                              placeholder="Leave blank to use without CORE"
                            />
                            <button
                              onClick={() => setShowCoreKey(!showCoreKey)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                            >
                              {showCoreKey ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[var(--bg-sunken)] border border-[var(--border-faint)] rounded-[var(--r-lg)] flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                          The following 7 sources require no API key: Semantic
                          Scholar, OpenAlex, arXiv, PubMed, Crossref, Europe
                          PMC, DOAJ, and Unpaywall.
                        </p>
                      </div>
                    </section>

                    <div className="pt-6 border-t border-[var(--border-faint)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {saveMessage && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={cn(
                              "text-[13px] font-medium flex items-center gap-1.5",
                              saveMessage.type === "success"
                                ? "text-[var(--emerald)]"
                                : "text-[var(--rose)]",
                            )}
                          >
                            {saveMessage.type === "success" ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            {saveMessage.text}
                          </motion.div>
                        )}
                      </div>
                      <button
                        onClick={handleSaveKeys}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-[var(--accent)] text-white text-[13px] font-bold rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-all uppercase tracking-widest flex items-center gap-2 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Update Keys
                      </button>
                    </div>
                  </motion.div>
                )}

                {activeTab === "sources" && (
                  <motion.div
                    key="sources"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    <section className="space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                          Research Sources
                        </h3>
                        <p className="text-[13px] text-[var(--text-secondary)]">
                          Toggle which academic databases to include in your
                          searches.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sourceDetails.map((src) => (
                          <div
                            key={src.id}
                            className="flex items-center justify-between p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] group hover:border-[var(--border-strong)] transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: src.color }}
                              />
                              <div className="space-y-0.5">
                                <div className="text-[14px] font-medium text-[var(--text-primary)]">
                                  {src.name}
                                </div>
                                <div className="text-[11px] text-[var(--text-tertiary)]">
                                  {src.desc}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => toggleSource(src.id as any)}
                              className={cn(
                                "w-10 h-5 rounded-full relative transition-all duration-300",
                                sources[src.id as keyof typeof sources]
                                  ? "bg-[var(--accent)]"
                                  : "bg-[var(--bg-sunken)] border border-[var(--border-default)]",
                              )}
                            >
                              <div
                                className={cn(
                                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                                  sources[src.id as keyof typeof sources]
                                    ? "right-1"
                                    : "left-1",
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  </motion.div>
                )}

                {activeTab === "account" && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    <section className="space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-[18px] font-semibold text-[var(--text-primary)]">
                          Account Management
                        </h3>
                        <p className="text-[13px] text-[var(--text-secondary)]">
                          Manage your account security and data.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="p-6 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-[14px] font-medium text-[var(--text-primary)]">
                              Export Research Data
                            </div>
                            <div className="text-[12px] text-[var(--text-tertiary)]">
                              Download all your sessions and saved papers in
                              JSON format.
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-[var(--bg-sunken)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[12px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all uppercase tracking-widest">
                            Export
                          </button>
                        </div>

                        <div className="p-6 bg-[var(--rose-muted)] border border-[var(--rose)]/20 rounded-[var(--r-xl)] flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-[14px] font-medium text-[var(--rose)]">
                              Delete All Data
                            </div>
                            <div className="text-[12px] text-[var(--rose)]/60">
                              Permanently remove all your research history. This
                              cannot be undone.
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-[var(--rose)] text-white rounded-[var(--r-md)] text-[12px] font-bold hover:bg-red-600 transition-all uppercase tracking-widest">
                            Delete
                          </button>
                        </div>
                      </div>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
