import { Box } from "@mui/material";
import React from "react";
import ChatMenu from "../chat/ChatMenu";
import ChatMain from "../chat/ChatMain";
import "./Chat.css";
import { useSelector } from "react-redux";
import Header from "../components/Header";

function Chat() {
  const { bg } = useSelector((state) => state);

  return (
    <Box className="mainChatBox" sx={{ backgroundImage: `url(${bg.bgImage})` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          fontFamily: `"Orbitron", sans-serif`,
          color: "white",
          fontSize: "30px",
          paddingLeft: "0px",
          zIndex: "20",
          paddingTop: 20,
          marginLeft: 20,
          marginBottom: 20,
        }}>
        Chat_Goopt<span className="blinking-text">ㅣ</span>
        <Header />
      </div>
      <div style={{ display: "flex" }} className="chat_content">
        <ChatMenu />
        <Box component="main" className="chatPageMain">
          <ChatMain />
        </Box>
      </div>
    </Box>
  );
}

export default Chat;
