import { createSlice } from "@reduxjs/toolkit";

const alarmSlice = createSlice({
  name: "alarmSlice",
  initialState: { alarms: [] },
  reducers: {
    setUserAlarms: (state, action) => {
      const newTodo = action.payload;

      // 중복된 todos가 이미 존재하는지 확인
      const isDuplicate = state.alarms.some((alarm) => alarm.id === newTodo.id);

      // 중복되지 않은 경우에만 추가
      if (!isDuplicate) {
        state.alarms.push(newTodo);
      }
    },
    deleteUserAlarms: (state, action) => {
      state.alarms = state.alarms.filter(
        (alarm) => alarm.id !== action.payload.id
      );
    },
    clearUserAlarms: (state) => {
      state.alarms = [];
    },
  },
});

export const { setUserAlarms, deleteUserAlarms, clearUserAlarms } =
  alarmSlice.actions;
export default alarmSlice.reducer;
