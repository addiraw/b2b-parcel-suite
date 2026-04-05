import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UserRole } from "./types";

const JWT_SECRET = process.env.JWT_SECRET ?? "b2b-parcel-dev-secret-change-me";

export interface JwtUserPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return bcrypt.compareSync(plain, hash);
}

export function signToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtUserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & JwtUserPayload;
    if (!decoded.sub || !decoded.email || !decoded.role) return null;
    return { sub: decoded.sub, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}
