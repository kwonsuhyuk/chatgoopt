import { createSlice } from "@reduxjs/toolkit";

const channelSlice = createSlice({
  name: "channelSlice",
  initialState: { currentChannel: null, islocked: null },
  reducers: {
    setCurrentChannel: (state, action) => {
      state.currentChannel = action.payload;
    },
    setIsLocked: (state, action) => {
      state.islocked = action.payload;
    },
  },
});

export const { setCurrentChannel, setIsLocked } = channelSlice.actions;
export default channelSlice.reducer;
