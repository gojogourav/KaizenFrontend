import React from "react";
import { PropertyGrid } from "../property/PropertyGrid";
import type { Property } from "../../types/database";

interface PropertiesViewProps {
  onOpenProspectus: (property: Property) => void;
  triggerNotification: (message: string, type?: "success" | "info" | "error") => void;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({ onOpenProspectus }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-2xl font-bold">Featured Properties</h2>
      </div>
      <PropertyGrid onOpenProspectus={onOpenProspectus} />
    </div>
  );
};
