import React, { useEffect } from "react";
import { Modal } from "../common/Modal";
import { useLockPurchase } from "../../hooks/useLockPurchase";
import type { Property } from "../../types/database";

interface LockPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal?: Property | null;
  onSuccess: () => void;
}

export const LockPurchaseModal: React.FC<LockPurchaseModalProps> = ({
  isOpen,
  onClose,
  deal,
  onSuccess,
}) => {
  const { step, timeLeft, error, initiateLock, completePurchase, cancelLock, reset } = useLockPurchase(
    deal?.id,
    onSuccess,
  );

  useEffect(() => {
    if (isOpen && deal) {
      initiateLock();
    } else {
      reset();
    }
  }, [isOpen, deal, initiateLock, reset]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        cancelLock();
        onClose();
      }}
      title="Lock & Purchase Property"
      titleId="lock-purchase-title"
    >
      <div className="p-4 space-y-4">
        {error && <div className="text-red-500">{error}</div>}
        <p className="text-sm font-semibold">{deal?.title}</p>
        <p>Status: {step}</p>
        {step === "LOCKED" && <p className="text-rose-500 font-mono font-bold">Time left: {timeLeft}s</p>}
        {step === "LOCKED" && (
          <button 
            onClick={completePurchase} 
            className="w-full py-3 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl"
          >
            Confirm Purchase
          </button>
        )}
      </div>
    </Modal>
  );
};
