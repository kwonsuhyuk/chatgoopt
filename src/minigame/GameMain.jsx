import React, { useEffect, useState } from "react";
import "../firebase";
import { useSelector } from "react-redux";
import {
  child,
  get,
  getDatabase,
  onValue,
  ref,
  update,
} from "firebase/database";
import PaymentsIcon from "@mui/icons-material/Payments";
import "./GameMain.css";
import bronze from "../img/tier/bronze.png";
import silver from "../img/tier/silver.png";
import gold from "../img/tier/gold.png";
import platinum from "../img/tier/platinum.png";
import diamond from "../img/tier/diamond.png";
import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Typography,
} from "@mui/material";

function GameMain() {
  const { user } = useSelector((state) => state);
  const [userData, setUserData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showRanking, setShowRanking] = useState(false);
  const [diceRank, setDiceRank] = useState([]);
  const [typeRank, setTypeRank] = useState([]);
  const [fifaRank, setFifaRank] = useState([]);
  const [lolrank, setLolRank] = useState([]);

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

  const [showAnimation, setShowAnimation] = useState(false);
  const [showUserRank, setShowUserRank] = useState(false);

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

  useEffect(() => {
    setTimeout(() => {
      setShowAnimation(true);
    }, 2000);
    setTimeout(() => {
      setShowRanking(true); // 랭킹을 표시하기 위해 상태 변경
    }, 2500); // 500ms 후에 랭킹 표시
  }, []);

  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

  return (
    <>
      {!isMobile ? (
        <div
          style={{
            borderRadius: "0 20px 20px",
            background: `linear-gradient(135deg, #5988d5, white)`,
            width: "85vw",
            boxShadow:
              "-5px -5px 12px white, 12px 12px 20px rgba(0, 0, 0, 0.5)",
            height: "85vh",
            display: "flex",
            justifyContent: "space-around",
          }}>
          {/* 코인랭킹 */}
          <div
            className={`ranking ${showRanking ? "show" : ""}`}
            style={{
              display: showRanking ? "block" : "none",
              height: "90%",
              marginTop: "30px",
              overflowY: "scroll",
              position: "relative",
            }}>
            <Typography
              sx={{
                textAlign: "center",
                color: "whitesmoke",
                backgroundColor: "#01439c",
                borderRadius: "10px",
              }}>
              Ranking
            </Typography>
            <List>
              {leaderboard.map((userData, index) => (
                <ListItem
                  key={userData.id}
                  style={{
                    backgroundColor:
                      user.currentUser?.uid === userData.id
                        ? "green"
                        : "#5988d5",
                    border: "1px solid white",
                    borderRadius: "10px",
                    height: `calc(85vh * (5/9) / 5)`,
                    width: "400px",
                    display: "flex",
                    color: "white",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  <span
                    style={{
                      color: index < 3 ? "red" : "white",
                      fontSize: "30px",
                      fontFamily: "monospace",
                    }}>
                    {index + 1}.
                  </span>
                  <ListItemAvatar>
                    <Avatar
                      variant="rounded"
                      sx={{ width: 50, height: 50 }}
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
                  <img
                    src={getTierImage(userData.coin)}
                    alt="tier"
                    style={{ width: "50px", height: "50px" }}
                  />{" "}
                  <span style={{ color: "yellow", fontSize: "20px" }}>
                    {userData.coin ? userData.coin : 0}
                  </span>
                </ListItem>
              ))}
            </List>
          </div>
          <div
            style={{
              display: showRanking ? "block" : "none",
              marginTop: "30px",
              height: "90%",
            }}>
            <Typography
              sx={{
                textAlign: "center",
                color: "whitesmoke",
                backgroundColor: "#03676f",
                borderRadius: "10px",
                marginBottom: "30px",
              }}>
              현재 나의 게임별 등수
            </Typography>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "50px",
                height: `calc(85vh * (5/9) / 5)`,
              }}>
              <div
                style={{
                  display: "flex",
                  gap: "30px",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                }}>
                <div
                  style={{
                    fontSize: "30px",
                    borderRadius: "20px",
                    backgroundColor: "#11609c",
                  }}>
                  DiceGame
                </div>
                <div style={{ fontSize: "30px", color: "whitesmoke" }}>
                  {diceRank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid && `${index + 1}등`}
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "30px",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                }}>
                <div
                  style={{
                    fontSize: "30px",
                    borderRadius: "20px",
                    backgroundColor: "#f7786b",
                  }}>
                  TypingGame
                </div>
                <div style={{ fontSize: "30px", color: "whitesmoke" }}>
                  {typeRank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid && `${index + 1}등`}
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "30px",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                }}>
                <div
                  style={{
                    fontSize: "30px",
                    borderRadius: "20px",
                    backgroundColor: "#b5bf50",
                  }}>
                  FiFaGame
                </div>
                <div style={{ fontSize: "30px", color: "whitesmoke" }}>
                  {fifaRank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid && `${index + 1}등`}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "30px",
                    flexDirection: "column",
                    alignItems: "center",
                    color: "white",
                  }}>
                  <div
                    style={{
                      fontSize: "30px",
                      borderRadius: "20px",
                      backgroundColor: "#906aa5",
                    }}>
                    LOLGame
                  </div>
                  <div style={{ fontSize: "30px", color: "whitesmoke" }}>
                    {lolrank.map((item, index) => (
                      <div key={item.id}>
                        {item.id === user.currentUser?.uid && `${index + 1}등`}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "red" }}>
                  %각 게임에서 얻거나 잃을 수 있는 코인은 각 게임 페이지에서
                  찾을 수 있습니다.
                </div>
                {/* {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
                  <div>
                    <input
                      type="number"
                      value={coinToAdd}
                      onChange={(e) => setCoinToAdd(parseInt(e.target.value))}
                    />
                    <Button onClick={handleDataAll}>
                      데이터 모두에게 분배하기
                    </Button>
                  </div>
                )} */}
              </div>
            </div>
          </div>
          {userData && (
            <div
              className={`user-info ${showAnimation ? "animate" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
              <div
                style={{
                  margin: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "30px",
                }}>
                <img
                  src={userData.avatar}
                  alt="useravatar"
                  style={{ width: "80px", height: "80px", borderRadius: "50%" }}
                />
                <div style={{ fontSize: "30px", color: "white" }}>
                  {userData.name}
                </div>
              </div>
              <div
                style={{
                  color: "yellow",
                  fontSize: "35px",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}>
                <PaymentsIcon />
                {userData.coin ? userData.coin : 0}
              </div>
              <div>
                <img src={getTierImage(userData.coin)} alt="usertier" />
              </div>
              <div style={{ fontSize: "12px", color: "orange" }}>
                0~500: bronze, 500~1000: silver, 1000~1500: gold, 1500~2000:
                platinum, 2000~: diamond
              </div>
            </div>
          )}
        </div>
      ) : !showUserRank ? (
        <div
          style={{
            borderRadius: "0 20px 20px",
            background: `linear-gradient(135deg, #5988d5, white)`,
            width: "100%",
            boxShadow:
              "-5px -5px 12px white, 12px 12px 20px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: showRanking ? "flex-start" : "center",
          }}>
          {userData && (
            <div
              className={`user-info ${showAnimation ? "animate_mobile" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "30px",
                }}>
                <img
                  src={userData.avatar}
                  alt="useravatar"
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                  }}
                />
                <div style={{ fontSize: "35px", color: "white" }}>
                  {userData.name}
                </div>
              </div>
              <div
                style={{
                  color: "yellow",
                  fontSize: "35px",
                  display: "flex",
                  alignItems: "center",
                }}>
                <PaymentsIcon />
                {userData.coin ? userData.coin : 0}
              </div>
              <div>
                <img
                  src={getTierImage(userData.coin)}
                  alt="usertier"
                  style={{ width: "200px", height: "200px" }}
                />
              </div>
            </div>
          )}
          <div
            style={{
              width: "100%",
              height: "30vh",
              display: showRanking ? "block" : "none",
            }}>
            <div style={{ textAlign: "center" }}>
              <Button
                sx={{ backgroundColor: "blue", color: "white" }}
                onClick={() => setShowUserRank(true)}>
                랭킹보기
              </Button>
            </div>
            <Typography
              sx={{
                textAlign: "center",
                color: "whitesmoke",
                backgroundColor: "#03676f",
                borderRadius: "10px",
                marginBottom: "30px",
                marginTop: "30px",
              }}>
              현재 나의 게임별 등수
            </Typography>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  color: "white",
                }}>
                <div
                  style={{
                    fontSize: "25px",
                    borderRadius: "20px",
                    backgroundColor: "#11609c",
                  }}>
                  Dice
                </div>
                <div style={{ fontSize: "30px", color: "gray" }}>
                  {diceRank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid && `${index + 1}등`}
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                }}>
                <div
                  style={{
                    fontSize: "25px",
                    borderRadius: "20px",
                    backgroundColor: "#f7786b",
                  }}>
                  Typing
                </div>
                <div style={{ fontSize: "30px", color: "gray" }}>
                  {typeRank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid && `${index + 1}등`}
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                }}>
                <div
                  style={{
                    fontSize: "25px",
                    borderRadius: "20px",
                    backgroundColor: "#b5bf50",
                  }}>
                  FiFa
                </div>
                <div style={{ fontSize: "30px", color: "gray" }}>
                  {fifaRank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid && `${index + 1}등`}
                    </div>
                  ))}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexDirection: "column",
                  alignItems: "center",
                  color: "white",
                }}>
                <div
                  style={{
                    fontSize: "25px",
                    borderRadius: "20px",
                    backgroundColor: "#906aa5",
                  }}>
                  LOL
                </div>
                <div style={{ fontSize: "30px", color: "gray" }}>
                  {lolrank.map((item, index) => (
                    <div key={item.id}>
                      {item.id === user.currentUser?.uid && `${index + 1}등`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "red",
              display: showRanking ? "block" : "none",
            }}>
            %각 게임에서 얻거나 잃을 수 있는 코인은 각 게임 페이지에서 찾을 수
            있습니다.
          </div>
        </div>
      ) : (
        <div
          className={`ranking ${showRanking ? "show" : ""}`}
          style={{
            display: showRanking ? "block" : "none",
            height: "100%",
            overflowY: "scroll",
            position: "relative",
          }}>
          <Typography
            sx={{
              textAlign: "center",
              color: "whitesmoke",
              backgroundColor: "#01439c",
              borderRadius: "10px",
            }}>
            Ranking
          </Typography>
          <div style={{ fontSize: "12px", color: "orange" }}>
            0~500: bronze, 500~1000: silver, 1000~1500: gold, 1500~2000:
            platinum, 2000~: diamond
          </div>
          <div style={{ textAlign: "center" }}>
            <Button
              sx={{ backgroundColor: "blue", color: "white" }}
              onClick={() => setShowUserRank(false)}>
              내 정보 보기
            </Button>
          </div>
          <List>
            {leaderboard.map((userData, index) => (
              <ListItem
                key={userData.id}
                style={{
                  backgroundColor:
                    user.currentUser?.uid === userData.id ? "green" : "#5988d5",
                  border: "1px solid white",
                  borderRadius: "10px",
                  height: `calc(85vh * (5/9) / 5)`,
                  display: "flex",
                  color: "white",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}>
                <span
                  style={{
                    color: index < 3 ? "red" : "white",
                    fontSize: "30px",
                    fontFamily: "monospace",
                  }}>
                  {index + 1}.
                </span>
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    sx={{ width: 50, height: 50 }}
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
                <img
                  src={getTierImage(userData.coin)}
                  alt="tier"
                  style={{ width: "50px", height: "50px" }}
                />{" "}
                <span style={{ color: "yellow", fontSize: "20px" }}>
                  {userData.coin ? userData.coin : 0}
                </span>
              </ListItem>
            ))}
          </List>
        </div>
      )}
    </>
  );
}

export default GameMain;
