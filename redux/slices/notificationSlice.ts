import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface NotificationState {
  items: any[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async () => {
    const res = await axios.get('/api/notifications');
    return res.data.data;
  }
);

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async () => {
    await axios.patch('/api/notifications/read-all');
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    decrementUnread(state) {
      if (state.unreadCount > 0) state.unreadCount--;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.unreadCount = 0;
        state.items = state.items.map((n) => ({
          ...n,
          isRead: true,
        }));
      });
  },
});

export const { decrementUnread } = notificationSlice.actions;
export default notificationSlice.reducer;