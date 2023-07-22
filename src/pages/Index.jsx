import { Paper } from "@mui/material";
import { useEffect } from "react";
import { Route, Routes } from "react-router";
import Notfound from "./Notfound";
import Dashboard from "./Dashboard";
import Chat from "./Chat";
import Header from "../components/Header";
import MiniGame from "./MiniGame";

function Index() {
  return (
    <div component={Paper} elevation={10} style={{ height: "100vh" }}>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/minigame/*" element={<MiniGame />} />
        <Route path="/*" element={<Notfound />} />
      </Routes>
    </div>
  );
}

export default Index;
