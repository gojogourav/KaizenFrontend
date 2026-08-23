import { useCallback, useEffect, useRef, useState } from "react";
import { bookingService } from "../api/services";
import type { BookingRecord } from "../api/services";

export type LockStep =
  | "IDLE"
  | "LOCKING"
  | "LOCKED"           // countdown active, payment_link shown, waiting for reference
  | "SUBMITTING"        // buyer submitting payment reference
  | "PENDING_REVIEW"    // admin reviewing
  | "PURCHASED"
  | "EXPIRED"
  | "CANCELLED";

const POLL_INTERVAL_MS = 5000;

function stateToStep(state: BookingRecord["state"]): LockStep {
  switch (state) {
    case "locked": return "LOCKED";
    case "pending_review": return "PENDING_REVIEW";
    case "purchased": return "PURCHASED";
    case "expired": return "EXPIRED";
    case "cancelled": return "CANCELLED";
    default: return "IDLE";
  }
}

export function useLockPurchase(
  propertyId: string | number | undefined,
  onPurchased: () => void,
) {
  const [step, setStep] = useState<LockStep>("IDLE");
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const expiresAtRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Countdown ticker — only runs while LOCKED
  useEffect(() => {
    if (step !== "LOCKED") return;
    const interval = setInterval(() => {
      if (!expiresAtRef.current) return;
      const remaining = Math.max(
        0,
        Math.floor((expiresAtRef.current - Date.now()) / 1000),
      );
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        expiresAtRef.current = null;
        setStep("EXPIRED");
        setError("Property hold expired. Please initiate a new lock.");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Poll booking status while LOCKED or PENDING_REVIEW — catches server-side expiry
  // and admin approve/reject in near-real-time.
  useEffect(() => {
    if (!booking || (step !== "LOCKED" && step !== "PENDING_REVIEW")) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const fresh = await bookingService.getBooking(booking.id);
        if (!isMountedRef.current) return;
        setBooking(fresh);
        const nextStep = stateToStep(fresh.state);
        if (nextStep !== step) setStep(nextStep);
        if (nextStep === "PURCHASED") onPurchased();
      } catch {
        // transient network error — next tick will retry
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [booking, step, onPurchased]);

  const initiateLock = useCallback(async () => {
    if (!propertyId) return;
    setError("");
    setStep("LOCKING");
    try {
      const result = await bookingService.lockProperty(propertyId, {});
      if (!isMountedRef.current) return;

      setBooking(result);
      if (result.expires_at) {
        const lockMs = new Date(result.expires_at).getTime() - Date.now();
        expiresAtRef.current = Date.now() + Math.max(0, lockMs);
        setTimeLeft(Math.max(0, Math.floor(lockMs / 1000)));
      }
      setStep(stateToStep(result.state));
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err?.message || "Failed to lock property.");
      setStep("IDLE");
    }
  }, [propertyId]);

  const submitPaymentReference = useCallback(
    async (reference: string) => {
      if (!booking) return;
      setError("");
      setSubmitting(true);
      try {
        const updated = await bookingService.submitPaymentReference(booking.id, reference);
        if (!isMountedRef.current) return;
        setBooking(updated);
        setStep(stateToStep(updated.state));
      } catch (err: any) {
        if (!isMountedRef.current) return;
        setError(err?.message || "Couldn't submit your payment reference. Try again.");
      } finally {
        if (isMountedRef.current) setSubmitting(false);
      }
    },
    [booking],
  );

  const cancelLock = useCallback(() => {
    if (booking && (step === "LOCKED" || step === "PENDING_REVIEW")) {
      bookingService.cancelBooking(booking.id).catch(() => {});
    }
    expiresAtRef.current = null;
    if (pollRef.current) clearInterval(pollRef.current);
    setStep("IDLE");
    setBooking(null);
    setTimeLeft(0);
    setError("");
  }, [booking, step]);

  const reset = useCallback(() => {
    expiresAtRef.current = null;
    if (pollRef.current) clearInterval(pollRef.current);
    setStep("IDLE");
    setBooking(null);
    setError("");
    setTimeLeft(0);
  }, []);

  return {
    step,
    booking,
    timeLeft,
    error,
    submitting,
    initiateLock,
    submitPaymentReference,
    cancelLock,
    reset,
  };
}
