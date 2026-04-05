import { NextRequest, NextResponse } from "next/server";
import { assertRole, getSessionUser } from "@/lib/api-auth";
import { db } from "@/lib/store";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!assertRole(user, ["owner", "admin", "business", "agent"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const businesses = db.listBusinesses();
  return NextResponse.json({ businesses });
}

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user || !assertRole(user, ["owner", "admin"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const business = db.createBusiness(name);
    return NextResponse.json({ business }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}
