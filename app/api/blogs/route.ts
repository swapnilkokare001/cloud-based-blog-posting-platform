import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { generateSlug } from '@/utils/helpers';
import { z } from 'zod';

const BLOGS_PER_PAGE = 9;

// ── GET /api/blogs ─────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const authorId = searchParams.get('author') || '';
    const status = searchParams.get('status') || 'published';

    const query: any = { status };
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (authorId) query.author = authorId;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (page - 1) * BLOGS_PER_PAGE;

    const [blogs, total, featured] = await Promise.all([
      Blog.find(query)
        .populate('author', 'name avatar')
        .populate('category', 'name color slug')
        .select('-content')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(BLOGS_PER_PAGE)
        .lean(),
      Blog.countDocuments(query),
      Blog.find({ status: 'published', featured: true })
        .populate('author', 'name avatar')
        .populate('category', 'name color slug')
        .select('-content')
        .limit(3)
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        blogs,
        featured,
        total,
        page,
        totalPages: Math.ceil(total / BLOGS_PER_PAGE),
      },
    });
  } catch (error: any) {
    console.error('[GET BLOGS ERROR]', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// ── POST /api/blogs ────────────────────────────────────
const createBlogSchema = z.object({
  title: z.string().min(5).max(200),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  category: z.string().min(1),
  tags: z.array(z.string()).max(10).optional(),
  coverImage: z.string().optional(),
  coverImageKey: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  seo: z
    .object({
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      keywords: z.array(z.string()).optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createBlogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const { title, ...rest } = parsed.data;

    // Generate a unique slug
    let slug = generateSlug(title);
    const existing = await Blog.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    const blog = await Blog.create({
      title,
      slug,
      author: session.user.id,
      ...rest,
      tags: rest.tags || [],
    });

    await blog.populate(['author', 'category']);

    return NextResponse.json(
      { success: true, message: 'Blog created successfully', data: blog },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[CREATE BLOG ERROR]', error);
    return NextResponse.json({ success: false, message: 'Failed to create blog' }, { status: 500 });
  }
}
