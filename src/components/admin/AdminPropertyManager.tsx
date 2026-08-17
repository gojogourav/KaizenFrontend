import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  RotateCcw,
  Plus,
  Lock,
  Edit,
  Trash2,
  X,
  Building,
  Check,
  Loader2,
  Download,
  AlertCircle,
  Link as LinkIcon,
  MapPin,
  Navigation,
  TrendingUp,
  Home,
  Wallet,
  Upload,
} from "lucide-react";
import { z } from "zod";
import { propertyService } from "../../api/services";
import type { PlatformListing, PropertyFilters } from "../../api/services";
import { MapLocationPicker } from "../mapLocationPicker";
import { useToast, useConfirm } from "./AdminUIProvider";
import {
  Panel,
  Button,
  IconButton,
  StatusPill,
  EmptyState,
  SkeletonRows,
  Modal,
  Field,
  fieldInputCls,
} from "./Primitives";

const AVAILABLE_PLATFORMS = [
  "Airbnb",
  "Vrbo",
  "Booking.com",
  "Zillow",
  "Direct Website",
] as const;

// Maps frontend display status → Django validate_status accepted values
const STATUS_TO_API: Record<string, string> = {
  AVAILABLE: "active",
  OCCUPIED: "locked",
  "UNDER CONTRACT": "sold",
  MAINTENANCE: "draft",
  "UNDER REVIEW": "draft",
};

// Maps API status values back to display labels
const API_TO_STATUS: Record<string, PropertyStatus> = {
  active: "AVAILABLE",
  available: "AVAILABLE",
  locked: "OCCUPIED",
  occupied: "OCCUPIED",
  sold: "UNDER CONTRACT",
  "under contract": "UNDER CONTRACT",
  draft: "MAINTENANCE",
  maintenance: "MAINTENANCE",
  "under review": "UNDER REVIEW",
};

type PropertyStatus =
  "AVAILABLE" | "OCCUPIED" | "UNDER CONTRACT" | "MAINTENANCE" | "UNDER REVIEW";

const STATUS_TONE: Record<PropertyStatus, "success" | "neutral" | "warning"> = {
  AVAILABLE: "success",
  OCCUPIED: "neutral",
  "UNDER CONTRACT": "warning",
  MAINTENANCE: "warning",
  "UNDER REVIEW": "warning",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80";

interface PropertyItem {
  id: string | number;
  title: string;
  location: string;
  city: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  monthlyRent: string;
  netProfit: string;
  occupancyEst: string;
  status: PropertyStatus;
  imageUrl: string;
  description: string;
  listings: PlatformListing[];
  lat: number | null;
  lng: number | null;
  media: PropertyMediaItem[];
}
interface PropertyMediaItem {
  id: string | number;
  cdn_url: string;
}

interface FilterState {
  city: string;
  status: string;
  sortBy: "default" | "nearest";
  userLat: number | null;
  userLng: number | null;
}

const DEFAULT_FILTERS: FilterState = {
  city: "",
  status: "",
  sortBy: "default",
  userLat: null,
  userLng: null,
};

const DEFAULT_FORM_STATE = {
  title: "",
  location: "",
  city: "",
  state: "",
  lat: null as number | null,
  lng: null as number | null,
  bedrooms: 3,
  bathrooms: 2,
  monthlyRent: "2400",
  netProfit: "1800",
  status: "AVAILABLE" as PropertyStatus,
  imageUrl: "",
  description: "",
  listings: [] as PlatformListing[],
};

const propertySchema = z.object({
  title: z.string().min(2, "Title is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  bedrooms: z.number().int().min(1).max(10),
  bathrooms: z.number().min(0.5).max(10),
  monthlyRent: z.string().min(1, "Rent is required"),
  netProfit: z.string().min(1, "Profit is required"),
  status: z.enum([
    "AVAILABLE",
    "OCCUPIED",
    "UNDER CONTRACT",
    "MAINTENANCE",
    "UNDER REVIEW",
  ]),
  imageUrl: z.string().url("Must be a valid image URL").or(z.literal("")),
  description: z.string().optional(),
  listings: z
    .array(
      z.object({
        platform: z.string().min(1),
        url: z.string().url("Must be a valid URL"),
        isActive: z.boolean(),
      }),
    )
    .optional(),
});

// ── Small presentational helpers ────────────────────────────────────────────
const MetricCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string;
  tone: string;
}> = ({ icon: Icon, label, value, tone }) => (
  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className={`w-3 h-3 ${tone}`} />
      <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">
        {label}
      </span>
    </div>
    <span className={`text-xl sm:text-2xl font-black font-mono block ${tone}`}>
      {value}
    </span>
  </div>
);

const PropertyStatusToggle: React.FC<{
  status: PropertyStatus;
  onClick: () => void;
}> = ({ status, onClick }) => (
  <button onClick={onClick} className="transition-transform active:scale-95">
    <StatusPill tone={STATUS_TONE[status]}>{status}</StatusPill>
  </button>
);

const PlatformChip: React.FC<{
  platform: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ platform, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded-lg text-[9px] font-bold font-mono transition-all border ${
      isActive
        ? "bg-[#E04F33]/20 text-[#FF8A73] border-[#E04F33]/40"
        : "bg-white/5 text-slate-500 border-white/10 line-through"
    }`}
    title={isActive ? "Active — click to hide" : "Hidden — click to activate"}
  >
    {platform}
  </button>
);

export const AdminPropertyManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPropertyEditorModal, setShowPropertyEditorModal] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | number | null>(
    null,
  );
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [adminForm, setAdminForm] = useState({ ...DEFAULT_FORM_STATE });
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [gpsLoading, setGpsLoading] = useState(false);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [existingMedia, setExistingMedia] = useState<PropertyMediaItem[]>([]);
  const [deletingMediaId, setDeletingMediaId] = useState<string | number | null>(null);

  const loadPropertiesFromApi = useCallback(
    async (activeFilters?: FilterState) => {
      const f = activeFilters ?? filters;
      try {
        setLoading(true);

        const apiFilters: PropertyFilters = {};

        if (f.city.trim()) apiFilters.city = f.city.trim();
        if (f.status) apiFilters.status = STATUS_TO_API[f.status] ?? f.status;
        if (f.sortBy === "nearest" && f.userLat != null && f.userLng != null) {
          apiFilters.lat = f.userLat;
          apiFilters.lng = f.userLng;
          apiFilters.radius_km = 500;
        }

        const apiProps: any = await propertyService.getProperties(apiFilters);

        const mapped: PropertyItem[] = (apiProps ?? []).map(
          (p: any, idx: number) => {
            const rent = p.rent_monthly ?? p.price ?? p.adr ?? 2400;
            const profit =
              p.net_profit_monthly ?? Math.round(Number(rent) * 0.75);
            const mediaUrl = p.media?.[0]?.cdn_url ?? p.images?.[0] ?? "";
            const rawStatus = (p.status ?? "active").toLowerCase();

            return {
              id: p.id,
              title: p.title,
              city: p.city || "Pensacola",
              state: p.state || "FL",
              location: `${p.city || "Pensacola"}, ${p.state || "FL"}`,
              bedrooms: p.bedrooms ?? 3,
              bathrooms: parseFloat(p.bathrooms ?? 2),
              lat: p.lat ?? null,
              lng: p.lng ?? null,
              monthlyRent: `$${Number(rent).toLocaleString()}`,
              netProfit: `~$${Number(profit).toLocaleString()}`,
              occupancyEst: `${60 + (idx % 20)}%`,
              status: API_TO_STATUS[rawStatus] ?? "AVAILABLE",
              imageUrl: mediaUrl || FALLBACK_IMAGE,
              description:
                p.description ||
                "Newly sourced luxury property in high-demand vacation district.",
              listings: p.listings || [],
              media: p.media || [],
            };
          },
        );
        setProperties(mapped);
      } catch (error) {
        console.error("Failed to load properties:", error);
        toast.error(
          "Couldn't load properties",
          "Check your connection and try refreshing.",
        );
      } finally {
        setLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [filters],
  );

  useEffect(() => {
    loadPropertiesFromApi(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSortByNearest = () => {
    if (!navigator.geolocation) {
      toast.error(
        "Location unavailable",
        "Your browser doesn't support geolocation.",
      );
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFilters({
          ...filters,
          sortBy: "nearest",
          userLat: pos.coords.latitude,
          userLng: pos.coords.longitude,
        });
        setGpsLoading(false);
      },
      () => {
        toast.error(
          "Couldn't get your location",
          "Location access was denied or timed out.",
        );
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const hasActiveFilters =
    filters.city || filters.status || filters.sortBy !== "default";

  const handleOpenCreateModal = () => {
    setEditingDealId(null);
    setFieldErrors({});
    setSubmitError(null);
    setAdminForm({ ...DEFAULT_FORM_STATE });
    setImageFiles([]);
    setImagePreviews([]);
    setShowPropertyEditorModal(true);

    setImageFiles([]);
    setImagePreviews([]);
    setExistingMedia([]);
    setShowPropertyEditorModal(true);
  };

  const handleOpenEditModal = (item: PropertyItem) => {
    setEditingDealId(item.id);
    setFieldErrors({});
    setSubmitError(null);
    setAdminForm({
      title: item.title,
      location: item.location,
      city: item.city,
      state: item.state,
      lat: item.lat ?? null,
      lng: item.lng ?? null,
      bedrooms: item.bedrooms,
      bathrooms: item.bathrooms,
      monthlyRent: item.monthlyRent.replace(/[^0-9]/g, ""),
      netProfit: item.netProfit.replace(/[^0-9]/g, ""),
      status: item.status,
      imageUrl: item.imageUrl,
      description: item.description,
      listings: item.listings || [],
    });
    setImageFiles([]);
    setImagePreviews([]);
    setShowPropertyEditorModal(true);

    setImageFiles([]);
    setImagePreviews([]);
    setExistingMedia(item.media || []);
    setShowPropertyEditorModal(true);
  };
  const handleImageFilesSelected = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setImageFiles((prev) => [...prev, ...arr]);
    setImagePreviews((prev) => [
      ...prev,
      ...arr.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const handleRemoveImageFile = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleDeleteProperty = async (item: PropertyItem) => {
    const ok = await confirm({
      title: `Delete "${item.title}"?`,
      description:
        "This removes the listing and its platform links permanently. This can't be undone.",
      confirmLabel: "Delete property",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await propertyService.deleteProperty(item.id);
      setProperties((prev) => prev.filter((p) => p.id !== item.id));
      toast.success("Property deleted");
    } catch (error) {
      console.error("Delete failed", error);
      toast.error("Failed to delete property");
    }
  };

  const handleSaveProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setFieldErrors({});
    setSubmitting(true);

    const validation = propertySchema.safeParse(adminForm);
    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        errors[issue.path.join(".")] = issue.message;
      });
      setFieldErrors(errors);
      setSubmitting(false);
      toast.error("Check the highlighted fields");
      return;
    }

    const rentNum =
      parseFloat(adminForm.monthlyRent.replace(/[^0-9.]/g, "")) || 2400;
    const profitNum =
      parseFloat(adminForm.netProfit.replace(/[^0-9.]/g, "")) || 1800;

    const payload: any = {
      title: adminForm.title,
      city: adminForm.city || "Pensacola",
      state: adminForm.state || "FL",
      lat: adminForm.lat ?? null,
      lng: adminForm.lng ?? null,
      price: rentNum,
      rent_monthly: rentNum,
      net_profit_monthly: profitNum,
      cash_to_start: Math.round(rentNum * 2),
      bedrooms: adminForm.bedrooms,
      bathrooms: adminForm.bathrooms,
      status: STATUS_TO_API[adminForm.status] ?? "active",
      description: adminForm.description,
      image_url: adminForm.imageUrl,
      images: adminForm.imageUrl ? [adminForm.imageUrl] : [],
      listings: adminForm.listings,
    };

    try {
      let savedId: string | number | null = editingDealId;

      if (editingDealId) {
        await propertyService.updateProperty(editingDealId, payload);
        toast.success("Changes saved");
      } else {
        const created: any = await propertyService.createProperty(payload);
        savedId = created.id;
        toast.success("Property created");
      }

      if (imageFiles.length > 0 && savedId) {
        setUploadingImages(true);
        try {
          await propertyService.uploadPropertyImages(savedId, imageFiles);
          toast.success(
            `Uploaded ${imageFiles.length} photo${imageFiles.length > 1 ? "s" : ""}`,
          );
        } catch (uploadErr: any) {
          console.error("Image upload failed", uploadErr);
          toast.error(
            "Photos didn't upload",
            uploadErr?.message ||
              "Property was saved. Try uploading again from Edit.",
          );
        } finally {
          setUploadingImages(false);
        }
      }

      setShowPropertyEditorModal(false);
      loadPropertiesFromApi();
    } catch (err: any) {
      setSubmitError(
        err?.message || "Failed to save property. Please check inputs.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExistingImage = async (mediaId: string | number) => {
    const ok = await confirm({
      title: "Delete this photo?",
      description: "This removes it permanently from storage.",
      confirmLabel: "Delete photo",
      tone: "danger",
    });
    if (!ok) return;

    setDeletingMediaId(mediaId);
    try {
      await propertyService.deletePropertyImage(mediaId);
      setExistingMedia((prev) => prev.filter((m) => m.id !== mediaId));
      toast.success("Photo deleted");
    } catch (err: any) {
      console.error("Delete image failed", err);
      toast.error("Couldn't delete photo", err?.message);
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleToggleStatus = async (prop: PropertyItem) => {
    const nextDisplayStatus: PropertyStatus =
      prop.status === "AVAILABLE"
        ? "OCCUPIED"
        : prop.status === "OCCUPIED"
          ? "UNDER CONTRACT"
          : "AVAILABLE";
    try {
      await propertyService.updateProperty(prop.id, {
        status: STATUS_TO_API[nextDisplayStatus],
      } as any);
      toast.success(`Marked as ${nextDisplayStatus.toLowerCase()}`);
      loadPropertiesFromApi();
    } catch (err) {
      console.error("Status update failed", err);
      toast.error("Failed to update status");
    }
  };

  const handleToggleListingActive = async (
    dealId: string | number,
    platformIndex: number,
  ) => {
    const prop = properties.find((p) => p.id === dealId);
    if (!prop) return;

    const updatedListings = prop.listings.map((item, idx) =>
      idx === platformIndex ? { ...item, isActive: !item.isActive } : item,
    );

    try {
      await propertyService.updateProperty(dealId, {
        listings: updatedListings,
      } as any);
      loadPropertiesFromApi();
    } catch (err) {
      console.error("Listing toggle failed", err);
      toast.error("Failed to update platform link");
    }
  };

  const metrics = useMemo(
    () => ({
      total: properties.length,
      available: properties.filter((d) => d.status === "AVAILABLE").length,
      activeLinks: properties.reduce(
        (acc, d) => acc + (d.listings?.filter((l) => l.isActive).length || 0),
        0,
      ),
      totalYield: properties.reduce(
        (acc, d) => acc + (parseInt(d.netProfit.replace(/[^0-9]/g, "")) || 0),
        0,
      ),
    }),
    [properties],
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <Panel className="p-5 sm:p-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="w-full lg:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full mb-3 border border-white/10">
              <Lock className="w-3.5 h-3.5 text-[#E04F33]" />
              <span className="text-[10px] font-bold text-[#FF8A73] tracking-wider uppercase font-mono">
                Kaizen Property Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-tight">
              Property Management Workspace
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-xl leading-relaxed">
              Manage luxury villa listings, specs, photo galleries, and platform
              booking links (Airbnb, Vrbo, Booking.com, Zillow, Direct Site).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            <Button
              variant="ghost"
              icon={Download}
              className="w-full sm:w-auto"
            >
              Export schema
            </Button>
            <Button
              variant="ghost"
              icon={RotateCcw}
              onClick={() => loadPropertiesFromApi()}
              className={`w-full sm:w-auto ${loading ? "[&_svg]:animate-spin [&_svg]:text-[#E04F33]" : ""}`}
            >
              Refresh
            </Button>
            <Button
              icon={Plus}
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto uppercase tracking-widest"
            >
              Add property
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 border-t border-white/10">
          <MetricCard
            icon={Home}
            label="Total Properties"
            value={`${metrics.total} Units`}
            tone="text-white"
          />
          <MetricCard
            icon={Check}
            label="Active Listings"
            value={`${metrics.available} Available`}
            tone="text-emerald-400"
          />
          <MetricCard
            icon={LinkIcon}
            label="Active Platform Links"
            value={`${metrics.activeLinks} Active`}
            tone="text-[#FF8A73]"
          />
          <MetricCard
            icon={TrendingUp}
            label="Total Net Monthly Yield"
            value={`~$${metrics.totalYield.toLocaleString()}/mo`}
            tone="text-emerald-400"
          />
        </div>
      </Panel>

      {/* ── Table Section ── */}
      <Panel className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-white font-serif flex items-center gap-2">
              <Building className="w-5 h-5 text-[#E04F33]" />
              Property Management
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Toggle platform links, edit financial specs, or add new luxury
              listings.
            </p>
          </div>
          <Button
            icon={Plus}
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto"
          >
            Add property
          </Button>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-black/30 rounded-2xl border border-white/10">
          <input
            type="text"
            placeholder="Filter by city..."
            value={filters.city}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, city: e.target.value }))
            }
            className="flex-1 min-w-[140px] px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono placeholder:text-slate-500"
          />

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="px-3 py-2 bg-[#0F1014] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="UNDER CONTRACT">Under Contract</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="UNDER REVIEW">Under Review</option>
          </select>

          <button
            onClick={() => {
              if (filters.sortBy === "nearest") {
                setFilters((prev) => ({
                  ...prev,
                  sortBy: "default",
                  userLat: null,
                  userLng: null,
                }));
              } else {
                handleSortByNearest();
              }
            }}
            disabled={gpsLoading}
            className={`px-3 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 ${
              filters.sortBy === "nearest"
                ? "bg-[#E04F33]/20 border-[#E04F33]/50 text-[#FF8A73]"
                : "bg-white/5 border-white/10 text-slate-300 hover:border-white/30"
            }`}
          >
            {gpsLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            {filters.sortBy === "nearest"
              ? "Nearest first ✓"
              : "Sort by nearest"}
          </button>

          {hasActiveFilters && (
            <button
              onClick={() => setFilters({ ...DEFAULT_FILTERS })}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
          )}

          {filters.sortBy === "nearest" && filters.userLat != null && (
            <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {filters.userLat.toFixed(2)},{" "}
              {filters.userLng?.toFixed(2)}
            </span>
          )}
        </div>

        {/* MOBILE: Card Layout */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {loading ? (
            <SkeletonRows count={3} />
          ) : properties.length === 0 ? (
            <EmptyState
              icon={Building}
              title="No properties found"
              hint={
                hasActiveFilters
                  ? "Try clearing filters."
                  : "Add your first luxury listing to get started."
              }
              action={
                !hasActiveFilters ? (
                  <Button icon={Plus} onClick={handleOpenCreateModal}>
                    Add property
                  </Button>
                ) : undefined
              }
            />
          ) : (
            properties.map((deal) => {
              const activeCount =
                deal.listings?.filter((l) => l.isActive).length || 0;
              return (
                <div
                  key={deal.id}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 space-y-3.5 animate-[row-in_0.2s_ease-out]"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={deal.imageUrl}
                      alt={deal.title}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).src = FALLBACK_IMAGE)
                      }
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-white text-sm font-serif leading-snug">
                          {deal.title}
                        </h4>
                        <PropertyStatusToggle
                          status={deal.status}
                          onClick={() => handleToggleStatus(deal)}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">
                        {deal.location} • {deal.bedrooms} bed, {deal.bathrooms}{" "}
                        bath
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-white/5 rounded-xl border border-white/5 text-xs font-mono">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">
                        Monthly Rent
                      </span>
                      <span className="font-bold text-slate-200">
                        {deal.monthlyRent}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase">
                        Net Profit
                      </span>
                      <span className="font-extrabold text-emerald-400">
                        {deal.netProfit}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">
                        Platforms
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {activeCount} of {deal.listings?.length || 0} Active
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {deal.listings?.map((item, idx) => (
                        <PlatformChip
                          key={idx}
                          platform={item.platform}
                          isActive={item.isActive}
                          onClick={() =>
                            handleToggleListingActive(deal.id, idx)
                          }
                        />
                      ))}
                      {deal.listings?.length === 0 && (
                        <span className="text-[10px] text-slate-500 italic font-mono">
                          No platforms linked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                    <Button
                      variant="ghost"
                      icon={Edit}
                      onClick={() => handleOpenEditModal(deal)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <IconButton
                      variant="danger"
                      onClick={() => handleDeleteProperty(deal)}
                      aria-label={`Delete ${deal.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </IconButton>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* DESKTOP: Table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-white/10 bg-black/40">
          <table className="w-full text-left text-xs text-slate-300 border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.06] font-mono text-[11px] text-slate-300">
                <th className="py-3.5 px-4 font-bold min-w-[220px]">
                  Property &amp; Address
                </th>
                <th className="py-3.5 px-4 font-bold min-w-[140px]">
                  Status / Occupancy
                </th>
                <th className="py-3.5 px-4 font-bold min-w-[110px]">
                  Monthly Rent
                </th>
                <th className="py-3.5 px-4 font-bold min-w-[130px]">
                  Net Monthly Profit
                </th>
                <th className="py-3.5 px-4 font-bold min-w-[160px]">
                  Active Platforms
                </th>
                <th className="py-3.5 px-4 text-right font-bold min-w-[110px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E04F33]" />
                    Loading properties…
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10">
                    <EmptyState
                      icon={Building}
                      title="No properties found"
                      hint={
                        hasActiveFilters
                          ? "Try clearing filters."
                          : "Add your first luxury listing to get started."
                      }
                    />
                  </td>
                </tr>
              ) : (
                properties.map((deal) => {
                  const activeCount =
                    deal.listings?.filter((l) => l.isActive).length || 0;
                  return (
                    <tr
                      key={deal.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3.5 px-4 min-w-[220px]">
                        <div className="flex items-center gap-4 min-w-0">
                          <img
                            src={deal.imageUrl}
                            alt={deal.title}
                            className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
                            onError={(e) =>
                              ((e.target as HTMLImageElement).src =
                                FALLBACK_IMAGE)
                            }
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-white text-sm font-serif truncate">
                              {deal.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono break-words leading-tight mt-0.5">
                              {deal.location} • {deal.bedrooms} bed,{" "}
                              {deal.bathrooms} bath
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="flex flex-col gap-1 min-w-0 items-start">
                          <PropertyStatusToggle
                            status={deal.status}
                            onClick={() => handleToggleStatus(deal)}
                          />
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Est. Occ: {deal.occupancyEst}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                        {deal.monthlyRent}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-emerald-400">
                        {deal.netProfit}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 max-w-[200px]">
                          {deal.listings?.map((item, idx) => (
                            <PlatformChip
                              key={idx}
                              platform={item.platform}
                              isActive={item.isActive}
                              onClick={() =>
                                handleToggleListingActive(deal.id, idx)
                              }
                            />
                          ))}
                          {deal.listings?.length === 0 && (
                            <span className="text-[10px] text-slate-500 italic font-mono">
                              No platforms
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono block mt-1">
                          {activeCount} of {deal.listings?.length || 0} Active
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton
                            onClick={() => handleOpenEditModal(deal)}
                            aria-label={`Edit ${deal.title}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </IconButton>
                          <IconButton
                            variant="danger"
                            onClick={() => handleDeleteProperty(deal)}
                            aria-label={`Delete ${deal.title}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ── Editor Modal ── */}
      <Modal
        open={showPropertyEditorModal}
        onClose={() => setShowPropertyEditorModal(false)}
        title={
          editingDealId ? "Edit property specs" : "Create new luxury property"
        }
        eyebrow="Property Portal"
        maxWidth="max-w-3xl"
      >
        {submitError && (
          <div className="mb-5 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-400 font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSaveProperty} className="space-y-5 text-xs">
          <Field label="Title" error={fieldErrors.title}>
            <input
              type="text"
              autoFocus
              value={adminForm.title}
              onChange={(e) =>
                setAdminForm({ ...adminForm, title: e.target.value })
              }
              className={fieldInputCls(!!fieldErrors.title)}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="City" error={fieldErrors.city}>
              <input
                type="text"
                value={adminForm.city}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, city: e.target.value })
                }
                placeholder="Pensacola"
                className={fieldInputCls(!!fieldErrors.city)}
              />
            </Field>

            <Field label="State" error={fieldErrors.state}>
              <input
                type="text"
                value={adminForm.state}
                onChange={(e) =>
                  setAdminForm({
                    ...adminForm,
                    state: e.target.value.toUpperCase().slice(0, 2),
                  })
                }
                placeholder="FL"
                maxLength={2}
                className={`${fieldInputCls(!!fieldErrors.state)} uppercase tracking-widest`}
              />
            </Field>

            <Field label="Coordinates">
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className={`w-full px-3.5 py-2.5 border rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all ${
                  adminForm.lat
                    ? "bg-[#E04F33]/15 border-[#E04F33]/50 text-[#FF8A73]"
                    : "bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-slate-200"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {adminForm.lat
                  ? `${adminForm.lat.toFixed(3)}, ${adminForm.lng?.toFixed(3)}`
                  : "Pin on map"}
              </button>
            </Field>
          </div>

          <Field label="Bedrooms">
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAdminForm({ ...adminForm, bedrooms: n })}
                  className={`w-9 h-9 rounded-xl text-xs font-bold font-mono border transition-all ${
                    adminForm.bedrooms === n
                      ? "bg-[#E04F33] text-white border-[#E04F33] shadow-md shadow-[#E04F33]/25"
                      : "bg-white/5 text-slate-300 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Bathrooms">
            <div className="flex items-center gap-2 flex-wrap">
              {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAdminForm({ ...adminForm, bathrooms: n })}
                  className={`px-3 h-9 rounded-xl text-xs font-bold font-mono border transition-all ${
                    adminForm.bathrooms === n
                      ? "bg-[#E04F33] text-white border-[#E04F33] shadow-md shadow-[#E04F33]/25"
                      : "bg-white/5 text-slate-300 border-white/10 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Monthly Rent ($)" error={fieldErrors.monthlyRent}>
              <input
                type="text"
                value={adminForm.monthlyRent}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, monthlyRent: e.target.value })
                }
                className={fieldInputCls(!!fieldErrors.monthlyRent)}
              />
            </Field>

            <Field label="Net Profit ($)" error={fieldErrors.netProfit}>
              <input
                type="text"
                value={adminForm.netProfit}
                onChange={(e) =>
                  setAdminForm({ ...adminForm, netProfit: e.target.value })
                }
                className={fieldInputCls(!!fieldErrors.netProfit)}
              />
            </Field>

            <Field label="Status">
              <select
                value={adminForm.status}
                onChange={(e) =>
                  setAdminForm({
                    ...adminForm,
                    status: e.target.value as PropertyStatus,
                  })
                }
                className="w-full px-3.5 py-2.5 bg-[#0F1014] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="UNDER CONTRACT">UNDER CONTRACT</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="UNDER REVIEW">UNDER REVIEW</option>
              </select>
            </Field>
          </div>
          {existingMedia.length > 0 && (
            <Field label={`Current photos (${existingMedia.length})`}>
              <div className="flex flex-wrap gap-2">
                {existingMedia.map((m) => (
                  <div key={m.id} className="relative w-16 h-16 shrink-0">
                    <img
                      src={m.cdn_url}
                      alt="Property"
                      className="w-full h-full rounded-lg object-cover border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteExistingImage(m.id)}
                      disabled={deletingMediaId === m.id}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white hover:bg-red-500/80 disabled:opacity-50"
                      aria-label="Delete photo"
                    >
                      {deletingMediaId === m.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <X className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </Field>
          )}

          <Field label="Upload photos">
            <label
              htmlFor="property-image-upload"
              className="flex flex-col items-center justify-center gap-2 px-4 py-6 bg-white/5 border border-dashed border-white/15 rounded-xl text-slate-400 hover:border-[#E04F33]/50 hover:text-slate-200 cursor-pointer transition-all text-xs font-mono"
            >
              <Upload className="w-5 h-5" />
              Click to select images — JPG, PNG, WEBP, up to 5MB each
              <input
                id="property-image-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleImageFilesSelected(e.target.files)}
              />
            </label>

            {imagePreviews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative w-16 h-16 shrink-0">
                    <img
                      src={src}
                      alt={`Upload ${idx + 1}`}
                      className="w-full h-full rounded-lg object-cover border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImageFile(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-white hover:bg-red-500/80"
                      aria-label="Remove image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {editingDealId === null && imageFiles.length > 0 && (
              <p className="text-[10px] text-slate-500 mt-2 font-mono">
                Photos upload right after the property is created.
              </p>
            )}
          </Field>

          <Field label="Description">
            <textarea
              rows={3}
              value={adminForm.description}
              onChange={(e) =>
                setAdminForm({ ...adminForm, description: e.target.value })
              }
              className={`${fieldInputCls()} font-sans resize-y`}
            />
          </Field>

          {/* Platform Links */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#FF8A73] uppercase font-mono flex items-center gap-2">
                <LinkIcon className="w-3.5 h-3.5" /> Platform Links
              </label>
              <button
                type="button"
                onClick={() =>
                  setAdminForm({
                    ...adminForm,
                    listings: [
                      ...adminForm.listings,
                      { platform: "Airbnb", url: "", isActive: true },
                    ],
                  })
                }
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold font-mono border border-white/15 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3 h-3 text-[#E04F33]" /> Add
              </button>
            </div>

            <div className="space-y-3">
              {adminForm.listings.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white/5 rounded-xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                >
                  <select
                    value={item.platform}
                    onChange={(e) => {
                      const updated = [...adminForm.listings];
                      updated[idx].platform = e.target.value;
                      setAdminForm({ ...adminForm, listings: updated });
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 bg-[#0F1014] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] font-mono"
                  >
                    {AVAILABLE_PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>

                  <input
                    type="url"
                    placeholder="Listing URL (https://...)"
                    value={item.url}
                    onChange={(e) => {
                      const updated = [...adminForm.listings];
                      updated[idx].url = e.target.value;
                      setAdminForm({ ...adminForm, listings: updated });
                    }}
                    className={`flex-1 w-full px-3.5 py-2 bg-white/5 border rounded-xl text-white text-xs focus:outline-none transition-colors ${
                      fieldErrors[`listings.${idx}.url`]
                        ? "border-red-500"
                        : "border-white/10 focus:border-[#E04F33]"
                    }`}
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...adminForm.listings];
                        updated[idx].isActive = !updated[idx].isActive;
                        setAdminForm({ ...adminForm, listings: updated });
                      }}
                      className={`flex-1 sm:flex-none px-3 py-2 rounded-lg text-[10px] font-mono font-bold transition-all border flex justify-center items-center gap-1 ${
                        item.isActive
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          : "bg-white/5 text-slate-400 border-white/10"
                      }`}
                    >
                      {item.isActive && (
                        <Check className="w-3 h-3 text-emerald-400" />
                      )}
                      {item.isActive ? "Active" : "Hidden"}
                    </button>

                    <IconButton
                      variant="danger"
                      type="button"
                      onClick={() => {
                        const updated = adminForm.listings.filter(
                          (_, i) => i !== idx,
                        );
                        setAdminForm({ ...adminForm, listings: updated });
                      }}
                      aria-label="Remove platform link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </IconButton>
                  </div>
                </div>
              ))}

              {adminForm.listings.length === 0 && (
                <div className="text-center py-4 bg-white/5 rounded-xl border border-dashed border-white/10 text-slate-400 text-xs font-mono">
                  No platform links attached to this property.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPropertyEditorModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting || uploadingImages}
              className="w-full sm:w-auto uppercase tracking-wider"
            >
              {uploadingImages
                ? "Uploading photos…"
                : editingDealId
                  ? "Save changes"
                  : "Create property"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Map Picker Modal ── */}
      {showMapPicker && (
        <MapLocationPicker
          initialLabel={
            adminForm.city ? `${adminForm.city}, ${adminForm.state}` : ""
          }
          onClose={() => setShowMapPicker(false)}
          onConfirm={(loc) => {
            const parts = loc.label.split(",").map((s: string) => s.trim());
            const city = parts[0] ?? "";
            const stateRaw = parts[1] ?? "";
            const state =
              stateRaw.length <= 3 ? stateRaw.toUpperCase() : stateRaw;
            setAdminForm({
              ...adminForm,
              location: loc.label,
              city,
              state,
              lat: loc.lat,
              lng: loc.lng,
            });
            setShowMapPicker(false);
          }}
        />
      )}
    </div>
  );
};
