import { Avatar, Box, ListItemAvatar, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useHistory, useNavigate } from "react-router";

function NewBoard() {
  const { theme, user } = useSelector((state) => state);
  const navigate = useNavigate();

  const borderStyle =
    theme.mainColor === "whitesmoke" || theme.mainColor === "#fffacd"
      ? "2px solid gray"
      : "2px solid white";

  const handleWrite = () => {
    navigate("/board/writingboard");
  };

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
          opacity: "0.7",
          padding: "10px",
          border: borderStyle,
          width: "50%",
          borderRadius: "20px",
          color:
            theme.mainColor === "whitesmoke" || theme.mainColor === "#fffacd"
              ? "gray"
              : "white",
        }}>
        새로운 게시물을 작성해주세요
      </Typography>
    </Box>
  );
}

export default NewBoard;
