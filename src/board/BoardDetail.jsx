import React, { Suspense, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
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
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Input,
  ListItemText,
} from "@mui/material";
import YouTube from "react-youtube";
import { Carousel } from "react-responsive-carousel";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import { useSelector } from "react-redux";
import Comment from "./Comment";
import dayjs from "dayjs";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function BoardDetail({ posts }) {
  const [isLoading, setIsLoading] = useState(true); // 초기값 true로 설정
  const { user, theme } = useSelector((state) => state);
  const { id } = useParams(); // boardId
  const [boardData, setBoardData] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [comment, setComment] = useState("");
  const [likedUsers, setLikedUsers] = useState([]);
  const [dislikedUsers, setDislikedUsers] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const isLiked = likedUsers.includes(user.currentUser.uid);
  const isDisliked = dislikedUsers.includes(user.currentUser.uid);
  const navigate = useNavigate();
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [tagUser, setTagUser] = useState("");

  useEffect(() => {
    async function getData() {
      try {
        const snapshot = await get(ref(getDatabase(), "board/" + id));
        const data = snapshot.val();
        if (data) {
          setBoardData(data);
        } else {
          console.log("Data not found");
        }
      } catch (error) {
        console.error("Error fetching board data:", error);
      } finally {
        setIsLoading(false); // 데이터 로딩이 끝났을 때 상태 업데이트
      }

      // return 함수가 없어도 됨
    }

    getData();
  }, [id]);

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

  const updateLikesDislikes = (newLikedUsers, newDislikedUsers) => {
    const database = getDatabase();
    update(ref(database, `board/${id}`), {
      likedUsers: newLikedUsers,
      dislikedUsers: newDislikedUsers,
    });
  };

  // 유튜브 링크 잇을키 키뽑기
  const videoKey = boardData?.youtubeLink?.split("shorts/")[1];

  const createNotification = async (type, isCanceled) => {
    if (isCanceled) {
      // 취소 알림 생성 로직
      return;
    } else {
      // 좋아요 또는 싫어요 알림 생성 로직
      const db = getDatabase();
      const alarmRef = ref(db, `users/${boardData.user.id}/alarms`);
      const newAlarmRef = push(alarmRef);
      const alarmKey = newAlarmRef.key;

      const alarmData = {
        id: alarmKey,
        type: type,
        boardId: id,
        title: boardData.title,
        username: user.currentUser.displayName,
        timestamp: serverTimestamp(),
      };

      await set(newAlarmRef, alarmData);
    }
  };

  const handleLike = () => {
    if (likedUsers.includes(user.currentUser.uid)) {
      const newLikedUsers = likedUsers.filter(
        (uid) => uid !== user.currentUser.uid
      );
      setLikedUsers(newLikedUsers);
      updateLikesDislikes(newLikedUsers, dislikedUsers);
      createNotification("like", true); // 좋아요 취소 알림 생성
    } else {
      const newLikedUsers = [...likedUsers, user.currentUser.uid];
      setLikedUsers(newLikedUsers);
      updateLikesDislikes(newLikedUsers, dislikedUsers);
      createNotification("like", false); // 좋아요 알림 생성
    }
  };

  const handleDislike = () => {
    if (dislikedUsers.includes(user.currentUser.uid)) {
      const newDislikedUsers = dislikedUsers.filter(
        (uid) => uid !== user.currentUser.uid
      );
      setDislikedUsers(newDislikedUsers);
      updateLikesDislikes(likedUsers, newDislikedUsers);
      createNotification("dislike", true); // 싫어요 취소 알림 생성
    } else {
      const newDislikedUsers = [...dislikedUsers, user.currentUser.uid];
      setDislikedUsers(newDislikedUsers);
      updateLikesDislikes(likedUsers, newDislikedUsers);
      createNotification("dislike", false); // 싫어요 알림 생성
    }
  };

  const handleBackBoard = () => {
    navigate("/board");
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    try {
      const dbRef = ref(getDatabase(), `board/${id}/comments`);
      const newPostRef = push(dbRef);
      const key = newPostRef.key; // 생성된 키를 가져옴

      const formData = {
        id: key,
        user: {
          id: user.currentUser.uid,
          name: user.currentUser.displayName,
          avatar: user.currentUser.photoURL,
        },
        comment: comment,
        timestamp: serverTimestamp(),
      };

      if (comment.trim() !== "") {
        await set(newPostRef, formData);

        if (tagUser) {
          const tagAlarmRef = ref(getDatabase(), `users/${tagUser.id}/alarms`);
          const newTagAlarmRef = push(tagAlarmRef);
          const tagAlarmKey = newTagAlarmRef.key;

          const tagAlarmData = {
            id: tagAlarmKey,
            type: "tag",
            boardId: id,
            title: boardData.title,
            username: user.currentUser.displayName,
            timestamp: serverTimestamp(),
          };
          await set(newTagAlarmRef, tagAlarmData);
        }

        // 게시물 작성자의 ID와 현재 사용자의 ID가 다를 경우에 알림 생성
        if (boardData.userinfo.id !== user.currentUser.uid) {
          const alarmRef = ref(
            getDatabase(),
            `users/${boardData.userinfo.id}/alarms`
          );
          const newAlarmRef = push(alarmRef);
          const alarmKey = newAlarmRef.key;

          const alarmData = {
            id: alarmKey,
            type: "comment",
            boardId: id,
            title: boardData.title,
            username: user.currentUser.displayName,
            timestamp: serverTimestamp(),
          };
          await set(newAlarmRef, alarmData);
        }
      }
    } catch (error) {
      console.error("폼 데이터 제출 중 오류가 발생하였습니다:", error);
    } finally {
      setComment("");
      setTagUser("");
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

  // ...

  // In the handleAutocompleteSelect function, set the selected user's name
  const handleAutocompleteSelect = (user) => {
    setTagUser(user);
    const prefix = comment.split("@")[0];
    const newComment = `${prefix}@${user.name} `;

    setComment(newComment);
    setShowAutocomplete(false);
    setAutocompleteOptions([]);
  };

  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

  return (
    <>
      {isLoading ? (
        <>
          <CircularProgress color="secondary" />
        </>
      ) : !isMobile ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "93vh",
          }}>
          <Button>
            <ArrowBackIcon
              onClick={handleBackBoard}
              sx={{
                border: "1px solid white",
                borderRadius: "50%",
                color: "white",
              }}
            />
          </Button>
          <Box
            sx={{
              width: "70vw",
              height: "80vh",
              borderRadius: "10px",
              backgroundColor: `white`,
              display: "grid",
              gridTemplateColumns: "5fr 4fr",
              padding: "10px",
            }}>
            <Box sx={{ borderRight: "1px solid #e9e9e9" }}>
              {!boardData.youtubeLink ? (
                <Carousel
                  autoPlay={true}
                  infiniteLoop={true}
                  showThumbs={false}
                  interval={5000}>
                  {boardData.images?.map((media, index) => {
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
                              style={{ width: "100%", height: "78vh" }}
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
                              style={{ height: "78vh" }}
                            />
                          </Suspense>
                        )}
                      </div>
                    );
                  })}
                </Carousel>
              ) : (
                <>
                  <YouTube
                    videoId={videoKey}
                    //opts(옵션들): 플레이어의 크기나 다양한 플레이어 매개 변수를 사용할 수 있음.
                    //밑에서 더 설명하겠습니다.
                    opts={{
                      width: "100%",
                      height: "720",
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
                </>
              )}
            </Box>
            <Box sx={{ position: "relative", margin: "3px", marginBottom: 0 }}>
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
                  src={boardData.user.avatar}
                />
                <ListItemText
                  sx={{
                    display: "flex",
                  }}
                  primary={boardData.user.name}
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    color: "black",
                  }}
                  secondary={dayjs(boardData.timestamp).fromNow()}
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
                {boardData.title}
              </Box>
              <Box
                sx={{
                  width: "90%",
                  height: "15vh",
                  marginLeft: "1rem",
                  marginBottom: "2rem",
                  overflow: "scroll", // 넘치는 부분을 감춤
                  color: "gray",
                }}>
                {boardData.content}
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
                    <ThumbUpIcon sx={{ cursor: "pointer", fontSize: "20px" }} />
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
              <Box sx={{ position: "absolute", bottom: "2px", width: "100%" }}>
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
                          borderBottom: "1px solid black",
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
        </Box>
      ) : (
        <Box
          sx={{
            backgroundColor: `${theme.mainColor}`,
            display: "flex",
            flexDirection: "column",
          }}>
          <Button>
            <ArrowBackIcon
              onClick={handleBackBoard}
              sx={{
                border: `1px solid ${
                  theme.mainColor === "whitesmoke" ||
                  theme.mainColor === "#fffacd"
                    ? "black"
                    : "white"
                }`,
                borderRadius: "50%",
                color:
                  theme.mainColor === "whitesmoke" ||
                  theme.mainColor === "#fffacd"
                    ? "black"
                    : "white",
              }}
            />
          </Button>
          <Box
            sx={{
              borderRadius: "10px",
              backgroundColor: `white`,
            }}>
            <Box
              sx={{
                borderRight: "2px solid black",
              }}>
              {!boardData.youtubeLink ? (
                <Carousel
                  autoPlay={true}
                  infiniteLoop={true}
                  showThumbs={false}
                  interval={5000}>
                  {boardData.images?.map((media, index) => {
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
                              style={{ width: "100%" }}
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
                              style={{ height: "80vh" }}
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
                  //opts(옵션들): 플레이어의 크기나 다양한 플레이어 매개 변수를 사용할 수 있음.
                  //밑에서 더 설명하겠습니다.
                  opts={{
                    width: "100%",
                    height: "500",
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
                  src={boardData.user.avatar}
                />
                <ListItemText
                  sx={{
                    display: "flex",
                  }}
                  primary={boardData.user.name}
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    color: "black",
                  }}
                  secondary={dayjs(boardData.timestamp).fromNow()}
                  secondaryTypographyProps={{
                    ml: 1,
                    color:
                      theme.mainColor === "whitesmoke" ||
                      theme.mainColor === "#fffacd"
                        ? "gray"
                        : "gray",
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
                {boardData.title}
              </Box>
              <Box
                sx={{
                  width: "90%",
                  height: "30vh",
                  marginLeft: "1rem",
                  marginBottom: "2rem",
                  overflow: "scroll", // 넘치는 부분을 감춤
                  color: "gray",
                }}>
                {boardData.content}
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
                  height: "40vh",
                  border: "1px solid gray",
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
                  marginBottom: "3vh",
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
        </Box>
      )}
    </>
  );
}

export default BoardDetail;
