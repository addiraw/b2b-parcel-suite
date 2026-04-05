import { randomUUID } from "crypto";
import type {
  Business,
  Parcel,
  ParcelHistoryEntry,
  ParcelStatus,
  ParcelSummary,
  User,
  UserRole,
} from "./types";
import { hashPassword } from "./auth";

interface State {
  businesses: Business[];
  users: User[];
  parcels: Parcel[];
}

const state: State = {
  businesses: [],
  users: [],
  parcels: [],
};

function nowIso() {
  return new Date().toISOString();
}

function seed() {
  const t = nowIso();
  state.businesses = [
    { id: "bus-globex", name: "Globex Logistics", createdAt: t },
    { id: "bus-acme", name: "Acme Retail Co.", createdAt: t },
  ];

  const demo = hashPassword("password123");
  state.users = [
    {
      id: "u-owner",
      email: "owner@acme.com",
      passwordHash: demo,
      name: "Jordan Lee",
      role: "owner",
      createdAt: t,
    },
    {
      id: "u-admin",
      email: "admin@acme.com",
      passwordHash: demo,
      name: "Sam Rivera",
      role: "admin",
      createdAt: t,
    },
    {
      id: "u-agent",
      email: "agent@acme.com",
      passwordHash: demo,
      name: "Alex Chen",
      role: "agent",
      businessId: "bus-globex",
      createdAt: t,
    },
    {
      id: "u-biz",
      email: "biz@globex.com",
      passwordHash: demo,
      name: "Morgan Blake",
      role: "business",
      businessId: "bus-globex",
      createdAt: t,
    },
  ];

  const mkHistory = (
    entries: Omit<ParcelHistoryEntry, "id">[],
  ): ParcelHistoryEntry[] =>
    entries.map((e) => ({ ...e, id: randomUUID() }));

  state.parcels = [
    {
      id: "p1",
      parcelId: "PRCL-10001",
      status: "delivered",
      businessId: "bus-globex",
      businessName: "Globex Logistics",
      assignedAgentId: "u-agent",
      qrPayload: "PRCL-10001",
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      history: mkHistory([
        {
          at: new Date(Date.now() - 86400000 * 5).toISOString(),
          action: "Parcel created",
          status: "created",
          location: "Globex Hub — NYC",
          agentName: "System",
        },
        {
          at: new Date(Date.now() - 86400000 * 4).toISOString(),
          action: "Picked up — scan",
          status: "in_transit",
          location: "Sort facility",
          agentId: "u-agent",
          agentName: "Alex Chen",
        },
        {
          at: new Date(Date.now() - 86400000).toISOString(),
          action: "Delivered",
          status: "delivered",
          location: "Customer address",
          agentId: "u-agent",
          agentName: "Alex Chen",
        },
      ]),
    },
    {
      id: "p2",
      parcelId: "PRCL-10002",
      status: "in_transit",
      businessId: "bus-globex",
      businessName: "Globex Logistics",
      assignedAgentId: "u-agent",
      qrPayload: JSON.stringify({ parcelId: "PRCL-10002" }),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
      history: mkHistory([
        {
          at: new Date(Date.now() - 86400000 * 2).toISOString(),
          action: "Parcel created",
          status: "created",
          location: "Globex Hub — NYC",
        },
        {
          at: new Date(Date.now() - 3600000).toISOString(),
          action: "Outbound scan",
          status: "in_transit",
          location: "Truck T-12",
          agentId: "u-agent",
          agentName: "Alex Chen",
        },
      ]),
    },
    {
      id: "p3",
      parcelId: "PRCL-10003",
      status: "created",
      businessId: "bus-acme",
      businessName: "Acme Retail Co.",
      assignedAgentId: "u-agent",
      qrPayload: "PRCL-10003",
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
      history: mkHistory([
        {
          at: new Date(Date.now() - 7200000).toISOString(),
          action: "Parcel created",
          status: "created",
          location: "Acme DC",
        },
      ]),
    },
    {
      id: "p4",
      parcelId: "PRCL-10004",
      status: "in_transit",
      businessId: "bus-acme",
      businessName: "Acme Retail Co.",
      qrPayload: "PRCL-10004",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      history: mkHistory([
        {
          at: new Date(Date.now() - 86400000).toISOString(),
          action: "Parcel created",
          status: "created",
          location: "Acme DC",
        },
        {
          at: new Date(Date.now() - 1800000).toISOString(),
          action: "Scan at hub",
          status: "in_transit",
          location: "Regional hub",
        },
      ]),
    },
    {
      id: "p5",
      parcelId: "PRCL-10005",
      status: "delivered",
      businessId: "bus-globex",
      businessName: "Globex Logistics",
      qrPayload: "PRCL-10005",
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      history: mkHistory([
        {
          at: new Date(Date.now() - 86400000 * 10).toISOString(),
          action: "Parcel created",
          status: "created",
        },
        {
          at: new Date(Date.now() - 86400000 * 9).toISOString(),
          action: "In transit",
          status: "in_transit",
        },
        {
          at: new Date(Date.now() - 86400000 * 8).toISOString(),
          action: "Delivered",
          status: "delivered",
        },
      ]),
    },
  ];
}

seed();

function nextParcelCode(): string {
  const max = state.parcels.reduce((m, p) => {
    const n = parseInt(p.parcelId.replace(/\D/g, ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 10000);
  return `PRCL-${max + 1}`;
}

export function parseQrPayload(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const j = JSON.parse(trimmed) as { parcelId?: string };
    if (j?.parcelId && typeof j.parcelId === "string") return j.parcelId.trim();
  } catch {
    /* plain string */
  }
  return trimmed;
}

export const db = {
  getUserById(id: string): User | undefined {
    return state.users.find((u) => u.id === id);
  },

  findUserByEmail(email: string): User | undefined {
    const q = email.trim().toLowerCase();
    return state.users.find((u) => u.email.toLowerCase() === q);
  },

  listUsers(): User[] {
    return [...state.users];
  },

  createUser(input: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    businessId?: string;
  }): User {
    const user: User = {
      id: randomUUID(),
      email: input.email.trim().toLowerCase(),
      passwordHash: hashPassword(input.password),
      name: input.name.trim(),
      role: input.role,
      businessId: input.businessId,
      createdAt: nowIso(),
    };
    state.users.push(user);
    return user;
  },

  updateUser(
    id: string,
    patch: Partial<Pick<User, "name" | "role" | "businessId">> & { password?: string },
  ): User | undefined {
    const u = state.users.find((x) => x.id === id);
    if (!u) return undefined;
    if (patch.name !== undefined) u.name = patch.name;
    if (patch.role !== undefined) u.role = patch.role;
    if (patch.businessId !== undefined) u.businessId = patch.businessId;
    if (patch.password) u.passwordHash = hashPassword(patch.password);
    return u;
  },

  deleteUser(id: string): boolean {
    const i = state.users.findIndex((x) => x.id === id);
    if (i === -1) return false;
    state.users.splice(i, 1);
    return true;
  },

  listBusinesses(): Business[] {
    return [...state.businesses];
  },

  getBusiness(id: string): Business | undefined {
    return state.businesses.find((b) => b.id === id);
  },

  createBusiness(name: string): Business {
    const b: Business = {
      id: randomUUID(),
      name: name.trim(),
      createdAt: nowIso(),
    };
    state.businesses.push(b);
    return b;
  },

  updateBusiness(id: string, name: string): Business | undefined {
    const b = state.businesses.find((x) => x.id === id);
    if (!b) return undefined;
    b.name = name.trim();
    return b;
  },

  deleteBusiness(id: string): boolean {
    const i = state.businesses.findIndex((x) => x.id === id);
    if (i === -1) return false;
    state.businesses.splice(i, 1);
    state.users.forEach((u) => {
      if (u.businessId === id) delete u.businessId;
    });
    return true;
  },

  summaryForParcels(list: Parcel[]): ParcelSummary {
    return {
      total: list.length,
      created: list.filter((p) => p.status === "created").length,
      inTransit: list.filter((p) => p.status === "in_transit").length,
      delivered: list.filter((p) => p.status === "delivered").length,
    };
  },

  listParcels(opts?: {
    agentId?: string;
    businessId?: string;
    status?: ParcelStatus;
    search?: string;
    from?: string;
    to?: string;
  }): Parcel[] {
    let list = [...state.parcels];
    if (opts?.agentId) {
      list = list.filter((p) => p.assignedAgentId === opts.agentId);
    }
    if (opts?.businessId) {
      list = list.filter((p) => p.businessId === opts.businessId);
    }
    if (opts?.status) {
      list = list.filter((p) => p.status === opts.status);
    }
    if (opts?.search?.trim()) {
      const q = opts.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.parcelId.toLowerCase().includes(q) ||
          p.businessName.toLowerCase().includes(q),
      );
    }
    if (opts?.from) {
      const fromT = new Date(opts.from).getTime();
      list = list.filter((p) => new Date(p.updatedAt).getTime() >= fromT);
    }
    if (opts?.to) {
      const toT = new Date(opts.to).getTime();
      list = list.filter((p) => new Date(p.updatedAt).getTime() <= toT);
    }
    list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return list;
  },

  getParcelByPublicId(parcelId: string): Parcel | undefined {
    return state.parcels.find((p) => p.parcelId === parcelId);
  },

  getParcelById(id: string): Parcel | undefined {
    return state.parcels.find((p) => p.id === id);
  },

  createParcel(input: {
    businessId: string;
    assignedAgentId?: string;
    initialStatus?: ParcelStatus;
  }): Parcel | undefined {
    const b = state.businesses.find((x) => x.id === input.businessId);
    if (!b) return undefined;
    const code = nextParcelCode();
    const ts = nowIso();
    const parcel: Parcel = {
      id: randomUUID(),
      parcelId: code,
      status: input.initialStatus ?? "created",
      businessId: b.id,
      businessName: b.name,
      assignedAgentId: input.assignedAgentId,
      qrPayload: code,
      createdAt: ts,
      updatedAt: ts,
      history: [
        {
          id: randomUUID(),
          at: ts,
          action: "Parcel created",
          status: input.initialStatus ?? "created",
          location: b.name,
        },
      ],
    };
    state.parcels.push(parcel);
    return parcel;
  },

  setParcelStatus(
    parcelId: string,
    status: ParcelStatus,
    meta: { agentId?: string; agentName?: string; action?: string; location?: string },
  ): Parcel | undefined {
    const p = state.parcels.find((x) => x.parcelId === parcelId);
    if (!p) return undefined;
    p.status = status;
    p.updatedAt = nowIso();
    p.history.push({
      id: randomUUID(),
      at: p.updatedAt,
      action: meta.action ?? `Status set to ${status.replace("_", " ")}`,
      status,
      location: meta.location,
      agentId: meta.agentId,
      agentName: meta.agentName,
    });
    return p;
  },

  applyScan(
    raw: string,
    agent: { id: string; name: string },
  ): { ok: true; parcel: Parcel } | { ok: false; error: string } {
    const pid = parseQrPayload(raw);
    if (!pid) return { ok: false, error: "Invalid QR payload" };
    const p = state.parcels.find((x) => x.parcelId === pid);
    if (!p) return { ok: false, error: "Parcel not found" };
    if (p.assignedAgentId && p.assignedAgentId !== agent.id) {
      return { ok: false, error: "Parcel is assigned to another agent" };
    }
    let next: ParcelStatus = p.status;
    if (p.status === "created") next = "in_transit";
    else if (p.status === "in_transit") next = "in_transit";
    else if (p.status === "delivered") {
      return { ok: false, error: "Parcel already delivered" };
    }
    p.status = next;
    p.updatedAt = nowIso();
    p.history.push({
      id: randomUUID(),
      at: p.updatedAt,
      action: "QR scan",
      status: next,
      location: "Scan checkpoint",
      agentId: agent.id,
      agentName: agent.name,
    });
    return { ok: true, parcel: p };
  },

  recentActivity(limit: number): ParcelHistoryEntry & { parcelId: string }[] {
    const rows: (ParcelHistoryEntry & { parcelId: string })[] = [];
    for (const p of state.parcels) {
      for (const h of p.history) {
        rows.push({ ...h, parcelId: p.parcelId });
      }
    }
    rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
    return rows.slice(0, limit);
  },

  analytics() {
    const list = state.parcels;
    const total = list.length;
    const delivered = list.filter((p) => p.status === "delivered").length;
    const successRate = total === 0 ? 0 : Math.round((delivered / total) * 1000) / 10;
    const byDay: Record<string, number> = {};
    for (const p of list) {
      const d = p.createdAt.slice(0, 10);
      byDay[d] = (byDay[d] ?? 0) + 1;
    }
    const volumeSeries = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
    return { successRate, volumeSeries, total, delivered };
  },

  chartBuckets() {
    const days = 14;
    const daily: { key: string; label: string; scans: number; delivered: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      daily.push({ key, label: key.slice(5), scans: 0, delivered: 0 });
    }
    const keySet = new Set(daily.map((x) => x.key));
    for (const p of state.parcels) {
      for (const h of p.history) {
        const day = h.at.slice(0, 10);
        if (!keySet.has(day)) continue;
        const slot = daily.find((x) => x.key === day);
        if (!slot) continue;
        if (
          h.action.toLowerCase().includes("scan") ||
          h.action.toLowerCase().includes("transit")
        ) {
          slot.scans += 1;
        }
        if (h.status === "delivered") slot.delivered += 1;
      }
    }
    return { daily };
  },
};
