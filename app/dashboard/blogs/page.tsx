'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { PenSquare, Trash2, Eye, Heart, MessageCircle, Clock, Globe, FileText, MoreVertical } from 'lucide-react';
import { formatDate, formatCount, timeAgo } from '@/utils/helpers';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function MyBlogsPage() {
  const { data: session } = useSession();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user.id) return;
    const status = filter === 'all' ? '' : filter;
    setLoading(true);
    axios
      .get(`/api/blogs?author=${session.user.id}${status ? `&status=${status}` : ''}`)
      .then((r) => setBlogs(r.data.data.blogs))
      .finally(() => setLoading(false));
  }, [session, filter]);

  const handleDelete = async (slug: string, id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/blogs/${slug}`);
      setBlogs(blogs.filter((b) => b._id !== id));
      toast.success('Post deleted');
    } catch {
      toast.error('Failed to delete');
    }
    setDeletingId(null);
  };

  const handleStatusToggle = async (slug: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await axios.patch(`/api/blogs/${slug}`, { status: newStatus });
      setBlogs(blogs.map((b) => b.slug === slug ? { ...b, status: newStatus } : b));
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'moved to drafts'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const filtered = filter === 'all' ? blogs : blogs.filter(b => b.status === filter);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">My Posts</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{blogs.length} total posts</p>
        </div>
        <Link href="/dashboard/blogs/create"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
          <PenSquare className="w-4 h-4" />
          Write new
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
              filter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Posts Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No {filter !== 'all' ? filter : ''} posts yet</p>
          <Link href="/dashboard/blogs/create" className="mt-3 inline-block text-sm text-primary hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((blog) => (
            <div key={blog._id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
              {/* Cover thumb */}
              <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                {blog.coverImage
                  ? <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-2xl">
                      {blog.title?.[0]}
                    </div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    blog.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                  }`}>
                    {blog.status === 'published' ? '● Published' : '○ Draft'}
                  </span>
                  <span className="text-xs text-muted-foreground">{timeAgo(blog.updatedAt || blog.createdAt)}</span>
                </div>
                <h3 className="font-semibold text-foreground truncate text-sm">{blog.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatCount(blog.views)}</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatCount(blog.likesCount)}</span>
                  <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{formatCount(blog.commentsCount)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime}m</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {blog.status === 'published' && (
                  <Link href={`/blog/${blog.slug}`} target="_blank"
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all" title="View post">
                    <Globe className="w-4 h-4" />
                  </Link>
                )}
                <Link href={`/dashboard/blogs/edit/${blog.slug}`}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all" title="Edit">
                  <PenSquare className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => handleStatusToggle(blog.slug, blog.status)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all text-xs"
                  title={blog.status === 'published' ? 'Move to draft' : 'Publish'}>
                  {blog.status === 'published' ? '↓ Draft' : '↑ Publish'}
                </button>
                <button
                  onClick={() => handleDelete(blog.slug, blog._id)}
                  disabled={deletingId === blog._id}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
