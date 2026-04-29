// app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/models/index';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  await connectDB();
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ recipient: session.user.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    Notification.countDocuments({ recipient: session.user.id, isRead: false }),
  ]);
  return NextResponse.json({ success: true, data: { notifications, unreadCount } });
}
