import { Box, Container, TextField } from "@mui/material";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

function Dashboard() {
  const Container = styled.div`
    width: 100vw;
    height: 100vh;
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
    background-image: url("https://c.wallhere.com/photos/22/73/sky_clouds_summer-1020592.jpg!d");
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
      <MainDiv></MainDiv>
      <div>hi</div>
    </Container>
  );
}

export default Dashboard;
