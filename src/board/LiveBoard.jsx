import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Box, Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import BoardItem from "./BoardItem";
import useLazyImageLoading from "../useLazyImageLoading";

function LiveBoard({ isLoading, boardList }) {
  const { user } = useSelector((state) => state);
  const [showMyPosts, setShowMyPosts] = useState(false);

  const getItemRef = useLazyImageLoading(boardList);

  const toggleMyPosts = () => {
    setShowMyPosts(!showMyPosts);
  };

  return (
    <Box
      sx={{
        backgroundColor: "rgba(5,5,5,0.3)",
        boxShadow:
          "inset -3px -3px 10px rgba(0, 0, 0, 0.2), inset 5px 5px 10px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        gap: "3vh",
        borderRadius: "10px",
        padding: "0 2vw",
      }}>
      <FormGroup>
        <FormControlLabel
          sx={{ color: "white", margin: "20px 0 " }}
          control={
            <Checkbox
              sx={{ color: "white" }}
              value={showMyPosts}
              onClick={toggleMyPosts}
              color="success"
            />
          }
          label="내 게시물 보기"
        />
      </FormGroup>
      {isLoading ? (
        <CircularProgress sx={{ color: "white" }} />
      ) : (
        boardList?.map((item) => {
          if (!item.id) return null;

          const isCurrentUserPost = item.user.id === user.currentUser.uid;
          if (showMyPosts && !isCurrentUserPost) return null;

          return (
            <BoardItem
              key={item.id}
              title={item.title}
              content={item.content}
              id={item.id}
              timestamp={item.timestamp}
              userinfo={item.user}
              images={item.images}
              notice={item.notice}
              youtubeLink={item.youtubeLink}
              imageRef={getItemRef(item.id)} // 커스텀 훅을 사용하여 ref 얻기
            />
          );
        })
      )}
    </Box>
  );
}

export default LiveBoard;
