import { Box, Button, Paper } from "@mui/material";
import React from "react";
// import { useDispatch, useSelector } from "react-redux";
import "../firebase";
import { palette } from "@mui/system";
import Header from "../components/Header";
import { Route, Routes, useRoutes } from "react-router";
import Notfound from "./Notfound";
import Dashboard from "./Dashboard";
import Chat from "./Chat";
import Board from "./Board";

function Index() {
  // const { currentUser } = useSelector((state) => state.user);
  // const name = currentUser?.displayName;
  // const dispatch = useDispatch();
  // const router = useRoutes();

  return (
    <Box component={Paper} elevation={10} sx={{ color: "primary.main" }}>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/board" element={<Board />} />
        <Route path="/*" element={<Notfound />} />
      </Routes>
    </Box>
  );
}

export default Index;
