import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  author: { _id: string; name: string; avatar?: string };
  category: { _id: string; name: string; color: string };
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  views: number;
  likesCount: number;
  commentsCount: number;
  readTime: number;
  publishedAt?: string;
  createdAt: string;
  isLiked?: boolean;
}

interface BlogState {
  blogs: BlogPost[];
  currentBlog: (BlogPost & { content: string }) | null;
  featuredBlogs: BlogPost[];
  totalCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  likedBlogs: Set<string>;
}

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  featuredBlogs: [],
  totalCount: 0,
  page: 1,
  totalPages: 1,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: '',
  likedBlogs: new Set(),
};

// Async thunks
export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs',
  async (params: { page?: number; category?: string; search?: string } = {}) => {
    const { page = 1, category = '', search = '' } = params;
    const query = new URLSearchParams({
      page: String(page),
      ...(category && { category }),
      ...(search && { search }),
    });
    const res = await axios.get(`/api/blogs?${query}`);
    return res.data;
  }
);

export const fetchBlogBySlug = createAsyncThunk(
  'blog/fetchBySlug',
  async (slug: string) => {
    const res = await axios.get(`/api/blogs/${slug}`);
    return res.data.data;
  }
);

export const toggleLike = createAsyncThunk(
  'blog/toggleLike',
  async (blogId: string) => {
    const res = await axios.post(`/api/likes/${blogId}`);
    return { blogId, liked: res.data.liked };
  }
);

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSelectedCategory(state, action: PayloadAction<string>) {
      state.selectedCategory = action.payload;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    clearCurrentBlog(state) {
      state.currentBlog = null;
    },
    optimisticLike(state, action: PayloadAction<{ blogId: string; increment: number }>) {
      const { blogId, increment } = action.payload;
      const blog = state.blogs.find((b) => b._id === blogId);
      if (blog) blog.likesCount += increment;
      if (state.currentBlog?._id === blogId) {
        state.currentBlog.likesCount += increment;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.blogs = action.payload.data.blogs;
        state.totalCount = action.payload.data.total;
        state.totalPages = action.payload.data.totalPages;
        state.featuredBlogs = action.payload.data.featured || [];
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch blogs';
      })
      .addCase(fetchBlogBySlug.fulfilled, (state, action) => {
        state.currentBlog = action.payload;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const { blogId, liked } = action.payload;
        if (liked) {
          state.likedBlogs.add(blogId);
        } else {
          state.likedBlogs.delete(blogId);
        }
      });
  },
});

export const { setSearchQuery, setSelectedCategory, setPage, clearCurrentBlog, optimisticLike } =
  blogSlice.actions;
export default blogSlice.reducer;
