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
  height: 90vh;
  width: 100vw;
  background-color: whitesmoke;
`;

function Dashboard() {
  // const [timeImage, setTimeImage] = useState();
  const [open, setOpen] = useState(false);
  const boxRef = useRef();

  // useEffect(() => {
  //   const time = new Date();
  //   const hour = time.getHours();

  //   if (hour >= 16 && hour < 19) {
  //     setTimeImage(
  //       "https://images.unsplash.com/photo-1501898047706-55903296cd09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  //     );
  //   } else if (hour > 7 && hour < 16) {
  //     setTimeImage(
  //       "https://c.wallhere.com/photos/22/73/sky_clouds_summer-1020592.jpg!d"
  //     );
  //   } else if (hour >= 19 && hour < 22) {
  //     setTimeImage(
  //       "https://images.unsplash.com/photo-1523305846158-488dedcf8629?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  //     );
  //   } else {
  //     setTimeImage(
  //       "https://images.unsplash.com/photo-1599045151332-ff2587f03eb2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
  //     );
  //   }
  // }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const search = data.get("search");
    window.location.href = `https://www.google.com/search?q=${search}`;
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

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
            <button style={{ border: "none " }}>
              <SearchIcon
                sx={{
                  position: "absolute",
                  top: "40px",
                  color: "gray",
                  right: "130px",
                  fontSize: "30px",
                }}
              />
            </button>
          </Box>
          <Clock />
        </div>
        <div
          className="bookMark"
          style={{ display: "flex", alignItems: "center" }}></div>
      </MainDiv>
      <SubDiv>
        <Container>
          <Typography variant="h3">TODO BOARD</Typography>
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
        </Container>
      </SubDiv>
    </SnapContainer>
  );
}

export default Dashboard;
