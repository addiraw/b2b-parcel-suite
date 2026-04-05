import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { toPublicUser } from "@/lib/api-auth";
import { db } from "@/lib/store";
import type { UserRole } from "@/lib/types";

const ALLOWED_SELF_REGISTER: UserRole[] = ["business", "agent"];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "New user";
    const role = (body.role as UserRole) || "business";
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Valid email and password (min 6 chars) required" },
        { status: 400 },
      );
    }
    if (!ALLOWED_SELF_REGISTER.includes(role)) {
      return NextResponse.json({ error: "Invalid role for registration" }, { status: 400 });
    }
    if (db.findUserByEmail(email)) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    const businesses = db.listBusinesses();
    const businessId =
      typeof body.businessId === "string"
        ? body.businessId
        : businesses[0]?.id;
    const user = db.createUser({
      email,
      password,
      name: name || email.split("@")[0],
      role,
      businessId,
    });
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return NextResponse.json({ token, user: toPublicUser(user) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
