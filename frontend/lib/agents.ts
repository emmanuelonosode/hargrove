const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://admin.haskerrealtygroup.com";

// ─── API Response Types ───────────────────────────────────────────────────

export interface AgentProfileAPI {
  bio: string | null;
  license_number: string | null;
  specialties: string[];
  languages: string[];
  social_links: Record<string, string> | null;
  commission_rate: number | null;
  total_sales: number | null;
  years_experience: number | null;
}

export interface AgentAPI {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string | null;
  active_listings: number;
  agent_profile: AgentProfileAPI | null;
}

export interface PaginatedAgents {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgentAPI[];
}

// ─── Fetch Functions ──────────────────────────────────────────────────────

export async function fetchAgents(): Promise<AgentAPI[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    // The endpoint returns a list (not paginated) based on ListAPIView
    const data: AgentAPI[] | PaginatedAgents = await res.json();
    if (Array.isArray(data)) return data;
    return (data as PaginatedAgents).results ?? [];
  } catch {
    return [];
  }
}

export async function fetchAgentById(id: number | string): Promise<AgentAPI> {
  const res = await fetch(`${API_BASE}/api/v1/agents/${id}/`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) {
    const err = new Error("Agent not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  if (!res.ok) throw new Error(`fetchAgentById: ${res.status}`);
  return res.json();
}

export async function fetchAgentListings(agentId: number | string) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/agents/${agentId}/listings/`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return data.results ?? [];
  } catch {
    return [];
  }
}
