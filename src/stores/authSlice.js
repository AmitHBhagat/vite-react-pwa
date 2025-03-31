import { createSlice } from "@reduxjs/toolkit";

const authInitState = {
  isAuthenticated: undefined,
  token: "",
  user: {},
  flatList: [],
  selectedFlat: {},
};

const authSlice = createSlice({
  name: "authState",
  initialState: { ...authInitState },
  reducers: {
    initAuthState: (state) => {
      state.isAuthenticated = false;
      state.token = authInitState.token;
      state.user = authInitState.user;
      state.flatList = authInitState.flatList;
      state.selectedFlat = authInitState.selectedFlat;
    },
    setAuth: (state, action) => {
      state.isAuthenticated = action.payload.isAuthenticated;
    },
    setToken: (state, action) => {
      state.token = action.payload.token;
    },
    setUser: (state, action) => {
      state.user = action.payload.user;
    },
    setFlatList: (state, action) => {
      state.flatList = action.payload.flatList;
    },
    setSelectedFlat: (state, action) => {
      state.selectedFlat = action.payload.selectedFlat;
    },
  },
});

export default authSlice.reducer;
export const {
  initAuthState,
  setAuth,
  setToken,
  setUser,
  setFlatList,
  setSelectedFlat,
} = authSlice.actions;
