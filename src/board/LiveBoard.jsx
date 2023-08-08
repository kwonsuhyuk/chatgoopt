import React, { useEffect, useState } from "react";
import "../firebase";
import {
  child,
  get,
  getDatabase,
  onChildAdded,
  onValue,
  orderByChild,
  query,
  ref,
  startAt,
} from "firebase/database";
import BoardItem from "./BoardItem";
import { Box } from "@mui/material";

function LiveBoard() {
  const [isLoading, setIsLoading] = useState(false);
  const [boardList, setBoardList] = useState([]);

  useEffect(() => {
    async function getBoard() {
      const snapshot = await get(child(ref(getDatabase()), "board/"));
      const data = snapshot.val();

      if (data) {
        // 데이터가 있다면 배열 형태로 변환하여 boardList 상태에 설정
        const dataArray = Object.values(data);
        dataArray.reverse(); // 배열 역순으로 저장
        setBoardList(dataArray);
      }
    }

    getBoard();

    return () => {
      setBoardList([]);
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "3vh",
      }}>
      {boardList.length > 0 &&
        boardList.map((item) => (
          <BoardItem
            key={item.id}
            title={item.title}
            content={item.content}
            id={item.id}
            timestamp={item.timestamp}
            userinfo={item.user}
            images={item.images}
            notice={item.notice}
          />
        ))}
    </Box>
  );
}

export default LiveBoard;
