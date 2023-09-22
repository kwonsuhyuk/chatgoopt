import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import "./SpaceGame.css";
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
////////////////////////////////////////
import USER from "../img/You.png";
const CANVAS_WIDTH = 370;
const CANVAS_HEIGHT = 300;
const CREAT_BALL_SECOND = 100;
const CHAR_SIZE = 30; // Char의 크기
const CHAR_SPEED = 20;
const BALL_RADIUS = 5;
const MOBILE_CHAR_MOVE = 10;
const DIRECTIONS = {
  LEFT: "left",
  RIGHT: "right",
  // UP: "up",
  // DOWN: "down",
};
function getRandomCoordinate(maxX, maxY) {
  const x = Math.floor(Math.random() * maxX) + 1; // 1 이상의 자연수
  return { x, y: -BALL_RADIUS };
}
//////////////////////////////////

function SpaceGame() {
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
  const canvasRef = useRef();
  const charRef = useRef();
  const [direction, setDirection] = useState("");
  const [position, setPosition] = useState({
    x: CANVAS_WIDTH - 225,
    y: CANVAS_HEIGHT - CHAR_SIZE,
  });
  const [imageLoaded, setImageLoaded] = useState(false); // 이미지 로드 상태
  const [score, setScore] = useState(0);
  const [scoreOn, setScoreOn] = useState(false);
  const [coordinate, setCoordinate] = useState({ x: 0, y: 0 });
  const [balls, setBalls] = useState([]);
  const [isGameReset, setGameReset] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  ///////////////////////////////////////////////////////////////
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
  //       "minigame/spacegamerank/" + user.currentUser.uid
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
  ///////////////////////////////////////////////////////////////////////////게임로직

  //공만들기
  useEffect(() => {
    if (gameStart) {
      const createBall = () => {
        const randomSpeed = Math.floor(Math.random() * 5) + 1;
        const speed = randomSpeed * 10;
        const newBall = {
          id: Date.now(), // 고유한 아이디를 현재 시간을 이용해 생성
          x: coordinate.x,
          y: -20, // 맨 위에서 시작
          speed: speed, // 공의 속도
        };
        setBalls((prevBalls) => [...prevBalls, newBall]);
        // console.log(speed);
      };

      const moveBalls = () => {
        setBalls((prevBalls) =>
          prevBalls.map((ball) => ({
            ...ball,
            y: ball.y + ball.speed,
          }))
        );
      };

      const intervalId = setInterval(createBall, CREAT_BALL_SECOND); //

      const animationId = requestAnimationFrame(moveBalls);
      return () => {
        clearInterval(intervalId);
        cancelAnimationFrame(animationId);
      };
    }
  }, [coordinate]);
  //만든공 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); // Canvas 초기화

      balls.forEach((ball) => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = "#FFE650";
        ctx.fill();
        ctx.closePath();
        // console.log(ball.x, ball.y);
      });
    }
  }, [balls, position]);

  //방향키마다 키다운값 주기
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setDirection(DIRECTIONS.LEFT);
          break;
        // case "ArrowUp":
        //   setDirection(DIRECTIONS.UP);
        //   break;
        case "ArrowRight":
          e.preventDefault();
          setDirection(DIRECTIONS.RIGHT);
          break;
        // case "ArrowDown":
        //   setDirection(DIRECTIONS.DOWN);
        //   break;
        default:
          setDirection("");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  //canvas안에서 캐릭터 방향 및 최대 이동값 주기
  useEffect(() => {
    const moveChar = () => {
      // 현재 위치와 방향을 기반으로 새로운 위치 계산
      let newX = position.x;
      let newY = position.y;

      switch (direction) {
        case DIRECTIONS.LEFT:
          newX = Math.max(newX - 5, 0); // 왼쪽으로 이동, 최소값 0
          break;
        case DIRECTIONS.RIGHT:
          newX = Math.min(newX + 5, CANVAS_WIDTH - CHAR_SIZE); // 오른쪽으로 이동, 최대값 (CANVAS_WIDTH - 캐릭터사이즈)
          break;
        default:
          setDirection("Stop");
          break;
      }
      // 새로운 위치 설정
      setPosition({ x: newX, y: newY });
    };

    //CHAR_SPEED 만큼 moveChar 함수 실행
    const intervalId = setInterval(moveChar, CHAR_SPEED);

    return () => {
      clearInterval(intervalId); // 컴포넌트 언마운트 시 clearInterval
    };
  }, [direction, position]);

  //canvas안에서 캐릭터 좌표가 바뀔때마다 지웠다 다시 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const char = charRef.current;

      if (imageLoaded) {
        // 이미지가 로드된 후에만 그림
        ctx.drawImage(char, position.x, position.y, CHAR_SIZE, CHAR_SIZE); // 이미지 크기 조절
      }

      char.onload = () => {
        // 이미지 로드 완료 시 호출
        setImageLoaded(true);
      };

      char.src = USER; // 이미지 로드

      return () => {
        char.onload = null; // 컴포넌트가 언마운트되면 onload 이벤트 핸들러 제거
      };
    }
  }, [position, imageLoaded, direction]);

  useEffect(() => {
    const RandomCoordinate = () => {
      const newCoordinate = getRandomCoordinate(CANVAS_WIDTH, CANVAS_HEIGHT);
      setCoordinate(newCoordinate);
    };

    // 0.1초마다 랜덤 좌표 생성
    const intervalId = setInterval(RandomCoordinate, CREAT_BALL_SECOND);

    return () => {
      clearInterval(intervalId); // 컴포넌트 언마운트 시 타이머 정리
    };
  }, [coordinate]);

  function resetGame() {
    setScore(0); // 점수 초기화
    setGameReset(true); // 게임 초기화 상태를 true로 설정

    // 캐릭터 위치 초기화
    setPosition({
      x: CANVAS_WIDTH / 2 - 15,
      y: CANVAS_HEIGHT - CHAR_SIZE,
    });

    // 공 위치 초기화 (랜덤 좌표로 설정)
    setBalls([]);
    setGameReset(false); // 게임 초기화 상태를 false로 다시 설정
  }

  function calculateDistance(ballX, ballY, charX, charY) {
    const dx = ballX - charX;
    const dy = ballY - charY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Ball과 Char 사이의 거리를 확인하여 Alert 표시
  function checkCollisionWithChar() {
    balls.forEach((ball) => {
      const distance = calculateDistance(
        ball.x,
        ball.y,
        position.x + CHAR_SIZE / 2,
        position.y
      );
      if (distance <= CHAR_SIZE / 2) {
        setOpenDialog(true);
        setGameStart(false);
        setScoreOn(false);
        setGameOn(false);
      }
      // console.log(distance);
    });
  }

  // 주기적으로 충돌 확인
  useEffect(() => {
    checkCollisionWithChar();
  }, [balls, position]);

  //점수표시
  useEffect(() => {
    if (scoreOn) {
      const intervalId = setInterval(() => {
        // 0.1초마다 count를 1씩 증가
        setScore((prevCount) => prevCount + 1);
      }, 100);

      return () => {
        clearInterval(intervalId); // 컴포넌트가 언마운트될 때 clearInterval로 타이머 정리
      };
    }
  }, [scoreOn]);
  //게임시작
  const handleGameStart = () => {
    setGameOn(true);
    setGameStart(true);
    setScoreOn(true);
  };
  //////////////////////////////////////////////////////////////////////////////////////////////////////////모바일 버전
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  const moveCharRight = () => {
    // 현재 위치와 방향을 기반으로 새로운 위치 계산
    let newX = position.x;
    let newY = position.y;
    newX = Math.min(newX + MOBILE_CHAR_MOVE, CANVAS_WIDTH - CHAR_SIZE); // 위로 이동, 최소값 30
    // 새로운 위치 설정
    setPosition({ x: newX, y: newY });
  };
  const moveCharLeft = () => {
    // 현재 위치와 방향을 기반으로 새로운 위치 계산
    let newX = position.x;
    let newY = position.y;
    newX = Math.max(newX - MOBILE_CHAR_MOVE, 0); // 위로 이동, 최소값 30
    // 새로운 위치 설정
    setPosition({ x: newX, y: newY });
  };
  ////////////////////////////////////////////////////////////////////////////////////

  return (
    <div className="space_mainBox">
      <div className="space_gameBox">
        <div className="gameBox_title">
          <div className="spacegame_title">SPACEGAME</div>
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
                100점도 못넘기면 사람아님 ㅋㅋ 본인 174점 최고기록 ㅋ
                <br />
                <div className="space_scoreNotice">
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
              <div className="container">
                <canvas
                  className="canvas"
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  style={
                    gameStart
                      ? {}
                      : { border: "3px solid red", display: "none" }
                  }
                ></canvas>
                <img
                  ref={charRef}
                  style={{ display: "none" }} // 이미지 숨기기
                />
              </div>
              <p className="score">Score:{score}</p>
              <div className="btns">
                <button className="directionBTn left" onClick={moveCharLeft}>
                  ◀
                </button>
                <button className="directionBTn right" onClick={moveCharRight}>
                  ▶
                </button>
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
        <DialogTitle>(USER)의 점수:{score}!!</DialogTitle>
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

export default SpaceGame;

/////////////////////////////////////////MINIGAME 기본틀

// import React from 'react'

// function dasdad() {
//   return (
//     <div className="space_mainBox">
//       <div className="space_gameBox">
//         <div className="gameBox_title">
//           <div className="spacegame_title">SPACEGAME</div>
//           <div>
//             <Typography
//               sx={{
//                 fontFamily: "Montserrat",
//                 color: "white",
//                 fontSize: "20px",
//                 marginRight: "10px",
//               }}
//               aria-owns={open ? "mouse-over-popover" : undefined}
//               aria-haspopup="true"
//               onMouseEnter={handlePopoverOpen}
//               onMouseLeave={handlePopoverClose}
//             >
//               How To Play
//             </Typography>
//             <Popover
//               id="mouse-over-popover"
//               sx={{
//                 pointerEvents: "none",
//               }}
//               open={open}
//               anchorEl={anchorEl}
//               anchorOrigin={{
//                 vertical: "bottom",
//                 horizontal: "left",
//               }}
//               transformOrigin={{
//                 vertical: "top",
//                 horizontal: "right",
//               }}
//               onClose={handlePopoverClose}
//               disableRestoreFocus
//             >
//               <Typography
//                 sx={{ p: 1, fontFamily: "Montserrat", color: "black" }}
//               >
//                 그것도 못피함? ㅋ
//                 <br />
//                 <div className="space_scoreNotice">
//                   % 1등 : 100 coin, 2등 : 70 coin, 3등 : 50coin, 4등 : 30coin,
//                   5등 : 20coin, 6등이하 : 0, 미참여 : -20coin %
//                 </div>
//               </Typography>
//             </Popover>
//           </div>
//         </div>
//         {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
//           <Button
//             onClick={handleDeleteData}
//             sx={{ color: "red", backgroundColor: "white" }}
//           >
//             데이터 삭제
//           </Button>
//         )}
//         <RefreshIcon
//           onClick={handleRefreshClick}
//           sx={{ color: "#35637c", marginLeft: "30px", cursor: "pointer" }}
//         />
//         <div className="gameBox_main">
//           {!gameOn ? (
//             <Button
//               disabled={showUserRank}
//               style={{
//                 backgroundColor: "#474787",
//                 color: "white",
//               }}
//               onClick={handleGameStart}
//             >
//               시작하기
//             </Button>
//           ) : (
//             <Box
//               sx={{
//                 height: "100%",
//                 width: "90%",
//                 position: "relative",
//               }}
//             >
//                <Box
//                 sx={{
//                   width: "100%",
//                   overflowY: "scroll",
//                   height: "80%",
//                   borderLeft: "1px solid rgb(52, 91, 125);",
//                   "@media (max-width: 500px)": {
//                     // 휴대폰에서의 스타일 조정
//                     borderLeft: "none",
//                   },
//                 }}
//               ></Box>
//             </Box>
//           )}
//         </div>
//       </div>
//       {!gameOn && (
//         <>
//           <div
//             className={`ranking_showbutton ${!showUserRank ? "" : "close"}`}
//             //onClick={handleShowRanking}
//           >
//             {!showUserRank ? "Show Ranking" : "Close"}
//             {!showUserRank && <KeyboardDoubleArrowUpIcon />}
//           </div>
//           <div className={`game_user_ranking ${showUserRank ? "show" : ""}`}>
//             <List className="ranking_mainboard">
//               {rank.map((userData, index) => (
//                 <ListItem
//                   className="ranking_item"
//                   key={userData.id}
//                   sx={{
//                     backgroundColor:
//                       user.currentUser?.uid === userData.id
//                         ? "#2c2c54"
//                         : "white",
//                   }}
//                 >
//                   <span>{index + 1}.</span>
//                   <ListItemAvatar>
//                     <Avatar
//                       variant="rounded"
//                       sx={{ width: 50, height: 50, borderRadius: "50%" }}
//                       alt="profile image"
//                       src={userData.avatar}
//                     />
//                   </ListItemAvatar>
//                   <span
//                     style={{
//                       fontSize: "20px",
//                     }}
//                   >
//                     {userData.name}
//                   </span>
//                   <div
//                     style={{
//                       display: "flex",
//                       alignItems: "center",
//                       position: "absolute",
//                       right: 10,
//                     }}
//                   >
//                     {userData.id !== user.currentUser.uid && (
//                       <img
//                         src={loveArrow}
//                         alt="lovearrow"
//                         // onClick={() => handleArrowLove(userData.id)}
//                         style={{
//                           width: "30px",
//                           height: "30px",
//                           borderRadius: "50%",
//                           cursor: "pointer",
//                         }}
//                       />
//                     )}
//                     {userData.correctNum}개
//                   </div>
//                 </ListItem>
//               ))}
//             </List>
//           </div>
//         </>
//       )}
//       <Snackbar
//         // open={openSnackBard}
//         autoHideDuration={2000}
//         // onClose={handlesnackbarClose}
//         message="좋아요를 보냈습니다."
//         // action={action}
//       />
//       <Dialog open={openDialog} onClose={handleDialogClose}>
//         <DialogTitle>당신의점수는 {score}점! 좆밥이네요ㅋ</DialogTitle>
//         <DialogContent>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               fontSize: "30px",
//               border: "2px solid #b5bf50",
//               borderRadius: "20px",
//               margin: "20px",
//             }}
//           ></div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// export default dasdad
