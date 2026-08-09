import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useMyBookings } from '../../hooks/useMyBookings';
import { SkeletonList } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { BookingListItem } from './BookingListItem';

const BookingsContent: React.FC = () => {
  const { bookings, loading, error } = useMyBookings();

  if (loading) return <SkeletonList label="Loading your bookings" rows={2} rowHeightClass="h-28" />;
  if (error) return <p role="alert" className="text-sm text-rose-300 text-center py-12">{error}</p>;

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title="No active bookings found"
        description="You haven't locked or secured any villa leases yet. Select a property to initiate a lock session."
      />
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <BookingListItem key={booking.id} booking={booking} />
      ))}
    </div>
  );
};

export const BookingsView: React.FC = () => (
  <div className="max-w-6xl mx-auto p-6 space-y-6 text-slate-900 dark:text-slate-100">
    <div className="pb-4 border-b border-slate-200 dark:border-white/10">
      <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
        <Lock className="w-7 h-7 text-[#E04F33]" aria-hidden="true" />
        My <span className="text-[#E04F33]">Lease Transactions & Locks</span>
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        Real-time status of secured villa leases and active hold locks on Kaizen.
      </p>
    </div>
    <ErrorBoundary fallbackTitle="Couldn't load your bookings">
      <BookingsContent />
    </ErrorBoundary>
  </div>
);
