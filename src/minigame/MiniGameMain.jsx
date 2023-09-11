import React, { useCallback, useEffect, useState } from "react";
import { Avatar, Box, List, ListItem, ListItemAvatar } from "@mui/material";
import Header from "../components/Header";
import bronze from "../img/tier/bronze.png";
import silver from "../img/tier/silver.png";
import gold from "../img/tier/gold.png";
import platinum from "../img/tier/platinum.png";
import diamond from "../img/tier/diamond.png";
import "../firebase";
import { get, getDatabase, onValue, ref } from "firebase/database";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import WalletIcon from "@mui/icons-material/Wallet";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { useSelector } from "react-redux";
import "./MiniGameMain.css";

function MiniGameMain() {
  const { user } = useSelector((state) => state);
  const [userData, setUserData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRankingNum, setMyRankingNum] = useState(null);
  const [showUserRank, setShowUserRank] = useState(false);
  const [diceRank, setDiceRank] = useState([]);
  const [typeRank, setTypeRank] = useState([]);
  const [fifaRank, setFifaRank] = useState([]);
  const [lolrank, setLolRank] = useState([]);

  useEffect(() => {
    if (leaderboard) {
      leaderboard.forEach((userData, index) => {
        if (user.currentUser?.uid === userData.id) setMyRankingNum(index + 1);
      });
    }
  }, [leaderboard, user.currentUser?.uid]);

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

          setDiceRank(rankArray);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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

          rankArray.sort((a, b) => b.avgSpeed - a.avgSpeed);
          setTypeRank(rankArray);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

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
          }));

          // diceSum을 기준으로 내림차순으로 정렬
          rankArray.sort((a, b) => b.correctNum - a.correctNum);

          setFifaRank(rankArray);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

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

          setLolRank(rankArray);
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (user.currentUser) {
      const db = getDatabase();
      const userRef = ref(db, `users/${user.currentUser.uid}`);

      // 데이터 변경을 실시간으로 감지하고 업데이트 처리
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setUserData(data);
      });

      const usersRef = ref(db, "users");
      onValue(usersRef, (snapshot) => {
        const users = snapshot.val();
        if (users) {
          const sortedUsers = Object.entries(users).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          // 코인 순으로 정렬
          sortedUsers.sort((a, b) => b.coin - a.coin);
          setLeaderboard(sortedUsers);
        }
      });
    }
  }, [user.currentUser]);

  const getTierImage = (coin) => {
    if (coin >= 2000) {
      return diamond;
    } else if (coin >= 1500) {
      return platinum;
    } else if (coin >= 1000) {
      return gold;
    } else if (coin >= 500) {
      return silver;
    } else {
      return bronze;
    }
  };

  const handleShowRanking = useCallback(() => {
    setShowUserRank((prev) => !prev);
  }, []);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "7vh",
        marginLeft: 20,
      }}>
      <div
        style={{
          height: "95%",
          width: "100%",
          position: "relative",
        }}>
        {userData && (
          <div className="minigame_profile">
            <div className="profile_header">
              <img
                className="userAvatar"
                src={userData.avatar}
                alt="useravatar"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                }}
              />

              <img
                src={getTierImage(userData.coin)}
                alt="usertier"
                className="tierImage"
              />
            </div>
            <div className="profile_userinfo">
              <div className="info coin">
                <WalletIcon sx={{ color: "gold", fontSize: "50px" }} />
                <div className="detail">
                  <div className="detail_count">
                    {userData.coin ? userData.coin : 0}
                  </div>{" "}
                  <div>coin</div>
                </div>
              </div>
              <div className="info myranking">
                <SignalCellularAltIcon
                  sx={{ color: "#6fa0bf", fontSize: "50px" }}
                />
                <div className="detail">
                  <div className="detail_count">
                    {myRankingNum === 1
                      ? "1st"
                      : myRankingNum >= 4
                      ? `${myRankingNum}st`
                      : myRankingNum === 2
                      ? `${myRankingNum}nd`
                      : myRankingNum === 3
                      ? `${myRankingNum}rd`
                      : 0}
                  </div>

                  <div>Ranking</div>
                </div>
              </div>
              <div className="info likes">
                <VolunteerActivismIcon
                  sx={{ color: "#f7786b", fontSize: "50px" }}
                />
                <div className="detail">
                  <div className="detail_count">
                    {userData.likes ? userData.likes : 0}
                  </div>
                  <div>likes</div>
                </div>
              </div>
            </div>
            <div className="profile_userrankinfo">
              <div className="gamerank dice">
                <div className="gamename">Dice</div>
                <div className="myrank">
                  {diceRank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid &&
                        (index + 1 === 1
                          ? `${index + 1}st`
                          : index + 1 === 2
                          ? `${index + 1}nd`
                          : index + 1 === 3
                          ? `${index + 1}rd`
                          : `${index + 1}st`)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="gamerank type">
                <div className="gamename">Typing</div>
                <div className="myrank">
                  {typeRank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid &&
                        (index + 1 === 1
                          ? `${index + 1}st`
                          : index + 1 === 2
                          ? `${index + 1}nd`
                          : index + 1 === 3
                          ? `${index + 1}rd`
                          : `${index + 1}st`)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="gamerank fifa">
                <div className="gamename">FiFa</div>
                <div className="myrank">
                  {fifaRank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid &&
                        (index + 1 === 1
                          ? `${index + 1}st`
                          : index + 1 === 2
                          ? `${index + 1}nd`
                          : index + 1 === 3
                          ? `${index + 1}rd`
                          : `${index + 1}st`)}
                    </div>
                  ))}
                </div>
              </div>
              <div className="gamerank lol">
                <div className="gamename">LOL</div>
                <div className="myrank">
                  {lolrank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid &&
                        (index + 1 === 1
                          ? `${index + 1}st`
                          : index + 1 === 2
                          ? `${index + 1}nd`
                          : index + 1 === 3
                          ? `${index + 1}rd`
                          : `${index + 1}st`)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div
              className={`ranking_showbutton ${!showUserRank ? "" : "close"}`}
              onClick={handleShowRanking}>
              {!showUserRank ? "Show Ranking" : "Close"}
              {!showUserRank && <KeyboardDoubleArrowUpIcon />}
            </div>
            <div className={`users_ranking ${showUserRank ? "show" : ""}`}>
              <List className="ranking_mainboard">
                {leaderboard.map((userData, index) => (
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
                      <span style={{ color: "gray", fontSize: "20px" }}>
                        {userData.coin ? userData.coin : 0}
                      </span>
                      <img
                        src={getTierImage(userData.coin)}
                        alt="tier"
                        style={{ width: "50px", height: "50px" }}
                      />
                    </div>
                  </ListItem>
                ))}
              </List>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MiniGameMain;
