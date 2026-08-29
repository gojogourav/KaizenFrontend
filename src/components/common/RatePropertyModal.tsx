import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, CheckCircle2, MessageSquare, Building, X } from "lucide-react";
import { useRatings } from "../../hooks/useRatings";
import { useTheme } from "../../context/ThemeContext";

interface RatePropertyModalProps {
  property: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RatePropertyModal: React.FC<RatePropertyModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { submitRating, getRating } = useRatings();

  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (property?.id) {
      const existing = getRating(property.id);
      if (existing) {
        setSelectedRating(existing.rating);
        setReviewText(existing.review || "");
      } else {
        setSelectedRating(5);
        setReviewText("");
      }
      setSubmitted(false);
    }
  }, [property?.id, isOpen]);

  if (!isOpen || !property) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitRating(property.id, selectedRating, reviewText);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1800);
    } catch {
      // Fallback handled inside hook
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 cursor-pointer"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className={`rounded-3xl max-w-md w-full border shadow-2xl overflow-hidden relative z-10 p-6 sm:p-8 space-y-6 ${
            isDark
              ? "bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/80"
              : "bg-white border-slate-200 text-slate-900 shadow-slate-300/50"
          }`}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-serif">Rating Submitted!</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Thank you for reviewing {property.title}. Your feedback helps our community stay transparent.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-mono font-bold uppercase tracking-wider">
                  <Building className="w-3 h-3" />
                  <span>Guest Stay Feedback</span>
                </div>
                <h3 className="text-xl font-bold font-serif leading-tight">
                  Rate Your Stay at {property.title}
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  How was your experience staying or locking terms for this property?
                </p>
              </div>

              {/* Star Rating Selectors */}
              <div className="space-y-2 text-center py-2 bg-slate-500/5 rounded-2xl border border-slate-500/10 p-4">
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400">
                  Select Rating (1 to 5 Stars)
                </p>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || selectedRating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setSelectedRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            active
                              ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                              : "text-slate-400 fill-slate-800"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 block pt-1">
                  {selectedRating === 5 && "★★★★★ Outstanding Experience"}
                  {selectedRating === 4 && "★★★★☆ Great Stay & Service"}
                  {selectedRating === 3 && "★★★☆☆ Satisfactory"}
                  {selectedRating === 2 && "★★☆☆☆ Below Expectations"}
                  {selectedRating === 1 && "★☆☆☆☆ Poor Experience"}
                </span>
              </div>

              {/* Review Comment Box */}
              <div>
                <label className="block text-xs font-bold font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                  Your Review / Bio Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details about cleanliness, amenities, check-in, or host communication..."
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDark
                      ? "bg-slate-950 border-slate-800 text-white placeholder-slate-500"
                      : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400"
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 font-mono disabled:opacity-50 cursor-pointer transition-all"
              >
                {submitting ? "Submitting..." : "Submit Review & Rating"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
