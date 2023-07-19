import { Paper } from "@mui/material";
import { useEffect } from "react";
import { Route, Routes } from "react-router";
import Notfound from "./Notfound";
import Dashboard from "./Dashboard";
import Chat from "./Chat";
import Board from "./Board";
import Header from "../components/Header";

function Index() {
  return (
    <div component={Paper} elevation={10} style={{ height: "100vh" }}>
      <Header />
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
