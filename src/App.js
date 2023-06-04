import { Navigate, Route, Routes } from "react-router";
import Main from "./pages/Main";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import { useEffect, useState } from "react";
import "./firebase";
import Index from "./pages/Index";
import { useSelector } from "react-redux";
import Notfound from "./pages/Notfound";

function App() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <Routes>
      <Route
        path="/"
        element={currentUser ? <Navigate to="/index" /> : <Main />}
      />
      <Route path="/index" element={<Index />} />
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
