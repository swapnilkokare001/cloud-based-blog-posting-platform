'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FileText, Eye, Heart, MessageCircle, PenSquare, TrendingUp } from 'lucide-react';
import { formatCount, timeAgo } from '@/utils/helpers';
import axios from 'axios';
import BlogCard from '@/components/blog/BlogCard';

interface Stats {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  recentBlogs: any[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user.id) return;
    axios
      .get(`/api/blogs?author=${session.user.id}&status=published&page=1`)
      .then((r) => {
        const blogs = r.data.data.blogs;
        const totalViews = blogs.reduce((s: number, b: any) => s + b.views, 0);
        const totalLikes = blogs.reduce((s: number, b: any) => s + b.likesCount, 0);
        const totalComments = blogs.reduce((s: number, b: any) => s + b.commentsCount, 0);
        setStats({ totalPosts: r.data.data.total, totalViews, totalLikes, totalComments, recentBlogs: blogs.slice(0, 3) });
      })
      .finally(() => setLoading(false));
  }, [session]);

  const statCards = [
    { label: 'Published Posts', value: stats?.totalPosts ?? 0, icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Total Views', value: stats?.totalViews ?? 0, icon: Eye, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Total Likes', value: stats?.totalLikes ?? 0, icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Comments', value: stats?.totalComments ?? 0, icon: MessageCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          {session?.user.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your blogging activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-5">
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{formatCount(value)}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="font-display font-semibold text-lg text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/dashboard/blogs/create"
            className="flex items-center gap-3 bg-primary text-white p-4 rounded-xl hover:opacity-90 transition-opacity font-medium">
            <PenSquare className="w-5 h-5" />
            Write new post
          </Link>
          <Link href="/dashboard/blogs"
            className="flex items-center gap-3 bg-card border border-border p-4 rounded-xl hover:bg-secondary transition-colors text-foreground font-medium">
            <FileText className="w-5 h-5 text-muted-foreground" />
            Manage my posts
          </Link>
          <Link href={`/author/${session?.user.id}`}
            className="flex items-center gap-3 bg-card border border-border p-4 rounded-xl hover:bg-secondary transition-colors text-foreground font-medium">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            View public profile
          </Link>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-foreground">Recent Posts</h2>
          <Link href="/dashboard/blogs" className="text-sm text-primary hover:underline">View all</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : stats?.recentBlogs.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">You haven't published any posts yet</p>
            <Link href="/dashboard/blogs/create"
              className="mt-3 inline-block text-sm text-primary hover:underline">
              Write your first post →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats?.recentBlogs.map(blog => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
