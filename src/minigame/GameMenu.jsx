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
            backgroundColor: "#389cd7",
            color: "white",
            marginBottom: "20px",

            ...(location.pathname === "/minigame/" ? activeLinkStyle : {}),
          }}>
          게임메인
        </ListItem>
        <ListItem
          component={NavLink}
          to="/minigame/dicegame"
          sx={{
            backgroundColor: "#11609C",
            color: "white",
            marginBottom: "20px",

            ...(location.pathname === "/minigame/dicegame"
              ? activeLinkStyle
              : {}),
          }}>
          럭키 다이스
        </ListItem>
        {/* NavLink 사용 */}
        <ListItem
          component={NavLink}
          to="/minigame/typegame"
          sx={{
            backgroundColor: "#f7786b",
            marginBottom: "20px",
            color: "white",
            ...(location.pathname === "/minigame/typegame"
              ? activeLinkStyle
              : {}),
          }}>
          타이핑 게임
        </ListItem>
        <ListItem
          component={NavLink}
          to="/minigame/fifagame"
          sx={{
            backgroundColor: "#b5bf50",
            marginBottom: "20px",
            color: "white",
            ...(location.pathname === "/minigame/fifagame"
              ? activeLinkStyle
              : {}),
          }}>
          피파 게임
        </ListItem>
        <ListItem
          component={NavLink}
          to="/minigame/lolgame"
          sx={{
            backgroundColor: "#906aa5",
            color: "white",
            ...(location.pathname === "/minigame/lolgame"
              ? activeLinkStyle
              : {}),
          }}>
          롤 게임
        </ListItem>
      </List>
    </>
  );
}

export default GameMenu;
