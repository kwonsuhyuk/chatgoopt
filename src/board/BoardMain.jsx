import { Box, Button, Checkbox } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import NewBoard from "./NewBoard";
import LiveBoard from "./LiveBoard";
import { child, get, getDatabase, ref } from "firebase/database";
import "../firebase";
import NoticeBoard from "./NoticeBoard";
import PopularBoard from "./PopularBoard";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";

function BoardMain() {
  const { theme, bg } = useSelector((state) => state);
  const [isLoading, setIsLoading] = useState(false);
  const [boardList, setBoardList] = useState([]);
  const [noticeBoardList, setNoticeBoardList] = useState([]);
  const [popularBoardList, setPopularBoardList] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("live"); // Default to live board

  const handleBoardChange = (boardType) => {
    setSelectedBoard(boardType);
  };

  const renderSelectedBoard = () => {
    switch (selectedBoard) {
      case "live":
        return (
          <>
            <NewBoard />
            <LiveBoard isLoading={isLoading} boardList={boardList} />
          </>
        );
      case "notice":
        return (
          <NoticeBoard isLoading={isLoading} boardList={noticeBoardList} />
        );
      case "popular":
        return (
          <PopularBoard isLoading={isLoading} boardList={popularBoardList} />
        );
      default:
        return null;
    }
  };
  const topRef = useRef(null);

  useEffect(() => {
    async function getBoard() {
      setIsLoading(true);
      const snapshot = await get(child(ref(getDatabase()), "board/"));
      const data = snapshot.val();
      if (data) {
        const dataArray = Object.values(data);

        const boardsWithNotice = dataArray.filter((item) => item.notice);
        const boardsWithoutNotice = dataArray.filter((item) => !item.notice);

        boardsWithNotice.reverse();
        boardsWithoutNotice.reverse();

        setNoticeBoardList(boardsWithNotice);
        setBoardList(boardsWithoutNotice);

        const popularBoards = dataArray
          .filter((item) => item?.likedUsers) // Only consider boards with liked users
          .sort((a, b) => {
            // If like counts are equal, sort by dislike counts in ascending order
            if (b.likedUsers?.length === a.likedUsers?.length) {
              return (
                (a.dislikedUsers?.length || 0) - (b.dislikedUsers?.length || 0)
              );
            }
            // Sort by liked users count in descending order
            return b.likedUsers?.length - a.likedUsers?.length;
          })
          .slice(0, 5); // Get top 5 popular boards

        setPopularBoardList(popularBoards);

        setIsLoading(false);
      }
    }

    getBoard();

    return () => {
      setBoardList([]);
      setNoticeBoardList([]);
    };
  }, []);

  const scrollToTop = () => {
    // Scroll to the top using the topRef
    topRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Box
        sx={{
          minHeight: "93vh",
          display: "flex",
          justifyContent: "center",
          gap: "3vw",
          "@media (max-width: 500px)": {
            // 휴대폰에서의 스타일 조정
            // 예: 폰트 사이즈 변경, 패딩 조정 등
            display: "flex",
            flexDirection: "column",
            padding: 0,
          },
        }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            height: "93vh",
            width: "50%",
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
            "@media (max-width: 1350px)": {
              width: "100%",
            },
            "@media (max-width: 500px)": {
              margin: 0,
              padding: 0,
            },
          }}>
          <Box
            ref={topRef}
            sx={{
              display: "flex",
              padding: "10px",
              justifyContent: "space-around",
              width: "100%",
            }}>
            <Button
              onClick={() => handleBoardChange("live")}
              sx={{
                width: "100%",
                borderRadius: 0,
                color: "white",
                fontSize: "18px",
                fontFamily: "Montserrat",
                borderRight: "1px solid #e9e9e9",
                "@media (max-width: 500px)": {
                  fontSize: "15px",
                },
              }}>
              전체게시판
            </Button>
            <Button
              onClick={() => handleBoardChange("notice")}
              sx={{
                width: "100%",
                borderRadius: 0,
                color: "white",
                fontSize: "18px",
                fontFamily: "Montserrat",
                borderRight: "1px solid #e9e9e9",
                "@media (max-width: 500px)": {
                  fontSize: "15px",
                },
              }}>
              공지게시판
            </Button>
            <Button
              onClick={() => handleBoardChange("popular")}
              sx={{
                width: "100%",
                borderRadius: 0,
                color: "white",
                fontSize: "18px",
                fontFamily: "Montserrat",
                "@media (max-width: 500px)": {
                  fontSize: "15px",
                },
              }}>
              인기게시판
            </Button>
          </Box>
          <button
            onClick={scrollToTop}
            style={{
              backgroundColor: "rgba(5,5,5,0.3)",
              boxShadow:
                "inset -3px -3px 10px rgba(0, 0, 0, 0.2), inset 5px 5px 10px rgba(0, 0, 0, 0.2)",
              position: "absolute",
              bottom: 0,
              right: 0,
              margin: "20px",
              fontSize: "35px",
              color: "white",
              borderRadius: "50%",
              border: "none",
              zIndex: 150,
            }}>
            <ArrowUpwardIcon />
          </button>
          <Box>{renderSelectedBoard()}</Box>
          {/* <LiveBoard isLoading={isLoading} boardList={boardList} /> */}
        </Box>
      </Box>
    </>
  );
}

export default BoardMain;
