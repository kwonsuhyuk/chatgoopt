import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

function CatchMind() {
  const location = useLocation();
  const { test } = location.state || {};
  return (
    <div>
      <Link to={{ pathname: "/canvas" }}>Go back to Canvas</Link>
      <div>{test}</div>
    </div>
  );
}

export default CatchMind;
