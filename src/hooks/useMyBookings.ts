import { useState, useEffect } from 'react';
import { bookingService, propertyService } from '../api/services';
import type { BookingRecord } from '../api/services';

export interface EnrichedBooking extends BookingRecord {
  propertyDetail?: any; // full property object (images, price, etc.)
}

export function useMyBookings() {
  const [bookings, setBookings] = useState<EnrichedBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const records = await bookingService.getUserBookings();

      // Fire parallel property-detail fetches; fall back gracefully on failure
      const enriched = await Promise.all(
        records.map(async (b) => {
          if (!b.property) return { ...b, propertyDetail: undefined };
          try {
            const detail = await propertyService.getPropertyById(b.property);
            return { ...b, propertyDetail: detail };
          } catch {
            return { ...b, propertyDetail: undefined };
          }
        }),
      );

      setBookings(enriched);
    } catch (e: any) {
      setError(e?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return { bookings, loading, error, refetch: fetchAll };
}
