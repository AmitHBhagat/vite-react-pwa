import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    societies: [],
    loading: false,
    error: null,
};

const societySlice = createSlice({
    name: "society",
    initialState,
    reducers: {
        fetchSocietiesStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchSocietiesSuccess(state, action) {
            state.loading = false;
            state.societies = action.payload;
        },
        fetchSocietiesFailure(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
    },
});

export const {
    fetchSocietiesStart,
    fetchSocietiesSuccess,
    fetchSocietiesFailure,
} = societySlice.actions;

export default societySlice.reducer;
