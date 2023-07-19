import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import channelReducer from "./channelSlice";
import alarmSlice from "./alarmSlice";
import chatAlarmSlice from "./chatAlarmSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    channel: channelReducer,
    userAlarms: alarmSlice,
    chatAlarmNum: chatAlarmSlice,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});
