import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "./ReactionSpeedGame.css";
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
function ReactionSpeedGame() {
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
  //       "minigame/reactiongamerank/" + user.currentUser.uid
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
  ////////////////////////////////////////////////////////////
  const [second, setSceond] = useState(0);
  const [millisecond, setMillisecond] = useState(0); //게임이시작되고 지나가는 시간 밀리초로 계산
  const [speed, setSpeed] = useState(0); // 유저의 반응속도를 더하기위한 빈칸
  const [count, setCount] = useState(0); // 반응속도 테스트 횟수
  const [userSpeed, setUserSpeed] = useState(0); //유저의 반응속도
  const [text, setText] = useState("");
  const MIN = 2;
  const MAX = 6;
  const [randomSecond, setRandomSecond] = useState(
    Math.floor(Math.random() * (MAX - MIN + 1)) + MIN
  ); //미니멈과 맥시멈 사이의 랜덤한 숫자를 뽑아서 그숫자를 기준으로 게임작동하게하기
  const handleClickGame = () => {
    if (changColor().backgroundColor === "#fc5c65") {
      alert("Too fast");
      setCount(count);
      setUserSpeed(userSpeed);
      setMillisecond(millisecond);
      setSceond(0);
      setRandomSecond(Math.floor(Math.random() * (MAX - MIN + 1)) + MIN);
      return;
    }
    console.log("click!");
    setCount(count + 1);
    const newSpeed = speed + millisecond; // 지금까지 나왔던 속도 더한값
    // const divideNewSpeed = Math.floor(newSpeed / 3); //더한값 게임횟수만큼 나누기 인데 아마 게임끝나고 나눠야될듯?
    setUserSpeed(millisecond);
    setSpeed(newSpeed);
    setMillisecond(0);
    setSceond(0);
    setRandomSecond(Math.floor(Math.random() * (MAX - MIN + 1)) + MIN);
    return {
      backgroundColor: "#fc5c65",
    };
  };
  useEffect(() => {
    const intervalId = setInterval(() => {
      setSceond(second + 1);
    }, 1000);
    return () => {
      clearInterval(intervalId); // 컴포넌트 언마운트 시 clearInterval
    };
  }, [second]);
  const changColor = () => {
    if (second > randomSecond) {
      return {
        backgroundColor: "#20bf6b",
      };
    } else {
      return {
        backgroundColor: "#fc5c65",
      };
    }
  };
  useEffect(() => {
    if (second > randomSecond) {
      const intervalId = setInterval(() => {
        setMillisecond(millisecond + 1);
      }, 1);
      return () => {
        clearInterval(intervalId); // 컴포넌트 언마운트 시 clearInterval
      };
    }
  }, [millisecond, second]);
  useEffect(() => {
    if (second > randomSecond) {
      setText("Click me!");
    } else {
      setText("Waiting...");
    }
  });
  const handleGameStart = () => {
    setGameOn(true);
    setSceond(0);
    setMillisecond(0);
    setSpeed(0);
  };
  useEffect(() => {
    if (count > 2) {
      setOpenDialog(true);
    }
  });
  const resetGame = () => {
    setSceond(0);
    setMillisecond(0);
    setUserSpeed(0);
    setCount(0);
  };
  return (
    <div className="reaction_mainBox">
      <div className="reaction_gameBox">
        <div className="gameBox_title">
          <div className="reactiongame_title">REACTIONGAME</div>
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
                반응속도 테스트 입니다. 3번의 기회를 주고 평균값을 내줍니다.
                <br />
                <div className="reaction_scoreNotice">
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
                backgroundColor: "#70a1ff",
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
              <div className="maindiv">
                <h1 className="user_speed">{userSpeed}/ms</h1>

                <div
                  className="clickThis"
                  style={changColor()}
                  onClick={handleClickGame}
                >
                  <h1 className="inner_text">{text}</h1>
                </div>
                {/* second:{second}||| ||speed:{speed}|| ||randomSecond:
                {randomSecond}
                millisecond:{millisecond}||| */}
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
        <DialogTitle>Your Speed is {Math.floor(speed / 3)}/ms !!</DialogTitle>
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

export default ReactionSpeedGame;
