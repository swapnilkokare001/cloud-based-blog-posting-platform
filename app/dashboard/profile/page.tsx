'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save, Camera } from 'lucide-react';
import { getInitials } from '@/utils/helpers';
import ImageUpload from '@/components/blog/ImageUpload';
import axios from 'axios';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2).max(60),
  bio: z.string().max(500).optional(),
  twitter: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

export default function ProfileSettingsPage() {
  const { data: session, update: updateSession } = useSession();
  const [avatarUrl, setAvatarUrl] = useState(session?.user.image || '');
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!session?.user.id) return;
    axios.get(`/api/users/${session.user.id}`).then((r) => {
      const user = r.data.data.user;
      setAvatarUrl(user.avatar || '');
      reset({
        name: user.name || '',
        bio: user.bio || '',
        twitter: user.socialLinks?.twitter || '',
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
        website: user.socialLinks?.website || '',
      });
    });
  }, [session?.user.id, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      await axios.patch(`/api/users/${session?.user.id}`, {
        name: data.name,
        bio: data.bio,
        avatar: avatarUrl,
        socialLinks: {
          twitter: data.twitter,
          github: data.github,
          linkedin: data.linkedin,
          website: data.website,
        },
      });
      await updateSession({ name: data.name, image: avatarUrl });
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your public profile</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Profile Photo</h3>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(session?.user.name || 'U')
              )}
            </div>
            <div className="flex-1">
              <ImageUpload
                value={avatarUrl}
                onChange={(url) => setAvatarUrl(url)}
                onRemove={() => setAvatarUrl('')}
                folder="avatars"
                className="min-h-0"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Stored on AWS S3 · Served via CloudFront CDN
              </p>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Display Name</label>
            <input
              type="text"
              {...register('name')}
              className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Bio <span className="text-muted-foreground text-xs">(max 500 characters)</span>
            </label>
            <textarea
              rows={3}
              {...register('bio')}
              placeholder="Tell readers about yourself..."
              className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.bio && <p className="text-destructive text-xs mt-1">{errors.bio.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              value={session?.user.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl text-sm text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-foreground">Social Links</h3>
          {[
            { name: 'twitter' as const, label: 'Twitter / X', placeholder: 'https://twitter.com/username' },
            { name: 'github' as const, label: 'GitHub', placeholder: 'https://github.com/username' },
            { name: 'linkedin' as const, label: 'LinkedIn', placeholder: 'https://linkedin.com/in/username' },
            { name: 'website' as const, label: 'Website', placeholder: 'https://yourwebsite.com' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
              <input
                type="url"
                placeholder={placeholder}
                {...register(name)}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {errors[name] && <p className="text-destructive text-xs mt-1">{errors[name]?.message}</p>}
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || (!isDirty && avatarUrl === session?.user.image)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save changes
        </button>
      </form>
    </div>
  );
}
