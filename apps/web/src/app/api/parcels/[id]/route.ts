import { NextRequest, NextResponse } from "next/server";
import { assertRole, getSessionUser } from "@/lib/api-auth";
import { db } from "@/lib/store";
import type { ParcelStatus } from "@/lib/types";

function canAccessParcel(
  user: NonNullable<ReturnType<typeof getSessionUser>>,
  parcel: NonNullable<ReturnType<typeof db.getParcelById>>,
) {
  if (assertRole(user, ["owner", "admin"])) return true;
  if (user.role === "agent" && parcel.assignedAgentId === user.id) return true;
  if (user.role === "business" && user.businessId === parcel.businessId) return true;
  return false;
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const parcel =
    db.getParcelById(id) ?? db.getParcelByPublicId(id);
  if (!parcel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canAccessParcel(user, parcel)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ parcel });
}

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const parcel =
    db.getParcelById(id) ?? db.getParcelByPublicId(id);
  if (!parcel) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!canAccessParcel(user, parcel)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const status = body.status as ParcelStatus | undefined;
    if (!status || !["created", "in_transit", "delivered"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const agentName = user.name;
    const updated = db.setParcelStatus(parcel.parcelId, status, {
      agentId: user.role === "agent" ? user.id : undefined,
      agentName,
      action:
        typeof body.action === "string"
          ? body.action
          : `Status updated to ${status.replace("_", " ")}`,
      location: typeof body.location === "string" ? body.location : undefined,
    });
    return NextResponse.json({ parcel: updated });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
