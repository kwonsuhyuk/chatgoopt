import { Box, Button, Paper } from "@mui/material";
import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
import "../firebase";
import { palette } from "@mui/system";
import { Route, Routes, useRoutes } from "react-router";
import Notfound from "./Notfound";
import Dashboard from "./Dashboard";
import Chat from "./Chat";
import Board from "./Board";
import Header from "../components/Header";

function Index() {
  const [hover, setHover] = useState(false);

  const onMouseEnter = (e) => {
    e.currentTarget.style.opacity = "1";
  };

  const onMouseOut = (e) => {
    e.currentTarget.style.opacity = "0";
  };
  return (
    <div component={Paper} elevation={10} style={{ height: "100vh" }}>
      <div
        onMouseOver={onMouseEnter}
        onMouseOut={onMouseOut}
        className={hover ? "show" : "hidden"}
        style={{
          position: "fixed",
          height: "10vh",
          width: "100%",
          zIndex: "10",
          opacity: "0",
        }}>
        <Header />
      </div>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/board" element={<Board />} />
        <Route path="/*" element={<Notfound />} />
      </Routes>
    </div>
  );
}

export default Index;
