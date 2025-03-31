import { createSlice } from "@reduxjs/toolkit";

const appInitState = {
  routeData: {},
};

const appSlice = createSlice({
  name: "appState",
  initialState: { ...appInitState },
  reducers: {
    initAppState: (state) => {
      state.routeData = {};
    },
    setRouteData: (state, action) => {
      state.routeData = action.payload;
    },
  },
});

export default appSlice.reducer;
export const { initAppState, setRouteData } = appSlice.actions;
