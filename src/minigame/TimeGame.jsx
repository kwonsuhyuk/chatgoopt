import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "./TimeGame.css";
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
import RefreshIcon from "@mui/icons-material/Refresh";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import loveArrow from "../img/loveArrow.png";
import Snackbar from "@mui/material/Snackbar";
import CloseIcon from "@mui/icons-material/Close";
import "../firebase";
function TimeGame() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { theme, user } = useSelector((state) => state);
  const [showUserRank, setShowUserRank] = useState(false);
  const [rank, setRank] = useState([]);
  const [gameOn, setGameOn] = useState(false);
  const [alluser, setAllUser] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const rankCoinAdjustments = [
    { adjustment: 100 },
    { adjustment: 70 },
    { adjustment: 50 },
    { adjustment: 30 },
    { adjustment: 20 },
    { adjustment: 0 },
  ];
  const open = Boolean(anchorEl);
  const preventScroll = (event) => {
    event.preventDefault();
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
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
  const handleRefreshClick = () => {
    window.location.reload(); // 현재 페이지를 새로고침
  };
  //   const sendData = async () => {
  //     const database = getDatabase();
  //     const typeRef = ref(
  //       database,
  //       "minigame/timegamerank/" + user.currentUser.uid
  //     );
  //     const snapshot = await get(typeRef);

  //     if (snapshot.exists()) {
  //       const existingData = snapshot.val();
  //       return;
  //     }

  //     const userData = {
  //       name: user.currentUser.displayName,
  //       id: user.currentUser.uid,
  //       correctNum: answerHistory.filter((entry) => entry.correct).length,
  //       avatar: user.currentUser.photoURL,
  //     };

  //     await set(typeRef, userData);
  //     console.log("데이터가 성공적으로 저장되었습니다.");
  //   };
  const handleDialogClose = () => {
    setGameOn(false); // 모든 아이템을 다 보여준 경우 게임 종료
    // sendData();
    setOpenDialog(false);
    resetGame();
  };
  /////////////////////////////////////////////
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(true);
  const [reDisplay, setDisplay] = useState("hidden");

  useEffect(() => {
    if (running) {
      const intervalId = setInterval(() => {
        setTime(time + 0.01);
      }, 10);
      console.log(running);
      return () => {
        clearInterval(intervalId); // 컴포넌트 언마운트 시 clearInterval
      };
    }
  }, [time]);
  const formattedSeconds = time.toFixed(2);
  const handleStop = () => {
    setRunning(false);
    setDisplay("visible");
    setOpenDialog(true);
  };

  const handleGameStart = () => {
    setGameOn(true);
    setTime(0);
    setRunning(true);
    setDisplay("hidden");
  };
  const resetGame = () => {
    setGameOn(false);
  };
  const absolutevalue = Math.abs(formattedSeconds - 5).toFixed(2);
  return (
    <div className="time_mainBox">
      <div className="time_gameBox">
        <div className="gameBox_title">
          <div className="timegame_title">GUESSGAME</div>
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
              onMouseLeave={handlePopoverClose}
            >
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
              disableRestoreFocus
            >
              <Typography
                sx={{ p: 1, fontFamily: "Montserrat", color: "black" }}
              >
                5초를 맞춰보세요
                <br />
                <div className="time_scoreNotice">
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
            sx={{ color: "red", backgroundColor: "white" }}
          >
            데이터 삭제
          </Button>
        )}
        <RefreshIcon
          onClick={handleRefreshClick}
          sx={{ color: "#35637c", marginLeft: "30px", cursor: "pointer" }}
        />
        <div className="gameBox_main">
          {!gameOn ? (
            <Button
              disabled={showUserRank}
              style={{
                backgroundColor: "#474787",
                color: "white",
              }}
              onClick={handleGameStart}
            >
              시작하기
            </Button>
          ) : (
            <Box
              sx={{
                height: "100%",
                width: "90%",
                position: "relative",
              }}
            >
              <div className="Time_Container">
                <div className="five_box">
                  <h1>Guess 5 Seconds!</h1>
                  <span className="five">5</span>
                </div>
                <div className="Time_funtion">
                  <button className="Time_Btns time_set" onClick={handleStop}>
                    Stop
                  </button>
                  <p style={{ visibility: `${reDisplay}` }}>
                    Time:{formattedSeconds}
                  </p>
                  <span style={{ visibility: `${reDisplay}` }}>
                    Dfference:{absolutevalue}
                  </span>
                </div>
              </div>
              {/* <Box
                sx={{
                  width: "100%",
                  overflowY: "scroll",
                  height: "80%",
                  borderLeft: "1px solid rgb(52, 91, 125);",
                  "@media (max-width: 500px)": {
                    // 휴대폰에서의 스타일 조정
                    borderLeft: "none",
                  },
                }}
              ></Box> */}
            </Box>
          )}
        </div>
      </div>
      {!gameOn && (
        <>
          <div
            className={`ranking_showbutton ${!showUserRank ? "" : "close"}`}
            //onClick={handleShowRanking}
          >
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
                        ? "#2c2c54"
                        : "white",
                  }}
                >
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
                    }}
                  >
                    {userData.name}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      position: "absolute",
                      right: 10,
                    }}
                  >
                    {userData.id !== user.currentUser.uid && (
                      <img
                        src={loveArrow}
                        alt="lovearrow"
                        // onClick={() => handleArrowLove(userData.id)}
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
        // open={openSnackBard}
        autoHideDuration={2000}
        // onClose={handlesnackbarClose}
        message="좋아요를 보냈습니다."
        // action={action}
      />
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>
          There is a <span style={{ color: "red" }}>{absolutevalue}</span>{" "}
          second difference
        </DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              fontSize: "30px",
              border: "2px solid #b5bf50",
              borderRadius: "20px",
              margin: "20px",
            }}
          ></div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TimeGame;
