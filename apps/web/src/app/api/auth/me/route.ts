import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ user });
}
