import { Box } from "@mui/material";
import React from "react";
import ChatMenu from "../chat/ChatMenu";
import ChatMain from "../chat/ChatMain";
import "./Chat.css";
import { useSelector } from "react-redux";

function Chat() {
  const { theme } = useSelector((state) => state);
  return (
    <Box className="mainChatBox" sx={{ backgroundColor: `${theme.mainColor}` }}>
      <ChatMenu />
      <Box component="main" className="chatPageMain">
        <ChatMain />
      </Box>
    </Box>
  );
}

export default Chat;
