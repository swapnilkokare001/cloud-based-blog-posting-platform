'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Eye, Trash2, Globe, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { timeAgo, formatCount } from '@/utils/helpers';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('published');
  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), status: statusFilter });
      if (search) params.set('search', search);
      const r = await axios.get(`/api/blogs?${params}`);
      setBlogs(r.data.data.blogs);
      setTotal(r.data.data.total);
      setTotalPages(r.data.data.totalPages);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs();
  };

  const handleDelete = async (slug: string, id: string) => {
    if (!confirm('Delete this post permanently?')) return;
    try {
      await axios.delete(`/api/blogs/${slug}`);
      setBlogs(blogs.filter((b) => b._id !== id));
      setTotal((t) => t - 1);
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleToggleFeatured = async (slug: string, isFeatured: boolean) => {
    try {
      await axios.patch(`/api/blogs/${slug}`, { featured: !isFeatured });
      setBlogs(blogs.map((b) => b.slug === slug ? { ...b, featured: !isFeatured } : b));
      toast.success(isFeatured ? 'Removed from featured' : 'Marked as featured');
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Manage Posts</h1>
        <p className="text-muted-foreground text-sm mt-0.5">{total} posts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
            Search
          </button>
        </form>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none"
        >
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {['Post', 'Author', 'Stats', 'Status', 'Published', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="h-8 bg-muted animate-pulse rounded" /></td></tr>
                ))
              ) : blogs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground text-sm">No posts found</td></tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {blog.coverImage && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            <img src={blog.coverImage} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link href={`/blog/${blog.slug}`} target="_blank"
                            className="text-sm font-medium text-foreground hover:text-primary truncate block max-w-[200px] transition-colors">
                            {blog.title}
                          </Link>
                          {blog.featured && (
                            <span className="text-xs text-amber-600 flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-current" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">{blog.author?.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatCount(blog.views)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted-foreground">{timeAgo(blog.publishedAt || blog.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/blog/${blog.slug}`} target="_blank"
                          className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                          <Globe className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleToggleFeatured(blog.slug, blog.featured)}
                          className={`p-1.5 rounded transition-all ${blog.featured ? 'text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950' : 'text-muted-foreground hover:text-amber-500 hover:bg-secondary'}`}
                          title={blog.featured ? 'Remove featured' : 'Mark as featured'}>
                          <Star className={`w-3.5 h-3.5 ${blog.featured ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog.slug, blog._id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
