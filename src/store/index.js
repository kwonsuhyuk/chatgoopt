import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import channelReducer from "./channelSlice";
import alarmSlice from "./alarmSlice";
import chatAlarmSlice from "./chatAlarmSlice";
import themeSlice from "./themeSlice";
import boardChannelSlice from "./boardChannelSlice";
import bgSlice from "./bgSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    channel: channelReducer,
    userAlarms: alarmSlice,
    chatAlarmNum: chatAlarmSlice,
    theme: themeSlice,
    boardChannel: boardChannelSlice,
    bg: bgSlice,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});
