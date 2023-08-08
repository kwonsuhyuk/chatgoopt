import { Box } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Clock from "../components/Clock";
import Weather from "../components/Weather";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import "./Dashboard.css";
import TodoModal from "../components/modal/TodoModal";
import AddIcon from "@mui/icons-material/Add";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import NavigationIcon from "@mui/icons-material/Navigation";
import Fab from "@mui/material/Fab";

import "../firebase";

import {
  child,
  get,
  getDatabase,
  onChildAdded,
  onChildRemoved,
  onDisconnect,
  onValue,
  push,
  ref,
  serverTimestamp,
  update,
} from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import TodoPaper from "../components/TodoPaper";
import BookMark from "../components/BookMark";
import FeedBackModal from "../components/modal/FeedBackModal";
import { setUserAlarms } from "../store/alarmSlice";
import { set } from "date-fns";
import { setChatAlarmNum } from "../store/chatAlarmSlice";
import ThemePicker from "../components/ThemePicker";
import { setTheme } from "../store/themeSlice";

const SnapContainer = styled.div`
  width: 100vw;
  height: 92vh;
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
    height: 90vh;
  }
`;

const MainDiv = styled.div`
background-repeat: no-repeat;
background-position: center;
background-size: cover;
height: 90vh;
background-color: ${({ mainColor }) => mainColor};
display: grid;
grid-template-columns: 1fr 2fr 1fr;
@media screen and (max-width: 850px) {
  display:flex;
  flex-direction:column;
`;

const SubDiv = styled.div`
  overflow-y: scroll;
  background-color: ${({ mainColor }) => mainColor};
  h1 {
    font-family: "Raleway Dots", cursive;
    font-weight: 700;
    font-size: 50px;
  }
`;

function Dashboard() {
  const { user, theme } = useSelector((state) => state);
  const [open, setOpen] = useState(false);
  const [todos, setTodos] = useState([]);
  const [bookMarks, setBookMarks] = useState([]);
  const [feedBackOpen, setFeedBackOpen] = useState(false);
  const boxRef = useRef();
  const dispatch = useDispatch();
  const targetRef = useRef(null);
  const [firstLoad, setFirstLoaded] = useState(true);
  const [channels, setChannels] = useState([]);

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

  // useEffect(() => {
  //   async function getBookMark() {
  //     const snapshot = await get(
  //       child(ref(getDatabase()), "users/" + user.currentUser.uid + "/bookmark")
  //     );
  //     setBookMarks(snapshot.val() ? Object.values(snapshot.val()) : []);
  //   }
  //   getBookMark();
  //   return () => {
  //     getBookMark([]);
  //   };
  // }, [user.currentUser.uid]);

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

  const handleFeedBackClose = useCallback(() => {
    setFeedBackOpen(false);
  }, []);

  return (
    <SnapContainer>
      <MainDiv mainColor={theme.mainColor}>
        <div className="firstDiv">
          <ThemePicker />
          <div className="calendar_weather">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                sx={{
                  backgroundColor: `${theme.mainColor}`,
                  borderRadius: "20px",
                  boxShadow: `inset -5px -5px 10px ${theme.subColor}, inset 5px 5px 10px rgba(0, 0, 0, 0.1)`,
                }}
              />
            </LocalizationProvider>
            <Weather />
            <div className="scrollDownIn">
              Scroll Down <KeyboardDoubleArrowDownIcon />
            </div>
          </div>
        </div>
        <div
          className="secondDiv"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
          }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            className="searchBar"
            ref={boxRef}
            sx={{
              width: "100%",
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
              style={{
                boxShadow: `inset -10px -10px 15px ${theme.subColor}, inset 5px 5px 10px rgba(0, 0, 0, 0.2)`,
                backgroundColor: `${theme.mainColor}`,
                color:
                  theme.mainColor === "whitesmoke" ||
                  theme.mainColor === "#fffacd"
                    ? "gray"
                    : "white",
              }}
            />
          </Box>
          <Clock className="clock" />
        </div>
        <div className="bookMark">
          {/* {bookMarks.length < 6
            ? bookMarks
                .map((value) => <BookMark key={value.id} value={value} />)
                .concat(<BookMark key="123123" value={null} />)
            : bookMarks.map((value) => (
                <BookMark key={value.id} value=
                {value} />
              ))} */}
          {bookMarks
            .map((value) => <BookMark key={value.id} value={value} />)
            .concat(<BookMark key="123123" value={null} />)}
        </div>

        <div
          className="feedback"
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            padding: "30px",
          }}>
          <Fab variant="extended" onClick={() => setFeedBackOpen(true)}>
            <NavigationIcon sx={{ mr: 1 }} />
            FeedBack
          </Fab>
          <FeedBackModal
            open={feedBackOpen}
            handleClose={handleFeedBackClose}
          />
        </div>
      </MainDiv>
      <SubDiv ref={targetRef} mainColor={theme.mainColor}>
        <div className="todoBoard_Title">
          <h1 style={{ paddingRight: "10px" }}>TODO BOARD</h1>
          <button
            onClick={() => setOpen(true)}
            className="todoBtn"
            style={{
              boxShadow: "active"
                ? `-5px -5px 10px ${theme.subColor}, 5px 5px 10px rgba(0, 0, 0, 0.3)`
                : `inset -5px -5px 10px ${theme.subColor}, inset 5px 5px 10px rgba(0, 0, 0, 0.1)`,
            }}>
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
