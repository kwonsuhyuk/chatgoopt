import React, { useEffect, useState } from "react";
import "./DiceGame.css";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import { Button, Popover, Typography } from "@mui/material";
import Dice from "../components/Dice";
import { useSelector } from "react-redux";
import "../firebase";
import { get, getDatabase, onValue, ref, remove, set } from "firebase/database";
import CasinoIcon from "@mui/icons-material/Casino";
import "./TypingGame.css";

function DiceGame() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [diceNum1, setDiceNum1] = useState(1);
  const [diceNum2, setDiceNum2] = useState(1);
  const [isThrowing, setIsThrowing] = useState(false);
  const [rank, setRank] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const { user } = useSelector((state) => state);
  const open = Boolean(anchorEl);

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
    const sum = randomNum1 + randomNum2;
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

  const handleDiceDelete = () => {
    const database = getDatabase();
    const diceRef = ref(database, "minigame/dicegamerank/");

    remove(diceRef)
      .then(() =>
        console.log('Data at "minigame/dicegamerank/" has been deleted.')
      )
      .catch((error) => console.error("Error deleting data:", error));
  };

  return (
    <div className="dice_mainBox">
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
        </div>
        {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
          <Button onClick={handleDiceDelete}>데이터 삭제</Button>
        )}
        <div className="gameBox_main">
          <Dice color="blue" num={diceNum1} />
          <Dice color="red" num={diceNum2} />
        </div>

        <div className="gameBox_active">
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
                    fontSize: "55px",
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
    </div>
  );
}

export default DiceGame;
