import { CircularProgress, Divider, List } from "@mui/material";
import React from "react";
import NoticeBoardItem from "./NoticeBoardItem";

function NoticeBoard({ isLoading, boardList }) {
  return (
    <>
      {isLoading ? (
        <CircularProgress />
      ) : (
        boardList?.length > 0 && (
          <>
            <List
              sx={{
                width: "100%",
                maxWidth: 280,
                backgroundColor: "rgba(5,5,5,0.3)",
                boxShadow:
                  "inset -3px -3px 10px rgba(0, 0, 0, 0.2), inset 5px 5px 10px rgba(0, 0, 0, 0.2)",
                borderRadius: "10px",
                "@media (max-width: 500px)": {
                  // 휴대폰에서의 스타일 조정
                  maxWidth: 370,
                },
              }}>
              {boardList?.map((notice) => (
                <>
                  <NoticeBoardItem notice={notice} key={notice.timestamp} />
                  <Divider />
                </>
              ))}
            </List>
          </>
        )
      )}
    </>
  );
}

export default NoticeBoard;
