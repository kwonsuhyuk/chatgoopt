import React, { useCallback, useEffect, useState } from "react";
import { Avatar, Box, List, ListItem, ListItemAvatar } from "@mui/material";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import DiceGame from "../minigame/DiceGame";
import TypingGame from "../minigame/TypingGame";
import { useSelector } from "react-redux";
import FiFaGame from "../minigame/FiFaGame";
import GameMain from "../minigame/GameMain";
import LoLGame from "../minigame/LoLGame";
import MemoryGame from "../minigame/MemoryGame";
import MiniGameMain from "../minigame/MiniGameMain";
import "./MiniGame.css";
import { useTransition, animated } from "react-spring";
import Header from "../components/Header";

function MiniGame() {
  const { bg } = useSelector((state) => state);
  const location = useLocation();
  const navigate = useNavigate();

  const transitions = useTransition(location, {
    from: { opacity: 0, transform: "translate3d(100%,0px,0px)" },
    enter: { opacity: 1, transform: "translate3d(0%,0px,0px)" },
    leave: { opacity: 0, transform: "translate3d(-50%,0px,0px)" },
  });

  const handleMenuClick = (path) => {
    navigate(path); // 라우팅 경로를 변경하여 페이지 전환
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        backgroundImage: `url(${bg.bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "fixed",
        backgroundSize: "cover",
      }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: `"Orbitron", sans-serif`,
            color: "white",
            fontSize: "30px",
            zIndex: "20",
            paddingTop: 20,
            marginLeft: 20,
            marginBottom: 20,
          }}>
          Chat_Goopt<span className="blinking-text">ㅣ</span>
          <Header />
        </div>
        {transitions((style, item, key) => (
          <animated.div
            key={key}
            style={{ ...style, height: "100%", marginTop: "3vh" }}>
            <Routes location={item}>
              <Route path="/" element={<MiniGameMain />} />
              <Route path="/gamemain" element={<GameMain />} />
              <Route path="/dicegame" element={<DiceGame />} />
              <Route path="/typegame" element={<TypingGame />} />
              <Route path="/fifagame" element={<FiFaGame />} />
              <Route path="/lolgame" element={<LoLGame />} />
              <Route path="/memorygame" element={<MemoryGame />} />
            </Routes>
          </animated.div>
        ))}
      </div>
      <div className="minigame_main">
        <div
          className="minigame_menu dice"
          onClick={() => handleMenuClick("/minigame/dicegame")}>
          DICE GAME
        </div>
        <div
          className="minigame_menu type"
          onClick={() => handleMenuClick("/minigame/typegame")}>
          TYPING GAME
        </div>
        <div
          className="minigame_menu fifa"
          onClick={() => handleMenuClick("/minigame/fifagame")}>
          FIFA GAME
        </div>
        <div
          className="minigame_menu lol"
          onClick={() => handleMenuClick("/minigame/lolgame")}>
          LOL GAME
        </div>
      </div>
    </Box>
  );
}

export default MiniGame;
