import React from "react";

function Board() {
  return (
    <>
      <div
        style={{
          backgroundColor: "blue",
          width: "100vw",
          height: "100vh",
          display: "flex",
        }}>
        <div>
          <img src="/boardimg.jpeg" alt="qwe" />
        </div>
        <div style={{ color: "white", fontSize: "100px" }}>준비중입니다</div>
      </div>
    </>
  );
}

export default Board;
