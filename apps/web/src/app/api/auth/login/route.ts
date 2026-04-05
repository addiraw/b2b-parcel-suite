import { NextResponse } from "next/server";
import { signToken, verifyPassword } from "@/lib/auth";
import { toPublicUser } from "@/lib/api-auth";
import { db } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }
    const user = db.findUserByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return NextResponse.json({
      token,
      user: toPublicUser(user),
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
