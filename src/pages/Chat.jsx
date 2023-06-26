import { Box, Drawer, Toolbar } from "@mui/material";
import React from "react";
import ChatMenu from "../chat/ChatMenu";
import ChatMain from "../chat/ChatMain";

function Chat() {
  return (
    <Box sx={{ display: "flex", backgroundColor: "whitesmoke" }}>
      <Box
        sx={{
          margin: "20px",
          minHeight: "80vh",
          backgroundColor: "whitesmoke",
          border: " none",
          boxShadow:
            "inset -6px -6px 10px white, inset 5px 5px 10px rgba(0, 0, 0, 0.3)",
          color: "gray",
        }}>
        <ChatMenu />
      </Box>

      <Box
        component="main"
        sx={{
          minHeight: "80vh",
          margin: "20px 20px",
          flexGrow: 1,
          boxShadow:
            "inset -3px -3px 1px white, inset 5px 5px 10px rgba(0, 0, 0, 0.3)",
          color: "gray",
        }}>
        <ChatMain />
      </Box>
    </Box>
    // <Box sx={{ display: "flex", backgroundColor: "whitesmoke" }}>
    //   <Drawer variant="permanent" sx={{ width: 300 }} className="no-scroll">
    //     <Toolbar />
    //     <Box sx={{ display: "flex", minHeight: "calc(100vh - 64px)" }}>
    //       <ChatMenu />
    //     </Box>
    //   </Drawer>
    //   <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
    //     <Chat />
    //   </Box>
    // </Box>
  );
}

export default Chat;
