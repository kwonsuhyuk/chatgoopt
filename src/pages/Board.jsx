import React from "react";
import { Route, Routes } from "react-router";
import BoardMain from "../board/BoardMain";
import WritingBoard from "../board/WritingBoard";
import BoardDetail from "../board/BoardDetail";

function Board() {
  return (
    <Routes>
      <Route path="/" element={<BoardMain />} />
      <Route path="/writingboard" element={<WritingBoard />} />
      <Route path="/:id" element={<BoardDetail />} />
    </Routes>
  );
}

export default Board;
