import { NextRequest, NextResponse } from "next/server";
import { assertRole, getSessionUser } from "@/lib/api-auth";
import { db } from "@/lib/store";

/** Role-scoped KPIs for mobile and web widgets */
export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parcels;
  if (assertRole(user, ["owner", "admin"])) {
    parcels = db.listParcels();
  } else if (user.role === "agent") {
    parcels = db.listParcels({ agentId: user.id });
  } else if (user.role === "business" && user.businessId) {
    parcels = db.listParcels({ businessId: user.businessId });
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const summary = db.summaryForParcels(parcels);
  const recentParcels = parcels.slice(0, 8).map((p) => ({
    parcelId: p.parcelId,
    status: p.status,
    businessName: p.businessName,
    updatedAt: p.updatedAt,
  }));

  return NextResponse.json({ summary, recentParcels });
}
