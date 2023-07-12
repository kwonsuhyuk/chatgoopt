import { Box } from "@mui/material";
import React from "react";
import ChatMenu from "../chat/ChatMenu";
import ChatMain from "../chat/ChatMain";
import "./Chat.css";

function Chat() {
  return (
    <Box className="mainChatBox">
      <ChatMenu />
      <Box component="main" className="chatPageMain">
        <ChatMain />
      </Box>
    </Box>
  );
}

export default Chat;
