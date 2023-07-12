import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import channelReducer from "./channelSlice";
import alarmSlice from "./alarmSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    channel: channelReducer,
    userAlarms: alarmSlice,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});
