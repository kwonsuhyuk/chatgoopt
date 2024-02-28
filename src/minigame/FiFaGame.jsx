import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import "../firebase";
import {
  child,
  get,
  getDatabase,
  onValue,
  ref,
  remove,
  set,
  update,
} from "firebase/database";
import CheckIcon from "@mui/icons-material/Check";
import "./FiFaGame.css";
import axios from "axios";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import loveArrow from "../img/loveArrow.png";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";

function FiFaGame() {
  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정
  const { theme, user } = useSelector((state) => state);
  const [anchorEl, setAnchorEl] = useState(null);
  const [rank, setRank] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  const [data, setData] = useState([]);
  const [gameOn, setGameOn] = useState(false);
  const [inputValues, setInputValues] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]); // 이번판 기록
  const [timerSeconds, setTimerSeconds] = useState(15); // 타이머 기간(초)
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [alluser, setAllUser] = useState([]);
  const [showUserRank, setShowUserRank] = useState(false);
  const endRef = useRef(null);

  const handleShowRanking = useCallback(() => {
    setShowUserRank((prev) => !prev);
  }, []);

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);

    return () => {
      clearTimeout(setTimeoutId);
    };
  }, [answerHistory.length]);

  useEffect(() => {
    async function getUser() {
      const snapshot = await get(child(ref(getDatabase()), "users/"));
      setAllUser(snapshot.val() ? Object.values(snapshot.val()) : []);
    }
    getUser();

    return () => {
      setAllUser([]);
    };
  }, []);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const sendData = async () => {
    const database = getDatabase();
    const typeRef = ref(
      database,
      "minigame/fifagamerank/" + user.currentUser.uid
    );
    const snapshot = await get(typeRef);

    if (snapshot.exists()) {
      // 데이터베이스에 데이터가 이미 있는 경우, 평균 타수를 비교합니다.
      const existingData = snapshot.val();
      if (
        answerHistory.filter((entry) => entry.correct).length <=
        existingData.correctNum
      ) {
        return;
      }
    }

    const userData = {
      name: user.currentUser.displayName,
      id: user.currentUser.uid,
      correctNum: answerHistory.filter((entry) => entry.correct).length,
      avatar: user.currentUser.photoURL,
    };

    await set(typeRef, userData);
    console.log("데이터가 성공적으로 저장되었습니다.");
  };

  useEffect(() => {
    const database = getDatabase();
    const diceRef = ref(database, "minigame/fifagamerank/");

    get(diceRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const typeData = snapshot.val();

          //  객체를 배열로 변환하여 순회하면서 typegame 값을 가져옴
          const rankArray = Object.keys(typeData).map((key) => ({
            id: key,
            correctNum: typeData[key].correctNum,
            name: typeData[key].name,
            avatar: typeData[key].avatar,
          }));

          // diceSum을 기준으로 내림차순으로 정렬
          rankArray.sort((a, b) => b.correctNum - a.correctNum);

          setRank(rankArray);
          setLoading(true);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const updateRank = () => {
    const database = getDatabase();
    const diceRef = ref(database, "minigame/fifagamerank/");

    // 실시간으로 랭킹 감시
    onValue(diceRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const rankArray = Object.keys(data).map((key) => ({
          id: key,
          correctNum: data[key].correctNum,
          name: data[key].name,
          avatar: data[key].avatar,
        }));

        // diceSum을 기준으로 내림차순으로 정렬
        rankArray.sort((a, b) => b.correctNum - a.correctNum);

        // 상위 5개의 랭킹 데이터만 저장
        setRank(rankArray.slice(0, 5));
      } else {
        console.log("No data available");
      }
    });
  };

  useEffect(() => {
    // 컴포넌트가 마운트될 때 랭킹 업데이트 함수를 실행하여 초기 데이터를 가져옴
    updateRank();
  }, []);

  const rankCoinAdjustments = [
    { adjustment: 100 },
    { adjustment: 70 },
    { adjustment: 50 },
    { adjustment: 30 },
    { adjustment: 20 },
    { adjustment: 0 },
  ];

  const handleDeleteData = () => {
    const database = getDatabase();

    // alluser 배열을 순회하며 유저가 랭크에 있는지 확인하고 coin을 조정합니다.
    alluser.forEach((userItem) => {
      const rankIndex = rank.findIndex(
        (rankUser) => rankUser.id === userItem.id
      );
      let coinAdjustment = -20; // 기본값으로 -20 설정

      if (rankIndex !== -1) {
        if (rankIndex >= 5) {
          coinAdjustment = rankCoinAdjustments[5].adjustment;
        } else {
          const giveCoin = rankCoinAdjustments[rankIndex]?.adjustment;

          coinAdjustment = giveCoin;
        }
      }

      const userRef = ref(database, "users/" + userItem.id + "/coin");

      get(userRef)
        .then((coinSnapshot) => {
          const currentCoin = coinSnapshot.val() || 0;
          const newCoin = currentCoin + coinAdjustment;
          const finalCoin = Math.max(newCoin, 0);

          set(userRef, finalCoin)
            .then(() => {
              console.log(`User ${userItem.name} coin updated: ${finalCoin}`);
            })
            .catch((error) => {
              console.error(`User ${userItem.id} coin 업데이트 에러:`, error);
            });
        })
        .catch((error) => {
          console.error(`User ${userItem.id} coin 가져오기 에러:`, error);
        });
    });

    // 유저 코인을 업데이트한 후 주사위 랭크 데이터를 삭제합니다.
    const diceRef = ref(database, "minigame/fifagamerank/");
    remove(diceRef)
      .then(() => {
        console.log('"minigame/fifagamerank/" 데이터가 삭제되었습니다.');
      })
      .catch((error) => {
        console.error("데이터 삭제 에러:", error);
      });
  };

  const handleGameStart = async () => {
    try {
      const response = await axios.get(
        "https://static.api.nexon.co.kr/fifaonline4/latest/spid.json",
        {
          headers: {
            Authorization:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJYLUFwcC1SYXRlLUxpbWl0IjoiMjAwMDA6MTAiLCJhY2NvdW50X2lkIjoiMzg2MTg1NTczIiwiYXV0aF9pZCI6IjQiLCJleHAiOjE3NTU2NzczNDEsImlhdCI6MTY5MjYwNTM0MSwibmJmIjoxNjkyNjA1MzQxLCJzZXJ2aWNlX2lkIjoiNDMwMDExNDgxIiwidG9rZW5fdHlwZSI6IkFjY2Vzc1Rva2VuIn0.Vw8XoWQzkjkbkaSoNycFlYfQrOj7AwtSCqKqpoqPO00",
            "Content-Type": "application/json",
          },
        }
      );

      const getRandomIndex = (max) => Math.floor(Math.random() * max);
      const selectedData = [];

      while (selectedData.length < 12) {
        const randomIndex = getRandomIndex(response.data.length);
        const quoteCopy = { ...response.data[randomIndex] };

        quoteCopy.id = quoteCopy.id.toString();

        if (
          quoteCopy.id.startsWith("100") ||
          quoteCopy.id.startsWith("101") ||
          quoteCopy.id.startsWith("220") ||
          quoteCopy.id.startsWith("230") ||
          quoteCopy.id.startsWith("240") ||
          quoteCopy.id.startsWith("241") ||
          quoteCopy.id.startsWith("250") ||
          quoteCopy.id.startsWith("251") ||
          quoteCopy.id.startsWith("252") ||
          quoteCopy.id.startsWith("256") ||
          quoteCopy.id.startsWith("258") ||
          quoteCopy.id.startsWith("259") ||
          quoteCopy.id.startsWith("264") ||
          quoteCopy.id.startsWith("265") ||
          quoteCopy.id.startsWith("274") ||
          quoteCopy.id.startsWith("249") ||
          quoteCopy.id.startsWith("268") ||
          quoteCopy.id.startsWith("267") ||
          quoteCopy.id.startsWith("278") ||
          quoteCopy.id.startsWith("279") ||
          quoteCopy.id.startsWith("287") ||
          quoteCopy.id.startsWith("511") ||
          quoteCopy.id.startsWith("283") ||
          quoteCopy.id.startsWith("270")
        ) {
          const playerData = {
            img: `https://fo4.dn.nexoncdn.co.kr/live/externalAssets/common/playersAction/p${quoteCopy.id}.png`,
            name: quoteCopy.name.replace(/\s/g, ""), // 이름에서 공백 제거
            id: quoteCopy.id,
          };

          selectedData.push(playerData);

          setData(selectedData);
          setCurrentItemIndex(0);
          setGameOn(true);
          setIsTimerActive(true);
        } else {
          continue;
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleDialogClose = () => {
    setGameOn(false); // 모든 아이템을 다 보여준 경우 게임 종료
    setAnswerHistory([]); // 게임 종료 시 이번판 기록 초기화
    sendData();
    setOpenDialog(false);
  };

  const checkAnswer = useCallback(() => {
    const isAnswerCorrect = inputValues === data[currentItemIndex]?.name;

    // answerHistory 배열에 이번판의 기록 추가
    setAnswerHistory((prevHistory) => [
      ...prevHistory,
      {
        myanswer: inputValues,
        answer: data[currentItemIndex]?.name,
        correct: isAnswerCorrect,
      },
    ]);

    setIsCorrect(isAnswerCorrect);
    setInputValues("");
  }, [currentItemIndex, data, inputValues]);

  const handleNextItem = useCallback(() => {
    checkAnswer();
    if (currentItemIndex < data.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setTimerSeconds(15); // 다음 문제를 위해 타이머 재설정
      setIsTimerActive(true); // 타이머 시작
    } else {
      setIsTimerActive(false);
      setTimerSeconds(15);
      setOpenDialog(true);
    }
  }, [checkAnswer, currentItemIndex, data.length]);

  useEffect(() => {
    let interval;

    if (isTimerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    }

    // 타이머가 0에 도달하거나 문제가 변경되면 간격 지우기
    if (timerSeconds === 0) {
      clearInterval(interval);
      setIsTimerActive(false);

      // 다음 문제로 넘어가는 로직 추가
      handleNextItem();
    }

    return () => clearInterval(interval); // 언마운트 또는 리렌더링 시 정리
  }, [isTimerActive, timerSeconds]);

  const keyEnter = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleNextItem();
      }
    },
    [handleNextItem]
  );

  const handleRefreshClick = () => {
    window.location.reload(); // 현재 페이지를 새로고침
  };

  const [openSnackBard, setOpenSnackBard] = useState(false);

  const handlesnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackBard(false);
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handlesnackbarClose}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const handleArrowLove = (userId) => {
    const database = getDatabase();
    const userRef = ref(database, "users/" + userId);

    // Use get to retrieve the current value of 'likesNum' asynchronously
    get(userRef)
      .then((snapshot) => {
        const userData = snapshot.val();
        const likesNum = userData?.likesNum || 0;

        // Update the 'likesNum' field by incrementing it by 1

        update(userRef, {
          likesNum: likesNum + 1,
        })
          .then(() => {
            setOpenSnackBard(true);
          })
          .catch((error) => {
            console.error(
              `Error incrementing likesNum for user ${userId}:`,
              error
            );
          });
      })
      .catch((error) => {
        console.error(`Error retrieving user data for user ${userId}:`, error);
      });
  };

  return (
    <div className="fifa_mainBox">
      <div className="fifa_gameBox">
        <div className="gameBox_title">
          <div className="fifagame_title">FIFAGAME</div>
          <div>
            <Typography
              sx={{
                fontFamily: "Montserrat",
                color: "white",
                fontSize: "20px",
                marginRight: "10px",
              }}
              aria-owns={open ? "mouse-over-popover" : undefined}
              aria-haspopup="true"
              onMouseEnter={handlePopoverOpen}
              onMouseLeave={handlePopoverClose}>
              How To Play
            </Typography>
            <Popover
              id="mouse-over-popover"
              sx={{
                pointerEvents: "none",
              }}
              open={open}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus>
              <Typography
                sx={{ p: 1, fontFamily: "Montserrat", color: "black" }}>
                총 다섯명의 선수 이름을 사진을 보고 맞추세요.
                <br />
                <div className="fifa_scoreNotice">
                  % 1등 : 100 coin, 2등 : 70 coin, 3등 : 50coin, 4등 : 30coin,
                  5등 : 20coin, 6등이하 : 0, 미참여 : -20coin %
                </div>
              </Typography>
            </Popover>
          </div>
        </div>

        {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
          <Button
            onClick={handleDeleteData}
            sx={{ color: "red", backgroundColor: "white" }}>
            데이터 삭제
          </Button>
        )}
        <RefreshIcon
          onClick={handleRefreshClick}
          sx={{ color: "#35637c", marginLeft: "30px" }}
        />
        <div className="fifa_notice">
          피파 이미지가 없는 경우 이미지가 안나올수도 있으며 선수 풀네임을
          띄어쓰기 없이 정확하게 작성하셔야 합니다. (피파온라인 데이터 기반)
        </div>
        <div className="gameBox_main">
          {!gameOn ? (
            <Button
              disabled={showUserRank}
              style={{ backgroundColor: "#b5bf50", color: "white" }}
              onClick={handleGameStart}>
              시작하기
            </Button>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "space-around",
                width: "90%",
                position: "relative",
              }}>
              {isTimerActive && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: "Montserrat",
                    borderRadius: "30px",
                    width: "100px",
                    height: "100px",
                    fontSize: "50px",
                    color: timerSeconds > 5 ? "white" : "red", // 조건 판별을 중괄호 없이 사용
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    right: 0,
                    margin: "auto",
                  }}>
                  {timerSeconds}
                </div>
              )}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "30px",
                  width: "50%",
                }}>
                <div oncontextmenu="return false">
                  <img
                    className="playerImg"
                    src={data[currentItemIndex]?.img}
                    alt="playerImg"
                    style={{
                      WebkitUserSelect: "none",
                      KhtmlUserSelect: "none",
                      MozUserSelect: "none",
                      OUserSelect: "none",
                      userSelect: "none",
                      WebkitUserDrag: "none",
                      KhtmlUserDrag: "none",
                      MozUserDrag: "none",
                      OUserDrag: "none",
                      userDrag: "none",
                    }}
                  />
                </div>
                <TextField
                  autoComplete="off"
                  value={inputValues}
                  onKeyPress={keyEnter}
                  onChange={(e) => setInputValues(e.target.value)}
                />
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      whiteSpace: "normal",
                    }}>
                    {data[currentItemIndex]?.name
                      .split("")
                      .map((char, index) => (
                        <div
                          key={index}
                          style={{
                            borderBottom: char.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/)
                              ? "2px solid black"
                              : "none",
                            width: "25px",
                            marginRight: char.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/)
                              ? "8px"
                              : "0",
                          }}>
                          {char.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/) ? "" : char}
                        </div>
                      ))}
                  </div>
                </div>
                <Button
                  style={{ backgroundColor: "#b5bf50", color: "white" }}
                  onClick={() => {
                    handleNextItem();
                  }}>
                  확인
                </Button>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  overflowY: "scroll",
                  height: "80%",
                  borderLeft: "1px solid rgb(52, 91, 125);",
                  "@media (max-width: 500px)": {
                    // 휴대폰에서의 스타일 조정
                    borderLeft: "none",
                  },
                }}>
                {answerHistory.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "30px",
                      justifyContent: "flex-start",
                      paddingLeft: "10px",
                    }}>
                    <div
                      style={{
                        fontSize: "20px",
                        color: "#005905",
                        fontFamily: "Montserrat",
                      }}>
                      {index + 1}.
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                      }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          fontFamily: "Montserrat",
                        }}>
                        {entry.myanswer} <ArrowForwardIcon /> {entry.answer}
                      </div>
                      {entry.correct ? (
                        <CheckIcon sx={{ color: "#b5bf50" }} />
                      ) : (
                        <ClearIcon sx={{ color: "red" }} />
                      )}
                    </div>
                  </div>
                ))}
                <div ref={endRef}></div>
              </Box>
              <div className="nexon">Data based on NEXON DEVELOPERS.</div>
            </Box>
          )}
        </div>
      </div>
      {!gameOn && (
        <>
          {" "}
          <div
            className={`ranking_showbutton ${!showUserRank ? "" : "close"}`}
            onClick={handleShowRanking}>
            {!showUserRank ? "Show Ranking" : "Close"}
            {!showUserRank && <KeyboardDoubleArrowUpIcon />}
          </div>
          <div className={`game_user_ranking ${showUserRank ? "show" : ""}`}>
            <List className="ranking_mainboard">
              {rank.map((userData, index) => (
                <ListItem
                  className="ranking_item"
                  key={userData.id}
                  sx={{
                    backgroundColor:
                      user.currentUser?.uid === userData.id
                        ? "#b5bf50"
                        : "white",
                  }}>
                  <span>{index + 1}.</span>
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      sx={{ width: 50, height: 50, borderRadius: "50%" }}
                      alt="profile image"
                      src={userData.avatar}
                    />
                  </ListItemAvatar>
                  <span
                    style={{
                      fontSize: "20px",
                    }}>
                    {userData.name}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "absolute",
                      right: 10,
                    }}>
                    {userData.id !== user.currentUser.uid && (
                      <img
                        src={loveArrow}
                        alt="lovearrow"
                        onClick={() => handleArrowLove(userData.id)}
                        style={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          cursor: "pointer",
                        }}
                      />
                    )}
                    {userData.correctNum}개
                  </div>
                </ListItem>
              ))}
            </List>
          </div>
        </>
      )}
      <Snackbar
        open={openSnackBard}
        autoHideDuration={2000}
        onClose={handlesnackbarClose}
        message="좋아요를 보냈습니다."
        action={action}
      />
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>선수퀴즈 결과</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: "30px",
              border: "2px solid #b5bf50",
              borderRadius: "20px",
              margin: "20px",
            }}>
            {answerHistory.filter((entry) => entry.correct).length} /
            {answerHistory.length}
          </div>
          {answerHistory.map((entry, index) => (
            <div key={index} style={{ display: "flex", gap: "30px" }}>
              <div style={{ fontSize: "20px", color: "#005905" }}>
                {index + 1}.
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  {entry.myanswer} <ArrowForwardIcon /> {entry.answer}
                </div>
                {entry.correct ? (
                  <CheckIcon sx={{ color: "#b5bf50" }} />
                ) : (
                  <ClearIcon sx={{ color: "red" }} />
                )}
              </div>
            </div>
          ))}
        </DialogContent>
      </Dialog>
    </div>
    // </div>
  );
}

export default FiFaGame;
