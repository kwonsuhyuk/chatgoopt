import { Paper } from "@mui/material";
import { useEffect } from "react";
import { Route, Routes } from "react-router";
import Notfound from "./Notfound";
import Dashboard from "./Dashboard";
import Chat from "./Chat";
import Header from "../components/Header";
import MiniGame from "./MiniGame";
import { useSelector } from "react-redux";

function Index() {
  const { user } = useSelector((state) => state);
  return (
    <div component={Paper} elevation={10} style={{ height: "100vh" }}>
      {/* RiIKqlGiIvggJMoP3A4faoPRzig1 */}
      {/* kJlSCkA8utdiBV0JNL2DgiAKUf32 */}
      {user.currentUser.uid === "123123" ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "50px",
          }}>
          부적절한 채팅방 개설로 일시 정지 입니다.
        </div>
      ) : (
        <>
          <Header />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/minigame/*" element={<MiniGame />} />
            <Route path="/*" element={<Notfound />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default Index;
