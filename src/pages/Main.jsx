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
    const signin = signinRef.current;
    const signup = signupRef.current;

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
    gsap.fromTo(signin, { x: "1200px" }, { x: "750px", duration: 7 });
    gsap.fromTo(signup, { x: "1200px" }, { x: "700px", duration: 7 });
  }, []);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        height: "100vh",
        width: "100vw",
        overflowX: "hidden",
        // overflowY: "hidden",
      }}>
      <Box
        sx={{
          display: "flex",
          backgroundColor: "white",
          position: "relative",
        }}>
        <Typography
          variant="h1"
          ref={typo1Ref}
          style={{
            backgroundColor: "black",
            color: "white",
            padding: "20px",
          }}>
          Chat
        </Typography>

        <Typography variant="h2" ref={typo2Ref} style={{ marginTop: "50px" }}>
          GooPT
        </Typography>
        <ThreeScene
          style={{
            position: "absolute",
            top: 0,
            right: "50px",
          }}
        />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            bottom: "30px",
          }}>
          <Link
            to="signin"
            ref={signinRef}
            style={{
              fontFamily: "Raleway Dots",
              fontWeight: 800,
              width: "250px",
              height: "100px",
              color: "black",
              fontSize: "40px",
              textDecoration: "none",
            }}>
            SignIn
          </Link>
          <Link
            to="/signup"
            ref={signupRef}
            style={{
              width: "250px",
              height: "100px",
              color: "black",
              fontSize: "30px",
              textDecoration: "none",
            }}>
            SignUp
          </Link>
        </Box>
      </Box>
      <div
        style={{
          fontFamily: "naming",
          position: "absolute",
          bottom: 0,
          right: 0,
          margin: "10px 10px",
        }}>
        Made by Suhyuk , Sungbin
      </div>
    </div>
  );
}

export default Main;
