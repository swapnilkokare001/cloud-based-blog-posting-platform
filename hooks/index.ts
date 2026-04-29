// hooks/useBlogs.ts
import { useDispatch, useSelector, useCallback } from 'react';
import type { AppDispatch, RootState } from '@/redux/store';
import { fetchBlogs, fetchBlogBySlug, toggleLike, setPage, setSelectedCategory, setSearchQuery } from '@/redux/slices/blogSlice';

export function useBlogs() {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.blog);

  const loadBlogs = useCallback(
    (params?: { page?: number; category?: string; search?: string }) => {
      dispatch(fetchBlogs(params));
    },
    [dispatch]
  );

  const loadBlogBySlug = useCallback(
    (slug: string) => dispatch(fetchBlogBySlug(slug)),
    [dispatch]
  );

  const handleLike = useCallback(
    (blogId: string) => dispatch(toggleLike(blogId)),
    [dispatch]
  );

  const changePage = useCallback(
    (page: number) => dispatch(setPage(page)),
    [dispatch]
  );

  const changeCategory = useCallback(
    (category: string) => dispatch(setSelectedCategory(category)),
    [dispatch]
  );

  const updateSearch = useCallback(
    (query: string) => dispatch(setSearchQuery(query)),
    [dispatch]
  );

  return {
    ...state,
    loadBlogs,
    loadBlogBySlug,
    handleLike,
    changePage,
    changeCategory,
    updateSearch,
  };
}


// hooks/useAuth.ts
import { useSession, signIn, signOut } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ?? null,
    isAuthenticated: !!session,
    isAdmin: session?.user.role === 'admin',
    isLoading: status === 'loading',
    signIn,
    signOut: () => signOut({ callbackUrl: '/' }),
  };
}


// hooks/useUpload.ts
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export function useUpload(folder = 'blogs') {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(
    async (file: File): Promise<{ url: string; key: string } | null> => {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return null;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be under 5MB');
        return null;
      }

      setUploading(true);
      setProgress(0);

      try {
        // Try presigned URL first (direct upload to S3)
        const { data: presignData } = await axios.get(
          `/api/upload?fileName=${encodeURIComponent(file.name)}&mimeType=${encodeURIComponent(file.type)}&folder=${folder}`
        );
        const { presignedUrl, key, publicUrl } = presignData.data;

        await axios.put(presignedUrl, file, {
          headers: { 'Content-Type': file.type },
          onUploadProgress: (e) => {
            setProgress(Math.round(((e.loaded ?? 0) / (e.total ?? 1)) * 100));
          },
        });

        return { url: publicUrl, key };
      } catch {
        // Fallback: server-side upload
        try {
          const formData = new FormData();
          formData.append('image', file);
          formData.append('folder', folder);
          const { data } = await axios.post('/api/upload', formData);
          return data.data;
        } catch {
          toast.error('Upload failed');
          return null;
        }
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [folder]
  );

  return { upload, uploading, progress };
}
