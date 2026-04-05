export type UserRole = "owner" | "admin" | "agent" | "business";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  businessId?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  createdAt: string;
}

export type ParcelStatus = "created" | "in_transit" | "delivered";

export interface ParcelHistoryEntry {
  id: string;
  at: string;
  action: string;
  status?: ParcelStatus;
  location?: string;
  agentId?: string;
  agentName?: string;
}

export interface Parcel {
  id: string;
  parcelId: string;
  status: ParcelStatus;
  businessId: string;
  businessName: string;
  assignedAgentId?: string;
  /** Value encoded in QR (plain parcelId or JSON) */
  qrPayload: string;
  history: ParcelHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId?: string;
}

export interface ParcelSummary {
  total: number;
  inTransit: number;
  delivered: number;
  created: number;
}
