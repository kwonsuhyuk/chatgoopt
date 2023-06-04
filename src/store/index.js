import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import { channelSlice } from "./channelSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    channel: channelSlice,
  },
  // middleware: getDefaultMiddleware({
  //   serializableCheck: false,
  // }),
});
