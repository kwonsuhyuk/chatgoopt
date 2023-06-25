import { Navigate, Route, Routes } from "react-router";
import Main from "./pages/Main";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import { useEffect, useState } from "react";
import "./firebase";
import Index from "./pages/Index";
import { useDispatch, useSelector } from "react-redux";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { clearUser, setUser } from "./store/userSlice";
import { CircularProgress, Stack } from "@mui/material";
import Notfound from "./pages/Notfound";

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
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress color="primary" size={150} />
      </Stack>
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
      <Route path="/*" element={<Notfound />} />
    </Routes>
  );
}

export default App;
