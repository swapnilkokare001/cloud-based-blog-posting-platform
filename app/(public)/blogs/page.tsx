'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlogs, setSelectedCategory, setPage } from '@/redux/slices/blogSlice';
import type { AppDispatch, RootState } from '@/redux/store';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/blog/BlogCard';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
  postsCount: number;
}

export default function BlogsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { blogs, isLoading, totalPages, page, totalCount } = useSelector((s: RootState) => s.blog);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    axios.get('/api/categories').then((r) => setCategories(r.data.data));
  }, []);

  useEffect(() => {
    dispatch(fetchBlogs({ page, category: activeCategory }));
  }, [dispatch, page, activeCategory]);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    dispatch(setPage(1));
    const params = new URLSearchParams(searchParams.toString());
    if (catId) params.set('category', catId);
    else params.delete('category');
    router.push(`/blogs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-background">
        {/* Page Header */}
        <div className="bg-muted/40 border-b border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Explore Posts</h1>
            <p className="text-muted-foreground">
              {totalCount} post{totalCount !== 1 ? 's' : ''} published by our community
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button type="submit" className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            <button
              onClick={() => handleCategoryChange('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !activeCategory
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              All Posts
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat._id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat._id
                    ? 'text-white shadow-sm'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
                style={activeCategory === cat._id ? { backgroundColor: cat.color } : {}}
              >
                <span>{cat.icon}</span>
                {cat.name}
                <span className="text-xs opacity-70">({cat.postsCount})</span>
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-[16/9] bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-muted rounded w-1/4" />
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-display text-2xl text-muted-foreground mb-2">No posts found</p>
              <p className="text-muted-foreground text-sm">Try a different category or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => dispatch(setPage(page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | string)[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="text-muted-foreground text-sm px-1">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => dispatch(setPage(p as number))}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? 'bg-primary text-white'
                          : 'border border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => dispatch(setPage(page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
