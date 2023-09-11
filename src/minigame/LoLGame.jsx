import React, { useCallback, useEffect, useRef, useState } from "react";
import "../firebase";
import { useSelector } from "react-redux";
import {
  child,
  get,
  getDatabase,
  onValue,
  ref,
  remove,
  set,
} from "firebase/database";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import "./LoLGame.css";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";

function LoLGame() {
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
  const [timerSeconds, setTimerSeconds] = useState(12); // 타이머 기간(초)
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [alluser, setAllUser] = useState([]);
  const endRef = useRef(null);
  const [showUserRank, setShowUserRank] = useState(false);

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
      "minigame/lolgamerank/" + user.currentUser.uid
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
    const diceRef = ref(database, "minigame/lolgamerank/");

    get(diceRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const lolData = snapshot.val();

          //  객체를 배열로 변환하여 순회하면서 typegame 값을 가져옴
          const rankArray = Object.keys(lolData).map((key) => ({
            id: key,
            correctNum: lolData[key].correctNum,
            name: lolData[key].name,
            avatar: lolData[key].avatar,
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
    const diceRef = ref(database, "minigame/lolgamerank/");

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
    const diceRef = ref(database, "minigame/lolgamerank/");
    remove(diceRef)
      .then(() => {
        console.log('"minigame/lolgamerank/" 데이터가 삭제되었습니다.');
      })
      .catch((error) => {
        console.error("데이터 삭제 에러:", error);
      });
  };

  const handleGameStart = async () => {
    try {
      const response = await fetch(
        "https://ddragon.leagueoflegends.com/cdn/13.16.1/data/ko_KR/championFull.json"
      ); // JSON 파일 경로에 맞게 수정
      const data = await response.json();

      const allChampionSkins = [];
      Object.keys(data.data).forEach((championKey) => {
        allChampionSkins.push(
          ...data.data[championKey].skins.map((skin) => ({
            championKey: championKey,
            skin: skin,
          }))
        );
      });

      // "name"이 "default"인 스킨 제외
      const filteredSkins = allChampionSkins.filter(
        (skinInfo) => skinInfo.skin.name !== "default"
      );

      const getRandomIndex = (max) => Math.floor(Math.random() * max);
      // 랜덤한 10개의 스킨 정보 추출
      const randomSkins = [];
      for (let i = 0; i < 12; i++) {
        const randomIndex = getRandomIndex(filteredSkins.length);
        randomSkins.push(filteredSkins[randomIndex]);
        filteredSkins.splice(randomIndex, 1); // 중복 방지를 위해 선택한 스킨 삭제
      }

      // 스킨 이미지 URL 생성 및 저장
      const skinsWithImages = [];
      for (const skinInfo of randomSkins) {
        const imageUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${skinInfo.championKey}_${skinInfo.skin.num}.jpg`;
        skinsWithImages.push({
          ...skinInfo,
          img: imageUrl,
        });
      }

      setData(skinsWithImages);
      setCurrentItemIndex(0);
      setGameOn(true);
      setIsTimerActive(true);
    } catch (error) {
      console.error("Error fetching champion skins:", error);
    }
  };

  const handleDialogClose = () => {
    setGameOn(false); // 모든 아이템을 다 보여준 경우 게임 종료
    setAnswerHistory([]); // 게임 종료 시 이번판 기록 초기화
    sendData();
    setOpenDialog(false);
  };

  const checkAnswer = useCallback(() => {
    const isAnswerCorrect = inputValues === data[currentItemIndex]?.skin.name;

    // answerHistory 배열에 이번판의 기록 추가
    setAnswerHistory((prevHistory) => [
      ...prevHistory,
      {
        myanswer: inputValues,
        answer: data[currentItemIndex]?.skin.name,
        correct: isAnswerCorrect,
      },
    ]);

    setIsCorrect(isAnswerCorrect);
    setInputValues("");
  }, [currentItemIndex, data, inputValues]);

  useEffect(() => {
    const setTimeoutId = setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);

    return () => {
      clearTimeout(setTimeoutId);
    };
  }, [answerHistory.length]);

  const handleNextItem = useCallback(() => {
    checkAnswer();
    if (currentItemIndex < data.length - 1) {
      setCurrentItemIndex(currentItemIndex + 1);
      setTimerSeconds(12); // 다음 문제를 위해 타이머 재설정
      setIsTimerActive(true); // 타이머 시작
    } else {
      setIsTimerActive(false);
      setTimerSeconds(12);
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

  return (
    <div className="lol_mainBox">
      <div className="lol_gameBox">
        <div className="gameBox_title">
          <div className="lolgame_title">LOLGAME</div>
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
                horizontal: "left",
              }}
              onClose={handlePopoverClose}
              disableRestoreFocus>
              <Typography
                sx={{ p: 1, fontFamily: "Montserrat", color: "black" }}>
                사진을 보고 스킨이름을 맞추세요!
              </Typography>
            </Popover>
          </div>
        </div>
        <div className="lol_scoreNotice">
          % 1등 : 100 coin, 2등 : 70 coin, 3등 : 50coin, 4등 : 30coin, 5등 :
          20coin, 6등이하 : 0, 미참여 : -20coin %
        </div>
        {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
          <Button
            onClick={handleDeleteData}
            sx={{ color: "red", backgroundColor: "white" }}>
            데이터 삭제
          </Button>
        )}
        <div className="gameBox_main">
          {!gameOn ? (
            <Button
              disabled={showUserRank}
              style={{
                backgroundColor: "#906aa5",
                color: "white",
              }}
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
                      width: "250px",
                      height: "250px",
                      marginRight: "20px",
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
                    {data[currentItemIndex]?.skin.name
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
                  style={{ backgroundColor: "#906aa5", color: "white" }}
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
                }}>
                {answerHistory.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      gap: "30px",
                      overflowY: "scroll",
                    }}>
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
                <div ref={endRef}></div>
              </Box>
            </Box>
          )}
        </div>
      </div>
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
                  user.currentUser?.uid === userData.id ? "#b5bf50" : "white",
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
                {userData.correctNum}개
              </div>
            </ListItem>
          ))}
        </List>
      </div>
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
  );
}

export default LoLGame;
