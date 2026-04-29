import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Blog from '@/models/Blog';
import { z } from 'zod';

// ── GET /api/users/[id] ────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await User.findById(params.id).select('-password -resetPasswordToken').lean();
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const blogs = await Blog.find({ author: params.id, status: 'published' })
      .select('title slug excerpt coverImage publishedAt readTime views likesCount')
      .populate('category', 'name color')
      .sort({ publishedAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({ success: true, data: { user, blogs } });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// ── PATCH /api/users/[id] — update own profile ─────────
const updateSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  socialLinks: z
    .object({
      twitter: z.string().url().optional().or(z.literal('')),
      github: z.string().url().optional().or(z.literal('')),
      linkedin: z.string().url().optional().or(z.literal('')),
      website: z.string().url().optional().or(z.literal('')),
    })
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.id !== params.id && session.user.role !== 'admin')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(params.id, { $set: parsed.data }, { new: true }).select(
      '-password'
    );

    return NextResponse.json({ success: true, data: user });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
