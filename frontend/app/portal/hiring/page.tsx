"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, X, User, Mail, Phone, ExternalLink, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/auth";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

interface JobApplication {
  id: number;
  role_id: string;
  role_title: string;
  full_name: string;
  email: string;
  phone: string;
  linkedin_url: string;
  motivation: string;
  extra_field_label: string;
  extra_field_value: string;
  status: ApplicationStatus;
  applied_at: string;
  reviewed_by_name: string | null;
  staff_notes: string;
  interview_date: string | null;
}

type ApplicationStatus = "SUBMITTED" | "UNDER_REVIEW" | "INTERVIEW_SCHEDULED" | "HIRED" | "REJECTED";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  INTERVIEW_SCHEDULED: "bg-purple-100 text-purple-700",
  HIRED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
};

const ROLE_LABELS: Record<string, string> = {
  "remote-listing-specialist": "Remote Listing & Client Communication",
  "real-estate-agent": "Licensed Real Estate Agent",
  "leasing-consultant": "Leasing Consultant",
  "property-manager": "Property Manager",
  "marketing-coordinator": "Marketing Coordinator",
  "maintenance-technician": "Maintenance Technician",
  "tenant-relations-specialist": "Tenant Relations Specialist",
  "general": "General Application",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold", STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Application Drawer ────────────────────────────────────────────────────────

function ApplicationDrawer({
  app,
  onClose,
  onSaved,
}: {
  app: JobApplication;
  onClose: () => void;
  onSaved: (updated: JobApplication) => void;
}) {
  const [status, setStatus] = useState<ApplicationStatus>(app.status);
  const [notes, setNotes] = useState(app.staff_notes);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await apiFetch(`/api/v1/careers/applications/${app.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, staff_notes: notes }),
      });
      if (!res.ok) throw new Error("Save failed");
      const updated: JobApplication = await res.json();
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // ignore — show nothing on error, let user retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-100 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="font-semibold text-[#0B1F3A] text-sm">{app.full_name}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{ROLE_LABELS[app.role_id] ?? app.role_title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Contact info */}
          <div className="bg-neutral-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2.5 text-sm text-neutral-700">
              <Mail size={13} className="text-neutral-400 shrink-0" />
              <a href={`mailto:${app.email}`} className="text-brand hover:underline">{app.email}</a>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-neutral-700">
              <Phone size={13} className="text-neutral-400 shrink-0" />
              <a href={`tel:${app.phone}`} className="hover:underline">{app.phone}</a>
            </div>
            {app.linkedin_url && (
              <div className="flex items-center gap-2.5 text-sm text-neutral-700">
                <ExternalLink size={13} className="text-neutral-400 shrink-0" />
                <a href={app.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline truncate">
                  {app.linkedin_url}
                </a>
              </div>
            )}
          </div>

          {/* Applied date + current status */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">Applied {fmt(app.applied_at)}</p>
            <StatusBadge status={app.status} />
          </div>

          {/* Role-specific field */}
          {app.extra_field_label && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">{app.extra_field_label}</p>
              <p className="text-sm text-[#0B1F3A]">{app.extra_field_value || "—"}</p>
            </div>
          )}

          {/* Motivation */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Why They Want to Join</p>
            <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line bg-neutral-50 rounded-xl p-4">
              {app.motivation}
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-neutral-100" />

          {/* Update status */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Update Status
            </label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full appearance-none bg-white border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand pr-8 cursor-pointer"
              >
                {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            </div>
          </div>

          {/* Staff notes */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Staff Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add notes for your team — interview feedback, follow-up actions, etc."
              className="w-full border border-neutral-200 rounded-lg px-3.5 py-2.5 text-sm text-[#0B1F3A] placeholder:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand resize-none leading-relaxed"
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#0B1F3A] hover:bg-brand text-white text-sm font-semibold py-3 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 size={14} className="animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle2 size={14} /> Saved</>
            ) : (
              "Save Changes"
            )}
          </button>

          {app.reviewed_by_name && (
            <p className="text-center text-[11px] text-neutral-300">
              Last reviewed by {app.reviewed_by_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function HiringPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selected, setSelected] = useState<JobApplication | null>(null);

  // Guard: redirect non-manager users
  useEffect(() => {
    if (!isLoading && user && user.role !== "MANAGER" && user.role !== "ADMIN") {
      router.replace("/portal/profile");
    }
  }, [user, isLoading, router]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRole) params.set("role_id", filterRole);
      if (filterStatus) params.set("status", filterStatus);
      if (search) params.set("search", search);
      const res = await apiFetch(`/api/v1/careers/applications/?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [filterRole, filterStatus, search]);

  useEffect(() => {
    if (user && (user.role === "MANAGER" || user.role === "ADMIN")) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  function handleSaved(updated: JobApplication) {
    setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setSelected(updated);
  }

  // Unique role IDs from current results for filter dropdown
  const roleOptions = Array.from(new Set(applications.map((a) => a.role_id)));

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-[2.5px] border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-6 lg:px-8 py-8 max-w-6xl mx-auto">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0B1F3A] tracking-tight">Hiring</h1>
        <p className="text-sm text-neutral-400 mt-1">Review and manage job applications from your careers page.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 bg-white border border-neutral-200 rounded-lg px-3.5 h-10 shadow-sm">
          <Search size={13} className="text-neutral-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-sm text-[#0B1F3A] placeholder:text-neutral-300 outline-none bg-transparent"
          />
        </div>

        {/* Role filter */}
        <div className="relative">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 rounded-lg px-3.5 py-0 h-10 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-brand/20 pr-8 cursor-pointer shadow-sm"
          >
            <option value="">All Roles</option>
            {roleOptions.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 rounded-lg px-3.5 py-0 h-10 text-sm text-[#0B1F3A] focus:outline-none focus:ring-2 focus:ring-brand/20 pr-8 cursor-pointer shadow-sm"
          >
            <option value="">All Statuses</option>
            {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      </div>

      {/* Summary counts */}
      {!loading && applications.length > 0 && (
        <div className="flex gap-4 mb-5 flex-wrap">
          {(Object.keys(STATUS_LABELS) as ApplicationStatus[]).map((s) => {
            const count = applications.filter((a) => a.status === s).length;
            if (!count) return null;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? "" : s)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                  filterStatus === s
                    ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                    : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-300"
                )}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full", {
                  "bg-blue-500": s === "SUBMITTED",
                  "bg-amber-500": s === "UNDER_REVIEW",
                  "bg-purple-500": s === "INTERVIEW_SCHEDULED",
                  "bg-green-500": s === "HIRED",
                  "bg-red-500": s === "REJECTED",
                })} />
                {STATUS_LABELS[s]} · {count}
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col gap-3 p-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-8 h-8 bg-neutral-100 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-neutral-100 rounded w-40" />
                  <div className="h-2.5 bg-neutral-50 rounded w-24" />
                </div>
                <div className="w-20 h-5 bg-neutral-100 rounded-full" />
              </div>
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
              <User size={20} className="text-neutral-300" />
            </div>
            <p className="text-sm font-medium text-neutral-400">No applications yet</p>
            <p className="text-xs text-neutral-300 mt-1 max-w-xs">
              Share your careers page to start receiving candidates.
              Applications will appear here as they come in.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-5 py-3 bg-neutral-50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
              <span>Applicant</span>
              <span>Role</span>
              <span>Applied</span>
              <span>Status</span>
            </div>

            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelected(app)}
                className="w-full text-left px-5 py-4 hover:bg-neutral-50 transition-colors group"
              >
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-2 md:gap-4 md:items-center">
                  {/* Applicant */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-[11px] font-bold text-brand shrink-0 select-none">
                      {app.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0B1F3A] truncate group-hover:text-brand transition-colors">
                        {app.full_name}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">{app.email}</p>
                    </div>
                  </div>

                  {/* Role */}
                  <p className="text-xs text-neutral-500 truncate hidden md:block">
                    {ROLE_LABELS[app.role_id] ?? app.role_title}
                  </p>

                  {/* Date */}
                  <p className="text-[11px] text-neutral-400 whitespace-nowrap hidden md:block">{fmt(app.applied_at)}</p>

                  {/* Status */}
                  <StatusBadge status={app.status} />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-[11px] text-neutral-300 mt-4 text-center">
        {applications.length} application{applications.length !== 1 ? "s" : ""}
        {(filterRole || filterStatus || search) ? " (filtered)" : " total"}
      </p>

      {/* Application detail drawer */}
      {selected && (
        <ApplicationDrawer
          app={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
