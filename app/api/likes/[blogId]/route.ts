import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Like } from '@/models/index';
import Blog from '@/models/Blog';

type Params = { params: Promise<{ blogId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { blogId } = await params;
    const userId = session.user.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }

    const existing = await Like.findOne({ user: userId, blog: blogId });

    if (existing) {
      await Like.deleteOne({ _id: existing._id });
      await Blog.findByIdAndUpdate(blogId, { $inc: { likesCount: -1 } });
      return NextResponse.json({ success: true, liked: false });
    } else {
      await Like.create({ user: userId, blog: blogId });
      await Blog.findByIdAndUpdate(blogId, { $inc: { likesCount: 1 } });
      return NextResponse.json({ success: true, liked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: true, liked: false });
    }

    await connectDB();

    const { blogId } = await params;
    const like = await Like.findOne({ user: session.user.id, blog: blogId });
    return NextResponse.json({ success: true, liked: !!like });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}