import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import '@/models/User';
import '@/models/index';
import BlogDetailClient from '@/components/blog/BlogDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const blog = await Blog.findOne({ slug, status: 'published' }).lean() as any;
  if (!blog) return { title: 'Blog not found' };
  return {
    title: blog.seo?.metaTitle || blog.title,
    description: blog.seo?.metaDescription || blog.excerpt,
  };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const blog = await Blog.findOneAndUpdate(
    { slug, status: 'published' },
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'name avatar bio socialLinks')
    .populate('category', 'name color slug icon')
    .lean() as any;

  if (!blog) notFound();

  const related = await Blog.find({
    category: blog.category._id,
    status: 'published',
    _id: { $ne: blog._id },
  })
    .populate('author', 'name avatar')
    .populate('category', 'name color slug icon')
    .select('-content')
    .limit(3)
    .lean();

  return (
    <BlogDetailClient
      blog={JSON.parse(JSON.stringify(blog))}
      related={JSON.parse(JSON.stringify(related))}
    />
  );
}