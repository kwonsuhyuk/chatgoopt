import { Paper } from "@mui/material";
import { useCallback, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import Notfound from "./Notfound";
import Dashboard from "./Dashboard";
import Chat from "./Chat";
import Header from "../components/Header";
import MiniGame from "./MiniGame";
import { useDispatch, useSelector } from "react-redux";
import { get, getDatabase, ref } from "firebase/database";
import { setTheme } from "../store/themeSlice";
import Board from "./Board";
import MobileMain from "./MobileMain";
import nightImg from "../img/bg/night.jpg";
import dayImg from "../img/bg/day.jpeg";
import pmImg from "../img/bg/pm2.jpeg";
import pmImg2 from "../img/bg/pm3.jpeg";
import { setBg } from "../store/bgSlice";

function Index() {
  const location = useLocation();
  const { user } = useSelector((state) => state);
  const dispatch = useDispatch();
  const isMobile = window.innerWidth < 500; // 뷰포트 너비가 500px 미만인 경우 true로 설정

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

  const getBackgroundImage = useCallback(() => {
    const currentDate = new Date();
    const currentHour = currentDate.getHours();

    if (currentHour >= 7 && currentHour < 16) {
      return dayImg;
    } else if (currentHour >= 16 && currentHour < 20) {
      return dayImg;
    } else {
      return nightImg;
    }
  }, []);

  useEffect(() => {
    dispatch(setBg(getBackgroundImage()));
  }, [dispatch, getBackgroundImage]);

  return (
    <div component={Paper} elevation={10} style={{ height: "100vh" }}>
      {/* RiIKqlGiIvggJMoP3A4faoPRzig1 */}
      {/* kJlSCkA8utdiBV0JNL2DgiAKUf32 */}
      {/* {X9pU0SNUHieAWtvq5XfgLddRRpV2} */}

      {
        user.currentUser.uid === "123" ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              fontSize: "50px",
            }}>
            부적절한 행위적발로 일시 정지 입니다.
          </div>
        ) : (
          <>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/minigame/*" element={<MiniGame />} />
              <Route path="/board/*" element={<Board />} />
              <Route path="/*" element={<Notfound />} />
            </Routes>
          </>
        )
        // ) : (
        //   <>
        //     {location.pathname !== "/" && <Header />}
        //     <Routes>
        //       <Route path="/" element={<MobileMain />} />
        //       <Route path="/dashboard" element={<Dashboard />} />
        //       <Route path="/chat" element={<Chat />} />
        //       <Route path="/minigame/*" element={<MiniGame />} />
        //       <Route path="/board/*" element={<Board />} />
        //       <Route path="/*" element={<Notfound />} />
        //     </Routes>
        //   </>
        // )
      }
    </div>
  );
}

export default Index;
