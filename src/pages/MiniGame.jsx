import React, { useEffect, useState } from "react";
import "./MiniGame.css";
import { Box } from "@mui/material";
import GameMenu from "../minigame/GameMenu";
import { Route, Routes } from "react-router";
import DiceGame from "../minigame/DiceGame";
import TypingGame from "../minigame/TypingGame";
import { useSelector } from "react-redux";

function MiniGame() {
  const { theme } = useSelector((state) => state);
  return (
    <Box
      sx={{
        display: "flex",
        width: "100vw",
        height: "90vh",
        backgroundColor: `${theme.mainColor}`,
        padding: "20px 20px 0",
      }}>
      <GameMenu />
      <Routes>
        {/* 주사위 굴리기 게임 페이지 */}
        <Route path="/" element={<DiceGame />} />
        <Route path="/typegame" element={<TypingGame />} />
      </Routes>
    </Box>
  );
}

export default MiniGame;
// const [sliderValue, setSliderValue] = useState(0);

// const handleSliderChange = (event) => {
//   const { value } = event.target;
//   setSliderValue(value);
// };
// <div className="App">
//   <h1>타이핑 웍스</h1>
//   <div
//     className="typing-container"
//     style={{
//       filter: `invert(${sliderValue})`,
//     }}></div>
//   <input
//     type="range"
//     min="0"
//     max="1"
//     step="0.01"
//     value={sliderValue}
//     onChange={handleSliderChange}
//   />
// </div>
