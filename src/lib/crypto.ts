import { createHmac } from "crypto";

const PASS_SIGNING_SECRET = process.env.PASS_SIGNING_SECRET;

if (!PASS_SIGNING_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("PASS_SIGNING_SECRET environment variable is required");
}

interface PassPayload {
  passId: string;
  residentId: string;
  date: string;
  departureTime: string;
  returnTime: string;
  employerName: string;
  passType: string;
  issuedAt: string;
}

function buildCanonicalPayload(data: PassPayload): string {
  const sorted = Object.keys(data)
    .sort()
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = data[key as keyof PassPayload];
      return acc;
    }, {});
  return JSON.stringify(sorted);
}

export function signPass(data: PassPayload): string {
  const secret = PASS_SIGNING_SECRET ?? "dev-secret-do-not-use-in-production";
  const payload = buildCanonicalPayload(data);
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyPass(data: PassPayload, signature: string): boolean {
  const computed = signPass(data);
  return computed === signature;
}
