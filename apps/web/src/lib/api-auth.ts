import type { NextRequest } from "next/server";
import { verifyToken } from "./auth";
import { db } from "./store";
import type { PublicUser, User, UserRole } from "./types";

export function bearerToken(request: NextRequest): string | null {
  const h = request.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice(7).trim() || null;
}

export function getSessionUser(request: NextRequest): PublicUser | null {
  const token = bearerToken(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const user = db.getUserById(payload.sub);
  if (!user) return null;
  return toPublicUser(user);
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    businessId: user.businessId,
  };
}

export function requireAuth(request: NextRequest): PublicUser | null {
  return getSessionUser(request);
}

export function assertRole(user: PublicUser | null, allowed: UserRole[]): user is PublicUser {
  return !!user && allowed.includes(user.role);
}
