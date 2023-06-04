import { Box, Container } from "@mui/material";
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFrown } from "@fortawesome/free-regular-svg-icons";

function Notfound() {
  return (
    <Container
      component="main"
      maxWidth="xl"
      style={{ padding: 0, height: `100vh`, width: "100vw", margin: 0 }}>
      <Box
        sx={{
          height: `100vh`,
          width: "100vw",
          backgroundColor: "black",
          color: `white`,
          fontSize: `150px`,
          textAlign: `center`,
          padding: `20px`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}>
        <FontAwesomeIcon icon={faFrown} size="2x" />
        <Box sx={{ fontSize: `50px`, textAlign: `center` }}>
          <br />
          404 ERROR!! Page Not Found
        </Box>
        <Link
          to="/"
          style={{
            fontSize: `40px`,
            textDecoration: `none`,
            color: `white`,
            display: `flex`,
            justifyContent: `center`,
            alignItems: `center`,
          }}>
          {" "}
          Go to home ←
        </Link>
      </Box>
    </Container>
  );
}

export default Notfound;

// <Container fixed style={{background:`black`}}>
//         <h1 style={{fontSize:`200px`}}>404 ERROR!!</h1>
//         <button style={{background:`white`, width:`200px`, height:`100px`}}>
//           <a style={{color:`black`, textDecoration:`none`}} href="/">Go to Main</a>
//         </button>
//       </Container>

//
