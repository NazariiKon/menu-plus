import { createSlice } from '@reduxjs/toolkit';
import type { User } from '@supabase/supabase-js';

interface UserState {
    currentUser: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: UserState = {
    currentUser: null,
    isAuthenticated: false,
    isLoading: true
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.currentUser = action.payload;
            state.isAuthenticated = !!action.payload;
            state.isLoading = false;
        },
        clearUser: (state) => {
            state.currentUser = null;
            state.isAuthenticated = false;

        },
        setLoading: (state, action) => {
            state.isLoading = action.payload
        }
    },
});

export const { setUser, clearUser, setLoading } = userSlice.actions;
export default userSlice.reducer;
