import "server-only";

import { adminDb } from "@/lib/firebase-admin";

export type BusinessIdModule = "LOGISTICS" | "FOOD";

/**
 * App-wide length:
 * - 10 → YYMMDD + 4-digit sequence (split ranges)
 * - 12 → YYMMDD + 6-digit sequence (split ranges)
 */
export const BUSINESS_ID_LENGTH: 10 | 12 = 10;

type Range = { start: number; end: number };

const RANGES: Record<10 | 12, Record<BusinessIdModule, Range>> = {
  10: {
    LOGISTICS: { start: 1, end: 4999 },
    FOOD: { start: 5000, end: 9999 },
  },
  12: {
    LOGISTICS: { start: 1, end: 499_999 },
    FOOD: { start: 500_000, end: 999_999 },
  },
};

function dateKeyFrom(now = new Date()): string {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/**
 * Digits-only business id.
 * Logistics and Food use non-overlapping sequence ranges → never match.
 */
export async function generateBusinessId(
  module: BusinessIdModule,
  length: 10 | 12 = BUSINESS_ID_LENGTH,
): Promise<string> {
  const dateKey = dateKeyFrom();
  const seqDigits = length - 6;
  const { start, end } = RANGES[length][module];

  const counterRef = adminDb
    .collection("settings")
    .doc(`idCounter-${module}-${length}-${dateKey}`);

  const next = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists ? Number(snap.data()?.value || 0) : 0;
    const value = current === 0 ? start : current + 1;

    if (value > end) {
      throw new Error(
        `Daily ${module} ${length}-digit ID capacity exhausted for ${dateKey}.`,
      );
    }

    tx.set(
      counterRef,
      {
        value,
        module,
        length,
        dateKey,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return value;
  });

  const sequence = String(next).padStart(seqDigits, "0");
  const id = `${dateKey}${sequence}`;

  if (!new RegExp(`^\\d{${length}}$`).test(id)) {
    throw new Error(`Generated id is not a ${length}-digit number: ${id}`);
  }

  return id;
}

export function generateBusinessId10(module: BusinessIdModule) {
  return generateBusinessId(module, 10);
}

export function generateBusinessId12(module: BusinessIdModule) {
  return generateBusinessId(module, 12);
}