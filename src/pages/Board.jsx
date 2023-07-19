import React from "react";
import "./Board.css";

function Board() {
  return (
    <>
      <div
        style={{
          backgroundColor: "#558BCF",
          display: "flex",
        }}>
        {/* <div>
          <img src="/boardimg.jpeg" alt="qwe" className="board_img" />
        </div> */}
        <div style={{ color: "white", fontSize: "100px" }}>
          <h1>Board 개발진 구합니다 </h1>
          <h3>자격요건 : 타이핑할줄 아는사람</h3>
          <h5>01076285327 연락주세요</h5>
        </div>
      </div>
    </>
  );
}

export default Board;
