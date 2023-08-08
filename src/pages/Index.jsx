import { Paper } from "@mui/material";
import { useEffect } from "react";
import { Route, Routes } from "react-router";
import Notfound from "./Notfound";
import Dashboard from "./Dashboard";
import Chat from "./Chat";
import Header from "../components/Header";
import MiniGame from "./MiniGame";
import { useDispatch, useSelector } from "react-redux";
import { get, getDatabase, ref } from "firebase/database";
import { setTheme } from "../store/themeSlice";
import Board from "./Board";

function Index() {
  const { user, theme } = useSelector((state) => state);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user.currentUser.uid) return;

    async function getUserTheme(userId) {
      const db = getDatabase();
      const userRef = ref(db, "users/" + userId + "/theme");

      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          // 데이터가 존재하는 경우
          const themeData = snapshot.val();
          dispatch(setTheme(themeData));
        }
      } catch (e) {
        console.error("데이터 가져오기 실패:", e);
      }
    }
    getUserTheme(user.currentUser.uid);
  }, [user.currentUser.uid, dispatch]);
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
            <Route path="/board/*" element={<Board />} />
            <Route path="/*" element={<Notfound />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default Index;
