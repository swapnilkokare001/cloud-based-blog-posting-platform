/**
 * Database Seed Script
 * Run: npx ts-node scripts/seed.ts
 * Creates default categories and an admin user
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blogplatform';

const defaultCategories = [
  { name: 'Technology', slug: 'technology', color: '#6366f1', icon: '💻', description: 'Tech news, tutorials, and insights' },
  { name: 'Cloud Computing', slug: 'cloud-computing', color: '#06b6d4', icon: '☁️', description: 'AWS, GCP, Azure and beyond' },
  { name: 'Web Development', slug: 'web-development', color: '#f97316', icon: '🌐', description: 'Frontend, backend, and fullstack' },
  { name: 'DevOps', slug: 'devops', color: '#10b981', icon: '⚙️', description: 'CI/CD, Docker, Kubernetes' },
  { name: 'Machine Learning', slug: 'machine-learning', color: '#8b5cf6', icon: '🤖', description: 'AI, ML, and data science' },
  { name: 'Open Source', slug: 'open-source', color: '#ec4899', icon: '🔓', description: 'Open source projects and news' },
  { name: 'Career', slug: 'career', color: '#f59e0b', icon: '💼', description: 'Career advice and industry insights' },
  { name: 'Tutorial', slug: 'tutorial', color: '#14b8a6', icon: '📚', description: 'Step-by-step guides and how-tos' },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create categories
    const CategorySchema = new mongoose.Schema({
      name: String, slug: String, description: String,
      color: String, icon: String, postsCount: { type: Number, default: 0 },
    });
    const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

    let created = 0;
    for (const cat of defaultCategories) {
      const existing = await Category.findOne({ slug: cat.slug });
      if (!existing) {
        await Category.create(cat);
        created++;
        console.log(`  ✦ Created category: ${cat.icon} ${cat.name}`);
      }
    }
    console.log(`\n📁 Categories: ${created} created, ${defaultCategories.length - created} already existed`);

    // Create default admin (only if no admin exists)
    const UserSchema = new mongoose.Schema({
      name: String, email: String, password: String,
      role: { type: String, default: 'user' }, isVerified: Boolean,
      provider: { type: String, default: 'credentials' },
    });
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123456', 12);
      await User.create({
        name: 'Admin User',
        email: 'admin@blogcloud.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        provider: 'credentials',
      });
      console.log('\n👤 Admin user created:');
      console.log('   Email:    admin@blogcloud.com');
      console.log('   Password: Admin@123456');
      console.log('   ⚠️  Change this password after first login!\n');
    } else {
      console.log('\n👤 Admin user already exists, skipping...\n');
    }

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
