import {
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Divider,
  Input,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { Suspense, useEffect, useState } from "react";
import Comment from "./Comment";
import "../firebase";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import {
  get,
  getDatabase,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import YouTube from "react-youtube";

function PopularBoardItem({
  id,
  title,
  content,
  images,
  userinfo,
  timestamp,
  youtubeLink,
  index,
}) {
  const { user, theme } = useSelector((state) => state);
  const [likedUsers, setLikedUsers] = useState([]);
  const [dislikedUsers, setDislikedUsers] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const isLiked = likedUsers.includes(user.currentUser.uid);
  const isDisliked = dislikedUsers.includes(user.currentUser.uid);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentList, setCommentList] = useState([]);
  const [comment, setComment] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [tagUser, setTagUser] = useState("");

  const handleClose = () => {
    setCommentOpen(false);
  };

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

  // 유튜브 링크 잇을키 키뽑기
  const videoKey = youtubeLink?.split("shorts/")[1];

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
  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

  useEffect(() => {
    if (id !== "undefined") {
      const commentsRef = ref(getDatabase(), `board/${id}/comments`);
      let unsubscribe;

      // commentsRef에서 값 변경을 청취
      if (commentsRef) {
        unsubscribe = onValue(commentsRef, (snapshot) => {
          const commentsData = snapshot.val();

          if (commentsData) {
            // 댓글 개체를 배열로 변환
            const commentsArray = Object.values(commentsData);

            // 좋아요 수를 기준으로 배열을 내림차순으로 정렬
            const sortedComments = commentsArray.sort(
              (a, b) => (b.likesCount || 0) - (a.likesCount || 0)
            );

            setCommentList(sortedComments);
          }
        });
      }

      return () => {
        // 컴포넌트가 언마운트될 때 리스너 정리
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, [id]);

  const handleOpenComment = () => {
    setCommentOpen(true);
  };

  const updateLikesDislikes = (newLikedUsers, newDislikedUsers) => {
    const database = getDatabase();
    update(ref(database, `board/${id}`), {
      likedUsers: newLikedUsers,
      dislikedUsers: newDislikedUsers,
    });
  };

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

  const handleBackdropClick = (event) => {
    // 이벤트의 target이 백드롭 컨텐츠인 경우에만 닫기
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    try {
      const dbRef = ref(getDatabase(), `board/${id}/comments`);
      const newPostRef = push(dbRef);
      const key = newPostRef.key; // 생성된 키를 가져옴

      const formData = {
        id: key, // 생성된 키를 데이터에 포함
        user: {
          id: user.currentUser.uid,
          name: user.currentUser.displayName,
          avatar: user.currentUser.photoURL,
        },
        comment: comment,
        timestamp: serverTimestamp(),
      };
      // 폼 데이터를 Firebase 실시간 데이터베이스에 저장
      if (comment.trim() !== "") {
        await set(newPostRef, formData); // 생성된 키를 경로로 사용
        if (userinfo.id !== user.currentUser.uid) {
          const alarmRef = ref(getDatabase(), `users/${userinfo.id}/alarms`);
          const newAlarmRef = push(alarmRef);
          const alarmKey = newAlarmRef.key;

          const alarmData = {
            id: alarmKey,
            type: "comment",
            boardId: id,
            title: title,
            username: user.currentUser.displayName,
            timestamp: serverTimestamp(),
          };
          await set(newAlarmRef, alarmData);
        }
        if (tagUser) {
          const tagAlarmRef = ref(getDatabase(), `users/${tagUser.id}/alarms`);
          const newTagAlarmRef = push(tagAlarmRef);
          const tagAlarmKey = newTagAlarmRef.key;

          const tagAlarmData = {
            id: tagAlarmKey,
            type: "tag",
            boardId: id,
            title: title,
            username: user.currentUser.displayName,
            timestamp: serverTimestamp(),
          };
          await set(newTagAlarmRef, tagAlarmData);
        }
      }
    } catch (error) {
      console.error("폼 데이터 제출 중 오류가 발생하였습니다:", error);
    } finally {
      setComment("");
    }
  };
  // Modify the getUsersList function to return an array of user objects
  const getUsersList = async () => {
    const db = getDatabase();
    const usersRef = ref(db, "users/");
    const snapshot = await get(usersRef);
    const usersList = [];

    if (snapshot.exists()) {
      snapshot.forEach((userSnapshot) => {
        const userData = userSnapshot.val();
        usersList.push(userData); // Push user object
      });
    }

    return usersList;
  };

  // In the handleCommentChange function, filter user objects based on name
  const handleCommentChange = async (event) => {
    const newComment = event.target.value;
    setComment(newComment);

    if (newComment.includes("@")) {
      const usersList = await getUsersList(); // Await getUsersList function

      const mentionedUserPrefix = newComment.split("@")[1].toLowerCase();

      const filteredOptions = usersList.filter(
        (userinfo) =>
          userinfo.name !== user.currentUser.name &&
          userinfo.name.indexOf(mentionedUserPrefix) === 0
      );

      setAutocompleteOptions(filteredOptions);
      setShowAutocomplete(true);
    } else {
      setShowAutocomplete(false);
      setAutocompleteOptions([]);
    }
  };

  const handleAutocompleteSelect = (user) => {
    setTagUser(user);
    const prefix = comment.split("@")[0];
    const newComment = `${prefix}@${user.name} `;

    setComment(newComment);
    setShowAutocomplete(false);
    setAutocompleteOptions([]);
  };

  return (
    <>
      <Box sx={{ display: "flex", position: "relative", width: "100%" }}>
        <Box
          onClick={handleOpenComment}
          sx={{
            paddingLeft: "10px",
            fontSize: index === 1 ? "30px" : "20px",
            color: index === 1 ? "lime" : "white",
            fontFamily: "Montserrat",
            fontWeight: 700,
          }}>
          {index}
        </Box>
        <ListItem
          alignItems="flex-start"
          sx={{
            display: "block",
            width: "100%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer",
          }}>
          <Box sx={{ display: "flex", flex: 1 }} onClick={handleOpenComment}>
            <Avatar
              onClick={handleOpenComment}
              variant="rounded"
              sx={{ width: 25, height: 25 }}
              alt="profile image"
              src={userinfo?.avatar}
            />
            <ListItemText
              onClick={handleOpenComment}
              sx={{
                display: "flex",
              }}
              primary={userinfo?.name}
              primaryTypographyProps={{
                fontFamily: "Montserrat",
                fontWeight: 700,
                color: userinfo.id === user.currentUser.uid ? "lime" : "white",
              }}
            />
          </Box>
          <Box sx={{ display: "block" }}>
            <ListItemText
              onClick={handleOpenComment}
              sx={{ width: "100%", flex: 1 }}
              primary={
                <Typography
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    fontFamily: "Montserrat",
                  }}
                  variant="body1"
                  color="white">
                  {title}
                </Typography>
              }
              secondary={
                <Typography
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    fontFamily: "Montserrat",
                    fontWeight: 400,
                  }}
                  variant="body2"
                  color="whitesmoke">
                  {content}
                </Typography>
              }
            />
            <Box
              onClick={handleOpenComment}
              sx={{
                fontSize: "15px",
                color: "white",
                position: "absolute",
                bottom: 0,
                right: 0,
              }}>
              <ThumbUpIcon
                sx={{ cursor: "pointer", fontSize: "15px", color: "white" }}
              />
              {likeCount}
              <ThumbDownIcon
                sx={{ cursor: "pointer", fontSize: "15px", color: "white" }}
              />
              {dislikeCount}
            </Box>
          </Box>

          {/* 백드롭 */}
          {!isMobile ? (
            <Backdrop
              sx={{
                color: "#fff",
                zIndex: (theme) => theme.zIndex.drawer + 1,
              }}
              open={commentOpen}
              onClick={handleBackdropClick}>
              <Box
                sx={{
                  width: "70vw",
                  height: "95vh",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  display: "grid",
                  gridTemplateColumns: "5fr 4fr",
                }}>
                <Box
                  sx={{
                    borderRight: "1px solid #e9e9e9",
                  }}>
                  {!youtubeLink ? (
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
                              <Suspense
                                fallback={
                                  <div>
                                    <CircularProgress />
                                  </div>
                                }>
                                <video
                                  controls
                                  className="backdropimg"
                                  style={{ width: "100%", height: "95vh" }}
                                  src={media}
                                  alt={`Slide ${index + 1}`}
                                />
                              </Suspense>
                            ) : (
                              <Suspense
                                fallback={
                                  <div>
                                    <CircularProgress />
                                  </div>
                                }>
                                <img
                                  className="backdropimg"
                                  src={media}
                                  alt={`Slide ${index + 1}`}
                                  style={{ width: "100%", height: "95vh" }}
                                />
                              </Suspense>
                            )}
                          </div>
                        );
                      })}
                    </Carousel>
                  ) : (
                    <YouTube
                      videoId={videoKey}
                      opts={{
                        width: "100%",
                        height: "870",
                        playerVars: {
                          autoplay: 0,
                          rel: 0,
                        },
                      }}
                      //이벤트 리스너
                      onEnd={(e) => {
                        e.target.stopVideo(0);
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "1vw",
                      marginLeft: "1rem",
                      marginTop: "1rem",
                      marginBottom: "3rem",
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
                        color: "black",
                      }}
                      secondary={dayjs(timestamp).fromNow()}
                      secondaryTypographyProps={{
                        ml: 1,
                        color: "gray",
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      height: "2vh",
                      marginLeft: "1rem",
                      marginBottom: "2rem",
                      color: "black",
                    }}>
                    {title}
                  </Box>
                  <Box
                    sx={{
                      width: "90%",
                      marginLeft: "1rem",
                      marginBottom: "2rem",
                      overflow: "hidden", // 넘치는 부분을 감춤
                      color: "gray",
                    }}>
                    {content}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      marginLeft: "1rem",
                      marginBottom: "1rem",
                      color: "black",
                    }}>
                    <span onClick={handleLike}>
                      {isLiked ? (
                        <ThumbUpIcon
                          sx={{ cursor: "pointer", fontSize: "20px" }}
                        />
                      ) : (
                        <ThumbUpOffAltIcon
                          sx={{ cursor: "pointer", fontSize: "20px" }}
                        />
                      )}
                      {likeCount}
                    </span>
                    <span onClick={handleDislike}>
                      {isDisliked ? (
                        <ThumbDownIcon
                          sx={{ cursor: "pointer", fontSize: "20px" }}
                        />
                      ) : (
                        <ThumbDownOffAltIcon
                          sx={{ cursor: "pointer", fontSize: "20px" }}
                        />
                      )}
                      {dislikeCount}
                    </span>
                  </Box>
                  <Divider />
                  {/* 댓글보여주는 곳 */}
                  <Box
                    sx={{
                      overflowY: "scroll",
                      overflowX: "hidden",
                      whiteSpace: "pre-wrap",
                      color: "black",
                      height: "35vh",
                      "&::-webkit-scrollbar": {
                        width: "0.5em",
                        display: "none", // 스크롤바 숨김
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0,0,0,0)", // 스크롤바 썸네일 색상을 투명하게 설정
                      },
                    }}>
                    {commentList.map((comment, index) => (
                      <Comment
                        boardId={id}
                        key={index}
                        userinfo={comment.user}
                        timestamp={comment.timestamp}
                        id={comment.id}
                        comment={comment.comment}
                      />
                    ))}
                  </Box>
                  <Box
                    sx={{ position: "absolute", bottom: "2px", width: "100%" }}>
                    {showAutocomplete && autocompleteOptions.length > 0 && (
                      <ul
                        style={{
                          width: "50%",
                          height: "200px",
                          overflow: "scroll",
                          backgroundColor: "whitesmoke",
                          borderRadius: "10px",
                        }}>
                        {autocompleteOptions.map((option, index) => (
                          <li
                            style={{
                              color: "gray",
                              padding: "10px 10px",
                              borderRadius: "10px",
                              border: "1px solid orange",
                              cursor: "pointer",
                            }}
                            key={index}
                            onClick={() => handleAutocompleteSelect(option)}>
                            <div style={{ display: "flex" }}>
                              <Avatar
                                variant="rounded"
                                sx={{ width: 20, height: 20, marginRight: 5 }}
                                alt="profile image"
                                src={option.avatar}
                              />
                              {option.name}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                    <form onSubmit={handleCommentSubmit}>
                      <Input
                        sx={{
                          width: "90%",
                          padding: "5px 10px 0px 5px",
                          border: "none",
                        }}
                        placeholder="댓글달기"
                        value={comment}
                        onChange={handleCommentChange}
                        onKeyDown={(event) =>
                          event.key === "Enter" && handleCommentSubmit
                        }
                      />
                      <button
                        type="submit"
                        style={{
                          width: "10%",
                          outline: "none",
                          backgroundColor: "transparent",
                          border: "1px solid gray",
                          borderRadius: "20px",
                          color: "black",
                        }}>
                        Ok
                      </button>
                    </form>
                  </Box>
                </Box>
              </Box>
            </Backdrop>
          ) : (
            <Backdrop
              sx={{
                color: "#fff",
                zIndex: (theme) => theme.zIndex.drawer + 1,
              }}
              open={commentOpen}
              onClick={handleBackdropClick}>
              <Box
                sx={{
                  width: "90vw",
                  height: "90vh",
                  borderRadius: "10px",
                  backgroundColor: "white",
                  display: "flex",
                  flexDirection: "column",
                }}>
                <Box sx={{ position: "relative" }}>
                  <Box
                    sx={{
                      overflowY: "scroll",
                      display: "flex",
                      gap: "1vw",
                      marginLeft: "1rem",
                      marginTop: "1rem",
                      marginBottom: "1rem",
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
                        color: "black",
                      }}
                      secondary={dayjs(timestamp).fromNow()}
                      secondaryTypographyProps={{
                        ml: 1,
                        color:
                          theme.mainColor === "whitesmoke" ||
                          theme.mainColor === "#fffacd"
                            ? "gray"
                            : "gray",
                      }}
                    />
                    <Button onClick={handleBackdropClick}>X</Button>
                  </Box>
                  <Box
                    sx={{
                      marginBottom: "1rem",
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
                              <Suspense
                                fallback={
                                  <div>
                                    <CircularProgress />
                                  </div>
                                }>
                                <video
                                  controls
                                  className="backdropimg"
                                  style={{ width: "100%", height: "30vh" }}
                                  src={media}
                                  alt={`Slide ${index + 1}`}
                                />
                              </Suspense>
                            ) : (
                              <Suspense
                                fallback={
                                  <div>
                                    <CircularProgress />
                                  </div>
                                }>
                                <img
                                  className="backdropimg"
                                  src={media}
                                  alt={`Slide ${index + 1}`}
                                  style={{ width: "100%", height: "30vh" }}
                                />
                              </Suspense>
                            )}
                          </div>
                        );
                      })}
                    </Carousel>
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      height: "2vh",
                      marginLeft: "1rem",
                      marginBottom: "2rem",
                      color: "black",
                    }}>
                    {title}
                  </Box>
                  <Box
                    sx={{
                      width: "90%",
                      height: "5vh",
                      marginLeft: "1rem",
                      marginBottom: "2rem",
                      overflowY: "scroll", // 넘치는 부분을 감춤
                      overflowX: "hidden",
                      whiteSpace: "normal",
                      color: "gray",
                    }}>
                    {content}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      marginLeft: "1rem",
                      marginBottom: "1rem",
                      color: "#e84979",
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
                  <Divider />
                  {/* 댓글보여주는 곳 */}
                  <Box
                    sx={{
                      overflowY: "scroll",
                      color: "black",
                      height: "20vh",
                      "&::-webkit-scrollbar": {
                        width: "0.5em",
                        display: "none", // 스크롤바 숨김
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0,0,0,0)", // 스크롤바 썸네일 색상을 투명하게 설정
                      },
                    }}>
                    {commentList.map((comment, index) => (
                      <Comment
                        boardId={id}
                        key={index}
                        userinfo={comment.user}
                        timestamp={comment.timestamp}
                        id={comment.id}
                        comment={comment.comment}
                      />
                    ))}
                  </Box>
                  <Box
                    sx={{
                      width: "100%",
                      backgroundColor: "white",
                      position: "relative",
                    }}>
                    <div style={{ position: "absolute", top: 0, left: 0 }}>
                      {showAutocomplete && autocompleteOptions.length > 0 && (
                        <ul
                          style={{
                            width: "50vw",
                            height: "200px",
                            overflow: "scroll",
                            backgroundColor: "whitesmoke",
                            borderRadius: "10px",
                            transform: "translateY(-100%)",
                          }}>
                          {autocompleteOptions.map((option, index) => (
                            <li
                              style={{
                                color: "gray",
                                padding: "10px 10px",
                                borderRadius: "10px",
                                border: "1px solid orange",
                                cursor: "pointer",
                              }}
                              key={index}
                              onClick={() => handleAutocompleteSelect(option)}>
                              <div style={{ display: "flex" }}>
                                <Avatar
                                  variant="rounded"
                                  sx={{ width: 20, height: 20, marginRight: 5 }}
                                  alt="profile image"
                                  src={option.avatar}
                                />
                                {option.name}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <form onSubmit={handleCommentSubmit}>
                      <Input
                        sx={{
                          width: "90%",
                          padding: "5px 10px 0px 5px",
                          border: "none",
                        }}
                        placeholder="댓글달기"
                        value={comment}
                        onChange={handleCommentChange}
                        onKeyDown={(event) =>
                          event.key === "Enter" && handleCommentSubmit
                        }
                      />
                      <button
                        type="submit"
                        style={{
                          width: "10%",
                          outline: "none",
                          backgroundColor: "transparent",
                          border: "none",
                          color: "green",
                        }}>
                        Ok
                      </button>
                    </form>
                  </Box>
                </Box>
              </Box>
            </Backdrop>
          )}
        </ListItem>
      </Box>
    </>
  );
}

export default PopularBoardItem;
