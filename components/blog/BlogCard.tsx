import Link from 'next/link';
import Image from 'next/image';
import { Heart, MessageCircle, Clock, Eye } from 'lucide-react';
import { formatDate, timeAgo, formatCount, getInitials, truncate } from '@/utils/helpers';
import type { BlogPost } from '@/redux/slices/blogSlice';

interface BlogCardProps {
  blog: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
}

export default function BlogCard({ blog, variant = 'default' }: BlogCardProps) {
  if (variant === 'compact') {
    return (
      <Link href={`/blog/${blog.slug}`} className="flex gap-3 group py-3">
        {blog.coverImage && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors font-display leading-snug">
            {blog.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {blog.author.name} · {timeAgo(blog.publishedAt || blog.createdAt)}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link href={`/blog/${blog.slug}`} className="group relative overflow-hidden rounded-2xl bg-card border border-border block h-[400px]">
        {blog.coverImage ? (
          <img src={blog.coverImage} alt={blog.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {blog.category && (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2" style={{ backgroundColor: blog.category.color }}>
              {blog.category.name}
            </span>
          )}
          <h3 className="font-display font-bold text-2xl text-white line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {blog.title}
          </h3>
          <div className="flex items-center gap-3 text-white/70 text-xs">
            <span>{blog.author.name}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime}m</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{formatCount(blog.likesCount)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <article className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      {/* Cover Image */}
      <Link href={`/blog/${blog.slug}`} className="block overflow-hidden aspect-[16/9] bg-muted">
        {blog.coverImage ? (
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="font-display text-4xl text-muted-foreground/30">{blog.title[0]}</span>
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-1">
        {/* Category Badge */}
        {blog.category && (
          <Link href={`/blogs?category=${blog.category._id}`}
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full mb-3 w-fit"
            style={{ backgroundColor: `${blog.category.color}20`, color: blog.category.color }}
          >
            {blog.category.name}
          </Link>
        )}

        {/* Title */}
        <Link href={`/blog/${blog.slug}`}>
          <h3 className="font-display font-bold text-lg text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug mb-2">
            {blog.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-1">
          {blog.excerpt}
        </p>

        {/* Author & Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Link href={`/author/${blog.author._id}`} className="flex items-center gap-2 group/author">
            <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold overflow-hidden">
              {blog.author.avatar ? (
                <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(blog.author.name)
              )}
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover/author:text-foreground transition-colors">
              {blog.author.name}
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{blog.readTime}m
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />{formatCount(blog.likesCount)}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />{formatCount(blog.commentsCount)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
