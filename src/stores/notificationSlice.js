import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
  totalCount: 0,
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notificationState",
  initialState,
  reducers: {
    initNotification(state) {
      state.notifications = initialState.notifications;
      state.totalCount = initialState.totalCount;
      state.unreadCount = initialState.unreadCount;
    },
    setNotification(state, action) {
      state.notifications = action.payload.notes;
      state.totalCount = action.payload?.notes?.length;
      state.unreadCount = action.payload.notes?.filter(
        (noti) => !noti.readAt
      ).length;
    },
  },
});

export const { initNotification, setNotification } = notificationSlice.actions;

export default notificationSlice.reducer;
