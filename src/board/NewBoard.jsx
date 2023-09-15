import { Avatar, Box, ListItemAvatar, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";

function NewBoard() {
  const { theme, user } = useSelector((state) => state);
  const navigate = useNavigate();

  const borderStyle = "2px solid white";

  const handleWrite = () => {
    navigate("/board/writingboard");
  };

  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

  return (
    <Box
      onClick={handleWrite}
      sx={{
        borderBottom: borderStyle,
        cursor: "pointer",
        display: "flex",
        gap: "30px",
        alignItems: "center",
        height: "80px",
        paddingBottom: "1.5vh",
        marginBottom: "1.5vh",
      }}>
      <ListItemAvatar>
        <Avatar
          sx={{ marginLeft: "10px" }}
          alt="profileImage"
          src={user?.currentUser.photoURL}
        />
      </ListItemAvatar>
      <Typography
        sx={{
          opacity: "0.9",
          padding: "10px",
          border: borderStyle,
          width: isMobile ? "75%" : "50%",
          borderRadius: "20px",
          color: "white",
          fontFamily: "Montserrat",
        }}>
        새로운 게시물을 작성해주세요.
      </Typography>
    </Box>
  );
}

export default NewBoard;
