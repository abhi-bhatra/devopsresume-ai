import { adminDb } from "./firebase-admin";

export type LimitField = "scans" | "resumes";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

export async function checkRateLimit(
  key: string,        // e.g. "anon_1.2.3.4" or "user_abc123"
  field: LimitField,
  limit: number
): Promise<RateLimitResult> {
  const db = adminDb();
  const docRef = db.doc(`usage/${key}/daily/${todayKey()}`);

  const result = await db.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const current = snap.exists ? (snap.data()?.[field] ?? 0) : 0;

    if (current >= limit) {
      return { allowed: false, remaining: 0, limit };
    }

    tx.set(docRef, { [field]: current + 1 }, { merge: true });
    return { allowed: true, remaining: limit - current - 1, limit };
  });

  return result;
}

// Extract a safe key from request IP for anonymous users
export function getIpKey(req: Request): string {
  const forwarded = (req.headers as Headers).get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  // Simple sanitize — remove characters that break Firestore doc IDs
  const safe = ip.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `anon_${safe}`;
}
