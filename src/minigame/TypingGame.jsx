import {
  Box,
  Button,
  CircularProgress,
  Popover,
  TextField,
  Typography,
} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";
import { get, getDatabase, ref, remove, set } from "firebase/database";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import hangul from "hangul-js";
import "../firebase";

function TypingGame() {
  const [quote, setQuote] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { user } = useSelector((state) => state);
  const [typeValue, setTypeValue] = useState("");
  const [typingProgress, setTypingProgress] = useState(0);
  const [isLoading, setLoading] = useState(false);
  const [rank, setRank] = useState([]);
  // 현재 실시간 정확도 및 타수
  const [typeAcc, setTypeAcc] = useState(0);
  const [typeSpeed, setTypeSpeed] = useState(0);
  const [startTime, setStartTime] = useState(null);

  // 총 타수 및 정확도
  const [totalAcc, setTotalAcc] = useState(0);
  const [totalSpeed, setTotalSpeed] = useState([]);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const database = getDatabase();
    const diceRef = ref(database, "minigame/typegamerank/");

    get(diceRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const typeData = snapshot.val();

          //  객체를 배열로 변환하여 순회하면서 typegame 값을 가져옴
          const rankArray = Object.keys(typeData).map((key) => ({
            id: key,
            avgSpeed: typeData[key].avgSpeed,
            accuracy: typeData[key].accuracy,
            name: typeData[key].name,
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

  const handleInputChange = (event) => {
    const typedValue = event.target.value;
    setTypeValue(typedValue);

    // 타이핑 진행 상태를 계산하여 업데이트
    const currentQuote = quote[currentQuoteIndex].message;
    const progress = (typedValue.length / currentQuote.length) * 100;
    setTypingProgress(progress);

    if (typedValue.length >= 1 && startTime === null) {
      // 타이머 시작 (startTime이 null일 때만 설정)
      setStartTime(Date.now());
    } else if (typedValue.length === 0) {
      // 타이머 초기화 (타이핑 내용이 비어있을 때)
      setStartTime(null);
    }

    const calculateTypingSpeed = () => {
      if (!startTime) {
        // 타이머가 시작되지 않았으면 타수를 계산할 수 없음
        return 0;
      }

      const endTime = Date.now(); // 타이머를 멈춘 시간 기록

      const elapsedTimeInSeconds = (endTime - startTime) / 1000; // 경과 시간(초) 계산

      const typedJamo = hangul.disassemble(currentQuote); // 입력된 텍스트를 자모로 분해
      const characterCount = typedJamo.length; // 자모의 개수를 세기 위해 typedJamo의 길이를 사용
      const typingSpeed = (characterCount / elapsedTimeInSeconds) * 60; // 타수 계산

      return typingSpeed.toFixed(0);
    };

    // 실시간으로 틀린 부분 감지
    const typedJamo = hangul.disassemble(typedValue); // 입력된 텍스트를 자모로 분해
    const currentQuoteJamo = hangul.disassemble(currentQuote); // 명언을 자모로 분해

    let errorCount = 0;
    for (let i = 0; i < typedJamo.length; i++) {
      if (typedJamo[i] !== currentQuoteJamo[i]) {
        errorCount++;
      }
    }

    // 타이핑 정확도 계산
    const accuracy = Math.round(
      ((typedJamo.length - errorCount) / typedJamo.length) * 100
    );
    setTypeAcc(accuracy);

    setTypeSpeed(calculateTypingSpeed());

    // 첫 번째 명언 입력이 끝났을 때 두 번째 명언으로 전환
    if (progress === 100 && currentQuoteIndex < quote.length - 1) {
      setCurrentQuoteIndex(currentQuoteIndex + 1);
      setTypeValue(""); // 입력된 텍스트 초기화
      setTypingProgress(0); // 타이핑 진행 상태 초
      setTotalSpeed((prev) => [...prev, Number(typeSpeed)]);
      setTypeSpeed(0);
      setTotalAcc((prev) => prev + typeAcc);
      setTypeAcc(0);
      setStartTime(null);
    }
    if (progress === 100 && currentQuoteIndex === 2) {
      setCurrentQuoteIndex(0);
      setTypeValue("");
      setStartTime(null);

      setTotalSpeed((prev) => [...prev, Number(typeSpeed)]);

      setTotalAcc((prev) => prev + typeAcc);
      // totalSpeed에 새 타수를 추가한 이후에 calculateTotalSpeed를 비동기로 처리
    }
  };
  const calculateTotalSpeed = useCallback(() => {
    // totalSpeed 배열의 모든 값 합산
    const sum = totalSpeed.reduce((acc, curr) => acc + curr, 0);
    // 배열의 요소 수로 나눠서 평균 타수 계산
    const averageSpeed = sum / totalSpeed.length;
    return averageSpeed.toFixed(0);
  }, [totalSpeed]);

  useEffect(() => {
    if (totalSpeed.length === 3 && totalAcc > 200) {
      setTotalAcc((prev) => (prev / 3).toFixed(1));
      const averageSpeed = calculateTotalSpeed();

      setTotalSpeed(averageSpeed);

      setTypeSpeed(0);
      setTypeAcc(0);

      setOpenDialog(true); // 다이얼로그 열기
    }
  }, [calculateTotalSpeed, totalAcc, totalSpeed]);

  const sendData = async () => {
    if (totalAcc < 95) {
      return;
    }

    const database = getDatabase();
    const typeRef = ref(
      database,
      "minigame/typegamerank/" + user.currentUser.uid
    );
    const snapshot = await get(typeRef);

    if (snapshot.exists()) {
      // 데이터베이스에 데이터가 이미 있는 경우, 평균 타수를 비교합니다.
      const existingData = snapshot.val();
      if (totalSpeed <= existingData.avgSpeed) {
        return;
      }
    }

    const userData = {
      name: user.currentUser.displayName,
      accuracy: Number(totalAcc),
      avgSpeed: Number(totalSpeed),
    };
    await set(typeRef, userData);
    console.log("데이터가 성공적으로 저장되었습니다.");
  };

  const handleDialogClose = () => {
    sendData();
    // 다이얼로그 닫기
    setOpenDialog(false);
    // 입력된 텍스트 초기화
    setTypeValue("");
    // 타이핑 진행 상태 초기화
    setTypingProgress(0);
    setQuote([]);
    setCurrentQuoteIndex(0);
    setTotalAcc(0);
    setTotalSpeed([]);
    fetchData();
  };

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const fetchData = async () => {
    await fetch("/maximData.json")
      .then((response) => response.json())
      .then((data) => {
        // message의 길이가 100을 넘는 경우 자르기
        const trimmedData = data.filter((item) => item.message.length <= 70);

        // 3개의 랜덤 인덱스 선택
        const getRandomIndex = (max) => Math.floor(Math.random() * max);
        const randomIndexes = new Set();
        while (randomIndexes.size < 3) {
          randomIndexes.add(getRandomIndex(trimmedData.length));
        }

        // 랜덤 인덱스에 해당하는 명언 저장 및 끝에 공백 제거
        const selectedQuote = Array.from(randomIndexes).map((index) => {
          // 객체를 복사한 후 메시지의 끝에 있는 공백 제거
          const quoteCopy = { ...trimmedData[index] };
          quoteCopy.message = quoteCopy.message.trimEnd();
          return quoteCopy;
        });
        setQuote(selectedQuote);
      });
  };
  useEffect(() => {
    fetchData();
  }, []);

  if (!quote) {
    return <div>Loading...</div>;
  }

  const CircularProgressWithLabel = (props) => {
    return (
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        <CircularProgress variant="determinate" {...props} color="error" />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
          <Typography variant="caption" component="div" color="error">
            {props.value}%
          </Typography>
        </Box>
      </Box>
    );
  };

  const handleTypeDelete = () => {
    const database = getDatabase();
    const typingRef = ref(database, "minigame/typegamerank/");

    remove(typingRef)
      .then(() =>
        console.log('Data at "minigame/typegamerank/" has been deleted.')
      )
      .catch((error) => console.error("Error deleting data:", error));
  };

  return (
    <div className="typing_mainBox">
      <div className="typing_gameBox">
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
                총 3개의 랜덤 명언이 나옵니다 시작하는 순간 타수가 기록됩니다.
                정확도가 95% 이상이어야 랭킹에 올라갈 수 있으니 주의하세요!
              </Typography>
            </Popover>
          </div>
        </div>
        {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
          <Button onClick={handleTypeDelete}>데이터 삭제</Button>
        )}
        <div className="gameBox_main">
          <div className="typetext">
            {quote.length > 0 && (
              <h1>
                {quote[currentQuoteIndex].message
                  .split("")
                  .map((char, index) => {
                    const isTyped = index < typeValue.length - 1;
                    const isCorrect = char === typeValue[index];
                    const textColor = isTyped
                      ? isCorrect
                        ? "black"
                        : "#e86b79"
                      : "black";
                    return (
                      <span key={index} style={{ color: textColor }}>
                        {char}
                      </span>
                    );
                  })}
                <span
                  style={{
                    fontSize: "12px",
                    paddingLeft: "10px",
                    color: "black",
                  }}>
                  -{quote[currentQuoteIndex].author}
                </span>
              </h1>
            )}
          </div>
          <div className="nexttext">
            {currentQuoteIndex < quote.length - 1 && (
              <h1>NEXT - {quote[currentQuoteIndex + 1].message}</h1>
            )}
          </div>
          <div className="typecondition">
            <div className="acc">
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#e86b79",
                  marginBottom: "5px",
                }}>
                정확도
              </span>
              <CircularProgressWithLabel value={typeAcc} />
            </div>
            <div className="currentIndex">
              {currentQuoteIndex + 1}/{quote.length}
            </div>
            <div className="speed">
              <span>타수/min</span>
              <span style={{ paddingBottom: "10px" }}>{typeSpeed}</span>
            </div>
          </div>
          <div className="typeinput">
            {quote.length > 0 && (
              <>
                <input
                  type="text"
                  autoComplete="off"
                  autoFocus
                  spellCheck="false"
                  onChange={handleInputChange}
                  value={typeValue}
                  placeholder="위의 문장을 따라 입력하세요."
                  className="typeinput_input"
                />
                <LinearProgress
                  variant="determinate"
                  value={typingProgress}
                  color="error"
                  sx={{
                    width: "100%",
                    paddingLeft: "10px",
                    height: "10%",
                  }}
                />
              </>
            )}
          </div>
        </div>
        <div className="gameBox_active"></div>
      </div>
      <div className="typing_rankBox">
        <div className="rankBox_title">
          주간 Ranking
          <MilitaryTechIcon sx={{ fontSize: "50px", color: "yellow" }} />
        </div>
        <div className="rankBox_main">
          {isLoading && (
            <>
              <div className="rank1">
                1st.{" "}
                <span
                  style={{
                    fontSize: "50px",
                    color: "yellow",
                  }}>
                  "{rank[0]?.name}"
                </span>
                {rank[0]?.avgSpeed} 타 / {rank[0]?.accuracy}%
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
                {rank[1]?.avgSpeed} 타 / {rank[1]?.accuracy}%
              </div>
              <div className="rank3">
                3nd.
                <span style={{ fontSize: "25px", color: "lime" }}>
                  {" "}
                  {rank[2]?.name}
                </span>
                {rank[2]?.avgSpeed} 타 / {rank[2]?.accuracy}%
              </div>
              <div className="rank4">
                4rd.
                <span style={{ fontSize: "25px", color: "lime" }}>
                  {" "}
                  {rank[3]?.name}
                </span>
                {rank[3]?.avgSpeed} 타 / {rank[3]?.accuracy}%
              </div>
              <div className="rank5">
                5rd.
                <span style={{ fontSize: "25px", color: "lime" }}>
                  {" "}
                  {rank[4]?.name}
                </span>
                {rank[4]?.avgSpeed} 타 / {rank[4]?.accuracy}%
              </div>
            </>
          )}
        </div>
      </div>
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>타이핑 결과</DialogTitle>
        <DialogContent>
          <Typography>정확도: {totalAcc}%</Typography>
          <Typography>타수: {totalSpeed}타</Typography>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TypingGame;
