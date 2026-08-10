import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Eye,
  BookOpen,
  Globe,
  Archive,
} from "lucide-react";
import { apiClient } from "../../api/http";

// ── Types ──────────────────────────────────────────────────────────────────────
interface BlogPost {
  id: number;
  title: string;
  slug: string;
  author_name: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

type FormState = {
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  status: BlogPost["status"];
};

const DEFAULT_FORM: FormState = {
  title: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  status: "draft",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  draft:     { label: "Draft",     icon: Edit,    cls: "bg-slate-700/50 text-slate-300 border-slate-600/50" },
  published: { label: "Published", icon: Globe,   cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" },
  archived:  { label: "Archived",  icon: Archive, cls: "bg-slate-500/15 text-slate-400 border-slate-600/30" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Blog Row ──────────────────────────────────────────────────────────────────
const BlogRow: React.FC<{
  post: BlogPost;
  onEdit: (p: BlogPost) => void;
  onDelete: (id: number) => void;
}> = ({ post, onEdit, onDelete }) => {
  const { icon: Icon, label, cls } = STATUS_CONFIG[post.status];
  return (
    <div className="flex items-center gap-4 p-4 bg-white/3 hover:bg-white/5 rounded-2xl border border-white/8 transition-colors group">
      {post.cover_image_url ? (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-slate-500" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{post.title || "(Untitled)"}</p>
        <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{post.excerpt || "No excerpt"}</p>
        <p className="text-[10px] text-slate-600 mt-0.5">By {post.author_name} · {fmt(post.created_at)}</p>
      </div>

      <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border uppercase shrink-0 ${cls}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>

      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(post)}
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-all"
          title="Edit"
        >
          <Edit className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(post.id)}
          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-500/30 transition-all"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export const AdminBlogManager: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient<BlogPost[]>("/api/admin/blogs/", { method: "GET" });
      setPosts(Array.isArray(data) ? data : (data as any)?.results ?? []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openCreate = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      cover_image_url: post.cover_image_url,
      status: post.status,
    });
    setSubmitError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this blog post?")) return;
    try {
      await apiClient(`/api/admin/blogs/${id}/`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete post.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (editingId) {
        const updated = await apiClient<BlogPost>(`/api/admin/blogs/${editingId}/`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
        setPosts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
      } else {
        const created = await apiClient<BlogPost>("/api/admin/blogs/", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setPosts((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const detail = err?.data?.title?.[0] || err?.data?.detail || err?.message || "Failed to save.";
      setSubmitError(String(detail));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.author_name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const inputCls =
    "w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-[#E04F33] transition-colors font-mono";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-[#FF8A73] mb-1.5";

  return (
    <div className="space-y-6 text-slate-100 font-sans max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-[#141824]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#E04F33]" />
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Blog &amp; <span className="text-[#E04F33]">Editorial Manager</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 ml-12">
              Create, edit, or publish editorial articles &amp; design guides on Kaizen.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#E04F33] hover:bg-[#ED5B3F] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#E04F33]/25 transition-all border border-white/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            + Create New Post
          </button>
        </div>
      </div>

      {/* Body Card */}
      <div className="bg-[#141824]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
        {/* Search + count */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blogs by title or author…"
              className="w-full pl-9 pr-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#E04F33]/50 transition-colors font-mono"
            />
          </div>
          <p className="text-xs text-slate-500 font-mono shrink-0">Total Posts: {posts.length}</p>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <FileText className="w-7 h-7 text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-mono">No blog posts found</p>
              <p className="text-xs mt-1">Click "+ Create New Post" above to add your first article.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => <BlogRow key={p.id} post={p} onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#121622] border border-white/15 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white font-heading">
                {editingId ? "Edit Blog Post" : "Create New Post"}
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
              <div>
                <label className={labelCls}>Title *</label>
                <input type="text" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Why Pensacola Vacation Rentals Outperform…"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Cover Image URL</label>
                <input type="url" value={form.cover_image_url}
                  onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/…"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Excerpt (max 500 chars)</label>
                <textarea rows={2} maxLength={500} value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Short description shown in listings…"
                  className={`${inputCls} font-sans`}
                />
              </div>

              <div>
                <label className={labelCls}>Content (Markdown or plain)</label>
                <textarea rows={8} value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Full article body…"
                  className={`${inputCls} font-sans`}
                />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as BlogPost["status"] })}
                  className={inputCls}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
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
                  {submitting ? (editingId ? "Saving…" : "Creating…") : (editingId ? "Save Changes" : "Publish Post")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
