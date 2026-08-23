import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck } from 'lucide-react';
import { useMyBookings } from '../../hooks/useMyBookings';
import { SkeletonList } from '../common/Skeleton';
import { EmptyState } from '../common/EmptyState';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { BookingListItem } from './BookingListItem';
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};
const BookingsContent: React.FC = () => {
  const { bookings, loading, error } = useMyBookings();
  if (loading) return <SkeletonList label="Loading your bookings" rows={2} rowHeightClass="h-28" />;
  if (error)
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        role="alert"
        className="text-sm text-rose-300 text-center py-12"
      >
        {error}
      </motion.p>
    );
  if (bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <EmptyState
          icon={ShieldCheck}
          title="No active bookings found"
          description="You haven't locked or secured any villa leases yet. Select a property to initiate a lock session."
        />
      </motion.div>
    );
  }
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <AnimatePresence mode="popLayout">
        {bookings.map((booking) => (
          <motion.div key={booking.id} layout variants={itemVariants} exit={{ opacity: 0, scale: 0.96 }}>
            <BookingListItem booking={booking} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
export const BookingsView: React.FC = () => (
  <div className="max-w-6xl mx-auto p-6 space-y-6 text-slate-100">
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="pb-4 border-b border-white/10"
    >
      <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
        <motion.span
          initial={{ scale: 0.6, rotate: -15, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
        >
          <Lock className="w-7 h-7 text-[#E04F33]" aria-hidden="true" />
        </motion.span>
        My <span className="text-[#E04F33]">Lease Transactions & Locks</span>
      </h1>
      <p className="text-xs text-slate-400 mt-1">
        Real-time status of secured villa leases and active hold locks on Kaizen.
      </p>
    </motion.div>
    <ErrorBoundary fallbackTitle="Couldn't load your bookings">
      <BookingsContent />
    </ErrorBoundary>
  </div>
);
