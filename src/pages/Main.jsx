import React, { useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import ThreeScene from "../components/ThreeScene";
import "./Main.css";

function Main() {
  const typo1Ref = useRef(null);
  const typo2Ref = useRef(null);
  const signinRef = useRef(null);
  const signupRef = useRef(null);

  useEffect(() => {
    const typo1 = typo1Ref.current;
    const typo2 = typo2Ref.current;

    gsap.fromTo(
      typo1,
      { x: "1000px" },
      {
        x: "200px",
        duration: 2,
      }
    );
    gsap.fromTo(
      typo2,
      { x: "-500px" },
      {
        x: "220px",
        duration: 2,
      }
    );
  }, []);

  return (
    <div className="main_box">
      <Box className="letterBox">
        <Typography className="chat" variant="h2" ref={typo1Ref}>
          Chat
        </Typography>
        <Typography className="goopt" variant="h3" ref={typo2Ref}>
          GooPT
        </Typography>
      </Box>

      <div className="madeBy">Made by Suhyuk , Sungbin</div>
      <ThreeScene className="three_box" />
      <Box className="login_signup">
        <Link className="signin" to="/signin" ref={signinRef}>
          SignIn
        </Link>
        <Link className="signup" to="/signup" ref={signupRef}>
          SignUp
        </Link>
      </Box>
    </div>
  );
}

export default Main;
