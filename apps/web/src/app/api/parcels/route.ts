import { NextRequest, NextResponse } from "next/server";
import { assertRole, getSessionUser } from "@/lib/api-auth";
import { db } from "@/lib/store";
import type { ParcelStatus } from "@/lib/types";

function canViewAll(user: ReturnType<typeof getSessionUser>) {
  return user && assertRole(user, ["owner", "admin"]);
}

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ParcelStatus | null;
  const search = searchParams.get("q") ?? searchParams.get("search") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  if (canViewAll(user)) {
    const parcels = db.listParcels({
      status: status ?? undefined,
      search,
      from,
      to,
    });
    return NextResponse.json({ parcels });
  }

  if (user.role === "agent") {
    const parcels = db.listParcels({
      agentId: user.id,
      status: status ?? undefined,
      search,
      from,
      to,
    });
    return NextResponse.json({ parcels });
  }

  if (user.role === "business" && user.businessId) {
    const parcels = db.listParcels({
      businessId: user.businessId,
      status: status ?? undefined,
      search,
      from,
      to,
    });
    return NextResponse.json({ parcels });
  }

  return NextResponse.json({ parcels: [] });
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || !assertRole(user, ["owner", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const businessId = typeof body.businessId === "string" ? body.businessId : "";
    const assignedAgentId =
      typeof body.assignedAgentId === "string" ? body.assignedAgentId : undefined;
    const initialStatus = body.initialStatus as ParcelStatus | undefined;
    if (!businessId) {
      return NextResponse.json({ error: "businessId required" }, { status: 400 });
    }
    const parcel = db.createParcel({
      businessId,
      assignedAgentId,
      initialStatus,
    });
    if (!parcel) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    return NextResponse.json({ parcel }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
