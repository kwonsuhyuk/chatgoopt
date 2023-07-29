import { List, ListItem } from "@mui/material";
import React from "react";
import "./GameMenu.css";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function GameMenu() {
  const { theme } = useSelector((state) => state);
  const activeLinkStyle = {
    boxShadow: `-5px -5px 10px ${theme.subColor}, 5px 5px 10px rgba(0, 0, 0, 0.3)`,
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
            backgroundColor: "#f7786b",
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
