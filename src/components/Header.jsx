import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import "../firebase";
import { getAuth, signOut } from "firebase/auth";
import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "./Header.css";
import ProfileModal from "./modal/ProfileModal";
import { useCallback } from "react";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";
import { Backdrop, Badge, Button, Divider } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AlarmItem from "./AlarmItem";
import { clearUserAlarms } from "../store/alarmSlice";
import { useMemo } from "react";
import GroupIcon from "@mui/icons-material/Group";
import { useEffect } from "react";
import UserStatus from "./UserStatus";
import { child, get, getDatabase, ref } from "firebase/database";
import {
  onValue,
  push,
  onDisconnect,
  set,
  serverTimestamp,
} from "firebase/database";

const pages = ["dashboard", "chat", "minigame"];

function Header() {
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user, userAlarms, chatAlarmNum } = useSelector((state) => state);
  const [openBack, setOpenBack] = useState(false);
  const location = useLocation();
  const [anchorAlarmEl, setAnchorAlarmEl] = useState(null);
  const [anchorOnlineEl, setAnchorOnlineEl] = useState(null);
  const [friends, setFriends] = useState([]);
  const onlineOpen = Boolean(anchorOnlineEl);
  const alarmOpen = Boolean(anchorAlarmEl);
  const dispatch = useDispatch();

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

  const logout = async () => {
    await signOut(getAuth());

    const db = getDatabase();
    const myConnectionsRef = ref(
      db,
      `users/${user.currentUser.uid}/connections`
    );
    onDisconnect(myConnectionsRef).set(false);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = useCallback(() => {
    setAnchorElUser(null);
  }, []);

  const handleClickOpen = useCallback(() => {
    setShowProfileModal(true);
    handleCloseUserMenu();
  }, [handleCloseUserMenu]);

  const handleCloseProfileModal = useCallback(() => {
    setShowProfileModal(false);
  }, []);

  const handleBackOpen = useCallback(() => {
    setOpenBack(true);
  }, []);

  const handlebackClose = useCallback(() => {
    setOpenBack(false);
  }, []);

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

  const handleClearAlarm = useCallback(() => {
    dispatch(clearUserAlarms());
  }, [dispatch]);

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

  return (
    <>
      <AppBar
        position="static"
        sx={{
          backgroundColor: "whitesmoke",
          display: "flex",
        }}>
        <Container maxWidth="xl" sx={{ padding: "10px" }}>
          <Toolbar disableGutters>
            <div
              className="chatgoopt"
              style={{
                width: "20rem",
                color: "black",
                fontSize: "30px",
                paddingLeft: "30px",
              }}>
              Chat_Goopt<span className="blinking-text">ㅣ</span>
            </div>
            {/* <Typography
              variant="h3"
              noWrap
              component={Link}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "Raleway Dots",
                letterSpacing: "0.5rem",
                fontWeight: 700,
                borderRadius: "100px",
                color: "rgba(93,93,93)",
                textDecoration: "none",
                padding: "10px 20px",
                boxShadow:
                  "inset -4px -4px 8px white, inset 4px 4px 8px rgba(0, 0, 0, 0.2)",
              }}>
              ChatGOOPT
            </Typography> */}
            <Button onClick={handleBackOpen}>
              <ContactSupportIcon
                className="questionMark"
                sx={{
                  color: "black",
                  width: "50px",
                  height: "50px",
                  "@media (max-width: 500px)": {
                    // 휴대폰에서의 스타일 조정
                    // 예: 폰트 사이즈 변경, 패딩 조정 등
                    display: "none",
                  },
                  "@media (max-width: 850px)": {
                    // 휴대폰에서의 스타일 조정
                    // 예: 폰트 사이즈 변경, 패딩 조정 등
                    display: "none",
                  },
                }}
              />
            </Button>
            <div className="header_nav">
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
                      className="navLink">
                      {page}
                    </NavLink>
                  </Badge>
                ) : (
                  <NavLink
                    key={page}
                    to={page === "dashboard" ? "" : "/" + page}
                    data-text={page}
                    className="navLink">
                    {page}
                  </NavLink>
                )
              )}
            </div>
            {/* 온라인인 친구 보기 */}
            <GroupIcon
              onClick={handleOnlineClick}
              sx={{
                color: "#00A5BF",
                width: "50px",
                height: "50px",
                marginRight: "2rem",
                "@media (max-width: 500px)": {
                  // 휴대폰에서의 스타일 조정
                  // 예: 폰트 사이즈 변경, 패딩 조정 등
                  position: "absolute",
                  top: 0,
                  right: 0,
                },
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
            {/* 알람기능 */}
            <IconButton
              className="alarm_Btn"
              aria-label={notificationsLabel(100)}
              sx={{
                borderRadius: "30px",
                boxShadow:
                  "-5px -5px 10px white, 5px 5px 10px rgba(0, 0, 0, 0.3)",
                "@media (max-width: 500px)": {
                  // 휴대폰에서의 스타일 조정
                  // 예: 폰트 사이즈 변경, 패딩 조정 등
                  "@media (max-width: 500px)": {
                    // 휴대폰에서의 스타일 조정
                    // 예: 폰트 사이즈 변경, 패딩 조정 등
                    marginTop: "50px",
                    marginLeft: "100px",
                  },
                },
              }}>
              <Badge
                badgeContent={
                  userAlarms?.alarms.length > 10
                    ? "10+"
                    : userAlarms.alarms.length
                }
                color="error">
                <NotificationsIcon
                  sx={{
                    color: "#E86B79",
                    width: "50px",
                    height: "50px",
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
                <AlarmItem key={alarm.id} value={alarm} />
              ))}
              <Button
                sx={{
                  width: "100%",
                  display: userAlarms.alarms.length === 0 ? "none" : "block",
                }}
                onClick={handleClearAlarm}>
                Clear All
              </Button>
            </Menu>
            <Box
              className="profileMenu"
              sx={{
                flexGrow: 0,
                position: "absolute",
                right: 0,
                borderRadius: "20px",
                padding: "10px 20px",
                boxShadow:
                  " inset -4px -4px 8px white, inset 4px 4px 8px rgba(0, 0, 0, 0.2)",
              }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ color: "gray" }}>
                    {user?.currentUser.displayName}
                  </Typography>
                  <Avatar
                    sx={{ marginLeft: "10px" }}
                    alt="profileImage"
                    src={user?.currentUser.photoURL}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}>
                <MenuItem key="edit profile" onClick={handleClickOpen}>
                  <Typography textAlign="center">Edit Profile</Typography>
                </MenuItem>
                <MenuItem key="log out" onClick={logout}>
                  <Typography textAlign="center">Log out</Typography>
                </MenuItem>
              </Menu>
            </Box>
            <Backdrop
              sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
              open={openBack}
              onClick={handlebackClose}>
              {location.pathname === "/" ? (
                <div className="backdrop_main">
                  <div className="backdrop_headerEX">
                    <h1>
                      클릭하여 개인 페이지와 채팅 페이지 게시판 페이지를 오갈수
                      있습니다.
                    </h1>
                  </div>
                  <div className="backdrop_profileEX">
                    <h1>클릭 시 프로필 사진 수정 및 로그아웃이 가능합니다.</h1>
                  </div>
                  <div className="backdrop_alarmEX">
                    <h1>
                      알림설정을 해놓은 채팅방이나 마감이 얼마남지 않은 TodoList
                      알림을 받을수 있습니다.
                    </h1>
                  </div>
                  <div className="backdrop_dashboardEX">
                    <div className="backdrop_searchBarEX">
                      <h1>구글 엔진에 검색할 수 있는 검색바입니다.</h1>
                    </div>
                    <div className="backdrop_bookMarkEX">
                      <h1>
                        자주 가는 사이트를 등록하여 사용할 수 있는 북마크
                        기능입니다. <br />
                        북마크 버튼 오른쪽 상단에 메뉴버튼으로 삭제할 수
                        있습니다.
                      </h1>
                    </div>
                    <div className="backdrop_clockEX">
                      <h1>
                        클릭하여 디지털시계와 아날로그 시계를 전환할 수
                        있습니다.
                      </h1>
                    </div>
                    <div className="backdrop_feedbackEX">
                      <h1>
                        페이지 사용하면서 불편하거나 오류 등 다양한 피드백을
                        관리자한테 보낼수 있습니다.
                      </h1>
                    </div>
                    <div className="pageEX">
                      <h1 className="pageEX_letter">
                        ChatGooPT를 첫화면으로 설정하면 훨씬 편하게 이용할 수
                        있습니당!
                      </h1>
                      <a
                        href="https://m.blog.naver.com/PostView.naver?isHttpsRedirect=true&blogId=shine092&logNo=221099109110"
                        target="_blank"
                        rel="noreferrer">
                        첫페이지로 chatgoopt를 설정하는 방법 알아보러가기
                      </a>
                    </div>
                  </div>
                </div>
              ) : location.pathname === "/chat" ? (
                <div className="backdrop_chat">
                  <div className="backdrop_chatMenu">
                    <h1>
                      + 기호를 클릭하여 새로운 채팅방을 개설할 수 있습니다.
                    </h1>
                  </div>
                  <div className="backdrop_chatMenuEX">
                    <h1>
                      채팅방 메뉴를 보고 클릭하여 채팅방에 들어갈 수 있습니다.
                    </h1>
                  </div>
                  <div className="backdrop_chatAlarm">
                    <h1>클릭하여 채팅방의 알람을 ON/OFF 할 수 있습니다.</h1>
                  </div>
                </div>
              ) : (
                ""
              )}
            </Backdrop>
          </Toolbar>
        </Container>
      </AppBar>
      <ProfileModal
        open={showProfileModal}
        handleClose={handleCloseProfileModal}
      />
    </>
  );
}
export default Header;
