import { NextRequest, NextResponse } from "next/server";
import { assertRole, getSessionUser } from "@/lib/api-auth";
import { db } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || !assertRole(user, ["owner", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const analytics = db.analytics();
  const logs = db.recentActivity(100);
  return NextResponse.json({ analytics, logs });
}
