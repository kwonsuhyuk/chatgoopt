import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Weather from "../components/Weather";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import "./Dashboard.css";
import TodoModal from "../components/modal/TodoModal";
import AddIcon from "@mui/icons-material/Add";
import "../firebase";
import {
  child,
  get,
  getDatabase,
  onChildAdded,
  onChildRemoved,
  onDisconnect,
  onValue,
  ref,
  update,
} from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import TodoPaper from "../components/TodoPaper";
import BookMark from "../components/BookMark";
import { setUserAlarms } from "../store/alarmSlice";
import { setChatAlarmNum } from "../store/chatAlarmSlice";
import Header from "../components/Header";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { getAuth, signOut } from "firebase/auth";
import ProfileModal from "../components/modal/ProfileModal";

const MainDiv = styled.div`
  height: 100vh;
`;

const SubDiv = styled.div`
  overflow-y: scroll;
  h1 {
    font-family: "Raleway Dots", cursive;
    font-weight: 700;
    font-size: 50px;
  }
`;

const SnapContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-repeat: no-repeat;
  background-position: fixed;
  background-size: cover;
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    width: 0;
    background-color: transparent;
  }
  & > div {
    position: relative;
    scroll-snap-align: center;
    height: 100vh;
  }
`;

function Dashboard() {
  const { user, theme, bg } = useSelector((state) => state);
  const [open, setOpen] = useState(false);
  const [todos, setTodos] = useState([]);
  const [bookMarks, setBookMarks] = useState([]);
  // const [feedBackOpen, setFeedBackOpen] = useState(false);

  const boxRef = useRef();
  const dispatch = useDispatch();
  const targetRef = useRef(null);
  const [firstLoad, setFirstLoaded] = useState(true);
  const [channels, setChannels] = useState([]);
  const [ismenubaropen, setismenubaropen] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const search = data.get("search");
    window.location.href = `https://www.google.com/search?q=${search}`;
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      // channels 경로의 데이터를 가져오기 위한 레퍼런스
      const channelsRef = ref(getDatabase(), "channels/");

      try {
        // channels 경로의 데이터를 가져옴
        const snapshot = await get(channelsRef);

        if (snapshot.exists()) {
          // snapshot의 val() 메서드를 사용하여 데이터를 배열로 변환하고 상태를 업데이트
          const channelsData = snapshot.val();
          const channelsArray = Object.values(channelsData);
          setChannels(channelsArray);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // clicktimestamp 보다 timestamp 가 큰 메시지들 개수 반환하기
  useEffect(() => {
    if (!user.currentUser.uid || channels.length === 0) {
      return;
    }

    // 클릭 타임스탬프를 가져오고, 없으면 초기화
    const userRef = ref(
      getDatabase(),
      `users/${user.currentUser.uid}/channelclicktime`
    );

    const promises = channels.map(async (channel) => {
      const timestampRef = ref(
        getDatabase(),
        `users/${user.currentUser.uid}/channelclicktime/${channel.id}`
      );
      const timestampSnapshot = await get(timestampRef);
      const clickTimestamp = timestampSnapshot.val();

      // 클릭 타임스탬프가 없으면 모든 메시지를 읽지 않은 것으로 간주
      return { channelId: channel.id, clickTimestamp: clickTimestamp || 0 };
    });

    Promise.all(promises)
      .then((results) => {
        const updatedChannelClickTimestamps = {};
        results.forEach((result) => {
          updatedChannelClickTimestamps[result.channelId] =
            result.clickTimestamp;
        });

        // 클릭 타임스탬프를 한 번에 업데이트
        update(userRef, updatedChannelClickTimestamps);
      })
      .catch((error) => {
        console.error("Error updating click timestamps:", error);
      });

    // 클릭 타임스탬프가 변경될 때마다 함수를 호출하여 채팅 알림 수 업데이트
    onValue(userRef, (snapshot) => {
      const clickTimestamps = snapshot.val();
      if (clickTimestamps) {
        channels.forEach((channel) => {
          const clickTimestamp = clickTimestamps[channel.id];
          if (clickTimestamp !== undefined) {
            const messageRef = ref(getDatabase(), "messages/" + channel.id);
            onValue(messageRef, (snapshot) => {
              const messageData = snapshot.val();
              if (messageData) {
                // 메시지 timestamp가 clickTimestamp보다 큰 메시지들 필터링
                const filteredMessages = Object.values(messageData).filter(
                  (message) => message.timestamp > clickTimestamp
                );

                dispatch(
                  setChatAlarmNum({
                    channelId: channel.id,
                    messageCount: filteredMessages.length,
                  })
                );
              }
            });
          }
        });
      }
    });
  }, [user.currentUser.uid, channels, dispatch]);

  // 새로운 bookMark 관찰
  useEffect(() => {
    const bookmarkData = ref(
      getDatabase(),
      "users/" + user.currentUser.uid + "/bookmark"
    );
    const unsubscribe = onChildAdded(bookmarkData, (data) =>
      setBookMarks((oldBookMark) => [...oldBookMark, data.val()])
    );

    return () => {
      unsubscribe?.();
    };
  }, [user.currentUser.uid]);

  // bookMark 삭제 관찰
  useEffect(() => {
    const bookMarkData = ref(
      getDatabase(),
      "users/" + user.currentUser.uid + "/bookmark"
    );
    const unsubscribe = onChildRemoved(bookMarkData, (data) =>
      setBookMarks(
        bookMarks.filter((bookMark) => bookMark.id !== data.val().id)
      )
    );
    return () => {
      unsubscribe();
    };
  }, [user.currentUser.uid, bookMarks]);

  useEffect(() => {
    async function getToDos() {
      const snapshot = await get(
        child(ref(getDatabase()), "users/" + user.currentUser.uid + "/todos")
      );
      setTodos(snapshot.val() ? Object.values(snapshot.val()) : []);
    }
    getToDos();

    return () => {
      setTodos([]);
    };
  }, [user.currentUser.uid]);

  // todos 알람
  useEffect(() => {
    const today = new Date();
    const tomorrowDate = new Date(today); // 내일 날짜 계산
    tomorrowDate.setDate(today.getDate() + 1);

    if (todos && todos.length > 0) {
      setFirstLoaded(false);
      todos.forEach((todo) => {
        const todoDate = new Date(todo.dueDates);
        if (todoDate.toDateString() === tomorrowDate.toDateString()) {
          const todoAlarm = {
            type: "todo_tomorrow",
            dueDate: todoDate,
            content: todo.todoMessage,
            id: todo.id,
          };
          dispatch(setUserAlarms(todoAlarm));
        } else if (todoDate.toDateString() === today.toDateString()) {
          const todoAlarm = {
            type: "todo_today",
            dueDate: todoDate,
            content: todo.todoMessage,
            id: todo.id,
          };
          dispatch(setUserAlarms(todoAlarm));
        }
      });
    }

    return () => {
      setUserAlarms([]);
    };
  }, [dispatch, todos, firstLoad]);

  // 새로운 todo 추가 관찰
  useEffect(() => {
    const todoData = ref(
      getDatabase(),
      "users/" + user.currentUser.uid + "/todos"
    );

    const unsubscribe = onChildAdded(todoData, (data) =>
      setTodos((oldTodos) => [...oldTodos, data.val()])
    );

    return () => {
      unsubscribe?.();
    };
  }, [user.currentUser.uid]);

  // todo 삭제 관찰
  useEffect(() => {
    const todoData = ref(
      getDatabase(),
      "users/" + user.currentUser.uid + "/todos"
    );
    const unsubscribe = onChildRemoved(todoData, (data) =>
      setTodos(todos.filter((todo) => todo.id !== data.val().id))
    );
    return () => {
      unsubscribe();
    };
  }, [user.currentUser.uid, todos]);

  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatDigits = (digit) => {
    return digit < 10 ? "0" + digit : digit;
  };

  const hours = formatDigits(currentTime.getHours());
  const minutes = formatDigits(currentTime.getMinutes());
  const seconds = formatDigits(currentTime.getSeconds());

  const handlemenubaropen = () => {
    setismenubaropen(!ismenubaropen);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleCloseUserMenu = useCallback(() => {
    setAnchorElUser(null);
  }, []);

  const handleClickOpen = useCallback(() => {
    setShowProfileModal(true);
    handleCloseUserMenu();
  }, [handleCloseUserMenu]);

  const logout = async () => {
    await signOut(getAuth());

    const db = getDatabase();
    const myConnectionsRef = ref(
      db,
      `users/${user.currentUser.uid}/connections`
    );
    onDisconnect(myConnectionsRef).set(false);
  };

  const handleCloseProfileModal = useCallback(() => {
    setShowProfileModal(false);
  }, []);

  return (
    <SnapContainer style={{ backgroundImage: `url("${bg.bgImage}")` }}>
      <MainDiv mainColor={theme.mainColor} className="dashMain_div">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: `"Orbitron", sans-serif`,
            color: "white",
            fontSize: "30px",
            paddingLeft: "0px",
            zIndex: "20",
            paddingTop: 20,
            marginLeft: 20,
            marginBottom: 20,
          }}>
          Chat_Goopt<span className="blinking-text">ㅣ</span>
          <Header />
        </div>
        <div className="dashmain_maindiv">
          <div
            className="dash_maindiv"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}>
            <Box
              component="form"
              onSubmit={handleSubmit}
              className="searchBar"
              ref={boxRef}
              sx={{
                width: "70%",
                textAlign: "center",
                position: "relative",
              }}
              noValidate
              autoComplete="off">
              <input
                type="text"
                placeholder="Search"
                className="searchInput"
                name="search"
              />
            </Box>
            <div
              style={{
                fontFamily: `"Orbitron", sans-serif`,
                fontWeight: 700,
                color: "white",
                marginTop: isMobile && "100px",
                fontSize: isMobile ? "50px" : "90px",
              }}>
              {hours}:{minutes}:{seconds}
            </div>
            <Weather />
            <div
              className="scrollDownIn"
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                padding: "30px",
                color: "white",
              }}>
              Scroll Down <KeyboardDoubleArrowDownIcon />
            </div>
          </div>
          <div>
            {ismenubaropen && (
              <div className="bookMark">
                {bookMarks
                  .map((value) => <BookMark key={value.id} value={value} />)
                  .concat(<BookMark key="123123" value={null} />)}
              </div>
            )}
          </div>
          <div
            className="bookmarkopenBtn"
            style={{
              fontFamily: `"Orbitron", sans-serif`,
              position: "absolute",
              right: 0,
              top: "50%",
            }}>
            {!ismenubaropen ? (
              <KeyboardDoubleArrowLeftIcon
                onClick={handlemenubaropen}
                sx={{ color: "white", fontSize: "55px" }}
              />
            ) : (
              <KeyboardDoubleArrowRightIcon
                onClick={handlemenubaropen}
                sx={{ color: "white", fontSize: "55px" }}
              />
            )}
          </div>
        </div>
        <div style={{ position: "absolute", top: 10, right: 20 }}>
          <Box className="profileMenu" sx={{ marginLeft: "30px" }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    fontFamily: "Montserrat",
                    fontWeight: 700,
                    color: "white",
                  }}>
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
          <ProfileModal
            open={showProfileModal}
            handleClose={handleCloseProfileModal}
          />
        </div>
      </MainDiv>
      <SubDiv ref={targetRef} mainColor={theme.mainColor}>
        <div className="todoBoard_Title">
          <h1 style={{ paddingRight: "10px", color: "white" }}>TODO BOARD</h1>
          <button onClick={() => setOpen(true)} className="todoBtn">
            <AddIcon
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                textAlign: "center",
                color: "gray",
              }}
            />
          </button>
          <TodoModal open={open} handleClose={handleClose} />
        </div>
        <div className="todoBoard_Main">
          {todos.map((todo) => (
            <div key={todo.id}>
              <TodoPaper id={todo.id} todo={todo} />
            </div>
          ))}
        </div>
      </SubDiv>
    </SnapContainer>
  );
}

export default Dashboard;
