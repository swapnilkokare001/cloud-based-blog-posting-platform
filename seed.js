const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/blod_cc';
const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    color: String,
    icon: String,
    postsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

const categories = [
  { name: 'Technology', slug: 'technology', description: 'Tech articles', color: '#3498db', icon: '💻' },
  { name: 'Programming', slug: 'programming', description: 'Coding tutorials', color: '#2ecc71', icon: '👨‍💻' },
  { name: 'Design', slug: 'design', description: 'UI/UX Design', color: '#9b59b6', icon: '🎨' },
  { name: 'Business', slug: 'business', description: 'Business tips', color: '#e67e22', icon: '💼' },
  { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle blogs', color: '#e74c3c', icon: '🌿' },
  { name: 'Travel', slug: 'travel', description: 'Travel stories', color: '#1abc9c', icon: '✈️' },
  { name: 'Health', slug: 'health', description: 'Health and wellness', color: '#f39c12', icon: '💪' },
  { name: 'Education', slug: 'education', description: 'Learning resources', color: '#34495e', icon: '📚' },
];

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('✅ Connected to MongoDB');

  const count = await Category.countDocuments();
  if (count > 0) {
    console.log('Already have', count, 'categories. Deleting and re-seeding...');
    await Category.deleteMany({});
  }

  await Category.insertMany(categories);
  console.log('✅ Categories added successfully!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
