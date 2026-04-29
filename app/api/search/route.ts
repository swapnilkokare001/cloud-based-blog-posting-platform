import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';

// ── GET /api/search?q=...&category=...&page=... ───────
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 9;

    if (!q && !category && !tag) {
      return NextResponse.json({
        success: true,
        data: { blogs: [], total: 0, page: 1, totalPages: 0 },
      });
    }

    const query: any = { status: 'published' };

    if (q) query.$text = { $search: q };
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };

    const sortOptions: any = q ? { score: { $meta: 'textScore' } } : { publishedAt: -1 };

    const [blogs, total] = await Promise.all([
      Blog.find(query, q ? { score: { $meta: 'textScore' } } : {})
        .populate('author', 'name avatar')
        .populate('category', 'name color slug')
        .select('-content')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        blogs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        query: q,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
