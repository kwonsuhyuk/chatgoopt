import { Divider, Grid, List, Paper } from "@mui/material";
import React from "react";
import ChatInput from "./ChatInput";

function ChatMain() {
  return (
    <Grid
      container
      component={Paper}
      variant="outlined"
      sx={{
        position: "relative",
        boxShadow:
          "inset -3px -3px 1px white, inset 5px 5px 10px rgba(0, 0, 0, 0.3)",
      }}>
      <List
        sx={{
          height: "calc(73vh)",
          overflow: "scroll",
          width: "100%",
          position: "relative",
        }}>
        {/* {messages.map((message) => (
          <ChatMessage key={message.timestamp} message={message} user={user} />
        ))}
        <div ref={messageEndRef}></div> */}
      </List>
      <Divider />
      <ChatInput />
    </Grid>
  );
}

export default ChatMain;
