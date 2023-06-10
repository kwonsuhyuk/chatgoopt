import { Box, Container, StyledEngineProvider, TextField } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components";
import Clock from "../components/Clock";
import Weather from "../components/Weather";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import "./Dashboard.css";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider, StaticDatePicker } from "@mui/lab";
import { DateCalendar } from "@mui/x-date-pickers";

function Dashboard() {
  const [timeImage, setTimeImage] = useState();
  useEffect(() => {
    const time = new Date();
    const hour = time.getHours();
    if (hour >= 16 && hour < 19) {
      setTimeImage(
        "https://images.unsplash.com/photo-1501898047706-55903296cd09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
      );
    } else if (hour > 7 && hour < 16) {
      setTimeImage(
        "https://c.wallhere.com/photos/22/73/sky_clouds_summer-1020592.jpg!d"
      );
    } else if (hour >= 19 && hour < 22) {
      setTimeImage(
        "https://images.unsplash.com/photo-1523305846158-488dedcf8629?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
      );
    } else {
      setTimeImage(
        "https://images.unsplash.com/photo-1599045151332-ff2587f03eb2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
      );
    }
  }, []);

  const Container = styled.div`
    width: 100vw;
    height: 100vh;
    padding-bottom: 50px;
    margin-bottom: 50px;
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
      border-top: 1px solid red;
      height: 100vh;
    }
  `;

  const MainDiv = styled.div`
    height: 100vh;
    background-image: url(${timeImage});
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  `;

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const search = data.get("search");
    window.location.href = `https://www.google.com/search?q=${search}`;
  }, []);

  return (
    <Container>
      <MainDiv
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          paddingBottom: "50px",
        }}>
        <div className="scrollDown">
          Scroll Down <KeyboardDoubleArrowDownIcon />
        </div>
        <div>
          <Clock />
          <Weather />
        </div>
        <div className="bookMark">asd</div>
      </MainDiv>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: "tomato",
        }}></div>
    </Container>
  );
}

export default Dashboard;
