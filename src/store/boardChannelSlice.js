import { createSlice } from "@reduxjs/toolkit";

const boardChannelSlice = createSlice({
  name: "channelSlice",
  initialState: { currentBoardChannel: null },
  reducers: {
    setCurrentBoardChannel: (state, action) => {
      state.currentBoardChannel = action.payload;
    },
  },
});

export const { setCurrentBoardChannel } = boardChannelSlice.actions;
export default boardChannelSlice.reducer;
