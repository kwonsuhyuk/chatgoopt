import { createSlice } from "@reduxjs/toolkit";

const channelSlice = createSlice({
  name: "channelSlice",
  initialState: { currentChannel: null },
  reducers: {
    setCurrentChannel: (state, action) => {
      state.currentChannel = action.payload;
    },
  },
});

export const { setCurrentChannel } = channelSlice.actions;
export default channelSlice.reducer;
