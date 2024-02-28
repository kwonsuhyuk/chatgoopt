import { createSlice } from "@reduxjs/toolkit";

const bgSlice = createSlice({
  name: "bgSlice",
  initialState: { bgImage: "" },
  reducers: {
    setBg: (state, action) => {
      state.bgImage = action.payload;
    },
  },
});

export const { setBg } = bgSlice.actions;
export default bgSlice.reducer;
