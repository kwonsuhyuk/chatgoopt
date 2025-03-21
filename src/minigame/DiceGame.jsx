import React, { useCallback, useEffect, useState } from "react";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Popover,
  Typography,
} from "@mui/material";
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
  update,
} from "firebase/database";
import "./DiceGame.css";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import CasinoIcon from "@mui/icons-material/Casino";
import loveArrow from "../img/loveArrow.png";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";

function DiceGame() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [diceNum1, setDiceNum1] = useState(1);
  const [diceNum2, setDiceNum2] = useState(1);
  const [isThrowing, setIsThrowing] = useState(false);
  const [rank, setRank] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { user, theme } = useSelector((state) => state);
  const open = Boolean(anchorEl);
  const [showUserRank, setShowUserRank] = useState(false);
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
          avatar: diceData[key].avatar,
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

  const handleShowRanking = useCallback(() => {
    setShowUserRank((prev) => !prev);
  }, []);

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
      avatar: user.currentUser.photoURL,
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
            avatar: diceData[key].avatar,
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

  const rankCoinAdjustments = [
    { adjustment: 100 },
    { adjustment: 70 },
    { adjustment: 50 },
    { adjustment: 30 },
    { adjustment: 20 },
    { adjustment: 0 },
  ];

  const handleDiceDelete = () => {
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
    const diceRef = ref(database, "minigame/dicegamerank/");
    remove(diceRef)
      .then(() => {
        console.log('"minigame/dicegamerank/" 데이터가 삭제되었습니다.');
      })
      .catch((error) => {
        console.error("데이터 삭제 에러:", error);
      });
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
    <div className="dice_mainBox">
      <div className="dice_gameBox">
        <div className="gameBox_title">
          <div className="dicegame_title">DICEGAME</div>
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
                하루에 한번 주사위를 던져 오늘 행운을 시험하세요!
                <br />
                <div className="dice_scoreNotice">
                  % 1등 : 100 coin, 2등 : 70 coin, 3등 : 50coin, 4등 : 30coin,
                  5등 : 20coin, 6등이하 : 0, 미참여 : -20coin %
                </div>
              </Typography>
            </Popover>
          </div>
        </div>

        {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
          <Button
            onClick={handleDiceDelete}
            sx={{ color: "red", backgroundColor: "white" }}>
            데이터 삭제
          </Button>
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
                fontFamily: "sans-serif",
              }}>
              DOUBLE!!
            </div>
          )}
          <Button
            onClick={throwDice}
            disabled={isThrowing}
            className="diceButton"
            sx={{
              border: "3px solid pink",
              backgroundColor: "white",
              color: "pink",
            }}>
            {isThrowing ? "주사위 던지는 중..." : "주사위 던지기"}
          </Button>
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
                {userData.diceSum}
                <CasinoIcon />
              </div>
            </ListItem>
          ))}
        </List>
      </div>
      <Snackbar
        open={openSnackBard}
        autoHideDuration={2000}
        onClose={handlesnackbarClose}
        message="좋아요를 보냈습니다."
        action={action}
      />
    </div>
  );
}

export default DiceGame;
