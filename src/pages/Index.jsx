import React from "react";
import { useSelector } from "react-redux";

function Index() {
  const { currentUser } = useSelector((state) => state.user);
  const name = currentUser?.displayName;
  return <div>HI {name} !</div>;
}

export default Index;
