import React from "react";
import { Route, Routes } from "react-router";
import BoardMain from "../board/BoardMain";
import WritingBoard from "../board/WritingBoard";
import BoardDetail from "../board/BoardDetail";
import { useSelector } from "react-redux";
import Header from "../components/Header";
import { Box } from "@mui/material";

function Board() {
  const { bg } = useSelector((state) => state);
  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정
  return (
    <Box
      sx={{
        backgroundImage: `url(${bg.bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "fixed",
        backgroundSize: "cover",
      }}>
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
      <Routes>
        <Route path="/" element={<BoardMain />} />
        <Route path="/writingboard" element={<WritingBoard />} />
        <Route path="/:id" element={<BoardDetail />} />
      </Routes>
    </Box>
  );
}

export default Board;
