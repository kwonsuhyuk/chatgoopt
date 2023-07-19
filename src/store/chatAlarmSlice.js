import { createSlice } from "@reduxjs/toolkit";

const chatAlarmSlice = createSlice({
  name: "chatAlarmSlice",
  initialState: {},

  reducers: {
    clearChatAlarmNum: (state, action) => {
      const channelId = action.payload;
      state[channelId] = 0;
    },

    setChatAlarmNum: (state, action) => {
      const { channelId, messageCount } = action.payload;
      console.log(channelId, messageCount);
      state[channelId] = messageCount;
    },
  },
});

export const { clearChatAlarmNum, setChatAlarmNum } = chatAlarmSlice.actions;
export default chatAlarmSlice.reducer;
