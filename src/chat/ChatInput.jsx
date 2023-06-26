import { Grid, TextField } from "@mui/material";
import React from "react";

function ChatInput() {
  return (
    <Grid container sx={{ p: "20px" }}>
      <Grid item xs={12} sx={{ position: "relative" }}>
        <TextField
          fullWidth
          label="메시지를 입력하세요"
          autoComplete="off"
          // value={message}
          // onChange={handleChange}
        />
      </Grid>
    </Grid>
  );
}

export default ChatInput;
