// ──────────────────────────────────────────────────────
// authSlice.ts
// ──────────────────────────────────────────────────────
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthState['user']>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    updateAvatar(state, action: PayloadAction<string>) {
      if (state.user) state.user.avatar = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading, setError, updateAvatar } = authSlice.actions;
export default authSlice.reducer;
