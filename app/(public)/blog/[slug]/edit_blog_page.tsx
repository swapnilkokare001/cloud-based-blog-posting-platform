import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { notFound } from 'next/navigation';
import CreateEditBlogPage from '@/components/dashboard/CreateEditBlog';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EditBlogPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const blog = await Blog.findOne({ slug })
    .populate('category', '_id name')
    .lean();
  if (!blog) notFound();
  return <CreateEditBlogPage initialData={JSON.parse(JSON.stringify(blog))} blogSlug={slug} />;
}
