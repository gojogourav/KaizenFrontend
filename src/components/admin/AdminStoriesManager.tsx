import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  MessageSquareQuote,
  Plus,
  Edit,
  Trash2,
  Star,
  UserCircle,
} from "lucide-react";
import { apiClient } from "../../api/http";
import { useToast, useConfirm } from "./AdminUIProvider";
import {
  Panel,
  Button,
  IconButton,
  StatusPill,
  EmptyState,
  SkeletonRows,
  SearchInput,
  Modal,
  Field,
  fieldInputCls,
  Avatar,
} from "./Primitives";

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

const StarRating: React.FC<{
  rating: number;
  size?: string;
  interactive?: boolean;
  onChange?: (n: number) => void;
}> = ({ rating, size = "w-3.5 h-3.5", interactive, onChange }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type={interactive ? "button" : undefined}
        disabled={!interactive}
        onClick={() => onChange?.(n)}
        className={interactive ? "transition-transform hover:scale-110 active:scale-95" : undefined}
        aria-label={interactive ? `Set rating to ${n}` : undefined}
      >
        <Star className={`${size} ${n <= rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`} />
      </button>
    ))}
  </div>
);

const StoryCard: React.FC<{
  story: SuccessStory;
  onEdit: (s: SuccessStory) => void;
  onDelete: (s: SuccessStory) => void;
}> = ({ story, onEdit, onDelete }) => (
  <div className="flex items-start gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/8 transition-colors group animate-[row-in_0.2s_ease-out]">
    <Avatar src={story.customer_avatar_url} name={story.customer_name} />

    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <p className="text-sm font-bold text-white">{story.customer_name}</p>
        {story.featured && (
          <StatusPill tone="warning" icon={Star}>Featured</StatusPill>
        )}
      </div>
      <StarRating rating={story.rating} />
      {story.property_title && (
        <p className="text-[11px] text-slate-500 font-mono mt-1">{story.property_title}</p>
      )}
      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">{story.content}</p>
    </div>

    <div className="flex items-center gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
      <IconButton onClick={() => onEdit(story)} aria-label={`Edit story from ${story.customer_name}`}>
        <Edit className="w-3.5 h-3.5" />
      </IconButton>
      <IconButton variant="danger" onClick={() => onDelete(story)} aria-label={`Delete story from ${story.customer_name}`}>
        <Trash2 className="w-3.5 h-3.5" />
      </IconButton>
    </div>
  </div>
);

export const AdminStoriesManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [featuredOnly, setFeaturedOnly] = useState(false);
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
      toast.error("Couldn't load stories", "Check your connection and try refreshing.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDelete = async (story: SuccessStory) => {
    const ok = await confirm({
      title: `Delete story from ${story.customer_name}?`,
      description: "This removes the testimonial permanently. This can't be undone.",
      confirmLabel: "Delete story",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await apiClient(`/api/admin/stories/${story.id}/`, { method: "DELETE" });
      setStories((prev) => prev.filter((s) => s.id !== story.id));
      toast.success("Story deleted");
    } catch {
      toast.error("Failed to delete story");
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
        toast.success("Changes saved");
      } else {
        const created = await apiClient<SuccessStory>("/api/admin/stories/", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setStories((prev) => [created, ...prev]);
        toast.success("Story added");
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

  const filtered = useMemo(
    () =>
      stories.filter((s) => {
        const matchesSearch =
          s.customer_name.toLowerCase().includes(search.toLowerCase()) ||
          s.property_title.toLowerCase().includes(search.toLowerCase());
        return matchesSearch && (!featuredOnly || s.featured);
      }),
    [stories, search, featuredOnly],
  );

  const featuredCount = useMemo(() => stories.filter((s) => s.featured).length, [stories]);
  const avgRating = useMemo(
    () => (stories.length ? (stories.reduce((a, s) => a + s.rating, 0) / stories.length).toFixed(1) : "—"),
    [stories],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center shrink-0">
                <MessageSquareQuote className="w-5 h-5 text-[#E04F33]" />
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Customer Success <span className="text-[#E04F33]">Stories &amp; Testimonials</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 sm:ml-12">
              Manage verified guest testimonials, reviews, and featured success stories displayed on the site.
            </p>
          </div>
          <Button icon={Plus} onClick={openCreate} className="shrink-0">
            Add success story
          </Button>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <span className="text-slate-400">Total: </span>
            <span className="text-white font-bold">{stories.length}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
            <span className="text-slate-400">Featured: </span>
            <span className="text-amber-300 font-bold">{featuredCount}</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono flex items-center gap-1.5">
            <span className="text-slate-400">Avg rating: </span>
            <span className="text-white font-bold">{avgRating}</span>
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          </div>
        </div>
      </Panel>

      {/* Body */}
      <Panel className="p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[240px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by customer or property…" className="flex-1 min-w-[180px] max-w-sm" />
            <button
              onClick={() => setFeaturedOnly((v) => !v)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide border transition-all flex items-center gap-1.5 ${
                featuredOnly
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25"
              }`}
            >
              <Star className={`w-3 h-3 ${featuredOnly ? "fill-amber-400" : ""}`} />
              Featured only
            </button>
          </div>
          <p className="text-xs text-slate-500 font-mono shrink-0">{filtered.length} of {stories.length} shown</p>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          stories.length === 0 ? (
            <EmptyState
              icon={MessageSquareQuote}
              title="No success stories yet"
              hint="Publish your first guest testimonial to build social proof."
              action={<Button icon={Plus} onClick={openCreate}>Add success story</Button>}
            />
          ) : (
            <EmptyState icon={MessageSquareQuote} title="No stories match your filters" hint="Try a different search term." />
          )
        ) : (
          <div className="space-y-2">
            {filtered.map((s) => <StoryCard key={s.id} story={s} onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </Panel>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit story" : "Add success story"}
        eyebrow="Testimonials"
      >
        {submitError && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Customer name" required>
              <input
                type="text"
                required
                autoFocus
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                placeholder="e.g. Sarah Mitchell"
                className={fieldInputCls()}
              />
            </Field>
            <Field label="Property name">
              <input
                type="text"
                value={form.property_title}
                onChange={(e) => setForm({ ...form, property_title: e.target.value })}
                placeholder="e.g. Coastal Retreat"
                className={fieldInputCls()}
              />
            </Field>
          </div>

          <Field label="Avatar image URL">
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={form.customer_avatar_url}
                onChange={(e) => setForm({ ...form, customer_avatar_url: e.target.value })}
                placeholder="https://…"
                className={`${fieldInputCls()} flex-1`}
              />
              <Avatar src={form.customer_avatar_url} name={form.customer_name || "?"} size="sm" rounded="full" />
            </div>
          </Field>

          <Field label="Testimonial" required hint={`${form.content.length} chars`}>
            <textarea
              rows={4}
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="The guest's experience in their own words…"
              className={`${fieldInputCls()} font-sans resize-y`}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Rating">
              <div className="px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                <StarRating rating={form.rating} size="w-5 h-5" interactive onChange={(n) => setForm({ ...form, rating: n })} />
                <span className="text-xs font-mono text-slate-400">{form.rating}/5</span>
              </div>
            </Field>
            <Field label="Featured?">
              <button
                type="button"
                onClick={() => setForm({ ...form, featured: !form.featured })}
                className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                  form.featured
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-black/40 border-white/10 text-slate-400 hover:border-white/25"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${form.featured ? "fill-amber-400 text-amber-400" : ""}`} />
                {form.featured ? "Yes — shown on homepage" : "No — not featured"}
              </button>
            </Field>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingId ? "Save changes" : "Add story"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
