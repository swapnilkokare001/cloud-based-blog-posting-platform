import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Notification } from '@/models/index';

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  await connectDB();
  await Notification.updateMany({ recipient: session.user.id, isRead: false }, { isRead: true });
  return NextResponse.json({ success: true });
}
