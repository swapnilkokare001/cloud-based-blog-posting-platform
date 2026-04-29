import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import blogReducer from './slices/blogSlice';

export const store = configureStore({
  reducer: {
    ui: uiReducer,
    notifications: notificationReducer,
    blog: blogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // likedBlogs is a Set which is non-serializable — ignore it
        ignoredPaths: ['blog.likedBlogs'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;