"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Wrench, Zap, Wind, Settings, Home, Bug, Lock,
  HelpCircle, ChevronDown, CheckCircle, AlertCircle, Clock,
  Image as ImageIcon, Upload, Mail, X,
} from "lucide-react";
import { apiFetch } from "@/lib/auth";
import { timeAgo, cn } from "@/lib/utils";

const API_BASE = "";

const CATEGORIES = [
  { value: "PLUMBING",   label: "Plumbing",         icon: Wrench },
  { value: "ELECTRICAL", label: "Electrical",        icon: Zap },
  { value: "HVAC",       label: "HVAC",              icon: Wind },
  { value: "APPLIANCE",  label: "Appliance",         icon: Settings },
  { value: "STRUCTURAL", label: "Structural",        icon: Home },
  { value: "PEST",       label: "Pest Control",      icon: Bug },
  { value: "SECURITY",   label: "Security / Locks",  icon: Lock },
  { value: "OTHER",      label: "Other",             icon: HelpCircle },
] as const;

const PRIORITIES = [
  { value: "LOW",    label: "Low",    sub: "Non-urgent, no immediate risk",    color: "#6E6E73" },
  { value: "MEDIUM", label: "Medium", sub: "Needs attention soon",             color: "#FF9F0A" },
  { value: "HIGH",   label: "High",   sub: "Affecting daily life",             color: "#FF6B00" },
  { value: "URGENT", label: "Urgent", sub: "Safety risk — needs immediate fix", color: "#FF3B30" },
] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SUBMITTED:    { label: "Submitted",    color: "#FF9F0A", icon: Clock },
  ACKNOWLEDGED: { label: "Acknowledged", color: "#1A56DB", icon: CheckCircle },
  IN_PROGRESS:  { label: "In Progress",  color: "#1A56DB", icon: Settings },
  RESOLVED:     { label: "Resolved",     color: "#34C759", icon: CheckCircle },
  CLOSED:       { label: "Closed",       color: "#6E6E73", icon: X },
};

interface MaintenanceRequest {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  description?: string;
  preferred_access_time?: string;
  photo_url?: string | null;
  resolved_at?: string | null;
}

function getCategoryIcon(cat: string) {
  return CATEGORIES.find((c) => c.value === cat)?.icon ?? HelpCircle;
}

function RequestCard({ req }: { req: MaintenanceRequest }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.SUBMITTED;
  const StatusIcon = cfg.icon;
  const CatIcon = getCategoryIcon(req.category);

  return (
    <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-black/[0.015] transition-colors cursor-pointer"
      >
        <div className="w-9 h-9 rounded-xl bg-[#F5F5F7] flex items-center justify-center shrink-0">
          <CatIcon size={15} className="text-[#3C3C43]" strokeWidth={1.8} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">{req.title}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#F5F5F7]"
              style={{ color: cfg.color }}
            >
              {cfg.label}
            </span>
            <span className="text-[11px] text-[#6E6E73]">{timeAgo(req.created_at)}</span>
          </div>
        </div>
        <ChevronDown
          size={15}
          className={cn("text-[#C7C7CC] transition-transform duration-200 shrink-0", expanded && "rotate-180")}
          strokeWidth={2.5}
        />
      </button>

      {expanded && (
        <div className="border-t border-black/[0.04] px-5 py-4 space-y-3">
          {req.description && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6E6E73] mb-1">Description</p>
              <p className="text-[13px] text-[#1D1D1F] leading-relaxed">{req.description}</p>
            </div>
          )}
          {req.preferred_access_time && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6E6E73] mb-1">Preferred Access</p>
              <p className="text-[13px] text-[#1D1D1F]">{req.preferred_access_time}</p>
            </div>
          )}
          {req.photo_url && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6E6E73] mb-1.5">Photo</p>
              <img
                src={req.photo_url}
                alt="Issue photo"
                className="w-full max-w-xs rounded-xl object-cover max-h-40"
              />
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <StatusIcon size={13} style={{ color: cfg.color }} />
            <span className="text-[12px] font-medium" style={{ color: cfg.color }}>{cfg.label}</span>
            <span className="text-[11px] text-[#6E6E73]">· Updated {timeAgo(req.updated_at)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loadError, setLoadError] = useState<"403" | "other" | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [accessTime, setAccessTime] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiFetch(`${API_BASE}/api/v1/maintenance/`)
      .then(async (res) => {
        if (res.status === 403) { setLoadError("403"); return; }
        if (!res.ok) { setLoadError("other"); return; }
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : (data.results ?? []));
      })
      .catch(() => setLoadError("other"))
      .finally(() => setLoading(false));
  }, []);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Photo must be under 5 MB.");
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setFormError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!title.trim()) { setFormError("Title is required."); return; }
    if (!category) { setFormError("Please select a category."); return; }
    if (description.trim().length < 10) { setFormError("Please describe the issue (min 10 characters)."); return; }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("title", title.trim());
      body.append("category", category);
      body.append("priority", priority);
      body.append("description", description.trim());
      if (accessTime.trim()) body.append("preferred_access_time", accessTime.trim());
      if (photo) body.append("photo", photo);

      const res = await apiFetch(`${API_BASE}/api/v1/maintenance/`, {
        method: "POST",
        body,
        // No Content-Type — let browser set multipart boundary
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setFormError(data?.detail ?? "Submission failed. Please try again.");
        return;
      }

      const newReq = await res.json();
      setRequests((prev) => [newReq, ...prev]);
      setTitle(""); setCategory(""); setPriority("MEDIUM");
      setDescription(""); setAccessTime("");
      setPhoto(null); setPhotoPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 px-1 mb-4">
          <Link
            href="/portal/dashboard"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
          </Link>
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-[#1D1D1F]">
              Maintenance Requests
            </h1>
            <p className="text-[13px] text-[#6E6E73]">Report issues and track repair status</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-4 items-start">

          {/* ── Submit Form ───────────────────────────────────────────────── */}
          <div className="w-full lg:w-2/5 shrink-0">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="px-5 py-4 border-b border-black/[0.04]">
                <p className="text-[14px] font-semibold text-[#1D1D1F] tracking-tight">New Request</p>
                <p className="text-[12px] text-[#6E6E73] mt-0.5">We respond within 1 business day</p>
              </div>

              {/* Success banner */}
              {success && (
                <div className="mx-5 mt-4 flex items-start gap-2.5 bg-[#F0FFF4] border border-[#34C759]/20 rounded-xl px-4 py-3">
                  <CheckCircle size={15} className="text-[#34C759] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[13px] font-semibold text-[#1D1D1F]">Request submitted!</p>
                    <p className="text-[12px] text-[#6E6E73]">We&apos;ll be in touch within 1 business day.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-5 space-y-4">

                {/* Title */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Leaking kitchen tap"
                    className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[15px] text-[#1D1D1F] outline-none border border-transparent focus:border-brand/30 transition-colors"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-2">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CATEGORIES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setCategory(value)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold transition-all",
                          category === value
                            ? "bg-[#0B1F3A] text-white"
                            : "bg-[#F5F5F7] text-[#3C3C43] hover:bg-[#EBEBED]"
                        )}
                      >
                        <Icon size={13} strokeWidth={1.8} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-2">
                    Priority *
                  </label>
                  <div className="space-y-1.5">
                    {PRIORITIES.map(({ value, label, sub, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPriority(value)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all border",
                          priority === value
                            ? "bg-[#F5F5F7] border-black/10"
                            : "bg-white border-transparent hover:bg-[#F5F5F7]"
                        )}
                      >
                        <div
                          className="w-1 h-8 rounded-full shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#1D1D1F]">{label}</p>
                          <p className="text-[11px] text-[#6E6E73]">{sub}</p>
                        </div>
                        {priority === value && (
                          <CheckCircle size={14} className="ml-auto shrink-0 text-[#34C759]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue, when it started, and how often it occurs…"
                    rows={4}
                    className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[15px] text-[#1D1D1F] outline-none border border-transparent focus:border-brand/30 transition-colors resize-none"
                  />
                </div>

                {/* Access time */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
                    Preferred Access Time <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={accessTime}
                    onChange={(e) => setAccessTime(e.target.value)}
                    placeholder="e.g. Weekdays after 5pm, anytime Sat–Sun"
                    className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[15px] text-[#1D1D1F] outline-none border border-transparent focus:border-brand/30 transition-colors"
                  />
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-[11px] font-semibold tracking-[0.07em] uppercase text-[#6E6E73] mb-1.5">
                    Photo <span className="normal-case font-normal">(optional, max 5 MB)</span>
                  </label>
                  {photoPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-32 h-32 rounded-xl object-cover border border-black/[0.06]"
                      />
                      <button
                        type="button"
                        onClick={() => { setPhoto(null); setPhotoPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FF3B30] text-white flex items-center justify-center shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex items-center gap-2.5 bg-[#F5F5F7] hover:bg-[#EBEBED] rounded-xl px-4 py-3 text-[13px] text-[#6E6E73] transition-colors"
                    >
                      <Upload size={15} />
                      Upload a photo
                    </button>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                {formError && (
                  <div className="flex items-start gap-2 text-[#FF3B30] bg-[#FFF5F5] rounded-xl px-3.5 py-3">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p className="text-[13px]">{formError}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-brand text-white text-[14px] font-semibold py-3 rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Wrench size={15} />
                  )}
                  Submit Request
                </button>
              </form>
            </div>
          </div>

          {/* ── Request History ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#6E6E73] px-1">
              Your Requests {requests.length > 0 && `(${requests.length})`}
            </p>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-black/[0.04] animate-pulse" />
                ))}
              </div>
            ) : loadError === "403" ? (
              <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={22} className="text-[#C7C7CC]" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] font-semibold text-[#1D1D1F] mb-1">Account not linked</p>
                <p className="text-[13px] text-[#6E6E73] max-w-xs mx-auto leading-relaxed mb-4">
                  Your account isn&apos;t linked to a tenancy yet. Contact our team to get set up.
                </p>
                <a
                  href="mailto:info@haskerrealtygroup.com?subject=Account Tenancy Setup"
                  className="inline-flex items-center gap-1.5 bg-brand text-white text-[12px] font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-hover transition-colors"
                >
                  <Mail size={13} />
                  Email Us
                </a>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] py-14 flex flex-col items-center text-center px-6">
                <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] flex items-center justify-center mb-4">
                  <ImageIcon size={26} className="text-[#C7C7CC]" strokeWidth={1.5} />
                </div>
                <p className="text-[14px] font-semibold text-[#1D1D1F] mb-1">No requests yet</p>
                <p className="text-[13px] text-[#6E6E73] max-w-xs leading-relaxed">
                  Submit your first maintenance request using the form.
                </p>
              </div>
            ) : (
              requests.map((req) => <RequestCard key={req.id} req={req} />)
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
