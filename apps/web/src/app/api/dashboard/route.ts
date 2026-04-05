import { NextRequest, NextResponse } from "next/server";
import { assertRole, getSessionUser } from "@/lib/api-auth";
import { db } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || !assertRole(user, ["owner", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parcels = db.listParcels();
  const summary = db.summaryForParcels(parcels);
  const activity = db.recentActivity(12);
  const { daily } = db.chartBuckets();
  const tableRows = parcels.slice(0, 15).map((p) => ({
    parcelId: p.parcelId,
    businessName: p.businessName,
    status: p.status,
    updatedAt: p.updatedAt,
  }));

  return NextResponse.json({
    summary,
    activity,
    chart: { daily },
    tableRows,
  });
}
