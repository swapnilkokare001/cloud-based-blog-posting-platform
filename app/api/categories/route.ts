import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import { Category } from '@/models/index';
import { generateSlug } from '@/utils/helpers';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ postsCount: -1 }).lean();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin only' }, { status: 403 });
    }

    await connectDB();

    const { name, description, color, icon } = await req.json();
    const slug = generateSlug(name);

    const category = await Category.create({ name, slug, description, color, icon });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
