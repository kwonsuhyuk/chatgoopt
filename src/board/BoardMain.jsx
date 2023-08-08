import { Box } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import NewBoard from "./NewBoard";
import LiveBoard from "./LiveBoard";

function BoardMain() {
  const { theme } = useSelector((state) => state);
  return (
    <Box
      sx={{
        minHeight: "91vh",
        backgroundColor: `${theme.mainColor}`,
        padding: "5vh 20vw 0",
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        "@media (max-width: 500px)": {
          // 휴대폰에서의 스타일 조정
          display: "flex",
          padding: "2vh 30px",
          flexDirection: "column",
        },
      }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "90vh",
          width: "100%",
          overflowY: "scroll",
          marginRight: "-20px", // 보더를 고려하여 마진을 조정
          paddingRight: "20px", // 보더를 고려하여 패딩을 추가
          // 웹킷 브라우저에서 스크롤바 숨기기
          "&::-webkit-scrollbar": {
            width: "0.5em",
            display: "none", // 스크롤바 숨김
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0,0,0,0)", // 스크롤바 썸네일 색상을 투명하게 설정
          },
        }}>
        <NewBoard />
        <LiveBoard />
      </Box>
      <Box
        sx={{
          "@media (max-width: 500px)": {
            // 휴대폰에서의 스타일 조정
            display: "flex",
            padding: "2vh 30px",
            flexDirection: "column",
          },
        }}>
        hi
      </Box>
      {/* <BoardMenu /> */}
    </Box>
  );
}

export default BoardMain;
