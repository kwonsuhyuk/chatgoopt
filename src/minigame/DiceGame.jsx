import React, { useEffect, useState } from "react";
import "./DiceGame.css";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import { Box, Button, Popover, Typography } from "@mui/material";
import Dice from "../components/Dice";
import { useSelector } from "react-redux";
import "../firebase";
import {
  child,
  get,
  getDatabase,
  onValue,
  ref,
  remove,
  set,
} from "firebase/database";
import CasinoIcon from "@mui/icons-material/Casino";
import "./TypingGame.css";

function DiceGame() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [diceNum1, setDiceNum1] = useState(1);
  const [diceNum2, setDiceNum2] = useState(1);
  const [isThrowing, setIsThrowing] = useState(false);
  const [rank, setRank] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { user, theme } = useSelector((state) => state);
  const open = Boolean(anchorEl);
  const [showRank, setShowRank] = useState(false);
  const [alluser, setAllUser] = useState([]);
  const [isDouble, setDouble] = useState(false);

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

  const updateRank = () => {
    const database = getDatabase();
    const diceRef = ref(database, "minigame/dicegamerank/");

    // 실시간으로 랭킹 감시
    onValue(diceRef, (snapshot) => {
      if (snapshot.exists()) {
        const diceData = snapshot.val();

        // diceData 객체를 배열로 변환하여 순회하면서 diceSum 값을 가져옴
        const rankArray = Object.keys(diceData).map((key) => ({
          id: key,
          diceSum: diceData[key].diceSum,
          name: diceData[key].name,
        }));

        // diceSum을 기준으로 내림차순으로 정렬
        rankArray.sort((a, b) => b.diceSum - a.diceSum);

        // 상위 5개의 랭킹 데이터만 저장
        setRank(rankArray.slice(0, 5));
      } else {
        console.log("No data available");
      }
    });
  };

  useEffect(() => {
    // 컴포넌트가 마운트될 때 랭킹 업데이트 함수를 실행하여 초기 데이터를 가져옴
    setDouble(false);
    updateRank();
  }, []);

  const throwDice = async () => {
    // 해당 유저의 주사위 결과가 이미 존재하는지 확인
    const database = getDatabase();
    const diceRef = ref(
      database,
      "minigame/dicegamerank/" + user.currentUser.uid
    );
    const snapshot = await get(diceRef);

    if (snapshot.exists()) {
      alert("오늘 이미 주사위를 던졌습니다. 내일을 기대해주세요!");
      return;
    }

    setIsThrowing(true);
    const randomNum1 = Math.floor(Math.random() * 6) + 1;
    const randomNum2 = Math.floor(Math.random() * 6) + 1;
    let sum = 0;
    if (randomNum1 === randomNum2) {
      sum = (randomNum1 + randomNum2) * 2;
      setDouble(true);
    } else {
      sum = randomNum1 + randomNum2;
    }

    const userData = {
      name: user.currentUser.displayName,
      diceSum: sum,
    };

    // 2초 이후 애니메이션 종료
    setTimeout(() => {
      setIsThrowing(false);
      // 주사위 눈금을 먼저 변경하고
      setDiceNum1(randomNum1);
      setDiceNum2(randomNum2);
    }, 2000);
    // 랭킹 업데이트
    if (isDouble) {
      setTimeout(() => {
        setDouble(false);
      }, 3000);
    }
    updateRank();

    // 주사위 결과를 데이터베이스에 저장
    await set(diceRef, userData);
  };
  console.log(isDouble);
  useEffect(() => {
    const database = getDatabase();
    const diceRef = ref(database, "minigame/dicegamerank/");

    get(diceRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const diceData = snapshot.val();

          // diceData 객체를 배열로 변환하여 순회하면서 diceSum 값을 가져옴
          const rankArray = Object.keys(diceData).map((key) => ({
            id: key,
            diceSum: diceData[key].diceSum,
            name: diceData[key].name,
          }));

          // diceSum을 기준으로 내림차순으로 정렬
          rankArray.sort((a, b) => b.diceSum - a.diceSum);

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

  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

  const rankCoinAdjustments = [
    { adjustment: 100 },
    { adjustment: 70 },
    { adjustment: 50 },
    { adjustment: 30 },
    { adjustment: 10 },
    { adjustment: -10 },
  ];

  const handleDiceDelete = () => {
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
    const diceRef = ref(database, "minigame/dicegamerank/");
    remove(diceRef)
      .then(() => {
        console.log('"minigame/dicegamerank/" 데이터가 삭제되었습니다.');
      })
      .catch((error) => {
        console.error("데이터 삭제 에러:", error);
      });
  };

  return (
    <div
      className="dice_mainBox"
      style={{
        boxShadow: `-5px -5px 10px ${theme.subColor}, 5px 5px 10px rgba(0, 0, 0, 0.3)`,
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
                    하루에 한번 주사위를 던져 오늘 행운을 시험하세요!
                  </Typography>
                </Popover>
              </div>
              <div style={{ color: "#116c90" }}>
                1등 : 100coin , 2등 : 70coin, 3등 : 50coin, 4등 : 30coin, 5등 :
                10coin, 5등미만 : -10coin, 미참가 : -30coin
              </div>
            </div>

            {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
              <Button onClick={handleDiceDelete}>데이터 삭제</Button>
            )}

            <div className="gameBox_main">
              <Dice color="blue" num={diceNum1} />
              <Dice color="red" num={diceNum2} />
            </div>

            <div className="gameBox_active">
              {isDouble && (
                <div
                  style={{
                    color: "#11609c",
                    fontSize: "30px",
                    fontFamily: "fantasy",
                  }}>
                  DOUBLE!!
                </div>
              )}
              <Button
                onClick={throwDice}
                disabled={isThrowing}
                sx={{
                  border: "3px solid #11609c",
                  backgroundColor: "#11609c",
                  color: "white",
                }}>
                {isThrowing ? "주사위 던지는 중..." : "주사위 던지기"}
              </Button>
            </div>
          </div>
          <div className="dice_rankBox" style={{ backgroundColor: "#11609c" }}>
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
                    <CasinoIcon />
                    {rank[0]?.diceSum}
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
                    <CasinoIcon />
                    {rank[1]?.diceSum}
                  </div>
                  <div className="rank3">
                    3nd.
                    <span style={{ fontSize: "25px", color: "lime" }}>
                      {" "}
                      {rank[2]?.name}
                    </span>
                    <CasinoIcon />
                    {rank[2]?.diceSum}
                  </div>
                  <div className="rank4">
                    4rd.
                    <span style={{ fontSize: "25px", color: "lime" }}>
                      {" "}
                      {rank[3]?.name}
                    </span>
                    <CasinoIcon />
                    {rank[3]?.diceSum}
                  </div>
                  <div className="rank5">
                    5rd.
                    <span style={{ fontSize: "25px", color: "lime" }}>
                      {" "}
                      {rank[4]?.name}
                    </span>
                    <CasinoIcon />
                    {rank[4]?.diceSum}
                  </div>
                </>
              )}
            </div>
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
          <Box
            sx={{
              margin: "3vh 0",
              border: "2px solid #11609c",
              borderRadius: "20px",
              padding: "10px",
            }}>
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
                  주사위를 던져 행운을 시험해보세요!
                </Typography>
                <div style={{ color: "#116c90" }}>
                  1등 : 100coin , 2등 : 70coin, 3등 : 50coin, 4등 : 30coin, 5등
                  : 10coin, 5등미만 : -10coin, 미참가 : -30coin
                </div>
              </Popover>
            </div>
          </Box>

          {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
            <Button onClick={handleDiceDelete}>데이터 삭제</Button>
          )}
          <Box sx={{ height: "50%", display: "flex", alignItems: "center" }}>
            <Dice color="blue" num={diceNum1} />
            <Dice color="red" num={diceNum2} />
          </Box>
          {isDouble && (
            <div
              style={{
                color: "#11609c",
                fontSize: "30px",
                fontFamily: "fantasy",
              }}>
              DOUBLE!!
            </div>
          )}
          <Box>
            <Button
              onClick={throwDice}
              disabled={isThrowing}
              sx={{
                border: "3px solid #11609c",
                backgroundColor: "#11609c",
                color: "white",
                marginBottom: "3vh",
              }}>
              {isThrowing ? "주사위 던지는 중..." : "주사위 던지기"}
            </Button>
          </Box>
          <Button
            sx={{ border: "3px solid #11609c" }}
            onClick={() => setShowRank(true)}>
            Ranking 보기
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            backgroundColor: "#11609c",
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
                  <CasinoIcon />
                  {rank[0]?.diceSum}
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
                  <CasinoIcon />
                  {rank[1]?.diceSum}
                </div>
                <div className="rank3">
                  3nd.
                  <span style={{ fontSize: "25px", color: "lime" }}>
                    {" "}
                    {rank[2]?.name}
                  </span>
                  <CasinoIcon />
                  {rank[2]?.diceSum}
                </div>
                <div className="rank4">
                  4rd.
                  <span style={{ fontSize: "25px", color: "lime" }}>
                    {" "}
                    {rank[3]?.name}
                  </span>
                  <CasinoIcon />
                  {rank[3]?.diceSum}
                </div>
                <div className="rank5">
                  5rd.
                  <span style={{ fontSize: "25px", color: "lime" }}>
                    {" "}
                    {rank[4]?.name}
                  </span>
                  <CasinoIcon />
                  {rank[4]?.diceSum}
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
        </Box>
      )}
    </div>
  );
}

export default DiceGame;
