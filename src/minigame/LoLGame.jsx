import React, { useCallback, useEffect, useState } from "react";
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
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckIcon from "@mui/icons-material/Check";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import "./LoLGame.css";

function LoLGame() {
  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정
  const { theme, user } = useSelector((state) => state);
  const [anchorEl, setAnchorEl] = useState(null);
  const [rank, setRank] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const open = Boolean(anchorEl);
  const [showRank, setShowRank] = useState(false);
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
          const typeData = snapshot.val();

          //  객체를 배열로 변환하여 순회하면서 typegame 값을 가져옴
          const rankArray = Object.keys(typeData).map((key) => ({
            id: key,
            correctNum: typeData[key].correctNum,
            name: typeData[key].name,
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
    { adjustment: 10 },
    { adjustment: -10 },
  ];

  const handleDeleteData = () => {
    const database = getDatabase();

    // alluser 배열을 순회하며 유저가 랭크에 있는지 확인하고 coin을 조정합니다.
    alluser.forEach((userItem) => {
      const rankIndex = rank.findIndex(
        (rankUser) => rankUser.id === userItem.id
      );
      let coinAdjustment = -30; // 기본값으로 -30 설정

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
    <div
      className="dice_mainBox"
      style={{
        boxShadow: `-5px -5px 10px ${theme.subColor}, 5px 5px 10px rgba(0, 0, 0, 0.3)`,
        border: "3px solid #906aa5",
      }}>
      {!isMobile ? (
        <>
          <div className="dice_gameBox">
            <div className="gameBox_title">
              <div>
                <Typography
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
                  <Typography sx={{ p: 1 }}>
                    사진을 보고 스킨이름을 맞추세요!
                  </Typography>
                  <div style={{ color: "#116c90" }}>
                    1등 : 100coin , 2등 : 70coin, 3등 : 50coin, 4등 : 30coin,
                    5등 : 10coin, 5등미만 : -10coin, 미참가 : -30coin
                  </div>
                </Popover>
              </div>
            </div>

            {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
              <Button onClick={handleDeleteData}>데이터 삭제</Button>
            )}

            <div className="gameBox_main">
              {!gameOn ? (
                <Button
                  style={{ backgroundColor: "#906aa5", color: "white" }}
                  onClick={handleGameStart}>
                  시작하기
                </Button>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    width: "90%",
                    position: "relative",
                  }}>
                  {isTimerActive && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#906aa5",
                        borderRadius: "30px",
                        width: "100px",
                        height: "100px",
                        fontSize: "50px",
                        color: timerSeconds > 5 ? "white" : "red", // 조건 판별을 중괄호 없이 사용
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 100,
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
                          borderRadius: "20px",
                          border: "1px solid #906aa5",
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
                  <Box>
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
                          <div
                            style={{ display: "flex", alignItems: "center" }}>
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
                  </Box>
                </Box>
              )}
            </div>
            <div className="gameBox_active"></div>
          </div>
          <div className="dice_rankBox">
            <div className="rankBox_title">
              오늘의 Ranking
              <MilitaryTechIcon sx={{ fontSize: "50px", color: "yellow" }} />
            </div>
            <div className="rankBox_main">
              {/* 첫 번째, 두 번째, 세 번째 데이터 가져오기 */}
              {isLoading && (
                <>
                  <div className="rank1">
                    1st.{" "}
                    <span
                      style={{
                        fontSize: "45px",
                        color: "yellow",
                      }}>
                      "{rank[0]?.name}"
                    </span>
                    <CheckIcon />
                    {rank[0]?.correctNum}
                  </div>
                  <div className="rank2">
                    2nd.{" "}
                    <span
                      style={{
                        fontSize: "25px",
                        color: "lime",
                      }}>
                      {rank[1]?.name}
                    </span>
                    <CheckIcon />
                    {rank[1]?.correctNum}
                  </div>
                  <div className="rank3">
                    3nd.
                    <span style={{ fontSize: "25px", color: "lime" }}>
                      {" "}
                      {rank[2]?.name}
                    </span>
                    <CheckIcon />
                    {rank[2]?.correctNum}
                  </div>
                  <div className="rank4">
                    4rd.
                    <span style={{ fontSize: "25px", color: "lime" }}>
                      {" "}
                      {rank[3]?.name}
                    </span>
                    <CheckIcon />
                    {rank[3]?.correctNum}
                  </div>
                  <div className="rank5">
                    5rd.
                    <span style={{ fontSize: "25px", color: "lime" }}>
                      {" "}
                      {rank[4]?.name}
                    </span>
                    <CheckIcon />
                    {rank[4]?.correctNum}
                  </div>
                </>
              )}
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
        </>
      ) : !showRank ? (
        <Box
          sx={{
            margin: "3vh 0",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <div style={{ color: "red" }}>
            띄어쓰기와 영어 특수기호등 풀네임을 정확히 입력하셔야 정답처리
            됩니다!
          </div>
          <div style={{ marginBottom: "100px" }}>
            {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
              <Button onClick={handleDeleteData}>데이터 삭제</Button>
            )}
          </div>

          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              gap: "20px",
            }}>
            {gameOn ? (
              <>
                {" "}
                {isTimerActive && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      backgroundColor: "#906aa5",
                      borderRadius: "30px",
                      width: "100px",
                      fontSize: "50px",
                      color: timerSeconds > 5 ? "white" : "red", // 조건 판별을 중괄호 없이 사용
                    }}>
                    {timerSeconds}
                  </div>
                )}
                <div>
                  <img
                    src={data[currentItemIndex]?.img}
                    alt="playerImg"
                    style={{
                      width: "150px",
                      height: "150px",
                      borderRadius: "20px",
                      border: "1px solid #906aa5",
                    }}
                  />
                </div>
                <TextField
                  autoComplete="off"
                  value={inputValues}
                  onChange={(e) => setInputValues(e.target.value)}
                />
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      overflow: "scroll",
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
                            width: "15px",
                            marginRight: char.match(/[ㄱ-ㅎㅏ-ㅣ가-힣]/)
                              ? "5px"
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
                <Box sx={{ overflowY: "scroll", height: "10vh" }}>
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
                          <CheckIcon sx={{ color: "#906aa5" }} />
                        ) : (
                          <ClearIcon sx={{ color: "red" }} />
                        )}
                      </div>
                    </div>
                  ))}
                </Box>
              </>
            ) : (
              <Button
                style={{ backgroundColor: "#906aa5", color: "white" }}
                onClick={handleGameStart}>
                시작하기
              </Button>
            )}
          </Box>
          {!gameOn && (
            <Button
              sx={{ border: "3px solid #906aa5", color: "#906aa5" }}
              onClick={() => setShowRank(true)}>
              Ranking 보기
            </Button>
          )}
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
        </Box>
      ) : (
        <Box
          sx={{
            backgroundColor: "#906aa5",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}>
          <Box sx={{ fontSize: "30px", color: "whitesmoke", margin: "3vh 0" }}>
            오늘의 Ranking
            <MilitaryTechIcon sx={{ fontSize: "50px", color: "yellow" }} />
          </Box>
          <Box
            sx={{
              color: "whitesmoke",
              fontSize: "25px",
              display: "flex",
              flexDirection: "column",
              gap: "3vh",
            }}>
            {/* 첫 번째, 두 번째, 세 번째 데이터 가져오기 */}
            {isLoading && (
              <>
                <div className="rank1">
                  1st.{" "}
                  <span
                    style={{
                      fontSize: "45px",
                      color: "yellow",
                    }}>
                    "{rank[0]?.name}"
                  </span>
                  <CheckIcon />
                  {rank[0]?.correctNum}
                </div>
                <div className="rank2">
                  2nd.{" "}
                  <span
                    style={{
                      fontSize: "25px",
                      color: "lime",
                    }}>
                    {rank[1]?.name}
                  </span>
                  <CheckIcon />
                  {rank[1]?.correctNum}
                </div>
                <div className="rank3">
                  3nd.
                  <span style={{ fontSize: "25px", color: "lime" }}>
                    {" "}
                    {rank[2]?.name}
                  </span>
                  <CheckIcon />
                  {rank[2]?.correctNum}
                </div>
                <div className="rank4">
                  4rd.
                  <span style={{ fontSize: "25px", color: "lime" }}>
                    {" "}
                    {rank[3]?.name}
                  </span>
                  <CheckIcon />
                  {rank[3]?.correctNum}
                </div>
                <div className="rank5">
                  5rd.
                  <span style={{ fontSize: "25px", color: "lime" }}>
                    {" "}
                    {rank[4]?.name}
                  </span>
                  <CheckIcon />
                  {rank[4]?.correctNum}
                </div>
              </>
            )}
          </Box>
          <Button
            sx={{
              color: "whitesmoke",
              marginTop: "3vh",
              border: "3px solid whitesmoke",
            }}
            onClick={() => setShowRank(false)}>
            게임메인 으로 가기
          </Button>
          <div style={{ color: "yellow" }}>
            1등 : 100coin , 2등 : 70coin, 3등 : 50coin, 4등 : 30coin, 5등 :
            10coin, 5등미만 : -10coin, 미참가 : -30coin
          </div>
        </Box>
      )}
    </div>
  );
}

export default LoLGame;
