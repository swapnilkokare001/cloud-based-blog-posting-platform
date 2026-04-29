import mongoose, { Document, Model, Schema } from 'mongoose';

// ──────────────────────────────────────────────────────
// COMMENT MODEL
// ──────────────────────────────────────────────────────
export interface IComment extends Document {
  _id: string;
  blog: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId;
  likes: number;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
    likes: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommentSchema.index({ blog: 1, createdAt: -1 });
CommentSchema.index({ author: 1 });

export const Comment: Model<IComment> =
  mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);


// ──────────────────────────────────────────────────────
// LIKE MODEL
// ──────────────────────────────────────────────────────
export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blog: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
  },
  { timestamps: true }
);

LikeSchema.index({ user: 1, blog: 1 }, { unique: true });

export const Like: Model<ILike> =
  mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);


// ──────────────────────────────────────────────────────
// CATEGORY MODEL
// ──────────────────────────────────────────────────────
export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  postsCount: number;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 50,
    },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, maxlength: 200 },
    color: { type: String, default: '#6366f1' },
    icon: { type: String, default: '📝' },
    postsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

CategorySchema.index({ slug: 1 }, { unique: true });

export const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);


// ──────────────────────────────────────────────────────
// NOTIFICATION MODEL
// ──────────────────────────────────────────────────────
export type NotificationType = 'like' | 'comment' | 'follow' | 'reply' | 'mention';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: NotificationType;
  blog?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['like', 'comment', 'follow', 'reply', 'mention'],
      required: true,
    },
    blog: { type: Schema.Types.ObjectId, ref: 'Blog' },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    message: { type: String, required: true, maxlength: 200 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);
