import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { deleteFromS3 } from '@/lib/s3';

type Params = { params: { slug: string } };

// ── GET /api/blogs/[slug] ──────────────────────────────
export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectDB();

    const blog = await Blog.findOneAndUpdate(
      { slug: params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name avatar bio socialLinks')
      .populate('category', 'name color slug icon');

    if (!blog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// ── PATCH /api/blogs/[slug] ────────────────────────────
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }

    // Only author or admin can update
    if (blog.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    // If replacing cover image and old key exists, delete from S3
    if (body.coverImageKey && blog.coverImageKey && body.coverImageKey !== blog.coverImageKey) {
      await deleteFromS3(blog.coverImageKey).catch(console.error);
    }

    const updated = await Blog.findOneAndUpdate(
      { slug: params.slug },
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('author', 'name avatar')
      .populate('category', 'name color slug');

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ── DELETE /api/blogs/[slug] ───────────────────────────
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const blog = await Blog.findOne({ slug: params.slug });
    if (!blog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }

    if (blog.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Delete cover image from S3 if exists
    if (blog.coverImageKey) {
      await deleteFromS3(blog.coverImageKey).catch(console.error);
    }

    await Blog.deleteOne({ _id: blog._id });

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
