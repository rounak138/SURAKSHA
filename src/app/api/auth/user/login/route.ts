import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { signToken } from "@/lib/jwt-sign";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";
import { supabase } from "@/lib/supabase";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user || user.role !== "TOURIST") {
    return NextResponse.json({ error: "Invalid tourist credentials" }, { status: 401 });
  }

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Invalid tourist credentials" }, { status: 401 });
  }

  // Check email verification status
  if (!user.emailVerified) {
    // Double-check with Supabase auth in case they verified but we haven't updated DB yet
    const { data: supaSession } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    const isVerifiedInSupabase = supaSession?.user?.email_confirmed_at != null;

    if (isVerifiedInSupabase) {
      // Sync verified status to our DB
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
    } else {
      return NextResponse.json({
        error: "Please verify your email first. Check your inbox for the verification link.",
        requiresVerification: true,
      }, { status: 403 });
    }
  }

  const token = await signToken({
    sub: user.id,
    role: "TOURIST",
    email: user.email,
    name: user.name,
  });

  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return res;
}
