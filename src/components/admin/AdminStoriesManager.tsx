import React, { useState, useEffect, useCallback } from "react";
import {
  MessageSquareQuote,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Star,
  UserCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { apiClient } from "../../api/http";

// ── Types ──────────────────────────────────────────────────────────────────────
interface SuccessStory {
  id: number;
  customer_name: string;
  customer_avatar_url: string;
  property: number | null;
  property_title: string;
  content: string;
  rating: number;
  featured: boolean;
  created_at: string;
}

type FormState = {
  customer_name: string;
  customer_avatar_url: string;
  property_title: string;
  content: string;
  rating: number;
  featured: boolean;
};

const DEFAULT_FORM: FormState = {
  customer_name: "",
  customer_avatar_url: "",
  property_title: "",
  content: "",
  rating: 5,
  featured: false,
};

// ── Star Rating Display ────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating: number; size?: string }> = ({ rating, size = "w-3.5 h-3.5" }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${size} ${n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
    ))}
  </div>
);

// ── Story Card ────────────────────────────────────────────────────────────────
const StoryCard: React.FC<{
  story: SuccessStory;
  onEdit: (s: SuccessStory) => void;
  onDelete: (id: number) => void;
}> = ({ story, onEdit, onDelete }) => (
  <div className="flex items-start gap-4 p-4 bg-white/3 hover:bg-white/5 rounded-2xl border border-white/8 transition-colors group">
    {story.customer_avatar_url ? (
      <img
        src={story.customer_avatar_url}
        alt={story.customer_name}
        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
      />
    ) : (
      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
        <UserCircle className="w-6 h-6 text-slate-500" />
      </div>
    )}

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <p className="text-sm font-bold text-white">{story.customer_name}</p>
        {story.featured && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border bg-amber-500/15 text-amber-300 border-amber-500/30 uppercase">
            Featured
          </span>
        )}
      </div>
      <StarRating rating={story.rating} />
      {story.property_title && (
        <p className="text-[11px] text-slate-500 font-mono mt-0.5">Property: {story.property_title}</p>
      )}
      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{story.content}</p>
    </div>

    <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={() => onEdit(story)}
        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all"
        title="Edit"
      >
        <Edit className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => onDelete(story.id)}
        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 transition-all"
        title="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────────
export const AdminStoriesManager: React.FC = () => {
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<SuccessStory[]>("/api/admin/stories/", { method: "GET" });
      setStories(Array.isArray(data) ? data : (data as any)?.results ?? []);
    } catch {
      setStories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const openEdit = (story: SuccessStory) => {
    setEditingId(story.id);
    setForm({
      customer_name: story.customer_name,
      customer_avatar_url: story.customer_avatar_url,
      property_title: story.property_title,
      content: story.content,
      rating: story.rating,
      featured: story.featured,
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this success story?")) return;
    try {
      await apiClient(`/api/admin/stories/${id}/`, { method: "DELETE" });
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("Failed to delete story.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editingId) {
        const updated = await apiClient<SuccessStory>(`/api/admin/stories/${editingId}/`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setStories((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      } else {
        const created = await apiClient<SuccessStory>("/api/admin/stories/", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setStories((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const detail =
        err?.data?.customer_name?.[0] || err?.data?.detail || err?.message || "Failed to save.";
      setSubmitError(String(detail));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = stories.filter(
    (s) =>
      s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      s.property_title.toLowerCase().includes(search.toLowerCase()),
  );

  const inputCls =
    "w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] transition-colors font-mono";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73] mb-1.5";

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#141824]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center">
                <MessageSquareQuote className="w-5 h-5 text-[#E04F33]" />
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Customer Success <span className="text-[#E04F33]">Stories &amp; Testimonials</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 ml-12">
              Manage verified guest testimonials, reviews, and featured success stories displayed on the site.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#E04F33]/25 transition-all border border-white/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            + Add Success Story
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="bg-[#141824]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search stories by customer name or property…"
              className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#E04F33]/50 transition-colors font-mono"
            />
          </div>
          <p className="text-xs text-slate-500 font-mono shrink-0">Total Stories: {stories.length}</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <MessageSquareQuote className="w-7 h-7 text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-mono">No success stories found</p>
              <p className="text-xs mt-1">Click "+ Add Success Story" above to publish guest feedback.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => <StoryCard key={s.id} story={s} onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121622] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white font-heading">
                {editingId ? "Edit Story" : "Add Success Story"}
              </h3>
              <button
                onClick={() => { setIsModalOpen(false); setSubmitError(null); }}
                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitError && (
              <div className="px-4 py-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0">✕</span>
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Customer Name *</label>
                  <input type="text" required value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="e.g. Sarah Mitchell"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Property Name</label>
                  <input type="text" value={form.property_title}
                    onChange={(e) => setForm({ ...form, property_title: e.target.value })}
                    placeholder="e.g. Coastal Retreat"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Avatar Image URL</label>
                <input type="url" value={form.customer_avatar_url}
                  onChange={(e) => setForm({ ...form, customer_avatar_url: e.target.value })}
                  placeholder="https://…"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Testimonial *</label>
                <textarea rows={4} required value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="The guest's experience in their own words…"
                  className={`${inputCls} font-sans`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Rating (1–5)</label>
                  <select value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className={inputCls}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{"★".repeat(n)} ({n})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Featured?</label>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, featured: !form.featured })}
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                      form.featured
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-black/40 border-white/10 text-slate-400"
                    }`}
                  >
                    <Star className={`w-3.5 h-3.5 ${form.featured ? "fill-amber-400 text-amber-400" : ""}`} />
                    {form.featured ? "Yes — Featured" : "No — Not Featured"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] disabled:opacity-60 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#E04F33]/30 transition-all border border-white/20"
                >
                  {submitting ? (editingId ? "Saving…" : "Adding…") : (editingId ? "Save Changes" : "Add Story")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
