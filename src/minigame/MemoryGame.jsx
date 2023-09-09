import React, { useEffect, useState } from "react";
import "./MemoryGame";
import { useSelector } from "react-redux";
import { Button, Popover, Typography } from "@mui/material";
import "../firebase";
import { child, get, getDatabase, ref, remove, set } from "firebase/database";

function MemoryGame() {
  const { user } = useSelector((state) => state);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [alluser, setAllUser] = useState([]);
  const [rank, setRank] = useState([]);

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
    const diceRef = ref(database, "minigame/memorygamerank/");
    remove(diceRef)
      .then(() => {
        console.log('"minigame/memorygamerank/" 데이터가 삭제되었습니다.');
      })
      .catch((error) => {
        console.error("데이터 삭제 에러:", error);
      });
  };
  return (
    <div
      style={{
        display: "flex",
        backgroundColor: "whitesmoke",
        width: "85vw",
        height: "85vh",
        border: "3px solid #67e8c3",
        borderRadius: "0 20px 20px",
      }}>
      {" "}
      <div className="dice_gameBox">
        <div
          className="gameBox_title"
          style={{
            border: "2px solid #67e8c3",
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
                사진을 보고 스킨이름을 맞추세요!
              </Typography>
              <div style={{ color: "#116c90" }}>
                1등 : 100coin , 2등 : 70coin, 3등 : 50coin, 4등 : 30coin, 5등 :
                10coin, 5등미만 : -10coin, 미참가 : -30coin
              </div>
            </Popover>
          </div>
        </div>

        {user.currentUser.uid === "8IAW2DPyJGXAMPIassY57YMpkqB2" && (
          <Button onClick={handleDeleteData}>데이터 삭제</Button>
        )}
      </div>
    </div>
  );
}

export default MemoryGame;
