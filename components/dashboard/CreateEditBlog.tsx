'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Send, Eye, ArrowLeft, Loader2, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ImageUpload from '@/components/blog/ImageUpload';
import dynamic from 'next/dynamic';

// Lazy-load markdown editor to avoid SSR issues
const MarkdownEditor = dynamic(() => import('@/components/blog/MarkdownEditor'), { ssr: false });

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(500),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  category: z.string().min(1, 'Please select a category'),
  tags: z.string().optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

type FormData = z.infer<typeof schema>;

interface Category { _id: string; name: string; icon: string; color: string; }

interface Props {
  initialData?: any; // for edit mode
  blogSlug?: string;
}

export default function CreateEditBlogPage({ initialData, blogSlug }: Props) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [categories, setCategories] = useState<Category[]>([]);
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [coverImageKey, setCoverImageKey] = useState(initialData?.coverImageKey || '');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      excerpt: initialData?.excerpt || '',
      content: initialData?.content || '',
      category: initialData?.category?._id || '',
      tags: initialData?.tags?.join(', ') || '',
      metaTitle: initialData?.seo?.metaTitle || '',
      metaDescription: initialData?.seo?.metaDescription || '',
    },
  });

  const contentValue = watch('content');

  useEffect(() => {
    axios.get('/api/categories').then((r) => setCategories(r.data.data));
  }, []);

  // Auto-generate excerpt from content if empty
  const titleValue = watch('title');
  useEffect(() => {
    if (titleValue && !initialData?.metaTitle) {
      setValue('metaTitle', titleValue.slice(0, 70));
    }
  }, [titleValue]);

  const submitBlog = async (status: 'draft' | 'published') => {
    const isPublish = status === 'published';
    if (isPublish) setPublishing(true);
    else setSaving(true);

    try {
      const values = await new Promise<FormData>((resolve, reject) => {
        handleSubmit(resolve, reject)();
      });

      const payload = {
        title: values.title,
        excerpt: values.excerpt,
        content: values.content,
        category: values.category,
        tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        coverImage,
        coverImageKey,
        status,
        seo: {
          metaTitle: values.metaTitle,
          metaDescription: values.metaDescription,
        },
      };

      if (isEditing && blogSlug) {
        await axios.patch(`/api/blogs/${blogSlug}`, payload);
        toast.success(isPublish ? 'Post updated and published!' : 'Draft saved');
      } else {
        const res = await axios.post('/api/blogs', payload);
        toast.success(isPublish ? 'Post published! 🎉' : 'Draft saved');
        if (isPublish) {
          router.push(`/blog/${res.data.data.slug}`);
          return;
        }
      }
      router.push('/dashboard/blogs');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border px-6 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-display font-bold text-lg text-foreground">
              {isEditing ? 'Edit Post' : 'New Post'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all ${previewMode ? 'bg-secondary border-border text-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}>
              <Eye className="w-3.5 h-3.5" />
              {previewMode ? 'Edit' : 'Preview'}
            </button>
            <button onClick={() => submitBlog('draft')} disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-all">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save draft
            </button>
            <button onClick={() => submitBlog('published')} disabled={publishing}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm bg-primary text-white hover:opacity-90 disabled:opacity-50 transition-all font-medium">
              {publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {isEditing ? 'Update' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cover Image</label>
              <ImageUpload
                value={coverImage}
                onChange={(url, key) => { setCoverImage(url); setCoverImageKey(key); }}
                onRemove={() => { setCoverImage(''); setCoverImageKey(''); }}
                folder="blog-covers"
              />
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Your post title..."
                {...register('title')}
                className="w-full text-3xl font-display font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-foreground"
              />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Excerpt / Summary</label>
              <textarea
                placeholder="A brief summary of your post (shown in cards and search results)..."
                rows={2}
                {...register('excerpt')}
                className="w-full px-4 py-3 bg-background border border-input rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors.excerpt && <p className="text-destructive text-xs mt-1">{errors.excerpt.message}</p>}
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Content (Markdown)</label>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <MarkdownEditor value={field.value} onChange={field.onChange} preview={previewMode} />
                )}
              />
              {errors.content && <p className="text-destructive text-xs mt-1">{errors.content.message}</p>}
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-5">
            {/* Category */}
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-sm font-semibold text-foreground mb-3">Category *</label>
              <select {...register('category')}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select category...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-destructive text-xs mt-1">{errors.category.message}</p>}
            </div>

            {/* Tags */}
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-sm font-semibold text-foreground mb-1.5">Tags</label>
              <input
                type="text"
                placeholder="e.g. nextjs, cloud, aws"
                {...register('tags')}
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="text-xs text-muted-foreground mt-1">Separate with commas</p>
            </div>

            {/* SEO */}
            <div className="bg-card border border-border rounded-xl p-4">
              <label className="block text-sm font-semibold text-foreground mb-3">SEO Settings</label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Meta Title <span className="text-muted-foreground/60">(max 70 chars)</span></label>
                  <input type="text" {...register('metaTitle')} maxLength={70}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Meta Description <span className="text-muted-foreground/60">(max 160)</span></label>
                  <textarea {...register('metaDescription')} maxLength={160} rows={3}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </div>

            {/* Cloud Info */}
            <div className="bg-muted/40 border border-dashed border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">☁️ Cloud Info</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Images stored on <strong className="text-foreground">AWS S3</strong></li>
                <li>• Served via <strong className="text-foreground">CloudFront CDN</strong></li>
                <li>• Data persisted in <strong className="text-foreground">MongoDB Atlas</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
