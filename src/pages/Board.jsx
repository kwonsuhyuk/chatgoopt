import { Box } from "@mui/material";
import React from "react";
import { Route, Routes } from "react-router";
import BoardMain from "../board/BoardMain";
import WritingBoard from "../board/WritingBoard";

function Board() {
  return (
    <Routes>
      <Route path="/" element={<BoardMain />} />
      <Route path="/writingboard" element={<WritingBoard />} />
    </Routes>
  );
}

export default Board;
