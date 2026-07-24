/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Quote, Plus, Edit, Trash2, Search, Star, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { api } from '../../api/client';

export const StoryManager: React.FC = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    location: '',
    content: '',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    featured: true
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await api.getStories();
      setStories(res.stories || []);
    } catch (err) {
      console.warn('Failed to fetch stories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleOpenCreate = () => {
    setEditingStory(null);
    setFormData({
      customerName: '',
      location: 'Kaizen Luxury Villa Guest',
      content: '',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      featured: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (story: any) => {
    setEditingStory(story);
    setFormData({
      customerName: story.customerName || '',
      location: story.location || '',
      content: story.content || '',
      imageUrl: story.imageUrl || '',
      featured: !!story.featured
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      if (editingStory) {
        await api.updateStory(editingStory.id, formData);
        setMessage({ text: 'Success story updated successfully!', type: 'success' });
      } else {
        await api.createStory(formData);
        setMessage({ text: 'New success story added successfully!', type: 'success' });
      }
      setIsModalOpen(false);
      fetchStories();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to save story', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      await api.deleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.warn('Failed to delete story:', err);
    }
  };

  const filteredStories = stories.filter((s) =>
    s.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-100 font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-purple-900/60">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Quote className="w-6 h-6 text-pink-400" />
            Customer Success <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">Stories & Testimonials</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage verified guest testimonials, reviews, and featured success stories displayed on the site.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Success Story</span>
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
            placeholder="Search stories by customer name or property..."
            className="w-full pl-9 pr-4 py-2 bg-[#120524] border border-purple-900/80 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
        <span className="text-xs font-mono text-purple-300">
          Total Stories: <strong className="text-white">{stories.length}</strong>
        </span>
      </div>

      {/* Stories Data Table */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((n) => (
            <div key={n} className="h-16 bg-purple-950/40 rounded-2xl" />
          ))}
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 p-12 text-center space-y-3">
          <Quote className="w-12 h-12 text-pink-400/40 mx-auto" />
          <h3 className="text-base font-bold text-white">No success stories found</h3>
          <p className="text-xs text-slate-400">Click "+ Add Success Story" above to publish guest feedback.</p>
        </div>
      ) : (
        <div className="bg-[#18082e] rounded-3xl border border-purple-800/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-purple-900/80 bg-[#130723] text-purple-300 font-mono uppercase tracking-wider">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Property / Location</th>
                  <th className="py-3.5 px-4 max-w-xs">Story Excerpt</th>
                  <th className="py-3.5 px-4">Featured Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-950">
                {filteredStories.map((story) => (
                  <tr key={story.id} className="hover:bg-purple-950/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={story.imageUrl}
                          alt={story.customerName}
                          className="w-10 h-10 rounded-full object-cover border border-pink-500/40 shrink-0"
                        />
                        <span className="font-bold text-white text-sm">{story.customerName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-purple-200">{story.location}</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate italic">
                      "{story.content}"
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase flex items-center gap-1 w-max ${
                        story.featured
                          ? 'bg-pink-950 text-pink-300 border border-pink-500/40'
                          : 'bg-slate-900 text-slate-400 border border-slate-700/40'
                      }`}>
                        <Star className={`w-3 h-3 ${story.featured ? 'fill-pink-400 text-pink-400' : 'text-slate-500'}`} />
                        <span>{story.featured ? 'Featured' : 'Standard'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(story)}
                          className="px-3 py-1.5 bg-purple-900/50 hover:bg-purple-800 text-purple-200 rounded-lg border border-purple-700/50 flex items-center gap-1 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(story.id)}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/50 transition-colors"
                          title="Delete Story"
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

      {/* CREATE / EDIT STORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-sans">
          <div className="relative w-full max-w-xl bg-[#130723] border border-purple-800/80 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5">
            
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-full hover:bg-purple-900/40"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-900/50 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Quote className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-white">
                {editingStory ? 'Edit Success Story' : 'Add Success Story'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-pink-300 uppercase mb-1 font-mono">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Anand Kapoor"
                    className="w-full px-3.5 py-2.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-pink-300 uppercase mb-1 font-mono">Property / Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Scottsdale Villa Guest"
                    className="w-full px-3.5 py-2.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-pink-300 uppercase mb-1 font-mono">Customer Photo URL</label>
                <input
                  type="text"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block font-bold text-pink-300 uppercase mb-1 font-mono">Testimonial Content</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Share the guest review or success story..."
                  className="w-full p-3.5 bg-[#1e0a35] border border-purple-900/80 rounded-xl text-slate-100 focus:outline-none focus:border-pink-500 leading-relaxed text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
                <label htmlFor="featured" className="font-bold text-slate-200 cursor-pointer select-none">
                  Highlight as Featured Story on Homepage
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3">
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
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-bold shadow-lg shadow-pink-600/30 hover:opacity-90 cursor-pointer"
                >
                  {saving ? 'Saving...' : editingStory ? 'Update Story' : 'Add Story'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
