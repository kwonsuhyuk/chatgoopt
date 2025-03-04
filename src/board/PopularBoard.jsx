import {
  Box,
  CircularProgress,
  Divider,
  List,
  Typography,
} from "@mui/material";
import React from "react";
import PopularBoardItem from "./PopularBoardItem";
import useLazyImageLoading from "../useLazyImageLoading";

function PopularBoard({ isloading, boardList }) {
  const getItemRef = useLazyImageLoading(boardList);

  return (
    <>
      {isloading ? (
        <CircularProgress />
      ) : (
        boardList && (
          <>
            <List
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                width: "100%",
                backgroundColor: "rgba(5,5,5,0.3)",
                boxShadow:
                  "inset -3px -3px 10px rgba(0, 0, 0, 0.2), inset 5px 5px 10px rgba(0, 0, 0, 0.2)",
                borderRadius: "10px",
                height: "80vh",
                "@media (max-width: 500px)": {
                  // 휴대폰에서의 스타일 조정
                  maxWidth: 370,
                },
              }}>
              {boardList?.map((item, index) =>
                item.id ? (
                  <>
                    <PopularBoardItem
                      index={index + 1}
                      key={item.id}
                      title={item.title}
                      content={item.content}
                      id={item.id}
                      timestamp={item.timestamp}
                      userinfo={item.user}
                      images={item.images}
                      notice={item.notice}
                      imageRef={getItemRef(item.id)} // 커스텀 훅을 사용하여 ref 얻기
                    />
                  </>
                ) : (
                  <div>error</div>
                )
              )}
            </List>
          </>
        )
      )}
    </>
  );
}

export default PopularBoard;
