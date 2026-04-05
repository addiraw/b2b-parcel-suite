import { NextRequest, NextResponse } from "next/server";
import { assertRole, getSessionUser, toPublicUser } from "@/lib/api-auth";
import { db } from "@/lib/store";
import type { UserRole } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = getSessionUser(request);
  if (!user || !assertRole(user, ["owner", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  const target = db.getUserById(id);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.role === "admin" && target.role === "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const patch: Parameters<typeof db.updateUser>[1] = {};
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (typeof body.role === "string") {
      const role = body.role as UserRole;
      if (!["owner", "admin", "agent", "business"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      if (user.role === "admin" && role === "owner") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      patch.role = role;
    }
    if (typeof body.businessId === "string" || body.businessId === null) {
      patch.businessId = body.businessId ?? undefined;
    }
    if (typeof body.password === "string" && body.password.length >= 6) {
      patch.password = body.password;
    }
    const updated = db.updateUser(id, patch);
    return NextResponse.json({ user: toPublicUser(updated!) });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = getSessionUser(request);
  if (!user || !assertRole(user, ["owner", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await ctx.params;
  if (id === user.id) {
    return NextResponse.json({ error: "Cannot delete self" }, { status: 400 });
  }
  const target = db.getUserById(id);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (user.role === "admin" && target.role === "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  db.deleteUser(id);
  return NextResponse.json({ ok: true });
}
