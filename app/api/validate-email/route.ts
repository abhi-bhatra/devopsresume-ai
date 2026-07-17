import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== "string") {
    return NextResponse.json({ allowed: false, reason: "Invalid email." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.mailcheck.ai/email/${encodeURIComponent(email)}`, {
      headers: { "User-Agent": "screenmyresume.site" },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      // If the API is down, fail open (allow the signup)
      return NextResponse.json({ allowed: true });
    }

    const data = await res.json();

    if (data.disposable === true) {
      return NextResponse.json({
        allowed: false,
        reason: "Disposable or temporary email addresses are not allowed. Please use a permanent email.",
      });
    }

    if (data.mx === false) {
      return NextResponse.json({
        allowed: false,
        reason: "This email domain does not appear to accept emails. Please use a valid email address.",
      });
    }

    return NextResponse.json({ allowed: true });
  } catch {
    // Network error or timeout — fail open
    return NextResponse.json({ allowed: true });
  }
}
