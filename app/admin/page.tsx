'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2, Users, FileText, Shield, Home, TrendingUp,
  Eye, Heart, MessageCircle, UserPlus, Globe
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { formatCount, timeAgo } from '@/utils/helpers';
import axios from 'axios';

const COLORS = ['#f97316', '#06b6d4', '#10b981', '#6366f1', '#ec4899', '#f59e0b'];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'admin') redirect('/');
    axios.get('/api/admin/analytics').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, [session, status]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const overview = data?.overview || {};
  const statCards = [
    { label: 'Total Users', value: overview.totalUsers, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'New Users (30d)', value: overview.newUsers, icon: UserPlus, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Published Posts', value: overview.publishedBlogs, icon: Globe, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Draft Posts', value: overview.draftBlogs, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Total Views', value: overview.totalViews, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Total Likes', value: overview.totalLikes, icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Total Comments', value: overview.totalComments, icon: MessageCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Total Posts', value: overview.totalBlogs, icon: BarChart2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="min-h-screen pt-16 bg-background">
      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="hidden lg:flex w-56 flex-col border-r border-border bg-card fixed left-0 top-16 bottom-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Admin Panel</span>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            {[
              { href: '/admin', label: 'Analytics', icon: BarChart2 },
              { href: '/admin/users', label: 'Users', icon: Users },
              { href: '/admin/blogs', label: 'All Posts', icon: FileText },
              { href: '/dashboard', label: 'Dashboard', icon: Home },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 lg:ml-56 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Shield className="w-6 h-6 text-primary" /> Admin Analytics
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Platform-wide statistics and insights</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {statCards.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-card border border-border rounded-xl p-4">
                <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className="text-xl font-display font-bold text-foreground">{formatCount(value ?? 0)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Daily Posts + Views */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Posts & Views (30 days)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={data?.dailyStats || []}>
                  <defs>
                    <linearGradient id="gViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="_id" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: 12 }} />
                  <Area type="monotone" dataKey="views" stroke="#06b6d4" fill="url(#gViews)" name="Views" />
                  <Area type="monotone" dataKey="posts" stroke="#f97316" fill="url(#gPosts)" name="Posts" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Posts by Category</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data?.blogsByCategory || []} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                    {(data?.blogsByCategory || []).map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Posts + Recent Users */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Posts */}
            <div className="bg-card border border-border rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4">Top Posts by Views</h3>
              <div className="space-y-3">
                {(data?.topBlogs || []).map((blog: any, i: number) => (
                  <div key={blog._id} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/blog/${blog.slug}`} className="text-sm font-medium text-foreground hover:text-primary truncate block transition-colors">
                        {blog.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{blog.author?.name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatCount(blog.views)}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatCount(blog.likesCount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Recent Users</h3>
                <Link href="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
              </div>
              <div className="space-y-3">
                {(data?.recentUsers || []).map((user: any) => (
                  <div key={user._id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold overflow-hidden">
                      {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {user.role}
                      </span>
                      <span className="text-xs text-muted-foreground">{timeAgo(user.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
