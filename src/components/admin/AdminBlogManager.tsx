import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Globe,
  Archive,
  Image as ImageIcon,
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
} from "./Primitives";

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

const STATUS_CONFIG: Record<BlogPost["status"], { label: string; icon: typeof Edit; tone: "neutral" | "success" | "info" }> = {
  draft: { label: "Draft", icon: Edit, tone: "neutral" },
  published: { label: "Published", icon: Globe, tone: "success" },
  archived: { label: "Archived", icon: Archive, tone: "info" },
};

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const BlogRow: React.FC<{
  post: BlogPost;
  onEdit: (p: BlogPost) => void;
  onDelete: (p: BlogPost) => void;
}> = ({ post, onEdit, onDelete }) => {
  const { icon: Icon, label, tone } = STATUS_CONFIG[post.status];
  return (
    <div className="flex items-center gap-4 p-4 bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl border border-white/8 transition-colors group animate-[row-in_0.2s_ease-out]">
      {post.cover_image_url ? (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
          onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
        />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-slate-500" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white truncate">{post.title || "(Untitled)"}</p>
        <p className="text-[11px] text-slate-500 truncate mt-0.5">{post.excerpt || "No excerpt yet"}</p>
        <p className="text-[10px] text-slate-600 mt-0.5 font-mono">By {post.author_name || "Unknown"} · {fmt(post.created_at)}</p>
      </div>

      <StatusPill tone={tone} icon={Icon} className="hidden sm:inline-flex shrink-0">
        {label}
      </StatusPill>

      <div className="flex items-center gap-1.5 shrink-0 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <IconButton onClick={() => onEdit(post)} aria-label={`Edit ${post.title}`}>
          <Edit className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton variant="danger" onClick={() => onDelete(post)} aria-label={`Delete ${post.title}`}>
          <Trash2 className="w-3.5 h-3.5" />
        </IconButton>
      </div>
    </div>
  );
};

export const AdminBlogManager: React.FC = () => {
  const toast = useToast();
  const confirm = useConfirm();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BlogPost["status"]>("all");
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
      toast.error("Couldn't load posts", "Check your connection and try refreshing.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDelete = async (post: BlogPost) => {
    const ok = await confirm({
      title: `Delete "${post.title || "Untitled"}"?`,
      description: "This removes the post permanently. This can't be undone.",
      confirmLabel: "Delete post",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await apiClient(`/api/admin/blogs/${post.id}/`, { method: "DELETE" });
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
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
        toast.success("Changes saved");
      } else {
        const created = await apiClient<BlogPost>("/api/admin/blogs/", {
          method: "POST",
          body: JSON.stringify(form),
        });
        setPosts((prev) => [created, ...prev]);
        toast.success("Post created", form.status === "published" ? "It's live now." : "Saved as a draft.");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const detail = err?.data?.title?.[0] || err?.data?.detail || err?.message || "Failed to save.";
      setSubmitError(String(detail));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(
    () =>
      posts.filter((p) => {
        const matchesSearch =
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          (p.author_name || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [posts, search, statusFilter],
  );

  const counts = useMemo(
    () => ({
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
      archived: posts.filter((p) => p.status === "archived").length,
    }),
    [posts],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Panel className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-[#E04F33]/15 border border-[#E04F33]/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#E04F33]" />
              </div>
              <h1 className="text-2xl font-bold text-white font-heading">
                Blog &amp; <span className="text-[#E04F33]">Editorial Manager</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 sm:ml-12">
              Create, edit, or publish editorial articles &amp; design guides on Kaizen.
            </p>
          </div>
          <Button icon={Plus} onClick={openCreate} className="shrink-0">
            Create new post
          </Button>
        </div>
      </Panel>

      {/* Body */}
      <Panel className="p-6 space-y-4">
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[240px]">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by title or author…" className="flex-1 min-w-[180px] max-w-sm" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {(["all", "published", "draft", "archived"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wide border transition-all ${
                    statusFilter === s
                      ? "bg-[#E04F33] border-[#E04F33] text-white"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25"
                  }`}
                >
                  {s === "all" ? `All (${posts.length})` : `${s} (${counts[s]})`}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500 font-mono shrink-0">{filtered.length} of {posts.length} shown</p>
        </div>

        {loading ? (
          <SkeletonRows />
        ) : filtered.length === 0 ? (
          posts.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No blog posts yet"
              hint="Publish your first article or design guide to see it here."
              action={<Button icon={Plus} onClick={openCreate}>Create new post</Button>}
            />
          ) : (
            <EmptyState icon={FileText} title="No posts match your filters" hint="Try a different search term or status." />
          )
        ) : (
          <div className="space-y-2">
            {filtered.map((p) => <BlogRow key={p.id} post={p} onEdit={openEdit} onDelete={handleDelete} />)}
          </div>
        )}
      </Panel>

      {/* Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Edit blog post" : "Create new post"}
        eyebrow="Editorial"
      >
        {submitError && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-start gap-2">
            <span className="text-rose-400 font-bold shrink-0">✕</span>
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Title" required>
            <input
              type="text"
              required
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Why Pensacola Vacation Rentals Outperform…"
              className={fieldInputCls()}
            />
          </Field>

          <Field label="Cover image URL">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="url"
                  value={form.cover_image_url}
                  onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/…"
                  className={`${fieldInputCls()} pl-9`}
                />
              </div>
              {form.cover_image_url && (
                <img
                  src={form.cover_image_url}
                  alt="Preview"
                  className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                  onError={(e) => ((e.target as HTMLImageElement).style.visibility = "hidden")}
                />
              )}
            </div>
          </Field>

          <Field label="Excerpt" hint={`${form.excerpt.length}/500`}>
            <textarea
              rows={2}
              maxLength={500}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Short description shown in listings…"
              className={`${fieldInputCls()} font-sans resize-y`}
            />
          </Field>

          <Field label="Content" hint="Markdown or plain text">
            <textarea
              rows={8}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Full article body…"
              className={`${fieldInputCls()} font-sans resize-y`}
            />
          </Field>

          <Field label="Status">
            <div className="flex items-center gap-2 flex-wrap">
              {(Object.keys(STATUS_CONFIG) as BlogPost["status"][]).map((s) => {
                const { label, icon: Icon } = STATUS_CONFIG[s];
                const isActive = form.status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, status: s })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono border transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-[#E04F33] border-[#E04F33] text-white shadow-md shadow-[#E04F33]/25"
                        : "bg-white/5 border-white/10 text-slate-300 hover:border-white/30"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingId ? "Save changes" : "Publish post"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
