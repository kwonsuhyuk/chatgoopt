import { Box } from "@mui/material";
import React from "react";
import ChatMenu from "../chat/ChatMenu";
import ChatMain from "../chat/ChatMain";
import "./Chat.css";

function Chat() {
  return (
    <Box className="mainChatBox">
      <ChatMenu />
      <Box
        component="main"
        sx={{
          minHeight: "80vh",
          maxWidth: "calc(100vw - 300px)",
          margin: "20px 20px",
          flexGrow: 1,
          boxShadow:
            "inset -3px -3px 1px white, inset 5px 5px 10px rgba(0, 0, 0, 0.3)",
          color: "gray",
        }}>
        <ChatMain />
      </Box>
    </Box>
  );
}

export default Chat;
