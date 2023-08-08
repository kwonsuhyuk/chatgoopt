import { Avatar, Box, ListItemText, Typography } from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { getDatabase, onValue, ref, update } from "firebase/database";
import "../firebase";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

function BoardItem({
  id,
  title,
  content,
  images,
  userinfo,
  timestamp,
  notice,
}) {
  const { user, theme } = useSelector((state) => state);

  const [likedUsers, setLikedUsers] = useState([]);
  const [dislikedUsers, setDislikedUsers] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const isLiked = likedUsers.includes(user.currentUser.uid);
  const isDisliked = dislikedUsers.includes(user.currentUser.uid);

  const handleLike = () => {
    // 이미 좋아요를 누른 경우
    if (likedUsers.includes(user.currentUser.uid)) {
      const newLikedUsers = likedUsers.filter(
        (uid) => uid !== user.currentUser.uid
      );
      setLikedUsers(newLikedUsers);
      updateLikesDislikes(newLikedUsers, dislikedUsers);
    } else {
      const newLikedUsers = [...likedUsers, user.currentUser.uid];
      setLikedUsers(newLikedUsers);
      updateLikesDislikes(newLikedUsers, dislikedUsers);
    }
  };

  const handleDislike = () => {
    // 이미 싫어요를 누른 경우
    if (dislikedUsers.includes(user.currentUser.uid)) {
      const newDislikedUsers = dislikedUsers.filter(
        (uid) => uid !== user.currentUser.uid
      );
      setDislikedUsers(newDislikedUsers);
      updateLikesDislikes(likedUsers, newDislikedUsers);
    } else {
      const newDislikedUsers = [...dislikedUsers, user.currentUser.uid];
      setDislikedUsers(newDislikedUsers);
      updateLikesDislikes(likedUsers, newDislikedUsers);
    }
  };

  const updateLikesDislikes = (newLikedUsers, newDislikedUsers) => {
    const database = getDatabase();
    update(ref(database, `board/${id}`), {
      likedUsers: newLikedUsers,
      dislikedUsers: newDislikedUsers,
    });
  };
  const borderStyle =
    theme.mainColor === "whitesmoke" || theme.mainColor === "#fffacd"
      ? "2px solid gray"
      : "2px solid white";

  useEffect(() => {
    // 게시물 정보 가져오기 및 실시간 갯수 업데이트
    const database = getDatabase();
    const boardRef = ref(database, `board/${id}`);

    onValue(boardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLikedUsers(data.likedUsers || []);
        setDislikedUsers(data.dislikedUsers || []);
        setLikeCount(data.likedUsers ? data.likedUsers.length : 0);
        setDislikeCount(data.dislikedUsers ? data.dislikedUsers.length : 0);
      }
    });
  }, [id]);

  return (
    <Box
      sx={{
        backgroundColor: `${theme.subColor}`,
        width: "100%",
        height: "77vh",
        border: borderStyle,
      }}>
      <Box
        sx={{
          display: "flex",
          gap: "1vw",
          marginLeft: "1rem",
          marginTop: "1rem",
        }}>
        <Avatar
          variant="rounded"
          sx={{ width: 35, height: 35 }}
          alt="profile image"
          src={userinfo.avatar}
        />
        <ListItemText
          sx={{
            display: "flex",
          }}
          primary={userinfo.name}
          primaryTypographyProps={{
            fontWeight: "bold",
            color:
              userinfo.id === user.currentUser.uid
                ? "green"
                : theme.mainColor === "whitesmoke" ||
                  theme.mainColor === "#fffacd"
                ? "black"
                : "white",
          }}
          secondary={dayjs(timestamp).fromNow()}
          secondaryTypographyProps={{
            ml: 1,
          }}
        />
      </Box>
      <Box
        sx={{
          margin: "1vh 0",
        }}>
        <Carousel
          autoPlay={true}
          infiniteLoop={true}
          showThumbs={false}
          interval={5000}>
          {images?.map((media, index) => {
            const isVideo = media.includes(".mp4"); // URL에 .mp4 포함 여부 확인

            return (
              <div key={index}>
                {isVideo ? (
                  <video
                    controls
                    style={{ width: "20vw", height: "50vh" }}
                    src={media}
                    alt={`Slide ${index + 1}`}
                  />
                ) : (
                  <img
                    src={media}
                    alt={`Slide ${index + 1}`}
                    style={{ width: "20vw", height: "50vh" }}
                  />
                )}
              </div>
            );
          })}
        </Carousel>
      </Box>
      <Box
        sx={{
          display: "flex",
          marginLeft: "1rem",
          marginBottom: "1rem",
          color:
            theme.mainColor === "whitesmoke" || theme.mainColor === "#fffacd"
              ? "gray"
              : "white",
        }}>
        <span onClick={handleLike}>
          {isLiked ? (
            <ThumbUpIcon sx={{ cursor: "pointer" }} />
          ) : (
            <ThumbUpOffAltIcon sx={{ cursor: "pointer" }} />
          )}
          {likeCount}
        </span>
        <span onClick={handleDislike}>
          {isDisliked ? (
            <ThumbDownIcon sx={{ cursor: "pointer" }} />
          ) : (
            <ThumbDownOffAltIcon sx={{ cursor: "pointer" }} />
          )}
          {dislikeCount}
        </span>
      </Box>
      {/* <Box>좋아요 싫어요 누른 횟수 가져오기</Box> */}
      <Box
        sx={{
          width: "100%",
          height: "2vh",
          overflow: "hidden",
          marginLeft: "1rem",
          marginBottom: "2rem",
          color:
            theme.mainColor === "whitesmoke" || theme.mainColor === "#fffacd"
              ? "black"
              : "white",
        }}>
        {title}
      </Box>
      <Box
        sx={{
          width: "90%",
          whiteSpace: "nowrap", // 텍스트가 영역을 넘어가도 줄 바꿈하지 않고 유지
          overflow: "hidden", // 넘치는 부분을 감춤
          textOverflow: "ellipsis",
          height: "5.3vh",
          marginLeft: "1rem",
          color:
            theme.mainColor === "whitesmoke" || theme.mainColor === "#fffacd"
              ? "gray"
              : "whitesmoke",
        }}>
        {content}
      </Box>
    </Box>
  );
}

export default BoardItem;
