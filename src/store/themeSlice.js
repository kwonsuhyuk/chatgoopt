import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "themeSlice",
  initialState: { mainColor: "whitesmoke", subColor: "white" },
  reducers: {
    setTheme: (state, action) => {
      const { mainColor, subColor } = action.payload;
      state.mainColor = mainColor;
      state.subColor = subColor;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
