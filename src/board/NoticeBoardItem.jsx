import {
  Backdrop,
  Box,
  Button,
  Divider,
  Input,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import dayjs from "dayjs";
import {
  getDatabase,
  onValue,
  push,
  ref,
  serverTimestamp,
  set,
} from "firebase/database";
import "../firebase";
import { useSelector } from "react-redux";
import Comment from "./Comment";
import { Carousel } from "react-responsive-carousel";

function NoticeBoardItem({ notice }) {
  const { user } = useSelector((state) => state);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentList, setCommentList] = useState([]);
  const [comment, setComment] = useState("");

  const handleClose = () => {
    setCommentOpen(false);
  };

  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

  useEffect(() => {
    if (notice.id !== "undefined") {
      const commentsRef = ref(getDatabase(), `board/${notice.id}/comments`);
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
  }, [notice.id]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();
    try {
      const dbRef = ref(getDatabase(), `board/${notice.id}/comments`);
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
      }
    } catch (error) {
      console.error("폼 데이터 제출 중 오류가 발생하였습니다:", error);
    } finally {
      setComment("");
    }
  };

  const handleBackdropClick = (event) => {
    // 이벤트의 target이 백드롭 컨텐츠인 경우에만 닫기
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };

  const handleOpenComment = () => {
    setCommentOpen(true);
  };

  return (
    <>
      <ListItem
        key={notice.id}
        alignItems="flex-start"
        sx={{
          width: "90%",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          cursor: "pointer",
        }}>
        <ListItemText
          onClick={handleOpenComment}
          primary={
            <div>
              <LightbulbIcon sx={{ color: "pink" }} />
              <Typography
                sx={{
                  display: "inline",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "80%",
                  fontFamily: "Montserrat",
                }}
                variant="body1"
                color="white">
                {notice.title}
              </Typography>
            </div>
          }
          secondary={
            <div>
              <Typography
                sx={{
                  fontSize: "10px",
                  color: "wheat",
                  fontFamily: "Montserrat",
                }}>
                {dayjs(notice.timestamp).fromNow()}
              </Typography>
              <Typography
                sx={{
                  display: "inline",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "80%",
                  fontFamily: "Montserrat",
                }}
                variant="body2"
                color="white">
                {notice.content}
              </Typography>
            </div>
          }
        />
        <Divider />

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
                width: "80vw",
                height: "95vh",
                borderRadius: "10px",
                backgroundColor: "white",
                display: "flex",
              }}>
              <Box
                sx={{
                  borderRight: "1px solid #e9e9e9",
                }}>
                <Carousel
                  autoPlay={true}
                  infiniteLoop={true}
                  showThumbs={false}
                  interval={5000}>
                  {notice.images?.map((media, index) => {
                    return (
                      <div key={index}>
                        <img
                          className="backdropimg"
                          src={media}
                          alt={`Slide ${index + 1}`}
                          style={{ maxWidth: "100%", maxHeight: "93vh" }}
                        />
                      </div>
                    );
                  })}
                </Carousel>
              </Box>
              <Box sx={{ position: "relative", width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: "1vw",
                    marginLeft: "1rem",
                    marginTop: "1rem",
                    marginBottom: "3rem",
                  }}>
                  <ListItemText
                    sx={{
                      display: "flex",
                    }}
                    primary="관리자"
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      color: "black",
                    }}
                    secondary={dayjs(notice.timestamp).fromNow()}
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
                  {notice.title}
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    marginLeft: "1rem",
                    marginBottom: "2rem",
                    whiteSpace: "normal",
                    overflowY: "scroll", // 넘치는 부분을 감춤
                    color: "gray",
                  }}>
                  {notice.content}
                </Box>

                <Divider />
                {/* 댓글보여주는 곳 */}
                <Box
                  sx={{
                    overflowY: "scroll",
                    color: "black",
                    height: "65vh",
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
                      boardId={notice.id}
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
                  <Divider />
                  <form onSubmit={handleCommentSubmit}>
                    <Input
                      sx={{
                        width: "95%",
                        padding: "5px 10px 0px 5px",
                        border: "none",
                      }}
                      placeholder="댓글달기"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                      onKeyDown={(event) =>
                        event.key === "Enter" && handleCommentSubmit
                      }
                    />
                    <button
                      type="submit"
                      style={{
                        width: "5%",
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
                height: "70vh",
                borderRadius: "10px",
                backgroundColor: "white",
                display: "flex",
              }}>
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: "1vw",
                    marginLeft: "1rem",
                    marginTop: "1rem",
                    marginBottom: "1rem",
                  }}>
                  <ListItemText
                    sx={{
                      display: "flex",
                    }}
                    primary="관리자"
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      color: "black",
                    }}
                    secondary={dayjs(notice.timestamp).fromNow()}
                    secondaryTypographyProps={{
                      ml: 1,
                      color: "gray",
                    }}
                  />
                  <Button onClick={handleBackdropClick}>X</Button>
                </Box>
                <Box
                  sx={{
                    borderRadius: "10px",
                    backgroundColor: `white`,
                  }}>
                  <Box
                    sx={{
                      borderRight: "2px solid black",
                      marginBottom: "20px",
                    }}>
                    <Carousel
                      autoPlay={true}
                      infiniteLoop={true}
                      showThumbs={false}
                      interval={5000}>
                      {notice.images?.map((media, index) => {
                        return (
                          <div key={index}>
                            <img
                              className="backdropimg"
                              src={media}
                              alt={`Slide ${index + 1}`}
                              style={{ maxWidth: "100%", maxHeight: "30vh" }}
                            />
                          </div>
                        );
                      })}
                    </Carousel>
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: "2vh",
                    marginLeft: "1rem",
                    marginBottom: "2rem",
                    color: "black",
                  }}>
                  {notice.title}
                </Box>
                <Box
                  sx={{
                    width: "100%",
                    height: "20vh",
                    overflowY: "scroll",
                    overflowX: "hidden",
                    color: "gray",
                    whiteSpace: "pre-wrap", // 여기에 추가
                  }}>
                  {notice.content}
                </Box>

                <Divider />
                {/* 댓글보여주는 곳 */}
                <Box
                  sx={{
                    border: "1px solid gray",
                    overflowY: "scroll",
                    color: "black",
                    height: "35vh",
                    overflowX: "hidden",
                    whiteSpace: "pre-wrap", // 여기에 추가
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
                      boardId={notice.id}
                      key={index}
                      userinfo={comment.user}
                      timestamp={comment.timestamp}
                      id={comment.id}
                      comment={comment.comment}
                    />
                  ))}
                </Box>
                <Box>
                  <Divider />
                  <form onSubmit={handleCommentSubmit}>
                    <Input
                      sx={{
                        width: "90%",
                        padding: "5px 10px 0px 5px",
                        border: "none",
                      }}
                      placeholder="댓글달기"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
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
    </>
  );
}

export default NoticeBoardItem;
