import { Suspense } from 'react';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { Category } from '@/models/index';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BlogCard from '@/components/blog/BlogCard';
import { ArrowRight, Feather, Zap, Globe, Shield } from 'lucide-react';

async function getFeaturedData() {
  try {
    await connectDB();
    const [featured, recent, categories] = await Promise.all([
      Blog.find({ status: 'published', featured: true })
        .populate('author', 'name avatar')
        .populate('category', 'name color slug')
        .select('-content')
        .sort({ publishedAt: -1 })
        .limit(1)
        .lean(),
      Blog.find({ status: 'published' })
        .populate('author', 'name avatar')
        .populate('category', 'name color slug')
        .select('-content')
        .sort({ publishedAt: -1 })
        .limit(6)
        .lean(),
      Category.find().sort({ postsCount: -1 }).limit(8).lean(),
    ]);
    return { featured: featured[0] || null, recent, categories };
  } catch {
    return { featured: null, recent: [], categories: [] };
  }
}

const features = [
  { icon: Feather, title: 'Markdown Editor', description: 'Rich markdown editing with live preview and syntax highlighting.' },
  { icon: Zap, title: 'CloudFront CDN', description: 'Images served globally via AWS CloudFront for blazing fast loads.' },
  { icon: Globe, title: 'MongoDB Atlas', description: 'Fully managed cloud database with automatic backups.' },
  { icon: Shield, title: 'JWT Auth', description: 'Secure authentication with NextAuth.js and JWT tokens.' },
];

export default async function HomePage() {
  const { featured, recent, categories } = await getFeaturedData();

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero Section ─────────────────────────────── */}
        <section className="hero-gradient min-h-[80vh] flex items-center pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-6">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                Cloud-Powered Blog Platform
              </span>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-6 text-balance">
                Write. Publish.{' '}
                <span className="text-gradient">Inspire.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                A lightweight blog hosting platform built on Next.js 14, MongoDB Atlas, and AWS.
                Share your ideas with the world at cloud speed.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
                >
                  Start writing free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-2 bg-secondary text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-secondary/80 transition-all"
                >
                  Explore blogs
                </Link>
              </div>

              {/* Stack badges */}
              <div className="flex flex-wrap gap-2 mt-10">
                {['Next.js 14', 'MongoDB Atlas', 'AWS S3', 'CloudFront CDN', 'NextAuth.js', 'Redux Toolkit'].map((tech) => (
                  <span key={tech} className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Post ─────────────────────────────── */}
        {featured && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Featured Post</h2>
            </div>
            <BlogCard blog={featured as any} variant="featured" />
          </section>
        )}

        {/* ── Recent Posts ──────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground">Recent Posts</h2>
            <Link href="/blogs" className="text-sm text-primary flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((blog: any) => (
                <BlogCard key={blog._id.toString()} blog={blog as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p className="font-display text-xl">No posts yet</p>
              <p className="text-sm mt-1">Be the first to write something amazing!</p>
              <Link href="/dashboard/blogs/create" className="inline-block mt-4 text-primary text-sm hover:underline">
                Write a post →
              </Link>
            </div>
          )}
        </section>

        {/* ── Categories ────────────────────────────────── */}
        {categories.length > 0 && (
          <section className="bg-muted/50 border-y border-border py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Browse by Category</h2>
              <div className="flex flex-wrap gap-3 justify-center">
                {categories.map((cat: any) => (
                  <Link
                    key={cat._id.toString()}
                    href={`/blogs?category=${cat._id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border hover:border-primary/50 hover:shadow-sm transition-all text-sm font-medium"
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    <span className="text-xs text-muted-foreground">({cat.postsCount})</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Features / Cloud Stack ────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">Built on the Cloud</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every component of this platform leverages modern cloud services for reliability, speed, and scale.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────── */}
        <section className="bg-primary py-20">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to share your story?
            </h2>
            <p className="text-white/80 mb-8">
              Join thousands of writers publishing on BlogCloud. Your audience is waiting.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-white text-primary px-8 py-3 rounded-xl font-bold hover:bg-white/95 transition-all shadow-lg"
            >
              Create your account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
