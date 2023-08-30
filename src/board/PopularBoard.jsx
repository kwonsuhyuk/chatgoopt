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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "3vh",
        }}>
        {isloading ? (
          <CircularProgress />
        ) : (
          boardList && (
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
                <Typography
                  sx={{
                    fontSize: "20px",
                    textAlign: "center",
                    padding: "15px 0 ",
                    backgroundColor: "whitesmoke",
                  }}>
                  인기게시물
                </Typography>
                <Divider />
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
                      <Divider />
                    </>
                  ) : (
                    <div>error</div>
                  )
                )}
              </List>
            </>
          )
        )}
      </Box>
    </>
  );
}

export default PopularBoard;
