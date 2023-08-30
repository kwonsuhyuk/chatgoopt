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
                bgcolor: "whitesmoke",
                borderRadius: "10px",
                border: "1px solid gray",
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
