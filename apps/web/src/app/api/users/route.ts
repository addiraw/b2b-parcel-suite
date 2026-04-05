import { NextRequest, NextResponse } from "next/server";
import { assertRole, getSessionUser, toPublicUser } from "@/lib/api-auth";
import { db } from "@/lib/store";
import type { UserRole } from "@/lib/types";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || !assertRole(user, ["owner", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const users = db.listUsers().map(toPublicUser);
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || !assertRole(user, ["owner", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const role = body.role as UserRole;
    const businessId =
      typeof body.businessId === "string" ? body.businessId : undefined;
    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: "Email and password (min 6) required" },
        { status: 400 },
      );
    }
    if (!["owner", "admin", "agent", "business"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (user.role === "admin" && role === "owner") {
      return NextResponse.json({ error: "Admins cannot create owners" }, { status: 403 });
    }
    if (db.findUserByEmail(email)) {
      return NextResponse.json({ error: "Email exists" }, { status: 409 });
    }
    const created = db.createUser({
      email,
      password,
      name: name || email.split("@")[0],
      role,
      businessId,
    });
    return NextResponse.json({ user: toPublicUser(created) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
