import { Box, Button, Container, Typography } from "@mui/material";
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
import SearchIcon from "@mui/icons-material/Search";
import "../firebase";
import { Calendar } from "@mui/lab";
import {
  child,
  get,
  getDatabase,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  push,
  ref,
  remove,
} from "firebase/database";
import { useDispatch, useSelector } from "react-redux";
import TodoPaper from "../components/TodoPaper";
import { removeUserTodo, setUserTodo } from "../store/userSlice";
import { CalendarViewDay } from "@mui/icons-material";
import { isSameDay } from "date-fns";
import { PickersDay } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const MainDiv = styled.div`
  height: 90vh;
  // background-image: url(${(props) => props.timeImage});
  background-color: whitesmoke;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
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
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-evenly",
            paddingBottom: "150px",
          }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
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
              autoComplete="off"
              name="search"
            />
            {/* <button style={{ border: "none " }}>
              <SearchIcon
                sx={{
                  position: "absolute",
                  top: "5",
                  color: "gray",
                  right: "200",
                  fontSize: "30px",
                }}
              />
            </button> */}
          </Box>
          <Clock />
        </div>
        <div
          className="bookMark"
          style={{ display: "flex", alignItems: "center" }}></div>
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
            <div
              key={todo.id}
              style={{
                position: "relative",
                margin: "30px",
                display: "inline-block",
              }}>
              <TodoPaper id={todo.id} todo={todo} />
            </div>
          ))}
        </div>
      </SubDiv>
    </SnapContainer>
  );
}

export default Dashboard;
