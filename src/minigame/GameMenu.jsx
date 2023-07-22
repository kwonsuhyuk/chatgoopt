import { List, ListItem } from "@mui/material";
import React from "react";
import "./GameMenu.css";
import { NavLink, useLocation } from "react-router-dom";

function GameMenu() {
  const activeLinkStyle = {
    boxShadow: "-5px -5px 12px white, 6px 6px 12px rgba(0, 0, 0, 0.3)",
  };

  const location = useLocation();

  return (
    <>
      <List sx={{ width: "10vw", padding: "0px" }}>
        {/* NavLink 사용 */}
        <ListItem
          component={NavLink}
          to="/minigame/"
          sx={{
            backgroundColor: "#11609C",
            color: "white",
            marginBottom: "20px",

            ...(location.pathname === "/minigame/" ? activeLinkStyle : {}),
          }}>
          럭키 다이스
        </ListItem>
        {/* NavLink 사용 */}
        <ListItem
          component={NavLink}
          to="/minigame/typegame"
          sx={{
            backgroundColor: "#E86B79",
            color: "white",
            ...(location.pathname === "/minigame/typegame"
              ? activeLinkStyle
              : {}),
          }}>
          타이핑 게임
        </ListItem>
      </List>
    </>
  );
}

export default GameMenu;
