'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSession } from 'next-auth/react';
import {
  Heart, MessageCircle, Eye, Clock, Share2, Bookmark,
  Twitter, Linkedin, Link2, ChevronDown, ChevronUp, Send, Trash2
} from 'lucide-react';
import { formatDate, timeAgo, formatCount, getInitials } from '@/utils/helpers';
import BlogCard from './BlogCard';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Props {
  blog: any;
  related: any[];
}

export default function BlogDetailClient({ blog, related }: Props) {
  const { data: session } = useSession();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likesCount);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(blog.commentsCount);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    // Check if current user liked this post
    if (session) {
      axios.get(`/api/likes/${blog._id}`).then((r) => setLiked(r.data.liked));
    }
    // Load comments
    fetchComments();
  }, [blog._id, session]);

  const fetchComments = async () => {
    try {
      const r = await axios.get(`/api/comments?blogId=${blog._id}`);
      setComments(r.data.data.comments);
    } catch {}
  };

  const handleLike = async () => {
    if (!session) { toast.error('Please sign in to like posts'); return; }
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    try {
      await axios.post(`/api/likes/${blog._id}`);
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) { toast.error('Please sign in to comment'); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const r = await axios.post('/api/comments', { blogId: blog._id, content: newComment });
      setComments([r.data.data, ...comments]);
      setCommentsCount(commentsCount + 1);
      setNewComment('');
      toast.success('Comment posted');
    } catch { toast.error('Failed to post comment'); }
    setSubmitting(false);
  };

  const handleReply = async (parentId: string) => {
    if (!session) { toast.error('Please sign in'); return; }
    if (!replyContent.trim()) return;
    try {
      const r = await axios.post('/api/comments', { blogId: blog._id, content: replyContent, parentComment: parentId });
      setComments(comments.map(c => c._id === parentId ? { ...c, replies: [...(c.replies || []), r.data.data] } : c));
      setReplyTo(null);
      setReplyContent('');
    } catch { toast.error('Failed to post reply'); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`/api/comments?commentId=${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
      setCommentsCount(commentsCount - 1);
    } catch { toast.error('Failed to delete'); }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Check out: ${blog.title}`;
    if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    else if (platform === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    else { await navigator.clipboard.writeText(url); toast.success('Link copied!'); }
  };

  return (
    <main className="min-h-screen pt-16 bg-background">
      {/* Cover Image */}
      {blog.coverImage && (
        <div className="w-full h-64 sm:h-80 lg:h-96 overflow-hidden relative">
          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          {/* CloudFront CDN badge */}
          <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
            ☁️ Served via CloudFront CDN
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category + Title */}
        {blog.category && (
          <Link href={`/blogs?category=${blog.category._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full mb-6"
            style={{ backgroundColor: `${blog.category.color}20`, color: blog.category.color }}>
            {blog.category.icon} {blog.category.name}
          </Link>
        )}

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">
          {blog.title}
        </h1>

        {/* Author + Meta row */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-8 border-b border-border">
          <Link href={`/author/${blog.author._id}`} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold overflow-hidden">
              {blog.author.avatar
                ? <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                : getInitials(blog.author.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{blog.author.name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{blog.readTime} min read</span>
                <span>·</span>
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{formatCount(blog.views)} views</span>
              </div>
            </div>
          </Link>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                liked ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-950 dark:border-red-800' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {formatCount(likesCount)}
            </button>
            <button onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="w-4 h-4" />{formatCount(commentsCount)}
            </button>
            <div className="flex items-center gap-1">
              <button onClick={() => handleShare('twitter')} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-4 h-4" /></button>
              <button onClick={() => handleShare('linkedin')} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-4 h-4" /></button>
              <button onClick={() => handleShare('copy')} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"><Link2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {blog.tags.map((tag: string) => (
              <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}
                className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full hover:bg-secondary transition-colors">
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Blog Content */}
        <article className="blog-content">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
        </article>

        {/* Author Bio */}
        {blog.author.bio && (
          <div className="mt-12 p-6 bg-muted/50 rounded-xl border border-border">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0">
                {blog.author.avatar
                  ? <img src={blog.author.avatar} alt={blog.author.name} className="w-full h-full object-cover" />
                  : getInitials(blog.author.name)}
              </div>
              <div>
                <p className="font-display font-semibold text-foreground mb-1">About {blog.author.name}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{blog.author.bio}</p>
                <Link href={`/author/${blog.author._id}`} className="text-sm text-primary mt-2 inline-block hover:underline">
                  View all posts →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-12">
          <button onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 font-display font-bold text-xl text-foreground mb-6">
            <MessageCircle className="w-5 h-5" />
            {commentsCount} Comment{commentsCount !== 1 ? 's' : ''}
            {showComments ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>

          {showComments && (
            <>
              {/* New Comment Form */}
              {session ? (
                <form onSubmit={handleComment} className="mb-8">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex justify-end mt-2">
                    <button type="submit" disabled={submitting || !newComment.trim()}
                      className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                      <Send className="w-3.5 h-3.5" />{submitting ? 'Posting...' : 'Post comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-muted/50 rounded-xl p-4 mb-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link> to join the conversation
                  </p>
                </div>
              )}

              {/* Comment List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                      {comment.author?.avatar
                        ? <img src={comment.author.avatar} alt={comment.author.name} className="w-full h-full object-cover" />
                        : getInitials(comment.author?.name || 'U')}
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-foreground">{comment.author?.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                            {session?.user.id === comment.author?._id && (
                              <button onClick={() => handleDeleteComment(comment._id)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>

                      {/* Reply Button */}
                      {session && (
                        <button onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                          className="text-xs text-muted-foreground hover:text-primary mt-1 ml-1 transition-colors">
                          Reply
                        </button>
                      )}

                      {/* Reply Form */}
                      {replyTo === comment._id && (
                        <div className="mt-2 flex gap-2">
                          <input value={replyContent} onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                          <button onClick={() => handleReply(comment._id)}
                            className="bg-primary text-white px-3 py-2 rounded-lg text-xs font-medium hover:opacity-90">
                            Reply
                          </button>
                        </div>
                      )}

                      {/* Nested Replies */}
                      {comment.replies?.length > 0 && (
                        <div className="mt-3 ml-4 space-y-3 border-l-2 border-border pl-4">
                          {comment.replies.map((reply: any) => (
                            <div key={reply._id} className="flex gap-2">
                              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden">
                                {reply.author?.avatar
                                  ? <img src={reply.author.avatar} alt={reply.author.name} className="w-full h-full object-cover" />
                                  : getInitials(reply.author?.name || 'U')}
                              </div>
                              <div className="flex-1 bg-muted/30 rounded-lg px-3 py-2">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-xs font-semibold text-foreground">{reply.author?.name}</span>
                                  <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
                                </div>
                                <p className="text-xs text-foreground">{reply.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-border">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">More from this category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((b) => <BlogCard key={b._id} blog={b} />)}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
