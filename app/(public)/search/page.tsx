'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/blog/BlogCard';
import axios from 'axios';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';

  const [results, setResults] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    if (!query && !tag) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (tag) params.set('tag', tag);
    axios.get(`/api/search?${params}`).then(r => {
      setResults(r.data.data.blogs);
      setTotal(r.data.data.total);
    }).finally(() => setLoading(false));
  }, [query, tag]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16 bg-background">
        <div className="bg-muted/40 border-b border-border py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h1 className="font-display text-3xl font-bold text-foreground mb-6">
              {tag ? `Posts tagged "${tag}"` : query ? `Search results for "${query}"` : 'Search'}
            </h1>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)}
                  placeholder="Search posts by title, content, or tags..."
                  className="w-full pl-9 pr-4 py-3 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
              </div>
              <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
                Search
              </button>
            </form>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-xl text-muted-foreground">
                {query || tag ? 'No results found' : 'Enter a search term above'}
              </p>
              {(query || tag) && (
                <p className="text-sm text-muted-foreground mt-2">Try different keywords or browse all posts</p>
              )}
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Found <strong className="text-foreground">{total}</strong> result{total !== 1 ? 's' : ''}
                {query && <> for "<strong className="text-foreground">{query}</strong>"</>}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map(blog => <BlogCard key={blog._id} blog={blog} />)}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
