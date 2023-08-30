import { Avatar, Box, ListItem } from "@mui/material";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { getDatabase, onValue, ref, remove, update } from "firebase/database";
import "../firebase";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";

function Comment({ boardId, id, userinfo, comment, timestamp }) {
  const { user } = useSelector((state) => state);
  const [likedUsers, setLikedUsers] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const isLiked = likedUsers.includes(user.currentUser.uid);

  useEffect(() => {
    const database = getDatabase();
    const commentRef = ref(database, `board/${boardId}/comments/${id}`);

    onValue(commentRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLikedUsers(data.likedUsers || []);
        setLikeCount(data.likesCount || 0); // 좋아요 수 업데이트
      }
    });
  }, [id, boardId]);

  const updateLikes = (newLikedUsers, newLikesCount) => {
    const database = getDatabase();
    update(ref(database, `board/${boardId}/comments/${id}`), {
      likedUsers: newLikedUsers,
      likesCount: newLikesCount, // 업데이트된 좋아요 수
    });
  };

  const handleLike = () => {
    if (likedUsers.includes(user.currentUser.uid)) {
      // 이미 좋아요를 누른 경우
      const newLikedUsers = likedUsers.filter(
        (uid) => uid !== user.currentUser.uid
      );
      setLikedUsers(newLikedUsers);

      // 좋아요 수를 업데이트하여 업데이트 함수 호출
      const newLikesCount = likeCount - 1;
      updateLikes(newLikedUsers, newLikesCount);
    } else {
      // 좋아요를 처음 누른 경우
      const newLikedUsers = [...likedUsers, user.currentUser.uid];
      setLikedUsers(newLikedUsers);

      // 좋아요 수를 업데이트하여 업데이트 함수 호출
      const newLikesCount = likeCount + 1;
      updateLikes(newLikedUsers, newLikesCount);
    }
  };

  const handleDelete = () => {
    const database = getDatabase();
    remove(ref(database, `board/${boardId}/comments/${id}`));
  };

  return (
    <ListItem
      sx={{
        height: "7vh",
        position: "relative",
      }}>
      <Avatar
        variant="rounded"
        sx={{ width: 30, height: 30, marginRight: 1 }}
        alt="profile image"
        src={userinfo.avatar}
      />
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", width: "100%", marginRight: "10px" }}>
          <p
            style={{
              fontSize: "15px",
              color: "green",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              marginRight: "2px",
            }}>
            {userinfo.name}
          </p>
          <p style={{ fontSize: "15px", fontWeight: "300", color: "black" }}>
            {comment.split(" ").map((word, index) => {
              if (word.startsWith("@")) {
                return (
                  <span key={index}>
                    <span style={{ color: "#71A4D9" }}>{word}</span>{" "}
                  </span>
                );
              }
              return <span key={index}>{word} </span>;
            })}
          </p>
        </Box>
        <Box sx={{ fontSize: "12px", color: "gray" }}>
          <span>{dayjs(timestamp).fromNow()}</span>
          <span style={{ marginLeft: "20px" }}>좋아요 {likeCount}개</span>
        </Box>
      </Box>
      {user.currentUser.uid === userinfo.id && (
        <DeleteIcon
          sx={{
            width: "20px",
            height: "20px",
            position: "absolute",
            color: isLiked ? "red" : "black",
            top: 0,
            bottom: 0,
            right: "30px",
            margin: "auto 0",
          }}
          onClick={handleDelete}
        />
      )}
      <FavoriteIcon
        onClick={handleLike}
        sx={{
          width: "20px",
          height: "20px",
          position: "absolute",
          color: isLiked ? "red" : "black",
          top: 0,
          bottom: 0,
          right: 0,
          margin: "auto 0",
        }}
      />
    </ListItem>
  );
}

export default Comment;
