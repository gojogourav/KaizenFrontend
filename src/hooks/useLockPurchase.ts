import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { Booking } from "../types/database";

export type LockStep =
  "IDLE" | "LOCKING" | "LOCKED" | "PURCHASING" | "PURCHASED";

const DEFAULT_LOCK_SECONDS = 900;

export function useLockPurchase(
  propertyId: string | number | undefined,
  onPurchased: () => void,
) {
  const [step, setStep] = useState<LockStep>("IDLE");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_LOCK_SECONDS);
  const [error, setError] = useState("");

  const expiresAtRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        setStep("IDLE");
        setError("Property hold lock expired. Please initiate a new lock.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const initiateLock = useCallback(async () => {
    if (!propertyId) return;
    setError("");
    setStep("LOCKING");
    try {
      const result = await api.lockProperty(propertyId);
      if (!isMountedRef.current) return;
      const lockSeconds = result.lock_expires_at
        ? Math.max(
            0,
            Math.floor(
              (new Date(result.lock_expires_at).getTime() - Date.now()) / 1000,
            ),
          )
        : DEFAULT_LOCK_SECONDS;
      setBooking(result);
      setTimeLeft(lockSeconds);
      expiresAtRef.current = Date.now() + lockSeconds * 1000;
      setStep("LOCKED");
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err?.message || "Failed to lock property.");
      setStep("IDLE");
    }
  }, [propertyId]);

  const completePurchase = useCallback(async () => {
    if (!booking) return;
    setError("");
    setStep("PURCHASING");
    try {
      const result = await api.purchaseProperty(booking.id);
      if (!isMountedRef.current) return;
      setBooking(result);
      setStep("PURCHASED");
      onPurchased();
    } catch (err: any) {
      if (!isMountedRef.current) return;
      setError(err?.message || "Transaction failed.");
      setStep("LOCKED");
    }
  }, [booking, onPurchased]);

  const cancelLock = useCallback(() => {
    if (booking) api.cancelBooking(booking.id).catch(() => {});
    expiresAtRef.current = null;
    setStep("IDLE");
    setBooking(null);
    setTimeLeft(DEFAULT_LOCK_SECONDS);
    setError("");
  }, [booking]);

  const reset = useCallback(() => {
    expiresAtRef.current = null;
    setStep("IDLE");
    setBooking(null);
    setError("");
  }, []);

  return {
    step,
    booking,
    timeLeft,
    error,
    initiateLock,
    completePurchase,
    cancelLock,
    reset,
  };
}
