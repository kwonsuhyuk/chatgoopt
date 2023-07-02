import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import channelReducer from "./channelSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    channel: channelReducer,
  },
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
});
