import * as React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "../firebase";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Header.css";

import { useCallback } from "react";
import { Badge, Button, Divider } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AlarmItem from "./AlarmItem";
import { clearUserAlarms, setUserAlarms } from "../store/alarmSlice";
import GroupIcon from "@mui/icons-material/Group";
import { useEffect } from "react";
import UserStatus from "./UserStatus";
import {
  child,
  get,
  getDatabase,
  onChildAdded,
  ref,
  remove,
} from "firebase/database";
import { onValue, onDisconnect, set, serverTimestamp } from "firebase/database";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const pages = ["dashboard", "chat", "board", "minigame"];

function Header() {
  const { user, userAlarms, chatAlarmNum } = useSelector((state) => state);
  const location = useLocation();
  const [anchorAlarmEl, setAnchorAlarmEl] = useState(null);
  const [anchorOnlineEl, setAnchorOnlineEl] = useState(null);
  const [friends, setFriends] = useState([]);
  const onlineOpen = Boolean(anchorOnlineEl);
  const alarmOpen = Boolean(anchorAlarmEl);
  const dispatch = useDispatch();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const [headeropen, setHeaderOpen] = useState(false);

  const handleHeaderOpen = () => {
    setHeaderOpen((prev) => !prev);
  };

  //모든 유저 목록 가져오기
  useEffect(() => {
    async function getUser() {
      const snapshot = await get(child(ref(getDatabase()), "users/"));
      setFriends(snapshot.val() ? Object.values(snapshot.val()) : []);
    }
    getUser();

    return () => {
      setFriends([]);
    };
  }, []);

  useEffect(() => {
    const alarmRef = ref(
      getDatabase(),
      "users/" + user.currentUser.uid + "/alarms"
    );

    const unsubscribe = onChildAdded(alarmRef, (snapshot) => {
      const alarmData = snapshot.val();

      dispatch(setUserAlarms(alarmData)); // 개별 객체로 알림 데이터 저장
    });

    return () => unsubscribe(); // cleanup 함수로 이벤트 리스너 정리
  }, [user.currentUser.uid, dispatch]);

  const handleAlarmClick = (event) => {
    setAnchorAlarmEl(event.currentTarget);
  };

  const handleAlarmClose = () => {
    setAnchorAlarmEl(null);
  };

  const notificationsLabel = (count) => {
    if (count === 0) {
      return "no notifications";
    }
    if (count > 5) {
      return "more than 30 notifications";
    }
    return `${count} notifications`;
  };

  const handleClearAlarm = () => {
    const db = getDatabase();
    const alarmRef = ref(db, "users/" + user.currentUser.uid + "/alarms/");

    remove(alarmRef).then(() => dispatch(clearUserAlarms()));
  };

  const handleOnlineClick = useCallback((event) => {
    setAnchorOnlineEl(event.currentTarget);
  }, []);

  const handleOnlineClose = useCallback(() => {
    setAnchorOnlineEl(null);
  }, []);

  const chatAlarm = (obj) => {
    const values = Object.values(obj);
    return values.reduce((acc, cur) => acc + cur, 0);
  };

  // 온라인 오프라인 기록

  useEffect(() => {
    const db = getDatabase();
    const myConnectionsRef = ref(
      db,
      `users/${user.currentUser.uid}/connections`
    );
    const lastOnlineRef = ref(db, `users/${user.currentUser.uid}/lastOnline`);

    const connectedRef = ref(db, ".info/connected");
    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        set(myConnectionsRef, true);

        // When I disconnect, remove this device

        // Add this device to my connections list

        // When I disconnect, update the last time I was seen online
        onDisconnect(myConnectionsRef).set(false);
        onDisconnect(lastOnlineRef).set(serverTimestamp());
      }
    });
  }, [user.currentUser.uid]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const db = getDatabase();
      const myConnectionsRef = ref(
        db,
        `users/${user.currentUser.uid}/connections`
      );
      const isVisible = document.visibilityState === "visible";

      if (!isVisible) {
        // When the page becomes hidden, set the connection status to false
        set(myConnectionsRef, false);
      } else {
        // When the page becomes visible again, set the connection status to true
        set(myConnectionsRef, true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user.currentUser.uid]);

  useEffect(() => {
    let timer;
    if (isMenuOpen) {
      // 메뉴가 열린 후 5초 뒤에 isMenuOpen을 자동으로 false로 변경
      timer = setTimeout(() => {
        setIsMenuOpen(false);
      }, 3000);
    }
    // Clean up the timer if the component unmounts or isMenuOpen changes
    return () => {
      clearTimeout(timer);
    };
  }, [isMenuOpen]);

  return (
    <>
      <Box sx={{ display: "flex", position: "relative" }}>
        <GroupIcon
          onClick={handleOnlineClick}
          sx={{
            color: "#5bc236",
            width: "30px",
            height: "30px",
          }}
        />
        <Menu
          open={onlineOpen}
          anchorEl={anchorOnlineEl}
          id="online-menu"
          PaperProps={{
            style: {
              height: 500,
              width: 300,
              overflow: "scroll",
              backgroundColor: "whitesmoke",
              position: "relative",
            },
          }}
          onClose={handleOnlineClose}>
          {friends.map(
            (friend) =>
              user.currentUser.uid !== friend.id && (
                <MenuItem key={friend.id} sx={{ padding: "20px" }}>
                  <UserStatus user={friend} />
                  <Divider />
                </MenuItem>
              )
          )}
        </Menu>
        <IconButton
          className="alarm_Btn"
          aria-label={notificationsLabel(100)}
          sx={{
            borderRadius: "30px",
            padding: 0,
            paddingLeft: "10px",
          }}>
          <Badge
            badgeContent={
              userAlarms?.alarms.length > 10 ? "10+" : userAlarms.alarms.length
            }
            color="error">
            <NotificationsIcon
              sx={{
                color: "#E86B79",
                width: "30px",
                height: "30px",
              }}
              onClick={handleAlarmClick}
              aria-controls={alarmOpen ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={alarmOpen ? "true" : undefined}
            />
          </Badge>
        </IconButton>
        <Menu
          open={alarmOpen}
          anchorEl={anchorAlarmEl}
          id="alarm-menu"
          PaperProps={{
            style: {
              height: 500,
              width: 300,
              overflow: "scroll",
              backgroundColor: "whitesmoke",
              position: "relative",
            },
          }}
          onClose={handleAlarmClose}>
          {userAlarms.alarms.map((alarm) => (
            <AlarmItem
              key={alarm.id}
              value={alarm}
              handleAlarmClose={handleAlarmClose}
            />
          ))}
          <Button
            sx={{
              color: "red",
              width: "100%",
              display: userAlarms.alarms.length === 0 ? "none" : "block",
            }}
            onClick={handleClearAlarm}>
            Clear All
          </Button>
        </Menu>

        <div className="dash_navlink">
          {pages.map((page) =>
            page === "chat" ? (
              <Badge
                key={page}
                badgeContent={chatAlarm(chatAlarmNum)}
                color="error"
                style={{ padding: 0 }}>
                <NavLink
                  key={page}
                  to={"/" + page}
                  data-text={page}
                  style={{
                    textDecoration: "none",
                    color: "white",
                  }}>
                  {page}
                </NavLink>
              </Badge>
            ) : (
              <NavLink
                key={page}
                to={page === "dashboard" ? "/" : "/" + page}
                data-text={page}
                style={{
                  textDecoration: "none",
                  color: "white",
                }}>
                {page}
              </NavLink>
            )
          )}
        </div>
      </Box>
      <div className="header_menuIcon">
        {!headeropen ? (
          <MenuIcon
            onClick={handleHeaderOpen}
            sx={{
              fontSize: "50px",
              "@media (max-width: 500px)": {
                // 휴대폰에서의 스타일 조정
                fontSize: "30px",
              },
            }}
          />
        ) : (
          <Box>
            <CloseIcon
              sx={{
                zIndex: 150,
                color: "white",
                fontSize: "50px",
                "@media (max-width: 500px)": {
                  // 휴대폰에서의 스타일 조정
                  fontSize: "30px",
                },
              }}
              onClick={handleHeaderOpen}
            />
            <div className="mobile_navlink">
              {pages.map((page) =>
                page === "chat" ? (
                  <Badge
                    key={page}
                    badgeContent={chatAlarm(chatAlarmNum)}
                    color="error"
                    style={{ padding: 0 }}>
                    <NavLink
                      key={page}
                      to={"/" + page}
                      data-text={page}
                      style={{
                        color: "black",
                      }}>
                      {page}
                    </NavLink>
                  </Badge>
                ) : (
                  <NavLink
                    key={page}
                    to={page === "dashboard" ? "/" : "/" + page}
                    data-text={page}
                    style={{
                      color: "black",
                    }}>
                    {page}
                  </NavLink>
                )
              )}
            </div>
          </Box>
        )}
      </div>
    </>
  );
}
export default Header;
