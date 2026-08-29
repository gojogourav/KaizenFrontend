import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarCheck, ShieldCheck } from 'lucide-react';
import { useMyBookings } from '../../hooks/useMyBookings';
import type { EnrichedBooking } from '../../hooks/useMyBookings';
import { SkeletonGrid } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { PropertyCard } from '../property/PropertyCard';
import { useTheme } from '../../context/ThemeContext';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80';

const STATE_TO_STATUS: Record<string, string> = {
  locked: 'LOCKED',
  pending_review: 'UNDER REVIEW',
  purchased: 'PURCHASED',
  cancelled: 'CANCELLED',
  expired: 'MAINTENANCE',
};

/** Build a PropertyCard-compatible deal from an enriched booking */
function bookingToDeal(booking: EnrichedBooking) {
  const prop = booking.propertyDetail;

  const images: string[] =
    prop?.media?.length > 0
      ? prop.media.map((m: any) => m.cdn_url).filter(Boolean)
      : prop?.images?.length > 0
        ? prop.images.filter(Boolean)
        : [FALLBACK_IMAGE];

  const price = prop?.rent_monthly
    ? Number(prop.rent_monthly)
    : prop?.price
      ? Number(prop.price)
      : prop?.adr
        ? Number(prop.adr)
        : undefined;

  return {
    id: booking.id,
    title: booking.property_title || prop?.title || `Booking #${booking.id}`,
    description:
      booking.check_in && booking.check_out
        ? `Check-in: ${new Date(booking.check_in).toLocaleDateString()} → Check-out: ${new Date(booking.check_out).toLocaleDateString()}`
        : prop?.description ||
          `Booked on ${new Date(booking.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`,
    images,
    status: STATE_TO_STATUS[booking.state] ?? 'AVAILABLE',
    availabilityRange: `Booking #${booking.id}`,
    listings: prop?.listings || [],
    price,
    bedrooms: prop?.bedrooms,
    bathrooms: prop?.bathrooms,
    squareFeet: prop?.squareFeet ?? prop?.square_feet,
    city: prop?.city,
    state: prop?.state,
    _propertyDetail: prop || { id: booking.property, title: booking.property_title },
  };
}

interface BookingsContentProps {
  onOpenProspectus: (deal: any) => void;
  onRateDeal: (deal: any) => void;
}

const BookingsContent: React.FC<BookingsContentProps> = ({
  onOpenProspectus,
  onRateDeal,
}) => {
  const { bookings, loading, error } = useMyBookings();

  if (loading)
    return <SkeletonGrid label="Loading your bookings" items={4} itemHeightClass="h-80" />;

  if (error)
    return (
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        role="alert" className="text-sm text-rose-500 text-center py-12 font-medium"
      >
        {error}
      </motion.p>
    );

  if (bookings.length === 0)
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <EmptyState
          icon={ShieldCheck}
          title="No active bookings found"
          description="You haven't locked or secured any property leases yet. Select a property to initiate a lock session."
        />
      </motion.div>
    );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="bookings-grid"
        role="list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full min-w-0"
      >
        {bookings.map((booking, idx) => {
          const deal = bookingToDeal(booking);
          return (
            <motion.div
              role="listitem"
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="min-w-0"
            >
              <PropertyCard
                deal={deal}
                isFavorite={false}
                onToggleFavorite={() => {}}
                onOpenProspectus={() =>
                  onOpenProspectus(deal._propertyDetail ?? deal)
                }
                onRate={() => onRateDeal(deal._propertyDetail ?? deal)}
              />
            </motion.div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};

interface BookingsViewProps {
  onOpenProspectus: (deal: any) => void;
  onRateDeal: (deal: any) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  onOpenProspectus,
  onRateDeal,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="max-w-6xl mx-auto p-2 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`flex items-center justify-between pb-4 border-b ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        <div>
          <h1 className={`text-2xl md:text-3xl font-extrabold flex items-center gap-2.5 ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            <motion.span
              initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
            >
              <CalendarCheck className="w-7 h-7 text-blue-600 dark:text-blue-400" aria-hidden="true" />
            </motion.span>
            My <span className="text-blue-600 dark:text-blue-400">Lease Bookings</span>
          </h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono font-semibold">
            Real-time status of secured villa leases and active hold locks on Kaizen. Rate stayed properties below.
          </p>
        </div>
      </motion.div>

      <ErrorBoundary fallbackTitle="Couldn't load your bookings">
        <BookingsContent onOpenProspectus={onOpenProspectus} onRateDeal={onRateDeal} />
      </ErrorBoundary>
    </div>
  );
};
