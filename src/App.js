import { Navigate, Route, Routes } from "react-router";
import Main from "./pages/Main";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import { useEffect } from "react";
import "./firebase";
import Index from "./pages/Index";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { clearUser, setUser } from "./store/userSlice";
import Notfound from "./pages/Notfound";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import Canvas from "./pages/Canvas";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const { currentUser, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    // console.log(currentUser, isLoading);
    const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
      if (!!user) {
        dispatch(setUser(user));
      } else {
        dispatch(clearUser());
      }
    });
    return () => unsubscribe();
  }, [dispatch, currentUser, isLoading]);

  if (isLoading) {
    return (
      <div id="logo">
        <div className="loading">
          <div className="symbol">
            <div className="symbol_letter">C</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div>G</div>
          </div>
          <div className="symbol">
            <div className="symbol_letter">H</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div>O</div>
          </div>
          <div className="symbol">
            <div className="symbol_letter">A</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div>O</div>
          </div>
          <div className="symbol">
            <div className="symbol_letter">T</div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div>P</div>
          </div>
          <div className="symbol">
            <div className="symbol_letter">
              <ChatBubbleIcon />
            </div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div>T</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/*" element={currentUser ? <Index /> : <Main />} />

      <Route
        path="/signin"
        element={currentUser ? <Navigate to="/" /> : <Signin />}
      />
      <Route
        path="/signup"
        element={currentUser ? <Navigate to="/" /> : <Signup />}
      />
      <Route path="/canvas" element={<Canvas />} />
      <Route path="/*" element={<Notfound />} />
    </Routes>
  );
}

export default App;
