import { Button } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearUser } from "../store/userSlice";
import "../firebase";
import { getAuth, signOut } from "firebase/auth";

function Index() {
  const { currentUser } = useSelector((state) => state.user);
  const name = currentUser?.displayName;
  const dispatch = useDispatch();

  const logout = async () => {
    await signOut(getAuth());
  };

  return (
    <>
      <div>HI {name} !</div>

      <Button onClick={logout}>Log Out</Button>
    </>
  );
}

export default Index;
