import { Box, Button, Checkbox } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import NewBoard from "./NewBoard";
import LiveBoard from "./LiveBoard";
import { child, get, getDatabase, ref } from "firebase/database";
import "../firebase";
import NoticeBoard from "./NoticeBoard";
import PopularBoard from "./PopularBoard";

function BoardMain() {
  const { theme } = useSelector((state) => state);
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

  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

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
  const borderStyle =
    theme.mainColor === "whitesmoke" || theme.mainColor === "#fffacd"
      ? "2px solid gray"
      : "2px solid white";

  return (
    <>
      {!isMobile ? (
        <Box
          sx={{
            minHeight: "91vh",
            backgroundColor: `${theme.mainColor}`,
            padding: "5vh 20vw 0",
            display: "grid",
            gap: "3vw",
            gridTemplateColumns: "2fr 1fr",
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
            <NewBoard ref={topRef} />
            <LiveBoard isLoading={isLoading} boardList={boardList} />
          </Box>
          {/* 공지 게시물 부분 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "90vh",
              width: "100%",
              overflowY: "scroll",
              gap: "70px",
            }}>
            <Box>
              <NoticeBoard isLoading={isLoading} boardList={noticeBoardList} />
            </Box>
            {/* 인기 게시물 부분 */}
            <Box>
              <PopularBoard
                isLoading={isLoading}
                boardList={popularBoardList}
              />
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: "100vw",
            backgroundColor: `${theme.mainColor}`,
          }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-around",
              borderTop: borderStyle,
              borderBottom: borderStyle,
              margin: "2px",
              padding: "10px",
            }}>
            <Button
              onClick={() => handleBoardChange("live")}
              sx={{
                color:
                  theme.mainColor === "whitesmoke" ||
                  theme.mainColor === "#fffacd"
                    ? "gray"
                    : "white",
                boxShadow: "active"
                  ? `-5px -5px 10px ${theme.subColor}, 5px 5px 10px rgba(0, 0, 0, 0.3)`
                  : `inset -5px -5px 10px ${theme.subColor}, inset 5px 5px 10px rgba(0, 0, 0, 0.1)`,
                borderRadius: "10px",
              }}>
              전체게시판
            </Button>
            <Button
              onClick={() => handleBoardChange("notice")}
              sx={{
                color:
                  theme.mainColor === "whitesmoke" ||
                  theme.mainColor === "#fffacd"
                    ? "gray"
                    : "white",
                boxShadow: "active"
                  ? `-5px -5px 10px ${theme.subColor}, 5px 5px 10px rgba(0, 0, 0, 0.3)`
                  : `inset -5px -5px 10px ${theme.subColor}, inset 5px 5px 10px rgba(0, 0, 0, 0.1)`,
                borderRadius: "10px",
              }}>
              공지게시판
            </Button>
            <Button
              onClick={() => handleBoardChange("popular")}
              sx={{
                color:
                  theme.mainColor === "whitesmoke" ||
                  theme.mainColor === "#fffacd"
                    ? "gray"
                    : "white",
                boxShadow: "active"
                  ? `-5px -5px 10px ${theme.subColor}, 5px 5px 10px rgba(0, 0, 0, 0.3)`
                  : `inset -5px -5px 10px ${theme.subColor}, inset 5px 5px 10px rgba(0, 0, 0, 0.1)`,
                borderRadius: "10px",
              }}>
              인기게시판
            </Button>
          </Box>
          <Box
            sx={{
              minHeight: "85vh",
              maxWidth: "93vw",
              display: "flex",
              flexDirection: "column",
              marginLeft: "2vw",
            }}>
            {renderSelectedBoard()}
          </Box>
        </Box>
      )}
    </>
  );
}

export default BoardMain;
