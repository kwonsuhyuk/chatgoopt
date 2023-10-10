import React, { useRef } from "react";
import { Box } from "@mui/material";
import { Route, Routes, useLocation, useNavigate } from "react-router";
import DiceGame from "../minigame/DiceGame";
import TypingGame from "../minigame/TypingGame";
import { useSelector } from "react-redux";
import FiFaGame from "../minigame/FiFaGame";
import LoLGame from "../minigame/LoLGame";
import MiniGameMain from "../minigame/MiniGameMain";
import "./MiniGame.css";
import { useTransition, animated } from "react-spring";
import Header from "../components/Header";
import SpaceGame from "../minigame/SpaceGame";
import TimeGame from "../minigame/TimeGame";
import ReactionGame from "../minigame/ReactionSpeedGame";
function MiniGame() {
  const { bg } = useSelector((state) => state);
  const location = useLocation();
  const navigate = useNavigate();
  const gameRef = useRef(null);

  const transitions = useTransition(location, {
    from: { opacity: 0, transform: "translate3d(100%,0px,0px)" },
    enter: { opacity: 1, transform: "translate3d(0%,0px,0px)" },
    leave: { opacity: 0, transform: "translate3d(-50%,0px,0px)" },
  });

  const handleMenuClick = (path) => {
    navigate(path); // 라우팅 경로를 변경하여 페이지 전환
    scrollToTop(); // 스크롤을 게임 컨텐츠로 이동
  };
  const scrollToTop = () => {
    // Scroll to the top using the topRef
    gameRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%", // 이 줄을 추가합니다.
        height: "100vh",
        overflow: "auto",
        backgroundImage: `url(${bg.bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "fixed",
        backgroundSize: "cover",

        // "@media (max-width: 500px)": {
        //   // 휴대폰에서의 스타일 조정
        //   display: "flex",
        //   flexDirection: "column",
        // },
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          ref={gameRef}
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
          }}
        >
          Chat_Goopt<span className="blinking-text">ㅣ</span>
          <Header />
        </div>
        <div className="minigame_main">
          <div
            className="minigame_menu dice"
            onClick={() => handleMenuClick("/minigame/dicegame")}
          >
            DICE GAME
          </div>
          <div
            className="minigame_menu type"
            onClick={() => handleMenuClick("/minigame/typegame")}
          >
            TYPING GAME
          </div>
          <div
            className="minigame_menu fifa"
            onClick={() => handleMenuClick("/minigame/fifagame")}
          >
            FIFA GAME
          </div>
          <div
            className="minigame_menu lol"
            onClick={() => handleMenuClick("/minigame/lolgame")}
          >
            LOL GAME
          </div>
          <div
            className="minigame_menu space"
            onClick={() => handleMenuClick("/minigame/spacegame")}
          >
            SPACE GAME
          </div>
          <div
            className="minigame_menu time"
            onClick={() => handleMenuClick("/minigame/timegame")}
          >
            GUESS GAME
          </div>
          <div
            className="minigame_menu reaction"
            onClick={() => handleMenuClick("/minigame/reactionspeedgame")}
          >
            REACTION GAME
          </div>
        </div>
        {transitions((style, item, key) => (
          <animated.div
            key={key}
            style={{
              ...style,
              height: "100%",
              marginTop: "3vh",
              maxWidth: "100%",
              marginLeft: 20,
              marginRight: 20,
            }}
          >
            <Routes location={item}>
              <Route path="/" element={<MiniGameMain />} />
              {/* <Route path="/gamemain" element={<GameMain />} /> */}
              <Route path="/dicegame" element={<DiceGame />} />
              <Route path="/typegame" element={<TypingGame />} />
              <Route path="/fifagame" element={<FiFaGame />} />
              <Route path="/lolgame" element={<LoLGame />} />
              <Route path="/spacegame" element={<SpaceGame />} />
              <Route path="/timegame" element={<TimeGame />} />
              <Route path="/reactionspeedgame" element={<ReactionGame />} />
            </Routes>
          </animated.div>
        ))}
      </div>
    </Box>
  );
}

export default MiniGame;
