import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Blog from '@/models/Blog';
import { Comment, Like } from '@/models/index';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin only' }, { status: 403 });
    }

    await connectDB();

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      newUsers,
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalComments,
      totalLikes,
      totalViews,
      topBlogs,
      recentUsers,
      blogsByCategory,
      dailyStats,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Comment.countDocuments(),
      Like.countDocuments(),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      Blog.find({ status: 'published' })
        .sort({ views: -1 })
        .limit(5)
        .populate('author', 'name')
        .select('title views likesCount commentsCount slug'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email avatar createdAt role'),
      Blog.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $unwind: '$cat' },
        { $project: { name: '$cat.name', color: '$cat.color', count: 1 } },
        { $sort: { count: -1 } },
      ]),
      Blog.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            posts: { $sum: 1 },
            views: { $sum: '$views' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          newUsers,
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          totalComments,
          totalLikes,
          totalViews: totalViews[0]?.total || 0,
        },
        topBlogs,
        recentUsers,
        blogsByCategory,
        dailyStats,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
