import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { db } from "@/lib/store";

/** Mobile + agent: POST /api/scan */
export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || user.role !== "agent") {
    return NextResponse.json(
      { error: "Only agents can scan parcels" },
      { status: 403 },
    );
  }
  try {
    const body = await request.json();
    const data =
      typeof body.data === "string"
        ? body.data
        : typeof body.qr === "string"
          ? body.qr
          : typeof body.raw === "string"
            ? body.raw
            : null;
    if (!data) {
      return NextResponse.json(
        { error: "Missing scanned data (field: data)" },
        { status: 400 },
      );
    }
    const result = db.applyScan(data, { id: user.id, name: user.name });
    if (!result.ok) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({
      success: true,
      parcel: result.parcel,
      message: `Updated ${result.parcel.parcelId}`,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
