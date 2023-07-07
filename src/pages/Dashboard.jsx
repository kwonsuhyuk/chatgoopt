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

import "../firebase";

import {
  child,
  get,
  getDatabase,
  onChildAdded,
  onChildRemoved,
  ref,
} from "firebase/database";
import { useSelector } from "react-redux";
import TodoPaper from "../components/TodoPaper";
import BookMark from "../components/BookMark";

const MainDiv = styled.div`
  height: 90vh;
  // background-image: url(${(props) => props.timeImage});
  background-color: whitesmoke;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  @media screen and (max-width: 850px) {
    display:flex;
    flex-direction:column;
`;

const SnapContainer = styled.div`
  width: 100vw;
  height: 90vh;
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

const SubDiv = styled.div`
  overflow-y: scroll;
  background-color: whitesmoke;
  h1 {
    font-family: "Raleway Dots", cursive;
    font-weight: 700;
    font-size: 50px;
  }
`;

function Dashboard() {
  const { user } = useSelector((state) => state);
  const [open, setOpen] = useState(false);
  const [todos, setTodos] = useState([]);
  const [bookMarks, setBookMarks] = useState([]);

  const todoBoardRef = useRef();
  const boxRef = useRef();

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
    async function getBookMark() {
      const snapshot = await get(
        child(ref(getDatabase()), "users/" + user.currentUser.uid + "/bookmark")
      );
      setTodos(snapshot.val() ? Object.values(snapshot.val()) : []);
    }
    getBookMark();
    return () => {
      getBookMark([]);
    };
  }, [user.currentUser.uid]);

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

  return (
    <SnapContainer>
      <MainDiv>
        <div className="firstDiv">
          <div style={{ height: "150px" }}></div>
          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                sx={{
                  backgroundColor: "whitesmoke",
                  borderRadius: "20px",
                  boxShadow:
                    "inset -5px -5px 10px white, inset 5px 5px 10px rgba(0, 0, 0, 0.1)",
                }}
              />
            </LocalizationProvider>
          </div>
          <Weather />
          <div className="scrollDownIn">
            Scroll Down <KeyboardDoubleArrowDownIcon />
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
              // autoComplete="off"
              name="search"
            />
          </Box>
          <Clock className="clock" />
        </div>
        <div className="bookMark">
          {bookMarks.length < 6
            ? bookMarks
                .map((value) => <BookMark key={value.id} value={value} />)
                .concat(<BookMark value={null} />)
            : bookMarks.map((value) => (
                <BookMark key={value.id} value={value} />
              ))}
        </div>
      </MainDiv>
      <SubDiv>
        <div className="todoBoard_Title">
          <h1 style={{ paddingRight: "10px" }}>TODO BOARD</h1>
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
        <div className="todoBoard_Main" ref={todoBoardRef}>
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
