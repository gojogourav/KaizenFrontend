import React from "react";
import { Modal } from "../common/Modal";
import type { Property } from "../../types/database";

interface PropertyProspectusModalProps {
  deal: Property | null;
  onClose: () => void;
  onInitiateLock: () => void;
}

export const PropertyProspectusModal: React.FC<PropertyProspectusModalProps> = ({
  deal,
  onClose,
  onInitiateLock
}) => {
  if (!deal) return null;
  
  return (
    <Modal isOpen={!!deal} onClose={onClose} title="Property Prospectus" titleId="prospectus-title">
      <div className="p-4 space-y-4 text-slate-800 dark:text-slate-200">
        <h2 className="text-xl font-bold">{deal.title}</h2>
        <p>{deal.description}</p>
        <div className="mt-4">
          <p><strong>Price:</strong> ${deal.price?.toLocaleString()}</p>
          <p><strong>Address:</strong> {deal.address}, {deal.city}, {deal.state}</p>
        </div>
        <div className="mt-6">
          <button 
            onClick={onInitiateLock}
            className="w-full py-3 bg-[#E04F33] hover:bg-[#ED5B3F] text-white font-bold rounded-xl"
          >
            Initiate Lock
          </button>
        </div>
      </div>
    </Modal>
  );
};
