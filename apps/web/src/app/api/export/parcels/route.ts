import { NextRequest, NextResponse } from "next/server";
import { assertRole, getSessionUser } from "@/lib/api-auth";
import { db } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || !assertRole(user, ["owner", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const rows = db.listParcels();
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const lines = [
    ["parcelId", "businessName", "status", "updatedAt", "assignedAgentId"].join(","),
    ...rows.map((p) =>
      [
        escape(p.parcelId),
        escape(p.businessName),
        p.status,
        p.updatedAt,
        p.assignedAgentId ?? "",
      ].join(","),
    ),
  ];
  const csv = lines.join("\n");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="parcels-export.csv"',
    },
  });
}
