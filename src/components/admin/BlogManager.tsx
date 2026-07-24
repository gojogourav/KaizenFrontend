/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FileText, Plus, Edit, Trash2, Search, Sparkles, CheckCircle2, AlertCircle, X, Image as ImageIcon, Eye } from 'lucide-react';
import { api } from '../../api/client';

export const BlogManager: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    author: 'Shakti Sahoo',
    coverImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
    content: '',
    status: 'Published' as 'Published' | 'Draft'
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.getBlogs();
      setBlogs(res.blogs || []);
    } catch (err) {
      console.warn('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      slug: '',
      author: 'Shakti Sahoo',
      coverImageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
      content: '',
      status: 'Published'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog: any) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      slug: blog.slug || '',
      author: blog.author || 'Shakti Sahoo',
      coverImageUrl: blog.coverImageUrl || '',
      content: blog.content || '',
      status: blog.status || 'Published'
    });
    setIsModalOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setFormData((prev) => ({ ...prev, title, slug: editingBlog ? prev.slug : slug }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (editingBlog) {
        await api.updateBlog(editingBlog.id, formData);
        setMessage({ text: 'Blog post updated successfully!', type: 'success' });
      } else {
        await api.createBlog(formData);
        setMessage({ text: 'New blog post published successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to save blog post', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await api.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.warn('Failed to delete blog post:', err);
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/60">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-fuchsia-400" />
            Blog & <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-500">Editorial Manager</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, or publish editorial articles & design guides on Kaizen.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-600 hover:from-fuchsia-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Post</span>
        </button>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200' : 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Search & Counter */}
      <div className="flex items-center justify-between gap-4 bg-[#18082e] p-3 rounded-2xl border border-purple-800/60">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blogs by title or author..."
            className="w-full pl-9 pr-4 py-2 bg-[#120524] border border-purple-900/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-fuchsia-500"
          />
        </div>
        <span className="text-xs font-mono text-purple-300">
          Total Posts: <strong className="text-white">{blogs.length}</strong>
        </span>
      </div>

      {/* Blogs Data Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-purple-950/40 rounded-2xl" />
          ))}
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 p-12 text-center space-y-3">
          <FileText className="w-12 h-12 text-purple-400/40 mx-auto" />
          <h3 className="text-base font-bold text-white">No blog posts found</h3>
          <p className="text-xs text-slate-400">Click "+ Create New Post" above to add your first article.</p>
        </div>
      ) : (
        <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-900/80 bg-[#130723] text-purple-300 font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4">Article</th>
                  <th className="py-3.5 px-4">Author</th>
                  <th className="py-3.5 px-4">Publish Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950">
                {filteredBlogs.map((blog) => (
                  <tr key={blog.id} className="hover:bg-purple-950/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={blog.coverImageUrl}
                          alt={blog.title}
                          className="w-12 h-12 rounded-xl object-cover border border-purple-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-white text-sm line-clamp-1">{blog.title}</p>
                          <p className="text-[10px] font-mono text-purple-300/80">/{blog.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">{blog.author}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{blog.publishDate}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase ${
                        blog.status === 'Published'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800 text-purple-200 rounded-lg border border-purple-700/50 flex items-center gap-1 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(blog.id)}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/50 transition-colors"
                          title="Delete Blog"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT BLOG MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
          <div className="relative w-full max-w-2xl bg-[#130723] border border-purple-800/80 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto text-slate-100 space-y-5">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-purple-900/40"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-900/50 border border-purple-500/30 flex items-center justify-center text-fuchsia-400">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-white">
                {editingBlog ? 'Edit Editorial Article' : 'Create New Article'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-purple-300 uppercase mb-1 font-mono">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    placeholder="Article Title..."
                    className="w-full px-3.5 py-2.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-300 uppercase mb-1 font-mono">Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="article-url-slug"
                    className="w-full px-3.5 py-2.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-fuchsia-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-purple-300 uppercase mb-1 font-mono">Author Name</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 focus:outline-none focus:border-fuchsia-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-purple-300 uppercase mb-1 font-mono">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 focus:outline-none focus:border-fuchsia-500"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-purple-300 uppercase mb-1 font-mono">Cover Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.coverImageUrl}
                    onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 focus:outline-none focus:border-fuchsia-500"
                  />
                  {formData.coverImageUrl && (
                    <img src={formData.coverImageUrl} alt="Preview" className="w-10 h-10 rounded-xl object-cover border border-purple-700" />
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-purple-300 uppercase mb-1 font-mono">
                  Content / Markdown Body
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write editorial content here..."
                  className="w-full p-3.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 focus:outline-none focus:border-fuchsia-500 font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-purple-950 text-slate-300 rounded-xl font-bold hover:bg-purple-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-rose-600 text-white rounded-xl font-bold shadow-lg shadow-pink-600/30 hover:opacity-90 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingBlog ? 'Update Post' : 'Publish Post'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
