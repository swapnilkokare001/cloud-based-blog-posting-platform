import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Comment } from '@/models/index';
import Blog from '@/models/Blog';
import { Notification } from '@/models/index';

// ── GET /api/comments?blogId=xxx ──────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const blogId = searchParams.get('blogId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    if (!blogId) {
      return NextResponse.json({ success: false, message: 'blogId is required' }, { status: 400 });
    }

    const [comments, total] = await Promise.all([
      Comment.find({ blog: blogId, parentComment: null })
        .populate('author', 'name avatar')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ blog: blogId, parentComment: null }),
    ]);

    // Fetch replies for top-level comments
    const commentIds = comments.map((c: any) => c._id);
    const replies = await Comment.find({ parentComment: { $in: commentIds } })
      .populate('author', 'name avatar')
      .sort({ createdAt: 1 })
      .lean();

    const commentsWithReplies = comments.map((comment: any) => ({
      ...comment,
      replies: replies.filter(
        (r: any) => r.parentComment?.toString() === comment._id.toString()
      ),
    }));

    return NextResponse.json({
      success: true,
      data: { comments: commentsWithReplies, total, page, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// ── POST /api/comments ────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { blogId, content, parentComment } = await req.json();

    if (!blogId || !content?.trim()) {
      return NextResponse.json(
        { success: false, message: 'blogId and content are required' },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return NextResponse.json({ success: false, message: 'Blog not found' }, { status: 404 });
    }

    const comment = await Comment.create({
      blog: blogId,
      author: session.user.id,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    // Increment blog comment count
    await Blog.findByIdAndUpdate(blogId, { $inc: { commentsCount: 1 } });

    // Create notification for blog author (if not self-comment)
    if (blog.author.toString() !== session.user.id) {
      await Notification.create({
        recipient: blog.author,
        sender: session.user.id,
        type: parentComment ? 'reply' : 'comment',
        blog: blogId,
        comment: comment._id,
        message: `${session.user.name} ${parentComment ? 'replied to a comment on' : 'commented on'} your post "${blog.title}"`,
      });
    }

    await comment.populate('author', 'name avatar');

    return NextResponse.json(
      { success: true, message: 'Comment added', data: comment },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ── DELETE /api/comments?commentId=xxx ───────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');

    await connectDB();

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
    }

    if (comment.author.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await Comment.deleteOne({ _id: commentId });
    await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentsCount: -1 } });

    return NextResponse.json({ success: true, message: 'Comment deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
